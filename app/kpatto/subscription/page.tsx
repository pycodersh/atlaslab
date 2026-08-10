'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Check } from 'lucide-react'
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
  'EP 11~ unlimited access',
  'New episodes auto-unlocked',
  'Full challenge access',
  'Full audio access',
]

// 날짜 포맷: "Aug 6, 2026"
function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return null }
}

const SUPPORT_EMAIL = 'contact@atlaslabstudios.com'

// ── Pro 상태 화면 ─────────────────────────────────────────────────────────────
function ProView({
  billingEnd,
  isCanceling,
}: {
  billingEnd: string | null
  isCanceling: boolean
}) {
  const [managing,     setManaging]     = useState(false)
  const [showContact,  setShowContact]  = useState(false)
  const dateStr = fmtDate(billingEnd)

  const handleManage = useCallback(async () => {
    if (managing) return
    setManaging(true)
    try {
      const res  = await fetch('/kpatto/api/paddle-portal')
      const json = await res.json() as { url?: string; fallback?: boolean }

      if (json.url) {
        window.open(json.url, '_blank', 'noopener,noreferrer')
      } else {
        // PADDLE_API_KEY 미설정 → 동작하지 않는 외부 링크 대신 문의 안내 표시
        setShowContact(true)
      }
    } catch {
      setShowContact(true)
    } finally {
      setManaging(false)
    }
  }, [managing])

  return (
    <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Pro 헤더 */}
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        border: `1.5px solid ${ACCENT}`,
        padding: '20px 20px 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={ACCENT} strokeWidth={1.8} />
            <span style={{ fontSize: 18, fontWeight: 800, color: T1 }}>K-PATTO Pro</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            color: '#16A34A', background: '#F0FDF4',
            border: '1px solid #BBF7D0', borderRadius: 20, padding: '3px 10px',
          }}>
            Active
          </span>
        </div>

        {/* 갱신일 / 해지 예정 */}
        <div style={{ fontSize: 13, color: T2 }}>
          {isCanceling
            ? `Ends on ${dateStr ?? '—'}`
            : dateStr
              ? `Renews on ${dateStr}`
              : 'Subscription active'}
        </div>
      </div>

      {/* Manage Subscription 버튼 또는 문의 안내 */}
      {showContact ? (
        <div style={{
          borderRadius: 12, border: `1.5px solid ${BORDER}`,
          padding: '16px 20px', textAlign: 'center',
          background: '#FFFFFF',
        }}>
          <p style={{ fontSize: 13, color: T2, margin: '0 0 10px', lineHeight: 1.5 }}>
            To cancel or update your plan,<br />please contact us:
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{
              fontSize: 14, fontWeight: 600, color: ACCENT,
              textDecoration: 'none',
            }}
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      ) : (
        <button
          onClick={handleManage}
          disabled={managing}
          style={{
            width: '100%', height: 48,
            background: 'transparent', border: `1.5px solid ${ACCENT}`,
            borderRadius: 12, fontSize: 15, fontWeight: 600, color: ACCENT,
            cursor: managing ? 'not-allowed' : 'pointer',
            opacity: managing ? 0.6 : 1,
            fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
          } as React.CSSProperties}
        >
          {managing ? '…' : 'Manage Subscription'}
        </button>
      )}
    </div>
  )
}

// ── Free 상태 화면 ────────────────────────────────────────────────────────────
function FreeView({ onUpgrade, upgrading }: { onUpgrade: () => void; upgrading: boolean }) {
  return (
    <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 현재 플랜 한 줄 */}
      <div style={{ fontSize: 14, color: T2 }}>You&apos;re on the Free plan.</div>

      {/* Pro 카드 */}
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        border: `1.5px solid ${ACCENT}`,
        padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={ACCENT} strokeWidth={1.8} />
            <span style={{ fontSize: 18, fontWeight: 800, color: T1 }}>K-PATTO Pro</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>$2.99/mo</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {PRO_PERKS.map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={14} color={ACCENT} strokeWidth={2.5} />
              <span style={{ fontSize: 14, color: T2 }}>{p}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onUpgrade}
          disabled={upgrading}
          style={{
            width: '100%', height: 48,
            background: ACCENT, color: '#FFFFFF',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 600,
            cursor: upgrading ? 'not-allowed' : 'pointer',
            opacity: upgrading ? 0.7 : 1,
            fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          } as React.CSSProperties}
        >
          {upgrading ? '...' : 'Upgrade to Pro →'}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function KPattoSubscriptionPage() {
  const { user } = useAuth()
  const { isPro, isCanceling, billingEnd, loading: subLoading } = useKPattoSubscription()
  const paddle = usePaddle()
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()

  const handleUpgrade = useCallback(async () => {
    if (upgrading) return
    if (!user?.id) { router.push('/kpatto'); return }

    const priceId = process.env.NEXT_PUBLIC_PADDLE_KPATTO_PRICE_ID
    if (!priceId || priceId.includes('REPLACE')) {
      alert('Payment not configured. Please try again later.')
      return
    }

    setUpgrading(true)
    try {
      let p = paddle
      if (!p) {
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 100))
          p = await getPaddle()
          if (p) break
        }
      }
      if (!p) { alert('Payment system loading. Please try again in a moment.'); return }

      await p.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user.email ? { email: user.email } : undefined,
        customData: { user_id: user.id },
        settings: { displayMode: 'overlay', locale: 'en' },
      })
    } finally {
      setUpgrading(false)
    }
  }, [upgrading, user, paddle, router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: 40 }}>
      <KPattoHeader />

      {subLoading ? (
        <div style={{ padding: '48px 16px', textAlign: 'center', color: T2, fontSize: 14 }}>…</div>
      ) : isPro ? (
        <ProView billingEnd={billingEnd} isCanceling={isCanceling} />
      ) : (
        <FreeView onUpgrade={handleUpgrade} upgrading={upgrading} />
      )}
    </div>
  )
}
