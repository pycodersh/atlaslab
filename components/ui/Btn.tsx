'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'md' | 'sm' | 'pill'

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
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

const VARIANT: Record<Variant, React.CSSProperties> = {
  primary: {
    background: '#6366F1',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: '#6366F1',
    border: '1.5px solid #6366F1',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--pm)',
    border: 'none',
  },
  danger: {
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1.5px solid #FECACA',
  },
}

const SIZE_STYLE: Record<Size, React.CSSProperties> = {
  md:   { fontSize: 15, borderRadius: 14, padding: '13px 28px' },
  sm:   { fontSize: 13, borderRadius: 10, padding: '8px 18px' },
  pill: { fontSize: 14, borderRadius: 999, padding: '10px 22px' },
}

const SIZE_SECONDARY_PAD: Record<Size, string> = {
  md:   '12px 28px',
  sm:   '8px 18px',
  pill: '10px 22px',
}

// Active/hover colors
const PRESS: Record<Variant, string> = {
  primary:   '#4338CA',
  secondary: '#EEF2FF',
  ghost:     'transparent',
  danger:    '#FEE2E2',
}
const HOVER: Record<Variant, string> = {
  primary:   '#4F46E5',
  secondary: '#EEF2FF',
  ghost:     'transparent',
  danger:    '#FEE2E2',
}
const REST: Record<Variant, string> = {
  primary:   '#6366F1',
  secondary: 'transparent',
  ghost:     'transparent',
  danger:    '#FEF2F2',
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = 'primary', size = 'md', style, children, disabled, onMouseDown, onMouseUp, onMouseLeave, onMouseEnter, ...rest }, ref) => {
    const v = VARIANT[variant]
    const s = SIZE_STYLE[size]

    const padding = variant === 'secondary' || variant === 'danger' || variant === 'ghost'
      ? SIZE_SECONDARY_PAD[size]
      : s.padding

    const computed: React.CSSProperties = {
      ...BASE,
      ...v,
      ...s,
      padding,
      opacity: disabled ? 0.45 : 1,
      pointerEvents: disabled ? 'none' : undefined,
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
