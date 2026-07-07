'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'
import { createClient } from '@/lib/supabase/client'

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

function SecTitle({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em',
      color: '#8E8E93', textTransform: 'uppercase',
      margin: '24px 0 8px 2px',
    }}>
      {label}
    </p>
  )
}

export default function AuthPage() {
  const [toast, setToast] = useState('')
  const [emailMode, setEmailMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useT()
  const { prefs } = usePreferences()
  const isKorean = prefs.language === 'ko'

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  async function handleGoogle() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) showToast(error.message)
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const supabase = createClient()
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      showToast(error.message)
    } else if (isSignUp) {
      showToast(isKorean ? '가입 완료! 로그인해주세요.' : 'Signed up! Please sign in.')
      setIsSignUp(false)
    } else {
      window.location.href = '/'
    }
  }

  async function handleKakao() {
    showToast(isKorean ? '카카오 로그인 준비 중' : 'Kakao coming soon')
  }

  async function handleNaver() {
    showToast(isKorean ? '네이버 로그인 준비 중' : 'Naver coming soon')
  }

  const BASE_PROVIDERS = [
    {
      id: 'google',
      label: t('auth_continue_google'),
      onClick: handleGoogle,
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
      id: 'email',
      label: t('auth_continue_email'),
      onClick: () => setEmailMode(true),
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="3" />
          <path d="M2 7l10 7 10-7" />
        </svg>
      ),
      bg: null, text: null, border: null,
    },
  ]

  const KO_PROVIDERS = [
    {
      id: 'kakao',
      label: t('auth_continue_kakao'),
      onClick: handleKakao,
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <rect width="24" height="24" rx="6" fill="#FEE500" />
          <path d="M12 5.5C8.13 5.5 5 7.97 5 11.03c0 1.93 1.2 3.63 3.01 4.67l-.77 2.87c-.07.26.22.47.45.33L11.1 17c.29.03.59.05.9.05 3.87 0 7-2.47 7-5.52S15.87 5.5 12 5.5z" fill="#3C1E1E" />
        </svg>
      ),
      bg: '#FEE500', text: '#3C1E1E', border: 'rgba(254,229,0,0.80)',
    },
    {
      id: 'naver',
      label: t('auth_continue_naver'),
      onClick: handleNaver,
      logo: (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <rect width="24" height="24" rx="6" fill="#03C75A" />
          <path d="M13.74 12.27L10.14 7H7v10h3.26V11.73L14.86 17H18V7h-3.26v5.27z" fill="white" />
        </svg>
      ),
      bg: '#03C75A', text: '#fff', border: 'rgba(3,199,90,0.80)',
    },
  ]

  const PROVIDERS = isKorean ? [...BASE_PROVIDERS, ...KO_PROVIDERS] : BASE_PROVIDERS

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', marginBottom: 20 }}>
          <ChevronLeft style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--pm)' }}>Profile</span>
        </Link>

        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          Account
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '0 0 4px' }}>
          {t('auth_desc')}
        </p>

        <SecTitle label="Sign In" />

        {emailMode ? (
          <div style={{ ...glassCard, padding: '16px' }}>
            <button
              type="button"
              onClick={() => setEmailMode(false)}
              style={{
                background: 'none', border: 'none', color: 'var(--pm)',
                fontSize: 12, cursor: 'pointer', padding: '0 0 12px', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ← {isKorean ? '뒤로' : 'Back'}
            </button>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                placeholder={isKorean ? '이메일' : 'Email'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  background: 'var(--pglass)', border: '1.5px solid var(--pglass-border)',
                  borderRadius: 12, padding: '13px 14px', fontSize: 13.5,
                  color: 'var(--pt)', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                placeholder={isKorean ? '비밀번호 (6자 이상)' : 'Password (6+ chars)'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  background: 'var(--pglass)', border: '1.5px solid var(--pglass-border)',
                  borderRadius: 12, padding: '13px 14px', fontSize: 13.5,
                  color: 'var(--pt)', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'var(--pm)', color: 'var(--pb)',
                  border: 'none', borderRadius: 12, padding: '13px 14px',
                  fontSize: 13.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? '...' : isSignUp ? (isKorean ? '회원가입' : 'Sign Up') : (isKorean ? '로그인' : 'Sign In')}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(v => !v)}
                style={{
                  background: 'none', border: 'none', color: 'var(--pm)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0',
                }}
              >
                {isSignUp
                  ? (isKorean ? '이미 계정이 있어요 → 로그인' : 'Already have an account? Sign In')
                  : (isKorean ? '계정이 없어요 → 회원가입' : "Don't have an account? Sign Up")}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ ...glassCard, padding: '10px 16px' }}>
            {PROVIDERS.map((p, i) => {
              const isLast = i === PROVIDERS.length - 1
              const btnStyle: React.CSSProperties = p.bg
                ? { background: p.bg, color: p.text, border: `1.5px solid ${p.border}` }
                : {
                    background: 'var(--pglass)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    color: 'var(--pt2)',
                    border: '1.5px solid var(--pglass-border)',
                  }
              return (
                <div key={p.id}>
                  <button
                    type="button"
                    onClick={p.onClick}
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
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{p.logo}</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>{p.label}</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}

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

        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
          v1.0.0
        </p>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--pt)', color: 'var(--pb)',
          fontSize: 12, padding: '10px 22px', borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50, whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
