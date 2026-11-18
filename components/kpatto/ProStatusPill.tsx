'use client'

import { useState } from 'react'
import { KeyRound, Sparkles } from 'lucide-react'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { KP } from '@/lib/kpatto/theme'
import { LicenseModal } from './LicenseModal'

/**
 * 앱 헤더의 Pro 상태 — 미구매면 (코랄 열쇠 선 아이콘) "Enter License Key" 텍스트 링크(캡슐 없음, 키 입력 팝업),
 * Pro 면 (Sparkles 선 아이콘) "Pro Lifetime" 뱃지(기존 월 구독자는 "Pro").
 * OS 컬러 이모지 대신 lucide 선 아이콘 — 기기마다 모양이 달라지지 않게.
 */
const KEY_LINK_CSS = `
.kp-key-link { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 2px; background: none; border: none;
  font-family: inherit; font-size: 12.5px; font-weight: 600; color: #555; cursor: pointer; white-space: nowrap; transition: color .15s; }
.kp-key-link:hover, .kp-key-link:focus-visible { color: ${KP.primary}; }
`

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
        <Sparkles size={13} strokeWidth={2} aria-hidden="true" />
        {isLifetime ? 'Pro Lifetime' : 'Pro'}
      </span>
    )
  }

  return (
    <>
      {/* 캡슐 없이 텍스트 링크 — 코랄 열쇠 선 아이콘(설정 화면 아이콘과 같은 규격) + 은은한 호버(글자색만 코랄로) */}
      <style>{KEY_LINK_CSS}</style>
      <button type="button" className="kp-key-link" onClick={() => setOpen(true)}>
        <KeyRound size={15} strokeWidth={1.8} color={KP.primary} aria-hidden="true" />
        Enter License Key
      </button>
      {open && <LicenseModal onClose={() => setOpen(false)} />}
    </>
  )
}
