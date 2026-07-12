'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Square, Bookmark, Lightbulb } from 'lucide-react'
import { PATTERN_NOTES } from '@/data/pattern-notes'
import type { MagazineStory } from '@/types/magazine'
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
  /** When story audio is speaking, stop pattern audio indicator */
  storyIsSpeaking?: boolean
  /** Whether to show prev/next arrow buttons (PC) */
  showNavButtons?: boolean
  /** Guide text shown on the first card ("👆 스와이프해서 패턴을 확인하세요") */
  showSwipeGuide?: boolean
  /** Called once when user reaches the last pattern card for the first time */
  onAllPatternsSeen?: () => void
  /** Hide-recall mode: Korean visible, English hidden until tap */
  hideRecallMode?: boolean
  /** Current recall round (1-based, shown as "Round X/Y") */
  recallRound?: number
  /** Total recall rounds in this session */
  totalRecallRounds?: number
  /** Called when user has revealed+seen all cards in one recall round */
  onRecallRoundComplete?: () => void
  /** Called whenever the visible pattern card index changes (0-based) */
  onPatternIndexChange?: (idx: number) => void
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

export function PatternsSectionInline({
  story,
  patternExamples,
  storyIsSpeaking = false,
  showNavButtons = false,
  showSwipeGuide = false,
  onAllPatternsSeen,
  hideRecallMode = false,
  recallRound = 1,
  totalRecallRounds = 3,
  onRecallRoundComplete,
  onPatternIndexChange,
}: Props) {
  const { prefs } = usePreferences()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const voice = story.narratorVoice ?? prefs.voice
  const patterns = story.patterns

  // ── State ────────────────────────────────────────────────────────────
  const [patIdx, setPatIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [exIdx, setExIdx] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  // hide-recall: which cards have been tapped to reveal in this round
  const [recallRevealed, setRecallRevealed] = useState<Set<number>>(new Set())
  // track if onAllPatternsSeen has fired this session
  const allSeenFiredRef = useRef(false)

  const patIdxRef = useRef(0)
  const runningRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playTokenRef = useRef(0)
  const startedAtRef = useRef(0)

  const pattern = patterns[patIdx]
  const examples = resolveExamples(
    patternExamples, pattern.id,
    pattern.storySentence, pattern.storySentenceKo,
    pattern.variationSentence, pattern.variationSentenceKo,
  ).slice(0, 3)

  useEffect(() => { setBookmarked(isBookmarked(pattern.id)) }, [pattern.id])

  // Reset recall state when mode switches to hide-recall (new round)
  useEffect(() => {
    if (hideRecallMode) {
      setRecallRevealed(new Set())
      setPatIdx(0)
      patIdxRef.current = 0
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideRecallMode, recallRound])

  // Report pattern index change to parent
  useEffect(() => {
    if (!hideRecallMode) onPatternIndexChange?.(patIdx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patIdx, hideRecallMode])

  // Fire onAllPatternsSeen (view mode) when last card reached
  useEffect(() => {
    if (!hideRecallMode && !allSeenFiredRef.current && patIdx === patterns.length - 1) {
      allSeenFiredRef.current = true
      onAllPatternsSeen?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patIdx, hideRecallMode, patterns.length])

  // Reset allSeenFired when switching out of recall mode
  useEffect(() => {
    if (!hideRecallMode) allSeenFiredRef.current = false
  }, [hideRecallMode])

  // ── When story audio starts, clear pattern playing indicator ─────────
  useEffect(() => {
    if (storyIsSpeaking && isPlaying) {
      playTokenRef.current++
      runningRef.current = false
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      setIsPlaying(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIsSpeaking])

  // Cleanup on unmount
  useEffect(() => () => {
    runningRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    ttsProvider.stop()
  }, [])

  // ── Audio ─────────────────────────────────────────────────────────────
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
    const pat = patterns[patIdxRef.current]
    const exs = resolveExamples(
      patternExamples, pat.id,
      pat.storySentence, pat.storySentenceKo,
      pat.variationSentence, pat.variationSentenceKo,
    ).slice(0, 3)

    runningRef.current = true
    startedAtRef.current = Date.now()
    setIsPlaying(true)

    function playOne(idx: number) {
      if (!runningRef.current || playTokenRef.current !== token) return
      const ex = exs[idx]
      if (!ex) {
        runningRef.current = false; setIsPlaying(false); return
      }
      setExIdx(idx)
      const shimmerEx = shimmerExamples[`${pat.id}-ex${idx + 1}`]
      const url = shimmerEx?.url ?? patternExampleAudioUrl(voice, pat.id, idx, ex.en)
      ttsProvider.speak({
        texts: [ex.en], audioUrls: url ? [url] : undefined,
        voiceKey: voice, voiceKeys: [voice],
        rate: RATE_MAP[prefs.speechRate], pitch: getPitchForKey(voice), volume: 1.0,
        onEnd: () => {
          if (!runningRef.current || playTokenRef.current !== token) return
          if (idx + 1 < exs.length) {
            timerRef.current = setTimeout(() => playOne(idx + 1), EXAMPLE_PAUSE_MS)
          } else {
            const dur = Date.now() - startedAtRef.current
            const rec = recordPatternPractice(pat.id, story.id, pat.pattern, story.title, dur)
            if (rec.lastReviewedAt?.slice(0, 10) !== todayStr()) applyReview('pattern', pat.id, true)
            runningRef.current = false; setIsPlaying(false)
          }
        },
        onError: () => {
          if (playTokenRef.current !== token) return
          runningRef.current = false; setIsPlaying(false)
        },
      })
    }
    playOne(0)
  }, [isPlaying, stop, patterns, patternExamples, voice, prefs.speechRate, story.id, story.title])

  // ── Navigation ────────────────────────────────────────────────────────
  const navigateTo = useCallback((idx: number) => {
    stop()
    setPatIdx(idx)
    patIdxRef.current = idx
    setExIdx(0)
  }, [stop])

  const goNext = useCallback(() => {
    const next = patIdxRef.current + 1
    if (next < patterns.length) navigateTo(next)
  }, [patterns.length, navigateTo])

  const goPrev = useCallback(() => {
    const prev = patIdxRef.current - 1
    if (prev >= 0) navigateTo(prev)
  }, [navigateTo])

  // ── Touch swipe ───────────────────────────────────────────────────────
  const swipeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = swipeRef.current
    if (!el) return
    let startX = 0, startY = 0
    let dir: 'h' | 'v' | null = null

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; dir = null
    }
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (dir === null) {
        if (Math.abs(dx) > Math.abs(dy) + 5)      dir = 'h'
        else if (Math.abs(dy) > Math.abs(dx) + 5) dir = 'v'
      }
      if (dir === 'h') { e.preventDefault(); e.stopPropagation() }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (dir !== 'h') return
      e.stopPropagation() // prevent story navigation from firing
      const dx = e.changedTouches[0].clientX - startX
      if (dx < -50) goNext(); else if (dx > 50) goPrev()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [goNext, goPrev])

  // ── PC mouse drag ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = swipeRef.current
    if (!el) return
    let startX = 0, dragging = false, hasMoved = false

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if ((e.target as Element).closest('button')) return
      startX = e.clientX; dragging = true; hasMoved = false
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerType !== 'mouse') return
      if (Math.abs(e.clientX - startX) > 6) hasMoved = true
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging || e.pointerType !== 'mouse') return
      dragging = false; el.style.cursor = ''
      if (!hasMoved) return
      const dx = e.clientX - startX
      if (dx < -40) goNext(); else if (dx > 40) goPrev()
    }
    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dragging = false; el.style.cursor = ''
    }

    el.addEventListener('pointerdown',   onPointerDown)
    el.addEventListener('pointermove',   onPointerMove)
    el.addEventListener('pointerup',     onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)
    return () => {
      el.removeEventListener('pointerdown',   onPointerDown)
      el.removeEventListener('pointermove',   onPointerMove)
      el.removeEventListener('pointerup',     onPointerUp)
      el.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [goNext, goPrev])

  // ── Derived ───────────────────────────────────────────────────────────
  const showKorean = prefs.language !== 'en'
  const patternMeaning = resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)
  const globalPatternNum = (story.id - 1) * patterns.length + patIdx + 1
  const totalPatterns = story.id * patterns.length

  // Hero gradient theme
  const heroBg = isDark
    ? 'linear-gradient(160deg, #3a2858 0%, #2a3050 54%, #351828 100%)'
    : 'transparent'
  const heroPatternColor = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const heroMeaningColor = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const heroIconColor    = isDark ? 'rgba(255,255,255,0.60)' : '#8EA7FF'

  // Dot indicator colors
  const dotActive   = isDark ? 'rgba(255,255,255,0.70)' : '#8EA7FF'
  const dotInactive = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(142,167,255,0.2)'

  // Hide-recall: tap card to reveal current pattern
  function handleRecallReveal() {
    if (!hideRecallMode) return
    const next = new Set(recallRevealed).add(patIdx)
    setRecallRevealed(next)
    // If this is the last card and now revealed → round complete
    if (patIdx === patterns.length - 1) {
      setTimeout(() => onRecallRoundComplete?.(), 600)
    }
  }

  function handleBookmark() {
    const next = toggleBookmark({
      patternId: pattern.id, pattern: pattern.pattern,
      meaningKo: pattern.meaningKo, storyId: story.id,
    })
    setBookmarked(next)
  }

  // Pattern note
  const patternNote = pattern.explanation ?? PATTERN_NOTES[pattern.id] ?? null

  // Card colors
  const cardBg       = isDark ? 'rgba(30,28,48,0.85)'    : '#FFFFFF'
  const exBoxBg      = isDark ? 'rgba(255,255,255,0.04)' : '#F6F7FB'
  const exBoxBorder  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(142,167,255,0.14)'
  const exEnColor    = isDark ? 'rgba(255,255,255,0.90)' : '#1a1a2e'
  const exKoColor    = isDark ? 'rgba(255,255,255,0.45)' : '#9a9ab0'

  const isCurrentRevealed = recallRevealed.has(patIdx)

  return (
    <div style={{ padding: '0 16px' }}>

      {/* ── Swipe guide (1회차 첫 진입) ─────────────────────────────────── */}
      {showSwipeGuide && !hideRecallMode && (
        <div style={{
          textAlign: 'center', marginBottom: 8,
          fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.45)' : '#8EA7FF',
          letterSpacing: '0.02em',
        }}>
          👆 스와이프해서 패턴을 확인하세요
        </div>
      )}

      {/* ── Hide-recall round indicator ──────────────────────────────────── */}
      {hideRecallMode && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#8EA7FF', fontWeight: 600 }}>
            Round {recallRound}/{totalRecallRounds}
          </span>
          <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.35)' : '#9a9ab0' }}>
            떠올랐으면 탭해서 확인하세요
          </span>
        </div>
      )}

      {/* ── Swipeable card ─────────────────────────────────────────────── */}
      <div ref={swipeRef} style={{ paddingTop: 4 }}>
        <div
          onClick={hideRecallMode && !isCurrentRevealed ? handleRecallReveal : undefined}
          style={{
            overflow: 'hidden', borderRadius: 18, padding: 0,
            background: cardBg,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(142,167,255,0.25)',
            boxShadow: isDark
              ? '0 16px 40px rgba(0,0,0,0.40)'
              : '0 -3px 16px rgba(142,167,255,0.12), 0 4px 12px rgba(142,167,255,0.08)',
            cursor: hideRecallMode && !isCurrentRevealed ? 'pointer' : 'default',
          }}
        >
          {/* Card hero header */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '12px 16px 16px',
            background: heroBg,
          }}>
            {/* Top row: PATTERN num | dots | bookmark */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              {/* PATTERN label — left */}
              <p style={{
                margin: 0, fontSize: '0.57rem', fontWeight: 700, color: heroIconColor,
                letterSpacing: '0.06em', flexShrink: 0,
                fontFamily: '"SF Mono", "Fira Mono", monospace',
              }}>
                PATTERN {String(globalPatternNum).padStart(3, '0')}
              </p>

              {/* Dot indicators — center */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                {patterns.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`패턴 ${i + 1}`}
                    onClick={() => navigateTo(i)}
                    style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
                  >
                    <span style={{
                      display: 'block',
                      width: i === patIdx ? 16 : 5,
                      height: 5,
                      borderRadius: 999,
                      background: i === patIdx ? dotActive : dotInactive,
                      transition: 'all 0.25s',
                    }} />
                  </button>
                ))}
              </div>

              {/* Bookmark — right */}
              <button
                type="button"
                onClick={handleBookmark}
                aria-label={bookmarked ? '북마크 해제' : '북마크'}
                style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer', flexShrink: 0,
                  color: bookmarked ? isDark ? '#8FABFF' : '#8EA7FF' : heroIconColor,
                  transition: 'color 0.15s',
                }}
              >
                <Bookmark
                  style={{ width: 15, height: 15 }} strokeWidth={1.8}
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Pattern expression */}
            {hideRecallMode && !isCurrentRevealed ? (
              <div style={{
                fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: '0 0 6px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  flex: 1, height: 36, borderRadius: 8,
                  background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(142,167,255,0.15)',
                  display: 'block',
                }} />
                <span style={{
                  fontSize: 11, color: isDark ? 'rgba(255,255,255,0.40)' : '#8EA7FF',
                  fontWeight: 500, flexShrink: 0, letterSpacing: '0.02em',
                }}>
                  탭하여 확인
                </span>
              </div>
            ) : (
              <p style={{
                fontSize: 32, fontWeight: 800, color: heroPatternColor,
                lineHeight: 1.2, margin: '0 0 6px', letterSpacing: '-0.5px',
                fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                transition: 'opacity 0.2s',
              }}>
                {pattern.pattern}
              </p>
            )}

            {/* Divider */}
            <div style={{
              width: 28, height: 2, borderRadius: 2, margin: '6px 0 10px',
              background: isDark ? 'rgba(255,255,255,0.25)' : '#8EA7FF',
            }} />

            {/* Meaning + audio */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {patternMeaning ? (
                <p style={{
                  fontSize: 13, fontWeight: 600, color: heroMeaningColor,
                  margin: 0, flex: 1, paddingRight: 8, lineHeight: 1.4,
                }}>
                  {patternMeaning}
                </p>
              ) : <div />}
              <button
                type="button"
                onClick={playExamples}
                aria-label={isPlaying ? '정지' : '예문 듣기'}
                style={{
                  background: 'none', border: 'none', padding: 6, cursor: 'pointer',
                  color: isPlaying ? isDark ? '#8FABFF' : '#8EA7FF' : heroIconColor,
                  transition: 'color 0.15s', flexShrink: 0,
                }}
              >
                {isPlaying
                  ? <Square style={{ width: 11, height: 11 }} fill="currentColor" strokeWidth={0} />
                  : <Volume2 style={{ width: 17, height: 17 }} strokeWidth={1.6} />}
              </button>
            </div>
          </div>

          {/* Card body — examples in a box */}
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{
              borderRadius: 12,
              background: exBoxBg,
              border: `1px solid ${exBoxBorder}`,
              padding: '12px 14px',
            }}>
              {examples.map((ex, i) => {
                const isExPlaying = isPlaying && i === exIdx
                const fullEx = patternExamplesFull[pattern.id]?.[i]
                const safeCandidates = (fullEx?.en === ex.en) ? fullEx?.saveCandidates : undefined
                const exKo = resolveTranslation(ex.ko, prefs.language, ex.translations)
                return (
                  <div
                    key={i}
                    style={{
                      borderTop: i > 0 ? `1px solid ${exBoxBorder}` : 'none',
                      paddingTop: i > 0 ? 12 : 0,
                      paddingBottom: i < examples.length - 1 ? 12 : 0,
                    }}
                  >
                    <TappableWordText
                      text={ex.en}
                      saveCandidates={safeCandidates}
                      source={{
                        sourceType:       'example',
                        sourceId:         `${pattern.id}-ex${i + 1}`,
                        patternId:        pattern.id,
                        storyId:          story.id,
                        exampleIndex:     i,
                        originalSentence: ex.en,
                      }}
                      style={{
                        display:     'block',
                        fontSize:    14,
                        fontWeight:  isExPlaying ? 700 : 400,
                        color:       exEnColor,
                        lineHeight:  1.55,
                        marginBottom: 2,
                      }}
                    />
                    {showKorean && exKo && (
                      <p style={{ fontSize: 12, color: exKoColor, margin: 0, lineHeight: 1.5 }}>
                        {exKo}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pattern note */}
            {patternNote && (
              <div style={{
                marginTop: 10,
                borderRadius: 8,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(142,167,255,0.08)',
                padding: '10px 12px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <Lightbulb style={{ width: 13, height: 13, color: isDark ? '#8FABFF' : '#8EA7FF', flexShrink: 0, marginTop: 1 }} strokeWidth={1.8} />
                <p style={{ margin: 0, fontSize: 11, color: isDark ? 'rgba(255,255,255,0.50)' : '#5a5a7a', lineHeight: 1.5 }}>
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
