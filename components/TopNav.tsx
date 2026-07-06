'use client'

import Link from 'next/link'
import { User } from 'lucide-react'

export const NAV_HEIGHT = 60

function PattoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="34" height="34" rx="8" fill="white" />
      <rect x="0.5" y="0.5" width="33" height="33" rx="7.5" stroke="rgba(0,0,0,0.08)" />
      {/* P — large, upper-left */}
      <path d="M6 8 L6 26" stroke="black" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M6 8 Q14 8 14 13 Q14 18 6 18" stroke="black" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* A — mountain/tent shape, center-right, no crossbar */}
      <path d="M20 8 L27 26" stroke="black" strokeWidth="3.0" strokeLinecap="round" />
      <path d="M20 8 L13 26" stroke="black" strokeWidth="3.0" strokeLinecap="round" />
      {/* T — small, tucked under A apex */}
      <path d="M17.5 14 L22.5 14" stroke="black" strokeWidth="2.0" strokeLinecap="round" />
      <path d="M20 14 L20 19" stroke="black" strokeWidth="2.0" strokeLinecap="round" />
    </svg>
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
