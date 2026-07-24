'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePaddle } from '@/hooks/usePaddle'
import { getPaddle } from '@/lib/paddle/client'

const ACCENT = '#D4873A'
const T1 = '#111111'
const T2 = '#666666'

const KPATTO_PRICE_ID = 'pri_01ky74gvff7x82ehk7csbaztx1'

const PERKS = [
  'Unlimited access to EP06 and beyond',
  'New episodes unlocked automatically',
  'Full access to all challenges',
  'Unlimited bookmarks',
  'Full audio access',
]

interface Props {
  onDismiss: () => void
}

export function KPattoPaywall({ onDismiss }: Props) {
  const { user } = useAuth()
  const paddle = usePaddle()
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    if (loading) return

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
        items: [{ priceId: KPATTO_PRICE_ID, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        customData: user?.id ? { user_id: user.id } : undefined,
        settings: {
          displayMode: 'overlay',
          locale: 'ko',
        },
      })
    } catch (err) {
      console.error('[KPattoPaywall] Checkout.open error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      zIndex: 200,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#FFFFFF',
        borderRadius: '24px 24px 0 0',
        padding: '32px 24px 48px',
        boxSizing: 'border-box',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#FFF7EE', border: `1.5px solid ${ACCENT}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={28} color={ACCENT} strokeWidth={2} />
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T1, marginBottom: 6 }}>
            You need Pro membership from EP06
          </div>
          <div style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>
            Learn all episodes without limits with K-PATTO Pro
          </div>
        </div>

        {/* Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {PERKS.map(perk => (
            <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, color: '#22C55E' }}>✓</span>
              <span style={{ fontSize: 14, color: T1 }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: '100%', height: 52,
            background: ACCENT, color: '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: 12,
            fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          {loading ? '...' : 'Start for $2.99/month'}
        </button>

        <button
          onClick={onDismiss}
          style={{
            width: '100%', height: 52,
            background: 'transparent',
            border: `1px solid ${ACCENT}`,
            borderRadius: 14,
            fontSize: 16, fontWeight: 700,
            color: ACCENT,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Later
        </button>
      </div>
    </div>
  )
}
