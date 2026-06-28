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

export const NAV_HEIGHT = 52

export function TopNav() {
  const pathname = usePathname()
  const active = getActive(pathname)
  const [streak, setStreak] = useState(0)

  useEffect(() => { setStreak(getStreak()) }, [pathname])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b border-[var(--pd)]"
      style={{ height: NAV_HEIGHT, background: 'var(--pnav)' }}
    >
      <div className="flex items-end gap-1.5 px-3 h-full pb-0">

        {/* PATTO brand tab → Home */}
        <Link
          href="/home"
          className="flex items-center justify-center cursor-pointer transition-colors shrink-0"
          style={{
            height: 38,
            paddingLeft: 14,
            paddingRight: 14,
            background: active === 'HOME' ? 'var(--pa)' : 'var(--pd)',
            borderRadius: '7px 7px 0 0',
            fontSize: 13,
            letterSpacing: '0.22em',
            fontWeight: 800,
            color: active === 'HOME' ? 'var(--pb)' : 'var(--pt)',
          }}
        >
          PATTO
        </Link>

        {/* Nav tabs */}
        {TABS.map(({ label, href }) => {
          const isActive = active === label
          return (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center cursor-pointer transition-colors"
              style={{
                height: 28,
                paddingLeft: 10,
                paddingRight: 10,
                background: isActive ? 'var(--pa)' : 'var(--pd)',
                borderRadius: '6px 6px 0 0',
                fontSize: 8,
                letterSpacing: '0.14em',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? 'var(--pb)' : 'var(--pm)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          )
        })}

        {/* 우측: streak + 프로필 */}
        <div className="ml-auto flex items-center gap-3 self-center pb-0.5">
          <div className="flex items-center gap-1" title={`연속 학습 ${streak}일`}>
            <Flame
              className="w-3.5 h-3.5"
              strokeWidth={2}
              style={{ color: streak > 0 ? 'var(--pa)' : 'var(--pm2)' }}
              fill={streak > 0 ? 'var(--pa)' : 'none'}
            />
            <span className="text-[12px] font-bold" style={{ color: 'var(--pt)' }}>{streak}</span>
          </div>
          <Link
            href="/settings"
            aria-label="설정"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--pd)' }}
          >
            <User className="w-3.5 h-3.5" strokeWidth={2} style={{ color: 'var(--pt)' }} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
