'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Volume2, Square, Check } from 'lucide-react'

import type { MagazinePattern } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { RATE_MAP, type VoiceKey } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, patternExampleAudioUrl } from '@/lib/tts'
import { getRecord, recordPatternPractice } from '@/lib/srs/storage'

type Props = {
  storyId: number
  storyTitle: string
  narratorVoice?: VoiceKey
  pattern: MagazinePattern
  examples: PracticeExample[]
}

type Phase = 'idle' | 'speaking' | 'pause' | 'done'

// 예문 1개 재생 후 따라 읽기 시간 (ms)
const FOLLOW_PAUSE_MS = 2500

export function PatternDetail({ storyId, storyTitle, narratorVoice, pattern, examples }: Props) {
  const router = useRouter()
  const { prefs } = usePreferences()
  const showTranslation = prefs.translationLang !== 'none'
  const voice: VoiceKey = narratorVoice ?? prefs.voice

  const [phase, setPhase] = useState<Phase>('idle')
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [repeatCount, setRepeatCount] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  const runningRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)

  // 저장된 반복 횟수 로드
  useEffect(() => {
    setRepeatCount(getRecord('pattern', pattern.id)?.repeatCount ?? 0)
  }, [pattern.id])

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const stop = useCallback(() => {
    runningRef.current = false
    clearTimer()
    ttsProvider.stop()
    setPhase('idle')
    setCurrentIdx(-1)
  }, [])

  // 언마운트 시 정지
  useEffect(() => () => { runningRef.current = false; clearTimer(); ttsProvider.stop() }, [])

  const finish = useCallback(() => {
    runningRef.current = false
    const duration = Date.now() - startedAtRef.current
    const rec = recordPatternPractice(pattern.id, storyId, pattern.pattern, storyTitle, duration)
    setRepeatCount(rec.repeatCount)
    setFeedback(`반복 ${rec.repeatCount}회 완료`)
    setPhase('done')
    setCurrentIdx(-1)
  }, [pattern.id, pattern.pattern, storyId, storyTitle])

  const playFrom = useCallback((i: number) => {
    if (!runningRef.current) return
    setCurrentIdx(i)
    setPhase('speaking')

    let advanced = false
    const afterSpeak = () => {
      if (advanced || !runningRef.current) return
      advanced = true
      setPhase('pause') // "따라 읽어보세요"
      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return
        if (i + 1 < examples.length) playFrom(i + 1)
        else finish()
      }, FOLLOW_PAUSE_MS)
    }

    const url = patternExampleAudioUrl(voice, pattern.id, i)
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

  const handlePlay = () => {
    if (phase === 'speaking' || phase === 'pause') { stop(); return }
    setFeedback(null)
    runningRef.current = true
    startedAtRef.current = Date.now()
    playFrom(0)
  }

  const isPlaying = phase === 'speaking' || phase === 'pause'

  return (
    <div className="min-h-dvh bg-[var(--pb)] flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => { stop(); router.back() }}
          className="p-2 -ml-2 rounded-full text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.6} />
        </button>
        <span className="text-[9px] tracking-[0.25em] text-[var(--pa)] font-semibold">PATTERN PRACTICE</span>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-10">

        {/* 패턴 문장 */}
        <div className="pt-4 pb-6 border-b border-[var(--pd)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-playfair text-[1.9rem] font-bold text-[var(--pt)] leading-tight">
                {pattern.pattern}
              </h1>
              {showTranslation && (
                <p className="text-[0.85rem] text-[var(--pa)] mt-1">{pattern.meaningKo}</p>
              )}
            </div>
            <span className="shrink-0 mt-1 text-[10px] font-semibold text-[var(--pm)] bg-[var(--pc)] rounded-full px-3 py-1">
              반복 {repeatCount}회
            </span>
          </div>
        </div>

        {/* 스피커 버튼 */}
        <div className="py-6 flex flex-col items-center">
          <button
            type="button"
            onClick={handlePlay}
            aria-label={isPlaying ? '정지' : '예문 5개 듣기'}
            className={[
              'flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[13px] font-bold tracking-[0.04em] transition-colors cursor-pointer',
              isPlaying ? 'bg-[var(--pd)] text-[var(--pa)]' : 'bg-[var(--pa)] text-white hover:opacity-90',
            ].join(' ')}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
            {isPlaying ? '정지' : `예문 ${examples.length}개 듣기`}
          </button>
          <p className="text-[11px] text-[var(--pm)] mt-3">
            한 문장씩 듣고 따라 읽으며 패턴을 익혀보세요.
          </p>
        </div>

        {/* 예문 5개 */}
        <div className="space-y-2.5">
          {examples.map((ex, i) => {
            const active = currentIdx === i
            const following = active && phase === 'pause'
            return (
              <div
                key={i}
                className={[
                  'rounded-2xl px-4 py-3.5 border transition-colors duration-300',
                  active
                    ? 'border-[var(--pa)] bg-[var(--pal)]'
                    : 'border-[var(--pd)] bg-transparent',
                ].join(' ')}
              >
                <div className="flex gap-3 items-start">
                  <span className={[
                    'font-playfair text-[1.1rem] font-bold w-5 shrink-0 leading-tight pt-0.5 transition-colors',
                    active ? 'text-[var(--pa)]' : 'text-[var(--pm2)]',
                  ].join(' ')}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[0.95rem] font-medium text-[var(--pt)] leading-relaxed">
                        {ex.en}
                      </p>
                      {i === 0 && (
                        <span className="text-[8px] tracking-[0.12em] font-bold text-[var(--pa)] bg-[var(--pc)] rounded px-1.5 py-0.5">
                          STORY
                        </span>
                      )}
                    </div>
                    {showTranslation && (
                      <p className="text-[0.78rem] text-[var(--pm)] mt-1 leading-relaxed">{ex.ko}</p>
                    )}
                    {following && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--pa)] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--pa)]" />
                        따라 읽어보세요
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
          <div className="mt-7 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[var(--pa)] flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <p className="font-playfair text-[1.3rem] font-bold text-[var(--pt)]">{feedback}</p>
            <p className="text-[12px] text-[var(--pm)] mt-1">한 번 더 반복하면 더 자연스러워져요.</p>
            <button
              type="button"
              onClick={handlePlay}
              className="mt-5 rounded-full px-6 py-2.5 text-[12px] font-bold tracking-[0.04em] bg-[var(--pa)] text-white hover:opacity-90 transition-colors cursor-pointer"
            >
              다시 반복하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
