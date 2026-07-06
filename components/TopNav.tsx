'use client'

import Link from 'next/link'
import { User } from 'lucide-react'

export const NAV_HEIGHT = 60

function PattoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="100" height="100" rx="22" fill="white" />
      <rect x="1" y="1" width="98" height="98" rx="21" stroke="rgba(0,0,0,0.09)" strokeWidth="2" />

      {/* ── P ── serif vertical stem */}
      <path d="M22 14 L22 86" stroke="black" strokeWidth="7.5" strokeLinecap="butt" />
      {/* P bowl — D-shaped, upper half */}
      <path
        d="M22 14 C22 12 25 10 30 10 C50 10 58 16 58 30 C58 44 48 50 22 50"
        stroke="black" strokeWidth="6.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* P top serif */}
      <path d="M16 14 L28 14" stroke="black" strokeWidth="5" strokeLinecap="round" />
      {/* P bottom serif */}
      <path d="M16 86 L28 86" stroke="black" strokeWidth="5" strokeLinecap="round" />

      {/* ── A ── tent/roof, no crossbar, peak at top center-right */}
      {/* Left leg */}
      <path d="M56 12 L18 87" stroke="black" strokeWidth="6" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M56 12 L90 87" stroke="black" strokeWidth="6" strokeLinecap="round" />

      {/* ── T ── small, centered under A peak */}
      {/* T crossbar */}
      <path d="M43 60 L69 60" stroke="black" strokeWidth="4.5" strokeLinecap="round" />
      {/* T stem */}
      <path d="M56 60 L56 78" stroke="black" strokeWidth="4.5" strokeLinecap="round" />
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
