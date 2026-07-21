'use client'

import { useState } from 'react'
import type { CardFlipGridStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: CardFlipGridStep; lang: KPattoLanguage; onAllFlipped?: () => void }

export function CardFlipGrid({ step, lang, onAllFlipped }: Props) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    const next = new Set(flipped)
    if (next.has(i)) next.delete(i); else next.add(i)
    setFlipped(next)
    if (next.size === step.cards.length) onAllFlipped?.()
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      {step.note && (
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--pm)' }}>
          {step.note[lang] ?? step.note.en}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {step.cards.map((card, i) => {
          const isFlipped = flipped.has(i)
          return (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                height: 110,
                cursor: 'pointer',
                perspective: 600,
                userSelect: 'none',
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.5s ease',
              }}>
                {/* Front */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  background: 'var(--pb)',
                  border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 44,
                  fontWeight: 800,
                  color: '#4F8CFF',
                }}>
                  {card.front}
                </div>
                {/* Back */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                  border: '1.5px solid #C7D2FE',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: 8,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#4338CA' }}>{card.back}</div>
                  {card.sub && (
                    <div style={{ fontSize: 11, color: '#6366F1', textAlign: 'center', lineHeight: 1.3 }}>
                      {card.sub}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--pm)', textAlign: 'center' }}>
        {flipped.size}/{step.cards.length} 카드 확인
      </div>
    </div>
  )
}
