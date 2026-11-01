'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ACTIVE = '#C8102E'
const INACTIVE = '#737373'

const tabs = [
  {
    href: '/kpantry/en',
    label: 'HOME',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/kpantry/en/recipes',
    label: 'RECIPES',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 3C8 3 7 8 12 8C17 8 16 3 16 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 8H18V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V8Z" stroke={color} strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    href: '/kpantry/en/saved',
    label: 'SAVED',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 3H19C19.55 3 20 3.45 20 4V21L12 17L4 21V4C4 3.45 4.45 3 5 3Z"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

/**
 * 바닥에서 띄운 플로팅 필 탭 바. 높이 약 60px + 바닥 여백 16px —
 * 본문이 가려지지 않게 layout.tsx 푸터가 그만큼(96px + safe-area) 띄워 둔다.
 */
export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="K-Pantry"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        maxWidth: 448,
        margin: '0 auto',
        height: 60,
        display: 'flex',
        padding: '0 8px',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(231, 229, 228, 0.6)',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)',
        zIndex: 100,
      } as React.CSSProperties}
    >
      {tabs.map(tab => {
        // 홈은 정확히 일치할 때만, 나머지는 하위 경로(?mode=pantry 등)까지 활성
        const active = tab.href === '/kpantry/en' ? pathname === tab.href : pathname.startsWith(tab.href)
        const color = active ? ACTIVE : INACTIVE
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
            }}
          >
            {tab.icon(color)}
            <span style={{
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
              fontWeight: active ? 700 : 500,
              letterSpacing: '0.05em',
              color,
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
