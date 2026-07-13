'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getLastPosition } from '@/lib/last-position'

export const TAB_BAR_HEIGHT = 72

const TABS = [
  {
    label: 'HOME',
    href: '/patto/home',
    active: (p: string) => p === '/patto/home' || p === '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'STORY',
    href: '/patto/stories/1',
    active: (p: string) => p.startsWith('/patto/stories') || p.startsWith('/learn') || p.startsWith('/review'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    label: 'PROGRESS',
    href: '/patto/records',
    active: (p: string) => p.startsWith('/patto/records'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'LIBRARY',
    href: '/patto/library',
    active: (p: string) => p.startsWith('/patto/library') || p.startsWith('/patto/essays') || p.startsWith('/editor'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 4h6a2 2 0 0 1 2 2v14l-5-3l-5 3V6a2 2 0 0 1 2-2"/>
      </svg>
    ),
  },
] as const

export function MainTabBar() {
  const pathname = usePathname()
  const [scrolledDown, setScrolledDown] = useState(false)
  const lastYRef = useRef(0)

  // Focus mode: hide tab bar only on session pages (story pages keep tab bar)
  const inStoryPage = pathname?.startsWith('/patto/session/') ?? false

  // Restore last story/pattern position when tapping the Story tab
  const lastPos = getLastPosition()
  const storyHref = lastPos ? `/patto/stories/${lastPos.storyId}` : '/patto/stories/1'

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
        pointerEvents: inStoryPage ? 'none' : undefined,
        opacity: inStoryPage ? 0 : 1,
        transform: inStoryPage ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
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
          const href = tab.label === 'STORY' ? storyHref : tab.href
          return (
            <Link
              key={tab.href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: scrolledDown ? 2 : 3,
                textDecoration: 'none',
                color: isActive ? 'var(--pa)' : 'var(--pm)',
                transition: 'color 0.15s ease',
                padding: scrolledDown ? '4px 10px' : '6px 14px',
                borderRadius: 9999,
                background: 'transparent',
                boxShadow: 'none',
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
