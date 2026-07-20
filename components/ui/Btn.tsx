'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  pill?: boolean
}

const BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: 'inherit',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: 'background 0.15s, transform 0.1s, opacity 0.15s',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

const DEFAULT_SHAPE: React.CSSProperties = {
  fontSize: 14,
  borderRadius: 14,
  padding: '11px 24px',
}

const PILL_SHAPE: React.CSSProperties = {
  fontSize: 13,
  borderRadius: 999,
  padding: '9px 20px',
}

const VARIANT: Record<Variant, React.CSSProperties> = {
  primary:   { background: '#1E293B', color: '#ffffff', border: '1.5px solid #1E293B' },
  secondary: { background: 'transparent', color: '#1E293B', border: '1.5px solid #1E293B' },
  ghost:     { background: 'transparent', color: '#6B7280', border: '1.5px solid #E5E7EB' },
  danger:    { background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA' },
}

const PRESS: Record<Variant, string> = {
  primary:   '#0F172A',
  secondary: '#F1F5F9',
  ghost:     '#F9FAFB',
  danger:    '#FEE2E2',
}

const HOVER: Record<Variant, string> = {
  primary:   '#0F172A',
  secondary: '#F1F5F9',
  ghost:     '#F9FAFB',
  danger:    '#FEE2E2',
}

const REST: Record<Variant, string> = {
  primary:   '#1E293B',
  secondary: 'transparent',
  ghost:     'transparent',
  danger:    '#FEF2F2',
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = 'primary', pill = false, style, children, disabled, onMouseDown, onMouseUp, onMouseLeave, onMouseEnter, ...rest }, ref) => {
    const v = VARIANT[variant]
    const shape = pill ? PILL_SHAPE : DEFAULT_SHAPE

    const disabledOverride: React.CSSProperties = (disabled && variant === 'primary')
      ? { background: '#94A3B8', border: '1.5px solid #94A3B8' }
      : {}

    const computed: React.CSSProperties = {
      ...BASE,
      ...v,
      ...shape,
      ...disabledOverride,
      opacity: disabled ? 1 : 1,
      pointerEvents: disabled ? 'none' : undefined,
      cursor: disabled ? 'default' : 'pointer',
      ...style,
    }

    function handleMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
      e.currentTarget.style.transform = 'scale(0.97)'
      e.currentTarget.style.background = PRESS[variant]
      onMouseDown?.(e)
    }

    function handleMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
      e.currentTarget.style.transform = ''
      e.currentTarget.style.background = HOVER[variant]
      onMouseUp?.(e)
    }

    function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
      e.currentTarget.style.background = HOVER[variant]
      onMouseEnter?.(e)
    }

    function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
      e.currentTarget.style.transform = ''
      e.currentTarget.style.background = REST[variant]
      onMouseLeave?.(e)
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={computed}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

Btn.displayName = 'Btn'
