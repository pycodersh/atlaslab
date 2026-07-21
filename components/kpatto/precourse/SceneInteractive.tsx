'use client'

import { useState } from 'react'
import type { SceneStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: SceneStep; lang: KPattoLanguage }

const SCENE_EMOJI: Record<string, string> = {
  cafe: '☕',
  subway: '🚇',
  kpop: '🎵',
}

export function SceneInteractive({ step, lang }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    const next = new Set(revealed)
    if (next.has(i)) next.delete(i); else next.add(i)
    setRevealed(next)
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {SCENE_EMOJI[step.scene]} {step.title[lang] ?? step.title.en}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--pm)' }}>
        탭해서 뜻을 확인해요
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {step.items.map((item, i) => {
          const isRevealed = revealed.has(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isRevealed ? 'rgba(79,140,255,0.06)' : 'var(--pb)',
                border: `1.5px solid ${isRevealed ? 'rgba(79,140,255,0.3)' : 'var(--border, rgba(0,0,0,0.08))'}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--pt)' }}>
                {item.korean}
              </span>
              <span style={{
                fontSize: 14,
                color: '#4F8CFF',
                fontWeight: 600,
                opacity: isRevealed ? 1 : 0,
                transition: 'opacity 0.2s',
              }}>
                {item.meaning[lang] ?? item.meaning.en}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--pm)', textAlign: 'center' }}>
        {revealed.size}/{step.items.length} 확인
      </div>
    </div>
  )
}
