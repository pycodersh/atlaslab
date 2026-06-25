'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'STUDY', href: '/stories/1' },
  { label: 'PROGRESS', href: '/records' },
  { label: 'SETTINGS', href: '/settings' },
] as const

function getActive(pathname: string) {
  if (pathname === '/home' || pathname === '/') return 'HOME'
  if (pathname.startsWith('/records')) return 'PROGRESS'
  if (pathname.startsWith('/settings')) return 'SETTINGS'
  return 'STUDY'
}

export const NAV_HEIGHT = 52

export function TopNav() {
  const pathname = usePathname()
  const active = getActive(pathname)

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
      </div>
    </nav>
  )
}
