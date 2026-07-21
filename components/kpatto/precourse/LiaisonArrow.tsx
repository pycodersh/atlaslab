'use client'

import { useState } from 'react'
import type { LiaisonDemoStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: LiaisonDemoStep; lang: KPattoLanguage }

export function LiaisonArrow({ step, lang }: Props) {
  const [active, setActive] = useState(0)
  const ex = step.examples[active]

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--pm)' }}>
        {step.body[lang] ?? step.body.en}
      </p>

      {/* Main card */}
      <div style={{
        background: 'var(--pb)',
        border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
        borderRadius: 20,
        padding: '24px 20px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* Written */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--pm)', marginBottom: 4, fontWeight: 600 }}>표기</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--pt)' }}>{ex.written}</div>
          </div>

          {/* SVG arrow */}
          <svg width="60" height="30" viewBox="0 0 60 30">
            <path
              d="M0 15 Q30 0 60 15"
              fill="none"
              stroke="#FF6B8C"
              strokeWidth="2"
              strokeDasharray="60"
              strokeDashoffset="0"
              style={{ animation: 'kp-dash 0.8s ease forwards' }}
            />
            <polygon points="56,10 60,15 56,20" fill="#FF6B8C" />
          </svg>

          {/* Pronounced */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--pm)', marginBottom: 4, fontWeight: 600 }}>발음</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FF6B8C' }}>{ex.pronounced}</div>
          </div>
        </div>

        <div style={{
          padding: '10px 14px',
          background: 'rgba(255,107,140,0.08)',
          borderRadius: 10,
          fontSize: 13,
          color: 'var(--pm)',
        }}>
          {ex.note[lang] ?? ex.note.en}
        </div>
      </div>

      {/* Example tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {step.examples.map((e, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              padding: '6px 12px',
              borderRadius: 99,
              border: `1.5px solid ${i === active ? '#FF6B8C' : 'var(--border, rgba(0,0,0,0.1))'}`,
              background: i === active ? 'rgba(255,107,140,0.1)' : 'none',
              color: i === active ? '#FF6B8C' : 'var(--pm)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {e.written}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes kp-dash {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
