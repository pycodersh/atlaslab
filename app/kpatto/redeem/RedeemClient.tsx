'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { useAuth } from '@/contexts/AuthContext'
import { signInWithGoogleKpatto } from '@/lib/auth-actions'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { KP } from '@/lib/kpatto/theme'

const T1 = '#111111'
const T2 = '#6B6B6B'
const LINE = '#ECECEC'

const ERRORS: Record<string, string> = {
  invalid_key: "That key wasn't recognized. Copy it exactly from your Gumroad receipt — it's for the WebApp Pass or Complete Bundle.",
  refunded: 'This purchase was refunded or disputed, so the key can no longer unlock the app.',
  key_used: 'This key has already been used on another account. Sign in with that account, or contact us.',
  not_configured: "License activation isn't available yet. Please try again later.",
  unavailable: "We couldn't reach Gumroad just now. Please try again in a minute.",
  save_failed: 'Something went wrong while saving. Please try again.',
  sign_in: 'Please sign in first.',
}

type Status = 'idle' | 'sending' | 'done'

/**
 * 라이선스 키 입력 → /api/kpatto/redeem.
 * 로그인하지 않았으면 먼저 로그인시킨다 — Google 로그인 뒤 이 화면으로 돌아오도록
 * kpatto_return_to 쿠키를 남긴다(app/kpatto/auth/callback 이 읽는다).
 */
export function RedeemClient() {
  const { user, loading: authLoading } = useAuth()
  const { isPro, isLifetime, loading: subLoading } = useKPattoSubscription()
  const [key, setKey] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function signIn() {
    document.cookie = 'kpatto_return_to=/kpatto/redeem; path=/; max-age=600; samesite=lax'
    const err = await signInWithGoogleKpatto()
    if (err) setError(err)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/kpatto/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key }),
      })
      const body = await res.json().catch(() => ({}))
      if (body.ok) { setStatus('done'); return }
      setError(ERRORS[body.error] ?? ERRORS.save_failed)
    } catch {
      setError(ERRORS.unavailable)
    }
    setStatus('idle')
  }

  const unlocked = status === 'done' || isLifetime

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 24}px + env(safe-area-inset-bottom, 0px))` }}>
      <KPattoHeader />
      <style>{`
        .rd-wrap { max-width: 480px; margin: 0 auto; padding: 28px 20px 0; font-family: "DM Sans", "Inter", system-ui, sans-serif; }
        .rd-h1 { font-size: 26px; font-weight: 800; letter-spacing: -.02em; color: ${T1}; margin: 0 0 8px; }
        .rd-lead { font-size: 15px; line-height: 1.6; color: ${T2}; margin: 0 0 24px; }
        .rd-card { border: 1px solid ${LINE}; border-radius: 16px; padding: 20px; }
        .rd-label { display: block; font-size: 13px; font-weight: 700; color: ${T1}; margin: 0 0 8px; }
        .rd-input { width: 100%; box-sizing: border-box; height: 50px; padding: 0 14px; border: 1px solid #D9D9D9; border-radius: 12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 15px; color: ${T1}; outline: none; }
        .rd-input:focus { border-color: ${KP.primary}; box-shadow: 0 0 0 3px ${KP.primaryLight}; }
        .rd-btn { display: flex; align-items: center; justify-content: center; width: 100%; height: 52px; margin-top: 12px;
          border: none; border-radius: 12px; background: ${KP.primary}; color: #fff; font: inherit; font-size: 16px; font-weight: 700;
          cursor: pointer; text-decoration: none; transition: background .15s, opacity .15s; }
        .rd-btn:hover { background: ${KP.primaryHover}; }
        .rd-btn:disabled { opacity: .6; cursor: default; }
        .rd-err { margin: 12px 0 0; font-size: 14px; line-height: 1.5; color: #C8102E; }
        .rd-help { margin: 20px 0 0; font-size: 13.5px; line-height: 1.65; color: ${T2}; }
        .rd-help a { color: ${KP.primary}; font-weight: 600; }
        .rd-ok { background: ${KP.primaryLight}; border: 1px solid ${KP.primaryBorder}; border-radius: 16px; padding: 22px 20px; }
        .rd-ok h2 { font-size: 20px; font-weight: 800; color: ${T1}; margin: 0 0 6px; }
        .rd-ok p { font-size: 15px; line-height: 1.6; color: ${T2}; margin: 0 0 16px; }
      `}</style>

      <div className="rd-wrap">
        <h1 className="rd-h1">Unlock K-PATTO</h1>
        <p className="rd-lead">
          Bought the WebApp Pass or the Complete Bundle on Gumroad? Enter the license key from your receipt to unlock all 100 episodes on this account.
        </p>

        {authLoading || subLoading ? (
          <div style={{ height: 160 }} />
        ) : unlocked ? (
          <div className="rd-ok" role="status">
            <h2>You&rsquo;re all set 🎉</h2>
            <p>Lifetime access is active on this account. Sign in with the same account on any device to keep learning.</p>
            <Link href="/kpatto/story" className="rd-btn">Go to episodes</Link>
          </div>
        ) : !user ? (
          <div className="rd-card">
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T1, margin: '0 0 4px', fontWeight: 600 }}>Sign in first</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: T2, margin: 0 }}>
              Your access is saved to your account, so it works on every device you sign in with.
            </p>
            <button type="button" className="rd-btn" onClick={signIn}>Continue with Google</button>
            <p className="rd-help" style={{ marginTop: 12 }}>
              Prefer email? <Link href="/kpatto/profile">Sign in on your profile page</Link>, then come back here.
            </p>
            {error && <p className="rd-err" role="alert">{error}</p>}
          </div>
        ) : isPro ? (
          <div className="rd-ok" role="status">
            <h2>Premium is already active</h2>
            <p>This account already has K-PATTO Premium through a subscription. You don&rsquo;t need a license key.</p>
            <Link href="/kpatto/story" className="rd-btn">Go to episodes</Link>
          </div>
        ) : (
          <form className="rd-card" onSubmit={submit}>
            <label htmlFor="rd-key" className="rd-label">License key</label>
            <input
              id="rd-key"
              className="rd-input"
              value={key}
              onChange={e => { setKey(e.target.value); setError(null) }}
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
            />
            <button type="submit" className="rd-btn" disabled={status === 'sending' || key.trim().length < 8}>
              {status === 'sending' ? 'Checking…' : 'Unlock the app'}
            </button>
            {error && <p className="rd-err" role="alert">{error}</p>}
            <p className="rd-help">
              Signed in as <strong style={{ color: T1 }}>{user.email}</strong>. The key is in your Gumroad receipt email and in your Gumroad library.
            </p>
          </form>
        )}

        <p className="rd-help">
          Don&rsquo;t have a pass yet? <Link href="/kpatto#pricing">See pricing</Link>
        </p>
      </div>
    </div>
  )
}
