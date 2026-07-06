'use client'

import Link from 'next/link'
import { User } from 'lucide-react'

export const NAV_HEIGHT = 60

function PattoIcon() {
  return (
    <img
      src="/patto-logo.png"
      alt="PATTO"
      width={34}
      height={34}
      style={{ flexShrink: 0, display: 'block' }}
    />
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
        {/* Left: PATTO logo — same on all pages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PattoIcon />
          <div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--pt)',
                margin: 0,
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                textShadow: '0 1px 0 rgba(255,255,255,.75), 0 10px 24px rgba(70,80,110,.08)',
              }}
            >
              PATTO
            </p>
            <p style={{
              fontSize: 10,
              color: 'var(--pm)',
              margin: '3px 0 0',
              letterSpacing: '0.02em',
              lineHeight: 1,
              fontWeight: 500,
            }}>
              Patterns · Stories · You
            </p>
          </div>
        </div>

        {/* Right: icon buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/settings"
            aria-label="프로필"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(255,255,255,0.9)',
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
