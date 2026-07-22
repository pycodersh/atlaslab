'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const KPATTO_TAB_BAR_HEIGHT = 80  // bottom padding for content

const ACCENT = '#D4873A'
const MUTED  = '#BBBBBB'

const TABS = [
  {
    key: 'home',
    label: 'Home',
    href: '/kpatto/home',
    active: (p: string) => p === '/kpatto' || p === '/kpatto/home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'story',
    label: 'Story',
    href: '/kpatto/story',
    active: (p: string) => p.startsWith('/kpatto/story'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    key: 'progress',
    label: 'Progress',
    href: '/kpatto/progress',
    active: (p: string) => p.startsWith('/kpatto/progress'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    key: 'library',
    label: 'Library',
    href: '/kpatto/library',
    active: (p: string) => p.startsWith('/kpatto/library'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/kpatto/profile',
    active: (p: string) => p.startsWith('/kpatto/profile'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
] as const

export function KPattoTabBar() {
  const pathname = usePathname()
  const [compact, setCompact] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current + 6) setCompact(true)
      else if (y < lastScrollY.current - 6) setCompact(false)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const h = compact ? 52 : 64

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 420,
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      <nav style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 9999,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        height: h,
        padding: '0 8px',
        transition: 'height 0.25s ease',
        overflow: 'hidden',
      }}>
        {TABS.map((tab) => {
          const isActive = tab.active(pathname)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: compact ? 0 : 3,
                height: '100%',
                textDecoration: 'none',
                color: isActive ? ACCENT : MUTED,
                WebkitTapHighlightColor: 'transparent',
                transition: 'gap 0.25s ease',
              }}
            >
              {tab.icon(isActive)}
              <span style={{
                fontSize: 9,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.04em',
                lineHeight: 1,
                opacity: compact ? 0 : 1,
                transition: 'opacity 0.2s ease',
                height: compact ? 0 : 'auto',
                overflow: 'hidden',
                color: isActive ? ACCENT : MUTED,
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
