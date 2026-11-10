'use client'
import Link from 'next/link'
import { ArrowUpRight, Check, KeyRound, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import GumroadCheckoutLink from './GumroadCheckoutLink'
import LicenseKeyForm from './LicenseKeyForm'
import LegalLinks from '@/components/kpantry/layout/LegalLinks'
import { INLINE_ICON } from '@/components/kpantry/ui/icon'
import {
  KPANTRY_CHECKOUT_URL,
  KPANTRY_LIST_PRICE,
  KPANTRY_PRICE,
  KPANTRY_PRODUCT_NAME,
  LIFETIME_BENEFITS,
  REFUND_DAYS,
} from '@/lib/kpantry/purchase'

interface Props {
  onClose: () => void
  /** 키 확인에 성공했을 때 — 호출부가 잠금을 바로 풀고 모달을 닫는다 */
  onUnlocked: () => void
  /** 잠긴 레시피를 눌러 열었을 때 그 이름 — 왜 막혔는지 한 줄로 알려 준다 */
  recipeName?: string
}

const FONT = 'Inter, sans-serif'

/**
 * Lifetime Pass 언락 모달 — 잠긴 레시피(93개)를 누르면 뜬다.
 * 결제는 Gumroad 오버레이로 이 화면 위에 띄운다(GumroadCheckoutLink — 스크립트가 없으면 새 탭),
 * 영수증의 주문 번호(또는 결제 이메일)를 아래 폼에 넣으면 /api/verify-license?app=kpantry 가
 * Gumroad 판매 내역에서 찾아 패스 쿠키를 심는다(이 상품은 라이선스 키를 켤 수 없다).
 */
export default function UnlockModal({ onClose, onUnlocked, recipeName }: Props) {
  const [showKeyForm, setShowKeyForm] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const cta = `Unlock Lifetime Access — ${KPANTRY_PRICE}`
  const ctaStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    width: '100%', padding: '16px', boxSizing: 'border-box',
    backgroundColor: 'var(--kp-accent)', color: '#FFFFFF',
    border: 'none', borderRadius: 14,
    fontFamily: FONT, fontSize: 15, fontWeight: 700,
    textDecoration: 'none', cursor: 'pointer',
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(28, 25, 23, 0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kp-unlock-title"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 430, maxHeight: '92vh', overflowY: 'auto',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          padding: '12px 24px calc(28px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'var(--kp-rule)', margin: '0 auto 16px' }} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 12, right: 12, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', borderRadius: 10, color: '#78716C', cursor: 'pointer',
          }}
        >
          <X size={20} strokeWidth={2} aria-hidden="true" />
        </button>

        <p style={{
          fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--kp-accent)', margin: '0 0 6px',
        }}>
          One-time · Lifetime access
        </p>
        <h2 id="kp-unlock-title" style={{
          fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, lineHeight: 1.25,
          color: '#1C1917', margin: 0,
        }}>
          {KPANTRY_PRODUCT_NAME}
        </h2>
        {recipeName && (
          <p style={{ fontFamily: FONT, fontSize: 13, color: '#78716C', margin: '6px 0 0', lineHeight: 1.5 }}>
            <strong style={{ color: '#1C1917', fontWeight: 600 }}>{recipeName}</strong> is part of the full collection.
          </p>
        )}

        {/* 가격 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '18px 0 4px' }}>
          <span className="text-rose-600 font-extrabold text-3xl" style={{ fontFamily: FONT, letterSpacing: '-0.01em' }}>
            {KPANTRY_PRICE}
          </span>
          <span className="line-through text-slate-400" style={{ fontFamily: FONT, fontSize: 16 }}>
            <span className="sr-only">Regular price </span>{KPANTRY_LIST_PRICE}
          </span>
          <span style={{
            fontFamily: FONT, fontSize: 11, fontWeight: 600, color: 'var(--kp-accent)',
            backgroundColor: 'var(--kp-accent-soft)', borderRadius: 999, padding: '2px 8px',
          }}>
            Launch price
          </span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 13, color: '#57534E', margin: 0 }}>
          One-time payment, lifetime access. No monthly subscriptions.
        </p>

        <div style={{ height: 1, backgroundColor: 'var(--kp-rule)', margin: '18px 0 14px' }} />

        <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LIFETIME_BENEFITS.map(item => (
            <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: FONT, fontSize: 14, lineHeight: 1.45, color: '#292524' }}>
              <Check size={16} strokeWidth={2.5} color="#C8102E" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
              {item}
            </li>
          ))}
        </ul>

        {KPANTRY_CHECKOUT_URL ? (
          <GumroadCheckoutLink href={KPANTRY_CHECKOUT_URL} style={ctaStyle}>
            {cta}<ArrowUpRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </GumroadCheckoutLink>
        ) : (
          // 결제 링크가 없으면 누를 수 없는 버튼으로만 둔다 — 아무 데도 안 가는 버튼을 누르게 하지 않는다
          <button type="button" disabled style={{ ...ctaStyle, opacity: 0.45, cursor: 'not-allowed' }}>
            {cta}
          </button>
        )}
        <p style={{ fontFamily: FONT, fontSize: 12, color: '#78716C', textAlign: 'center', margin: '8px 0 0' }}>
          {KPANTRY_CHECKOUT_URL
            ? 'Secure checkout by Gumroad. Then enter your order number or email here.'
            : 'Checkout is not open yet.'}
        </p>

        <Link
          href="/kpantry/en/refund"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            margin: '14px 0 0', fontFamily: FONT, fontSize: 13, fontWeight: 600,
            color: '#44403C', textDecoration: 'none',
          }}
        >
          <ShieldCheck size={16} strokeWidth={2} color="#15803D" aria-hidden="true" />
          {REFUND_DAYS}-Day Money-Back Guarantee
        </Link>

        <div style={{ margin: '18px 0 0', paddingTop: 16, borderTop: '1px solid var(--kp-rule)' }}>
          {showKeyForm ? (
            <LicenseKeyForm onUnlocked={onUnlocked} />
          ) : (
            <button
              type="button"
              onClick={() => setShowKeyForm(true)}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: 'transparent', color: '#44403C',
                border: '1.5px solid var(--kp-rule)', borderRadius: 14,
                fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <KeyRound {...INLINE_ICON} />Already bought? Enter order number or email
            </button>
          )}
        </div>

        <LegalLinks style={{ marginTop: 14 }} />
      </div>
    </div>
  )
}
