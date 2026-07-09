'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Trash2, ChevronLeft, Shield, Calendar, Hash } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { signOut } from '@/lib/auth-actions'
import { useAuth } from '@/contexts/AuthContext'
import { useT } from '@/hooks/useT'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useSubscription } from '@/hooks/useSubscription'

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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--pglass-border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--pc)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 14, height: 14, color: '#6E6E73' }} strokeWidth={1.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: '#8E8E93', margin: '0 0 1px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: 13.5, color: 'var(--pt)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
      </div>
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const t = useT()
  const isDesktop = useIsDesktop()
  const { isPro } = useSubscription()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  async function handleSignOut() {
    await signOut()
    router.push('/home')
  }

  async function handleDeleteAccount() {
    setShowDeleteConfirm(false)
    showToast(t('account_delete_preparing'))
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-[var(--pb)]">
        <TopNav />
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--pm)', fontSize: 14 }}>
          로그인이 필요합니다.
        </div>
      </div>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || user.email?.split('@')[0] || 'User') as string
  const email = user.email
  const rawProvider = (user.app_metadata?.provider || 'email') as string
  const providerLabel = rawProvider === 'google' ? 'Google' : rawProvider === 'kakao' ? 'Kakao' : 'Email'
  const initial = name[0]?.toUpperCase() ?? '?'
  const userId = user.id ? `···${user.id.slice(-8)}` : '—'
  const joinedAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '16px 24px 96px', boxSizing: 'border-box' }}>

        {isDesktop && (
          <button
            type="button"
            onClick={() => router.push('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
            Profile
          </button>
        )}

        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--pt)', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
          Account
        </h1>

        {/* Avatar + name */}
        <div style={{
          background: 'var(--pglass)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20, border: '1px solid var(--pglass-border)',
          padding: '20px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'var(--pc)', border: '2px solid var(--pglass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--pa)', lineHeight: 1 }}>{initial}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            {email && <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: '0 0 7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>}
            <div style={{ display: 'flex', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', background: 'var(--pc)', border: '1px solid var(--pglass-border)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.04em' }}>
                {providerLabel}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: isPro ? '#4A7A6A' : '#8E8E93', background: isPro ? 'rgba(100,180,155,0.12)' : 'var(--pc)', border: `1px solid ${isPro ? 'rgba(100,180,155,0.22)' : 'var(--pglass-border)'}`, borderRadius: 6, padding: '2px 8px', letterSpacing: '0.04em' }}>
                {isPro ? 'Premium' : 'Free Plan'}
              </span>
            </div>
          </div>
        </div>

        {/* Account info rows */}
        <div style={{
          background: 'var(--pglass)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20, border: '1px solid var(--pglass-border)',
          padding: '0 16px', marginBottom: 12,
        }}>
          <InfoRow icon={Shield} label="Provider" value={providerLabel} />
          <InfoRow icon={Hash} label="User ID" value={userId} />
          <div style={{ borderBottom: 'none' }}>
            <InfoRow icon={Calendar} label="가입일" value={joinedAt} />
          </div>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '14px 0',
            borderRadius: 14, border: '1px solid var(--pglass-border)',
            background: 'var(--pglass)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--pm)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 24, transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--pc)'
            e.currentTarget.style.color = 'var(--pt)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--pglass)'
            e.currentTarget.style.color = 'var(--pm)'
          }}
        >
          <LogOut style={{ width: 15, height: 15 }} strokeWidth={2} />
          Logout
        </button>

        {/* Danger zone */}
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.22em', color: '#B04060', fontWeight: 700, margin: '0 0 10px' }}>DANGER ZONE</p>
          <div style={{ border: '1px solid rgba(176,64,96,0.25)', borderRadius: 16, overflow: 'hidden', background: 'rgba(176,64,96,0.04)' }}>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF0F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 style={{ width: 14, height: 14, color: '#B04060' }} strokeWidth={1.6} />
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#B04060', margin: '0 0 2px' }}>Delete Account</p>
                <p style={{ fontSize: 12, color: '#C08898', margin: 0 }}>{t('account_delete_desc')}</p>
              </div>
            </button>
          </div>
        </div>
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
