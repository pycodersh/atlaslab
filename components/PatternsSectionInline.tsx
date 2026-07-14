'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Bookmark, Info, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'
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
import { useTrainerSafe } from '@/contexts/TrainerContext'

const EXAMPLE_PAUSE_MS = 1800
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 }
const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 500

// Per-pattern background accent colors
const PATTERN_ACCENT = [
  'rgba(107,143,255,0.06)',
  'rgba(184,168,240,0.08)',
  'rgba(107,143,255,0.06)',
  'rgba(184,168,240,0.08)',
  'rgba(215,181,109,0.06)',
]

type Props = {
  story: MagazineStory
  patternExamples?: Record<string, PracticeExample[]>
  storyIsSpeaking?: boolean
  showNavButtons?: boolean
  showSwipeGuide?: boolean
  showSpeakerButton?: boolean
  onAllPatternsSeen?: () => void
  hideRecallMode?: boolean
  recallRound?: number
  totalRecallRounds?: number
  onRecallRoundComplete?: () => void
  onPatternIndexChange?: (idx: number) => void
  // Trainer audio flow callbacks
  onRegisterPlay?:        (fn: (() => void) | null) => void
  onRegisterGoNext?:      (fn: (() => void) | null) => void
  onRegisterRevealOnly?:  (fn: (() => void) | null) => void
  onPlayingChange?:       (playing: boolean) => void
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
  showSpeakerButton = false,
  onAllPatternsSeen,
  hideRecallMode = false,
  recallRound = 1,
  totalRecallRounds = 3,
  onRecallRoundComplete,
  onPatternIndexChange,
  onRegisterPlay,
  onRegisterGoNext,
  onRegisterRevealOnly,
  onPlayingChange,
}: Props) {
  const { prefs } = usePreferences()
  const { theme } = useTheme()
  const isDark  = theme === 'dark'
  const trainer = useTrainerSafe()
  const voice = story.narratorVoice ?? prefs.voice
  const patterns = story.patterns

  // MD+ breakpoint detection for PC nav buttons
  const [isMdUp, setIsMdUp] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsMdUp(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMdUp(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── Core state ────────────────────────────────────────────────────────
  const [studyMode, setStudyMode]         = useState<'en' | 'en-ko' | 'ko'>('en-ko')
  const [patIdx, setPatIdx]               = useState(0)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [exIdx, setExIdx]                 = useState(0)
  const [bookmarked, setBookmarked]       = useState(false)
  const [recallRevealed, setRecallRevealed] = useState<Set<number>>(new Set())
  const allSeenFiredRef                   = useRef(false)

  // ── Swipe card state ──────────────────────────────────────────────────
  const [patHistory, setPatHistory]       = useState<number[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const animatingRef                      = useRef(false)
  const patHistoryRef                     = useRef<number[]>([])

  // ── Motion values ─────────────────────────────────────────────────────
  const cardX      = useMotionValue(0)
  const cardRotate = useTransform(cardX, [-200, 200], [-8, 8])

  // ── Refs ──────────────────────────────────────────────────────────────
  const patIdxRef    = useRef(0)
  const runningRef   = useRef(false)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playTokenRef = useRef(0)
  const startedAtRef = useRef(0)

  const pattern  = patterns[patIdx]
  const examples = resolveExamples(
    patternExamples, pattern.id,
    pattern.storySentence, pattern.storySentenceKo,
    pattern.variationSentence, pattern.variationSentenceKo,
  ).slice(0, 3)

  // Keep history ref in sync
  useEffect(() => { patHistoryRef.current = patHistory }, [patHistory])

  useEffect(() => { setBookmarked(isBookmarked(pattern.id)) }, [pattern.id])

  // Reset recall state on new round
  useEffect(() => {
    if (hideRecallMode) {
      setRecallRevealed(new Set())
      setPatIdx(0)
      patIdxRef.current = 0
      cardX.set(0)
      setPatHistory([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideRecallMode, recallRound])

  // Report pattern index change to parent
  useEffect(() => {
    if (!hideRecallMode) onPatternIndexChange?.(patIdx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patIdx, hideRecallMode])

  // Fire onAllPatternsSeen when last card reached
  useEffect(() => {
    if (!hideRecallMode && !allSeenFiredRef.current && patIdx === patterns.length - 1) {
      allSeenFiredRef.current = true
      onAllPatternsSeen?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patIdx, hideRecallMode, patterns.length])

  useEffect(() => {
    if (!hideRecallMode) allSeenFiredRef.current = false
  }, [hideRecallMode])

  // Stop audio when story speaks
  useEffect(() => {
    if (storyIsSpeaking && isPlaying) {
      playTokenRef.current++
      runningRef.current = false
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      setIsPlaying(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIsSpeaking])

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
      if (!ex) { runningRef.current = false; setIsPlaying(false); return }
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
        onError: () => { if (playTokenRef.current !== token) return; runningRef.current = false; setIsPlaying(false) },
      })
    }
    playOne(0)
  }, [isPlaying, stop, patterns, patternExamples, voice, prefs.speechRate, story.id, story.title])

  // ── Navigation (internal state only, no animation) ────────────────────
  const navigateTo = useCallback((idx: number) => {
    stop()
    setPatIdx(idx)
    patIdxRef.current = idx
    setExIdx(0)
  }, [stop])

  // ── Animated swipe navigation ─────────────────────────────────────────
  const goNextPattern = useCallback(async () => {
    const cur = patIdxRef.current
    if (cur >= patterns.length - 1 || animatingRef.current) return
    animatingRef.current = true
    setIsTransitioning(true)
    stop()
    setPatHistory(prev => [...prev, cur])
    await animate(cardX, -420, SPRING)
    cardX.set(420)
    setIsTransitioning(false)
    navigateTo(cur + 1)
    animate(cardX, 0, SPRING).then(() => { animatingRef.current = false })
  }, [patterns.length, stop, navigateTo, cardX])

  const goPrevPattern = useCallback(async () => {
    if (animatingRef.current) return
    if (patHistoryRef.current.length === 0) {
      // Resistance bounce at first card
      const snap = Math.min(cardX.get() * 0.25 + 28, 36)
      await animate(cardX, snap, { type: 'spring', stiffness: 600, damping: 22 })
      animate(cardX, 0, SPRING)
      return
    }
    animatingRef.current = true
    setIsTransitioning(true)
    stop()
    const prev = patHistoryRef.current[patHistoryRef.current.length - 1]
    setPatHistory(h => h.slice(0, -1))
    await animate(cardX, 420, SPRING)
    cardX.set(-420)
    setIsTransitioning(false)
    navigateTo(prev)
    animate(cardX, 0, SPRING).then(() => { animatingRef.current = false })
  }, [stop, navigateTo, cardX])

  // ── Trainer audio flow callbacks ──────────────────────────────────────
  useEffect(() => {
    onRegisterPlay?.(playExamples)
  }, [playExamples, onRegisterPlay])

  useEffect(() => {
    onRegisterGoNext?.(goNextPattern)
  }, [goNextPattern, onRegisterGoNext])

  const revealOnly = useCallback(() => {
    setRecallRevealed(prev => new Set(prev).add(patIdxRef.current))
  }, [])

  useEffect(() => {
    onRegisterRevealOnly?.(revealOnly)
  }, [revealOnly, onRegisterRevealOnly])

  useEffect(() => {
    onPlayingChange?.(isPlaying)
  }, [isPlaying, onPlayingChange])

  // ── Drag handling ─────────────────────────────────────────────────────
  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const { offset, velocity } = info
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      goNextPattern()
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      goPrevPattern()
    } else {
      animate(cardX, 0, SPRING)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────
  const showKorean        = prefs.language !== 'en' && (studyMode === 'en-ko' || studyMode === 'ko')
  const showEnglish       = studyMode === 'en' || studyMode === 'en-ko'
  const patternMeaning    = resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)
  const globalPatternNum  = (story.id - 1) * patterns.length + patIdx + 1
  const isCurrentRevealed = recallRevealed.has(patIdx)

  // Colors
  const heroBg          = isDark ? 'linear-gradient(160deg, #3a2858 0%, #2a3050 54%, #351828 100%)' : 'transparent'
  const heroPatternColor = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const heroMeaningColor = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const heroIconColor    = isDark ? 'rgba(255,255,255,0.60)' : '#8EA7FF'
  const dotActive        = isDark ? '#8FABFF'                : '#6B8FFF'
  const dotInactive      = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(142,167,255,0.22)'
  const cardBg           = isDark ? 'rgba(30,28,48,0.85)'    : 'rgba(255,255,255,0.75)'
  const cardBackdrop     = 'blur(20px)'
  const exBoxBg          = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,143,255,0.05)'
  const exBoxBorder      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,143,255,0.18)'
  const exEnColor        = isDark ? 'rgba(255,255,255,0.90)' : '#1a1a2e'
  const exKoColor        = isDark ? 'rgba(255,255,255,0.45)' : '#8a8aaa'
  const cardBorder       = isDark ? '1px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(142,167,255,0.25)'
  const cardShadow       = isDark
    ? '0 16px 40px rgba(0,0,0,0.40)'
    : '0 -3px 16px rgba(142,167,255,0.12), 0 8px 24px rgba(142,167,255,0.10)'
  const noteNoteBg     = isDark ? 'rgba(215,181,109,0.06)' : 'rgba(215,181,109,0.07)'
  const noteNoteBorder = isDark ? 'rgba(215,181,109,0.18)' : 'rgba(215,181,109,0.28)'

  // Pattern note
  const patternNote = pattern.explanation ?? PATTERN_NOTES[pattern.id] ?? null

  // ── Recall handlers ───────────────────────────────────────────────────
  function handleRecallReveal() {
    if (!hideRecallMode) return
    const next = new Set(recallRevealed).add(patIdx)
    setRecallRevealed(next)
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
    trainer?.showMessage(next ? 'Added.' : 'Removed.', 1800)
  }

  // ── Card content (shared between stack preview and main) ──────────────
  const cardContent = (
    <>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 16px 16px', background: heroBg }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <p style={{
            margin: 0, fontSize: 8, fontWeight: 700, color: '#8EA7FF',
            letterSpacing: '0.10em', flexShrink: 0,
            fontFamily: '"SF Mono", "Fira Mono", monospace',
          }}>
            PATTERN {String(globalPatternNum).padStart(3, '0')}
          </p>

          {/* Dot indicators */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            {patterns.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`패턴 ${i + 1}`}
                onClick={() => {
                  if (animatingRef.current) return
                  const dir = i > patIdx ? 'next' : 'prev'
                  if (dir === 'next') {
                    setPatHistory(prev => [...prev, patIdx])
                    setIsTransitioning(true)
                    animatingRef.current = true
                    stop()
                    animate(cardX, -420, SPRING).then(() => {
                      cardX.set(420)
                      setIsTransitioning(false)
                      navigateTo(i)
                      animate(cardX, 0, SPRING).then(() => { animatingRef.current = false })
                    })
                  } else if (i < patIdx) {
                    setIsTransitioning(true)
                    animatingRef.current = true
                    stop()
                    // trim history to not include i and everything after
                    setPatHistory(prev => prev.filter(h => h < i))
                    animate(cardX, 420, SPRING).then(() => {
                      cardX.set(-420)
                      setIsTransitioning(false)
                      navigateTo(i)
                      animate(cardX, 0, SPRING).then(() => { animatingRef.current = false })
                    })
                  }
                }}
                style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
              >
                <motion.span
                  animate={{
                    width: i === patIdx ? 16 : 4,
                    background: i === patIdx ? dotActive : dotInactive,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  style={{ display: 'block', height: 5, borderRadius: 999 }}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleBookmark}
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

        {/* Pattern */}
        {hideRecallMode && !isCurrentRevealed ? (
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
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
            fontSize: 28, fontWeight: 700, color: heroPatternColor,
            lineHeight: 1.25, margin: '0 0 6px', letterSpacing: '-0.3px',
            fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
          }}>
            {pattern.pattern}
          </p>
        )}

        <div style={{
          width: 36, height: 3, borderRadius: 2, margin: '6px 0 10px',
          background: 'linear-gradient(90deg, #6B8FFF, #B8A8F0)',
          opacity: isDark ? 0.7 : 1,
        }} />

        {patternMeaning && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <p style={{ fontSize: 13, fontWeight: 400, color: heroMeaningColor, margin: 0, lineHeight: 1.4 }}>
              {patternMeaning}
            </p>
            {showSpeakerButton && (
              <button
                type="button"
                aria-label="예문 듣기"
                onClick={playExamples}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: isPlaying ? (isDark ? '#8FABFF' : '#8EA7FF') : (isDark ? 'rgba(255,255,255,0.35)' : '#b0b8cc'),
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                  transition: 'color 0.15s',
                }}
              >
                <Volume2 style={{ width: 16, height: 16 }} strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Examples */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Language toggle — right-aligned, above examples */}
        {prefs.language !== 'en' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <div style={{ display: 'inline-flex', borderRadius: 10, background: 'var(--pc)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--pd)', padding: 2 }}>
              {(['en', 'en-ko', 'ko'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStudyMode(mode)}
                  style={{
                    padding: '4px 9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                    background: studyMode === mode ? 'var(--pw)' : 'transparent',
                    color: studyMode === mode ? 'var(--pt)' : 'var(--pm)',
                    boxShadow: studyMode === mode ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                    transition: 'background 0.18s, color 0.15s',
                  }}
                >
                  {mode === 'en' ? 'EN' : mode === 'en-ko' ? 'EN·KO' : 'KO'}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ borderRadius: 12, background: exBoxBg, border: `1px solid ${exBoxBorder}`, padding: '12px 14px' }}>
          {examples.map((ex, i) => {
            const isExPlaying = isPlaying && i === exIdx
            const fullEx = patternExamplesFull[pattern.id]?.[i]
            const safeCandidates = (fullEx?.en === ex.en) ? fullEx?.saveCandidates : undefined
            const exKo = resolveTranslation(ex.ko, prefs.language, ex.translations)
            return (
              <div key={i} style={{ borderTop: i > 0 ? `1px solid ${exBoxBorder}` : 'none', paddingTop: i > 0 ? 12 : 0, paddingBottom: i < examples.length - 1 ? 12 : 0 }}>
                <div style={{ opacity: showEnglish ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showEnglish ? 'auto' : 'none' }}>
                  <TappableWordText
                    text={ex.en}
                    saveCandidates={safeCandidates}
                    source={{ sourceType: 'example', sourceId: `${pattern.id}-ex${i + 1}`, patternId: pattern.id, storyId: story.id, exampleIndex: i, originalSentence: ex.en }}
                    style={{ display: 'block', fontSize: 16, fontWeight: isExPlaying ? 600 : 400, color: exEnColor, lineHeight: 1.5, marginBottom: 2 }}
                  />
                </div>
                {showKorean && exKo && (
                  <p style={{ fontSize: 13, color: exKoColor, margin: 0, lineHeight: 1.5 }}>{exKo}</p>
                )}
              </div>
            )
          })}
        </div>

        {patternNote && (
          <div style={{ marginTop: 10, borderRadius: 8, background: noteNoteBg, border: `0.5px solid ${noteNoteBorder}`, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Info style={{ width: 13, height: 13, color: '#D7B56D', flexShrink: 0, marginTop: 1 }} strokeWidth={1.8} />
            <p style={{ margin: 0, fontSize: 13, color: isDark ? 'rgba(255,255,255,0.55)' : '#6a5a40', lineHeight: 1.6 }}>{patternNote}</p>
          </div>
        )}
      </div>
    </>
  )

  // ── Stack depth styles ────────────────────────────────────────────────
  const stackBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(142,167,255,0.18)'
  const stackShadow = isDark ? '0 8px 24px rgba(0,0,0,0.30)' : '0 4px 16px rgba(142,167,255,0.10)'

  const accentBg = PATTERN_ACCENT[patIdx % PATTERN_ACCENT.length]

  return (
    <div style={{ padding: isMdUp ? '0 70px' : '0 16px' }}>


      {/* Hide-recall round indicator */}
      {hideRecallMode && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#8EA7FF', fontWeight: 600 }}>
            Round {recallRound}/{totalRecallRounds}
          </span>
          <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.35)' : '#9a9ab0' }}>
            떠올랐으면 탭해서 확인하세요
          </span>
        </div>
      )}


      {/* ── Card stack container ─────────────────────────────────────── */}
      <motion.div
        animate={{ backgroundColor: accentBg }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', borderRadius: 22, paddingBottom: 20 }}
      >

        {/* Stack card: depth 2 (furthest back) */}
        {patIdx + 2 < patterns.length && (
          <motion.div
            key="stack-2"
            animate={isTransitioning
              ? { scale: 0.925, y: 12, opacity: 0.55 }
              : { scale: 0.90,  y: 16, opacity: 0.4  }
            }
            transition={SPRING}
            style={{
              position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
              borderRadius: 18, background: cardBg, border: stackBorder,
              boxShadow: stackShadow, zIndex: 1,
            }}
          />
        )}

        {/* Stack card: depth 1 */}
        {patIdx + 1 < patterns.length && (
          <motion.div
            key="stack-1"
            animate={isTransitioning
              ? { scale: 0.975, y: 4, opacity: 0.85 }
              : { scale: 0.95,  y: 8, opacity: 0.7  }
            }
            transition={SPRING}
            style={{
              position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
              borderRadius: 18, background: cardBg, border: stackBorder,
              boxShadow: stackShadow, zIndex: 2,
            }}
          />
        )}

        {/* ── Draggable main card ──────────────────────────────────────── */}
        <motion.div
          style={{
            x: cardX,
            rotate: cardRotate,
            position: 'relative', zIndex: 10,
            overflow: 'hidden', borderRadius: 18,
            background: cardBg,
            backdropFilter: cardBackdrop,
            WebkitBackdropFilter: cardBackdrop,
            border: cardBorder,
            boxShadow: cardShadow,
            touchAction: 'pan-y',
            cursor: hideRecallMode && !isCurrentRevealed ? 'pointer' : 'grab',
          }}
          drag="x"
          dragMomentum={false}
          whileDrag={{ cursor: 'grabbing' }}
          onDragEnd={handleDragEnd}
          onClick={hideRecallMode && !isCurrentRevealed ? handleRecallReveal : undefined}
        >
          {cardContent}
        </motion.div>

        {/* PC nav buttons — shown on md+ screens */}
        {isMdUp && (
          <>
            <button
              type="button"
              aria-label="이전 패턴"
              onClick={goPrevPattern}
              style={{
                position: 'absolute', left: -54, top: '50%', transform: 'translateY(-50%)',
                zIndex: 20, width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(107,143,255,0.2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B8FFF',
                opacity: patHistory.length > 0 ? 1 : 0.3,
                transition: 'opacity 0.2s, background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,143,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.8)')}
            >
              <ChevronLeft style={{ width: 18, height: 18 }} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="다음 패턴"
              onClick={goNextPattern}
              style={{
                position: 'absolute', right: -54, top: '50%', transform: 'translateY(-50%)',
                zIndex: 20, width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(107,143,255,0.2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B8FFF',
                opacity: patIdx < patterns.length - 1 ? 1 : 0.3,
                transition: 'opacity 0.2s, background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,143,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.8)')}
            >
              <ChevronRight style={{ width: 18, height: 18 }} strokeWidth={2} />
            </button>
          </>
        )}
      </motion.div>

    </div>
  )
}
