'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { getUI } from '@/lib/kpatto/ui-strings'

const T1  = '#111111'
const T2  = '#999999'
const DIV = '#F2F2F2'

export default function KPattoProfilePage() {
  const { user, loading } = useAuth()
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)

  const settingsLinks = [
    { href: '/patto/settings/account',      label: ui.pf_account,      emoji: '👤' },
    { href: '/patto/settings/preferences',  label: ui.pf_language,     emoji: '🌐' },
    { href: '/patto/settings/subscription', label: ui.pf_subscription, emoji: '⭐' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/kpatto/home" style={{ color: T2, textDecoration: 'none', fontSize: 22, lineHeight: 1 }}>‹</Link>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase' }}>K-PATTO</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.02em' }}>Profile</div>
        </div>
      </div>

      <div style={{ height: 1, background: DIV }} />

      {/* Avatar section */}
      <div style={{ padding: '32px 20px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: T1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: '#FFFFFF', fontWeight: 800, flexShrink: 0,
        }}>
          {loading ? '…' : user ? (user.email?.[0].toUpperCase() ?? '?') : '?'}
        </div>
        <div>
          {user ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{user.email}</div>
              <div style={{ fontSize: 12, color: T2, marginTop: 3 }}>{ui.pf_learner}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{ui.pf_guest}</div>
              <div style={{ fontSize: 12, color: T2, marginTop: 3 }}>{ui.pf_guest_hint}</div>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: DIV }} />

      {/* Settings label */}
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase' }}>
          Settings
        </div>
      </div>

      {/* Settings rows */}
      {settingsLinks.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '17px 20px',
            borderBottom: i < settingsLinks.length - 1 ? `1px solid ${DIV}` : 'none',
            textDecoration: 'none', color: T1,
            fontWeight: 500, fontSize: 14,
          }}
        >
          <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.emoji}</span>
          {item.label}
          <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </Link>
      ))}

    </div>
  )
}
