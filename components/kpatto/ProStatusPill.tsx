'use client'

import { useState } from 'react'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { KP } from '@/lib/kpatto/theme'
import { LicenseModal } from './LicenseModal'

/**
 * 앱 헤더의 Pro 상태 — 미구매면 "🔑 Enter License Key" 버튼(키 입력 팝업),
 * Pro 면 "✨ Pro Lifetime" 뱃지(기존 월 구독자는 "✨ Pro").
 */
export function ProStatusPill() {
  const { isPro, isLifetime, loading } = useKPattoSubscription()
  const [open, setOpen] = useState(false)

  if (loading) return null

  if (isPro) {
    return (
      <span
        title={isLifetime ? 'Pro Lifetime Access' : 'K-PATTO Pro'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px',
          borderRadius: 999, background: KP.primaryLight, border: `1px solid ${KP.primaryBorder}`,
          fontSize: 12, fontWeight: 700, color: KP.primary, whiteSpace: 'nowrap',
        }}
      >
        ✨ {isLifetime ? 'Pro Lifetime' : 'Pro'}
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px',
          borderRadius: 999, background: '#fff', border: '1px solid #E5E5E5',
          fontSize: 12, fontWeight: 700, color: '#444', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
        }}
      >
        🔑 Enter License Key
      </button>
      {open && <LicenseModal onClose={() => setOpen(false)} />}
    </>
  )
}
