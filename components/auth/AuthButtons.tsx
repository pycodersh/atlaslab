'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signInWithGoogle, signInWithKakao, signInWithEmail } from '@/lib/auth-actions'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none">
    <path d="M12 5.5C8.13 5.5 5 7.97 5 11.03c0 1.93 1.2 3.63 3.01 4.67l-.77 2.87c-.07.26.22.47.45.33L11.1 17c.29.03.59.05.9.05 3.87 0 7-2.47 7-5.52S15.87 5.5 12 5.5z" fill="#3C1E1E" />
  </svg>
)

const BASE_BTN: React.CSSProperties = {
  width: '100%',
  height: 52,
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '0 18px',
  borderRadius: 16,
  fontSize: 14, fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'opacity 0.15s',
}

const googleBtnStyle: React.CSSProperties = {
  ...BASE_BTN,
  background: '#FFFFFF',
  color: '#1F1F1F',
  border: '1px solid rgba(0,0,0,0.12)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
}

const emailBtnStyle: React.CSSProperties = {
  ...BASE_BTN,
  background: '#FFFFFF',
  color: '#1F1F1F',
  border: '1px solid rgba(0,0,0,0.12)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
}

const kakaoBtnStyle: React.CSSProperties = {
  ...BASE_BTN,
  background: '#FEE500',
  color: '#1A1A1A',
  border: '1px solid rgba(0,0,0,0.06)',
}

const btnStyle: React.CSSProperties = {
  ...BASE_BTN,
  background: 'var(--pglass)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  color: 'var(--pt)',
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--pt)', color: 'var(--pb)',
      fontSize: 12, padding: '10px 22px', borderRadius: 999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 10000, whiteSpace: 'nowrap', letterSpacing: '0.04em',
    }}>
      {msg}
    </div>
  )
}

interface AuthButtonsProps {
  onSuccess?: () => void
  showTitle?: boolean
}

export function AuthButtons({ onSuccess, showTitle = true }: AuthButtonsProps) {
  const t = useT()
  const { prefs } = usePreferences()

  // Provider visibility policy:
  // - Google + Email: always shown (global defaults).
  // - Kakao: shown only when UI locale is 'ko' or 'ko-KR'.
  //   Kakao is a Korean regional convenience provider, not a global option.
  //   PATTO is a global English learning app — Kakao is not exposed to non-Korean users.
  // - Apple, Naver: excluded from this version entirely.
  const isKorean = prefs.language === 'ko'

  const [emailMode, setEmailMode] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  async function handleGoogle() {
    const err = await signInWithGoogle()
    if (err) showToast(isKorean ? '로그인에 실패했습니다.' : 'Sign in failed.')
  }

  async function handleKakao() {
    const err = await signInWithKakao()
    if (err) showToast(isKorean ? '로그인에 실패했습니다.' : 'Sign in failed.')
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const err = await signInWithEmail(email, password, isSignUp)
    setLoading(false)
    if (err) {
      showToast(isKorean ? '로그인에 실패했습니다. 다시 시도해주세요.' : 'Sign in failed. Please try again.')
    } else if (isSignUp) {
      showToast(isKorean ? '가입 완료! 로그인해주세요.' : 'Signed up! Please sign in.')
      setIsSignUp(false)
    } else {
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.href = '/'
      }
    }
  }

  if (emailMode) {
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => setEmailMode(false)}
            style={{ background: 'none', border: 'none', color: 'var(--pm)', fontSize: 12, cursor: 'pointer', padding: '0 0 4px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
          >
            ← {isKorean ? '뒤로' : 'Back'}
          </button>
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="email" required
              placeholder={isKorean ? '이메일' : 'Email'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ ...btnStyle, height: 48, fontSize: 13.5, color: 'var(--pt)', outline: 'none' }}
            />
            <input
              type="password" required minLength={6}
              placeholder={isKorean ? '비밀번호 (6자 이상)' : 'Password (6+ chars)'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...btnStyle, height: 48, fontSize: 13.5, color: 'var(--pt)', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ ...btnStyle, justifyContent: 'center', background: 'var(--pa)', color: '#fff', border: 'none', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '...' : isSignUp ? (isKorean ? '회원가입' : 'Sign Up') : (isKorean ? '로그인' : 'Sign In')}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(v => !v)}
              style={{ background: 'none', border: 'none', color: 'var(--pm)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit', padding: '2px 0' }}
            >
              {isSignUp
                ? (isKorean ? '이미 계정이 있어요 → 로그인' : 'Already have an account? Sign In')
                : (isKorean ? '계정이 없어요 → 회원가입' : "No account? Sign Up")}
            </button>
          </form>
        </div>
        <Toast msg={toast} />
      </>
    )
  }

  return (
    <>
      {showTitle && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--pt)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Welcome to PATTO
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, lineHeight: 1.6, wordBreak: 'keep-all' }}>
            {isKorean
              ? '로그인하면 에세이, 단어장, 학습 기록을\n모든 기기에서 이어갈 수 있어요.'
              : 'Sign in to save your progress across all devices.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" onClick={handleGoogle} style={googleBtnStyle}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <GoogleIcon />
          <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>{t('auth_continue_google')}</span>
        </button>

        <button type="button" onClick={() => setEmailMode(true)} style={emailBtnStyle}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <EmailIcon />
          <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>{t('auth_continue_email')}</span>
        </button>

        {isKorean && (
          <button type="button" onClick={handleKakao} style={kakaoBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <KakaoIcon />
            <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>{t('auth_continue_kakao')}</span>
          </button>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--pm2)', lineHeight: 1.7, textAlign: 'center', margin: '20px 0 0' }}>
        {t('auth_agree_pre')}{' '}
        <Link href="/patto/settings/about/terms" style={{ textDecoration: 'underline', color: 'var(--pm)' }}>{t('auth_terms_link')}</Link>
        {t('auth_agree_mid')}
        <Link href="/patto/settings/about/privacy" style={{ textDecoration: 'underline', color: 'var(--pm)' }}>{t('auth_privacy_link')}</Link>
        {t('auth_agree_post')}
      </p>

      <Toast msg={toast} />
    </>
  )
}
