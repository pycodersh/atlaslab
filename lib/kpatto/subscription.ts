'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { getLicenseState, LICENSE_EVENT, renewLicenseIfNeeded } from '@/lib/kpatto/license'

let renewStarted = false

/**
 * K-PATTO 프리미엄 여부(화면 표시용) — 셋 중 하나면 isPro:
 *   - 이 브라우저에 입력한 Gumroad 라이선스 키(lib/kpatto/license, 로그인 불필요)
 *   - Paddle 구독 기존 가입자(user_profiles.kpatto_pro)
 *   - 계정에 묶인 평생 이용권(kp_lifetime_access)
 * 실제 콘텐츠 권한은 서버 게이트(lib/kpatto/entitlement.ts)가 판정한다.
 * 키를 입력하면 LICENSE_EVENT 로 새로고침 없이 바로 바뀐다.
 * isLifetime 은 구독 관리 UI(갱신일·해지)를 숨기는 데 쓴다.
 */
export function useKPattoSubscription() {
  const { user, loading: authLoading } = useAuth()
  const [license,     setLicense]     = useState(false)
  const [accountPro,  setAccountPro]  = useState(false)
  const [accountLife, setAccountLife] = useState(false)
  const [subStatus,   setSubStatus]   = useState<string | null>(null)
  const [billingEnd,  setBillingEnd]  = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)

  // 브라우저 라이선스 — 처음 값 + 키 입력/해제/다른 탭 변경을 따라간다
  useEffect(() => {
    const sync = () => setLicense(getLicenseState().isPro)
    sync()
    if (!renewStarted) { renewStarted = true; void renewLicenseIfNeeded() }
    window.addEventListener(LICENSE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(LICENSE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEV_PRO === 'true') {
      setAccountPro(true)
      setSubStatus('active')
      setLoading(false)
      return
    }
    if (authLoading) return
    if (!user) {
      setAccountPro(false); setAccountLife(false)
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
      setAccountLife(!!lifetime)
      setAccountPro(row?.kpatto_pro === true)
      setSubStatus((row?.kpatto_subscription_status as string) ?? null)
      setBillingEnd((row?.kpatto_billing_end_at as string) ?? null)
      setLoading(false)
    })
  }, [user, authLoading])

  const isLifetime = license || accountLife
  const isPro = isLifetime || accountPro
  /** cancel_at_period_end 상태: 구독은 해지 예정 — 평생 이용권이 있으면 해지 예정이어도 계속 열린다 */
  const isCanceling = accountPro && !isLifetime && subStatus === 'canceled'

  return { isPro, isLifetime, subStatus, billingEnd, isCanceling, loading }
}
