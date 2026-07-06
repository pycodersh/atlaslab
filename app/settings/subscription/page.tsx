'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

const COMPARE_ROWS = [
  { label: 'Stories',          free: '10 Stories',        premium: 'Unlimited' },
  { label: 'Patterns',         free: '20 Patterns',       premium: 'Unlimited' },
  { label: 'Words Saved',      free: '20 Words',          premium: 'Unlimited' },
  { label: 'AI Essay Reviews', free: '3 lifetime\n(300 words max)', premium: '5 / day\n(500 words max)' },
  { label: 'Future Updates',   free: false,               premium: true },
]

function PlanCell({ value, isPremium }: { value: string | boolean | false; isPremium: boolean }) {
  const accent = isPremium ? '#4A6FA8' : '#6E6E73'

  if (value === false) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <X style={{ width: 14, height: 14, color: '#C0C0C8' }} strokeWidth={2.5} />
      </div>
    )
  }
  if (value === true) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Check style={{ width: 14, height: 14, color: accent }} strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <p style={{
      fontSize: 11.5, fontWeight: isPremium ? 600 : 500,
      color: isPremium ? '#4A6FA8' : 'var(--pt2)',
      margin: 0, textAlign: 'center', lineHeight: 1.4,
      whiteSpace: 'pre-line',
    }}>
      {value}
    </p>
  )
}

export default function SubscriptionPage() {
  const t = useT()
  const [toast, setToast] = useState(false)

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Page title */}
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          Compare Plans
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '0 0 20px' }}>
          Choose the plan that fits your learning journey.
        </p>

        {/* Compare table */}
        <div style={glassCard}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            padding: '14px 18px 12px',
            borderBottom: '1px solid rgba(230,232,236,0.80)',
          }}>
            <div />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--pt2)', margin: 0, textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              FREE
            </p>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA8', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                PREMIUM
              </p>
              <p style={{ fontSize: 9, color: '#4A6FA8', margin: '2px 0 0', fontWeight: 500 }}>
                ✦ All features
              </p>
            </div>
          </div>

          {/* Feature rows */}
          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '12px 18px',
                borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid rgba(230,232,236,0.80)' : 'none',
                alignItems: 'center',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--pt2)', margin: 0, lineHeight: 1.3 }}>
                {row.label}
              </p>
              <PlanCell value={row.free} isPremium={false} />
              <PlanCell value={row.premium} isPremium />
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {[
            { id: 'monthly', label: 'Monthly', price: '$4.99', sub: 'per month' },
            { id: 'annual',  label: 'Annual',  price: '$39.99', sub: 'per year · Best Value' },
          ].map((plan) => (
            <div key={plan.id} style={{
              ...glassCard,
              flex: 1, padding: '14px 14px 12px',
              border: plan.id === 'annual'
                ? '1.5px solid rgba(74,111,168,0.40)'
                : '1px solid rgba(255,255,255,0.86)',
              background: plan.id === 'annual'
                ? 'rgba(74,111,168,0.04)'
                : 'rgba(255,255,255,0.88)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: plan.id === 'annual' ? '#4A6FA8' : 'var(--pm)', margin: '0 0 6px', textTransform: 'uppercase' }}>
                {plan.label}
              </p>
              <p style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: plan.id === 'annual' ? '#4A6FA8' : 'var(--pt)', margin: '0 0 2px', lineHeight: 1 }}>
                {plan.price}
              </p>
              <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0, lineHeight: 1.3 }}>
                {plan.sub}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={() => { setToast(true); setTimeout(() => setToast(false), 2800) }}
            style={{
              width: '100%', padding: '15px 0',
              background: '#4A6FA8',
              border: 'none',
              borderRadius: 16, cursor: 'pointer',
              fontSize: 13.5, fontWeight: 700, letterSpacing: '0.08em',
              color: '#fff', fontFamily: 'inherit',
              boxShadow: '0 4px 18px rgba(74,111,168,0.30)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Upgrade to Premium
          </button>
          <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--pm2)', marginTop: 10 }}>
            Cancel anytime.
          </p>
        </div>

        {/* Version */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
          v1.0.0
        </p>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--pt)', color: 'var(--pb)',
          fontSize: 12, padding: '10px 22px', borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50, whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>
          {t('sub_toast')}
        </div>
      )}
    </div>
  )
}
