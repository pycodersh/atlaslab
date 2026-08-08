'use client'

import { useEffect, useRef, useState } from 'react'
import type { CombineAnimStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'
import { precourseAudioUrl } from '@/lib/kpatto/audio-url'
import { usePlayback } from '@/hooks/usePlayback'

interface Props { step: CombineAnimStep; lang: KPattoLanguage; lessonId?: number }

function useResultAudio(lessonId: number | undefined, text: string) {
  const id = `combine-${lessonId ?? 0}-${text}`
  const audioUrl = lessonId ? precourseAudioUrl(lessonId, text) : undefined
  const { toggle } = usePlayback(id)
  const play = () => audioUrl && toggle(audioUrl)
  return { play }
}

export function CombineAnimation({ step, lang, lessonId }: Props) {
  const [pairIdx, setPairIdx] = useState(0)
  const [phase, setPhase] = useState<'split' | 'merge' | 'done'>('split')
  const pair = step.pairs[pairIdx]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 재생 hook — 현재 pair
  const { play } = useResultAudio(lessonId, pair.result)

  useEffect(() => {
    setPhase('split')
    const t1 = setTimeout(() => setPhase('merge'), 800)
    const t2 = setTimeout(() => {
      setPhase('done')
      // 합쳐진 직후 자동 재생
      if (lessonId) play()
    }, 1400)
    timerRef.current = t2
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairIdx, lessonId])

  const goTo = (i: number) => {
    setPairIdx(i)
  }

  const next = () => {
    setPairIdx(i => (i + 1) % step.pairs.length)
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <p style={{ fontSize: 14, color: 'var(--pm)', marginBottom: 20, lineHeight: 1.55 }}>
        {step.explanation[lang] ?? step.explanation.en}
      </p>

      {/* Animation stage */}
      <div
        onClick={next}
        style={{
          background: '#FFF8F0',
          border: '1.5px solid rgba(212,135,58,0.15)',
          borderRadius: 20,
          padding: '32px 20px',
          cursor: 'pointer',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {/* Consonant */}
          <div style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#4F8CFF',
            transform: phase === 'merge' || phase === 'done' ? 'translateX(28px)' : 'translateX(0)',
            opacity: phase === 'done' ? 0 : 1,
            transition: 'transform 0.5s ease, opacity 0.3s ease',
          }}>
            {pair.consonant}
          </div>

          {/* Plus sign */}
          <div style={{
            fontSize: 24,
            color: 'var(--pm)',
            opacity: phase === 'done' ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}>+</div>

          {/* Vowel */}
          <div style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#FF6B8C',
            transform: phase === 'merge' || phase === 'done' ? 'translateX(-28px)' : 'translateX(0)',
            opacity: phase === 'done' ? 0 : 1,
            transition: 'transform 0.5s ease, opacity 0.3s ease',
          }}>
            {pair.vowel}
          </div>
        </div>

        {/* Result */}
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#D4873A',
          opacity: phase === 'done' ? 1 : 0,
          transform: phase === 'done' ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          lineHeight: 1,
          marginBottom: 8,
        }}>
          {pair.result}
        </div>

        <div style={{ fontSize: 12, color: 'var(--pm)', marginTop: 8 }}>
          {pairIdx + 1} / {step.pairs.length}
          {lessonId ? ' — Tap to hear' : ' — Tap to continue'}
        </div>
      </div>

      {/* Indicator dots — tap to jump + replay */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
        {step.pairs.map((p, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              padding: '6px 12px',
              borderRadius: 99,
              border: `1.5px solid ${i === pairIdx ? '#D4873A' : 'rgba(0,0,0,0.10)'}`,
              background: i === pairIdx ? 'rgba(212,135,58,0.12)' : 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              color: i === pairIdx ? '#D4873A' : 'var(--pm)',
            }}
          >
            {p.result}
          </button>
        ))}
      </div>
    </div>
  )
}
