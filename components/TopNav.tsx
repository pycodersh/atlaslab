'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const NAV_HEIGHT = 50


function UserButton() {
  const { user, loading } = useAuth()

  const buttonStyle: React.CSSProperties = {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--pglass)',
    border: '1px solid var(--pglass-border)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textDecoration: 'none',
    overflow: 'hidden',
  }

  if (loading) {
    return (
      <div style={{ ...buttonStyle, opacity: 0.5 }}>
        <User style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
      </div>
    )
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined
    const initial = ((user.user_metadata?.name as string) ?? user.email ?? '?')[0].toUpperCase()

    return (
      <Link href="/patto/settings" aria-label="계정" style={buttonStyle}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="프로필"
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pa)', lineHeight: 1 }}>
            {initial}
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link href="/patto/settings" aria-label="설정" style={buttonStyle}>
      <User style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
    </Link>
  )
}

export function TopNav() {
  return (
    <nav style={{ background: 'transparent', borderBottom: 'none' }}>
      <div
        className="flex items-center justify-between px-5"
        style={{
          height: NAV_HEIGHT,
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Left: PATTO text title */}
        <Link href="/patto/home" style={{ textDecoration: 'none' }}>
          <p style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--pt)',
            margin: 0,
            lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            PATTO
          </p>
        </Link>

        {/* Right: user button — state-aware */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
