'use client'

import { useState } from 'react'
import type { StrokeGridStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: StrokeGridStep; lang: KPattoLanguage }

export function StrokeGrid({ step, lang }: Props) {
  const [activeChar, setActiveChar] = useState<string | null>(null)

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

      {step.groups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: group.color,
            letterSpacing: '0.06em',
            marginBottom: 10,
          }}>
            {group.label[lang] ?? group.label.en}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}>
            {group.consonants.map((c, ci) => {
              const isActive = activeChar === `${gi}-${ci}`
              return (
                <button
                  key={ci}
                  onClick={() => setActiveChar(isActive ? null : `${gi}-${ci}`)}
                  style={{
                    background: isActive ? `${group.color}18` : 'var(--pb)',
                    border: `1.5px solid ${isActive ? group.color : 'var(--border, rgba(0,0,0,0.08))'}`,
                    borderRadius: 14,
                    padding: '12px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {/* Char with pseudo-stroke animation via CSS */}
                  <div style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: isActive ? group.color : 'var(--pt)',
                    transition: 'color 0.2s',
                    animation: isActive ? 'kp-draw 0.4s ease' : 'none',
                  }}>
                    {c.char}
                  </div>
                  <div style={{ fontSize: 10, color: group.color, fontWeight: 700 }}>
                    {c.romanization}
                  </div>
                  {isActive && (
                    <div style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'var(--pm)',
                      borderTop: `1px solid ${group.color}40`,
                      paddingTop: 4,
                      width: '100%',
                      textAlign: 'center',
                    }}>
                      {c.example}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes kp-draw {
          0% { transform: scale(0.7); opacity: 0.3; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
