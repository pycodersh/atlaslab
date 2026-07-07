'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export const NAV_HEIGHT = 50

function PattoIcon() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <>
      {/* SVG filter: removes white background from PNG by keying on brightness */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <filter id="patto-remove-white">
            <feColorMatrix type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 3 0" />
          </filter>
        </defs>
      </svg>
      <img
        src={isDark ? '/PATTO Dark.png' : '/PATTO.png'}
        alt="PATTO"
        width={34}
        height={34}
        style={{
          flexShrink: 0, display: 'block',
          filter: isDark
            ? 'brightness(1.4) contrast(2)'
            : 'url(#patto-remove-white)',
          mixBlendMode: isDark ? 'screen' : 'normal',
        }}
      />
    </>
  )
}

export function TopNav() {
  return (
    <nav style={{ background: 'transparent', borderBottom: 'none' }}>
      <div
        className="flex items-center justify-between px-5"
        style={{
          height: NAV_HEIGHT,
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Left: PATTO logo — tapping navigates home */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, textDecoration: 'none' }}>
          <PattoIcon />
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: 'var(--pt)',
              margin: 0,
              paddingBottom: 2,
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            PATTO
          </p>
        </Link>

        {/* Right: icon buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/settings"
            aria-label="프로필"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--pglass)',
              border: '1px solid var(--pglass-border)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <User style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
