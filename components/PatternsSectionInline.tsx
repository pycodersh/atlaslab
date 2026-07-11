'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Square, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
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
    : 'linear-gradient(160deg, #c8b8e8 0%, #d4b8d8 54%, #b8c8e0 100%)'
  const heroBorderColor = isDark ? 'rgba(120,90,180,0.30)' : 'rgba(180,160,215,0.28)'
  const heroPatternColor = isDark ? 'rgba(255,255,255,0.97)' : 'rgba(25,15,55,0.92)'
  const heroMeaningColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(25,15,55,0.62)'
  const heroIconColor    = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(25,15,55,0.52)'

  // Dot indicator colors
  const dotActive   = isDark ? 'rgba(255,255,255,0.70)' : 'var(--pa)'
  const dotInactive = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(142,167,255,0.25)'

  function handleBookmark() {
    const next = toggleBookmark({
      patternId: pattern.id, pattern: pattern.pattern,
      meaningKo: pattern.meaningKo, storyId: story.id,
    })
    setBookmarked(next)
  }

  return (
    <div style={{ padding: '0 16px' }}>

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div style={{ padding: '28px 0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.20em',
            color: 'var(--pa)', margin: '0 0 3px', textTransform: 'uppercase',
          }}>
            Today&apos;s Patterns
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, fontWeight: 500 }}>
            Patterns from this story
          </p>
        </div>
        <p style={{
          fontSize: 11, fontWeight: 600, color: 'var(--pm2)',
          margin: 0, letterSpacing: '0.04em',
          fontFamily: '"SF Mono", "Fira Mono", monospace',
        }}>
          {patIdx + 1} / {patterns.length}
        </p>
      </div>

      {/* ── Swipeable card ─────────────────────────────────────────────── */}
      <div ref={swipeRef}>
        <div
          className="glass-card"
          style={{
            overflow: 'hidden', borderRadius: 24, padding: 0,
            boxShadow: isDark
              ? '0 16px 40px rgba(0,0,0,0.40)'
              : '0 16px 40px rgba(40,40,60,0.06)',
          }}
        >
          {/* Card hero header */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '16px 18px 18px',
            background: heroBg,
            borderBottom: `1px solid ${heroBorderColor}`,
          }}>
            {/* Row 1: pattern number (left) + bookmark (right) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{
                fontSize: '0.58rem', fontWeight: 700, color: heroIconColor,
                letterSpacing: '0.06em',
                fontFamily: '"SF Mono", "Fira Mono", monospace',
              }}>
                PATTERN {String(globalPatternNum).padStart(3, '0')} / {totalPatterns}
              </span>
              <button
                type="button"
                onClick={handleBookmark}
                aria-label={bookmarked ? '북마크 해제' : '북마크'}
                style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                  color: bookmarked ? '#8F234B' : heroIconColor,
                  transition: 'color 0.15s',
                }}
              >
                <Bookmark
                  style={{ width: 16, height: 16 }} strokeWidth={1.8}
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Pattern expression */}
            <p style={{
              fontSize: 32, fontWeight: 800, color: heroPatternColor,
              lineHeight: 1.2, margin: '0 0 6px', letterSpacing: '-0.5px',
              fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}>
              {pattern.pattern}
            </p>

            {/* Divider */}
            <div style={{
              width: 28, height: 2, borderRadius: 2, margin: '6px 0 10px',
              background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(60,40,100,0.25)',
            }} />

            {/* Row 3: meaning (left) + audio button (right) */}
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
                  color: isPlaying ? '#8F234B' : heroIconColor,
                  transition: 'color 0.15s',
                  flexShrink: 0,
                }}
              >
                {isPlaying
                  ? <Square style={{ width: 11, height: 11 }} fill="currentColor" strokeWidth={0} />
                  : <Volume2 style={{ width: 17, height: 17 }} strokeWidth={1.6} />}
              </button>
            </div>
          </div>

          {/* Card body — examples */}
          <div style={{ padding: '18px 20px 20px' }}>
            {examples.map((ex, i) => {
              const isExPlaying = isPlaying && i === exIdx
              const fullEx = patternExamplesFull[pattern.id]?.[i]
              const safeCandidates = (fullEx?.en === ex.en) ? fullEx?.saveCandidates : undefined
              const exKo = resolveTranslation(ex.ko, prefs.language, ex.translations)
              return (
                <div
                  key={i}
                  style={{
                    borderTop: i > 0 ? '1px solid var(--pd)' : 'none',
                    paddingTop: i > 0 ? 14 : 0,
                    paddingBottom: i < examples.length - 1 ? 14 : 0,
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
                      fontSize:    14.5,
                      fontWeight:  isExPlaying ? 700 : 400,
                      color:       'var(--pt)',
                      lineHeight:  1.55,
                      marginBottom: 2,
                    }}
                  />
                  {showKorean && exKo && (
                    <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, lineHeight: 1.5 }}>
                      {exKo}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Dot navigation ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 5, marginTop: 16, marginBottom: 8,
      }}>
        {showNavButtons && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous pattern"
            disabled={patIdx === 0}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid var(--pglass-border)',
              background: 'var(--pglass)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: patIdx === 0 ? 'default' : 'pointer',
              color: 'var(--pm)', marginRight: 6, flexShrink: 0,
              opacity: patIdx === 0 ? 0.3 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={2.2} />
          </button>
        )}

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
              width: i === patIdx ? 18 : 6,
              height: 6,
              borderRadius: 999,
              background: i === patIdx ? dotActive : dotInactive,
              transition: 'all 0.25s',
            }} />
          </button>
        ))}

        {showNavButtons && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next pattern"
            disabled={patIdx === patterns.length - 1}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid var(--pglass-border)',
              background: 'var(--pglass)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: patIdx === patterns.length - 1 ? 'default' : 'pointer',
              color: 'var(--pm)', marginLeft: 6, flexShrink: 0,
              opacity: patIdx === patterns.length - 1 ? 0.3 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  )
}
