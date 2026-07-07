'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle, X } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(60,60,67,0.07)',
  boxShadow: '0 1px 6px rgba(40,40,60,0.04)',
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

function MenuCard({
  icon: Icon,
  label,
  desc,
  href,
  onClick,
}: {
  icon: React.ElementType
  label: string
  desc: string
  href?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'rgba(245,245,247,0.9)',
        border: '1px solid rgba(60,60,67,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 13, height: 13, color: '#6E6E73' }} strokeWidth={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 11.5, fontWeight: 700,
          color: '#1C1C1E', margin: '0 0 1px',
          letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 11.5, color: '#C0C0C5',
          margin: 0, fontWeight: 400, lineHeight: 1.35,
        }}>
          {desc}
        </p>
      </div>

      <ChevronRight style={{ width: 11, height: 11, color: '#D1D1D6', flexShrink: 0 }} strokeWidth={2} />
    </>
  )

  const sharedStyle: React.CSSProperties = {
    ...card,
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '13px 16px',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  }

  if (href) {
    return (
      <Link
        href={href}
        style={sharedStyle}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.70' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.70' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      {inner}
    </button>
  )
}

function AccountPopup({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const t = useT()
  const { prefs } = usePreferences()
  const isKorean = prefs.language === 'ko'
  const [toast, setToast] = useState('')

  function handleLogin(provider: string) {
    setToast(`${provider} ${t('auth_coming_soon')}`)
    setTimeout(() => setToast(''), 2800)
  }

  const KO_PROVIDERS = [
    {
      id: 'naver',
      label: t('auth_continue_naver'),
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <rect width="24" height="24" rx="6" fill="#03C75A" />
          <path d="M13.74 12.27L10.14 7H7v10h3.26V11.73L14.86 17H18V7h-3.26v5.27z" fill="white" />
        </svg>
      ),
      bg: '#03C75A', text: '#fff', border: 'rgba(3,199,90,0.80)',
    },
    {
      id: 'kakao',
      label: t('auth_continue_kakao'),
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <rect width="24" height="24" rx="6" fill="#FEE500" />
          <path d="M12 5.5C8.13 5.5 5 7.97 5 11.03c0 1.93 1.2 3.63 3.01 4.67l-.77 2.87c-.07.26.22.47.45.33L11.1 17c.29.03.59.05.9.05 3.87 0 7-2.47 7-5.52S15.87 5.5 12 5.5z" fill="#3C1E1E" />
        </svg>
      ),
      bg: '#FEE500', text: '#3C1E1E', border: 'rgba(254,229,0,0.80)',
    },
  ]

  const BASE_PROVIDERS = [
    {
      id: 'google',
      label: t('auth_continue_google'),
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20}>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
      bg: null, text: null, border: null,
    },
    {
      id: 'apple',
      label: t('auth_continue_apple'),
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.28.07 2.17.74 2.93.8 1.12-.22 2.19-.91 3.39-.84 1.44.09 2.52.66 3.22 1.67-2.95 1.78-2.25 5.69.23 6.78-.52 1.56-1.2 3.12-1.77 4.45zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      ),
      bg: null, text: null, border: null, dark: true,
    },
  ]

  const PROVIDERS = isKorean ? [...KO_PROVIDERS, ...BASE_PROVIDERS] : BASE_PROVIDERS

  const content = (
    <div
      role="dialog"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.24)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 480, borderRadius: 24, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 22px 18px',
        }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
            color: 'var(--pm2)', margin: 0, textTransform: 'uppercase',
          }}>
            Account
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(120,120,128,0.12)', border: 'none',
              borderRadius: 999, width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}
          >
            <X style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2} />
          </button>
        </div>

        {/* Provider buttons */}
        <div style={{ padding: '0 22px 28px' }}>
          {PROVIDERS.map((p, i) => {
            const isLast = i === PROVIDERS.length - 1
            const btnStyle: React.CSSProperties = p.bg
              ? { background: p.bg, color: p.text, border: `1.5px solid ${p.border}` }
              : ('dark' in p && p.dark)
              ? { background: 'var(--pt)', color: 'var(--pb)', border: '1.5px solid var(--pt)' }
              : {
                  background: 'rgba(255,255,255,0.80)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  color: 'var(--pt2)',
                  border: '1.5px solid rgba(220,225,235,0.90)',
                }
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLogin(p.id)}
                style={{
                  ...btnStyle,
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px',
                  borderRadius: 14,
                  fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                  marginBottom: isLast ? 0 : 8,
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{p.logo}</span>
                <span style={{ flex: 1, textAlign: 'center' }}>{p.label}</span>
              </button>
            )
          })}

          {/* Agreement */}
          <p style={{ fontSize: 10.5, color: 'var(--pm2)', lineHeight: 1.7, textAlign: 'center', margin: '18px 0 0' }}>
            {t('auth_agree_pre')}{' '}
            <Link href="/settings/about/terms" style={{ textDecoration: 'underline', color: 'var(--pm)' }}>
              {t('auth_terms_link')}
            </Link>
            {t('auth_agree_mid')}
            <Link href="/settings/about/privacy" style={{ textDecoration: 'underline', color: 'var(--pm)' }}>
              {t('auth_privacy_link')}
            </Link>
            {t('auth_agree_post')}
          </p>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--pt)', color: 'var(--pb)',
          fontSize: 12, padding: '10px 22px', borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 10000, whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>
          {toast}
        </div>
      )}
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}

export default function SettingsPage() {
  const t = useT()
  const [showAccount, setShowAccount] = useState(false)

  return (
    <>
      <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
        <TopNav />

        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: `8px 20px calc(${TAB_BAR_HEIGHT}px + 32px)`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>

          <MenuCard
            icon={UserCircle}
            label={t('hub_account')}
            desc={t('hub_account_desc')}
            onClick={() => setShowAccount(true)}
          />
          <MenuCard
            icon={SlidersHorizontal}
            label={t('hub_preferences')}
            desc={t('hub_preferences_desc')}
            href="/settings/preferences"
          />
          <MenuCard
            icon={Sparkles}
            label={t('hub_subscription')}
            desc={t('hub_subscription_desc')}
            href="/settings/subscription"
          />
          <MenuCard
            icon={Info}
            label={t('hub_about')}
            desc={t('hub_about_desc')}
            href="/settings/about"
          />

          <p style={{
            fontSize: 11, color: '#D1D1D6', fontWeight: 400,
            margin: '12px 0 0', textAlign: 'center', letterSpacing: '0.02em',
          }}>
            v1.0.0
          </p>

        </div>
      </div>

      {showAccount && <AccountPopup onClose={() => setShowAccount(false)} />}
    </>
  )
}
