import { createClient } from '@supabase/supabase-js'

/**
 * 서버 렌더링(SSG·ISR)용 Supabase 클라이언트 — 쿠키 없는 publishable 키.
 * 공개 페이지에 service_role 을 들이지 않는다. RLS 그대로 적용된다
 * (예: pantry_recipe_steps 는 무료 레시피 것만 돌아온다 — scripts/sql/kpantry-recipe-lock-04-rls.sql).
 */
export function createPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
