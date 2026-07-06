'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastYRef.current && y > 40) setHidden(true)
      else if (y < lastYRef.current) setHidden(false)
      lastYRef.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        height: 'var(--pnav-h)',
        background: 'transparent',
        borderBottom: 'none',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
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
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--pt)',
                margin: 0,
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                textShadow: '0 1px 0 rgba(255,255,255,.75), 0 10px 24px rgba(70,80,110,.08)',
              }}
            >
              PATTO
            </p>
          ) : (
            <p
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--pt)',
                margin: 0,
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {meta.title}
            </p>
          )}
          <p style={{
            fontSize: 10,
            color: 'var(--pm)',
            margin: '3px 0 0',
            letterSpacing: '0.02em',
            lineHeight: 1,
            fontWeight: 500,
          }}>
            {meta.sub}
          </p>
        </div>

        {/* Right: icon buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/library"
            aria-label="라이브러리"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <User style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
