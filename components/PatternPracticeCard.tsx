'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Check, Bookmark, ChevronDown } from 'lucide-react'

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
import { TappableWordText } from '@/components/TappableWordText'

type Props = {
  storyId: number
  storyTitle: string
  voice: VoiceKey
  pattern: MagazinePattern
  examples: PracticeExample[]
  index: number            // 1-based 위치 (Pattern N)
  active: boolean          // 이 카드가 현재 재생 중인 카드인지 (한 번에 하나만)
  onRequestPlay: () => void // 수동 재생 시 부모에 알려 다른 카드 정지
  autoPlayKey?: number     // "전체 듣기": 값이 바뀌고 active면 자동 시작
  onFinished?: () => void  // 5개 예문 재생 완료 시
}

type Phase = 'idle' | 'speaking' | 'pause' | 'done'

const FOLLOW_PAUSE_MS = 2500

export function PatternPracticeCard({
  storyId, storyTitle, voice, pattern, examples, index,
  active, onRequestPlay, autoPlayKey, onFinished,
}: Props) {
  const { prefs } = usePreferences()
  const t = useT()
  const showTranslation = true


  const [phase, setPhase] = useState<Phase>('idle')
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [noteOpen, setNoteOpen] = useState(true)
  const [doneMask, setDoneMask] = useState<boolean[]>([])
  const doneRef = useRef<Set<number>>(new Set())

  // Reset done indicators when the pattern changes
  useEffect(() => {
    doneRef.current = new Set()
    setDoneMask([])
    setNoteOpen(true)
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
  const playingIdxRef = useRef(0)  // 현재 읽는 예문 index
  const pausedAtRef = useRef(0)    // 멈춘 위치 — 다시 누르면 여기서 재개

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const stop = useCallback(() => {
    // 재생 중에 멈췄으면 위치를 기억하고, 그 예문 하이라이트를 유지
    if (runningRef.current) {
      pausedAtRef.current = playingIdxRef.current
      setCurrentIdx(playingIdxRef.current)
    }
    runningRef.current = false
    clearTimer()
    ttsProvider.stop()
    setPhase('idle')
  }, [])

  // 다른 카드가 활성화되면(=active=false) 이 카드는 정지
  useEffect(() => {
    if (!active && runningRef.current) stop()
  }, [active, stop])

  useEffect(() => () => { runningRef.current = false; clearTimer(); ttsProvider.stop() }, [])

  const finish = useCallback(() => {
    runningRef.current = false
    const duration = Date.now() - startedAtRef.current
    const rec = recordPatternPractice(pattern.id, storyId, pattern.pattern, storyTitle, duration)
    setFeedback(t('repeat_done', { n: rec.repeatCount }))
    setPhase('done')
    setCurrentIdx(-1)
    pausedAtRef.current = 0  // 끝까지 읽었으면 다음엔 처음부터
    onFinished?.()
  }, [pattern.id, pattern.pattern, storyId, storyTitle, onFinished])

  const playFrom = useCallback((i: number) => {
    if (!runningRef.current) return
    playingIdxRef.current = i
    setCurrentIdx(i)
    setPhase('speaking')

    let advanced = false
    const afterSpeak = () => {
      if (advanced || !runningRef.current) return
      advanced = true
      // Mark example as done when the follow-along pause starts
      doneRef.current.add(i)
      setDoneMask(Array.from({ length: examples.length }, (_, j) => doneRef.current.has(j)))
      setPhase('pause')
      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return
        if (i + 1 < examples.length) playFrom(i + 1)
        else finish()
      }, FOLLOW_PAUSE_MS)
    }

    const url = patternExampleAudioUrl(voice, pattern.id, i, examples[i].en)
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

  // "전체 듣기" 자동 시작 — autoPlayKey가 바뀌고 이 카드가 active일 때 (항상 처음부터)
  const seenAutoRef = useRef(autoPlayKey)
  useEffect(() => {
    if (autoPlayKey === seenAutoRef.current) return
    seenAutoRef.current = autoPlayKey
    if (active) { pausedAtRef.current = 0; startPlayback(0) }
  }, [autoPlayKey, active, startPlayback])

  const handlePlay = () => {
    if (phase === 'speaking' || phase === 'pause') { stop(); return }
    onRequestPlay()
    startPlayback(pausedAtRef.current)  // 멈춘 위치에서 재개
  }

  const isPlaying = phase === 'speaking' || phase === 'pause'

  // Pattern Note: show for all languages using translated version, fallback to ko
  const koNote = pattern.explanation ?? PATTERN_NOTES[pattern.id] ?? null
  const noteEntry = patternMeaningNoteTranslations.find(t => t.patternId === pattern.id)
  const patternNote = (() => {
    if (prefs.language === 'ko') return koNote
    if (!noteEntry?.noteTranslations) return null  // no translation (patterns 13-100)
    const mapped = prefs.language === 'zh-cn' ? 'zh-CN' : prefs.language === 'zh-tw' ? 'zh-TW' : prefs.language
    return noteEntry.noteTranslations[mapped as keyof typeof noteEntry.noteTranslations]
      ?? noteEntry.noteTranslations['en']
      ?? koNote
  })()

  return (
    <div className="py-3">
      {/* Pattern 헤더 */}
      <div className="flex items-start gap-3">
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pa)', lineHeight: 1, flexShrink: 0, paddingTop: 4 }}>
          {String(index).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pt)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{pattern.pattern}</p>
          {showTranslation && resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations) && (
            <p className="text-[0.74rem] text-[var(--pa)] mt-0.5">
              {resolveTranslation(pattern.meaningKo, prefs.language, pattern.meaningTranslations)}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1 mt-0.5">
          {/* 북마크 */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={bookmarked ? t('bookmark_remove') : t('bookmark')}
            className={[
              'p-1 transition-colors cursor-pointer',
              bookmarked ? 'text-[var(--pa)]' : 'text-[var(--pm2)] hover:text-[var(--pa)]',
            ].join(' ')}
          >
            <Bookmark className="w-[18px] h-[18px]" strokeWidth={1.8} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          {/* 스피커 아이콘 */}
          <button
            type="button"
            onClick={handlePlay}
            aria-label={isPlaying ? t('stop') : t('listen')}
            className={[
              'p-1 transition-colors cursor-pointer',
              isPlaying ? 'text-[var(--pa)] animate-pulse' : 'text-[var(--pm2)] hover:text-[var(--pa)]',
            ].join(' ')}
          >
            <Volume2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Pattern Note — editorial section */}
      {patternNote && (
        <div style={{ marginTop: 14 }}>
          {/* Divider + label row — not a button, feels like a magazine section header */}
          <div
            onClick={() => setNoteOpen(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 11,
              paddingBottom: 11,
              borderTop: '1px solid var(--pd)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--pm)',
              lineHeight: 1,
            }}>
              PATTERN NOTE
            </span>
            <ChevronDown
              style={{
                width: 11,
                height: 11,
                color: 'var(--pm2)',
                flexShrink: 0,
                transform: noteOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              strokeWidth={1.5}
            />
          </div>

          {/* Smooth height animation via CSS grid */}
          <div style={{
            display: 'grid',
            gridTemplateRows: noteOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                margin: 0,
                paddingTop: 2,
                paddingBottom: 18,
                fontSize: 12.5,
                lineHeight: 1.85,
                color: 'var(--pm)',
                whiteSpace: 'pre-line',
                letterSpacing: '0.01em',
              }}>
                {patternNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 예문 목록 */}
      <div className="mt-3 space-y-0.5">
        {examples.map((ex, i) => {
          const isActive = currentIdx === i
          const following = isActive && phase === 'pause'
          const isDone = doneMask[i] === true

          return (
            <div
              key={i}
              className={[
                'rounded-lg px-2 py-1.5 transition-colors duration-300',
                isActive ? 'bg-[var(--pal)]' : '',
              ].join(' ')}
            >
              <div className="flex gap-2.5 items-start">
                {/* Done indicator: ✓ → done, filled dot → active, open circle → pending */}
                <span className="shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                  {isDone ? (
                    <Check
                      className="w-3.5 h-3.5"
                      strokeWidth={2.5}
                      style={{ color: 'var(--pa)' }}
                    />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[var(--pa)]" />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ border: '1.5px solid var(--pd)' }}
                    />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <TappableWordText
                    text={ex.en}
                    source={{
                      sourceType:       'example',
                      sourceId:         pattern.id,
                      storyId,
                      patternId:        pattern.id,
                      exampleIndex:     i,
                      originalSentence: ex.en,
                    }}
                    className="text-[0.82rem] font-medium text-[var(--pt2)] leading-snug block"
                  />
                  {showTranslation && resolveTranslation(ex.ko, prefs.language, ex.translations) && (
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

      {/* 완료 피드백 */}
      {phase === 'done' && feedback && (
        <div className="mt-3 ml-1 flex items-center gap-2 text-[var(--pa)]">
          <Check className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[12px] font-bold">{feedback}</span>
        </div>
      )}
    </div>
  )
}
