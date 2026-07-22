'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function KPattoHeader() {
  const { user } = useAuth()

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: '#FFFFFF',
      borderBottom: '1px solid #F2F2F2',
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
            src="/kpatto/banners/KPatto Icon.png"
            alt="K-PATTO"
            width={28}
            height={28}
            style={{ borderRadius: 7 }}
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
        <Link
          href="/kpatto/profile"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          {user ? (user.email?.[0].toUpperCase() ?? '?') : '?'}
        </Link>
      </div>
    </div>
  )
}
