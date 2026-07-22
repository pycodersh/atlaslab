'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const KPATTO_TAB_BAR_HEIGHT = 60

const ACCENT = '#D4873A'
const MUTED  = '#BBBBBB'

const TABS = [
  {
    key: 'home',
    label: 'HOME',
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
    label: 'STORY',
    href: '/kpatto/story',
    active: (p: string) => p.startsWith('/kpatto/story'),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
] as const

export function KPattoTabBar() {
  const pathname = usePathname()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      background: '#FFFFFF',
      borderTop: '1px solid #F2F2F2',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <nav style={{
        display: 'flex',
        maxWidth: 430,
        margin: '0 auto',
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
                gap: 3,
                height: KPATTO_TAB_BAR_HEIGHT,
                textDecoration: 'none',
                color: isActive ? ACCENT : MUTED,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.icon(isActive)}
              <span style={{
                fontSize: 9,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.04em',
                lineHeight: 1,
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
