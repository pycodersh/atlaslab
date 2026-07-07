'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const TODAY_KEY = 'patto-welcome-shown'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function WaveLight() {
  return (
    <svg
      viewBox="0 0 390 844"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Warm ivory base — rendered by parent bg */}
      {/* Large upper blob — very soft warm blush */}
      <ellipse cx="460" cy="-60" rx="380" ry="300" fill="rgba(210,180,170,0.13)" />
      {/* Mid burgundy wave — organic sweep */}
      <path
        d="M-80 320 C60 240, 200 360, 340 290 S520 180, 640 260 L640 0 L-80 0 Z"
        fill="rgba(140,60,70,0.055)"
      />
      {/* Lower soft blush pool */}
      <ellipse cx="60" cy="780" rx="320" ry="220" fill="rgba(200,170,160,0.10)" />
      {/* Faint right-side glow */}
      <ellipse cx="420" cy="500" rx="260" ry="340" fill="rgba(230,210,200,0.08)" />
      {/* Very subtle center highlight */}
      <ellipse cx="195" cy="380" rx="200" ry="160" fill="rgba(255,250,245,0.18)" />
    </svg>
  )
}

function WaveDark() {
  return (
    <svg
      viewBox="0 0 390 844"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Dark burgundy upper bloom */}
      <ellipse cx="430" cy="-40" rx="360" ry="280" fill="rgba(100,28,38,0.25)" />
      {/* Organic sweep across upper third */}
      <path
        d="M-80 280 C80 200, 240 320, 370 250 S530 150, 640 220 L640 0 L-80 0 Z"
        fill="rgba(90,22,32,0.22)"
      />
      {/* Deep charcoal lower pool with warm tint */}
      <ellipse cx="80" cy="800" rx="340" ry="230" fill="rgba(80,20,28,0.18)" />
      {/* Subtle right glow */}
      <ellipse cx="380" cy="480" rx="240" ry="320" fill="rgba(60,16,24,0.15)" />
      {/* Very faint center warmth */}
      <ellipse cx="195" cy="400" rx="180" ry="140" fill="rgba(120,40,50,0.06)" />
    </svg>
  )
}

export function WelcomeCover() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // phase: 'show' | 'fadeout' | 'hidden'
  const [phase, setPhase] = useState<'show' | 'fadeout' | 'hidden'>('hidden')
  // inner content visibility stages
  const [logoVisible, setLogoVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [sloganVisible, setSloganVisible] = useState(false)

  useEffect(() => {
    const today = todayStr()
    const last = localStorage.getItem(TODAY_KEY)
    if (last === today) return

    localStorage.setItem(TODAY_KEY, today)
    setPhase('show')

    // Staggered content fade-in
    const t1 = setTimeout(() => setLogoVisible(true), 60)
    const t2 = setTimeout(() => setTextVisible(true), 220)
    const t3 = setTimeout(() => setSloganVisible(true), 450)

    // Start fade-out at 1.9s, remove at 2.5s
    const t4 = setTimeout(() => setPhase('fadeout'), 1900)
    const t5 = setTimeout(() => setPhase('hidden'), 2550)

    return () => { [t1,t2,t3,t4,t5].forEach(clearTimeout) }
  }, [])

  if (phase === 'hidden') return null

  const bg = isDark ? '#131115' : '#FAF8F5'
  const coverOpacity = phase === 'fadeout' ? 0 : 1

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        opacity: coverOpacity,
        transition: phase === 'fadeout' ? 'opacity 600ms ease-in-out' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Organic wave background */}
      {isDark ? <WaveDark /> : <WaveLight />}

      {/* Content — above waves */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Logo image */}
        <div
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'scale(1)' : 'scale(0.97)',
            transition: 'opacity 700ms ease-out, transform 700ms ease-out',
          }}
        >
          <img
            src={isDark ? '/PATTO Dark.png' : '/PATTO.png'}
            alt="PATTO"
            width={64}
            height={64}
            style={{
              display: 'block',
              filter: isDark ? 'brightness(1.4) contrast(2)' : undefined,
              mixBlendMode: isDark ? 'screen' : 'normal',
            }}
          />
        </div>

        {/* PATTO wordmark */}
        <div
          style={{
            marginTop: 14,
            opacity: textVisible ? 1 : 0,
            transition: 'opacity 650ms ease-out',
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: isDark ? '#F0EDE8' : '#1A1614',
              margin: 0,
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            PATTO
          </p>
        </div>

        {/* Slogan — slides up from below */}
        <div
          style={{
            marginTop: 18,
            opacity: sloganVisible ? 1 : 0,
            transform: sloganVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 700ms cubic-bezier(0.25,0.46,0.45,0.94), transform 700ms cubic-bezier(0.25,0.46,0.45,0.94)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: isDark ? 'rgba(210,200,195,0.72)' : 'rgba(80,60,55,0.62)',
              margin: 0,
              lineHeight: 1.7,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              textTransform: 'uppercase',
            }}
          >
            Repeat Patterns.
            <br />
            Build Fluency.
          </p>
        </div>
      </div>
    </div>
  )
}
