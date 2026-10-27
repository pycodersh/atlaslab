import type { SupabaseClient } from '@supabase/supabase-js'
import { PASS_COOKIE, readPass } from './licensePass'

/**
 * K-PATTO 유료 콘텐츠(EP11~) 이용 권한 — 서버 게이트(에피소드 API · 스토리 페이지)가 같이 쓴다.
 *
 * 셋 중 하나면 열린다:
 *   - 라이선스 패스: Gumroad 키 확인 후 서버가 서명한 kpatto_pass 쿠키(로그인 불필요)
 *   - Paddle 구독(기존 구독자): user_profiles.kpatto_pro
 *   - 계정에 묶인 평생 이용권: kp_lifetime_access 본인 행
 * kp_lifetime_access 가 아직 없어도(마이그레이션 전) 오류를 "없음"으로 보고 나머지 판정은 그대로 둔다.
 * 클라이언트 쪽 표시는 lib/kpatto/subscription.ts 의 useKPattoSubscription — 거기 값은 힌트일 뿐이다.
 */
export async function hasKPattoAccess(
  supabase: SupabaseClient,
  passCookie: string | undefined,
): Promise<boolean> {
  if (readPass(passCookie)) return true

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const [{ data: profile }, { data: lifetime }] = await Promise.all([
    supabase.from('user_profiles').select('kpatto_pro').eq('id', user.id).maybeSingle(),
    supabase.from('kp_lifetime_access').select('user_id').eq('user_id', user.id).maybeSingle(),
  ])
  return profile?.kpatto_pro === true || !!lifetime
}

export { PASS_COOKIE }
