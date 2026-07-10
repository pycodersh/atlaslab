'use client'

import { useEffect, useRef, useState } from 'react'
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

// Typing animation: reveals chars one by one with opacity, no cursor
// line1: "Repeat Patterns." — starts at 0ms
// line2: "Build Fluency."   — starts after line1 finishes
// Total ~1.7s
const LINE1 = 'Repeat Patterns.'
const LINE2 = 'Build Fluency.'
// Total chars = 30, target ~1.7s → ~56ms per char
const CHAR_INTERVAL = 56

export function WelcomeCover() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  // How many chars revealed for each line
  const [chars1, setChars1] = useState(0)
  const [chars2, setChars2] = useState(0)

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

  // Start typing animation as soon as visible, then auto-dismiss at 2.5s
  useEffect(() => {
    if (!visible) return

    let c1 = 0
    let c2 = 0
    const timer = setInterval(() => {
      if (c1 < LINE1.length) {
        c1++
        setChars1(c1)
      } else if (c2 < LINE2.length) {
        c2++
        setChars2(c2)
      } else {
        clearInterval(timer)
      }
    }, CHAR_INTERVAL)

    // Auto-dismiss 2.5s after mount
    const autoDismiss = setTimeout(() => dismiss(), 2500)

    return () => {
      clearInterval(timer)
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
    }, 420)
  }

  if (!visible) return null

  const coverSrc = isDark ? '/Cover_Dark.png' : '/Cover.png'

  // PT logo: 43 * 1.2 ≈ 52px
  // PATTO text: 28 * 1.25 = 35px
  const logoH = 52
  const pattoSize = 35

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        overflow: 'hidden', touchAction: 'none',
        background: isDark ? '#0B0F1A' : '#F2EDE6',
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 420ms cubic-bezier(0.4,0,0.2,1)' : 'none',
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

      {/* Brand group — 48% from bottom for more central vertical placement */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 48%)',
        left: 36,
        right: 36,
        pointerEvents: 'none',
      }}>
        {/* PT logo + divider + PATTO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
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

        {/* Slogan — typing animation, left-aligned with PATTO start */}
        {/* PATTO start = logo width + gap + divider width + gap (≈ logoH*aspect + 18 + 1 + 18) */}
        {/* We align slogan to the left of PATTO text by using a flex column under the same parent */}
        {/* Measure: PT logo ~52px height, roughly square aspect so ~52px wide + 18 + 1 + 18 = ~89px offset */}
        <div style={{ paddingLeft: 0 }}>
          <p style={{
            fontSize: 34,
            fontStyle: 'italic',
            fontWeight: 400,
            color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(22,22,22,0.82)',
            margin: '0 0 8px',
            lineHeight: 1.25,
            fontFamily: 'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
            letterSpacing: '0.008em',
            whiteSpace: 'nowrap',
          }}>
            {LINE1.slice(0, chars1)}
          </p>
          <p style={{
            fontSize: 22,
            fontWeight: 300,
            color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(22,22,22,0.44)',
            margin: 0,
            letterSpacing: '0.06em',
            lineHeight: 1.5,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {LINE2.slice(0, chars2)}
          </p>
        </div>
      </div>
    </div>
  )
}
