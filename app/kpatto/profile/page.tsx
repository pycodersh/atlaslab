'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'

export default function KPattoProfilePage() {
  const { user, loading } = useAuth()

  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/kpatto/home" style={{ color: 'var(--pt)', textDecoration: 'none', fontSize: 20 }}>‹</Link>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>K-PATTO</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>PROFILE</h1>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Avatar & email */}
        <div style={{
          background: 'var(--pb)',
          border: '1px solid var(--border, rgba(0,0,0,0.08))',
          borderRadius: 20,
          padding: '24px 20px',
          textAlign: 'center',
          marginBottom: 16,
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#fff',
            fontWeight: 800,
            margin: '0 auto 12px',
          }}>
            {loading ? '…' : user ? (user.email?.[0].toUpperCase() ?? '👤') : '👤'}
          </div>
          {user ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>{user.email}</div>
              <div style={{ fontSize: 12, color: 'var(--pm)', marginTop: 4 }}>K-PATTO 학습자</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>게스트</div>
              <div style={{ fontSize: 12, color: 'var(--pm)', marginTop: 4 }}>로그인하면 기록이 저장됩니다</div>
            </>
          )}
        </div>

        {/* Settings links — reuse PATTO's auth/settings pages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { href: '/patto/settings/account', label: '계정 설정', emoji: '👤' },
            { href: '/patto/settings/preferences', label: '언어 설정', emoji: '🌐' },
            { href: '/patto/settings/subscription', label: '구독 관리', emoji: '⭐' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--pb)',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                borderRadius: 14,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'var(--pt)',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              {item.label}
              <span style={{ marginLeft: 'auto', color: 'var(--pm)', fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
