import { createClient } from '@/lib/kpantry/supabase'

export type Plan = 'free' | 'pro'

export async function getUserPlan(userId: string): Promise<Plan> {
  const supabase = createClient()
  const { data } = await supabase
    .from('subscriptions')
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

export async function upgradeToProDev(userId: string) {
  const supabase = createClient()
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: 'pro',
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
}
