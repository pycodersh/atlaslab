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
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // force-static 페이지의 fetch 는 Next 데이터 캐시에 들어가고, 그 캐시는 빌드·배포를 넘어 남는다
      // (2026-11-18 실측: DB 의 weee_query 를 고친 뒤 새로 빌드해도 옛 값이 나왔다).
      // 응답은 캐시하지 않고 페이지 단위 ISR(revalidate)만 쓴다 — 빌드마다, 재생성마다 DB 를 새로 읽는다.
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    },
  )
}
