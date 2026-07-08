'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle, X, PlusSquare } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useTheme } from '@/components/ThemeProvider'

const card: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 1px 6px rgba(40,40,60,0.04)',
}

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
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
        background: 'var(--pc)',
        border: '1px solid var(--pglass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 13, height: 13, color: '#6E6E73' }} strokeWidth={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 11.5, fontWeight: 700,
          color: 'var(--pt)', margin: '0 0 1px',
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
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setMounted(true)
    setTimeout(() => setVisible(true), 10)
  }, [])
  const t = useT()
  const { prefs } = usePreferences()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isKorean = prefs.language === 'ko'
  const [toast, setToast] = useState('')

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  function handleLogin(provider: string) {
    setToast(`${provider} ${t('auth_coming_soon')}`)
    setTimeout(() => setToast(''), 2800)
  }

  const btnBase: React.CSSProperties = {
    width: '100%',
    height: 56,
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '0 20px',
    borderRadius: 16,
    fontSize: 15, fontWeight: 600,
    cursor: 'pointer', textAlign: 'left',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.18s',
    background: isDark ? 'rgba(44,44,46,0.90)' : '#FFFFFF',
    color: isDark ? '#FFFFFF' : '#1C1C1E',
    border: isDark ? '1px solid rgba(80,80,90,0.55)' : '1px solid #E8E8E8',
  }

  type Provider = {
    id: string
    label: string
    logo: React.ReactNode
    bg?: string
    text?: string
    border?: string
  }

  const GOOGLE: Provider = {
    id: 'google',
    label: t('auth_continue_google'),
    logo: (
      <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  }

  const EMAIL: Provider = {
    id: 'email',
    label: t('auth_continue_email'),
    logo: (
      <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
  }

  const KAKAO: Provider = {
    id: 'kakao',
    label: t('auth_continue_kakao'),
    logo: (
      <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none">
        <rect width="24" height="24" rx="6" fill="#FEE500" />
        <path d="M12 5.5C8.13 5.5 5 7.97 5 11.03c0 1.93 1.2 3.63 3.01 4.67l-.77 2.87c-.07.26.22.47.45.33L11.1 17c.29.03.59.05.9.05 3.87 0 7-2.47 7-5.52S15.87 5.5 12 5.5z" fill="#3C1E1E" />
      </svg>
    ),
    bg: '#FEE500', text: '#3C1E1E', border: '1px solid rgba(254,229,0,0.80)',
  }

  const NAVER: Provider = {
    id: 'naver',
    label: t('auth_continue_naver'),
    logo: (
      <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none">
        <rect width="24" height="24" rx="6" fill="#03C75A" />
        <path d="M13.74 12.27L10.14 7H7v10h3.26V11.73L14.86 17H18V7h-3.26v5.27z" fill="white" />
      </svg>
    ),
    bg: '#03C75A', text: '#fff', border: '1px solid rgba(3,199,90,0.80)',
  }

  const PROVIDERS: Provider[] = [
    GOOGLE,
    EMAIL,
    ...(isKorean ? [KAKAO, NAVER] : []),
  ]

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        background: visible ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
        transition: 'background 0.22s, backdrop-filter 0.22s',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%', maxWidth: 400, borderRadius: 28, overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.97)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '18px 20px 0' }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'rgba(120,120,128,0.10)', border: 'none',
              borderRadius: 999, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(120,120,128,0.20)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(120,120,128,0.10)' }}
          >
            <X style={{ width: 13, height: 13, color: '#8E8E93' }} strokeWidth={2.2} />
          </button>
        </div>

        {/* Title + desc */}
        <div style={{ padding: '28px 32px 24px', textAlign: 'center' }}>
          <p style={{
            fontSize: 22, fontWeight: 800, color: 'var(--pt)',
            margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Welcome to PATTO
          </p>
          <p style={{
            fontSize: 12.5, color: '#8E8E93', lineHeight: 1.6,
            margin: 0, fontWeight: 400, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto',
            wordBreak: 'keep-all',
          }}>
            {isKorean
              ? '로그인하면 에세이, 단어장, 학습 기록을 모든 기기에서 이어갈 수 있어요.'
              : 'Sign in to save your essays and continue learning across devices.'}
          </p>
        </div>

        {/* Providers */}
        <div style={{ padding: '0 32px' }}>
          {PROVIDERS.map((p, i) => {
            const customStyle: React.CSSProperties = p.bg
              ? { background: p.bg, color: p.text, border: p.border }
              : {}
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLogin(p.id)}
                style={{
                  ...btnBase,
                  ...customStyle,
                  marginBottom: i < PROVIDERS.length - 1 ? 12 : 0,
                }}
                onMouseEnter={e => {
                  if (!p.bg) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'
                  else e.currentTarget.style.opacity = '0.88'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{p.logo}</span>
                <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>{p.label}</span>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 32px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--pd)' }} />
          <span style={{ fontSize: 11, color: '#A0A0A8', fontWeight: 500, letterSpacing: '0.06em' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--pd)' }} />
        </div>

        {/* Terms */}
        <p style={{
          fontSize: 12.5, color: '#A0A0A8', lineHeight: 1.65,
          textAlign: 'center', margin: '14px 0 32px', padding: '0 32px',
        }}>
          {t('auth_agree_pre')}{' '}
          <Link href="/settings/about/terms" style={{ color: 'var(--pa)', textDecoration: 'none', fontWeight: 600 }}>
            {t('auth_terms_link')}
          </Link>
          {t('auth_agree_mid')}
          <Link href="/settings/about/privacy" style={{ color: 'var(--pa)', textDecoration: 'none', fontWeight: 600 }}>
            {t('auth_privacy_link')}
          </Link>
          {t('auth_agree_post')}
        </p>
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

// ── iOS Install Guide Sheet ───────────────────────────────────────────────────
function IOSInstallSheet({ onClose, isKorean }: { onClose: () => void; isKorean: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => { setMounted(true); setTimeout(() => setVisible(true), 10) }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const steps = isKorean
    ? [
        { n: '1', text: 'Safari 하단의 공유 버튼(□↑)을 누르세요.' },
        { n: '2', text: '메뉴에서 "홈 화면에 추가"를 선택하세요.' },
        { n: '3', text: '오른쪽 위의 "추가"를 누르면 완료됩니다.' },
      ]
    : [
        { n: '1', text: 'Tap the Share button (□↑) at the bottom of Safari.' },
        { n: '2', text: 'Select "Add to Home Screen" from the menu.' },
        { n: '3', text: 'Tap "Add" in the top right to finish.' },
      ]

  const content = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: visible ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'none',
        WebkitBackdropFilter: visible ? 'blur(6px)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
        transition: 'background 0.22s',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'var(--pglass)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid var(--pglass-border)',
        borderRadius: 24,
        padding: '0 0 24px',
        transform: visible ? 'scale(1)' : 'scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.24s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em' }}>
            {isKorean ? 'iPhone에 PATTO 설치하기' : 'Install PATTO on iPhone'}
          </p>
          <button type="button" onClick={handleClose}
            style={{ background: 'rgba(120,120,128,0.10)', border: 'none', borderRadius: 999, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <X style={{ width: 12, height: 12, color: '#8E8E93' }} strokeWidth={2.2} />
          </button>
        </div>

        {/* Safari reminder */}
        <div style={{ margin: '14px 20px', padding: '10px 13px', borderRadius: 12, background: 'rgba(88,86,214,0.08)', border: '1px solid rgba(88,86,214,0.15)' }}>
          <p style={{ fontSize: 12.5, color: '#5856D6', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            {isKorean
              ? '🧭 Safari에서 열면 홈 화면에 추가할 수 있어요.'
              : '🧭 Open this page in Safari to add it to your Home Screen.'}
          </p>
        </div>

        {/* Steps */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {steps.map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--pa)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{s.n}</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--pt)', margin: 0, lineHeight: 1.55, paddingTop: 2 }}>{s.text}</p>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <div style={{ padding: '22px 20px 0' }}>
          <button type="button" onClick={handleClose}
            style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: 'var(--pa)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
            {isKorean ? '확인' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}

// ── Add to Home Screen card ───────────────────────────────────────────────────
function InstallCard() {
  const t = useT()
  const { prefs } = usePreferences()
  const isKorean = prefs.language === 'ko'

  const [installType, setInstallType] = useState<'android' | 'ios' | null>(null)
  const [showIOSSheet, setShowIOSSheet] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isAndroid = /android/i.test(ua)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) return

    if (isAndroid) setInstallType('android')
    else if (isIOS) setInstallType('ios')

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!installType) return null

  const isIOS = installType === 'ios'
  const label = isIOS ? t('hub_install_ios') : t('hub_install')
  const desc  = isIOS ? t('hub_install_ios_desc') : t('hub_install_desc')
  const AppleSvg = () => (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" style={{ color: 'var(--pt)' }}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
  const emoji = isIOS ? null : '📱'

  async function handleClick() {
    if (isIOS) { setShowIOSSheet(true); return }
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt()
      const { outcome } = await deferredPromptRef.current.userChoice
      deferredPromptRef.current = null
      if (outcome === 'accepted') setInstallType(null)
    } else {
      // beforeinstallprompt not fired yet — show generic help
      setShowIOSSheet(true)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          ...card,
          display: 'flex', alignItems: 'center', gap: 13,
          padding: '13px 16px', width: '100%', boxSizing: 'border-box',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.70' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--pc)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
          {isIOS ? <AppleSvg /> : emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {label}
          </p>
          <p style={{ fontSize: 11.5, color: '#C0C0C5', margin: 0, fontWeight: 400, lineHeight: 1.35 }}>
            {desc}
          </p>
        </div>
        <ChevronRight style={{ width: 11, height: 11, color: '#D1D1D6', flexShrink: 0 }} strokeWidth={2} />
      </button>

      {showIOSSheet && (
        <IOSInstallSheet onClose={() => setShowIOSSheet(false)} isKorean={isKorean} />
      )}
    </>
  )
}

// Extend global types for beforeinstallprompt
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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
          padding: `40px 20px calc(${TAB_BAR_HEIGHT}px + 32px)`,
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
          <InstallCard />

          <MenuCard
            icon={Info}
            label={t('hub_about')}
            desc={t('hub_about_desc')}
            href="/settings/about"
          />

          <p style={{
            fontSize: 11, color: '#D1D1D6', fontWeight: 400,
            margin: '0', textAlign: 'center', letterSpacing: '0.02em',
          }}>
            v1.0.0
          </p>

        </div>
      </div>

      {showAccount && <AccountPopup onClose={() => setShowAccount(false)} />}
    </>
  )
}
