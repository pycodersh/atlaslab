'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogIn, UserPlus, LogOut, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { signOut } from '@/lib/auth-actions'
import { useAuth } from '@/contexts/AuthContext'
import { useT } from '@/hooks/useT'

function MenuRow({
  icon: Icon, label, desc, danger, onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string; desc: string; danger?: boolean; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-start gap-4 py-5 text-left group cursor-pointer">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
        danger ? 'bg-[#FFF0F3] group-hover:bg-[#FFE0E7]' : 'bg-[var(--pc2)] group-hover:bg-[var(--pd)]'
      }`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-[#B04060]' : 'text-[var(--pa)]'}`} strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-[14px] leading-snug transition-colors ${
          danger ? 'text-[#B04060] group-hover:text-[#8B1A35]' : 'text-[var(--pt)] group-hover:text-[var(--pa)]'
        }`}>{label}</p>
        <p className="text-[11.5px] text-[var(--pm)] mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 mt-2.5 transition-colors ${
        danger ? 'text-[#DDB8C0]' : 'text-[var(--pm2)] group-hover:text-[var(--pa)]'
      }`} strokeWidth={1.4} />
    </button>
  )
}

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

export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const t = useT()
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

  const isLoggedIn = !!user

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />
      <div className="px-7 pb-24 max-w-sm mx-auto pt-16">
        <button
          type="button"
          onClick={() => router.push('/settings')}
          className="flex items-center gap-1 mb-4 text-[var(--pa)] text-[13px] font-semibold bg-none border-none p-0 cursor-pointer"
          style={{ background: 'none', border: 'none' }}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          Profile
        </button>
        <div className="mb-8">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[var(--pt)] tracking-tight">ACCOUNT</h1>
          <p className="text-[0.78rem] text-[var(--pm)] mt-2 tracking-wide">{t('account_page_desc')}</p>
        </div>

        <div className="rounded-2xl bg-[var(--pc)] px-5 py-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--pa)]/15 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[var(--pa)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--pt)]">{user?.email ?? 'Guest'}</p>
            <p className="text-[11px] text-[var(--pm)] mt-0.5">
              {isLoggedIn ? t('account_loggedin') : t('account_guest_hint')}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--pd)]">
          {!isLoggedIn && (
            <>
              <MenuRow icon={LogIn} label="Sign In" desc={t('account_signin_desc')} onClick={() => router.push('/settings/auth')} />
              <div className="h-px bg-[var(--pd)]" />
              <MenuRow icon={UserPlus} label="Sign Up" desc={t('account_signup_desc')} onClick={() => router.push('/settings/auth')} />
            </>
          )}
          {isLoggedIn && (
            <MenuRow icon={LogOut} label="Sign Out" desc={t('account_signout_desc')} onClick={handleSignOut} />
          )}
        </div>

        {isLoggedIn && (
          <div className="mt-10">
            <p className="text-[10px] tracking-[0.22em] text-[#B04060] font-bold mb-3">DANGER ZONE</p>
            <div className="border border-[var(--pacb)] rounded-2xl overflow-hidden bg-[var(--pal)]">
              <div className="px-2">
                <MenuRow icon={Trash2} label="Delete Account" desc={t('account_delete_desc')} danger onClick={() => setShowDeleteConfirm(true)} />
              </div>
            </div>
          </div>
        )}
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--pt)] text-[var(--pb)] text-[12px] px-5 py-2.5 rounded-full shadow-lg tracking-wide z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
