'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const COVER_KEY    = 'patto_cover_done_v1'
const COVER_REPLAY = 'patto_cover_replay_v1'

export function requestCoverReplay() {
  if (typeof window !== 'undefined') localStorage.setItem(COVER_REPLAY, 'true')
}

function isCoverDone(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(COVER_KEY) === 'true'
}

function consumeCoverReplay(): boolean {
  if (typeof window === 'undefined') return false
  const had = localStorage.getItem(COVER_REPLAY) === 'true'
  if (had) localStorage.removeItem(COVER_REPLAY)
  return had
}

export function WelcomeCover() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  // Animation stages: 0=hidden, 1=logo in, 2=line1 in, 3=line2 in
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const isReplay = consumeCoverReplay()
    if (isReplay || !isCoverDone()) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = '0'
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    // Line 1 reveals at 350ms
    const t2 = setTimeout(() => setStage(2), 350)
    // Line 2 reveals 750ms after line 1
    const t3 = setTimeout(() => setStage(3), 1100)
    // Auto-dismiss at 2.5s
    const autoDismiss = setTimeout(() => dismiss(), 2500)

    return () => {
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(autoDismiss)
    }
  }, [visible])

  function dismiss() {
    if (fading) return
    setFading(true)
    localStorage.setItem(COVER_KEY, 'true')
    setTimeout(() => {
      setVisible(false)
      setFading(false)
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
    }, 400)
  }

  if (!visible) return null

  const coverSrc = isDark ? '/Cover_Dark.png' : '/Cover.png'
  const logoH = 52
  const pattoSize = 35

  const logoStyle: React.CSSProperties = {
    opacity: 1,
  }

  // Slogan lines: blur + opacity + translateY → clear
  function sloganStyle(active: boolean): React.CSSProperties {
    return {
      opacity: active ? 1 : 0,
      filter: active ? 'blur(0px)' : 'blur(6px)',
      transform: active ? 'translateY(0px)' : 'translateY(8px)',
      transition: active
        ? 'opacity 600ms ease-out, filter 600ms ease-out, transform 600ms ease-out'
        : 'none',
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        overflow: 'hidden', touchAction: 'none',
        background: isDark ? '#0B0F1A' : '#F2EDE6',
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 400ms cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}
    >
      {/* Cover image */}
      <img
        src={coverSrc}
        alt="PATTO Cover"
        style={{
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          height: '100%',
          width: 'auto',
          display: 'block',
          maxWidth: 'none',
        }}
      />

      {/* Brand group */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 48%)',
        left: 36,
        right: 36,
        pointerEvents: 'none',
      }}>
        {/* PT logo + divider + PATTO — fade in together */}
        <div style={{ ...logoStyle, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <img
            src={isDark ? '/PATTO Dark.png' : '/PATTO.png'}
            alt="PT"
            style={{
              display: 'block',
              height: logoH, width: 'auto',
              mixBlendMode: isDark ? 'screen' : 'multiply',
              opacity: isDark ? 0.92 : 1,
            }}
          />
          <div style={{
            width: 1,
            height: Math.round(pattoSize * 0.85),
            background: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: pattoSize,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: isDark ? '#FFFFFF' : '#161616',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
          }}>PATTO</span>
        </div>

        {/* Slogan lines */}
        <p style={{
          ...sloganStyle(stage >= 2),
          fontSize: 34,
          fontStyle: 'italic',
          fontWeight: 400,
          color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(22,22,22,0.82)',
          margin: '0 0 8px',
          lineHeight: 1.25,
          fontFamily: 'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
          letterSpacing: '0.008em',
        }}>
          Repeat Patterns.
        </p>
        <p style={{
          ...sloganStyle(stage >= 3),
          fontSize: 22,
          fontWeight: 300,
          color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(22,22,22,0.44)',
          margin: 0,
          letterSpacing: '0.06em',
          lineHeight: 1.5,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
        }}>
          Build Fluency.
        </p>
      </div>
    </div>
  )
}
