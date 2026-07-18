'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Square, Bookmark, Info, X, CheckCircle2 } from 'lucide-react'
import { PATTERN_NOTES } from '@/data/pattern-notes'
import type { MagazineStory, MagazinePattern } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { RATE_MAP } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, patternExampleAudioUrl } from '@/lib/tts'
import { recordPatternPractice, applyReview, todayStr } from '@/lib/srs/storage'
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks/storage'
import { getPatternExamples } from '@/data/pattern-examples'
import { patternExamplesFull } from '@/data/pattern-examples-full'
import { shimmerExamples } from '@/data/shimmer-audio-meta'
import { TappableWordText } from '@/components/TappableWordText'
import { useTheme } from '@/components/ThemeProvider'

const EXAMPLE_PAUSE_MS = 1800

type Props = {
  story: MagazineStory
  patternExamples?: Record<string, PracticeExample[]>
  storyIsSpeaking?: boolean
  showNavButtons?: boolean
  showSwipeGuide?: boolean
  onAllPatternsSeen?: () => void
  onPatternIndexChange?: (idx: number) => void
  /** Override prefs-based showKorean (e.g. tied to story's language toggle) */
  showKorean?: boolean
  /** When true, English is faded out (opacity 0) like KO mode in story */
  showEnglish?: boolean
}

function resolveExamples(
  patternExamples: Record<string, PracticeExample[]> | undefined,
  patternId: string,
  storySentence?: string,
  storySentenceKo?: string,
  variationSentence?: string,
  variationSentenceKo?: string,
): PracticeExample[] {
  if (patternExamples?.[patternId]?.length) return patternExamples[patternId]
  const fromData = getPatternExamples(patternId)
  if (fromData.length > 0) return fromData
  const result: PracticeExample[] = []
  if (storySentence) result.push({ en: storySentence, ko: storySentenceKo ?? '' })
  if (variationSentence) result.push({ en: variationSentence, ko: variationSentenceKo ?? '' })
  return result
}

// ── Per-pattern card ─────────────────────────────────────────────────────────

type CardProps = {
  pattern: MagazinePattern
  story: MagazineStory
  patternExamples?: Record<string, PracticeExample[]>
  storyIsSpeaking: boolean
  globalPatternNum: number
  showKorean: boolean
  showEnglish: boolean
  isDark: boolean
  isActive?: boolean
  isCompleted?: boolean
  onActivate?: () => void
  onComplete?: () => void
}

function PatternCardItem({
  pattern, story, patternExamples, storyIsSpeaking,
  globalPatternNum, showKorean, showEnglish, isDark,
  isActive = false, isCompleted = false,
  onActivate, onComplete,
}: CardProps) {
  const { prefs } = usePreferences()
  const voice = story.narratorVoice ?? prefs.voice

  const [isPlaying, setIsPlaying]   = useState(false)
  const [exIdx, setExIdx]           = useState(0)
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(pattern.id))
  const [noteOpen, setNoteOpen]     = useState(false)

  const runningRef   = useRef(false)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playTokenRef = useRef(0)
  const startedAtRef = useRef(0)

  const examples = resolveExamples(
    patternExamples, pattern.id,
    pattern.storySentence, pattern.storySentenceKo,
    pattern.variationSentence, pattern.variationSentenceKo,
  ).slice(0, 3)

  const patternNote = pattern.explanation ?? PATTERN_NOTES[pattern.id] ?? null
  const patternMeaning = resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)

  // Stop when story speaks
  useEffect(() => {
    if (storyIsSpeaking && isPlaying) {
      playTokenRef.current++
      runningRef.current = false
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      ttsProvider.stop()
      setIsPlaying(false)
    }
  }, [storyIsSpeaking, isPlaying])

  useEffect(() => () => {
    runningRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const stop = useCallback(() => {
    playTokenRef.current++
    runningRef.current = false
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    ttsProvider.stop()
    setIsPlaying(false)
  }, [])

  const playExamples = useCallback(() => {
    if (isPlaying) { stop(); return }
    onActivate?.()
    const token = ++playTokenRef.current
    runningRef.current = true
    startedAtRef.current = Date.now()
    setIsPlaying(true)
    function playOne(idx: number) {
      if (!runningRef.current || playTokenRef.current !== token) return
      const ex = examples[idx]
      if (!ex) { runningRef.current = false; setIsPlaying(false); return }
      setExIdx(idx)
      const shimmerEx = shimmerExamples[`${pattern.id}-ex${idx + 1}`]
      const url = shimmerEx?.url ?? patternExampleAudioUrl(voice, pattern.id, idx, ex.en)
      ttsProvider.speak({
        texts: [ex.en], audioUrls: url ? [url] : undefined,
        voiceKey: voice, voiceKeys: [voice],
        rate: RATE_MAP[prefs.speechRate], pitch: getPitchForKey(voice), volume: 1.0,
        onEnd: () => {
          if (!runningRef.current || playTokenRef.current !== token) return
          if (idx + 1 < examples.length) {
            timerRef.current = setTimeout(() => playOne(idx + 1), EXAMPLE_PAUSE_MS)
          } else {
            const dur = Date.now() - startedAtRef.current
            const rec = recordPatternPractice(pattern.id, story.id, pattern.pattern, story.title, dur)
            if (rec.lastReviewedAt?.slice(0, 10) !== todayStr()) applyReview('pattern', pattern.id, true)
            runningRef.current = false; setIsPlaying(false)
            onComplete?.()
          }
        },
        onError: () => { if (playTokenRef.current !== token) return; runningRef.current = false; setIsPlaying(false) },
      })
    }
    playOne(0)
  }, [isPlaying, stop, examples, voice, prefs.speechRate, pattern, story, onActivate, onComplete])

  function handleBookmark() {
    const next = toggleBookmark({
      patternId: pattern.id, pattern: pattern.pattern,
      meaningKo: pattern.meaningKo, storyId: story.id,
    })
    setBookmarked(next)
  }

  // ── Colors ────────────────────────────────────────────────────────────────
  const heroBg          = 'transparent'
  const heroPatternColor = isCompleted
    ? (isDark ? '#999' : '#999')
    : isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const heroMeaningColor = isCompleted
    ? (isDark ? '#777' : '#aaa')
    : isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const heroIconColor    = isCompleted
    ? (isDark ? 'rgba(255,255,255,0.30)' : '#bbb')
    : isDark ? 'rgba(255,255,255,0.60)' : '#8EA7FF'
  const cardBg    = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.84)'
  const exEnColor = isCompleted
    ? '#999'
    : isDark ? 'rgba(255,255,255,0.90)' : '#1a1a2e'
  const exKoColor = isCompleted
    ? '#bbb'
    : isDark ? 'rgba(255,255,255,0.45)' : '#9a9ab0'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(142,167,255,0.20)'
  const baseGlow  = isActive ? ', 0 0 0 1.5px rgba(107,124,255,0.35)' : ''
  const cardShadow = isDark
    ? `0 4px 28px rgba(0,0,0,0.40)${baseGlow}`
    : `0 4px 28px rgba(100,120,200,0.07), 0 1px 4px rgba(0,0,0,0.03)${baseGlow}`
  const cardOpacity = isCompleted ? 0.7 : (isActive ? 1 : 0.93)
  const noteBg  = isDark ? 'rgba(255,220,80,0.12)' : '#FFFBEA'
  const noteBorder = isDark ? 'rgba(255,220,80,0.25)' : '#F5E58A'
  const noteText = isDark ? 'rgba(255,230,120,0.90)' : '#7A6200'

  return (
    <div
      style={{
        borderRadius: 22, background: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: cardBorder, boxShadow: cardShadow,
        overflow: 'hidden', opacity: cardOpacity,
        transition: 'opacity 0.25s, box-shadow 0.25s',
        position: 'relative',
      }}
    >
      {/* Header: pattern num + meaning + icons */}
      <div style={{ padding: '22px 18px 14px', background: heroBg }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          {/* Left: num + pattern */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: '0 0 8px', fontSize: '0.62rem', fontWeight: 700, color: heroIconColor,
              letterSpacing: '0.10em', fontFamily: '"SF Mono", "Fira Mono", monospace',
            }}>
              PATTERN {String(globalPatternNum).padStart(3, '0')}
            </p>
            <p style={{
              fontSize: 20, fontWeight: 800, color: heroPatternColor,
              lineHeight: 1.2, margin: 0, letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            }}>
              {pattern.pattern}
            </p>
          </div>

          {/* Right: completed check + note + bookmark (speaker moved to meaning row) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, marginTop: 2 }}>
            {isCompleted && (
              <CheckCircle2 style={{ width: 13, height: 13, color: isDark ? '#555' : '#c0c0d0', marginRight: 2 }} strokeWidth={1.8} />
            )}
            {patternNote && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setNoteOpen(v => !v) }}
                aria-label="패턴 노트"
                style={{
                  background: 'none', border: 'none', padding: 5, cursor: 'pointer',
                  color: noteOpen ? (isDark ? '#FFE050' : '#C09900') : heroIconColor,
                  transition: 'color 0.15s',
                }}
              >
                <Info style={{ width: 15, height: 15 }} strokeWidth={1.8} />
              </button>
            )}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleBookmark() }}
              aria-label={bookmarked ? '북마크 해제' : '북마크'}
              style={{
                background: 'none', border: 'none', padding: 5, cursor: 'pointer',
                color: bookmarked ? (isDark ? '#8FABFF' : '#8EA7FF') : heroIconColor,
                transition: 'color 0.15s',
              }}
            >
              <Bookmark style={{ width: 14, height: 14 }} strokeWidth={1.8} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Meaning + speaker full-width row */}
        {patternMeaning && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: heroMeaningColor, margin: 0, lineHeight: 1.45 }}>
              {patternMeaning}
            </p>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); playExamples() }}
              aria-label={isPlaying ? '정지' : '예문 듣기'}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: isPlaying ? (isDark ? '#8FABFF' : '#8EA7FF') : heroIconColor, transition: 'color 0.15s', flexShrink: 0 }}
            >
              {isPlaying
                ? <Square style={{ width: 10, height: 10 }} fill="currentColor" strokeWidth={0} />
                : <Volume2 style={{ width: 15, height: 15 }} strokeWidth={1.6} />}
            </button>
          </div>
        )}
      </div>

      {/* Note popup */}
      {noteOpen && patternNote && (
        <div style={{
          margin: '0 12px',
          borderRadius: 8,
          background: noteBg,
          border: `1px solid ${noteBorder}`,
          padding: '8px 10px 8px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <p style={{ margin: 0, flex: 1, fontSize: 12, color: noteText, lineHeight: 1.6 }}>{patternNote}</p>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setNoteOpen(false) }}
            style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: noteText, flexShrink: 0, marginTop: 1 }}
          >
            <X style={{ width: 11, height: 11 }} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Examples — bullet list */}
      <div style={{ padding: '0 18px 22px' }}>
        {/* Thin divider above examples */}
        <div style={{
          height: '0.5px',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(142,167,255,0.18)',
          marginBottom: 10,
        }} />
        {examples.map((ex, i) => {
          const isExPlaying = isPlaying && i === exIdx
          const fullEx = patternExamplesFull[pattern.id]?.[i]
          const safeCandidates = (fullEx?.en === ex.en) ? fullEx?.saveCandidates : undefined
          const exKo = resolveTranslation(ex.ko, prefs.language, ex.translations)
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: i === 0 ? 0 : 10 }}>
              <span style={{ fontSize: 14, color: heroIconColor, flexShrink: 0, lineHeight: '1.65', marginTop: 0 }}>•</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ opacity: showEnglish ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showEnglish ? 'auto' : 'none' }}>
                  <TappableWordText
                    text={ex.en}
                    saveCandidates={safeCandidates}
                    source={{ sourceType: 'example', sourceId: `${pattern.id}-ex${i + 1}`, patternId: pattern.id, storyId: story.id, exampleIndex: i, originalSentence: ex.en }}
                    style={{ display: 'block', fontSize: 13, fontWeight: isExPlaying ? 700 : 500, color: exEnColor, lineHeight: 1.65 }}
                  />
                </div>
                {showKorean && exKo && (
                  <p style={{ fontSize: 12, color: exKoColor, margin: '3px 0 0', lineHeight: 1.5 }}>{exKo}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PatternsSectionInline({
  story,
  patternExamples,
  storyIsSpeaking = false,
  showSwipeGuide: _showSwipeGuide,
  showNavButtons: _showNavButtons,
  onAllPatternsSeen,
  onPatternIndexChange,
  showKorean: showKoreanProp,
  showEnglish: showEnglishProp,
}: Props) {
  const { prefs } = usePreferences()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const patterns = story.patterns

  const showKorean = showKoreanProp !== undefined ? showKoreanProp : prefs.language !== 'en'
  const showEnglish = showEnglishProp !== undefined ? showEnglishProp : true

  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set())
  const allSeenFiredRef = useRef(false)

  // All patterns visible immediately → fire callback
  useEffect(() => {
    if (!allSeenFiredRef.current) {
      allSeenFiredRef.current = true
      onAllPatternsSeen?.()
      onPatternIndexChange?.(patterns.length - 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ padding: '0 16px 8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 17 }}>
        {patterns.map((pat, idx) => (
          <PatternCardItem
            key={pat.id}
            pattern={pat}
            story={story}
            patternExamples={patternExamples}
            storyIsSpeaking={storyIsSpeaking}
            globalPatternNum={(story.id - 1) * patterns.length + idx + 1}
            showKorean={showKorean}
            showEnglish={showEnglish}
            isDark={isDark}
            isActive={activeIdx === idx}
            isCompleted={completedSet.has(idx)}
            onActivate={() => setActiveIdx(idx)}
            onComplete={() => setCompletedSet(prev => new Set(prev).add(idx))}
          />
        ))}
      </div>
    </div>
  )
}
