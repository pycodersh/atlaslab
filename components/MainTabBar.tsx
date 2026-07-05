'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const TAB_BAR_HEIGHT = 72

const TABS = [
  {
    label: 'Today',
    href: '/home',
    active: (p: string) => p === '/home' || p === '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Story',
    href: '/stories/1',
    active: (p: string) => p.startsWith('/stories') || p.startsWith('/learn') || p.startsWith('/review'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    label: 'Essays',
    href: '/essays',
    active: (p: string) => p.startsWith('/essays') || p.startsWith('/editor'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    label: 'Progress',
    href: '/records',
    active: (p: string) => p.startsWith('/records'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'You',
    href: '/settings',
    active: (p: string) => p.startsWith('/settings'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
] as const

export function MainTabBar() {
  const pathname = usePathname()
  const [scrolledDown, setScrolledDown] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (y > lastYRef.current && y > 60) {
        setScrolledDown(true)
      } else if (y < lastYRef.current) {
        setScrolledDown(false)
      }
      lastYRef.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        paddingTop: 8,
        pointerEvents: 'none',
      }}
    >
      <nav
        className="floating-nav"
        style={{
          pointerEvents: 'auto',
          borderRadius: 9999,
          padding: scrolledDown ? '8px 20px' : '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: scrolledDown ? 4 : 8,
          transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          transform: scrolledDown ? 'scale(0.93)' : 'scale(1)',
          transformOrigin: 'bottom center',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.active(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: scrolledDown ? 2 : 3,
                textDecoration: 'none',
                color: isActive ? '#3A3A3C' : 'var(--pm)',
                transition: 'color 0.15s ease',
                padding: scrolledDown ? '4px 10px' : '6px 14px',
                borderRadius: 9999,
                background: isActive ? 'rgba(255,255,255,0.55)' : 'transparent',
                boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.06)' : 'none',
                minWidth: scrolledDown ? 44 : 52,
              }}
            >
              {tab.icon(isActive)}
              <span style={{
                fontSize: scrolledDown ? 8.5 : 9.5,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.03em',
                lineHeight: 1,
                transition: 'font-size 0.28s ease',
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
