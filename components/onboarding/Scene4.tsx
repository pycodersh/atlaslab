'use client'
import React, { useEffect, useState } from 'react'
import { OrbComponent } from './OrbComponent'
import { GlassCard } from './GlassCard'
import { COLORS, S4 } from './motionConstants'

interface Scene4Props {
  onStart: () => void
  onLater: () => void
}

export function Scene4({ onStart, onLater }: Scene4Props) {
  const [headIn,  setHeadIn]  = useState(false)
  const [subIn,   setSubIn]   = useState(false)
  const [cardIn,  setCardIn]  = useState(false)
  const [decoIn,  setDecoIn]  = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHeadIn(true),  120)
    const t2 = setTimeout(() => setSubIn(true),   300)
    const t3 = setTimeout(() => setCardIn(true),  450)
    const t4 = setTimeout(() => setDecoIn(true),  900)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%',
      paddingTop: 56, paddingLeft: 28, paddingRight: 28,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box',
    }}>
      {/* Orb */}
      <div style={{ marginBottom: 24 }}>
        <OrbComponent size={S4.orbSize} auraDuration={S4.orbAuraDuration} />
      </div>

      {/* Heading */}
      <p style={{
        fontSize: 21, fontWeight: 700, color: COLORS.text.primary,
        lineHeight: '31px', textAlign: 'center', marginBottom: 6, margin: '0 0 6px',
        opacity: headIn ? 1 : 0,
        transform: headIn ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        지금, PATTO와 함께{'\n'}
        <span style={{ color: COLORS.text.accent }}>첫 걸음을 시작하세요.</span>
      </p>

      {/* Sub */}
      <p style={{
        fontSize: 13, fontWeight: 300, color: COLORS.text.muted,
        textAlign: 'center', marginBottom: 28, margin: '0 0 28px',
        opacity: subIn ? 1 : 0,
        transition: 'opacity 600ms ease',
      }}>
        패턴을 반복하면 영어가 자연스럽게 나옵니다.
      </p>

      {/* Card */}
      <div style={{
        width: '100%',
        opacity: cardIn ? 1 : 0,
        transform: cardIn ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 550ms ease, transform 550ms ease',
        position: 'relative',
      }}>
        <GlassCard style={{ padding: '20px 20px 24px', overflow: 'visible' }} radius={28}>
          <p style={{
            fontSize: 16, fontWeight: 600, color: COLORS.text.primary,
            textAlign: 'center', margin: '0 0 20px',
          }}>
            {S4.cardPrompt}
          </p>

          <div style={{ display: 'flex', gap: 14 }}>
            {/* Later */}
            <button
              onClick={onLater}
              style={{
                flex: 1, padding: '15px 0', borderRadius: 20,
                background: COLORS.button.laterBg,
                border: `1px solid ${COLORS.button.laterBorder}`,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                fontSize: 15, fontWeight: 500, color: COLORS.button.laterText,
                fontFamily: 'inherit',
              }}
            >
              {/* Gloss */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '20px 20px 0 0',
              }} />
              Later
            </button>

            {/* Start */}
            <button
              onClick={onStart}
              style={{
                flex: 1, padding: '15px 0', borderRadius: 20,
                background: 'linear-gradient(135deg, #a8c8fc 0%, #7aabf5 33%, #4a88e8 66%, #2d6fd4 100%)',
                border: 'none',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                fontSize: 15, fontWeight: 600, color: '#fff',
                fontFamily: 'inherit',
                boxShadow: '0 8px 12px rgba(26,115,235,0.35)',
              }}
            >
              {/* Gloss */}
              <div style={{
                position: 'absolute', top: 0, left: '5%', right: '5%', height: '45%',
                background: 'rgba(255,255,255,0.22)',
                borderRadius: '0 0 60px 60px',
              }} />
              Start
            </button>
          </div>

          {/* Deco orb */}
          <div style={{
            position: 'absolute',
            bottom: S4.decoOrb.bottom,
            right: S4.decoOrb.right,
            width: S4.decoOrb.size,
            height: S4.decoOrb.size,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #d8eaff 0%, #b0cfff 33%, #88b4f8 66%, #6094ea 100%)',
            boxShadow: '0 4px 8px rgba(26,115,235,0.2)',
            opacity: decoIn ? 1 : 0,
            transform: decoIn ? 'scale(1)' : 'scale(0.5)',
            transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.34,1.4,0.64,1)',
          }}>
            {/* Eyes */}
            <div style={{
              position: 'absolute', top: '44%', left: 0, right: 0,
              display: 'flex', justifyContent: 'center', gap: 7,
              transform: 'translateY(-3px)',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3a5aaa' }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3a5aaa' }} />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
