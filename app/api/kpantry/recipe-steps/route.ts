import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { KPANTRY_PASS_COOKIE, readKPantryPass } from '@/lib/kpatto/licensePass'
import { RECIPE_LOCK_ENABLED, isFreeRecipe } from '@/lib/kpantry/access'

/**
 * GET /api/kpantry/recipe-steps?slug=… — 레시피 조리 단계.
 *
 * pantry_recipe_steps 는 RLS 로 막혀 있다(scripts/sql/kpantry-recipe-lock-04-rls.sql):
 * 공개 키로는 무료 레시피와 로그인 Pro 구독자만 읽힌다. Gumroad 패스(httpOnly 쿠키 kpantry_pass,
 * 로그인 없음)는 RLS 가 볼 수 없어서 이 경로가 서명을 확인한 뒤 서비스 롤로 읽어 준다.
 *
 * 열어 주는 경우: 잠금 꺼짐(결제 링크 없음) · 무료 레시피 · 유효한 K-Pantry 패스 · 활성 Pro 구독 계정.
 * 그 밖에는 403 — 단계 내용은 응답에 넣지 않는다.
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug')?.trim() ?? ''
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: 'bad slug' }, { status: 400 })
  }

  const allowed = !RECIPE_LOCK_ENABLED || isFreeRecipe(slug) || hasPass(req) || (await hasProAccount())
  if (!allowed) {
    return NextResponse.json({ error: 'locked' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } })
  }

  const admin = createAdminClient()
  const { data: recipe } = await admin.from('pantry_recipes').select('id').eq('slug', slug).maybeSingle()
  if (!recipe) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { data: steps, error } = await admin
    .from('pantry_recipe_steps')
    .select('id, step_order, title, description, image_url')
    .eq('recipe_id', recipe.id)
    .order('step_order')
  if (error) return NextResponse.json({ error: 'unavailable' }, { status: 500 })

  // 사람마다 답이 다르다 — 공유 캐시에 남기지 않는다
  return NextResponse.json({ steps: steps ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } })
}

function hasPass(req: Request): boolean {
  const raw = req.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${KPANTRY_PASS_COOKIE}=([^;]+)`))?.[1]
  return !!readKPantryPass(raw ? decodeURIComponent(raw) : null)
}

async function hasProAccount(): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    // pantry_subscriptions 는 본인 행 읽기만 열려 있고 쓰기는 서비스 롤 전용이다 — 사용자가 직접 Pro 를 만들 수 없다
    const { data } = await supabase
      .from('pantry_subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()
    return !!data && data.plan === 'pro' && data.status === 'active'
      && (!data.expires_at || new Date(data.expires_at) > new Date())
  } catch {
    return false
  }
}
