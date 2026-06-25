'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'STUDY', href: '/stories/1' },
  { label: 'PROGRESS', href: '/records' },
  { label: 'SETTINGS', href: '/settings' },
] as const

function getActive(pathname: string) {
  if (pathname.startsWith('/records')) return 'PROGRESS'
  if (pathname.startsWith('/settings')) return 'SETTINGS'
  return 'STUDY'
}

// 24px brand row + 32px tab row (+ 4px tip overflow)
export const NAV_HEIGHT = 60

export function TopNav() {
  const pathname = usePathname()
  const active = getActive(pathname)

  return (
    // overflow-visible so the V-tip of active tab can bleed below the border
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8F4]/96 backdrop-blur-sm"
      style={{ height: NAV_HEIGHT }}
    >
      {/* Row 1 — Brand only */}
      <div className="flex items-center px-5 h-7 pt-2">
        <span className="text-[11px] font-bold tracking-[0.3em] text-[#1A1A1A]">PATTO</span>
      </div>

      {/* Row 2 — Bookmark tabs */}
      <div className="flex items-end px-4 border-b border-[#EDE5DC]" style={{ height: 33 }}>
        {TABS.map(({ label, href }) => {
          const isActive = active === label
          return isActive ? (
            // Active: bookmark shape with V-notch at bottom
            <Link
              key={label}
              href={href}
              className="relative flex items-center justify-center px-4 text-[#FAF8F4] cursor-pointer"
              style={{
                height: 32,
                minWidth: 72,
                background: '#8B2246',
                clipPath: 'polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%)',
                fontSize: 9,
                letterSpacing: '0.28em',
                fontWeight: 700,
                paddingBottom: 6,
              }}
            >
              {label}
            </Link>
          ) : (
            // Inactive: flat shorter tab
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center px-4 cursor-pointer transition-colors hover:text-[#9B9490]"
              style={{
                height: 26,
                minWidth: 72,
                background: '#EDE5DC',
                borderRadius: '4px 4px 0 0',
                fontSize: 9,
                letterSpacing: '0.25em',
                fontWeight: 600,
                color: '#B8AFA8',
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
