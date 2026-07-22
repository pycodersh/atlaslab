'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { House, BookOpen, ClipboardList, User } from 'lucide-react'

export const KPATTO_TAB_BAR_HEIGHT = 80

const ACCENT = '#D4873A'
const MUTED  = '#BBBBBB'

const TABS = [
  {
    key: 'home',
    label: 'Home',
    href: '/kpatto/home',
    active: (p: string) => p === '/kpatto' || p === '/kpatto/home',
    icon: (active: boolean) => <House size={22} color={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} />,
  },
  {
    key: 'story',
    label: 'Episodes',
    href: '/kpatto/story',
    active: (p: string) => p.startsWith('/kpatto/story'),
    icon: (active: boolean) => <BookOpen size={22} color={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} />,
  },
  {
    key: 'record',
    label: 'Record',
    href: '/kpatto/record',
    active: (p: string) => p.startsWith('/kpatto/record'),
    icon: (active: boolean) => <ClipboardList size={22} color={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} />,
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/kpatto/profile',
    active: (p: string) => p.startsWith('/kpatto/profile'),
    icon: (active: boolean) => <User size={22} color={active ? ACCENT : MUTED} strokeWidth={active ? 2.2 : 1.8} />,
  },
] as const

export function KPattoTabBar() {
  const pathname = usePathname()
  const [compact, setCompact] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current + 6) setCompact(false)
      else if (y < lastScrollY.current - 6) setCompact(true)
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
        justifyContent: 'center',
        gap: 0,
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
                width: 72,
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
