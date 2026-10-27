'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { InstallAppButton } from '@/components/kpatto/InstallAppButton'
import { unlockWithKey } from '@/lib/kpatto/license'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { KP } from '@/lib/kpatto/theme'

const T1 = '#111111'
const T2 = '#6B6B6B'

/**
 * /kpatto/redeem — Gumroad 영수증에서 들어오는 라이선스 키 입력 화면(로그인 불필요).
 * 앱 안에서는 같은 확인을 LicenseModal(헤더의 🔑 버튼 · 잠금 안내 시트)로 한다.
 */
export function RedeemClient() {
  const { isPro, isLifetime, loading } = useKPattoSubscription()
  const [key, setKey] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError(null)
    const r = await unlockWithKey(key)
    setSending(false)
    if (!r.valid) setError(r.error)
  }

  const btn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, marginTop: 12,
    border: 'none', borderRadius: 12, background: KP.primary, color: '#fff', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 24}px + env(safe-area-inset-bottom, 0px))` }}>
      <KPattoHeader />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 0', fontFamily: '"DM Sans", "Inter", system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', color: T1, margin: '0 0 8px' }}>Unlock K-PATTO</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: T2, margin: '0 0 24px' }}>
          Bought the WebApp Pass or the Complete Bundle on Gumroad? Enter the license key from your receipt to unlock all 100 episodes. No account needed.
        </p>

        {loading ? (
          <div style={{ height: 160 }} />
        ) : isPro ? (
          <div role="status" style={{ background: KP.primaryLight, border: `1px solid ${KP.primaryBorder}`, borderRadius: 16, padding: '22px 20px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T1, margin: '0 0 6px' }}>You&rsquo;re all set 🎉</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T2, margin: 0 }}>
              {isLifetime ? 'Pro lifetime access is active in this browser.' : 'K-PATTO Pro is already active on your account.'}
            </p>
            <Link href="/kpatto/story" style={btn}>Go to episodes</Link>
            {/* 잠금이 풀린 직후가 설치를 권하기 가장 좋은 때 — 이미 설치된 창이면 보이지 않는다 */}
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: T2, margin: '18px 0 10px' }}>
              Keep K-PATTO one tap away — install it on this device.
            </p>
            <InstallAppButton />
          </div>
        ) : (
          <form onSubmit={submit} style={{ border: '1px solid #ECECEC', borderRadius: 16, padding: 20 }}>
            <label htmlFor="rd-key" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: T1, margin: '0 0 8px' }}>License key</label>
            <input
              id="rd-key"
              value={key}
              onChange={e => { setKey(e.target.value); setError(null) }}
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
              style={{ width: '100%', boxSizing: 'border-box', height: 50, padding: '0 14px', border: `1px solid ${error ? '#E5484D' : '#D9D9D9'}`, borderRadius: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 15, color: T1, outline: 'none' }}
            />
            <button type="submit" disabled={sending || key.trim().length < 8} style={{ ...btn, opacity: sending || key.trim().length < 8 ? 0.6 : 1 }}>
              {sending ? 'Checking…' : 'Verify & Unlock'}
            </button>
            {error && <p role="alert" style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.5, color: '#C8102E' }}>{error}</p>}
            <p style={{ margin: '16px 0 0', fontSize: 13.5, lineHeight: 1.65, color: T2 }}>
              The key is in your Gumroad receipt email and in your Gumroad library. Unlocking applies to this browser — enter the key again on another device.
            </p>
          </form>
        )}

        <p style={{ margin: '20px 0 0', fontSize: 13.5, color: T2 }}>
          Don&rsquo;t have a pass yet? <Link href="/kpatto#pricing" style={{ color: KP.primary, fontWeight: 600 }}>See pricing</Link>
        </p>
      </div>
    </div>
  )
}
