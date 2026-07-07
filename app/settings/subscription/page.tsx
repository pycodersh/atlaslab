'use client'

import { useState } from 'react'
import { CircleCheck, UserCircle } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

// Stub: replace with real subscription state
const IS_PREMIUM = false

export default function SubscriptionPage() {
  const t = useT()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [toast, setToast] = useState(false)

  const freeFeatures = [
    t('sub_free_f1'),
    t('sub_free_f2'),
    t('sub_free_f3'),
    t('sub_free_f4'),
  ]
  const premiumFeatures = [
    t('sub_prem_f1'),
    t('sub_prem_f2'),
    t('sub_prem_f3'),
    t('sub_prem_f4'),
  ]

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Current Plan card */}
        <div style={{
          ...glassCard,
          padding: '16px 18px',
          marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <UserCircle style={{ width: 32, height: 32, color: 'var(--pm)', flexShrink: 0 }} strokeWidth={1.25} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px' }}>
              {IS_PREMIUM ? 'PREMIUM PLAN' : 'FREE PLAN'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>
              {IS_PREMIUM ? t('sub_premium_plan_msg') : t('sub_free_plan_msg')}
            </p>
          </div>
        </div>

        {/* Free card */}
        <div style={{ ...glassCard, padding: '16px 18px', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', margin: '0 0 12px', textTransform: 'uppercase' }}>
            Free
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {freeFeatures.map(feat => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CircleCheck style={{ width: 14, height: 14, color: 'var(--pm)', flexShrink: 0 }} strokeWidth={1.5} />
                <p style={{ fontSize: 12.5, color: 'var(--pt2)', margin: 0 }}>{feat}</p>
              </div>
            ))}
            {/* Essay review limit */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CircleCheck style={{ width: 14, height: 14, color: 'var(--pm)', flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
              <div>
                <p style={{ fontSize: 12.5, color: 'var(--pt2)', margin: 0 }}>AI Essay Reviews</p>
                <p style={{ fontSize: 10.5, color: 'var(--pm)', margin: '1px 0 0', fontWeight: 400 }}>3 lifetime · up to 300 words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium card */}
        <div style={{
          ...glassCard,
          padding: '16px 18px',
          marginBottom: 18,
          border: '1px solid rgba(74,111,168,0.30)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', margin: 0, textTransform: 'uppercase' }}>
              Premium
            </p>
            <span style={{ fontSize: 9, color: 'rgba(74,111,168,0.70)', letterSpacing: '0.04em' }}>✦</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {premiumFeatures.map(feat => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CircleCheck style={{ width: 14, height: 14, color: 'rgba(74,111,168,0.65)', flexShrink: 0 }} strokeWidth={1.5} />
                <p style={{ fontSize: 12.5, color: 'var(--pt)', margin: 0 }}>{feat}</p>
              </div>
            ))}
            {/* Essay review limit */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CircleCheck style={{ width: 14, height: 14, color: 'rgba(74,111,168,0.65)', flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
              <div>
                <p style={{ fontSize: 12.5, color: 'var(--pt)', margin: 0 }}>AI Essay Reviews</p>
                <p style={{ fontSize: 10.5, color: 'var(--pm)', margin: '1px 0 0', fontWeight: 400 }}>5 / day · up to 500 words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly / Annual toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {([
            { id: 'monthly', label: 'Monthly', price: '$4.99', sub: 'per month' },
            { id: 'annual',  label: 'Annual',  price: '$39.99', sub: 'per year · Best Value' },
          ] as const).map((plan) => {
            const selected = billing === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setBilling(plan.id)}
                style={{
                  ...glassCard,
                  flex: 1, padding: '14px 14px 12px',
                  border: selected
                    ? '1.5px solid rgba(74,111,168,0.50)'
                    : '1px solid var(--pglass-border)',
                  background: selected ? 'rgba(74,111,168,0.09)' : 'var(--pglass)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border 0.15s, background 0.15s',
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: selected ? '#4A6FA8' : 'var(--pm)', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  {plan.label}
                </p>
                <p style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: selected ? '#4A6FA8' : 'var(--pt)', margin: '0 0 2px', lineHeight: 1 }}>
                  {plan.price}
                </p>
                <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0, lineHeight: 1.3 }}>
                  {plan.sub}
                </p>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => { setToast(true); setTimeout(() => setToast(false), 2800) }}
          style={{
            ...glassCard,
            width: '100%', padding: '15px 0',
            border: '1px solid var(--pglass-border)',
            cursor: 'pointer',
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
            color: 'var(--pt)', fontFamily: 'inherit',
            transition: 'transform 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,40,80,0.09)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,50,80,0.07)'
          }}
        >
          {IS_PREMIUM ? 'Manage Subscription' : 'Upgrade to Premium'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--pm2)', marginTop: 10, marginBottom: 0 }}>
          Cancel anytime.
        </p>

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