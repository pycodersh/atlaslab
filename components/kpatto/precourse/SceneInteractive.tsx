'use client'

import { useState } from 'react'
import { Coffee, Train, Music, type LucideIcon } from 'lucide-react'
import type { SceneStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: SceneStep; lang: KPattoLanguage }

const SCENE_ICONS: Record<string, LucideIcon> = {
  cafe: Coffee,
  subway: Train,
  kpop: Music,
}

export function SceneInteractive({ step, lang }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    const next = new Set(revealed)
    if (next.has(i)) next.delete(i); else next.add(i)
    setRevealed(next)
  }

  const SceneIcon = SCENE_ICONS[step.scene]

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
        {SceneIcon && <SceneIcon size={18} strokeWidth={1.8} color="#D4873A" />}
        {step.title[lang] ?? step.title.en}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#AAAAAA' }}>
        Tap to reveal the meaning
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
                background: isRevealed ? 'rgba(212,135,58,0.06)' : '#FFFFFF',
                border: `1.5px solid ${isRevealed ? 'rgba(212,135,58,0.25)' : 'rgba(0,0,0,0.07)'}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>
                {item.korean}
              </span>
              <span style={{
                fontSize: 14,
                color: '#D4873A',
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

      <div style={{ marginTop: 12, fontSize: 11, color: '#AAAAAA', textAlign: 'center' }}>
        {revealed.size}/{step.items.length} revealed
      </div>
    </div>
  )
}
