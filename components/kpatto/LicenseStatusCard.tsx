'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  deactivateLicense, fetchLicenseStatus, getLicenseState, LICENSE_EVENT, maskKey, renewLicenseNow, unlockWithKey,
} from '@/lib/kpatto/license'
import { KP } from '@/lib/kpatto/theme'

const T1 = '#111111'
const T2 = '#666666'
const BORDER = '#E8E4DF'

type Status = { active: boolean; product?: string; exp?: number }

/**
 * 프로필의 라이선스 상태 카드 — Gumroad 평생 라이선스 모델.
 *
 * 기준은 서버가 보는 패스(httpOnly 쿠키 kpatto_pass, GET /api/verify-license).
 * 화면 코드는 쿠키를 직접 못 읽으므로 상태는 서버에 묻고, 키 표시는 이 브라우저에 저장된 키를 가려서 보여 준다.
 * 쿠키만 지워지고 키가 남아 있으면 조용히 다시 받아 온다.
 *
 *  - 없음: "Unlock Lifetime Pro" · 키 입력 + Activate · 구매 링크
 *  - 있음: "🎉 Lifetime Pro Active" · 가린 키 · Deactivate / Transfer
 */
export function LicenseStatusCard() {
  const [status, setStatus] = useState<Status | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const refresh = useCallback(async () => {
    let s = await fetchLicenseStatus()
    if (!s.active && getLicenseState().key) {
      // 쿠키만 사라진 경우 — 저장된 키로 한 번 다시 받아 본다
      if (await renewLicenseNow()) s = await fetchLicenseStatus()
    }
    setSavedKey(getLicenseState().key)
    setStatus(s)
  }, [])

  useEffect(() => {
    void refresh()
    const onChange = () => { void refresh() }
    window.addEventListener(LICENSE_EVENT, onChange)
    return () => window.removeEventListener(LICENSE_EVENT, onChange)
  }, [refresh])

  async function activate(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError(null)
    const r = await unlockWithKey(key)
    setBusy(false)
    if (r.valid) { setKey(''); return }   // LICENSE_EVENT 가 refresh 를 부른다
    setError(r.error)
  }

  async function deactivate() {
    setBusy(true)
    await deactivateLicense()
    setBusy(false)
    setConfirming(false)
  }

  const card: React.CSSProperties = {
    margin: '0 16px', background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 16px',
  }
  const btn: React.CSSProperties = {
    height: 46, borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  }

  if (!status) return <div style={{ ...card, height: 120 }} aria-busy="true" />

  if (status.active) {
    const product = status.product === 'bundle' ? 'Complete Bundle' : 'WebApp Pass'
    return (
      <div style={{ ...card, background: KP.primaryLight, borderColor: KP.primaryBorder }}>
        <div role="status" style={{ fontSize: 17, fontWeight: 800, color: T1, margin: '0 0 4px' }}>🎉 Lifetime Pro Active</div>
        <div style={{ fontSize: 13.5, color: T2, margin: '0 0 14px' }}>{product} · all 100 episodes unlocked in this browser</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#fff', border: `1px solid ${KP.primaryBorder}`, borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T2, letterSpacing: '.04em', textTransform: 'uppercase' }}>License key</span>
          <span className="notranslate" translate="no" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {savedKey ? maskKey(savedKey) : 'Saved in this browser'}
          </span>
        </div>

        {confirming ? (
          <div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: T1, margin: '0 0 10px' }}>
              Remove Pro from this browser? Your key stays valid — enter it on your new device to keep learning there.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={deactivate} disabled={busy} style={{ ...btn, flex: 1, background: '#111', color: '#fff', opacity: busy ? 0.6 : 1 }}>
                {busy ? '…' : 'Deactivate'}
              </button>
              <button type="button" onClick={() => setConfirming(false)} style={{ ...btn, flex: 1, background: '#fff', color: T1, border: `1px solid ${BORDER}` }}>
                Keep
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} style={{ ...btn, width: '100%', background: '#fff', color: T1, border: `1px solid ${BORDER}` }}>
            Deactivate / Transfer
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={activate} style={card}>
      <div style={{ fontSize: 17, fontWeight: 800, color: T1, margin: '0 0 4px' }}>Unlock Lifetime Pro</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, color: T2, margin: '0 0 14px' }}>
        Enter the license key from your Gumroad receipt to unlock all 100 episodes. No account needed.
      </div>
      <label htmlFor="ls-key" className="sr-only">License key</label>
      <input
        id="ls-key"
        value={key}
        onChange={e => { setKey(e.target.value); setError(null) }}
        placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        required
        style={{ width: '100%', boxSizing: 'border-box', height: 46, padding: '0 12px', border: `1px solid ${error ? '#E5484D' : '#D9D9D9'}`, borderRadius: 10, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14, color: T1, outline: 'none' }}
      />
      {error && <p role="alert" style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: '#C8102E' }}>{error}</p>}
      <button type="submit" disabled={busy || key.trim().length < 8} style={{ ...btn, width: '100%', marginTop: 10, background: KP.primary, color: '#fff', opacity: busy || key.trim().length < 8 ? 0.6 : 1 }}>
        {busy ? 'Checking…' : 'Activate'}
      </button>
      <p style={{ margin: '12px 0 0', fontSize: 13, color: T2, textAlign: 'center' }}>
        Don&rsquo;t have a key yet?{' '}
        <a href="/kpatto#pricing" target="_blank" rel="noopener" style={{ color: KP.primary, fontWeight: 700 }}>Get a lifetime pass →</a>
      </p>
    </form>
  )
}
