'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const NAV_HEIGHT = 56


function UserButton() {
  const { user, loading } = useAuth()

  const buttonStyle: React.CSSProperties = {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--pglass)',
    border: '1px solid var(--pglass-border)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
    textDecoration: 'none',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform var(--dur-xs) var(--ease-spring), box-shadow var(--dur-sm) var(--ease-std), background var(--dur-sm) var(--ease-std)',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  }

  if (loading) {
    return (
      <div style={{ ...buttonStyle, opacity: 0.45 }}>
        <User style={{ width: 18, height: 18, color: 'var(--pm)' }} strokeWidth={1.8} />
      </div>
    )
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined
    const initial = ((user.user_metadata?.name as string) ?? user.email ?? '?')[0].toUpperCase()

    return (
      <Link
        href="/patto/settings"
        aria-label="계정"
        style={buttonStyle}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(142,167,255,0.18), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
        onMouseDown={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)'
        }}
        onMouseUp={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        }}
        onTouchStart={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)'
        }}
        onTouchEnd={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="프로필"
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--pa)', lineHeight: 1 }}>
            {initial}
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link
      href="/patto/settings"
      aria-label="설정"
      style={buttonStyle}
      onMouseDown={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)'
      }}
      onMouseUp={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
      onTouchStart={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)'
      }}
      onTouchEnd={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
      <User style={{ width: 18, height: 18, color: 'var(--pm)' }} strokeWidth={1.8} />
    </Link>
  )
}

export function TopNav() {
  return (
    <nav style={{ background: 'var(--pb)', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 50 }}>
      <div
        className="flex items-center justify-between px-5"
        style={{
          height: NAV_HEIGHT,
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Left: PATTO wordmark */}
        <Link
          href="/patto/home"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <p style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--pt)',
            margin: 0,
            lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            PATTO
          </p>
        </Link>

        {/* Right: user button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
