'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'

export type Subscription = {
  status: SubscriptionStatus
  plan: 'monthly' | 'annual' | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

const DEFAULT: Subscription = {
  status: 'free',
  plan: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSubscription({
          status: data.status as SubscriptionStatus,
          plan: data.plan,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
        })
      }
      setLoading(false)
    }

    load()
  }, [])

  const isPro = subscription.status === 'active' || subscription.status === 'trialing'
  return { subscription, isPro, loading }
}
