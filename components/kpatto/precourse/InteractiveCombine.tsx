'use client'

import { useEffect, useState } from 'react'
import type { InteractiveCombineStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

// Precomputed result map for common combinations
function combine(consonant: string, vowel: string): string {
  // Use Unicode composition: base codepoints
  const consonantMap: Record<string, number> = {
    'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6,
    'ㅂ': 7, 'ㅃ': 8, 'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13,
    'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18,
  }
  const vowelMap: Record<string, number> = {
    'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6,
    'ㅖ': 7, 'ㅗ': 8, 'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13,
    'ㅝ': 14, 'ㅞ': 15, 'ㅟ': 16, 'ㅡ': 17, 'ㅢ': 18, 'ㅣ': 19,
  }
  const ci = consonantMap[consonant]
  const vi = vowelMap[vowel]
  if (ci === undefined || vi === undefined) return consonant + vowel
  return String.fromCharCode(0xAC00 + ci * 21 * 28 + vi * 28)
}

interface Props {
  step: InteractiveCombineStep
  lang: KPattoLanguage
  onMinTrials?: (n: number) => void  // called when user hits n trials
}

export function InteractiveCombine({ step, lang, onMinTrials }: Props) {
  const [selC, setSelC] = useState<string | null>(null)
  const [selV, setSelV] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [trials, setTrials] = useState(0)

  useEffect(() => {
    if (selC && selV) {
      setResult(combine(selC, selV))
      const next = trials + 1
      setTrials(next)
      if (next >= 3) onMinTrials?.(next)
    } else {
      setResult(null)
    }
  }, [selC, selV])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--pm)' }}>
        {step.body[lang] ?? step.body.en}
      </p>

      {/* Result display */}
      <div style={{
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--pb)',
        border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
        borderRadius: 16,
        marginBottom: 16,
        gap: 12,
      }}>
        <span style={{ fontSize: 40, color: '#4F8CFF', fontWeight: 800 }}>{selC ?? '?'}</span>
        <span style={{ fontSize: 20, color: 'var(--pm)' }}>+</span>
        <span style={{ fontSize: 40, color: '#FF6B8C', fontWeight: 800 }}>{selV ?? '?'}</span>
        <span style={{ fontSize: 20, color: 'var(--pm)' }}>=</span>
        <span style={{
          fontSize: 56,
          fontWeight: 800,
          color: 'var(--pt)',
          opacity: result ? 1 : 0.2,
          transform: result ? 'scale(1)' : 'scale(0.7)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}>
          {result ?? '?'}
        </span>
      </div>

      {/* Consonants */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4F8CFF', marginBottom: 8 }}>자음</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {step.consonants.map(c => (
            <button
              key={c}
              onClick={() => setSelC(c === selC ? null : c)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: `2px solid ${c === selC ? '#4F8CFF' : 'var(--border, rgba(0,0,0,0.1))'}`,
                background: c === selC ? 'rgba(79,140,255,0.12)' : 'var(--pb)',
                fontSize: 20,
                fontWeight: 800,
                color: c === selC ? '#4F8CFF' : 'var(--pt)',
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Vowels */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B8C', marginBottom: 8 }}>모음</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {step.vowels.map(v => (
            <button
              key={v}
              onClick={() => setSelV(v === selV ? null : v)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: `2px solid ${v === selV ? '#FF6B8C' : 'var(--border, rgba(0,0,0,0.1))'}`,
                background: v === selV ? 'rgba(255,107,140,0.12)' : 'var(--pb)',
                fontSize: 20,
                fontWeight: 800,
                color: v === selV ? '#FF6B8C' : 'var(--pt)',
                cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--pm)' }}>
        {trials}회 시도 {trials < 3 ? `(3회 이상 해봐요!)` : '✓'}
      </div>
    </div>
  )
}
