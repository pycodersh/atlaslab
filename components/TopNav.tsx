'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'

const ALL_TABS = [
  { label: 'TODAY',    href: '/home' },
  { label: 'STORY',    href: '/stories/1' },
  { label: 'ESSAYS',   href: '/essays' },
  { label: 'PROGRESS', href: '/records' },
  { label: 'LIBRARY',  href: '/library' },
] as const

type TabLabel = (typeof ALL_TABS)[number]['label']

function getActive(pathname: string): TabLabel {
  if (pathname === '/home' || pathname === '/') return 'TODAY'
  if (pathname.startsWith('/essays'))  return 'ESSAYS'
  if (pathname.startsWith('/records')) return 'PROGRESS'
  if (pathname.startsWith('/library')) return 'LIBRARY'
  return 'STORY'
}

export const NAV_HEIGHT = 48

const UNDERLINE_COLOR = '#8A1F45'

export function TopNav() {
  const pathname = usePathname()
  const active   = getActive(pathname)

  const tabRefs = useRef<Record<TabLabel, HTMLAnchorElement | null>>({
    TODAY: null, STORY: null, ESSAYS: null, PROGRESS: null, LIBRARY: null,
  })

  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el  = tabRefs.current[active]
    const row = rowRef.current
    if (!el || !row) return

    const elRect  = el.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()
    const fullW   = elRect.width
    const underW  = fullW * 0.82
    const left    = elRect.left - rowRect.left + (fullW - underW) / 2

    setUnderline({ left, width: underW })
  }, [active, pathname])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        height: 'var(--pnav-h)',
        background: 'var(--pb)',
        borderBottom: '1px solid var(--pd)',
      }}
    >
      <div
        ref={rowRef}
        className="flex items-center px-3"
        style={{
          position: 'relative',
          height: NAV_HEIGHT,
          marginTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-3">
          {ALL_TABS.map(({ label, href }) => {
            const isActive = active === label
            return (
              <Link
                key={label}
                href={href}
                ref={el => { tabRefs.current[label] = el }}
                style={{
                  fontSize: 8.5,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.1em',
                  color: isActive ? 'var(--pt)' : 'var(--pm)',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                  transition: 'color 0.18s ease',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Sliding underline */}
        {underline && (
          <span
            aria-hidden
            style={{
              position:      'absolute',
              bottom:        10,
              left:          underline.left,
              width:         underline.width,
              height:        1.5,
              background:    UNDERLINE_COLOR,
              borderRadius:  1,
              transition:    'left 180ms cubic-bezier(.4,0,.2,1), width 180ms cubic-bezier(.4,0,.2,1)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Profile icon → Settings */}
        <div className="ml-auto">
          <Link
            href="/settings"
            aria-label="프로필"
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--pd)' }}
          >
            <User className="w-3 h-3" strokeWidth={2} style={{ color: 'var(--pt)' }} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
