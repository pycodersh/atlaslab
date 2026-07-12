'use client'

import { useRouter } from 'next/navigation'
import { Trash2, ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useAuth } from '@/contexts/AuthContext'
import { useT } from '@/hooks/useT'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useTrainerSafe } from '@/contexts/TrainerContext'


export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const t = useT()
  const isDesktop = useIsDesktop()
  const trainer = useTrainerSafe()
  function handleDeleteAccount() {
    trainer?.showMessage(t('account_delete_preparing'), 3000)
  }

  function confirmDeleteAccount() {
    trainer?.ask('Delete account?', [
      { label: 'Cancel', onClick: () => {} },
      { label: 'Delete', primary: true, onClick: handleDeleteAccount },
    ])
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-transparent">
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
  const initial = name[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-dvh bg-transparent">
      <TopNav />
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '16px 24px 96px', boxSizing: 'border-box' }}>

        {isDesktop && (
          <button
            type="button"
            onClick={() => router.push('/patto/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
            Settings
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
          padding: '20px', marginBottom: 24,
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
            {email && <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>}
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.22em', color: '#B04060', fontWeight: 700, margin: '0 0 10px' }}>DANGER ZONE</p>
          <div style={{ border: '1px solid rgba(176,64,96,0.25)', borderRadius: 16, overflow: 'hidden', background: 'rgba(176,64,96,0.04)' }}>
            <button
              type="button"
              onClick={confirmDeleteAccount}
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

    </div>
  )
}
