'use client'

import { createClient } from '@/lib/supabase/client'

let initPromise: Promise<string | null> | null = null

/**
 * 익명 로그인으로 Guest 세션을 확보한다.
 * 이미 세션이 있으면 재사용, 없으면 signInAnonymously() 호출.
 * 호출은 중복 방지를 위해 한 번만 실행되며 Promise를 공유한다.
 */
export function ensureGuestSession(): Promise<string | null> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user?.id) return session.user.id

    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) {
      console.error('[guest-auth] signInAnonymously failed:', error?.message, error?.status)
      initPromise = null
      return null
    }
    return data.user.id
  })()

  return initPromise
}
