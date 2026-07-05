'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Volume2, Square, Bookmark, Check, Globe, Lightbulb,
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
import { useT } from '@/hooks/useT'

// ── Timing constants ──────────────────────────────────────────────────────────
const EXAMPLE_PAUSE_MS = 1800

const STORY_ILLUSTRATIONS: Record<number, string> = {
  1: '🌱', 2: '👋', 3: '☀️', 4: '🌙', 5: '☕',
  6: '🔀', 7: '🏔️', 8: '✈️', 9: '🎒', 10: '📚',
  11: '💬', 12: '🎁', 13: '📅', 14: '🏥', 15: '🏦',
  16: '🛒', 17: '🏨', 18: '🚕', 19: '🌤️', 20: '🏃',
}
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
  const example = examples[exIdx] ?? examples[0]

  useEffect(() => { patIdxRef.current = patIdx }, [patIdx])
  useEffect(() => { exIdxRef.current  = exIdx  }, [exIdx])

  useEffect(() => {
    setPatIdx(0); setExIdx(0)
    patIdxRef.current = 0; exIdxRef.current = 0
    setRevealedExSet(new Set())
  }, [story.id])

  // ── UI state ───────────────────────────────────────────────────────────────
  const [studyMode,     setStudyMode]    = useState<StudyMode>('en-ko')
  // examplesOpen removed — examples always visible in list style
  const [bookmarked,    setBookmarked]   = useState(false)
  const [phase,         setPhase]        = useState<Phase>('idle')
  // revealedExSet: keys of form `${patIdx}-${exIdx}` revealed in KR mode
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
    )

    runningRef.current = true
    startedAtRef.current = Date.now()

    function playOne(idx: number) {
      if (!runningRef.current) return
      const ex = exs[idx]
      if (!ex) { runningRef.current = false; setPhase('idle'); return }

      navigateTo(patIdxRef.current, idx, true)
      if (DEV) console.log('[PatternsV2] playPatternExamples', pat.id, 'ex', idx)

      setPhase('speaking')
      const url = patternExampleAudioUrl(voice, pat.id, idx, ex.en)
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
  const exRevealed  = revealedExSet.has(`${patIdx}-${exIdx}`)
  const showEnglish = studyMode === 'en' || studyMode === 'en-ko' || exRevealed
  const showKorean  = studyMode === 'en-ko' || studyMode === 'ko'
  const translationTx = example
    ? resolveTranslation(example.ko, prefs.language, example.translations)
    : null
  const patternMeaning = resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)

  function cycleStudyMode() {
    setStudyMode(prev => {
      const idx = STUDY_CYCLE.indexOf(prev)
      return STUDY_CYCLE[(idx + 1) % STUDY_CYCLE.length]
    })
  }

  // Global pattern number (1–500)
  const globalPatternNum = (story.id - 1) * patterns.length + patIdx + 1
  const totalPatterns = totalStories * patterns.length

  // Glass button base style
  const glassBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 16px', borderRadius: 999, cursor: 'pointer',
    background: 'rgba(255,255,255,0.45)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.70)',
    color: '#555A61', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    transition: 'filter 0.15s, transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
  }
  const glassBtnMotion = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(0.98)'
      e.currentTarget.style.filter = 'brightness(0.95)'
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(1)'
      e.currentTarget.style.filter = 'brightness(1)'
    },
    onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(1)'
      e.currentTarget.style.filter = 'brightness(1)'
    },
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col" style={{ background: 'transparent' }}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div style={{ padding: '0 16px 112px' }}>

          {/* ── Story label + Dot progress ── */}
          <div style={{
            paddingTop: 76, paddingBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative',
          }}>
            <button
              type="button"
              onClick={onOpenPicker}
              aria-label="스토리 선택"
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <span style={{
                fontSize: 9, letterSpacing: '0.20em', fontWeight: 600,
                color: '#9B9B9B', textTransform: 'uppercase',
              }}>
                STORY {String(story.id).padStart(2, '0')}
              </span>
            </button>

            {/* Dot indicators — centered */}
            <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'auto' }}>
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
                padding: '18px 20px 16px',
                background: 'rgba(18, 22, 42, 0.10)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
              }}>
                {/* Wave decoration */}
                <div style={{
                  position: 'absolute',
                  bottom: -20, left: '-10%', right: '-10%', height: 60,
                  background: 'rgba(255,255,255,1)',
                  borderRadius: '50%', opacity: 0.05,
                  pointerEvents: 'none',
                }} />

                {/* Bookmark row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10, position: 'relative' }}>
                  <button
                    type="button"
                    onClick={handleBookmark}
                    aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
                    style={{
                      background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                      color: bookmarked ? '#8F234B' : '#AAACB0',
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

                {/* Pattern number */}
                <p style={{
                  fontSize: '0.68rem', fontWeight: 500, color: '#9B9B9B',
                  margin: '0 0 6px', letterSpacing: '0.04em',
                  fontFamily: '"SF Mono", "Fira Mono", "Courier New", monospace',
                  position: 'relative',
                }}>
                  {String(globalPatternNum).padStart(3, '0')} / {totalPatterns}
                </p>
                {/* Pattern title */}
                <p style={{
                  fontSize: '2.0rem', fontWeight: 800, color: '#F6F6F4',
                  lineHeight: 1.15, margin: '0 0 6px', letterSpacing: '-0.02em',
                  fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  textShadow: '0 2px 10px rgba(0,0,0,0.17)',
                  position: 'relative',
                }}>
                  {pattern.pattern}
                </p>
                {patternMeaning && (
                  <p style={{
                    fontSize: 12, fontWeight: 400, color: 'rgba(236,237,239,0.80)',
                    margin: 0, letterSpacing: '0.01em',
                  }}>
                    {patternMeaning}
                  </p>
                )}
              </div>

              {/* ── Card body ── */}
              <div style={{ padding: '16px 20px 22px' }}>

                {/* Action row: Segmented EN/KO (left) + Speaker (right) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  {/* iOS Segmented Control */}
                  <div style={{
                    display: 'inline-flex', borderRadius: 10,
                    background: 'rgba(255,255,255,0.50)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    padding: 2, gap: 0,
                  }}>
                    {STUDY_CYCLE.map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setStudyMode(mode)}
                        style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                          background: studyMode === mode ? 'rgba(255,255,255,0.85)' : 'transparent',
                          color: studyMode === mode ? '#3A3A3C' : '#9B9B9B',
                          transition: 'background 0.18s, color 0.18s',
                        }}
                      >
                        {STUDY_LABEL[mode]}
                      </button>
                    ))}
                  </div>
                  {/* Speaker */}
                  <button
                    type="button"
                    onClick={playPatternExamples}
                    aria-label={isPlaying ? '정지' : '예문 듣기'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 34, height: 34, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.50)',
                      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.65)',
                      color: isPlaying ? '#8F234B' : '#6B6E76',
                      transition: 'filter 0.15s, transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onPointerDown={e => { e.currentTarget.style.filter = 'brightness(1.08)' }}
                    onPointerUp={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                    onPointerLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                  >
                    {isPlaying
                      ? <Square style={{ width: 10, height: 10 }} fill="currentColor" strokeWidth={0} />
                      : <Volume2 style={{ width: 14, height: 14 }} strokeWidth={1.8} />}
                  </button>
                </div>

                {/* Examples */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {examples.map((ex, i) => {
                    const isActive   = i === exIdx
                    const exRev      = revealedExSet.has(`${patIdx}-${i}`)
                    const showExEn   = studyMode === 'en' || studyMode === 'en-ko' || exRev
                    const exKo       = resolveTranslation(ex.ko, prefs.language, ex.translations)
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => navigateTo(patIdx, i)}
                        style={{
                          display: 'block', textAlign: 'left', width: '100%',
                          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                      >
                        {showExEn ? (
                          <p style={{ fontSize: 14.5, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--pt)' : 'var(--pt2)', lineHeight: 1.5, margin: '0 0 2px' }}>
                            {ex.en}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); revealEx(patIdx, i) }}
                            style={{ background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 2 }}>
                              <div style={{ height: 11, borderRadius: 6, background: 'var(--pd)', width: '85%' }} />
                              <div style={{ height: 11, borderRadius: 6, background: 'var(--pd)', width: '55%' }} />
                            </div>
                          </button>
                        )}
                        {showKorean && exKo && (
                          <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, lineHeight: 1.5 }}>
                            {exKo}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Pattern Note — 예문 아래 */}
                {patternNote && (
                  <>
                    <div style={{ marginTop: 20 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                      <Lightbulb style={{ width: 12, height: 12, color: '#8F234B', flexShrink: 0 }} strokeWidth={2} />
                      <p style={{
                        fontSize: 8.5, letterSpacing: '0.16em', fontWeight: 700,
                        color: '#8A8A8E', margin: 0, textTransform: 'uppercase',
                      }}>
                        Pattern Note
                      </p>
                    </div>
                    <p style={{
                      fontSize: 13, color: 'var(--pm)', lineHeight: 1.78,
                      margin: '0 0 4px',
                    }}>
                      {patternNote.replace(/\n+/g, ' ').trim()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
