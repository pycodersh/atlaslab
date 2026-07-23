'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Star, Check } from 'lucide-react'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { useAuth } from '@/contexts/AuthContext'
import { usePaddle } from '@/hooks/usePaddle'

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
  'Pre-course (전체 무료)',
  'EP01~05 무료',
  'Basic challenges',
]

export default function KPattoSubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPro, loading: subLoading } = useKPattoSubscription()
  const paddle = usePaddle()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    const priceId = process.env.NEXT_PUBLIC_PADDLE_KPATTO_PRICE_ID
    if (!priceId || priceId.includes('REPLACE') || !paddle) return
    setLoading(true)
    try {
      await paddle.Checkout.open({
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
    <div style={{ minHeight: '100vh', background: '#F9F7F4', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', height: 52,
        background: '#FFFFFF', borderBottom: `1px solid ${BORDER}`,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: T1, padding: 4 }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Subscription</span>
      </div>

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Free plan card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 16,
          border: `1.5px solid ${isPro ? BORDER : ACCENT}`,
          padding: '20px 20px',
          boxShadow: isPro ? 'none' : '0 2px 12px rgba(212,135,58,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🆓</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Free</span>
            </div>
            {!isPro && (
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
                <Check size={14} color="#22C55E" strokeWidth={2.5} />
                <span style={{ fontSize: 13.5, color: T2 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro plan card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 16,
          border: `1.5px solid ${isPro ? ACCENT : BORDER}`,
          padding: '20px 20px',
          boxShadow: isPro ? '0 2px 12px rgba(212,135,58,0.12)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={18} color={ACCENT} fill={ACCENT} strokeWidth={0} />
              <span style={{ fontSize: 16, fontWeight: 800, color: T1 }}>K-PATTO Pro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isPro ? (
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                  color: '#16A34A', background: '#F0FDF4',
                  border: '1px solid #BBF7D0', borderRadius: 20, padding: '3px 10px',
                }}>
                  Active
                </span>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>$2.99/mo</span>
              )}
            </div>
          </div>

          {subLoading ? null : isPro ? (
            <div style={{ fontSize: 12, color: T2, marginBottom: 14 }}>
              Manage your subscription via Paddle customer portal.
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: isPro || !subLoading ? 16 : 0 }}>
            {PRO_PERKS.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} color="#22C55E" strokeWidth={2.5} />
                <span style={{ fontSize: 13.5, color: T2 }}>{p}</span>
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
                  borderRadius: 12, fontSize: 15, fontWeight: 700, color: ACCENT,
                  textDecoration: 'none', boxSizing: 'border-box',
                }}
              >
                Manage Subscription
              </a>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading || !paddle}
                style={{
                  width: '100%', height: 48,
                  background: ACCENT, color: '#FFFFFF',
                  border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 700,
                  cursor: (loading || !paddle) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !paddle) ? 0.7 : 1,
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                } as React.CSSProperties}
              >
                {loading ? '...' : !paddle ? 'Loading...' : 'Upgrade to Pro →'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
