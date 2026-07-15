'use client'
import React, { useEffect, useState } from 'react'
import { COLORS, S1 } from './motionConstants'

function FloatingWord({ text, top, left, right, floatDuration, delay }: {
  text: string; top: string; left?: string; right?: string
  floatDuration: number; delay: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      position: 'absolute', top,
      left: left ?? undefined, right: right ?? undefined,
      opacity: visible ? 1 : 0,
      transition: 'opacity 600ms ease-out',
      background: 'rgba(255,255,255,0.70)',
      border: '1px solid rgba(26,115,235,0.13)',
      borderRadius: 100,
      padding: '7px 16px',
      boxShadow: '0 2px 6px rgba(26,115,235,0.06)',
      animation: visible ? `onbS1Float ${floatDuration}ms ease-in-out infinite` : 'none',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.text.accent }}>
        {text}
      </span>
    </div>
  )
}

export function Scene1() {
  const [block, setBlock] = useState<'A' | 'B' | 'C'>('A')

  useEffect(() => {
    const t1 = setTimeout(() => setBlock('B'), S1.blockB.in)
    const t2 = setTimeout(() => setBlock('C'), S1.blockC.in)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const blockStyle = (active: boolean): React.CSSProperties => ({
    position: 'absolute', width: '100%', textAlign: 'center',
    opacity: active ? 1 : 0,
    transition: `opacity ${S1.crossFadeDuration}ms ease`,
    pointerEvents: 'none',
  })

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {S1.words.map((w, i) => (
        <FloatingWord
          key={w.text}
          text={w.text}
          top={w.top}
          left={w.left}
          right={w.right}
          floatDuration={S1.floatDurations[i]}
          delay={S1.blockA.in + i * 80}
        />
      ))}

      {/* Copy area */}
      <div style={{
        position: 'absolute', bottom: 130, left: 32, right: 32,
        height: 140, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}>
        <div style={blockStyle(block === 'A')}>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.primary, lineHeight: '36px', margin: 0 }}>왜 영어는 배웠는데</p>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.accent,  lineHeight: '36px', margin: 0 }}>말이 안 나올까?</p>
        </div>

        <div style={blockStyle(block === 'B')}>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.primary, lineHeight: '36px', margin: 0 }}>단어는 압니다.</p>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.accent,  lineHeight: '36px', margin: 0 }}>하지만 말은</p>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.accent,  lineHeight: '36px', margin: 0 }}>나오지 않습니다.</p>
        </div>

        <div style={blockStyle(block === 'C')}>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.primary, lineHeight: '36px', margin: 0 }}>패턴이 없으면</p>
          <p style={{ fontSize: 27, fontWeight: 700, color: COLORS.text.accent,  lineHeight: '36px', margin: 0 }}>말이 나오지 않습니다.</p>
          <p style={{ fontSize: 14, fontWeight: 400, color: COLORS.text.muted, margin: '8px 0 0' }}>단어만 외워선 부족합니다.</p>
        </div>
      </div>
    </div>
  )
}
