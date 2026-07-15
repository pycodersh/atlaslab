'use client'
import React from 'react'
import { COLORS, ORB } from './motionConstants'

interface OrbProps {
  size?: number
  showRings?: boolean
  auraDuration?: number
}

export function OrbComponent({ size = 96, showRings = false, auraDuration = ORB.auraDuration }: OrbProps) {
  const auraSize  = size * 1.56
  const ring1Size = size * 1.32
  const ring2Size = size * 1.52

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Aura */}
      <div style={{
        position: 'absolute',
        width: auraSize, height: auraSize,
        top: -(auraSize - size) / 2,
        left: -(auraSize - size) / 2,
        borderRadius: '50%',
        background: COLORS.orb.glow,
        animation: `onbAuraBreath ${auraDuration}ms ease-in-out infinite`,
      }} />

      {/* Rings */}
      {showRings && <>
        <div style={{
          position: 'absolute',
          width: ring1Size, height: ring1Size,
          top: -(ring1Size - size) / 2,
          left: -(ring1Size - size) / 2,
          borderRadius: '50%',
          border: `1px solid ${COLORS.orb.ring1}`,
          animation: 'onbRingCW 10000ms linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: ring2Size, height: ring2Size,
          top: -(ring2Size - size) / 2,
          left: -(ring2Size - size) / 2,
          borderRadius: '50%',
          border: `1px dashed ${COLORS.orb.ring2}`,
          animation: 'onbRingCCW 16000ms linear infinite',
        }} />
      </>}

      {/* Body */}
      <div style={{
        width: size, height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        animation: `onbOrbFloat ${ORB.floatDuration}ms ease-in-out infinite`,
        background: 'linear-gradient(150deg, #eaf3ff 0%, #c8ddff 25%, #a8c8fc 50%, #80aef5 75%, #6094ea 100%)',
        flexShrink: 0,
      }}>
        {/* Gloss */}
        <div style={{
          position: 'absolute',
          top: size * 0.12, left: size * 0.20,
          width: size * 0.35, height: size * 0.20,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.50)',
        }} />
        {/* Eyes */}
        <div style={{
          position: 'absolute',
          top: '50%', left: 0, right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: ORB.eyeGap,
          transform: `translateY(-${ORB.eyeSize / 2 + 3}px)`,
        }}>
          <div style={{ width: ORB.eyeSize, height: ORB.eyeSize, borderRadius: '50%', background: COLORS.orb.eye }} />
          <div style={{ width: ORB.eyeSize, height: ORB.eyeSize, borderRadius: '50%', background: COLORS.orb.eye }} />
        </div>
      </div>
    </div>
  )
}
