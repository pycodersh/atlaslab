'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function useKPattoSubscription() {
  const { user } = useAuth()
  const [isPro,      setIsPro]      = useState(false)
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

    createClient()
      .from('user_profiles')
      .select('kpatto_pro, kpatto_subscription_status, kpatto_billing_end_at')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) { setIsPro(false); setLoading(false); return }
        setIsPro(data?.kpatto_pro === true)
        setSubStatus((data as Record<string, unknown>)?.kpatto_subscription_status as string ?? null)
        setBillingEnd((data as Record<string, unknown>)?.kpatto_billing_end_at as string ?? null)
        setLoading(false)
      })
  }, [user])

  /** cancel_at_period_end 상태: Pro이지만 해지 예정 */
  const isCanceling = isPro && subStatus === 'canceled'

  return { isPro, subStatus, billingEnd, isCanceling, loading }
}
