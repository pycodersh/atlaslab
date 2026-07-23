'use client'

import { useState } from 'react'
import { Gift, Sparkles, Check } from 'lucide-react'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { useAuth } from '@/contexts/AuthContext'
import { usePaddle } from '@/hooks/usePaddle'
import { getPaddle } from '@/lib/paddle/client'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'

const ACCENT = '#D4873A'
const T1 = '#111111'
const T2 = '#666666'
const BORDER = '#E8E4DF'

const PRO_PERKS = [
  'EP06~ unlimited access',
  'New episodes auto-unlocked',
  'Full challenge access',
  'Unlimited bookmarks',
  'Full audio access',
]

const FREE_PERKS = [
  'Pre-course (all free)',
  'EP01~05 free',
  'Basic challenges',
]

export default function KPattoSubscriptionPage() {
  const { user } = useAuth()
  const { isPro, loading: subLoading } = useKPattoSubscription()
  const paddle = usePaddle()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    if (loading) return
    const priceId = process.env.NEXT_PUBLIC_PADDLE_KPATTO_PRICE_ID
    if (!priceId || priceId.includes('REPLACE')) return

    let p = paddle
    if (!p) {
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 100))
        p = await getPaddle()
        if (p) break
      }
    }
    if (!p) {
      alert('결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setLoading(true)
    try {
      await p.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        customData: user?.id ? { user_id: user.id } : undefined,
        settings: { displayMode: 'overlay', locale: 'ko' },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: 40 }}>
      <KPattoHeader />

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Section title */}
        <div style={{ fontSize: 18, fontWeight: 700, color: T1 }}>Choose your plan</div>

        {/* Free plan card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 16,
          border: `1.5px solid ${BORDER}`,
          padding: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={18} color="#999999" strokeWidth={1.8} />
              <span style={{ fontSize: 18, fontWeight: 700, color: T1 }}>Free</span>
            </div>
            {!isPro && !subLoading && (
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                color: ACCENT, background: '#FFF7EE',
                border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: '3px 10px',
              }}>
                Current
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FREE_PERKS.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} color="#999999" strokeWidth={2.5} />
                <span style={{ fontSize: 14, color: T2 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro plan card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 16,
          border: `1.5px solid ${ACCENT}`,
          padding: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color={ACCENT} strokeWidth={1.8} />
              <span style={{ fontSize: 18, fontWeight: 700, color: T1 }}>K-PATTO Pro</span>
            </div>
            {!subLoading && (
              isPro ? (
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                  color: '#16A34A', background: '#F0FDF4',
                  border: '1px solid #BBF7D0', borderRadius: 20, padding: '3px 10px',
                }}>
                  Active
                </span>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>$2.99/mo</span>
              )
            )}
          </div>

          {isPro && !subLoading && (
            <div style={{ fontSize: 12, color: T2, marginBottom: 14 }}>
              Manage your subscription via Paddle customer portal.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {PRO_PERKS.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} color={ACCENT} strokeWidth={2.5} />
                <span style={{ fontSize: 14, color: T2 }}>{p}</span>
              </div>
            ))}
          </div>

          {!subLoading && (
            isPro ? (
              <a
                href="https://customer.paddle.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 48,
                  background: 'transparent', border: `1.5px solid ${ACCENT}`,
                  borderRadius: 12, fontSize: 15, fontWeight: 600, color: ACCENT,
                  textDecoration: 'none', boxSizing: 'border-box',
                }}
              >
                Manage Subscription
              </a>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  width: '100%', height: 48,
                  background: ACCENT, color: '#FFFFFF',
                  border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                } as React.CSSProperties}
              >
                {loading ? '...' : 'Upgrade to Pro →'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
