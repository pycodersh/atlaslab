'use client'

import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, User as UserIcon, LogOut, Compass, Smartphone, Trash2 } from 'lucide-react'
import { requestCoverReplay } from '@/components/WelcomeCover'
import { PDialog } from '@/components/ui/PDialog'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/auth-actions'
import { AuthButtons } from '@/components/auth/AuthButtons'
import { getLearnedStoryCount } from '@/lib/srs/storage'
import { getSavedWordCount } from '@/lib/words/storage'
import { getEssays } from '@/lib/essays/storage'
import { useTrainerSafe } from '@/contexts/TrainerContext'

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const inner = (
    <>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(107,143,255,0.08)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(107,143,255,0.14)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 15, height: 15, color: isDark ? 'rgba(255,255,255,0.70)' : '#6B8FFF' }} strokeWidth={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 600,
          color: 'var(--pt)', margin: '0 0 2px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 12, color: 'var(--pm)',
          margin: 0, fontWeight: 400, lineHeight: 1.4,
        }}>
          {desc}
        </p>
      </div>

      <ChevronRight style={{ width: 11, height: 11, color: '#D1D1D6', flexShrink: 0 }} strokeWidth={2} />
    </>
  )

  const sharedStyle: React.CSSProperties = {
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
    background: 'none',
    border: 'none',
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

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, cancelLabel, confirmLabel, onConfirm, onCancel }: {
  message: string; cancelLabel: string; confirmLabel: string
  onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{ background: 'var(--pb)', borderRadius: 20, padding: '28px 24px 20px', maxWidth: 340, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <p style={{ fontSize: 14, color: 'var(--pt)', margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, height: 44, borderRadius: 12, border: '1px solid var(--pd)', background: 'transparent', color: 'var(--pt)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: '#B04060', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── User profile card (logged-in) ─────────────────────────────────────────────
function UserProfileCard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = ((user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || user.email?.split('@')[0] || 'User') as string)
  const email = user.email
  const initial = name[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
      {/* Avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 20px 20px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'var(--pc)', border: '1px solid var(--pglass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 21, fontWeight: 700, color: 'var(--pa)', lineHeight: 1 }}>{initial}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </p>
          {email && (
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </p>
          )}
        </div>
      </div>

      {/* Logout row */}
      <button
        type="button"
        onClick={onLogout}
        style={{
          width: '100%', padding: '13px 20px',
          border: 'none', borderTop: '1px solid var(--pglass-border)',
          background: 'transparent',
          color: 'var(--pm)', fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--pc)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <LogOut style={{ width: 13, height: 13 }} strokeWidth={2} />
        Logout
      </button>
    </div>
  )
}

// ── Learning Stats Card ───────────────────────────────────────────────────────
function LearningStatsCard() {
  const [stats, setStats] = useState({ stories: 0, words: 0, essays: 0 })

  useEffect(() => {
    setStats({
      stories: getLearnedStoryCount(),
      words: getSavedWordCount(),
      essays: getEssays().length,
    })
  }, [])

  const items = [
    { label: 'Stories', value: stats.stories },
    { label: 'Words', value: stats.words },
    { label: 'Essays', value: stats.essays },
  ]

  return (
    <div style={{ ...glassCard, padding: '16px 20px 18px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 14px' }}>
        Learning Stats
      </p>
      <div style={{ display: 'flex' }}>
        {items.map((item, i) => (
          <div key={item.label} style={{
            flex: 1, textAlign: 'center',
            borderRight: i < 2 ? '1px solid var(--pglass-border)' : 'none',
          }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--pa)', margin: '0 0 3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {item.value}
            </p>
            <p style={{ fontSize: 10.5, color: 'var(--pm)', margin: 0, fontWeight: 500 }}>{item.label}</p>
          </div>
        ))}
      </div>
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
          display: 'flex', alignItems: 'center', gap: 13,
          padding: '13px 16px', width: '100%', boxSizing: 'border-box',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          transition: 'opacity 0.15s',
          background: 'none', border: 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.70' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(107,143,255,0.08)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(107,143,255,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isIOS ? <AppleSvg /> : <Smartphone style={{ width: 15, height: 15, color: isDark ? 'rgba(255,255,255,0.70)' : '#6B8FFF' }} strokeWidth={1.6} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{label}</p>
          <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, fontWeight: 400, lineHeight: 1.4 }}>{desc}</p>
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
  const trainer = useTrainerSafe()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  async function handleLogout() {
    trainer?.showMessage('See you.', 2000)
    await new Promise(r => setTimeout(r, 400))
    await signOut()
    router.refresh()
  }

  async function handleDeleteAccount() {
    setShowDeleteConfirm(false)
    showToast(t('account_delete_preparing'))
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
            ? <UserProfileCard user={user} onLogout={handleLogout} />
            : <GuestProfileCard />
        )}

        {/* Learning Stats — only when logged in */}
        {user && <LearningStatsCard />}

        {/* Menu list — single glass-card */}
        <div style={{ ...glassCard, overflow: 'hidden' }}>
          {[
            <MenuCard key="sub"   icon={Sparkles}          label={t('hub_subscription')} desc={t('hub_subscription_desc')} href="/patto/settings/subscription" />,
            <MenuCard key="pref"  icon={SlidersHorizontal} label={t('hub_preferences')}  desc={t('hub_preferences_desc')}  href="/patto/settings/preferences" />,
            <InstallCard key="install" />,
            <MenuCard key="about" icon={Info}              label={t('hub_about')}         desc={t('hub_about_desc')}        href="/patto/settings/about" />,
          ].map((item, i, arr) => (
            <div key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--pglass-border)' : 'none' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Delete Account — subtle */}
        {user && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              background: 'none', border: 'none', padding: '4px 0 0',
              color: '#C08898', fontSize: 11.5, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'center', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
          >
            <Trash2 style={{ width: 11, height: 11 }} strokeWidth={1.6} />
            Delete Account
          </button>
        )}

        <p style={{
          fontSize: 11, color: '#D1D1D6', fontWeight: 400,
          margin: '0', textAlign: 'center', letterSpacing: '0.02em',
        }}>
          v1.0.0
        </p>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          message={t('account_delete_message')}
          cancelLabel={t('delete_cancel')}
          confirmLabel={t('delete_confirm')}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--pt)', color: 'var(--pb)', fontSize: 12, padding: '10px 20px', borderRadius: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 50, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
