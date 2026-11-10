'use client'
import { CircleCheck } from 'lucide-react'
import { INLINE_ICON } from '@/components/kpantry/ui/icon'
import { useState } from 'react'
import { unlockWithKey } from '@/lib/kpantry/license'

interface Props {
  /** 키 확인에 성공했을 때 — 기본은 페이지를 다시 불러 Pro 잠금을 푼다 */
  onUnlocked?: () => void
}

export default function LicenseKeyForm({ onUnlocked }: Props) {
  const [key, setKey] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim()) {
      setError('Enter the order number or email from your Gumroad receipt.')
      return
    }
    setChecking(true)
    setError(null)
    const r = await unlockWithKey(key)
    setChecking(false)
    if (!r.valid) {
      setError(r.error)
      return
    }
    setDone(true)
    if (onUnlocked) onUnlocked()
    else window.location.reload()
  }

  if (done) {
    return (
      <p role="status" style={{
        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
        color: 'var(--kp-accent)', backgroundColor: 'var(--kp-accent-soft)',
        borderRadius: 12, padding: '12px 14px', margin: 0, textAlign: 'center',
      }}>
        <CircleCheck {...INLINE_ICON} />K-Pantry Pro unlocked
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="kpantry-license-key" style={{
        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
        color: '#6B6B6B', display: 'block', marginBottom: 6,
      }}>
        ORDER NUMBER OR PURCHASE EMAIL
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id="kpantry-license-key"
          type="text"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Order # or you@email.com"
          autoComplete="off"
          autoCapitalize="none"
          inputMode="email"
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1.5px solid var(--kp-rule)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#1A1A1A',
            backgroundColor: '#FAFAFA',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={checking}
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            backgroundColor: 'var(--kp-accent)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: checking ? 'not-allowed' : 'pointer',
            opacity: checking ? 0.7 : 1,
          }}
        >
          {checking ? 'Checking…' : 'Activate'}
        </button>
      </div>
      {error && (
        <p role="alert" style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13,
          color: '#C53030', margin: '8px 0 0',
        }}>
          {error}
        </p>
      )}
    </form>
  )
}
