'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleCheck, UserCircle, ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { usePaddle } from '@/hooks/usePaddle'
import { useSubscription } from '@/hooks/useSubscription'
import { getCurrentUser } from '@/lib/auth-actions'

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID!
const ANNUAL_PRICE_ID  = process.env.NEXT_PUBLIC_PADDLE_ANNUAL_PRICE_ID!

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

export default function SubscriptionPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const t = useT()
  const paddle = usePaddle()
  const { isPro, loading: subLoading } = useSubscription()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  async function handleUpgrade() {
    if (!paddle) { showToast('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.'); return }

    setLoading(true)
    try {
      const user = await getCurrentUser()
      const priceId = billing === 'monthly' ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        // Pass user_id so webhook can link subscription to Supabase user
        customData: user?.id ? { user_id: user.id } : undefined,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'ko',
        },
      })
    } catch {
      showToast('결제 창을 열 수 없습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

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
        {isDesktop && (
          <button
            type="button"
            onClick={() => router.push('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
            Profile
          </button>
        )}

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
              {isPro ? 'PREMIUM PLAN' : 'FREE PLAN'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>
              {isPro ? t('sub_premium_plan_msg') : t('sub_free_plan_msg')}
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
          </div>
        </div>

        {/* Premium card */}
        <div style={{
          ...glassCard,
          padding: '16px 18px',
          marginBottom: 18,
          border: '1px solid var(--pacb)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', margin: 0, textTransform: 'uppercase' }}>
              Premium
            </p>
            <span style={{ fontSize: 9, color: 'var(--pa)', letterSpacing: '0.04em', opacity: 0.7 }}>✦</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {premiumFeatures.map(feat => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CircleCheck style={{ width: 14, height: 14, color: 'var(--pa)', flexShrink: 0, opacity: 0.65 }} strokeWidth={1.5} />
                <p style={{ fontSize: 12.5, color: 'var(--pt)', margin: 0 }}>{feat}</p>
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
                    ? '1.5px solid var(--pacb)'
                    : '1px solid var(--pglass-border)',
                  background: selected ? 'var(--pal)' : 'var(--pglass)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border 0.15s, background 0.15s',
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: selected ? 'var(--pa)' : 'var(--pm)', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  {plan.label}
                </p>
                <p style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: selected ? 'var(--pa)' : 'var(--pt)', margin: '0 0 2px', lineHeight: 1 }}>
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
          onClick={isPro ? undefined : handleUpgrade}
          disabled={loading || !paddle}
          style={{
            ...glassCard,
            width: '100%', padding: '15px 0',
            border: '1px solid var(--pglass-border)',
            cursor: loading || !paddle ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
            color: 'var(--pt)', fontFamily: 'inherit',
            opacity: loading || !paddle ? 0.6 : 1,
            transition: 'transform 0.18s, box-shadow 0.18s, opacity 0.15s',
          }}
          onMouseEnter={e => {
            if (!loading && paddle) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,40,80,0.09)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,50,80,0.07)'
          }}
        >
          {loading ? '...' : isPro ? 'Manage Subscription' : 'Upgrade to Premium'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--pm2)', marginTop: 10, marginBottom: 0 }}>
          Cancel anytime.
        </p>

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
          {toast}
        </div>
      )}
    </div>
  )
}
