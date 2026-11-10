'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/kpantry/supabase'
import { getUserPlan } from '@/lib/kpantry/subscription'

/**
 * K-Pantry Pro 가 열려 있나 — 라이선스 패스(쿠키·저장된 키) 또는 계정 구독.
 * 카드 수십 장이 동시에 물어도 확인은 한 번만 한다(hasLicensePass 도 내부에서 한 번만 묻는다).
 */
let unlockedPromise: Promise<boolean> | null = null

function checkUnlocked(): Promise<boolean> {
  unlockedPromise ??= (async () => {
    try {
      const { data: { user } } = await createClient().auth.getUser()
      return (await getUserPlan(user?.id)) === 'pro'
    } catch {
      return false
    }
  })()
  return unlockedPromise
}

/** isUnlocked: null = 확인 중(잠금 표시를 깜빡이지 않게 호출부가 기다린다) */
export function useUnlocked() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    checkUnlocked().then(v => { if (alive) setIsUnlocked(v) })
    return () => { alive = false }
  }, [])

  /** 키 입력에 성공했을 때 — 새로 고치지 않고 이 화면의 잠금을 바로 푼다 */
  const markUnlocked = useCallback(() => {
    unlockedPromise = Promise.resolve(true)
    setIsUnlocked(true)
  }, [])

  return { isUnlocked, markUnlocked }
}
