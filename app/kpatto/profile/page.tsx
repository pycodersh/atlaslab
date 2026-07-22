'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { ChevronRight, Info, User as UserIcon, LogOut, FileText, Shield, ReceiptText, Mail, Bell, CreditCard, Globe } from 'lucide-react'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import { signOut, signInWithGoogle, signInWithEmail } from '@/lib/auth-actions'
import type { KPattoLanguage } from '@/data/kpatto/types'

const T1     = '#111111'
const T2     = '#666666'
const ACCENT = '#D4873A'
const BORDER = '#E8E4DF'
const ROW_DIV = '#F0EDE8'

// ── Section header (amber left-line style) ─────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 16px 10px' }}>
      <div style={{ width: 3, height: 18, borderRadius: 99, background: ACCENT, flexShrink: 0 }} />
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: T1, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: '0 16px',
      background: '#FFFFFF',
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

function RowDivider() {
  return <div style={{ height: 1, background: ROW_DIV, margin: '0 16px' }} />
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

// ── User profile card ─────────────────────────────────────────────────────────
function UserProfileCard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User') as string
  const email = user.email
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initial = name[0]?.toUpperCase() ?? '?'

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
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
      <RowDivider />
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
    </Card>
  )
}

// ── Guest card ────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} style={{ flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

const BTN: React.CSSProperties = {
  width: '100%', height: 48,
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '0 16px', borderRadius: 10,
  fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  boxSizing: 'border-box',
}

function GuestCard() {
  const [emailMode, setEmailMode] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() { await signInWithGoogle() }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    await signInWithEmail(email, password, isSignUp)
    setLoading(false)
  }

  return (
    <Card>
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#F5F5F5', border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <UserIcon size={20} color={T2} strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3 }}>Sign in to K-PATTO</div>
          <div style={{ fontSize: 12, color: T2, textAlign: 'center', lineHeight: 1.5 }}>
            Sync your progress across devices
          </div>
        </div>

        {emailMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" onClick={() => setEmailMode(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: T2, fontFamily: 'inherit', textAlign: 'left', padding: '0 0 4px' }}>
              ← Back
            </button>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ ...BTN, border: `1px solid ${BORDER}`, background: '#FAFAFA', color: T1, outline: 'none' }} />
              <input type="password" required minLength={6} placeholder="Password (6+ chars)" value={password} onChange={e => setPassword(e.target.value)}
                style={{ ...BTN, border: `1px solid ${BORDER}`, background: '#FAFAFA', color: T1, outline: 'none' }} />
              <button type="submit" disabled={loading}
                style={{ ...BTN, background: ACCENT, color: '#FFFFFF', border: 'none', justifyContent: 'center' }}>
                {loading ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
              <button type="button" onClick={() => setIsSignUp(v => !v)}
                style={{ background: 'none', border: 'none', color: T2, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isSignUp ? 'Already have an account? Sign In' : 'No account? Sign Up'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" onClick={handleGoogle}
              style={{ ...BTN, background: '#FFFFFF', color: '#1F1F1F', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <GoogleIcon />
              <span style={{ flex: 1, textAlign: 'center', marginRight: 18 }}>Continue with Google</span>
            </button>
            <button type="button" onClick={() => setEmailMode(true)}
              style={{ ...BTN, background: '#FFFFFF', color: '#1F1F1F', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <EmailIcon />
              <span style={{ flex: 1, textAlign: 'center', marginRight: 18 }}>Continue with Email</span>
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: T2, lineHeight: 1.7, textAlign: 'center', margin: '16px 0 0' }}>
          By signing in, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </Card>
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
            <div style={{ fontSize: 12, fontWeight: 700, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
              Select Language
            </div>
            {langs.map((l, i) => (
              <div key={l}>
                {i > 0 && <div style={{ height: 1, background: ROW_DIV, margin: '0 16px' }} />}
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

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9F9', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      {/* ACCOUNT */}
      <SectionHeader label="Account" />
      {!loading && (user ? <UserProfileCard user={user} onLogout={signOut} /> : <GuestCard />)}

      {/* APP SETTINGS */}
      <SectionHeader label="App Settings" />
      <Card>
        <RowItem icon={CreditCard} label="Subscription" value="Free" onClick={() => {}} />
        <RowDivider />
        <LanguageRow lang={(prefs.language ?? 'en') as KPattoLanguage} onSelect={l => update({ language: l })} />
        <RowDivider />
        <RowItem icon={Bell} label="Notifications" onClick={() => {}} />
      </Card>

      {/* ABOUT K-PATTO */}
      <SectionHeader label="About K-PATTO" />
      <Card>
        <RowItem icon={FileText} label="Terms of Service" onClick={() => {}} />
        <RowDivider />
        <RowItem icon={Shield} label="Privacy Policy" onClick={() => {}} />
        <RowDivider />
        <RowItem icon={ReceiptText} label="Refund Policy" onClick={() => {}} />
        <RowDivider />
        <RowItem icon={Mail} label="Contact Us" onClick={() => {}} />
        <RowDivider />
        <RowItem icon={Info} label="Version" value="1.0.0" />
      </Card>

      <div style={{ height: 24 }} />
    </div>
  )
}
