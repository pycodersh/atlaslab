'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, BookOpen, BarChart2, BookMarked } from 'lucide-react'
import { KP } from '@/lib/kpatto/theme'

export const KPATTO_TAB_BAR_HEIGHT = 80

const ACTIVE = KP.primary
const MUTED  = KP.inactive   // gray-400

const TABS = [
  {
    key: 'home',
    label: 'Home',
    href: '/kpatto',
    active: (p: string) => p === '/kpatto' || p === '/kpatto/home',
    icon: (active: boolean) => <House size={22} color={active ? ACTIVE : MUTED} strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    key: 'story',
    label: 'Episodes',
    href: '/kpatto/story',
    active: (p: string) => p.startsWith('/kpatto/story'),
    icon: (active: boolean) => <BookOpen size={22} color={active ? ACTIVE : MUTED} strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    key: 'record',
    label: 'Progress',
    href: '/kpatto/record',
    active: (p: string) => p.startsWith('/kpatto/record'),
    icon: (active: boolean) => <BarChart2 size={22} color={active ? ACTIVE : MUTED} strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    key: 'library',
    label: 'Library',
    href: '/kpatto/library',
    active: (p: string) => p.startsWith('/kpatto/library'),
    icon: (active: boolean) => <BookMarked size={22} color={active ? ACTIVE : MUTED} strokeWidth={active ? 2.5 : 1.8} />,
  },
] as const

export function KPattoTabBar() {
  const pathname = usePathname()

  if (pathname.endsWith('/export')) return null

  return (
    <div style={{
      position: 'fixed',
      // 홈 인디케이터와 겹치거나 잘리지 않도록: 최소 12px, 기기에 safe-area 가 있으면 그만큼
      bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 420,
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      <nav aria-label="K-PATTO" style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 9999,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        height: 64,
        padding: '0 8px',
      }}>
        {TABS.map((tab) => {
          const isActive = tab.active(pathname)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              style={{
                width: 72,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                height: '100%',
                textDecoration: 'none',
                color: isActive ? ACTIVE : MUTED,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.icon(isActive)}
              {/* 라벨은 항상 보인다(스크롤해도 접지 않는다) */}
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 800 : 500,
                letterSpacing: '0.02em',
                lineHeight: 1,
                color: isActive ? ACTIVE : MUTED,
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
