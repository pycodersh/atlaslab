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
    background: '#1A3FAA',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: '#1A3FAA',
    border: '1.5px solid #1A3FAA',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--pm)',
    border: 'none',
  },
  danger: {
    background: '#fff0f0',
    color: '#c0392b',
    border: '1.5px solid #f5c6c6',
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

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = 'primary', size = 'md', style, children, disabled, onMouseDown, onMouseUp, onMouseLeave, ...rest }, ref) => {
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
      if (variant === 'primary') e.currentTarget.style.background = '#122d7a'
      if (variant === 'danger')  e.currentTarget.style.background = '#ffe0e0'
      if (variant === 'secondary') e.currentTarget.style.background = '#eef1fb'
      onMouseDown?.(e)
    }

    function handleMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
      e.currentTarget.style.transform = ''
      if (variant === 'primary') e.currentTarget.style.background = '#1A3FAA'
      if (variant === 'danger')  e.currentTarget.style.background = '#fff0f0'
      if (variant === 'secondary') e.currentTarget.style.background = 'transparent'
      onMouseUp?.(e)
    }

    function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
      e.currentTarget.style.transform = ''
      if (variant === 'primary') e.currentTarget.style.background = '#1A3FAA'
      if (variant === 'danger')  e.currentTarget.style.background = '#fff0f0'
      if (variant === 'secondary') e.currentTarget.style.background = 'transparent'
      onMouseLeave?.(e)
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={computed}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

Btn.displayName = 'Btn'
