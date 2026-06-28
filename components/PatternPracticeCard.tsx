'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, Bookmark } from 'lucide-react'

import type { MagazinePattern } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { RATE_MAP, type VoiceKey } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, patternExampleAudioUrl } from '@/lib/tts'
import { recordPatternPractice } from '@/lib/srs/storage'
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks/storage'

type Props = {
  storyId: number
  storyTitle: string
  voice: VoiceKey
  pattern: MagazinePattern
  examples: PracticeExample[]
  index: number            // 1-based 위치 (Pattern N)
  active: boolean          // 이 카드가 현재 재생 중인 카드인지 (한 번에 하나만)
  onRequestPlay: () => void // 재생 시작 시 부모에 알려 다른 카드 정지
}

type Phase = 'idle' | 'speaking' | 'pause' | 'done'

// 예문 1개 재생 후 따라 읽기 시간 (ms)
const FOLLOW_PAUSE_MS = 2500

export function PatternPracticeCard({
  storyId, storyTitle, voice, pattern, examples, index, active, onRequestPlay,
}: Props) {
  const { prefs } = usePreferences()
  const showTranslation = prefs.translationLang !== 'none'

  const [phase, setPhase] = useState<Phase>('idle')
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [playingAll, setPlayingAll] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)

  const runningRef = useRef(false)   // 전체 재생 시퀀스 진행 중
  const singleRef = useRef(false)    // 개별 예문 재생 중
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)
  const playingIdxRef = useRef(0)
  const pausedAtRef = useRef(0)      // 전체 재생 멈춘 위치 (재개용)

  useEffect(() => { setBookmarked(isBookmarked(pattern.id)) }, [pattern.id])

  function handleBookmark() {
    setBookmarked(toggleBookmark({
      patternId: pattern.id,
      pattern: pattern.pattern,
      meaningKo: pattern.meaningKo,
      storyId,
    }))
  }

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  // 모든 재생 정지
  const stop = useCallback(() => {
    if (runningRef.current) {
      // 전체 재생 중단 → 위치 기억 + 하이라이트 유지
      pausedAtRef.current = playingIdxRef.current
      setCurrentIdx(playingIdxRef.current)
    } else {
      setCurrentIdx(-1)
    }
    runningRef.current = false
    singleRef.current = false
    clearTimer()
    ttsProvider.stop()
    setPlayingAll(false)
    setPhase('idle')
  }, [])

  // 다른 카드가 활성화되면 이 카드는 정지
  useEffect(() => {
    if (!active && (runningRef.current || singleRef.current)) stop()
  }, [active, stop])

  useEffect(() => () => { runningRef.current = false; singleRef.current = false; clearTimer(); ttsProvider.stop() }, [])

  const finish = useCallback(() => {
    runningRef.current = false
    const duration = Date.now() - startedAtRef.current
    const rec = recordPatternPractice(pattern.id, storyId, pattern.pattern, storyTitle, duration)
    setFeedback(`반복 ${rec.repeatCount}회 완료`)
    setPhase('done')
    setPlayingAll(false)
    setCurrentIdx(-1)
    pausedAtRef.current = 0
  }, [pattern.id, pattern.pattern, storyId, storyTitle])

  // ── 전체 재생 시퀀스 ──
  const playFrom = useCallback((i: number) => {
    if (!runningRef.current) return
    playingIdxRef.current = i
    setCurrentIdx(i)
    setPhase('speaking')

    let advanced = false
    const afterSpeak = () => {
      if (advanced || !runningRef.current) return
      advanced = true
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

  function handlePlayAll() {
    if (runningRef.current) { stop(); return } // 재생 중이면 일시정지
    onRequestPlay()
    setFeedback(null)
    runningRef.current = true
    singleRef.current = false
    setPlayingAll(true)
    startedAtRef.current = Date.now()
    playFrom(pausedAtRef.current) // 멈춘 위치에서 재개
  }

  // ── 개별 예문 재생 ──
  function handlePlaySingle(i: number) {
    // 같은 예문을 다시 누르면 정지
    if (singleRef.current && currentIdx === i) { stop(); return }
    // 진행 중이던 재생 정리
    clearTimer(); ttsProvider.stop()
    runningRef.current = false
    setPlayingAll(false)
    setPhase('idle')

    onRequestPlay()
    singleRef.current = true
    setCurrentIdx(i)

    const url = patternExampleAudioUrl(voice, pattern.id, i, examples[i].en)
    ttsProvider.speak({
      texts: [examples[i].en],
      audioUrls: url ? [url] : undefined,
      voiceKey: voice,
      voiceKeys: [voice],
      rate: RATE_MAP[prefs.speechRate],
      pitch: getPitchForKey(voice),
      volume: 1.0,
      onEnd: () => { singleRef.current = false; setCurrentIdx(-1) },
      onError: () => { singleRef.current = false; setCurrentIdx(-1) },
    })
  }

  return (
    <article className="py-7">
      {/* 헤더: 번호 · 패턴 · 북마크(우측 상단) */}
      <header className="flex items-start gap-3.5">
        <span className="font-playfair text-[1.05rem] font-bold text-[var(--pa)] leading-none shrink-0 pt-1.5 tabular-nums">
          {String(index).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-playfair text-[1.35rem] font-bold text-[var(--pt)] leading-snug">{pattern.pattern}</p>
          {showTranslation && <p className="text-[0.78rem] text-[var(--pm)] mt-1">{pattern.meaningKo}</p>}
        </div>
        <button
          type="button"
          onClick={handleBookmark}
          aria-label={bookmarked ? '북마크 해제' : '북마크'}
          className={[
            'shrink-0 p-1 -mr-1 transition-colors cursor-pointer',
            bookmarked ? 'text-[var(--pa)]' : 'text-[var(--pm2)] hover:text-[var(--pa)]',
          ].join(' ')}
        >
          <Bookmark className="w-[19px] h-[19px]" strokeWidth={1.6} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </header>

      {/* 전체 재생 */}
      <button
        type="button"
        onClick={handlePlayAll}
        aria-label={playingAll ? '재생 중' : '전체 재생'}
        className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.03em] text-[var(--pa)] hover:opacity-70 transition-opacity cursor-pointer"
      >
        {playingAll
          ? <><Pause className="w-3.5 h-3.5 fill-current" /> 재생 중...</>
          : <><Play className="w-3.5 h-3.5 fill-current" /> 전체 재생</>}
      </button>

      {/* 예문 5개 */}
      <ul className="mt-4 space-y-1">
        {examples.map((ex, i) => {
          const isActive = currentIdx === i
          const following = isActive && phase === 'pause'
          return (
            <li
              key={i}
              className={[
                'flex items-start gap-3 rounded-r-md pl-4 pr-1 py-2.5 border-l-2 transition-colors duration-300',
                isActive ? 'border-[var(--pa)] bg-[var(--pal)]' : 'border-transparent',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[0.92rem] text-[var(--pt)] leading-relaxed">{ex.en}</p>
                {showTranslation && (
                  <p className="text-[0.74rem] text-[var(--pm)] mt-0.5 leading-relaxed">{ex.ko}</p>
                )}
                {following && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--pa)] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--pa)]" />
                    따라 읽어보세요
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handlePlaySingle(i)}
                aria-label="이 문장 재생"
                className={[
                  'shrink-0 p-1.5 mt-0.5 transition-colors cursor-pointer',
                  isActive ? 'text-[var(--pa)]' : 'text-[var(--pm2)] hover:text-[var(--pa)]',
                ].join(' ')}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </li>
          )
        })}
      </ul>

      {/* 완료 피드백 */}
      {phase === 'done' && feedback && (
        <p className="mt-3 pl-4 text-[11px] font-semibold text-[var(--pa)]">{feedback}</p>
      )}
    </article>
  )
}
