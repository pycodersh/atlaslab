'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'

const FEATURES = [
  'Unlimited Stories',
  'All Patterns',
  'AI Notes',
  'Shadowing Practice',
  'Word Collection',
]

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$4.99',
    period: '/ month',
    note: null,
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '$39.99',
    period: '/ year',
    note: '33% 절약',
  },
]

export default function SubscriptionPage() {
  const [selected, setSelected] = useState('annual')
  const [toast, setToast] = useState(false)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Back */}
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--pm)', textDecoration: 'none',
            marginBottom: 32, width: 'fit-content',
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          <span style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase' }}>
            Settings
          </span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 className="font-playfair" style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.2rem)',
            fontWeight: 900, lineHeight: 1, color: 'var(--pt)',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            Subscription
          </h1>
          <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8, lineHeight: 1.5 }}>
            PATTO의 모든 기능을 경험해보세요
          </p>
        </div>

        {/* ── Current Plan ───────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
            color: 'var(--pa)', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Current Plan
          </p>
          <p className="font-playfair" style={{
            fontSize: '1.3rem', fontWeight: 900,
            color: 'var(--pt)', margin: '0 0 4px', letterSpacing: '-0.01em',
          }}>
            Free
          </p>
          <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>
            무료 플랜 이용 중
          </p>
        </div>

        {/* ── Premium Includes ───────────────────────────────────── */}
        <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid var(--pd)' }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
            color: 'var(--pa)', textTransform: 'uppercase', marginBottom: 16,
          }}>
            Premium Includes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--pa)', flexShrink: 0, opacity: 0.6,
                }} />
                <span style={{ fontSize: 13, color: 'var(--pt)', fontWeight: 400 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Choose a Plan ──────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
            color: 'var(--pa)', textTransform: 'uppercase', marginBottom: 16,
          }}>
            Choose a Plan
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLANS.map(plan => {
              const isSelected = selected === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan.id)}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: 'none',
                    border: isSelected ? '1.5px solid var(--pa)' : '1.5px solid var(--pd)',
                    borderRadius: 14, padding: '16px 18px',
                    transition: 'border-color 0.18s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: 13, fontWeight: 700, margin: '0 0 2px',
                      color: isSelected ? 'var(--pt)' : 'var(--pt2)',
                    }}>
                      {plan.label}
                    </p>
                    {plan.note && (
                      <p style={{ fontSize: 10, color: 'var(--pa)', margin: 0, fontWeight: 500 }}>
                        {plan.note}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="font-playfair" style={{
                      fontSize: '1.25rem', fontWeight: 900,
                      color: isSelected ? 'var(--pa)' : 'var(--pt2)',
                      margin: '0 0 1px', lineHeight: 1,
                      letterSpacing: '-0.01em',
                    }}>
                      {plan.price}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>
                      {plan.period}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => { setToast(true); setTimeout(() => setToast(false), 2800) }}
          style={{
            width: '100%', padding: '13px 0',
            background: 'var(--pa)', color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.14em', cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          SUBSCRIBE
        </button>

        <p style={{
          textAlign: 'center', fontSize: 10,
          color: 'var(--pm2)', marginTop: 14,
        }}>
          언제든 해지 가능 · 숨은 비용 없음
        </p>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--pt)', color: 'var(--pb)',
          fontSize: 12, padding: '10px 20px', borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50, whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>
          결제 시스템 준비 중입니다.
        </div>
      )}
    </div>
  )
}
