'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

/**
 * K-PATTO 프리미엄 여부 — Paddle 구독(user_profiles.kpatto_pro) 또는
 * Gumroad 평생 이용권(kp_lifetime_access 본인 행) 중 하나면 isPro.
 * 서버 게이트의 같은 규칙은 lib/kpatto/entitlement.ts.
 * isLifetime 은 구독 관리 UI(해지·결제일)를 숨기는 데 쓴다.
 */
export function useKPattoSubscription() {
  const { user } = useAuth()
  const [isPro,      setIsPro]      = useState(false)
  const [isLifetime, setIsLifetime] = useState(false)
  const [subStatus,  setSubStatus]  = useState<string | null>(null)
  const [billingEnd, setBillingEnd] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEV_PRO === 'true') {
      setIsPro(true)
      setSubStatus('active')
      setLoading(false)
      return
    }

    if (!user) {
      setIsPro(false)
      setLoading(false)
      return
    }

    const sb = createClient()
    Promise.all([
      sb.from('user_profiles')
        .select('kpatto_pro, kpatto_subscription_status, kpatto_billing_end_at')
        .eq('id', user.id)
        .maybeSingle(),
      // 테이블이 아직 없으면 error — 이용권 없음으로 보고 구독 판정은 그대로 둔다
      sb.from('kp_lifetime_access').select('user_id').eq('user_id', user.id).maybeSingle(),
    ]).then(([{ data }, { data: lifetime }]) => {
      const row = data as Record<string, unknown> | null
      const life = !!lifetime
      setIsLifetime(life)
      setIsPro(row?.kpatto_pro === true || life)
      setSubStatus((row?.kpatto_subscription_status as string) ?? null)
      setBillingEnd((row?.kpatto_billing_end_at as string) ?? null)
      setLoading(false)
    })
  }, [user])

  /** cancel_at_period_end 상태: Pro이지만 해지 예정 — 평생 이용권이 있으면 해지 예정이어도 계속 열린다 */
  const isCanceling = isPro && !isLifetime && subStatus === 'canceled'

  return { isPro, isLifetime, subStatus, billingEnd, isCanceling, loading }
}
