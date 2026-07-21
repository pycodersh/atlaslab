'use client'

import { useState } from 'react'
import type { StackAnimStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface Props { step: StackAnimStep; lang: KPattoLanguage }

export function StackAnimation({ step, lang }: Props) {
  const [showCoda, setShowCoda] = useState(false)
  const [exIdx, setExIdx] = useState(0)
  const ex = step.examples[exIdx]

  const nextExample = () => {
    setShowCoda(false)
    setTimeout(() => setExIdx(i => (i + 1) % step.examples.length), 100)
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--pm)' }}>
        {step.body[lang] ?? step.body.en}
      </p>

      {/* 3-layer structure visualizer */}
      <div style={{
        background: 'var(--pb)',
        border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
        borderRadius: 20,
        padding: '24px 20px',
        textAlign: 'center',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          {/* Structure labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {['①', '②', '③'].map((n, i) => (
              <div key={i} style={{
                fontSize: 11,
                color: i === 2 && !showCoda ? 'transparent' : 'var(--pm)',
                fontWeight: 700,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.3s',
              }}>{n}</div>
            ))}
          </div>

          {/* Syllable block */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{
              width: 60,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#4F8CFF',
              background: 'rgba(79,140,255,0.08)',
              borderRadius: '10px 10px 0 0',
            }}>
              {ex.consonant}
            </div>
            <div style={{
              width: 60,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#FF6B8C',
              background: 'rgba(255,107,140,0.08)',
            }}>
              {ex.vowel}
            </div>
            <div style={{
              width: 60,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#22C55E',
              background: 'rgba(34,197,94,0.08)',
              borderRadius: '0 0 10px 10px',
              transform: showCoda ? 'translateY(0)' : 'translateY(-20px)',
              opacity: showCoda ? 1 : 0,
              transition: 'transform 0.4s ease, opacity 0.3s ease',
            }}>
              {ex.coda}
            </div>
          </div>

          {/* Arrow + result */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
            opacity: showCoda ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            <div style={{ fontSize: 20, color: 'var(--pm)' }}>→</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--pt)' }}>{ex.result}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => setShowCoda(c => !c)}
            style={{
              padding: '8px 16px',
              borderRadius: 99,
              border: 'none',
              background: showCoda ? '#22C55E' : '#FF6B8C',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {showCoda ? '받침 숨기기' : '받침 추가하기 ↓'}
          </button>
          <button
            onClick={nextExample}
            style={{
              padding: '8px 16px',
              borderRadius: 99,
              border: '1.5px solid var(--border)',
              background: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              color: 'var(--pm)',
            }}
          >
            다음 예시
          </button>
        </div>
      </div>

      {/* Coda 7 cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {step.codas.map((coda, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--pb)',
            border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
            borderRadius: 12,
            padding: '10px 14px',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(34,197,94,0.1)',
              border: '1.5px solid rgba(34,197,94,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: '#22C55E',
              flexShrink: 0,
            }}>
              {coda.char}
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>[{coda.sound}] </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>{coda.example} </span>
              <span style={{ fontSize: 13, color: 'var(--pm)' }}>
                {coda.meaning[lang] ?? coda.meaning.en}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
