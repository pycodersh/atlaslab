import { createClient } from '@/lib/kpantry/supabase'
import { hasLicensePass } from '@/lib/kpantry/license'

export type Plan = 'free' | 'pro'

/**
 * Pro 판정 — Gumroad 라이선스 패스(로그인 불필요) 또는 계정의 pantry_subscriptions.
 * userId 가 없으면(게스트) 패스만 본다.
 */
export async function getUserPlan(userId?: string): Promise<Plan> {
  if (await hasLicensePass()) return 'pro'
  if (!userId) return 'free'

  const supabase = createClient()
  const { data } = await supabase
    .from('pantry_subscriptions')
    .select('plan, status, expires_at')
    .eq('user_id', userId)
    .single()

  if (!data) return 'free'
  if (data.plan === 'pro' && data.status === 'active') {
    if (data.expires_at && new Date(data.expires_at) < new Date()) return 'free'
    return 'pro'
  }
  return 'free'
}

export function canAccess(feature: string, plan: Plan): boolean {
  const FREE_FEATURES = ['explore', 'recipe_detail', 'ready_to_cook', 'i_want_to_cook']
  const PRO_FEATURES = ['pantry_plus1', 'pantry_plus2', 'shopping_list', 'find_stores', 'save_pantry', 'saved_unlimited']

  if (FREE_FEATURES.includes(feature)) return true
  if (PRO_FEATURES.includes(feature)) return plan === 'pro'
  return false
}
