'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const KPATTO_TAB_BAR_HEIGHT = 72

const TABS = [
  {
    key: 'home',
    label: 'HOME',
    href: '/kpatto/home',
    active: (p: string) => p === '/kpatto' || p === '/kpatto/home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'story',
    label: 'STORY',
    href: '/kpatto/story',
    active: (p: string) => p.startsWith('/kpatto/story'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    key: 'progress',
    label: 'PROGRESS',
    href: '/kpatto/progress',
    active: (p: string) => p.startsWith('/kpatto/progress'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    key: 'library',
    label: 'LIBRARY',
    href: '/kpatto/library',
    active: (p: string) => p.startsWith('/kpatto/library'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
] as const

export function KPattoTabBar() {
  const pathname = usePathname()
  const [scrolledDown, setScrolledDown] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (y > lastYRef.current && y > 60) setScrolledDown(true)
      else if (y < lastYRef.current) setScrolledDown(false)
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
          transition: 'all 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: scrolledDown ? 'scale(0.93)' : 'scale(1)',
          transformOrigin: 'bottom center',
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.active(pathname)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: scrolledDown ? 2 : 3,
                textDecoration: 'none',
                color: isActive ? 'var(--pt)' : 'var(--pm)',
                transition: 'color 0.15s ease, transform 80ms var(--ease-spring)',
                padding: scrolledDown ? '4px 10px' : '6px 14px',
                borderRadius: 9999,
                background: 'transparent',
                minWidth: scrolledDown ? 44 : 52,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.90)' }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              onTouchStart={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.90)' }}
              onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
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
