'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
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

const FREE_FEATURES = [
  '10 Stories',
  'Save 20 Words',
  'Basic Progress',
  '3 AI Essay Reviews',
]

const PREMIUM_FEATURES = [
  'Unlimited Access',
  'Unlimited Collection',
  '5 AI Essay Reviews / Day',
  'Future Updates',
]

// Stub: replace with real subscription state
const IS_PREMIUM = false

export default function SubscriptionPage() {
  const t = useT()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
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
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
          Plan Management
        </p>

        {/* Current Plan card */}
        <div style={{
          ...glassCard,
          padding: '16px 18px',
          marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: IS_PREMIUM ? 'rgba(74,111,168,0.12)' : 'rgba(110,110,115,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {IS_PREMIUM ? '\u{1F451}' : '\u{1F7E2}'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px' }}>
              {IS_PREMIUM ? 'Premium Plan' : 'Free Plan'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>
              {IS_PREMIUM
                ? 'Enjoying unlimited access to all features.'
                : 'Upgrade to unlock everything PATTO has to offer.'}
            </p>
          </div>
        </div>

        {/* Free card */}
        <div style={{ ...glassCard, padding: '16px 18px', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', margin: '0 0 12px', textTransform: 'uppercase' }}>
            Free
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FREE_FEATURES.map(feat => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check style={{ width: 14, height: 14, color: 'var(--pm)', flexShrink: 0 }} strokeWidth={2.5} />
                <p style={{ fontSize: 12.5, color: 'var(--pt2)', margin: 0 }}>{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Premium card */}
        <div style={{
          ...glassCard,
          padding: '16px 18px',
          marginBottom: 18,
          border: '1.5px solid rgba(74,111,168,0.45)',
          background: 'rgba(74,111,168,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4A6FA8', margin: 0, textTransform: 'uppercase' }}>
              Premium
            </p>
            <p style={{ fontSize: 9.5, fontWeight: 600, color: '#4A6FA8', margin: 0 }}>{'✶'} All features</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREMIUM_FEATURES.map(feat => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check style={{ width: 14, height: 14, color: '#4A6FA8', flexShrink: 0 }} strokeWidth={2.5} />
                <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{feat}</p>
              </div>
            ))}
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