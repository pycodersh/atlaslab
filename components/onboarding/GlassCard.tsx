import React from 'react'
import { COLORS } from './motionConstants'

interface GlassCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  radius?: number
}

export function GlassCard({ children, style, radius = 20 }: GlassCardProps) {
  return (
    <div style={{
      background: COLORS.card.background,
      border: `1px solid ${COLORS.card.border}`,
      borderRadius: radius,
      boxShadow: '0 6px 14px rgba(26,115,235,0.08)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      ...style,
    }}>
      {children}
    </div>
  )
}
