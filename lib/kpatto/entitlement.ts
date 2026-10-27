import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * K-PATTO 유료 콘텐츠(EP11~) 이용 권한 — 서버 게이트(에피소드 API · 스토리 페이지)가 같이 쓴다.
 *
 * 둘 중 하나면 열린다:
 *   - Paddle 구독: user_profiles.kpatto_pro
 *   - Gumroad 평생 이용권(WebApp Pass · Bundle): kp_lifetime_access 에 본인 행
 * kp_lifetime_access 가 아직 없어도(마이그레이션 전) 오류를 "이용권 없음"으로 보고 구독 판정은 그대로 둔다.
 * 클라이언트 쪽 같은 규칙은 lib/kpatto/subscription.ts 의 useKPattoSubscription.
 */
export async function hasKPattoAccess(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const [{ data: profile }, { data: lifetime }] = await Promise.all([
    supabase.from('user_profiles').select('kpatto_pro').eq('id', userId).maybeSingle(),
    supabase.from('kp_lifetime_access').select('user_id').eq('user_id', userId).maybeSingle(),
  ])
  return profile?.kpatto_pro === true || !!lifetime
}
