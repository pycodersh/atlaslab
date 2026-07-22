'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { ChevronRight, Info, User as UserIcon, LogOut, FileText, Shield, ReceiptText, Mail, Bell, CreditCard, Globe } from 'lucide-react'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import { signOut } from '@/lib/auth-actions'
import { AuthButtons } from '@/components/auth/AuthButtons'
import type { KPattoLanguage } from '@/data/kpatto/types'

const T1     = '#111111'
const T2     = '#666666'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: T2, textTransform: 'uppercase', padding: '20px 16px 8px' }}>
      {label}
    </div>
  )
}

// ── Row item ──────────────────────────────────────────────────────────────────
function RowItem({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: React.ElementType
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '14px 16px',
        background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'inherit', textAlign: 'left',
      }}
    >
      <Icon size={18} color={danger ? '#EF4444' : ACCENT} strokeWidth={1.8} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: danger ? '#EF4444' : T1 }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: T2, marginRight: 4 }}>{value}</span>}
      {onClick && <ChevronRight size={15} color="#CCCCCC" strokeWidth={2} style={{ flexShrink: 0 }} />}
    </button>
  )
}

function Divider() {
  return <div style={{ height: 1, background: DIV, margin: '0 16px' }} />
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
      {children}
    </div>
  )
}

// ── User profile card ─────────────────────────────────────────────────────────
function UserProfileCard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User') as string
  const email = user.email
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initial = name[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ background: '#FFFFFF', borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 16px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: '#F0FDF4', border: `1.5px solid ${ACCENT}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{initial}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T1, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          {email && (
            <div style={{ fontSize: 12, color: T2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
          )}
        </div>
      </div>
      <Divider />
      <button
        type="button"
        onClick={onLogout}
        style={{
          width: '100%', padding: '13px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: '#EF4444',
        }}
      >
        <LogOut size={14} strokeWidth={2} />
        Logout
      </button>
    </div>
  )
}

// ── Guest card ────────────────────────────────────────────────────────────────
function GuestCard() {
  return (
    <div style={{ background: '#FFFFFF', borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}`, padding: '24px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#F5F5F5', border: `1px solid ${DIV}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}>
          <UserIcon size={22} color={T2} strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 4 }}>Sign in to K-PATTO</div>
        <div style={{ fontSize: 12, color: T2, textAlign: 'center', lineHeight: 1.5 }}>
          Sync your progress across devices
        </div>
      </div>
      <AuthButtons showTitle={false} />
    </div>
  )
}

// ── Language selector ─────────────────────────────────────────────────────────
const LANG_LABELS: Record<string, string> = { en: 'English', ja: '日本語', es: 'Español' }

function LanguageRow({ lang, onSelect }: { lang: KPattoLanguage; onSelect: (l: KPattoLanguage) => void }) {
  const [open, setOpen] = useState(false)
  const langs: KPattoLanguage[] = ['en', 'ja', 'es']

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <Globe size={18} color={ACCENT} strokeWidth={1.8} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T1 }}>Language</span>
        <span style={{ fontSize: 13, color: T2, marginRight: 4 }}>{LANG_LABELS[lang]}</span>
        <ChevronRight size={15} color="#CCCCCC" strokeWidth={2} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 480, background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '24px 16px 40px', boxSizing: 'border-box' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
              Select Language
            </div>
            {langs.map((l, i) => (
              <div key={l}>
                {i > 0 && <Divider />}
                <button
                  type="button"
                  onClick={() => { onSelect(l); setOpen(false) }}
                  style={{
                    width: '100%', padding: '16px', background: 'none', border: 'none',
                    fontFamily: 'inherit', fontSize: 16, fontWeight: l === lang ? 700 : 400,
                    color: l === lang ? ACCENT : T1, cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  {LANG_LABELS[l]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KPattoProfilePage() {
  const { user, loading } = useAuth()
  const { prefs, update } = usePreferences()

  async function handleLogout() {
    await signOut()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9F9', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      {/* ACCOUNT */}
      <SectionHeader label="Account" />
      {!loading && (user ? <UserProfileCard user={user} onLogout={handleLogout} /> : <GuestCard />)}

      {/* APP SETTINGS */}
      <SectionHeader label="App Settings" />
      <Card>
        <RowItem icon={CreditCard} label="Subscription" value="Free" onClick={() => {}} />
        <Divider />
        <LanguageRow lang={(prefs.language ?? 'en') as KPattoLanguage} onSelect={l => update({ language: l })} />
        <Divider />
        <RowItem icon={Bell} label="Notifications" onClick={() => {}} />
      </Card>

      {/* ABOUT K-PATTO */}
      <SectionHeader label="About K-PATTO" />
      <Card>
        <RowItem icon={FileText} label="Terms of Service" onClick={() => {}} />
        <Divider />
        <RowItem icon={Shield} label="Privacy Policy" onClick={() => {}} />
        <Divider />
        <RowItem icon={ReceiptText} label="Refund Policy" onClick={() => {}} />
        <Divider />
        <RowItem icon={Mail} label="Contact Us" onClick={() => {}} />
        <Divider />
        <RowItem icon={Info} label="Version" value="1.0.0" />
      </Card>

      <div style={{ height: 24 }} />
    </div>
  )
}
