'use client'
import React, { useEffect, useState } from 'react'
import { GlassCard } from './GlassCard'
import { COLORS, S3 } from './motionConstants'

function WaveBar({ delay }: { delay: number }) {
  return (
    <div style={{
      width: 3, height: 20,
      borderRadius: 2,
      background: '#7ab5ff',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%',
        borderRadius: 2,
        background: '#7ab5ff',
        animation: `onbWaveBar 1.1s ease-in-out ${delay}ms infinite`,
        transformOrigin: 'bottom',
      }} />
    </div>
  )
}

export function Scene3() {
  const [headIn, setHeadIn]   = useState(false)
  const [cardIn, setCardIn]   = useState(false)
  const [speakIn, setSpeakIn] = useState(false)

  useEffect(() => {
    setHeadIn(true)
    const t1 = setTimeout(() => setCardIn(true),  S3.cardEntranceDelay)
    const t2 = setTimeout(() => setSpeakIn(true), 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%',
      paddingTop: 58, paddingLeft: 32, paddingRight: 32,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <p style={{
        fontSize: 26, fontWeight: 700, color: COLORS.text.primary,
        textAlign: 'center', marginBottom: 22, lineHeight: '36px',
        opacity: headIn ? 1 : 0,
        transform: headIn ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        반복이 <span style={{ color: COLORS.text.accent }}>자신감</span>이 됩니다.
      </p>

      {/* Pattern Card */}
      <div style={{
        width: '100%',
        opacity: cardIn ? 1 : 0,
        transform: cardIn ? 'scale(1) translateY(0)' : `scale(${S3.cardFromScale}) translateY(${S3.cardFromY}px)`,
        transition: `opacity ${S3.cardEntranceDuration}ms ease, transform ${S3.cardEntranceDuration}ms cubic-bezier(0.25,0.46,0.45,0.94)`,
        marginBottom: 18,
      }}>
        <GlassCard style={{ padding: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '1px', color: COLORS.text.muted, marginBottom: 14, margin: '0 0 14px' }}>
            {S3.pattern.tag}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: COLORS.text.primary, margin: '0 0 0' }}>
            {S3.pattern.text}
          </p>
          <div style={{ height: 0.5, background: 'rgba(26,115,235,0.08)', margin: '14px 0' }} />
          <p style={{ fontSize: 13, color: COLORS.text.primary, lineHeight: '20px', margin: '0 0 4px' }}>
            <span>She </span>
            <span style={{ color: COLORS.text.pattern, fontWeight: 600 }}>came up with</span>
            <span> a great idea.</span>
          </p>
          <p style={{ fontSize: 12, color: COLORS.text.muted, margin: 0 }}>
            {S3.pattern.translation}
          </p>
        </GlassCard>
      </div>

      {/* It just comes out + waveform */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        opacity: speakIn ? 1 : 0,
        transform: speakIn ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 550ms ease, transform 550ms ease',
      }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.text.accent, textAlign: 'center', lineHeight: '30px', margin: 0 }}>
          It just<br/>comes out.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20 }}>
          {[0, 100, 200, 300, 200, 100, 0].map((d, i) => (
            <div key={i} style={{
              width: 3, height: 20,
              borderRadius: 2,
              background: '#7ab5ff',
              animation: speakIn ? `onbWaveBar 1.1s ease-in-out ${d}ms infinite` : 'none',
              transformOrigin: 'bottom center',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
