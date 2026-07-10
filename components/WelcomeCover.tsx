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
  const [fading, setFading]   = useState(false)
  const [stage, setStage]     = useState(0)

  useEffect(() => {
    const isReplay = consumeCoverReplay()
    if (isReplay || !isCoverDone()) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width    = '100%'
      document.body.style.top      = '0'
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const t2          = setTimeout(() => setStage(2), 350)
    const t3          = setTimeout(() => setStage(3), 1100)
    const autoDismiss = setTimeout(() => dismiss(), 2500)
    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(autoDismiss) }
  }, [visible])

  function dismiss() {
    if (fading) return
    setFading(true)
    localStorage.setItem(COVER_KEY, 'true')
    setTimeout(() => {
      setVisible(false)
      setFading(false)
      document.body.style.overflow  = ''
      document.body.style.position  = ''
      document.body.style.width     = ''
      document.body.style.top       = ''
    }, 400)
  }

  if (!visible) return null

  const logoH     = 52
  const pattoSize = 35

  const bgGradient   = isDark
    ? 'linear-gradient(160deg, #2a2040 0%, #1e2a40 50%, #251830 100%)'
    : 'linear-gradient(160deg, #d8d0ee 0%, #e8d8f0 45%, #d0e0f0 100%)'

  const textPrimary   = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(40,30,70,0.88)'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(40,30,70,0.5)'
  const dividerColor  = isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(40,30,70,0.2)'

  function sloganStyle(active: boolean): React.CSSProperties {
    return {
      opacity:    active ? 1 : 0,
      filter:     active ? 'blur(0px)' : 'blur(12px)',
      transform:  active ? 'translateY(0px)' : 'translateY(8px)',
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
        background: bgGradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity:    fading ? 0 : 1,
        transition: fading ? 'opacity 400ms cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}
    >
      {/* Orbs */}
      {isDark ? (
        <>
          <div style={{
            position: 'absolute', top: 20, right: -50,
            width: 200, height: 200, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(150,120,220,0.3) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 80, left: -40,
            width: 160, height: 160, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(100,160,220,0.2) 0%, transparent 70%)',
          }} />
        </>
      ) : (
        <>
          <div style={{
            position: 'absolute', top: -20, right: -40,
            width: 180, height: 180, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(200,180,240,0.55) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 60, left: -30,
            width: 140, height: 140, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(180,210,240,0.45) 0%, transparent 70%)',
          }} />
        </>
      )}

      {/* Center content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        {/* Logo + PATTO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <img
            src={isDark ? '/PATTO Dark.png' : '/PATTO.png'}
            alt="PT"
            style={{
              display: 'block', height: logoH, width: 'auto',
              mixBlendMode: isDark ? 'screen' : 'multiply',
              opacity: isDark ? 0.92 : 1,
            }}
          />
          <div style={{
            width: 1, height: Math.round(pattoSize * 0.85),
            background: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: pattoSize, fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1,
            color: isDark ? '#FFFFFF' : '#161616',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
          }}>
            PATTO
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 24, height: 1, background: dividerColor, marginBottom: 16 }} />

        {/* Slogans */}
        <p style={{
          ...sloganStyle(stage >= 2),
          fontSize: 20, fontStyle: 'italic', fontWeight: 400,
          color: textPrimary, margin: '0 0 6px', lineHeight: 1.3,
          fontFamily: 'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
          letterSpacing: '0.008em',
        }}>
          Repeat Patterns.
        </p>
        <p style={{
          ...sloganStyle(stage >= 3),
          fontSize: 13, fontWeight: 400,
          color: textSecondary, margin: 0,
          letterSpacing: '0.04em', lineHeight: 1.5,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
        }}>
          Build Fluency.
        </p>
      </div>
    </div>
  )
}
