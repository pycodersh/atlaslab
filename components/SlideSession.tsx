'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, Info, Play, Pause, Square } from 'lucide-react'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSpeech } from '@/hooks/useSpeech'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useTheme } from '@/components/ThemeProvider'
import {
  ttsProvider,
  storyParaAudioUrl,
  patternExampleAudioUrl,
  getPitchForKey,
} from '@/lib/tts'
import { RATE_MAP } from '@/lib/settings/preferences'
import { resolveTranslation } from '@/lib/i18n/translation'
import { getPatternExamples } from '@/data/pattern-examples'
import { shimmerExamples } from '@/data/shimmer-audio-meta'
import { PATTERN_NOTES } from '@/data/pattern-notes'
import { DailyChallengeSlide } from '@/components/DailyChallengeSlide'
import {
  getStoryRound,
  getRecallCount,
  completeStoryRound,
  nextReviewLabel,
  getStoryStatus,
  type StoryRoundData,
} from '@/lib/srs/story-round'
import { magazineStories } from '@/data/magazine-stories'
import { syncStoryRoundToSupabase } from '@/lib/srs/supabase-sync'
import { completeStoryAndScheduleReview } from '@/lib/learning-progress'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import type { MagazineStory } from '@/types/magazine'
import type { ReactNode } from 'react'
import {
  getLearnerLevel,
  getTrainerIntensity,
  getSlideDelay,
  loadStats,
  onSessionStart,
  onSessionComplete,
  onDoneTap,
  recordSessionSignal,
  getSessionAdaptAction,
} from '@/lib/adaptive/adaptive-engine'
import { syncStatsToSupabase } from '@/lib/adaptive/supabase-sync'

// ── Types ─────────────────────────────────────────────────────────────────────

type StudyMode = 'en' | 'en-ko' | 'ko'

type Slide =
  | { kind: 'intro' }
  | { kind: 'story'; part: number }
  | { kind: 'pattern'; idx: number }
  | { kind: 'hide-recall'; round: number; patIdx: number }
  | { kind: 'daily-challenge' }
  | { kind: 'complete' }

export type SlideSessionProps = {
  story: MagazineStory
  isGuided: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RECALL_ROUND_MSGS = ['한 번 더 해볼게요.', '한 번 더요.', '마지막이에요.']

// Highlight pattern expressions in story text
function highlightPatterns(text: string, patterns: string[]): ReactNode {
  if (patterns.length === 0) return text
  const sorted = [...patterns].sort((a, b) => b.length - a.length)
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <mark key={i} style={{ background: 'transparent', color: '#6B8FFF', fontWeight: 500 }}>{part}</mark>
      : part
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, accent }: {
  emoji: string; label: string; value: string; accent: string
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, padding: '14px 10px',
      background: `${accent}14`,
      border: `0.5px solid ${accent}38`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--pt)', opacity: 0.45, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

// ── 1. Intro Slide ────────────────────────────────────────────────────────────

function IntroSlide({ story, currentRound }: { story: MagazineStory; currentRound: number }) {
  const { prefs } = usePreferences()
  const subtitle = resolveTranslation(story.subtitleKo, prefs.language, story.subtitleTranslations)
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{
        padding: '36px 28px',
        textAlign: 'center',
        width: '100%', maxWidth: 380,
      }}>
        <p style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
          color: '#8EA7FF', margin: '0 0 12px', textTransform: 'uppercase',
        }}>
          STORY {String(story.id).padStart(2, '0')}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontSize: 37, fontWeight: 700, color: '#1a1a2e',
          margin: '0 0 8px', lineHeight: 1.15,
        }}>
          {story.title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 18, fontWeight: 500, color: '#4a4a6a', margin: '0 0 18px', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        <div style={{
          width: 40, height: 2, borderRadius: 1,
          background: 'linear-gradient(90deg, #6B8FFF, #B8A8F0)',
          margin: '0 auto 18px',
        }} />
        <p style={{ fontSize: 16, fontWeight: 500, color: '#7a7a9a', margin: 0 }}>
          Round {currentRound + 1}
        </p>
      </div>
    </div>
  )
}

// ── 2. Story Slide ────────────────────────────────────────────────────────────

function StorySlide({
  story,
  paragraphs,
  part,
  totalParts,
  currentRound,
  patternTexts,
  studyMode,
  onStudyModeChange,
}: {
  story: MagazineStory
  paragraphs: MagazineStory['paragraphs']
  part: number
  totalParts: number
  currentRound: number
  patternTexts: string[]
  studyMode: StudyMode
  onStudyModeChange: (m: StudyMode) => void
}) {
  const { prefs } = usePreferences()
  const showEn = studyMode === 'en' || studyMode === 'en-ko'
  const showKo = studyMode === 'en-ko' || studyMode === 'ko'

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header row: label + language toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px 10px', flexShrink: 0,
      }}>
        <p style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.10em',
          color: '#6B8FFF', textTransform: 'uppercase', margin: 0,
        }}>
          Story · Round {currentRound + 1}
          {totalParts > 1 && ` · ${part + 1}/${totalParts}`}
        </p>

        <div style={{
          display: 'inline-flex', borderRadius: 10,
          background: 'var(--pc)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--pd)', padding: 2,
        }}>
          {(['en', 'en-ko', 'ko'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => onStudyModeChange(mode)}
              style={{
                padding: '4px 9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                background: studyMode === mode ? 'var(--pw)' : 'transparent',
                color: studyMode === mode ? 'var(--pt)' : 'var(--pm)',
                boxShadow: studyMode === mode ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'background 0.18s, color 0.18s',
              }}
            >
              {mode === 'en' ? 'EN' : mode === 'en-ko' ? 'EN·KO' : 'KO'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable text area — glass card */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 16px',
        WebkitOverflowScrolling: 'touch' as never,
      }}>
        <div style={{ padding: '4px 4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {paragraphs.map((para, pIdx) => {
              const koText = resolveTranslation(para.koreanTranslation, prefs.language, para.translations)
              return (
                <div key={para.id} style={{ marginBottom: pIdx < paragraphs.length - 1 ? 16 : 0 }}>
                  <div style={{ opacity: showEn ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showEn ? 'auto' : 'none' }}>
                    <p style={{
                      fontSize: 16, lineHeight: 1.8,
                      color: '#1a1a2e', margin: 0,
                    }}>
                      {highlightPatterns(para.english, patternTexts)}
                    </p>
                  </div>
                  {showKo && koText && (
                    <p style={{
                      fontSize: 13, color: '#5a5a7a',
                      lineHeight: 1.7, margin: '4px 0 0',
                    }}>
                      {koText}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ height: 12 }} />
      </div>
    </div>
  )
}

// ── 3. Pattern Card (Focus Mode) ──────────────────────────────────────────────

function PatternCardFocus({
  story,
  idx,
  studyMode,
  onStudyModeChange,
  onRegisterPlay,
  onAudioEnd,
}: {
  story: MagazineStory
  idx: number
  studyMode: StudyMode
  onStudyModeChange: (m: StudyMode) => void
  onRegisterPlay: (fn: () => void) => void
  onAudioEnd: () => void
}) {
  const { prefs } = usePreferences()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pat = story.patterns[idx]
  const voice = story.narratorVoice ?? prefs.voice
  const total = story.patterns.length

  const [isPlaying, setIsPlaying] = useState(false)
  const [exIdx, setExIdx] = useState(0)
  const runningRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playTokenRef = useRef(0)

  const examples = (() => {
    const fromData = getPatternExamples(pat.id)
    if (fromData.length > 0) return fromData.slice(0, 3)
    const r: { en: string; ko: string }[] = []
    if (pat.storySentence) r.push({ en: pat.storySentence, ko: pat.storySentenceKo ?? '' })
    if (pat.variationSentence) r.push({ en: pat.variationSentence, ko: pat.variationSentenceKo ?? '' })
    return r.slice(0, 3)
  })()

  const audioUrl = patternExampleAudioUrl(voice, pat.id, 0, examples[0]?.en ?? '')
  const hasAudio = !!audioUrl

  function stopAudio() {
    ++playTokenRef.current
    runningRef.current = false
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    ttsProvider.stop()
    setIsPlaying(false)
  }

  const playExamples = useCallback(() => {
    if (isPlaying) { stopAudio(); return }
    const token = ++playTokenRef.current
    runningRef.current = true
    setIsPlaying(true)

    function playOne(i: number) {
      if (!runningRef.current || playTokenRef.current !== token) return
      const ex = examples[i]
      if (!ex) {
        runningRef.current = false
        setIsPlaying(false)
        onAudioEnd()
        return
      }
      setExIdx(i)
      const shimmerEx = shimmerExamples[`${pat.id}-ex${i + 1}`]
      const url = shimmerEx?.url ?? patternExampleAudioUrl(voice, pat.id, i, ex.en)
      ttsProvider.speak({
        texts: [ex.en],
        audioUrls: url ? [url] : undefined,
        voiceKey: voice, voiceKeys: [voice],
        rate: RATE_MAP[prefs.speechRate],
        pitch: getPitchForKey(voice),
        volume: 1.0,
        onEnd: () => {
          if (!runningRef.current || playTokenRef.current !== token) return
          if (i + 1 < examples.length) {
            timerRef.current = setTimeout(() => playOne(i + 1), 1800)
          } else {
            runningRef.current = false
            setIsPlaying(false)
            onAudioEnd()
          }
        },
        onError: () => {
          if (playTokenRef.current !== token) return
          runningRef.current = false
          setIsPlaying(false)
        },
      })
    }
    playOne(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, pat.id, voice, prefs.speechRate, examples])

  useEffect(() => {
    onRegisterPlay(playExamples)
  }, [playExamples, onRegisterPlay])

  useEffect(() => () => {
    runningRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    ttsProvider.stop()
  }, [])

  // ── Colors (mirrors PatternsSectionInline) ──
  const heroPatternColor = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const heroMeaningColor = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const heroBg           = 'transparent'
  const cardBg           = isDark ? 'rgba(30,28,48,0.85)' : 'rgba(255,255,255,0.55)'
  const cardBackdrop     = isDark ? 'blur(20px)' : 'blur(16px)'
  const cardBorder       = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.60)'
  const cardShadow       = isDark
    ? '0 16px 40px rgba(0,0,0,0.40)'
    : '0 4px 24px rgba(142,167,255,0.12)'
  const exBoxBg     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)'
  const exBoxBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'
  const exBoxBackdrop = isDark ? undefined : 'blur(8px)'
  const exEnColor   = isDark ? 'rgba(255,255,255,0.90)' : '#1a1a2e'
  const exKoColor   = isDark ? 'rgba(255,255,255,0.45)' : '#8a8aaa'
  const noteNoteBg     = isDark ? 'rgba(215,181,109,0.06)' : 'rgba(255,248,236,0.70)'
  const noteNoteBorder = isDark ? 'rgba(215,181,109,0.18)' : 'rgba(245,166,35,0.30)'
  const noteNoteBackdrop = isDark ? undefined : 'blur(8px)'

  const showEn = studyMode === 'en' || studyMode === 'en-ko'
  const showKo = studyMode === 'en-ko' || studyMode === 'ko'
  const patternMeaning = pat.meaningKo
  const patternNote = pat.explanation ?? PATTERN_NOTES[pat.id] ?? null
  const globalPatternNum = (story.id - 1) * total + idx + 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Label row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 24px 4px', flexShrink: 0,
      }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
          color: 'var(--pm2)', textTransform: 'uppercase', margin: 0,
        }}>
          Pattern {idx + 1} / {total}
        </p>
        <div />
      </div>

      {/* Pattern card */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 0' }}>
        <div style={{
          borderRadius: 20,
          background: cardBg,
          backdropFilter: cardBackdrop,
          WebkitBackdropFilter: cardBackdrop,
          border: cardBorder,
          boxShadow: cardShadow,
          overflow: 'hidden',
        }}>
          {/* Hero section */}
          <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 16px 16px', background: heroBg }}>
            <p style={{
              margin: '0 0 10px', fontSize: 8, fontWeight: 700,
              color: '#8EA7FF', letterSpacing: '0.10em',
              fontFamily: '"SF Mono", "Fira Mono", monospace',
            }}>
              PATTERN {String(globalPatternNum).padStart(3, '0')}
            </p>

            <div style={{ opacity: showEn ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showEn ? 'auto' : 'none' }}>
              <p style={{
                fontSize: 28, fontWeight: 700, color: heroPatternColor,
                lineHeight: 1.25, margin: '0 0 6px', letterSpacing: '-0.3px',
                fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
              }}>
                {pat.pattern}
              </p>
            </div>

            <div style={{
              width: 36, height: 3, borderRadius: 2, margin: '6px 0 10px',
              background: 'linear-gradient(90deg, #6B8FFF, #B8A8F0)',
              opacity: isDark ? 0.7 : 1,
            }} />

            {patternMeaning && (
              <p style={{ fontSize: 16, fontWeight: 400, color: heroMeaningColor, margin: 0, lineHeight: 1.4 }}>
                {patternMeaning}
              </p>
            )}
          </div>

          {/* Examples */}
          <div style={{ padding: '14px 16px 16px' }}>
            {/* Language toggle — right-aligned above examples */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <div style={{
                display: 'inline-flex', borderRadius: 10,
                background: 'var(--pc)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--pd)', padding: 2,
              }}>
                {(['en', 'en-ko', 'ko'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onStudyModeChange(mode) }}
                    style={{
                      padding: '4px 9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                      background: studyMode === mode ? 'var(--pw)' : 'transparent',
                      color: studyMode === mode ? 'var(--pt)' : 'var(--pm)',
                      boxShadow: studyMode === mode ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                      transition: 'background 0.18s, color 0.18s',
                    }}
                  >
                    {mode === 'en' ? 'EN' : mode === 'en-ko' ? 'EN·KO' : 'KO'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: 12, background: exBoxBg, border: `1px solid ${exBoxBorder}`, padding: '12px 14px', backdropFilter: exBoxBackdrop, WebkitBackdropFilter: exBoxBackdrop }}>
              {examples.map((ex, i) => {
                const isExPlaying = isPlaying && i === exIdx
                return (
                  <div
                    key={i}
                    style={{
                      borderTop: i > 0 ? `1px solid ${exBoxBorder}` : 'none',
                      paddingTop: i > 0 ? 12 : 0,
                      paddingBottom: i < examples.length - 1 ? 12 : 0,
                    }}
                  >
                    <div style={{ opacity: showEn ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showEn ? 'auto' : 'none' }}>
                      <p style={{
                        fontSize: 15, fontWeight: isExPlaying ? 600 : 400,
                        color: exEnColor, lineHeight: 1.5,
                        margin: 0, marginBottom: ex.ko ? 2 : 0,
                      }}>
                        {ex.en}
                      </p>
                    </div>
                    {showKo && ex.ko && (
                      <p style={{ fontSize: 13, color: exKoColor, margin: 0, lineHeight: 1.5 }}>
                        {ex.ko}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {patternNote && (
              <div style={{
                marginTop: 10, borderRadius: 8,
                background: noteNoteBg, border: `1px solid ${noteNoteBorder}`,
                backdropFilter: noteNoteBackdrop, WebkitBackdropFilter: noteNoteBackdrop,
                padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <Info style={{ width: 13, height: 13, color: '#D7B56D', flexShrink: 0, marginTop: 1 }} strokeWidth={1.8} />
                <p style={{ margin: 0, fontSize: 13, color: isDark ? 'rgba(255,255,255,0.55)' : '#6a5a40', lineHeight: 1.6 }}>
                  {patternNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HideRecall Slide ──────────────────────────────────────────────────────────

function HideRecallSlide({ story, patIdx, revealed, onReveal }: {
  story: MagazineStory; patIdx: number; revealed: boolean; onReveal: () => void
}) {
  const pat = story.patterns[patIdx]
  const total = story.patterns.length
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', textTransform: 'uppercase', margin: '24px 0 32px',
      }}>
        Recall · {patIdx + 1} / {total}
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onReveal}
          style={{
            background: revealed ? 'var(--pglass)' : 'rgba(107,143,255,0.05)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: revealed ? '1px solid var(--pglass-border)' : '1.5px dashed rgba(107,143,255,0.22)',
            borderRadius: 20, padding: '24px 22px', width: '100%',
            textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ marginBottom: 8, minHeight: 32 }}>
            {revealed ? (
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--pt)', margin: 0, lineHeight: 1.3 }}>
                {pat.pattern}
              </p>
            ) : (
              <div style={{
                height: 32, borderRadius: 8,
                background: 'rgba(107,143,255,0.08)',
                display: 'flex', alignItems: 'center', paddingLeft: 12,
              }}>
                <p style={{ fontSize: 12, color: 'rgba(107,143,255,0.55)', margin: 0, fontWeight: 500 }}>
                  탭해서 보기
                </p>
              </div>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 18px' }}>
            {pat.meaningKo}
          </p>
          <div style={{ borderTop: '1px solid var(--pd)', paddingTop: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.55 }}>
              {pat.storySentenceKo}
            </p>
            {revealed && (
              <p style={{
                fontSize: 14, color: 'var(--pt)', margin: '8px 0 0', lineHeight: 1.55, fontWeight: 500,
                animation: 'ssReveal 0.25s ease-out both',
              }}>
                {pat.storySentence}
              </p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Complete Slide ────────────────────────────────────────────────────────────

function CompleteSlide({ story, completionData, elapsedMin, isGuided }: {
  story: MagazineStory; completionData: StoryRoundData | null; elapsedMin: number; isGuided: boolean
}) {
  if (!completionData) return null
  const reviewLbl = nextReviewLabel(completionData)
  return (
    <div style={{
      padding: '40px 24px 140px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 22,
        background: 'linear-gradient(135deg, rgba(215,181,109,0.2), rgba(215,181,109,0.08))',
        border: '0.5px solid rgba(215,181,109,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke="#D7B56D" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
        {completionData.isMastered ? 'Mastered' : 'Session Complete'}
      </p>
      <h2 style={{
        margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: 'var(--pt)',
        textAlign: 'center', lineHeight: 1.3,
        fontFamily: 'var(--font-playfair), Georgia, serif',
      }}>
        {story.title}
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: 10, color: 'var(--pm2)' }}>
        Round {completionData.round} · {story.patterns.length} patterns · {elapsedMin} min
      </p>
      <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 20 }}>
        <StatCard emoji="🔥" label="Streak" value={String(completionData.round)} accent="#D7B56D" />
        <StatCard emoji="⚡" label="Patterns" value={String(story.patterns.length)} accent="#6B8FFF" />
        <StatCard emoji="⏱" label="Time" value={`${elapsedMin}m`} accent="#9B7FE8" />
      </div>
      {!completionData.isMastered && reviewLbl && (
        <p style={{ fontSize: 10, color: 'var(--pm2)', marginBottom: 0 }}>
          다음 복습: {reviewLbl}
        </p>
      )}
      {isGuided && (
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
          첫 세션을 완료했어요.{'\n'}내일 다시 만나요!
        </p>
      )}
    </div>
  )
}

// ── sessionStorage helpers ─────────────────────────────────────────────────────

type SavedSlide = { kind: string; idx?: number; round?: number; patIdx?: number; part?: number }

function ssKey(storyId: number) { return `patto_session_${storyId}` }

function saveSlide(storyId: number, s: Slide) {
  try { sessionStorage.setItem(ssKey(storyId), JSON.stringify(s)) } catch {}
}

function loadSlide(storyId: number): Slide | null {
  try {
    const raw = sessionStorage.getItem(ssKey(storyId))
    if (!raw) return null
    const s = JSON.parse(raw) as SavedSlide
    if (s.kind === 'complete') return null
    return s as Slide
  } catch { return null }
}

function clearSavedSlide(storyId: number) {
  try { sessionStorage.removeItem(ssKey(storyId)) } catch {}
}

// ── Main SlideSession ──────────────────────────────────────────────────────────

export function SlideSession({ story, isGuided }: SlideSessionProps) {
  const router = useRouter()
  const trainer = useTrainerSafe()
  const trainerRef = useRef(trainer)
  trainerRef.current = trainer

  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { speakAll, stop: stopSpeech, isSpeaking, currentParagraphIdx } = useSpeech()
  const { prefs } = usePreferences()
  const { setProgress } = useLearningProgress()

  const narrator = story.narratorVoice ?? prefs.voice
  const currentRound = getStoryRound(story.id).round
  const totalRecallRounds = getRecallCount(currentRound)

  // Story split: 10+ paragraphs → 2 slides
  const storyParts = story.paragraphs.length >= 10 ? 2 : 1
  const splitAt = Math.ceil(story.paragraphs.length / 2)

  // Pattern expressions for highlight (memoized)
  const patternTexts = useMemo(
    () => story.patterns.map(p => p.pattern).filter(Boolean),
    [story.patterns]
  )

  const [slide, setSlide] = useState<Slide>(() => loadSlide(story.id) ?? { kind: 'intro' })
  const [animKey, setAnimKey] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [completionData, setCompletionData] = useState<StoryRoundData | null>(null)
  const [elapsedMin, setElapsedMin] = useState(1)
  const [studyMode, setStudyMode] = useState<StudyMode>('en-ko')

  const sessionStartRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const completedRef = useRef(false)
  const slideRef = useRef<Slide>(slide)
  slideRef.current = slide

  // Pattern audio refs
  const patternPlayRef = useRef<(() => void) | null>(null)
  const patternOnEndRef = useRef<(() => void) | null>(null)

  // ── Adaptive engine state ────────────────────────────────────────────────
  const adaptStats = loadStats()
  const level = getLearnerLevel(adaptStats)
  const intensity = getTrainerIntensity(level)
  const slideDelay = getSlideDelay(adaptStats)
  const isSilentRef = useRef(intensity === 'silent')
  const cardShownAtRef = useRef<number | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onSessionStart() }, [])

  // ── Timer helpers ────────────────────────────────────────────────────────

  function addTimer(t: ReturnType<typeof setTimeout>) {
    timersRef.current.push(t)
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function goTo(next: Slide) {
    clearTimers()
    stopSpeech()
    setStoryAudioPaused(false)
    trainerRef.current?.clearMessage()
    setRevealed(false)
    saveSlide(story.id, next)
    setSlide(next)
    setAnimKey(k => k + 1)
  }

  // ── After-done transitions ────────────────────────────────────────────────

  function afterDone(next: Slide, bridgeMsg?: string, bridgeMs = 1500) {
    clearTimers()
    trainerRef.current?.clearMessage()
    if (bridgeMsg) {
      if (!isSilentRef.current) trainerRef.current?.say(bridgeMsg, bridgeMs)
      addTimer(setTimeout(() => goTo(next), isSilentRef.current ? slideDelay : bridgeMs + 200))
    } else {
      if (!isSilentRef.current) trainerRef.current?.say("좋아요.", 1000)
      addTimer(setTimeout(() => goTo(next), isSilentRef.current ? slideDelay : 1200))
    }
  }

  // ── Slide-specific done handlers ──────────────────────────────────────────

  function handleStoryPartDone(part: number) {
    if (storyParts === 2 && part === 0) {
      afterDone({ kind: 'story', part: 1 })
    } else {
      afterDone({ kind: 'pattern', idx: 0 }, "이제 패턴을 연습해볼게요.", 1800)
    }
  }

  function handlePatternDone(idx: number) {
    const isLast = idx === story.patterns.length - 1
    if (isLast) afterDone({ kind: 'hide-recall', round: 1, patIdx: 0 }, "잘하셨어요.", 1800)
    else        afterDone({ kind: 'pattern', idx: idx + 1 })
  }

  function handleRecallDone(round: number, patIdx: number) {
    const isLastPat   = patIdx === story.patterns.length - 1
    const isLastRound = round >= totalRecallRounds
    if (!isLastPat) {
      afterDone({ kind: 'hide-recall', round, patIdx: patIdx + 1 })
    } else if (!isLastRound) {
      const msg = RECALL_ROUND_MSGS[Math.min(round - 1, 2)]
      trainerRef.current?.say(msg, 1500)
      addTimer(setTimeout(() => goTo({ kind: 'hide-recall', round: round + 1, patIdx: 0 }), 1700))
    } else {
      afterDone({ kind: 'daily-challenge' })
    }
  }

  // ── Audio end → "따라해보세요." + Done ────────────────────────────────────

  function makeOnEnd(doneHandler: () => void): () => void {
    return () => {
      trainerRef.current?.setCardPlaying(false)
      trainerRef.current?.clearMessage()
      cardShownAtRef.current = Date.now()

      const wrappedDone = () => {
        if (cardShownAtRef.current !== null) {
          const rt = Date.now() - cardShownAtRef.current
          onDoneTap(rt)
          const signal = rt < 3000 ? 'fast' : rt > 7000 ? 'slow' : null
          if (signal) {
            const adaptState = recordSessionSignal(signal)
            const action = getSessionAdaptAction(adaptState)
            if (action.type === 'go_silent') {
              isSilentRef.current = true
              trainerRef.current?.setSilent?.(true)
            } else if (action.type === 'encourage_slow') {
              trainerRef.current?.say("천천히 해도 괜찮아요.", 2000)
            }
          }
          cardShownAtRef.current = null
        }
        doneHandler()
      }

      addTimer(setTimeout(() => {
        if (isSilentRef.current) {
          trainerRef.current?.ask("", [{
            label: 'Done', btnVariant: 'done', onClick: wrappedDone,
          }])
        } else {
          trainerRef.current?.ask("따라해보세요.", [{
            label: 'Done', btnVariant: 'done', onClick: wrappedDone,
          }])
          addTimer(setTimeout(() => {
            trainerRef.current?.say("다시 들어볼까요?", 3000)
          }, 10000))
        }
      }, 200))
    }
  }

  // ── Recall reveal ─────────────────────────────────────────────────────────

  function handleReveal() {
    if (revealed) return
    stopSpeech()
    setRevealed(true)
  }

  // Reveal tap is visual-only — Done card already shown from slide entry
  useEffect(() => {}, [revealed])

  // ── Story audio controls ──────────────────────────────────────────────────

  function getStoryParas(part: number) {
    if (storyParts === 2) {
      return part === 0
        ? story.paragraphs.slice(0, splitAt)
        : story.paragraphs.slice(splitAt)
    }
    return story.paragraphs
  }

  function handleStoryPlay(part: number) {
    const paras = getStoryParas(part)
    const texts = paras.map(p => p.english)
    const urls  = paras.map(p => storyParaAudioUrl(narrator, story.id, p.id, p.english))
    trainerRef.current?.setCardPlaying(true)
    trainerRef.current?.clearMessage()
    speakAll(texts, urls, { voiceKey: narrator, onEnd: makeOnEnd(() => handleStoryPartDone(part)) })
  }

  // ── Pattern audio registered play fn ────────────────────────────────────

  const handleRegisterPlay = useCallback((fn: () => void) => {
    patternPlayRef.current = fn
  }, [])

  // ── Slide init on each advance ─────────────────────────────────────────────

  useEffect(() => {
    trainer?.setPage('session')
    clearTimers()
    const t = trainerRef.current
    const s = slideRef.current

    switch (s.kind) {
      case 'intro': {
        trainerRef.current?.clearMessage()
        if (isGuided) {
          t?.say("안녕하세요! 함께 시작해볼게요.", 2000)
        }
        addTimer(setTimeout(() => {
          goTo({ kind: 'story', part: 0 })
        }, isGuided ? 2200 : 1200))
        break
      }

      case 'story': {
        const { part } = s
        trainerRef.current?.setRepeatCallback(() => handleStoryPlay(part))
        addTimer(setTimeout(() => {
          trainerRef.current?.ask("들어보세요.", [{
            label: 'Play', btnVariant: 'play',
            onClick: () => handleStoryPlay(part),
          }])
        }, 400))
        break
      }

      case 'pattern': {
        const { idx } = s
        patternOnEndRef.current = makeOnEnd(() => handlePatternDone(idx))
        trainerRef.current?.setRepeatCallback(() => patternPlayRef.current?.())

        const progressMsgs = ['', '계속해요.', '절반 왔어요.', '거의 다 왔어요.', '마지막이에요.']
        const progressMsg = progressMsgs[idx]
        const msg = idx === 0 && isGuided
          ? "스토리에서 나온 패턴이에요. 먼저 들어보세요."
          : "들어보세요."

        const showCard = () => {
          trainerRef.current?.ask(msg, [{
            label: 'Play', btnVariant: 'play',
            onClick: () => {
              trainerRef.current?.setCardPlaying(true)
              patternPlayRef.current?.()
            },
          }])
        }

        if (progressMsg && intensity !== 'minimal' && intensity !== 'silent') {
          t?.say(progressMsg, 1500)
          addTimer(setTimeout(showCard, 1800))
        } else {
          addTimer(setTimeout(showCard, 400))
        }
        break
      }

      case 'hide-recall': {
        const { round, patIdx } = s
        const showRecallPrompt = intensity !== 'silent'
        const showRecallAsk = () => {
          trainerRef.current?.ask(showRecallPrompt ? "떠올려보세요." : "", [{
            label: 'Done', btnVariant: 'done', onClick: () => handleRecallDone(round, patIdx),
          }])
        }
        if (patIdx === 0 && round > 1 && intensity === 'full') {
          const msg = RECALL_ROUND_MSGS[Math.min(round - 2, 2)]
          t?.say(msg, 1500)
          addTimer(setTimeout(showRecallAsk, 1700))
        } else {
          addTimer(setTimeout(showRecallAsk, 400))
        }
        break
      }

      case 'daily-challenge': {
        break
      }

      case 'complete': {
        clearSavedSlide(story.id)
        if (!completedRef.current) {
          completedRef.current = true
          const elapsed = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))
          setElapsedMin(elapsed)
          const data = completeStoryRound(story.id)
          setCompletionData(data)
          const patternIds = story.patterns.map(p => p.id)
          setProgress(prev => completeStoryAndScheduleReview(prev, String(story.id), patternIds, 1, 1))
          if (user?.id) syncStoryRoundToSupabase(user.id, data)
          onSessionComplete(story.patterns.length)
          if (user?.id) syncStatsToSupabase(user.id)
          if (isGuided) {
            try {
              localStorage.setItem('is_guided_session', 'false')
              localStorage.setItem('is_onboarding_complete', 'true')
            } catch {}
          }
        }
        const completionMsg = isSilentRef.current
          ? ''
          : isGuided ? "첫 번째 세션을 완료했어요!" : "오늘도 잘하셨어요."
        addTimer(setTimeout(() => {
          const reviewDue = magazineStories.filter(s => s.id !== story.id && getStoryStatus(s.id) === 'review_due')
          const nextStory = magazineStories.find(s => s.id > story.id)

          const showCompletionAsk = () => {
            const buttons: Array<{ label: string; primary?: boolean; onClick: () => void }> = [
              { label: 'Finish', onClick: () => router.push('/patto/home') },
            ]
            if (nextStory) {
              buttons.push({ label: 'Next', primary: true, onClick: () => router.push(`/patto/session/${nextStory.id}`) })
            }
            trainerRef.current?.ask(completionMsg, buttons)
          }

          if (reviewDue.length > 0) {
            const reviewId = reviewDue[0].id
            trainerRef.current?.ask("잘하셨어요! 오늘 복습할 스토리가 있어요.", [
              { label: '복습하기', primary: true, onClick: () => router.push(`/patto/session/${reviewId}`) },
              { label: '나중에', onClick: showCompletionAsk },
            ])
          } else {
            showCompletionAsk()
          }
        }, 800))
        break
      }
    }

    return () => clearTimers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey])

  // Cleanup on unmount
  useEffect(() => {
    return () => { clearTimers(); stopSpeech() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Progress bar ───────────────────────────────────────────────────────────

  const PATS  = story.patterns.length
  const total = 1 + storyParts + PATS + PATS * totalRecallRounds + 2

  function slideNum(): number {
    const P = storyParts
    switch (slide.kind) {
      case 'intro':           return 1
      case 'story':           return 2 + slide.part
      case 'pattern':         return 1 + P + 1 + slide.idx
      case 'hide-recall':     return 1 + P + PATS + (slide.round - 1) * PATS + slide.patIdx + 1
      case 'daily-challenge': return 1 + P + PATS * (1 + totalRecallRounds) + 1
      case 'complete':        return total
    }
  }

  const progressPct = (slideNum() / total) * 100
  const isComplete = slide.kind === 'complete'

  // ── Exit ───────────────────────────────────────────────────────────────────

  function handleExit() {
    clearTimers()
    stopSpeech()
    trainerRef.current?.ask("세션을 종료할까요?", [
      { label: 'Stay', primary: true, onClick: () => trainerRef.current?.clearMessage() },
      { label: 'Exit', onClick: () => router.push('/patto/home') },
    ])
  }

  // Block browser back; intercept with exit ask
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPopState = () => {
      window.history.pushState(null, '', window.location.href)
      handleExit()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  function renderSlide() {
    switch (slide.kind) {
      case 'intro':
        return <IntroSlide story={story} currentRound={currentRound} />

      case 'story': {
        const part = slide.part
        const paragraphs = getStoryParas(part)
        return (
          <StorySlide
            story={story}
            paragraphs={paragraphs}
            part={part}
            totalParts={storyParts}
            currentRound={currentRound}
            patternTexts={patternTexts}
            studyMode={studyMode}
            onStudyModeChange={setStudyMode}
          />
        )
      }

      case 'pattern':
        return (
          <PatternCardFocus
            key={`pattern-${slide.idx}`}
            story={story}
            idx={slide.idx}
            studyMode={studyMode}
            onStudyModeChange={setStudyMode}
            onRegisterPlay={handleRegisterPlay}
            onAudioEnd={() => patternOnEndRef.current?.()}
          />
        )

      case 'hide-recall':
        return (
          <HideRecallSlide
            story={story}
            patIdx={slide.patIdx}
            revealed={revealed}
            onReveal={handleReveal}
          />
        )

      case 'daily-challenge':
        return (
          <DailyChallengeSlide
            story={story}
            onSkip={() => goTo({ kind: 'complete' })}
            onDone={() => goTo({ kind: 'complete' })}
          />
        )

      case 'complete':
        return (
          <CompleteSlide
            story={story}
            completionData={completionData}
            elapsedMin={elapsedMin}
            isGuided={isGuided}
          />
        )
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'var(--pb)',
      backgroundImage: isDark ? undefined : "url('/bg-light.svg')",
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      {!isComplete && (
        <div style={{ flexShrink: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '14px 20px 10px',
          }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
              color: '#8EA7FF', textTransform: 'uppercase',
              background: 'rgba(142,167,255,0.1)',
              border: '0.5px solid rgba(142,167,255,0.2)',
              borderRadius: 20, padding: '3px 10px',
            }}>
              Session {currentRound + 1}
              {slide.kind === 'hide-recall' && ` · Round ${slide.round}`}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 2, background: 'rgba(107,143,255,0.12)', margin: '0 20px' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6B8FFF, #B8A8F0)',
              borderRadius: 1,
              transition: 'width 0.45s ease',
            }} />
          </div>
        </div>
      )}

      {/* Slide content */}
      <div
        key={animKey}
        style={{
          flex: 1, overflow: 'hidden',
          animation: 'ssSlideIn 0.3s ease-out both',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {renderSlide()}
      </div>

      <style>{`
        @keyframes ssSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ssReveal {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
