'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Volume2, Square,
  Bookmark, Eye, ChevronDown, Check,
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
import { TodayMissionBar } from '@/components/TodayMissionBar'

// ── Timing constants ──────────────────────────────────────────────────────────
const RECALL_THINK_MS        = 2500
const RECALL_REVEAL_PAUSE_MS = 500
const EXAMPLE_PAUSE_MS       = 1800
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

type Phase     = 'idle' | 'thinking' | 'revealed' | 'speaking' | 'pause' | 'done'
type StudyMode = 'english' | 'translation' | 'recall'

const STUDY_CYCLE: StudyMode[] = ['english', 'translation', 'recall']
const STUDY_LABEL: Record<StudyMode, string> = {
  english:     'EN',
  translation: 'EN·KR',
  recall:      'RECALL',
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
  )
  const example = examples[exIdx] ?? examples[0]

  useEffect(() => { patIdxRef.current = patIdx }, [patIdx])
  useEffect(() => { exIdxRef.current  = exIdx  }, [exIdx])

  useEffect(() => {
    setPatIdx(0); setExIdx(0)
    patIdxRef.current = 0; exIdxRef.current = 0
  }, [story.id])

  // ── UI state ───────────────────────────────────────────────────────────────
  const [studyMode,    setStudyMode]   = useState<StudyMode>('translation')
  const [revealed,     setRevealed]    = useState(false)
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [audioMenuOpen, setAudioMenuOpen] = useState(false)
  const [bookmarked,   setBookmarked]  = useState(false)
  const [phase,        setPhase]       = useState<Phase>('idle')
  const audioMenuRef = useRef<HTMLDivElement>(null)

  // done mask: patternId → Set<exIdx>
  const doneMasksRef = useRef<Record<string, Set<number>>>({})
  const [doneMask, setDoneMask] = useState<Set<number>>(new Set())

  useEffect(() => {
    setDoneMask(new Set(doneMasksRef.current[pattern.id] ?? []))
  }, [pattern.id])

  useEffect(() => {
    setBookmarked(isBookmarked(pattern.id))
  }, [pattern.id])

  // Close audio menu on outside click
  useEffect(() => {
    if (!audioMenuOpen) return
    function onDown(e: MouseEvent | TouchEvent) {
      if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
        setAudioMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [audioMenuOpen])

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
    setRevealed(false)
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
    setRevealed(false)
    setDoneMask(new Set(doneMasksRef.current[patterns[p].id] ?? []))
  }, [stop, patterns])

  const goNext = useCallback(() => {
    const p = patIdxRef.current, e = exIdxRef.current
    const exLen = resolveExamples(
      patternExamples, patterns[p].id,
      patterns[p].storySentence, patterns[p].storySentenceKo,
      patterns[p].variationSentence, patterns[p].variationSentenceKo,
    ).length
    if (e < exLen - 1)               navigateTo(p, e + 1)
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
      navigateTo(p - 1, prevLen - 1)
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

  // ── Single example play ───────────────────────────────────────────────────
  const playSingle = useCallback((p: number, e: number) => {
    const pat = patterns[p]
    const exs = resolveExamples(
      patternExamples, pat.id,
      pat.storySentence, pat.storySentenceKo,
      pat.variationSentence, pat.variationSentenceKo,
    )
    const ex = exs[e]
    if (!ex) return
    setPhase('speaking')
    const url = patternExampleAudioUrl(voice, pat.id, e, ex.en)
    if (DEV) console.log('[PatternsV2] single play', pat.id, 'ex', e)
    ttsProvider.speak({
      texts: [ex.en], audioUrls: url ? [url] : undefined,
      voiceKey: voice, voiceKeys: [voice],
      rate: RATE_MAP[prefs.speechRate], pitch: getPitchForKey(voice), volume: 1.0,
      onEnd: () => { markDone(p, e); setPhase('idle') },
      onError: () => setPhase('idle'),
    })
  }, [patterns, patternExamples, prefs.speechRate, voice, markDone])

  // ── Auto-play ─────────────────────────────────────────────────────────────
  const autoPlayOne = useCallback((p: number, e: number) => {
    if (!runningRef.current) return
    const pat = patterns[p]
    const exs = resolveExamples(
      patternExamples, pat.id,
      pat.storySentence, pat.storySentenceKo,
      pat.variationSentence, pat.variationSentenceKo,
    )
    const ex = exs[e]
    if (!ex) { stop(); return }

    navigateTo(p, e, true)
    if (DEV) console.log('[PatternsV2] autoPlayOne', pat.id, 'ex', e, 'mode=', studyModeRef.current)

    const advance = () => {
      if (!runningRef.current) return
      markDone(p, e)
      setPhase('pause')
      setRevealed(false)
      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return
        let nextP = p, nextE = e + 1
        if (nextE >= exs.length) {
          const dur = Date.now() - startedAtRef.current
          recordPatternPractice(pat.id, story.id, pat.pattern, story.title, dur)
          nextP = p + 1; nextE = 0
        }
        if (nextP >= patterns.length) { runningRef.current = false; setPhase('done'); return }
        autoPlayOne(nextP, nextE)
      }, EXAMPLE_PAUSE_MS)
    }

    const doSpeak = () => {
      setPhase('speaking')
      const url = patternExampleAudioUrl(voice, pat.id, e, ex.en)
      ttsProvider.speak({
        texts: [ex.en], audioUrls: url ? [url] : undefined,
        voiceKey: voice, voiceKeys: [voice],
        rate: RATE_MAP[prefs.speechRate], pitch: getPitchForKey(voice), volume: 1.0,
        onEnd: advance, onError: advance,
      })
    }

    if (studyModeRef.current === 'recall') {
      setRevealed(false); setPhase('thinking')
      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return
        setRevealed(true); setPhase('revealed')
        timerRef.current = setTimeout(() => {
          if (!runningRef.current) return
          doSpeak()
        }, RECALL_REVEAL_PAUSE_MS)
      }, RECALL_THINK_MS)
    } else {
      setRevealed(true)
      doSpeak()
    }
  }, [patterns, patternExamples, prefs.speechRate, voice, story.id, story.title, stop, navigateTo, markDone])

  const isAutoPlaying = phase === 'speaking' || phase === 'thinking' || phase === 'revealed' || phase === 'pause'

  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) { stop(); return }
    runningRef.current = true
    startedAtRef.current = Date.now()
    setPhase('idle')
    autoPlayOne(patIdxRef.current, exIdxRef.current)
  }, [isAutoPlaying, stop, autoPlayOne])

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
  const recallMode    = studyMode === 'recall'
  const translationOn = studyMode === 'translation'
  const showEnglish   = studyMode !== 'recall' || revealed
  const showKorean    = studyMode !== 'english'
  const translationTx = example
    ? resolveTranslation(example.ko, prefs.language, example.translations)
    : null
  const patternMeaning = resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)

  function cycleStudyMode() {
    setStudyMode(prev => {
      const idx = STUDY_CYCLE.indexOf(prev)
      return STUDY_CYCLE[(idx + 1) % STUDY_CYCLE.length]
    })
    setRevealed(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">

      {/* ── Scrollable main content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="pl-7 pr-6 pt-5 pb-10">

          <TodayMissionBar currentStoryId={story.id} />

          {/* Story header */}
          <button
            type="button"
            onClick={onOpenPicker}
            aria-label="스토리 선택"
            className="flex items-center gap-2 mb-5 mt-2 group cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span className="text-[9px] tracking-[0.25em] font-bold text-[var(--pa)] group-hover:opacity-70 transition-opacity">
              STORY {String(story.id).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-[var(--pm2)]">·</span>
            <span className="text-[0.8rem] font-playfair text-[var(--pt)] font-bold leading-tight">
              {story.title}
            </span>
          </button>

          {/* Pattern navigation */}
          <div className="flex items-center justify-between mb-5">
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

          {/* ── Swipe area ── */}
          <div ref={swipeRef}>

            {/* ── Pattern section ── */}
            <div className="pt-8 pb-5 mb-6">
              <div className="flex items-center justify-center gap-4">
                <div className="w-[64px] h-[64px] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/patterns/${pattern.id}.svg`}
                    alt="" aria-hidden="true"
                    className="w-[64px] h-[64px] object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-playfair text-[1.1rem] font-bold text-[var(--pt)] leading-snug">
                    {pattern.pattern}
                  </p>
                  {patternMeaning && (
                    <p className="text-[0.7rem] text-[var(--pa)] mt-1 font-semibold tracking-wide">
                      {patternMeaning}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Example display — centered ── */}
            <div className="min-h-[90px] mb-5 text-center px-2">
              {recallMode && phase === 'thinking' && (
                <p className="text-[9px] font-bold tracking-[0.18em] text-[var(--pa)] mb-3 animate-pulse">
                  THINK IN ENGLISH…
                </p>
              )}

              {showEnglish ? (
                <p className="text-[0.9rem] leading-[1.9] text-[var(--pt)] mb-1">
                  {example?.en}
                </p>
              ) : (
                <div className="mb-3 space-y-2 flex flex-col items-center" aria-hidden="true">
                  <div className="h-4 rounded-lg bg-[var(--pd)]" style={{ width: '80%' }} />
                  <div className="h-4 rounded-lg bg-[var(--pd)]" style={{ width: '60%' }} />
                </div>
              )}

              {showKorean && translationTx && (
                <p className="text-[0.78rem] text-[var(--pm)] leading-relaxed">
                  {translationTx}
                </p>
              )}

              {recallMode && !revealed && phase !== 'thinking' && phase !== 'speaking' && (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--pa)] hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  REVEAL
                </button>
              )}
            </div>

            {/* Example indicator dots — centered */}
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {examples.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigateTo(patIdx, i)}
                  aria-label={`Example ${i + 1}`}
                  className="cursor-pointer py-1"
                >
                  <span
                    className="block rounded-full transition-all duration-200"
                    style={{
                      width:  i === exIdx ? 18 : 6,
                      height: 6,
                      background: i === exIdx || doneMask.has(i) ? 'var(--pa)' : 'var(--pd)',
                      opacity: doneMask.has(i) && i !== exIdx ? 0.4 : 1,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── Controls row: Speaker + Study Mode only ── */}
          <div className="flex items-center gap-2 py-3 mt-2 border-t border-[var(--pd)]">

            {/* Speaker button with inline menu */}
            <div className="relative" ref={audioMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (isAutoPlaying) { stop(); return }
                  setAudioMenuOpen(v => !v)
                }}
                aria-label="오디오 재생"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isAutoPlaying
                    ? 'text-[var(--pa)] bg-[var(--pal)]'
                    : 'text-[var(--pm2)] hover:text-[var(--pa)] hover:bg-[var(--pal)]'
                }`}
              >
                {isAutoPlaying
                  ? <Square className="w-4 h-4 fill-current" />
                  : <Volume2 className="w-4 h-4" strokeWidth={1.8} />}
              </button>

              {/* Audio options menu */}
              {audioMenuOpen && !isAutoPlaying && (
                <div
                  className="absolute left-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--pb)',
                    border: '1px solid var(--pd)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    minWidth: 170,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setAudioMenuOpen(false); playSingle(patIdx, exIdx) }}
                    className="w-full text-left px-4 py-2.5 text-[0.78rem] text-[var(--pt)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
                  >
                    This Example
                  </button>
                  <div style={{ height: 1, background: 'var(--pd)' }} />
                  <button
                    type="button"
                    onClick={() => { setAudioMenuOpen(false); toggleAutoPlay() }}
                    className="w-full text-left px-4 py-2.5 text-[0.78rem] text-[var(--pt)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
                  >
                    All Examples ({examples.length})
                  </button>
                </div>
              )}
            </div>

            {/* Study Mode cycling button */}
            <button
              type="button"
              onClick={cycleStudyMode}
              aria-label={`Study mode: ${STUDY_LABEL[studyMode]}`}
              className={`ml-auto text-[9px] font-bold tracking-wide px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${
                studyMode === 'recall'
                  ? 'bg-[var(--pa)] text-white border-[var(--pa)]'
                  : studyMode === 'translation'
                  ? 'bg-[var(--pal)] text-[var(--pa)] border-[var(--pal)]'
                  : 'text-[var(--pm2)] border-[var(--pd)] hover:border-[var(--pa)] hover:text-[var(--pa)]'
              }`}
            >
              {STUDY_LABEL[studyMode]}
            </button>
          </div>

          {/* ── Examples list (collapsible) ── */}
          <div className="border-t border-[var(--pd)]">
            <button
              type="button"
              onClick={() => setExamplesOpen(v => !v)}
              className="w-full flex items-center justify-between py-3 cursor-pointer"
              aria-label={examplesOpen ? 'Collapse examples' : 'Expand examples'}
            >
              <span className="text-[10px] tracking-[0.15em] font-bold text-[var(--pm)]">
                Examples ({examples.length})
              </span>
              <ChevronDown
                className="w-4 h-4 text-[var(--pm2)] transition-transform duration-200"
                style={{ transform: examplesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                strokeWidth={1.5}
              />
            </button>

            <div style={{
              display: 'grid',
              gridTemplateRows: examplesOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows 230ms cubic-bezier(0.4,0,0.2,1)',
            }}>
              <div style={{ overflow: 'hidden' }}>
                {/* Pattern Note + Save Pattern at top of list */}
                {examplesOpen && (
                  <div className="pb-3 mb-1">
                    {patternNote && (
                      <div className="mb-3">
                        <p className="text-[9px] tracking-[0.2em] font-bold text-[var(--pa)] mb-1.5">
                          PATTERN NOTE
                        </p>
                        <p className="text-[0.8rem] text-[var(--pm)] leading-[1.8] whitespace-pre-line">
                          {patternNote}
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleBookmark}
                      aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full transition-colors cursor-pointer border ${
                        bookmarked
                          ? 'bg-[var(--pa)] text-white border-[var(--pa)]'
                          : 'text-[var(--pm2)] border-[var(--pd)] hover:border-[var(--pa)] hover:text-[var(--pa)]'
                      }`}
                    >
                      <Bookmark
                        className="w-3 h-3"
                        strokeWidth={2}
                        fill={bookmarked ? 'currentColor' : 'none'}
                      />
                      {bookmarked ? 'Saved' : 'Save Pattern'}
                    </button>
                    <div className="mt-3 border-t border-[var(--pd)]" />
                  </div>
                )}

                <div className="pb-5 space-y-1">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => navigateTo(patIdx, i)}
                      className={`w-full flex items-start gap-3 text-left rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                        i === exIdx ? 'bg-[var(--pal)]' : 'hover:bg-[var(--pc2)]'
                      }`}
                    >
                      <span className="shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                        {doneMask.has(i) ? (
                          <Check className="w-3.5 h-3.5 text-[var(--pa)]" strokeWidth={2.5} />
                        ) : i === exIdx ? (
                          <span className="w-2 h-2 rounded-full bg-[var(--pa)]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full border border-[var(--pd2,var(--pd))]" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8rem] text-[var(--pt)] leading-snug">{ex.en}</p>
                        {(translationOn || recallMode) &&
                          resolveTranslation(ex.ko, prefs.language, ex.translations) && (
                            <p className="text-[0.7rem] text-[var(--pm)] mt-0.5 leading-snug">
                              {resolveTranslation(ex.ko, prefs.language, ex.translations)}
                            </p>
                          )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="shrink-0 border-t border-[var(--pd)] bg-[var(--pb)] py-3 px-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 (스토리)"
            onClick={onPrev}
            className="p-2 rounded-full text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-[8px] tracking-[0.3em] text-[var(--pm2)] font-medium">
            {String(story.id).padStart(2, '0')} · PATTERNS
          </span>
          <button
            type="button"
            aria-label="다음 스토리"
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 rounded-full transition-colors ${
              hasNext
                ? 'text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] cursor-pointer'
                : 'text-[var(--pd)] cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
