'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { unlockWithKey } from '@/lib/kpatto/license'
import { KP } from '@/lib/kpatto/theme'

const T1 = '#111111'
const T2 = '#666666'

/**
 * 라이선스 키 입력 팝업 — Gumroad 영수증의 키를 넣으면 /api/verify-license 로 확인한다.
 * 성공하면 키를 저장하고 LICENSE_EVENT 를 쏴서 새로고침 없이 모든 에피소드 잠금이 풀린다
 * (축하 토스트는 LicenseToast 가 띄운다). 로그인은 필요 없다.
 */
export function LicenseModal({ onClose, onUnlocked }: { onClose: () => void; onUnlocked?: () => void }) {
  const [key, setKey] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError(null)
    const r = await unlockWithKey(key)
    setSending(false)
    if (r.valid) { onUnlocked?.(); onClose(); return }
    setError(r.error)
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="lic-title"
        onClick={e => e.stopPropagation()}
        onSubmit={submit}
        style={{ position: 'relative', width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, padding: '28px 22px 22px', boxSizing: 'border-box', fontFamily: 'inherit' }}
      >
        <button type="button" onClick={onClose} aria-label="Close"
          style={{ position: 'absolute', top: 10, right: 10, width: 40, height: 40, border: 'none', background: 'none', fontSize: 22, color: '#999', cursor: 'pointer' }}>×</button>

        <h2 id="lic-title" style={{ fontSize: 20, fontWeight: 800, color: T1, margin: '0 0 6px' }}>🔑 Enter your license key</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: T2, margin: '0 0 16px' }}>
          Find it in your Gumroad receipt email or your Gumroad library. No account needed.
        </p>

        <label htmlFor="lic-key" className="sr-only">License key</label>
        <input
          id="lic-key"
          ref={inputRef}
          value={key}
          onChange={e => { setKey(e.target.value); setError(null) }}
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          style={{ width: '100%', boxSizing: 'border-box', height: 50, padding: '0 14px', border: `1px solid ${error ? '#E5484D' : '#D9D9D9'}`, borderRadius: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14.5, color: T1, outline: 'none' }}
        />
        {error && <p role="alert" style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.5, color: '#C8102E' }}>{error}</p>}

        <button
          type="submit"
          disabled={sending || key.trim().length < 8}
          style={{ width: '100%', height: 52, marginTop: 14, border: 'none', borderRadius: 14, background: KP.primary, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: sending || key.trim().length < 8 ? 0.6 : 1 }}
        >
          {sending ? 'Checking…' : 'Verify & Unlock'}
        </button>
      </form>
    </div>,
    document.body,
  )
}
