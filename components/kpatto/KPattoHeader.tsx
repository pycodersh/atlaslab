'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function KPattoHeader() {
  const { user } = useAuth()

  // OAuth 프로필 사진 (Google 등)
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  // 이메일 앞 두 글자를 이니셜로 사용
  const email    = user?.email ?? ''
  const initials = email ? email.slice(0, 2).toUpperCase() : ''

  return (
    <div
      data-kpatto-header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #F2F2F2',
        // safe-area-inset-top: 노치/다이나믹아일랜드 영역만큼 배경 연장
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 56,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {/* Logo */}
        <Link href="/kpatto/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image
            src="/kpatto/banners/KPatto_Icon_transparent.png"
            alt="K-PATTO"
            width={28}
            height={28}
            style={{ background: 'transparent' }}
          />
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '-0.03em',
          }}>
            K-PATTO
          </span>
        </Link>

        {/* Profile avatar */}
        <Link href="/kpatto/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            overflow: 'hidden',
            background: user ? '#F0EBE3' : '#F2F2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {user ? (
              avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt="profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span style={{
                  fontSize: 11, fontWeight: 800, color: '#D4873A',
                  letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {initials}
                </span>
              )
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
