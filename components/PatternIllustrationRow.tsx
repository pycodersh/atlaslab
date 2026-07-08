'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Volume2, Bookmark, Check } from 'lucide-react'

import type { MagazinePattern } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { RATE_MAP, type VoiceKey } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, patternExampleAudioUrl } from '@/lib/tts'
import { recordPatternPractice } from '@/lib/srs/storage'
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks/storage'
import { PATTERN_NOTES } from '@/data/pattern-notes'
import { patternMeaningNoteTranslations } from '@/data/pattern-meaning-note-translations'
import { useT } from '@/hooks/useT'

function illustrationSrcForId(patternId: string): string {
  return `/images/patterns/${patternId}.svg`
}

type Props = {
  storyId: number
  storyTitle: string
  voice: VoiceKey
  pattern: MagazinePattern
  examples: PracticeExample[]
  index: number
  active: boolean
  onRequestPlay: () => void
  autoPlayKey?: number
  onFinished?: () => void
  isLast?: boolean
}

type Phase = 'idle' | 'speaking' | 'pause' | 'done'
const FOLLOW_PAUSE_MS = 2500
const DEV = process.env.NODE_ENV === 'development'
const eq = (id: string, i: number, msg: string) => DEV && console.log(`[ExampleQueue] ${id} ex${i}: ${msg}`)
const eqlog = (id: string, msg: string) => DEV && console.log(`[ExampleQueue] ${id}: ${msg}`)

export function PatternIllustrationRow({
  storyId, storyTitle, voice, pattern, examples, index,
  active, onRequestPlay, autoPlayKey, onFinished, isLast,
}: Props) {
  const { prefs } = usePreferences()
  const t = useT()

  const [expanded, setExpanded] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [doneMask, setDoneMask] = useState<boolean[]>([])
  const doneRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    doneRef.current = new Set()
    setDoneMask([])
    setFeedback(null)
    setExpanded(false)
  }, [pattern.id])

  useEffect(() => {
    setBookmarked(isBookmarked(pattern.id))
  }, [pattern.id])

  function handleBookmark() {
    const next = toggleBookmark({
      patternId: pattern.id,
      pattern: pattern.pattern,
      meaningKo: pattern.meaningKo,
      storyId,
    })
    setBookmarked(next)
  }

  const runningRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)
  const playingIdxRef = useRef(0)
  const pausedAtRef = useRef(0)

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const stop = useCallback(() => {
    eqlog(pattern.id, `stop() called, running=${runningRef.current}`)
    if (runningRef.current) {
      pausedAtRef.current = playingIdxRef.current
      setCurrentIdx(playingIdxRef.current)
    }
    runningRef.current = false
    clearTimer()
    ttsProvider.stop()
    setPhase('idle')
  }, [pattern.id])

  useEffect(() => {
    eqlog(pattern.id, `active changed → ${active}, running=${runningRef.current}`)
    if (!active && runningRef.current) stop()
  }, [active, stop, pattern.id])

  useEffect(() => () => { runningRef.current = false; clearTimer(); ttsProvider.stop() }, [])

  const finish = useCallback(() => {
    runningRef.current = false
    const duration = Date.now() - startedAtRef.current
    const rec = recordPatternPractice(pattern.id, storyId, pattern.pattern, storyTitle, duration)
    setFeedback(t('repeat_done', { n: rec.repeatCount }))
    setPhase('done')
    setCurrentIdx(-1)
    pausedAtRef.current = 0
    onFinished?.()
  }, [pattern.id, pattern.pattern, storyId, storyTitle, onFinished, t])

  const playFrom = useCallback((i: number) => {
    eq(pattern.id, i, `playFrom called, running=${runningRef.current}`)
    if (!runningRef.current) { eq(pattern.id, i, 'ABORT: not running'); return }
    playingIdxRef.current = i
    setCurrentIdx(i)
    setPhase('speaking')

    let advanced = false
    const afterSpeak = () => {
      eq(pattern.id, i, `afterSpeak called, advanced=${advanced}, running=${runningRef.current}`)
      if (advanced || !runningRef.current) {
        eq(pattern.id, i, `afterSpeak BLOCKED (advanced=${advanced}, running=${runningRef.current})`)
        return
      }
      advanced = true
      doneRef.current.add(i)
      setDoneMask(Array.from({ length: examples.length }, (_, j) => doneRef.current.has(j)))
      setPhase('pause')
      eq(pattern.id, i, `scheduling next in ${FOLLOW_PAUSE_MS}ms`)
      timerRef.current = setTimeout(() => {
        eq(pattern.id, i, `timer fired, running=${runningRef.current}, next=${i + 1}/${examples.length}`)
        if (!runningRef.current) { eq(pattern.id, i, 'ABORT: not running at timer'); return }
        if (i + 1 < examples.length) playFrom(i + 1)
        else finish()
      }, FOLLOW_PAUSE_MS)
    }

    const url = patternExampleAudioUrl(voice, pattern.id, i, examples[i].en)
    eq(pattern.id, i, `calling ttsProvider.speak, url=${url ? url.split('/').pop() : 'null'}`)
    ttsProvider.speak({
      texts: [examples[i].en],
      audioUrls: url ? [url] : undefined,
      voiceKey: voice,
      voiceKeys: [voice],
      rate: RATE_MAP[prefs.speechRate],
      pitch: getPitchForKey(voice),
      volume: 1.0,
      onEnd: afterSpeak,
      onError: afterSpeak,
    })
  }, [examples, finish, pattern.id, prefs.speechRate, voice])

  const startPlayback = useCallback((from: number) => {
    setFeedback(null)
    runningRef.current = true
    startedAtRef.current = Date.now()
    playFrom(from)
  }, [playFrom])

  const seenAutoRef = useRef(autoPlayKey)
  useEffect(() => {
    if (autoPlayKey === seenAutoRef.current) return
    seenAutoRef.current = autoPlayKey
    if (active) { pausedAtRef.current = 0; startPlayback(0) }
  }, [autoPlayKey, active, startPlayback])

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (phase === 'speaking' || phase === 'pause') { stop(); return }
    if (!expanded) setExpanded(true)
    onRequestPlay()
    startPlayback(pausedAtRef.current)
  }

  const isPlaying = phase === 'speaking' || phase === 'pause'

  // Pattern Note
  const koNote = pattern.explanation ?? PATTERN_NOTES[pattern.id] ?? null
  const noteEntry = patternMeaningNoteTranslations.find(e => e.patternId === pattern.id)
  const patternNote = (() => {
    if (prefs.language === 'ko') return koNote
    if (!noteEntry?.noteTranslations) return koNote
    const mapped = prefs.language === 'zh-cn' ? 'zh-CN' : prefs.language === 'zh-tw' ? 'zh-TW' : prefs.language
    return noteEntry.noteTranslations[mapped as keyof typeof noteEntry.noteTranslations]
      ?? noteEntry.noteTranslations['en']
      ?? koNote
  })()

  const illustrationSrc = illustrationSrcForId(pattern.id)

  return (
    <div>
      {/* ── Collapsed row ── */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 py-4 text-left cursor-pointer"
        aria-expanded={expanded}
      >
        {/* Illustration — no background, transparent */}
        <div className="w-[84px] h-[84px] shrink-0 flex items-center justify-center">
          {illustrationSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={illustrationSrc}
              alt=""
              aria-hidden="true"
              className="w-[84px] h-[84px] object-contain"
            />
          )}
        </div>

        {/* Pattern info */}
        <div className="flex-1 min-w-0">
          <p className="font-playfair text-[1.05rem] font-bold text-[var(--pt)] leading-snug">
            {pattern.pattern}
          </p>
          <p className="text-[0.72rem] text-[var(--pa)] mt-0.5 font-semibold tracking-wide">
            {resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)}
          </p>
        </div>

        {/* Expand icon only when collapsed */}
        <ChevronDown
          className="w-4 h-4 text-[var(--pm2)] shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          strokeWidth={1.8}
        />
      </button>

      {/* ── Expanded content ── */}
      <div style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: 'grid-template-rows 260ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="pb-5 pl-1">
            {/* Pattern Note */}
            {patternNote && (
              <p className="text-[12px] leading-[1.85] text-[var(--pm)] mb-5 mt-1 whitespace-pre-line">
                {patternNote}
              </p>
            )}

            {/* Examples */}
            <div className="space-y-0.5">
              {examples.map((ex, i) => {
                const isActive = currentIdx === i
                const following = isActive && phase === 'pause'
                const isDone = doneMask[i] === true
                return (
                  <div
                    key={i}
                    className={[
                      'rounded-xl px-2 py-2 transition-colors duration-300',
                      isActive ? 'bg-[var(--pal)]' : '',
                    ].join(' ')}
                  >
                    <div className="flex gap-2.5 items-start">
                      <span className="shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                        {isDone ? (
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--pa)' }} />
                        ) : isActive ? (
                          <span className="w-2 h-2 rounded-full bg-[var(--pa)]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full" style={{ border: '1.5px solid var(--pd)' }} />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.82rem] font-medium text-[var(--pt)] leading-snug">{ex.en}</p>
                        {resolveTranslation(ex.ko, prefs.language, ex.translations) && (
                          <p className="text-[0.7rem] text-[var(--pm)] mt-0.5 leading-snug">
                            {resolveTranslation(ex.ko, prefs.language, ex.translations)}
                          </p>
                        )}
                        {following && (
                          <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] text-[var(--pa)] animate-pulse">
                            YOUR TURN
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Done feedback */}
            {phase === 'done' && feedback && (
              <div className="mt-3 ml-1 flex items-center gap-2 text-[var(--pa)]">
                <Check className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-[12px] font-bold">{feedback}</span>
              </div>
            )}

            {/* Bookmark + Audio — expanded state only */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--pd)]">
              <button
                type="button"
                onClick={handlePlay}
                aria-label={isPlaying ? t('stop') : t('listen')}
                className={[
                  'flex items-center gap-1.5 text-[11px] font-bold tracking-wide transition-colors cursor-pointer',
                  isPlaying ? 'text-[var(--pa)] animate-pulse' : 'text-[var(--pm)] hover:text-[var(--pa)]',
                ].join(' ')}
              >
                <Volume2 className="w-4 h-4" strokeWidth={1.8} />
                {isPlaying ? t('stop') : t('listen')}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleBookmark() }}
                aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
                className={[
                  'flex items-center gap-1.5 text-[11px] font-bold tracking-wide transition-colors cursor-pointer ml-auto',
                  bookmarked ? 'text-[var(--pa)]' : 'text-[var(--pm2)] hover:text-[var(--pa)]',
                ].join(' ')}
              >
                <Bookmark className="w-4 h-4" strokeWidth={1.8} fill={bookmarked ? 'currentColor' : 'none'} />
                {bookmarked ? t('bookmark_remove') : t('bookmark')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      {!isLast && <div className="h-px bg-[var(--pd)]" />}
    </div>
  )
}
