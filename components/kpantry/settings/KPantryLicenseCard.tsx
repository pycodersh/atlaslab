'use client'
import { useCallback, useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { deactivateLicense, hasLicensePass, unlockWithKey } from '@/lib/kpantry/license'
import { KPANTRY_CHECKOUT_URL } from '@/lib/kpantry/purchase'
import { TOTAL_RECIPES } from '@/lib/kpantry/access'
import { SETTINGS_BORDER, SETTINGS_T1, SETTINGS_T2 } from '@/components/settings/SettingsKit'

const ACCENT = '#C8102E'
const ACCENT_LIGHT = '#FBEEF0'
const ACCENT_BORDER = '#F3C9D0'
const KEY = 'kpantry_license_key'

/** 저장된 주문번호·이메일을 가려서 보여 준다 — 이메일은 앞 두 글자, 주문번호는 끝 4자리만 */
function mask(ref: string | null) {
  if (!ref) return null
  if (ref.includes('@')) {
    const [local, domain] = ref.split('@')
    return `${local.slice(0, 2)}${'•'.repeat(Math.max(2, local.length - 2))}@${domain}`
  }
  return `${'•'.repeat(Math.max(4, ref.length - 4))}${ref.slice(-4)}`
}

/**
 * K-Pantry 설정의 LICENSE 카드 — K-PATTO 설정의 라이선스 카드(components/kpatto/LicenseStatusCard.tsx)와 같은 모양.
 * 판정은 서버가 서명한 httpOnly 쿠키 kpantry_pass(GET /api/verify-license?app=kpantry).
 * K-Pantry 상품은 Gumroad 라이선스 키가 없어서 영수증의 주문번호(Order #) 또는 결제 이메일로 연다.
 *  - 없음: "Unlock Lifetime Pro" · 입력 + Activate · 구매 링크
 *  - 있음: (✦ 선 아이콘) "Pro Lifetime Active" · 가린 주문번호/이메일 · Deactivate / Transfer
 */
export function KPantryLicenseCard() {
  const [active, setActive] = useState<boolean | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const refresh = useCallback(async () => {
    const ok = await hasLicensePass()
    try { setSaved(localStorage.getItem(KEY)) } catch { setSaved(null) }
    setActive(ok)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  async function activate(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError(null)
    const r = await unlockWithKey(ref)
    setBusy(false)
    if (r.valid) { setRef(''); void refresh(); return }
    setError(r.error)
  }

  async function deactivate() {
    setBusy(true)
    await deactivateLicense()
    setBusy(false)
    setConfirming(false)
    void refresh()
  }

  const card: React.CSSProperties = {
    margin: '0 16px', background: '#FFFFFF', border: `1px solid ${SETTINGS_BORDER}`, borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 16px',
  }
  const btn: React.CSSProperties = {
    height: 46, borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  }

  if (active === null) return <div style={{ ...card, height: 120 }} aria-busy="true" />

  if (active) {
    return (
      <div style={{ ...card, background: ACCENT_LIGHT, borderColor: ACCENT_BORDER }}>
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 17, fontWeight: 800, color: SETTINGS_T1, margin: '0 0 4px' }}>
          <Sparkles size={18} color={ACCENT} strokeWidth={1.8} aria-hidden="true" style={{ flexShrink: 0 }} />
          Pro Lifetime Active
        </div>
        <div style={{ fontSize: 13.5, color: SETTINGS_T2, margin: '0 0 14px' }}>All {TOTAL_RECIPES} recipes unlocked in this browser</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#fff', border: `1px solid ${ACCENT_BORDER}`, borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: SETTINGS_T2, letterSpacing: '.04em', textTransform: 'uppercase' }}>Purchase</span>
          <span className="notranslate" translate="no" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, color: SETTINGS_T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mask(saved) ?? 'Saved in this browser'}
          </span>
        </div>

        {confirming ? (
          <div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: SETTINGS_T1, margin: '0 0 10px' }}>
              Remove Pro from this browser? Your purchase stays valid — enter the same order number or email on your new device.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={deactivate} disabled={busy} style={{ ...btn, flex: 1, background: '#111', color: '#fff', opacity: busy ? 0.6 : 1 }}>
                {busy ? '…' : 'Deactivate'}
              </button>
              <button type="button" onClick={() => setConfirming(false)} style={{ ...btn, flex: 1, background: '#fff', color: SETTINGS_T1, border: `1px solid ${SETTINGS_BORDER}` }}>
                Keep
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} style={{ ...btn, width: '100%', background: '#fff', color: SETTINGS_T1, border: `1px solid ${SETTINGS_BORDER}` }}>
            Deactivate / Transfer
          </button>
        )}
      </div>
    )
  }

  const tooShort = ref.trim().length < 5
  return (
    <form onSubmit={activate} style={card}>
      <div style={{ fontSize: 17, fontWeight: 800, color: SETTINGS_T1, margin: '0 0 4px' }}>Unlock Lifetime Pro</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, color: SETTINGS_T2, margin: '0 0 14px' }}>
        Enter the order number or email from your Gumroad receipt to unlock all {TOTAL_RECIPES} recipes. No account needed.
      </div>
      <label htmlFor="kp-settings-key" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Order number or email</label>
      <input
        id="kp-settings-key"
        value={ref}
        onChange={e => { setRef(e.target.value); setError(null) }}
        placeholder="Order # or you@email.com"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="email"
        required
        style={{ width: '100%', boxSizing: 'border-box', height: 46, padding: '0 12px', border: `1px solid ${error ? '#E5484D' : '#D9D9D9'}`, borderRadius: 10, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14, color: SETTINGS_T1, outline: 'none' }}
      />
      {error && <p role="alert" style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: ACCENT }}>{error}</p>}
      <button type="submit" disabled={busy || tooShort} style={{ ...btn, width: '100%', marginTop: 10, background: ACCENT, color: '#fff', opacity: busy || tooShort ? 0.6 : 1 }}>
        {busy ? 'Checking…' : 'Activate'}
      </button>
      {KPANTRY_CHECKOUT_URL && (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: SETTINGS_T2, textAlign: 'center' }}>
          Don&rsquo;t have Pro yet?{' '}
          <a href="/kpantry/landing#pricing" style={{ color: ACCENT, fontWeight: 700 }}>Get the Lifetime Pass →</a>
        </p>
      )}
    </form>
  )
}
