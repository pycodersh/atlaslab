import { KPANTRY_CHECKOUT_URL } from '@/lib/kpantry/purchase'

/**
 * K-Pantry 레시피 열람 범위 — 무료 10개, 나머지 93개는 Lifetime Pass 로 연다.
 *
 * 무료 10개는 is_popular 18개 가운데 카테고리가 고르게 섞이도록 골랐다(밥 3·고기 3·찌개 1·면 1·길거리 2).
 * 슬러그가 DB 에서 바뀌거나 지워지면 그 자리는 그냥 잠긴 채로 남는다 — 목록을 고칠 것.
 *
 * 주의: 이 잠금은 화면 잠금이다. 레시피 재료·조리 단계는 브라우저가 공개 키로 Supabase 에서 직접 읽으므로
 * 콘텐츠를 진짜로 막으려면 pantry_recipe_steps·pantry_recipe_ingredients 의 anon 읽기를 막고
 * kpantry_pass 쿠키를 확인하는 서버 경로로 옮겨야 한다.
 */
export const FREE_RECIPE_SLUGS: ReadonlySet<string> = new Set([
  'bibimbap',
  'kimchi-fried-rice',
  'gimbap',
  'bulgogi',
  'samgyeopsal',
  'haemul-pajeon',
  'kimchi-jjigae',
  'japchae',
  'tteokbokki',
  'hotteok',
])

export const TOTAL_RECIPES = 103

/**
 * 결제 링크(NEXT_PUBLIC_KPANTRY_CHECKOUT_URL)가 있을 때만 잠근다.
 * 링크 없이 배포되면 살 방법 없이 93개가 잠기므로, 그땐 전부 연다.
 */
export const RECIPE_LOCK_ENABLED = !!KPANTRY_CHECKOUT_URL

export const isFreeRecipe = (slug: string | null | undefined) => !!slug && FREE_RECIPE_SLUGS.has(slug)

/** 이 레시피를 열 수 있나 — 무료이거나 Pro 가 열려 있으면 */
export const canOpenRecipe = (slug: string | null | undefined, unlocked: boolean) =>
  !RECIPE_LOCK_ENABLED || unlocked || isFreeRecipe(slug)
