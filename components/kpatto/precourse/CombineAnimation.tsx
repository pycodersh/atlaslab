'use client'

import { useEffect, useState } from 'react'
import type { CombineAnimStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: CombineAnimStep; lang: KPattoLanguage }

export function CombineAnimation({ step, lang }: Props) {
  const [pairIdx, setPairIdx] = useState(0)
  const [phase, setPhase] = useState<'split' | 'merge' | 'done'>('split')
  const pair = step.pairs[pairIdx]

  useEffect(() => {
    setPhase('split')
    const t1 = setTimeout(() => setPhase('merge'), 800)
    const t2 = setTimeout(() => setPhase('done'), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pairIdx])

  const next = () => setPairIdx(i => (i + 1) % step.pairs.length)

  return (
    <div style={{ padding: '0 20px' }}>
      <p style={{ fontSize: 14, color: 'var(--pm)', marginBottom: 20, lineHeight: 1.55 }}>
        {step.explanation[lang] ?? step.explanation.en}
      </p>

      {/* Animation stage */}
      <div
        onClick={next}
        style={{
          background: 'var(--pb)',
          border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
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
          color: 'var(--pt)',
          opacity: phase === 'done' ? 1 : 0,
          transform: phase === 'done' ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          lineHeight: 1,
          marginBottom: 8,
        }}>
          {pair.result}
        </div>

        <div style={{ fontSize: 12, color: 'var(--pm)', marginTop: 8 }}>
          {pairIdx + 1} / {step.pairs.length} — 탭해서 다음
        </div>
      </div>

      {/* All pairs preview */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
        {step.pairs.map((p, i) => (
          <button
            key={i}
            onClick={() => setPairIdx(i)}
            style={{
              padding: '6px 12px',
              borderRadius: 99,
              border: `1.5px solid ${i === pairIdx ? '#FF6B8C' : 'var(--border, rgba(0,0,0,0.1))'}`,
              background: i === pairIdx ? 'rgba(255,107,140,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              color: i === pairIdx ? '#FF6B8C' : 'var(--pm)',
            }}
          >
            {p.result}
          </button>
        ))}
      </div>
    </div>
  )
}
