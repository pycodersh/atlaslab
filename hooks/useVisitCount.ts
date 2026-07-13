'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  incrementLocalVisitCount,
  getLocalVisitCount,
  classifyVisitor,
  type VisitorType,
} from '@/lib/scenario/scenario-engine'

export function useVisitCount(userId: string | undefined): {
  visitCount: number
  visitorType: VisitorType
} {
  const [visitCount, setVisitCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function track() {
      if (userId) {
        const supabase = createClient()
        // Fetch current count then increment
        const { data } = await supabase
          .from('user_profiles')
          .select('visit_count, first_visit_at')
          .eq('id', userId)
          .single()

        const now = new Date().toISOString()
        const currentCount: number = (data as { visit_count?: number } | null)?.visit_count ?? 0
        const next = currentCount + 1

        await supabase
          .from('user_profiles')
          .update({
            visit_count:    next,
            last_visit_at:  now,
            ...((data as { first_visit_at?: string | null } | null)?.first_visit_at
              ? {}
              : { first_visit_at: now }),
          })
          .eq('id', userId)

        if (!cancelled) setVisitCount(next)
      } else {
        const next = incrementLocalVisitCount()
        if (!cancelled) setVisitCount(next)
      }
    }

    track()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    visitCount,
    visitorType: classifyVisitor(visitCount),
  }
}
