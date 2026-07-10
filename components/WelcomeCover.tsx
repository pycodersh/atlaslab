'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const COVER_KEY   = 'patto_cover_done_v1'
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
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    const isReplay = consumeCoverReplay()
    if (isReplay || !isCoverDone()) {
      setVisible(true)
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = '0'
    }
  }, [])

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
    }, 380)
  }

  if (!visible) return null

  const coverSrc = isDark ? '/Cover_Dark.png' : '/Cover.png'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        overflow: 'hidden', touchAction: 'none',
        background: isDark ? '#0B0F1A' : '#F2EDE6',
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 380ms ease' : 'none',
      }}
      onTouchStart={e => { touchX.current = e.targetTouches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const delta = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (delta < -48) dismiss()
      }}
      // Also allow click/tap for desktop testing
      onClick={dismiss}
    >
      {/* Cover image — portrait fill: height 100%, center horizontally */}
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

      {/* Text overlay — left-aligned, lower center */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
        left: 36,
        right: 36,
        pointerEvents: 'none',
      }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 14 }}>
          <img
            src={isDark ? '/PATTO Dark.png' : '/PATTO.png'}
            alt="PATTO"
            style={{
              display: 'block',
              height: 36, width: 'auto',
              mixBlendMode: isDark ? 'screen' : 'multiply',
              opacity: isDark ? 0.92 : 1,
            }}
          />
          <div style={{ width: 1, height: 24, marginBottom: 2, background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.20)' }} />
          <span style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1,
            color: isDark ? '#FFFFFF' : '#0F1923',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
          }}>PATTO</span>
        </div>

        {/* Slogan */}
        <p style={{
          fontSize: 18, fontStyle: 'italic', fontWeight: 400,
          color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(15,25,40,0.72)',
          margin: '0 0 4px', lineHeight: 1.45,
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
          letterSpacing: '0.01em',
        }}>
          Repeat Patterns.
        </p>
        <p style={{
          fontSize: 13.5, fontWeight: 300,
          color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,25,40,0.48)',
          margin: 0, letterSpacing: '0.18em', lineHeight: 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
          textTransform: 'uppercase',
        }}>
          Build Fluency.
        </p>
      </div>

      {/* Swipe hint */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
        left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        opacity: 0.38,
        animation: 'hint-pulse 2.4s ease-in-out infinite',
        pointerEvents: 'none',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: isDark ? '#fff' : '#000', letterSpacing: '0.06em', fontFamily: 'inherit' }}>
          swipe
        </span>
      </div>

      <style>{`
        @keyframes hint-pulse {
          0%, 100% { opacity: 0.28; transform: translateX(0); }
          50%       { opacity: 0.50; transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
