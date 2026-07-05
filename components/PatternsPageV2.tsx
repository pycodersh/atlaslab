'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Volume2, Square,
  Bookmark, Check,
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
  story, onPrev, onNext, hasNext, onOpenPicker, patternExamples,
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col" style={{ background: 'transparent' }}>

      {/* ── Scrollable main content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="pl-7 pr-6 pt-5 pb-10">

          {/* Story header: number on top, title below */}
          <div className="mt-2 mb-3">
            <button
              type="button"
              onClick={onOpenPicker}
              aria-label="스토리 선택"
              className="flex flex-col items-start group cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span className="text-[10px] tracking-[0.25em] font-bold text-[var(--pa)] group-hover:opacity-70 transition-opacity mb-1">
                STORY {String(story.id).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '1.075rem', fontWeight: 800, color: 'var(--pt)', lineHeight: 1.3 }}>
                {story.title}
              </span>
            </button>
            {/* Accent rule */}
            <div style={{ height: 1.5, background: 'var(--pa)', width: 28, marginTop: 10, borderRadius: 1, opacity: 0.7 }} />
          </div>

          {/* Pattern navigation + Language Toggle + Bookmark */}
          <div className="mb-4">
            {/* Pattern prev/next row */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => patIdx > 0 ? navigateTo(patIdx - 1, 0) : onPrev()}
                aria-label="이전 패턴"
                className="p-1.5 rounded-full text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <span className="text-[10px] tracking-[0.22em] font-bold text-[var(--pm)]">
                PATTERN {patIdx + 1} / {patterns.length}
              </span>
              <button
                type="button"
                onClick={() => patIdx < patterns.length - 1 ? navigateTo(patIdx + 1, 0) : undefined}
                disabled={patIdx >= patterns.length - 1}
                aria-label="다음 패턴"
                className={`p-1.5 rounded-full transition-colors ${
                  patIdx < patterns.length - 1
                    ? 'text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] cursor-pointer'
                    : 'text-[var(--pd)] cursor-default'
                }`}
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            {/* Language Toggle + Bookmark — below pattern nav, right-aligned */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={cycleStudyMode}
                aria-label={`Study mode: ${STUDY_LABEL[studyMode]}`}
                className="text-[9px] font-bold tracking-wide px-2.5 py-1 rounded-full cursor-pointer border text-[var(--pm2)] border-[var(--pd)] hover:border-[var(--pa)] hover:text-[var(--pa)] transition-colors"
              >
                {STUDY_LABEL[studyMode]}
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  bookmarked
                    ? 'text-[var(--pa)] bg-[var(--pal)]'
                    : 'text-[var(--pm2)] hover:text-[var(--pa)] hover:bg-[var(--pal)]'
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  strokeWidth={1.8}
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          {/* ── Swipe area ── */}
          <div ref={swipeRef}>
            {/* ── Pattern card — PatternDetail style ── */}
            <div className="glass-card" style={{ padding: '20px 22px 24px' }}>

              {/* Illustration + pattern header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.22em', fontWeight: 700, color: 'var(--pa)', marginBottom: 5 }}>
                    {String(patIdx + 1).padStart(2, '0')}
                  </p>
                  <p style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--pt)', lineHeight: 1.15, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                    {pattern.pattern}
                  </p>
                  {patternMeaning && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--pa)', margin: 0 }}>
                      {patternMeaning}
                    </p>
                  )}
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--pal)', border: '1px solid var(--pacb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {STORY_ILLUSTRATIONS[story.id] ?? '✨'}
                </div>
              </div>

              {/* Audio + Save buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={playPatternExamples}
                  aria-label={isPlaying ? '정지' : '예문 듣기'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 9999, border: 'none',
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: isPlaying ? 'var(--pa)' : 'var(--pal)',
                    color: isPlaying ? 'white' : 'var(--pa)',
                    transition: 'all 0.15s',
                  }}
                >
                  {isPlaying
                    ? <Square style={{ width: 12, height: 12 }} fill="currentColor" strokeWidth={0} />
                    : <Volume2 style={{ width: 13, height: 13 }} strokeWidth={1.8} />}
                  {isPlaying ? '정지' : '전체 듣기'}
                </button>
                <button
                  type="button"
                  onClick={handleBookmark}
                  aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 9999,
                    border: `1px solid ${bookmarked ? 'var(--pa)' : 'var(--pd)'}`,
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: bookmarked ? 'var(--pa)' : 'transparent',
                    color: bookmarked ? 'white' : 'var(--pm2)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Bookmark style={{ width: 12, height: 12 }} strokeWidth={2} fill={bookmarked ? 'currentColor' : 'none'} />
                  {bookmarked ? 'Saved' : 'Save Pattern'}
                </button>
              </div>

              {/* Pattern Note */}
              {patternNote && (
                <>
                  <div style={{ height: 1, background: 'var(--pd)', marginBottom: 12 }} />
                  <p style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: 'var(--pa)', marginBottom: 6 }}>
                    PATTERN NOTE
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--pm)', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 4 }}>
                    {patternNote}
                  </p>
                </>
              )}

              {/* Divider before examples */}
              <div style={{ height: 1, background: 'var(--pd)', margin: '12px 0 6px' }} />

              {/* Examples list — all 3, clickable, active highlighted */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {examples.map((ex, i) => {
                  const isActive = i === exIdx
                  const exRevealed = revealedExSet.has(`${patIdx}-${i}`)
                  const showExEn = studyMode === 'en' || studyMode === 'en-ko' || exRevealed
                  const exKo = resolveTranslation(ex.ko, prefs.language, ex.translations)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => navigateTo(patIdx, i)}
                      className={`w-full flex items-start gap-3 text-left rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                        isActive ? 'bg-[var(--pal)]' : 'hover:bg-[var(--pc2)]'
                      }`}
                    >
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
                        {doneMask.has(i) ? (
                          <Check className="w-3.5 h-3.5 text-[var(--pa)]" strokeWidth={2.5} />
                        ) : isActive ? (
                          <span className="w-2 h-2 rounded-full bg-[var(--pa)]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full border border-[var(--pd)]" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        {showExEn ? (
                          <p className="text-[0.85rem] font-medium text-[var(--pt)] leading-snug">{ex.en}</p>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); revealEx(patIdx, i) }}
                            className="w-full text-left cursor-pointer"
                            style={{ background: 'none', border: 'none', padding: 0 }}
                          >
                            <div className="space-y-1.5 py-0.5">
                              <div className="h-3 rounded-md bg-[var(--pd)]" style={{ width: '85%' }} />
                              <div className="h-3 rounded-md bg-[var(--pd)]" style={{ width: '55%' }} />
                            </div>
                          </button>
                        )}
                        {showKorean && exKo && (
                          <p className="text-[0.75rem] text-[var(--pm)] mt-0.5 leading-snug">{exKo}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="shrink-0 bg-[var(--pb)] px-5 py-2" style={{ borderTop: '1px solid var(--pd)' }}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 (스토리)"
            onClick={onPrev}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--pc)',
              border: 'none', cursor: 'pointer',
              color: 'var(--pt)',
              transition: 'all 0.15s',
            }}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
              Patterns
            </p>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--pa)', margin: 0, letterSpacing: '0.06em' }}>
              {String(story.id).padStart(2, '0')}
            </p>
          </div>

          <button
            type="button"
            aria-label="다음 스토리"
            onClick={onNext}
            disabled={!hasNext}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 12,
              background: hasNext ? 'var(--pc)' : 'transparent',
              border: 'none', cursor: hasNext ? 'pointer' : 'not-allowed',
              color: hasNext ? 'var(--pt)' : 'var(--pd)',
              transition: 'all 0.15s',
            }}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
