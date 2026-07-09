'use client'

import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle, User as UserIcon, LogOut, Compass, Smartphone, RotateCcw } from 'lucide-react'
import { requestOnboardingReplay } from '@/lib/onboarding'
import { PDialog } from '@/components/ui/PDialog'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/auth-actions'
import { useSubscription } from '@/hooks/useSubscription'
import { AuthButtons } from '@/components/auth/AuthButtons'

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

// ── Menu card ────────────────────────────────────────────────────────────────
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

// ── User profile card (logged-in) ─────────────────────────────────────────────
function UserProfileCard({ user, isPro, onLogout }: { user: User; isPro: boolean; onLogout: () => void }) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = ((user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || user.email?.split('@')[0] || 'User') as string)
  const email = user.email
  const rawProvider = (user.app_metadata?.provider || 'email') as string
  const providerLabel = rawProvider === 'google' ? 'Google' : rawProvider === 'kakao' ? 'Kakao' : 'Email'
  const initial = name[0]?.toUpperCase() ?? '?'

  const badge = (text: string, accent?: boolean) => (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
      color: accent ? '#4A7A6A' : '#8E8E93',
      background: accent ? 'rgba(100,180,155,0.12)' : 'var(--pc)',
      border: `1px solid ${accent ? 'rgba(100,180,155,0.22)' : 'var(--pglass-border)'}`,
      borderRadius: 6, padding: '2px 8px',
    }}>
      {text}
    </span>
  )

  return (
    <div style={{ ...glassCard, padding: '20px 20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
          background: 'var(--pc)', border: '1px solid var(--pglass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--pa)', lineHeight: 1 }}>{initial}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </p>
          {email && (
            <p style={{ fontSize: 11.5, color: 'var(--pm)', margin: '0 0 7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </p>
          )}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {badge(providerLabel)}
            {badge(isPro ? 'Premium' : 'Free Plan', isPro)}
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        type="button"
        onClick={onLogout}
        style={{
          marginTop: 14, width: '100%',
          padding: '9px 0',
          borderRadius: 10,
          border: '1px solid var(--pglass-border)',
          background: 'transparent',
          color: 'var(--pm)',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--pc)'
          e.currentTarget.style.color = 'var(--pt)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--pm)'
        }}
      >
        <LogOut style={{ width: 13, height: 13 }} strokeWidth={2} />
        Logout
      </button>
    </div>
  )
}

// ── Guest card (not logged in) ────────────────────────────────────────────────
function GuestProfileCard() {
  return (
    <div style={{ ...glassCard, padding: '24px 24px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--pc)', border: '1px solid var(--pglass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <UserIcon style={{ width: 22, height: 22, color: 'var(--pm)' }} strokeWidth={1.5} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 4px' }}>
          로그인이 필요합니다
        </p>
        <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
          로그인하면 학습 데이터가 동기화됩니다.
        </p>
      </div>
      <AuthButtons showTitle={false} />
    </div>
  )
}

// ── Android Confirmation Modal ────────────────────────────────────────────────
function AndroidConfirmModal({
  open, onInstall, onCancel,
}: { open: boolean; onInstall: () => void; onCancel: () => void }) {
  const t = useT()
  return (
    <PDialog
      open={open}
      onClose={onCancel}
      title={t('install_android_modal_title')}
      description={t('install_android_modal_desc')}
      actions={[
        { label: t('install_not_now'), onClick: onCancel, variant: 'cancel' },
        { label: t('install_install'), onClick: onInstall, variant: 'accent' },
      ]}
    />
  )
}

// ── Install Guide Sheet ───────────────────────────────────────────────────────
function IOSInstallSheet({ open, onClose, installType = 'ios' }: { open: boolean; onClose: () => void; installType?: 'ios' | 'android' }) {
  const t = useT()
  const isAndroid = installType === 'android'
  const title = isAndroid ? t('install_android_title') : t('install_ios_title')
  const hint  = isAndroid ? t('install_android_hint')  : t('install_ios_hint')
  const steps = isAndroid
    ? [t('install_android_step1'), t('install_android_step2'), t('install_android_step3')]
    : [t('install_ios_step1'), t('install_ios_step2'), t('install_ios_step3')]

  return (
    <PDialog
      open={open}
      onClose={onClose}
      title={title}
      hint={
        <p style={{ fontSize: 12.5, color: '#5856D6', margin: 0, lineHeight: 1.5, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <Compass style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} strokeWidth={1.8} />
          <span>{hint}</span>
        </p>
      }
      actions={[{ label: t('install_confirm'), onClick: onClose, variant: 'confirm' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, paddingTop: 16, paddingBottom: 4 }}>
        {steps.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13.5, fontWeight: 400, color: 'var(--pt)', flexShrink: 0, lineHeight: 1.55 }}>{i + 1}.</span>
            <p style={{ fontSize: 13.5, color: 'var(--pt)', margin: 0, lineHeight: 1.55 }}>{text}</p>
          </div>
        ))}
      </div>
    </PDialog>
  )
}

// ── Add to Home Screen card ───────────────────────────────────────────────────
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function InstallCard() {
  const t = useT()
  const [installType, setInstallType] = useState<'android' | 'ios' | null>(null)
  const [showAndroidConfirm, setShowAndroidConfirm] = useState(false)
  const [showGuideSheet, setShowGuideSheet] = useState(false)
  const [guideType, setGuideType] = useState<'ios' | 'android'>('ios')
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') { setInstallType('android'); return }

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isAndroid = /android/i.test(ua)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true

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

  function handleClick() {
    if (isIOS) { setGuideType('ios'); setShowGuideSheet(true); return }
    setShowAndroidConfirm(true)
  }

  async function handleAndroidInstall() {
    setShowAndroidConfirm(false)
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt()
      const { outcome } = await deferredPromptRef.current.userChoice
      deferredPromptRef.current = null
      if (outcome === 'accepted') setInstallType(null)
    } else {
      setGuideType('android')
      setShowGuideSheet(true)
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
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--pc)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isIOS ? <AppleSvg /> : <Smartphone style={{ width: 14, height: 14, color: 'var(--pt)' }} strokeWidth={1.6} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</p>
          <p style={{ fontSize: 11.5, color: '#C0C0C5', margin: 0, fontWeight: 400, lineHeight: 1.35 }}>{desc}</p>
        </div>
        <ChevronRight style={{ width: 11, height: 11, color: '#D1D1D6', flexShrink: 0 }} strokeWidth={2} />
      </button>

      <AndroidConfirmModal
        open={showAndroidConfirm}
        onInstall={handleAndroidInstall}
        onCancel={() => setShowAndroidConfirm(false)}
      />
      <IOSInstallSheet
        open={showGuideSheet}
        onClose={() => setShowGuideSheet(false)}
        installType={guideType}
      />
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const t = useT()
  const { user, loading } = useAuth()
  const { isPro } = useSubscription()

  function handleReplayOnboarding() {
    requestOnboardingReplay()
    window.location.href = '/'
  }

  async function handleLogout() {
    await signOut()
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: `14px 20px calc(${TAB_BAR_HEIGHT}px + 32px)`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>

        {/* Profile card */}
        {!loading && (
          user
            ? <UserProfileCard user={user} isPro={isPro} onLogout={handleLogout} />
            : <GuestProfileCard />
        )}

        {/* Account detail — only when logged in */}
        {user && (
          <MenuCard
            icon={UserCircle}
            label={t('hub_account')}
            desc={t('hub_account_desc')}
            href="/settings/account"
          />
        )}

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
          icon={RotateCcw}
          label="온보딩 다시 보기"
          desc="앱 소개 화면을 처음부터 다시 볼 수 있습니다."
          onClick={handleReplayOnboarding}
        />

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
  )
}
