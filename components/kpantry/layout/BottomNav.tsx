'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const tabs = [
  {
    href: '/kpantry/en',
    label: 'HOME',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          stroke={active ? '#111111' : '#999999'}
          strokeWidth="1.5"
          fill={active ? '#111111' : 'none'}
          fillOpacity={active ? 0.08 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/kpantry/en/recipes',
    label: 'RECIPES',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 3C8 3 7 8 12 8C17 8 16 3 16 3"
          stroke={active ? '#111111' : '#999999'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6 8H18V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V8Z"
          stroke={active ? '#111111' : '#999999'}
          strokeWidth="1.5"
          fill={active ? '#111111' : 'none'}
          fillOpacity={active ? 0.08 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/kpantry/en/saved',
    label: 'SAVED',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3H19C19.55 3 20 3.45 20 4V21L12 17L4 21V4C4 3.45 4.45 3 5 3Z"
          stroke={active ? '#111111' : '#999999'}
          strokeWidth="1.5"
          fill={active ? '#111111' : 'none'}
          fillOpacity={active ? 0.08 : 0}
        />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        if (currentY > lastScrollY.current + 5) {
          setCollapsed(true)
        } else if (currentY < lastScrollY.current - 5) {
          setCollapsed(false)
        }
        lastScrollY.current = currentY
        ticking.current = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navH = collapsed ? 52 : 64

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      height: `calc(${navH}px + env(safe-area-inset-bottom))`,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 -1px 0 rgba(0,0,0,0.06)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
      transition: 'height 0.2s ease',
    } as React.CSSProperties}>
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: collapsed ? '6px 0 5px' : '10px 0 8px',
              textDecoration: 'none',
              gap: 3,
              transition: 'padding 0.2s ease',
            }}
          >
            {tab.icon(active)}
            <span style={{
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
              fontWeight: active ? 700 : 500,
              letterSpacing: '0.05em',
              color: active ? '#111111' : '#999999',
              transition: 'color 0.15s ease',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
