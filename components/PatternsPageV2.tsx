'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Volume2, Square, Bookmark, Lightbulb, X,
} from 'lucide-react'

import type { MagazineStory } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { RATE_MAP } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, patternExampleAudioUrl } from '@/lib/tts'
import { recordPatternPractice } from '@/lib/srs/storage'
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks/storage'
import { PATTERN_NOTES } from '@/data/pattern-notes'
import { patternMeaningNoteTranslations } from '@/data/pattern-meaning-note-translations'
import { getPatternExamples } from '@/data/pattern-examples'
import { patternExamplesFull } from '@/data/pattern-examples-full'
import { shimmerExamples } from '@/data/shimmer-audio-meta'
import { TappableWordText } from '@/components/TappableWordText'
import { useT } from '@/hooks/useT'

// ── Timing constants ──────────────────────────────────────────────────────────
const EXAMPLE_PAUSE_MS = 1800

const DEV = process.env.NODE_ENV === 'development'

type Props = {
  story: MagazineStory
  totalStories: number
  onPrev: () => void
  onNext: () => void
  hasNext: boolean
  onOpenPicker: () => void
  patternExamples?: Record<string, PracticeExample[]>
}

type Phase     = 'idle' | 'speaking' | 'pause' | 'done'
type StudyMode = 'en' | 'en-ko' | 'ko'

const STUDY_CYCLE: StudyMode[] = ['en', 'en-ko', 'ko']
const STUDY_LABEL: Record<StudyMode, string> = {
  'en':    'EN',
  'en-ko': 'EN·KO',
  'ko':    'KO',
}

// ── Hero themes — Version A (Soft Burgundy) / Version B (Slate Blue) ─────────
// Alternates by story.id so odd stories = A, even stories = B
const HERO_THEMES = [
  {
    // Version A · Soft Burgundy — PATTO brand, editorial, premium
    bg: 'linear-gradient(160deg, #8B4555 0%, #B27B89 54%, #EDE2E5 100%)',
    wave1: 'rgba(255,255,255,0.08)',
    wave2: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(185,135,145,0.30)',
    patternColor: '#FFFFFF',
    patternShadow: '0 2px 16px rgba(65,10,18,0.38), 0 1px 4px rgba(0,0,0,0.18)',
    meaningColor: 'rgba(255,255,255,0.82)',
    labelColor: 'rgba(255,255,255,0.60)',
    iconColor: 'rgba(255,255,255,0.70)',
  },
  {
    // Version B · Slate Blue — Apple-style, clean, modern
    bg: 'linear-gradient(160deg, #5C6FAE 0%, #8294C8 54%, #DCE5F8 100%)',
    wave1: 'rgba(255,255,255,0.08)',
    wave2: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(140,165,215,0.32)',
    patternColor: '#FFFFFF',
    patternShadow: '0 2px 16px rgba(25,40,100,0.34), 0 1px 4px rgba(0,0,0,0.14)',
    meaningColor: 'rgba(255,255,255,0.82)',
    labelColor: 'rgba(255,255,255,0.60)',
    iconColor: 'rgba(255,255,255,0.70)',
  },
]

function WaveOverlay({ wave1, wave2 }: { wave1: string; wave2: string }) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
    >
      <path
        d="M0,60 C60,30 120,90 200,55 C280,20 340,80 400,50 L400,0 L0,0 Z"
        fill={wave1}
      />
      <path
        d="M0,85 C80,55 160,105 240,75 C320,45 370,90 400,70 L400,0 L0,0 Z"
        fill={wave2}
      />
    </svg>
  )
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

export function PatternsPageV2({
  story, totalStories, onPrev, onNext, hasNext, onOpenPicker, patternExamples,
}: Props) {
  const { prefs } = usePreferences()
  const t = useT()
  const voice = story.narratorVoice ?? prefs.voice
  const patterns = story.patterns

  // ── Core navigation state ─────────────────────────────────────────────────
  const [patIdx, setPatIdx] = useState(0)
  const [exIdx,  setExIdx]  = useState(0)
  const patIdxRef = useRef(0)
  const exIdxRef  = useRef(0)

  const pattern  = patterns[patIdx]
  const examples = resolveExamples(
    patternExamples, pattern.id,
    pattern.storySentence, pattern.storySentenceKo,
    pattern.variationSentence, pattern.variationSentenceKo,
  ).slice(0, 3)

  useEffect(() => { patIdxRef.current = patIdx }, [patIdx])
  useEffect(() => { exIdxRef.current  = exIdx  }, [exIdx])

  useEffect(() => {
    setPatIdx(0); setExIdx(0)
    patIdxRef.current = 0; exIdxRef.current = 0
    setRevealedExSet(new Set())
  }, [story.id])

  // ── Hero theme — A (Burgundy) for odd stories, B (Slate Blue) for even ──────
  const heroTheme = useMemo(
    () => HERO_THEMES[(story.id - 1) % 2],
    [story.id],
  )

  // ── UI state ───────────────────────────────────────────────────────────────
  const [studyMode,     setStudyMode]    = useState<StudyMode>('en-ko')
  const [bookmarked,    setBookmarked]   = useState(false)
  const [phase,         setPhase]        = useState<Phase>('idle')
  const [noteOpen,      setNoteOpen]     = useState(false)
  const [revealedExSet, setRevealedExSet] = useState<Set<string>>(new Set())

  function revealEx(p: number, e: number) {
    setRevealedExSet(prev => new Set([...prev, `${p}-${e}`]))
  }

  // done mask: patternId → Set<exIdx>
  const doneMasksRef = useRef<Record<string, Set<number>>>({})
  const [doneMask, setDoneMask] = useState<Set<number>>(new Set())

  useEffect(() => {
    setDoneMask(new Set(doneMasksRef.current[pattern.id] ?? []))
  }, [pattern.id])

  useEffect(() => {
    setBookmarked(isBookmarked(pattern.id))
  }, [pattern.id])

  // ── Playback refs ─────────────────────────────────────────────────────────
  const runningRef   = useRef(false)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)
  const studyModeRef = useRef(studyMode)

  useEffect(() => { studyModeRef.current = studyMode }, [studyMode])

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const stop = useCallback(() => {
    runningRef.current = false
    clearTimer()
    ttsProvider.stop()
    setPhase('idle')
  }, [])



  useEffect(() => () => { runningRef.current = false; clearTimer(); ttsProvider.stop() }, [])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const markDone = useCallback((p: number, e: number) => {
    const pat = patterns[p]
    if (!doneMasksRef.current[pat.id]) doneMasksRef.current[pat.id] = new Set()
    doneMasksRef.current[pat.id].add(e)
    if (p === patIdxRef.current) setDoneMask(new Set(doneMasksRef.current[pat.id]))
  }, [patterns])

  const navigateTo = useCallback((p: number, e: number, keepRunning = false) => {
    if (!keepRunning && runningRef.current) stop()
    setPatIdx(p); patIdxRef.current = p
    setExIdx(e);  exIdxRef.current  = e
    setDoneMask(new Set(doneMasksRef.current[patterns[p].id] ?? []))
  }, [stop, patterns])

  const goNext = useCallback(() => {
    const p = patIdxRef.current, e = exIdxRef.current
    const exLen = resolveExamples(
      patternExamples, patterns[p].id,
      patterns[p].storySentence, patterns[p].storySentenceKo,
      patterns[p].variationSentence, patterns[p].variationSentenceKo,
    ).length
    if (e < Math.min(exLen, 3) - 1)  navigateTo(p, e + 1)
    else if (p < patterns.length - 1) navigateTo(p + 1, 0)
    else if (hasNext)                  onNext()
  }, [patterns, patternExamples, navigateTo, hasNext, onNext])

  const goPrev = useCallback(() => {
    const p = patIdxRef.current, e = exIdxRef.current
    if (e > 0) {
      navigateTo(p, e - 1)
    } else if (p > 0) {
      const prev = patterns[p - 1]
      const prevLen = resolveExamples(
        patternExamples, prev.id,
        prev.storySentence, prev.storySentenceKo,
        prev.variationSentence, prev.variationSentenceKo,
      ).length
      navigateTo(p - 1, Math.min(prevLen, 3) - 1)
    } else {
      onPrev()
    }
  }, [patterns, patternExamples, navigateTo, onPrev])

  // ── Swipe ─────────────────────────────────────────────────────────────────
  const swipeRef    = useRef<HTMLDivElement>(null)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const swipeDir    = useRef<'h' | 'v' | null>(null)

  useEffect(() => {
    const el = swipeRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => {
      swipeStartX.current = e.touches[0].clientX
      swipeStartY.current = e.touches[0].clientY
      swipeDir.current = null
    }
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - swipeStartX.current
      const dy = e.touches[0].clientY - swipeStartY.current
      if (swipeDir.current === null) {
        if (Math.abs(dx) > Math.abs(dy) + 5)      swipeDir.current = 'h'
        else if (Math.abs(dy) > Math.abs(dx) + 5) swipeDir.current = 'v'
        else return
      }
      if (swipeDir.current === 'h') { e.preventDefault(); e.stopPropagation() }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (swipeDir.current !== 'h') return
      const dx = e.changedTouches[0].clientX - swipeStartX.current
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

  // ── Play current pattern's examples sequentially ──────────────────────────
  const playPatternExamples = useCallback(() => {
    if (phase === 'speaking' || phase === 'pause') { stop(); return }

    const pat = patterns[patIdxRef.current]
    const exs = resolveExamples(
      patternExamples, pat.id,
      pat.storySentence, pat.storySentenceKo,
      pat.variationSentence, pat.variationSentenceKo,
    ).slice(0, 3)

    runningRef.current = true
    startedAtRef.current = Date.now()

    function playOne(idx: number) {
      if (!runningRef.current) return
      const ex = exs[idx]
      if (!ex) { runningRef.current = false; setPhase('idle'); return }

      navigateTo(patIdxRef.current, idx, true)
      if (DEV) console.log('[PatternsV2] playPatternExamples', pat.id, 'ex', idx)

      setPhase('speaking')
      const shimmerEx = shimmerExamples[`${pat.id}-ex${idx + 1}`]
      const url       = shimmerEx?.url ?? patternExampleAudioUrl(voice, pat.id, idx, ex.en)
      ttsProvider.speak({
        texts: [ex.en], audioUrls: url ? [url] : undefined,
        voiceKey: voice, voiceKeys: [voice],
        rate: RATE_MAP[prefs.speechRate], pitch: getPitchForKey(voice), volume: 1.0,
        onEnd: () => {
          if (!runningRef.current) return
          markDone(patIdxRef.current, idx)
          if (idx + 1 < exs.length) {
            setPhase('pause')
            timerRef.current = setTimeout(() => playOne(idx + 1), EXAMPLE_PAUSE_MS)
          } else {
            const dur = Date.now() - startedAtRef.current
            recordPatternPractice(pat.id, story.id, pat.pattern, story.title, dur)
            runningRef.current = false
            setPhase('idle')
          }
        },
        onError: () => { runningRef.current = false; setPhase('idle') },
      })
    }

    playOne(exIdxRef.current)
  }, [phase, stop, patterns, patternExamples, voice, prefs.speechRate, markDone, navigateTo, story.id, story.title])

  const isPlaying = phase === 'speaking' || phase === 'pause'


  // ── Bookmark ───────────────────────────────────────────────────────────────
  function handleBookmark() {
    const next = toggleBookmark({
      patternId: pattern.id, pattern: pattern.pattern,
      meaningKo: pattern.meaningKo, storyId: story.id,
    })
    setBookmarked(next)
  }

  // ── Pattern note ───────────────────────────────────────────────────────────
  const koNote = pattern.explanation ?? PATTERN_NOTES[pattern.id] ?? null
  const noteEntry = patternMeaningNoteTranslations.find(n => n.patternId === pattern.id)
  const patternNote = (() => {
    if (prefs.language === 'ko') return koNote
    if (!noteEntry?.noteTranslations) return koNote
    const mapped = prefs.language === 'zh-cn' ? 'zh-CN' : prefs.language === 'zh-tw' ? 'zh-TW' : prefs.language
    return noteEntry.noteTranslations[mapped as keyof typeof noteEntry.noteTranslations]
      ?? noteEntry.noteTranslations['en'] ?? koNote
  })()

  // ── Derived display state ─────────────────────────────────────────────────
  const showKorean  = studyMode === 'en-ko' || studyMode === 'ko'
  const patternMeaning = resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)

  // Global pattern number (1–500)
  const globalPatternNum = (story.id - 1) * patterns.length + patIdx + 1
  const totalPatterns = totalStories * patterns.length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col" style={{ background: 'transparent' }}>
      <div
        className="flex-1 overflow-x-hidden"
        style={{
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch' as never,
          touchAction: 'pan-y',
        }}
      >
        <div style={{ padding: '0 16px 0' }}>

          {/* ── Top spacer ── */}
          <div style={{ paddingTop: 8 }} />

          {/* ── Swipe area ── */}
          <div ref={swipeRef}>
            <div className="glass-card" style={{
              overflow: 'hidden', borderRadius: 30, padding: 0,
              background: 'rgba(255,255,255,0.42)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,.65)',
              boxShadow: '0 20px 40px rgba(40,40,60,0.05)',
            }}>

              {/* ── Card header ── */}
              <div style={{
                position: 'relative', overflow: 'hidden',
                padding: '14px 16px 16px',
                background: heroTheme.bg,
                borderBottom: `1px solid ${heroTheme.borderColor}`,
              }}>
                {/* Wave SVG overlay */}
                <WaveOverlay wave1={heroTheme.wave1} wave2={heroTheme.wave2} />

                {/* Row 1: PATTERN number (left) · Note · Bookmark (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                  {/* Story picker → PATTERN number */}
                  <button
                    type="button"
                    onClick={onOpenPicker}
                    aria-label="스토리 선택"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 700, color: heroTheme.labelColor,
                      letterSpacing: '0.06em',
                      fontFamily: '"SF Mono", "Fira Mono", "Courier New", monospace',
                    }}>
                      PATTERN {String(globalPatternNum).padStart(3, '0')} / {totalPatterns}
                    </span>
                  </button>

                  {/* Right icons: Note + Bookmark */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Note button */}
                    {patternNote && (
                      <button
                        type="button"
                        onClick={() => setNoteOpen(true)}
                        aria-label="패턴 노트"
                        style={{
                          background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                          color: heroTheme.iconColor,
                          transition: 'color 0.15s, transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                        onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
                        onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <Lightbulb style={{ width: 16, height: 16 }} strokeWidth={1.8} />
                      </button>
                    )}

                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={handleBookmark}
                      aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
                      style={{
                        background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                        color: bookmarked ? '#8F234B' : heroTheme.iconColor,
                        transition: 'color 0.15s, transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
                      }}
                      onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
                      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      <Bookmark
                        style={{ width: 16, height: 16 }}
                        strokeWidth={1.8}
                        fill={bookmarked ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>

                {/* Pattern title */}
                <p style={{
                  fontSize: '2.0rem', fontWeight: 800, color: heroTheme.patternColor,
                  lineHeight: 1.15, margin: '10px 0 8px', letterSpacing: '-0.02em',
                  fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  position: 'relative', zIndex: 1,
                  textShadow: heroTheme.patternShadow,
                }}>
                  {pattern.pattern}
                </p>

                {/* Row 3: meaning (left) + sequential speaker (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                  {patternMeaning ? (
                    <p style={{ fontSize: 12, fontWeight: 600, color: heroTheme.meaningColor, margin: 0, letterSpacing: '0.01em', flex: 1, paddingRight: 8 }}>
                      {patternMeaning}
                    </p>
                  ) : <div />}

                  {/* Sequential examples play — icon only */}
                  <button
                    type="button"
                    onClick={playPatternExamples}
                    aria-label={isPlaying ? '정지' : '예문 듣기'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: 6, cursor: 'pointer',
                      background: 'none', border: 'none',
                      color: isPlaying ? '#8F234B' : heroTheme.iconColor, flexShrink: 0,
                      transition: 'opacity 0.15s, transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onPointerDown={e => { e.currentTarget.style.opacity = '0.6' }}
                    onPointerUp={e => { e.currentTarget.style.opacity = '1' }}
                    onPointerLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    {isPlaying
                      ? <Square style={{ width: 11, height: 11 }} fill="currentColor" strokeWidth={0} />
                      : <Volume2 style={{ width: 16, height: 16 }} strokeWidth={1.6} />}
                  </button>
                </div>
              </div>

              {/* ── Card body ── */}
              <div style={{ padding: '16px 20px 20px' }}>

                {/* Language control — above examples, right-aligned */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <div style={{
                    display: 'inline-flex', borderRadius: 8,
                    background: 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(200,205,215,0.55)',
                    padding: 2, gap: 0,
                  }}>
                    {STUDY_CYCLE.map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setStudyMode(mode)}
                        style={{
                          padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                          background: studyMode === mode ? 'rgba(255,255,255,0.85)' : 'transparent',
                          color: studyMode === mode ? '#1C1C1E' : '#6E6E73',
                          boxShadow: studyMode === mode ? '0 1px 3px rgba(0,0,0,0.07)' : 'none',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        {STUDY_LABEL[mode]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Examples — all 3 always visible; tap word to save, ▶ to play */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {examples.map((ex, i) => {
                    const isExPlaying = phase === 'speaking' && i === exIdx
                    const exRev       = revealedExSet.has(`${patIdx}-${i}`)
                    const showExEn    = studyMode === 'en' || studyMode === 'en-ko' || exRev
                    const exKo        = resolveTranslation(ex.ko, prefs.language, ex.translations)
                    const fullEx      = patternExamplesFull[pattern.id]?.[i]
                    return (
                      <div
                        key={i}
                        style={{
                          borderTop: i > 0 ? '1px solid rgba(220,225,235,0.7)' : 'none',
                          paddingTop: i > 0 ? 14 : 0,
                          paddingBottom: i < examples.length - 1 ? 14 : 0,
                          background: isExPlaying ? 'rgba(0,0,0,0.03)' : 'transparent',
                          borderRadius: isExPlaying ? 8 : 0,
                          transition: 'background 0.2s',
                        }}
                      >
                        {showExEn ? (
                          <TappableWordText
                            text={ex.en}
                            saveCandidates={undefined}
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
                              fontWeight:  isExPlaying ? 500 : 400,
                              color:       'var(--pt)',
                              lineHeight:  1.5,
                              marginBottom: 2,
                            }}
                          />
                        ) : (
                          <p style={{
                            fontSize: 14.5, fontWeight: 400,
                            color: 'var(--pt)',
                            lineHeight: 1.5, margin: '0 0 2px',
                            opacity: 0.04, userSelect: 'none',
                          }}>
                            {ex.en}
                          </p>
                        )}
                        {showKorean && exKo && (
                          <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, lineHeight: 1.5 }}>
                            {exKo}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* ── Dot indicators — below examples ── */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 20 }}>
                  {patterns.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`패턴 ${i + 1}`}
                      onClick={() => navigateTo(i, 0)}
                      style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
                    >
                      <span style={{
                        display: 'block', width: i === patIdx ? 14 : 6, height: 6,
                        borderRadius: 999,
                        background: i === patIdx ? '#3A3A3C' : '#D1D1D6',
                        transition: 'all 0.25s',
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacer — transparent, keeps content above tab bar */}
        <div
          aria-hidden="true"
          style={{
            height: 'calc(120px + env(safe-area-inset-bottom, 0px))',
            flexShrink: 0,
            background: 'transparent',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Pattern Note Popup ── */}
      {noteOpen && patternNote && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 20px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setNoteOpen(false) }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%', maxWidth: 480,
              maxHeight: '75dvh', overflowY: 'auto',
              borderRadius: 24,
            }}
          >
            <div style={{ padding: '24px 24px 32px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <p style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                    color: 'var(--pm2)', margin: '0 0 6px', textTransform: 'uppercase',
                  }}>
                    Pattern Note
                  </p>
                  <p style={{
                    fontSize: 'clamp(1.0rem, 4vw, 1.2rem)', fontWeight: 800,
                    color: '#3A3A3C', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}>
                    {pattern.pattern}
                  </p>
                  {patternMeaning && (
                    <p style={{ fontSize: 12, color: 'var(--pm2)', margin: '4px 0 0', fontWeight: 500 }}>
                      {patternMeaning}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setNoteOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--pc)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={2} />
                </button>
              </div>

              {/* Note body */}
              <p style={{
                fontSize: 14, lineHeight: 1.75, color: 'var(--pt2)',
                margin: 0, whiteSpace: 'pre-line',
              }}>
                {patternNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
