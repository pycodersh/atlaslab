'use client'

import { useTheme } from '@/components/ThemeProvider'

interface LogoProps {
  width?: number
  variant?: 'nav' | 'full'
  /** 명시적으로 다크/라이트 지정. 생략 시 ThemeProvider 자동 감지. */
  dark?: boolean
  className?: string
  style?: React.CSSProperties
}

export function Logo({ width, variant = 'full', dark, className, style }: LogoProps) {
  const { theme } = useTheme()
  const isDark = dark ?? (theme === 'dark')

  const ink = isDark ? '#FFFFFF' : '#0A1628'
  const dot = isDark ? '#4D8EFF' : '#3B6EF0'

  const isNav = variant === 'nav'

  const VB_X = 56
  const VB_Y = 71
  const VB_W = 248
  const VB_H = isNav ? 42 : 68

  const defaultWidth  = isNav ? 120 : 160
  const resolvedWidth = width ?? defaultWidth
  const resolvedHeight = Math.round(resolvedWidth * VB_H / VB_W)

  return (
    <svg
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      width={resolvedWidth}
      height={resolvedHeight}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PATTO — Pattern & Auto"
      role="img"
      className={className}
      style={{ display: 'block', ...style }}
    >
      <g transform="matrix(1,0,0,0.87,0,14.3)">
        <text x="60" y="110" fontFamily="Inter, system-ui, sans-serif" fontSize="56" fontWeight="600" fill={ink}>P</text>
        <path d="M120,69 L99,110 L108,110 L120,82 L132,110 L141,110 Z" fill={ink} />
        <text x="150" y="110" fontFamily="Inter, system-ui, sans-serif" fontSize="56" fontWeight="600" fill={ink}>T</text>
        <text x="192" y="110" fontFamily="Inter, system-ui, sans-serif" fontSize="56" fontWeight="600" fill={ink}>T</text>
        <text x="232" y="110" fontFamily="Inter, system-ui, sans-serif" fontSize="56" fontWeight="600" fill={ink}>O</text>
        {!isNav && (
          <text x="62" y="128" fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="400" fill={dot} letterSpacing="5">PATTERN &amp; AUTO</text>
        )}
      </g>
      <circle cx="120" cy="105" r="5" fill={dot} />
    </svg>
  )
}
