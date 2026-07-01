'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, User } from 'lucide-react'
import { getStreak } from '@/lib/srs/storage'

const TABS = [
  { label: 'STORY',    href: '/stories/1' },
  { label: 'PROGRESS', href: '/records' },
  { label: 'SETTINGS', href: '/settings' },
] as const

function getActive(pathname: string) {
  if (pathname === '/home' || pathname === '/') return 'HOME'
  if (pathname.startsWith('/records')) return 'PROGRESS'
  if (pathname.startsWith('/settings')) return 'SETTINGS'
  return 'STORY'
}

export const NAV_HEIGHT = 48

export function TopNav() {
  const pathname = usePathname()
  const active = getActive(pathname)
  const [streak, setStreak] = useState(0)

  useEffect(() => { setStreak(getStreak()) }, [pathname])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm"
      style={{
        height: NAV_HEIGHT,
        background: 'var(--pnav)',
        borderBottom: '1px solid var(--pd)',
      }}
    >
      {/* 아래 줄 맞춤 — pb-2로 바닥 기준 정렬 */}
      <div className="flex items-end gap-0 px-3 h-full pb-2">

        {/* PATTO brand → Home */}
        <Link
          href="/home"
          className="font-playfair shrink-0 transition-opacity"
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: 'var(--pt)',
            lineHeight: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          PATTO
        </Link>

        {/* Nav tabs — 간격 축소 */}
        <div className="flex items-end gap-3 ml-4">
          {TABS.map(({ label, href }) => {
            const isActive = active === label
            return (
              <Link
                key={label}
                href={href}
                className="transition-colors"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--pt)' : 'var(--pm)',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* 우측: streak + 프로필 */}
        <div className="ml-auto flex items-center gap-2.5 pb-0.5">
          <div className="flex items-center gap-1" title={`연속 학습 ${streak}일`}>
            <Flame
              className="w-3 h-3"
              strokeWidth={2}
              style={{ color: streak > 0 ? 'var(--pa)' : 'var(--pm2)' }}
              fill={streak > 0 ? 'var(--pa)' : 'none'}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pt)' }}>{streak}</span>
          </div>
          <Link
            href="/settings"
            aria-label="설정"
            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--pd)' }}
          >
            <User className="w-3 h-3" strokeWidth={2} style={{ color: 'var(--pt)' }} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
