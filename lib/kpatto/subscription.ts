'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function useKPattoSubscription() {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsPro(false)
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('profiles')
      .select('kpatto_pro')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setIsPro(data?.kpatto_pro === true)
        setLoading(false)
      })
      .catch(() => {
        setIsPro(false)
        setLoading(false)
      })
  }, [user])

  return { isPro, loading }
}
