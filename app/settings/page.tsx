'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle, X, PlusSquare, Compass, Smartphone, RotateCcw } from 'lucide-react'
import { requestOnboardingReplay } from '@/lib/onboarding'
import { PDialog } from '@/components/ui/PDialog'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useTheme } from '@/components/ThemeProvider'
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

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 220)
  }

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

        <div style={{ padding: '8px 32px 32px' }}>
          <AuthButtons onSuccess={handleClose} showTitle={true} />
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}

// ── Android Confirmation Modal ────────────────────────────────────────────────
function AndroidConfirmModal({
  open,
  onInstall,
  onCancel,
}: {
  open: boolean
  onInstall: () => void
  onCancel: () => void
}) {
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

// ── Install Guide Sheet (iOS & Android fallback) ─────────────────────────────
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
      actions={[
        { label: t('install_confirm'), onClick: onClose, variant: 'confirm' },
      ]}
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
function InstallCard() {
  const t = useT()

  const [installType, setInstallType] = useState<'android' | 'ios' | null>(null)
  const [showAndroidConfirm, setShowAndroidConfirm] = useState(false)
  const [showGuideSheet, setShowGuideSheet] = useState(false)
  const [guideType, setGuideType] = useState<'ios' | 'android'>('ios')
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // DEV: force android install card for preview
    if (process.env.NODE_ENV === 'development') { setInstallType('android'); return }

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

  function handleClick() {
    if (isIOS) {
      setGuideType('ios')
      setShowGuideSheet(true)
      return
    }
    // Android: show confirmation modal first
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
      // Fallback: show Chrome manual guide
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
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {label}
          </p>
          <p style={{ fontSize: 11.5, color: '#C0C0C5', margin: 0, fontWeight: 400, lineHeight: 1.35 }}>
            {desc}
          </p>
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

// Extend global types for beforeinstallprompt
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function SettingsPage() {
  const t = useT()
  const [showAccount, setShowAccount] = useState(false)

  function handleReplayOnboarding() {
    requestOnboardingReplay()
    window.location.href = '/'
  }

  return (
    <>
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

      {showAccount && <AccountPopup onClose={() => setShowAccount(false)} />}
    </>
  )
}
