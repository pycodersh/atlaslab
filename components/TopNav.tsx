'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, User } from 'lucide-react'

export const NAV_HEIGHT = 60

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/home':     { title: 'PATTO',    sub: 'Patterns · Stories · You' },
  '/essays':   { title: 'Essays',   sub: 'Write & Reflect' },
  '/records':  { title: 'Progress', sub: 'Your Learning Journey' },
  '/library':  { title: 'Library',  sub: 'Patterns & Words' },
}

function getPageMeta(pathname: string) {
  if (pathname === '/home' || pathname === '/') return PAGE_TITLES['/home']
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key)) return val
  }
  return { title: 'PATTO', sub: 'Patterns · Stories · You' }
}

export function TopNav() {
  const pathname = usePathname()
  const isHome   = pathname === '/home' || pathname === '/'
  const meta     = getPageMeta(pathname)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        height: 'var(--pnav-h)',
        background: 'var(--pnav)',
        borderBottom: '0.5px solid var(--pd)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div
        className="flex items-center justify-between px-5"
        style={{
          height: NAV_HEIGHT,
          marginTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Left: Logo / Page title */}
        <div>
          {isHome ? (
            <p
              className="font-playfair"
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--pt)',
                margin: 0,
                lineHeight: 1,
              }}
            >
              PATTO
            </p>
          ) : (
            <p
              className="font-playfair"
              style={{
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--pt)',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {meta.title}
            </p>
          )}
          <p style={{
            fontSize: 10,
            color: 'var(--pm)',
            margin: '2px 0 0',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}>
            {meta.sub}
          </p>
        </div>

        {/* Right: icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/library"
            aria-label="검색"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--pc)',
            }}
          >
            <Search style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </Link>
          <Link
            href="/settings"
            aria-label="프로필"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--pc)',
            }}
          >
            <User style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
