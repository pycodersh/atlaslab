'use client'

import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPattoUnlockPanel } from '@/components/kpatto/KPattoUnlockPanel'

import { KP } from '@/lib/kpatto/theme'
const ACCENT = KP.primary
const T1 = '#111111'
const T2 = '#666666'
const BORDER = '#E8E4DF'

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
/** Gumroad 평생 이용권(WebApp Pass · Bundle) — 갱신·해지가 없는 일회성 구매 */
function LifetimeView() {
  return (
    <div style={{ padding: '24px 16px 0' }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        border: `1.5px solid ${ACCENT}`,
        padding: '20px 20px 18px',
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
            Lifetime
          </span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: T2 }}>
          Lifetime access from your Gumroad purchase. No renewals, nothing to cancel — all 100 episodes stay unlocked on this account.
        </div>
      </div>
    </div>
  )
}

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

// ── Page ──────────────────────────────────────────────────────────────────────
/**
 * 멤버십 화면.
 * 앱 안 결제(Paddle 월 구독 $2.99)는 폐지 — 무료 사용자에게는 판매 랜딩·라이선스 키 안내(KPattoUnlockPanel)만 보인다.
 * 기존 월 구독자는 ProView 의 구독 관리(Paddle 포털)로 계속 해지·결제 수단 변경을 할 수 있다.
 */
export default function KPattoSubscriptionPage() {
  const { isPro, isLifetime, subStatus, isCanceling, billingEnd, loading: subLoading } = useKPattoSubscription()
  // 평생 이용권이 있어도 Paddle 구독이 살아 있으면 구독 관리(해지)를 보여 줘야 한다
  const hasLiveSubscription = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'past_due'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: 40 }}>
      <KPattoHeader />

      {subLoading ? (
        <div style={{ padding: '48px 16px', textAlign: 'center', color: T2, fontSize: 14 }}>…</div>
      ) : isLifetime && !hasLiveSubscription ? (
        // 평생 이용권(라이선스 키 · 계정)만 있는 사람 — 갱신일·구독 관리 버튼은 해당이 없다
        <LifetimeView />
      ) : isPro ? (
        <ProView billingEnd={billingEnd} isCanceling={isCanceling} />
      ) : (
        <div style={{ padding: '28px 20px 0', maxWidth: 480, margin: '0 auto' }}>
          <KPattoUnlockPanel />
        </div>
      )}
    </div>
  )
}
