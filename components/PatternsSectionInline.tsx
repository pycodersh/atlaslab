'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Square, Bookmark, Info, X } from 'lucide-react'
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
  hideRecallMode?: boolean
  recallRound?: number
  totalRecallRounds?: number
  onRecallRoundComplete?: () => void
  onPatternIndexChange?: (idx: number) => void
  /** Override prefs-based showKorean (e.g. tied to story's language toggle) */
  showKorean?: boolean
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
  isDark: boolean
  hideRecallMode: boolean
  isRevealed: boolean
  onReveal: () => void
  onBookmarkChange?: () => void
}

function PatternCardItem({
  pattern, story, patternExamples, storyIsSpeaking,
  globalPatternNum, showKorean, isDark,
  hideRecallMode, isRevealed, onReveal,
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
          }
        },
        onError: () => { if (playTokenRef.current !== token) return; runningRef.current = false; setIsPlaying(false) },
      })
    }
    playOne(0)
  }, [isPlaying, stop, examples, voice, prefs.speechRate, pattern, story])

  function handleBookmark() {
    const next = toggleBookmark({
      patternId: pattern.id, pattern: pattern.pattern,
      meaningKo: pattern.meaningKo, storyId: story.id,
    })
    setBookmarked(next)
  }

  // ── Colors ────────────────────────────────────────────────────────────────
  const heroBg          = isDark ? 'linear-gradient(160deg, #3a2858 0%, #2a3050 54%, #351828 100%)' : 'transparent'
  const heroPatternColor = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const heroMeaningColor = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const heroIconColor    = isDark ? 'rgba(255,255,255,0.60)' : '#8EA7FF'
  const cardBg           = isDark ? 'rgba(30,28,48,0.85)'    : '#FFFFFF'
  const exBoxBg          = isDark ? 'rgba(255,255,255,0.04)' : '#F6F7FB'
  const exBoxBorder      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(142,167,255,0.14)'
  const exEnColor        = isDark ? 'rgba(255,255,255,0.90)' : '#1a1a2e'
  const exKoColor        = isDark ? 'rgba(255,255,255,0.45)' : '#9a9ab0'
  const cardBorder       = isDark ? '1px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(142,167,255,0.25)'
  const cardShadow       = isDark
    ? '0 16px 40px rgba(0,0,0,0.40)'
    : '0 -3px 16px rgba(142,167,255,0.12), 0 4px 12px rgba(142,167,255,0.08)'
  const noteBg  = isDark ? 'rgba(255,220,80,0.12)' : '#FFFBEA'
  const noteBorder = isDark ? 'rgba(255,220,80,0.25)' : '#F5E58A'
  const noteText = isDark ? 'rgba(255,230,120,0.90)' : '#7A6200'

  const isHidden = hideRecallMode && !isRevealed

  return (
    <div
      style={{
        borderRadius: 18, background: cardBg, border: cardBorder, boxShadow: cardShadow,
        overflow: 'hidden',
        cursor: isHidden ? 'pointer' : 'default',
      }}
      onClick={isHidden ? onReveal : undefined}
    >
      {/* Hero section */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 16px 16px', background: heroBg }}>
        {/* Top row: pattern num | bookmark + note icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{
            margin: 0, fontSize: '0.57rem', fontWeight: 700, color: heroIconColor,
            letterSpacing: '0.06em', fontFamily: '"SF Mono", "Fira Mono", monospace',
          }}>
            PATTERN {String(globalPatternNum).padStart(3, '0')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {patternNote && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setNoteOpen(v => !v) }}
                aria-label="패턴 노트"
                style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer', flexShrink: 0,
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
                background: 'none', border: 'none', padding: 4, cursor: 'pointer', flexShrink: 0,
                color: bookmarked ? (isDark ? '#8FABFF' : '#8EA7FF') : heroIconColor,
                transition: 'color 0.15s',
              }}
            >
              <Bookmark style={{ width: 15, height: 15 }} strokeWidth={1.8} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Pattern text or hidden block */}
        {isHidden ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              flex: 1, height: 36, borderRadius: 8,
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(142,167,255,0.15)',
              display: 'block',
            }} />
            <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.40)' : '#8EA7FF', fontWeight: 500, flexShrink: 0, letterSpacing: '0.02em' }}>
              탭하여 확인
            </span>
          </div>
        ) : (
          <p style={{
            fontSize: 32, fontWeight: 800, color: heroPatternColor,
            lineHeight: 1.2, margin: '0 0 6px', letterSpacing: '-0.5px',
            fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            {pattern.pattern}
          </p>
        )}

        <div style={{ width: 28, height: 2, borderRadius: 2, margin: '6px 0 10px', background: isDark ? 'rgba(255,255,255,0.25)' : '#8EA7FF' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {patternMeaning ? (
            <p style={{ fontSize: 13, fontWeight: 600, color: heroMeaningColor, margin: 0, flex: 1, paddingRight: 8, lineHeight: 1.4 }}>
              {patternMeaning}
            </p>
          ) : <div />}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); playExamples() }}
            aria-label={isPlaying ? '정지' : '예문 듣기'}
            style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: isPlaying ? (isDark ? '#8FABFF' : '#8EA7FF') : heroIconColor, transition: 'color 0.15s', flexShrink: 0 }}
          >
            {isPlaying
              ? <Square style={{ width: 11, height: 11 }} fill="currentColor" strokeWidth={0} />
              : <Volume2 style={{ width: 17, height: 17 }} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      {/* Note popup */}
      {noteOpen && patternNote && (
        <div style={{
          margin: '0 16px',
          borderRadius: 10,
          background: noteBg,
          border: `1px solid ${noteBorder}`,
          padding: '10px 12px 10px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <p style={{ margin: 0, flex: 1, fontSize: 12, color: noteText, lineHeight: 1.6 }}>{patternNote}</p>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setNoteOpen(false) }}
            style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: noteText, flexShrink: 0, marginTop: 1 }}
          >
            <X style={{ width: 12, height: 12 }} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Examples */}
      {!isHidden && (
        <div style={{ padding: noteOpen ? '10px 16px 16px' : '14px 16px 16px' }}>
          <div style={{ borderRadius: 12, background: exBoxBg, border: `1px solid ${exBoxBorder}`, padding: '12px 14px' }}>
            {examples.map((ex, i) => {
              const isExPlaying = isPlaying && i === exIdx
              const fullEx = patternExamplesFull[pattern.id]?.[i]
              const safeCandidates = (fullEx?.en === ex.en) ? fullEx?.saveCandidates : undefined
              const exKo = resolveTranslation(ex.ko, prefs.language, ex.translations)
              return (
                <div key={i} style={{ borderTop: i > 0 ? `1px solid ${exBoxBorder}` : 'none', paddingTop: i > 0 ? 12 : 0, paddingBottom: i < examples.length - 1 ? 12 : 0 }}>
                  <TappableWordText
                    text={ex.en}
                    saveCandidates={safeCandidates}
                    source={{ sourceType: 'example', sourceId: `${pattern.id}-ex${i + 1}`, patternId: pattern.id, storyId: story.id, exampleIndex: i, originalSentence: ex.en }}
                    style={{ display: 'block', fontSize: 14, fontWeight: isExPlaying ? 700 : 400, color: exEnColor, lineHeight: 1.55, marginBottom: 2 }}
                  />
                  {showKorean && exKo && (
                    <p style={{ fontSize: 12, color: exKoColor, margin: 0, lineHeight: 1.5 }}>{exKo}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
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
  hideRecallMode = false,
  recallRound = 1,
  totalRecallRounds = 3,
  onRecallRoundComplete,
  onPatternIndexChange,
  showKorean: showKoreanProp,
}: Props) {
  const { prefs } = usePreferences()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const patterns = story.patterns

  // showKorean: use prop if provided, else fall back to prefs
  const showKorean = showKoreanProp !== undefined ? showKoreanProp : prefs.language !== 'en'

  const [recallRevealed, setRecallRevealed] = useState<Set<number>>(new Set())
  const allSeenFiredRef = useRef(false)

  // Reset recall state on new round
  useEffect(() => {
    if (hideRecallMode) {
      setRecallRevealed(new Set())
    }
  }, [hideRecallMode, recallRound])

  // In normal (non-recall) mode, all patterns are visible immediately → fire callback
  useEffect(() => {
    if (!hideRecallMode && !allSeenFiredRef.current) {
      allSeenFiredRef.current = true
      onAllPatternsSeen?.()
      onPatternIndexChange?.(patterns.length - 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideRecallMode])

  useEffect(() => {
    if (!hideRecallMode) allSeenFiredRef.current = false
  }, [hideRecallMode])

  function handleReveal(idx: number) {
    const next = new Set(recallRevealed).add(idx)
    setRecallRevealed(next)
    onPatternIndexChange?.(idx)
    if (next.size === patterns.length) {
      setTimeout(() => onRecallRoundComplete?.(), 600)
    }
    if (!allSeenFiredRef.current && next.size === patterns.length) {
      allSeenFiredRef.current = true
      onAllPatternsSeen?.()
    }
  }

  return (
    <div style={{ padding: '0 16px 8px' }}>
      {/* Hide-recall round indicator */}
      {hideRecallMode && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#8EA7FF', fontWeight: 600 }}>
            Round {recallRound}/{totalRecallRounds}
          </span>
          <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.35)' : '#9a9ab0' }}>
            떠올랐으면 탭해서 확인하세요
          </span>
        </div>
      )}

      {/* Vertical list of all pattern cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {patterns.map((pat, idx) => (
          <PatternCardItem
            key={`${pat.id}-${recallRound}`}
            pattern={pat}
            story={story}
            patternExamples={patternExamples}
            storyIsSpeaking={storyIsSpeaking}
            globalPatternNum={(story.id - 1) * patterns.length + idx + 1}
            showKorean={showKorean}
            isDark={isDark}
            hideRecallMode={hideRecallMode}
            isRevealed={recallRevealed.has(idx)}
            onReveal={() => handleReveal(idx)}
          />
        ))}
      </div>
    </div>
  )
}
