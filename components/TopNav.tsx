'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, User } from 'lucide-react'
import { getStreak } from '@/lib/srs/storage'

const ALL_TABS = [
  { label: 'TODAY',    href: '/home' },
  { label: 'STORY',    href: '/stories/1' },
  { label: 'PROGRESS', href: '/records' },
  { label: 'SETTINGS', href: '/settings' },
] as const

type TabLabel = (typeof ALL_TABS)[number]['label']

function getActive(pathname: string): TabLabel {
  if (pathname === '/home' || pathname === '/') return 'TODAY'
  if (pathname.startsWith('/records')) return 'PROGRESS'
  if (pathname.startsWith('/settings')) return 'SETTINGS'
  return 'STORY'
}

export const NAV_HEIGHT = 48

const UNDERLINE_COLOR = '#8A1F45'

export function TopNav() {
  const pathname  = usePathname()
  const active    = getActive(pathname)
  const [streak, setStreak] = useState(0)

  // refs for each tab label element — used to position the sliding underline
  const tabRefs = useRef<Record<TabLabel, HTMLAnchorElement | null>>({
    TODAY: null, STORY: null, PROGRESS: null, SETTINGS: null,
  })

  // underline position state: left offset + width relative to the nav row
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setStreak(getStreak()) }, [pathname])

  useEffect(() => {
    const el  = tabRefs.current[active]
    const row = rowRef.current
    if (!el || !row) return

    const elRect  = el.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()
    const fullW   = elRect.width
    const underW  = fullW * 0.82            // 82% of label width
    const left    = elRect.left - rowRect.left + (fullW - underW) / 2

    setUnderline({ left, width: underW })
  }, [active, pathname])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm"
      style={{
        height: NAV_HEIGHT,
        background: 'var(--pnav)',
        borderBottom: '1px solid var(--pd)',
      }}
    >
      {/* single row — vertically centred */}
      <div
        ref={rowRef}
        className="flex items-center px-3 h-full"
        style={{ position: 'relative' }}
      >
        {/* All tabs — TODAY acts as brand + home link */}
        <div className="flex items-center gap-4">
          {ALL_TABS.map(({ label, href }) => {
            const isActive = active === label
            return (
              <Link
                key={label}
                href={href}
                ref={el => { tabRefs.current[label] = el }}
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.12em',
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
              position:     'absolute',
              bottom:       10,
              left:         underline.left,
              width:        underline.width,
              height:       1.5,
              background:   UNDERLINE_COLOR,
              borderRadius: 1,
              transition:   'left 180ms cubic-bezier(.4,0,.2,1), width 180ms cubic-bezier(.4,0,.2,1)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* 우측: streak + 프로필 */}
        <div className="ml-auto flex items-center gap-2.5">
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
