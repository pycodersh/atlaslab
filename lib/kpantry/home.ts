import { createPublicSupabase } from '@/lib/kpantry/publicSupabase'

/**
 * K-Pantry 홈(서버 렌더링) 데이터 — 하드코딩 없이 DB 에서 센다.
 *   recipeCount       레시피 총수 ("103 Korean home recipes")
 *   haveChips         3-1 "Cook with what I have" 고르기 칩 — 냉장고 재료(양념·pantry 제외) 중 레시피 등장 수 상위 8
 *   byIngredient      3-3 "Cook by ingredient" 타일 — 한국 요리 기본 재료 8개, 레시피 수 많은 순, 재료 가이드로 간다
 *   example           3번 카드 문구 "Got gochujang? See all 21 recipes that use it."
 */

export interface HomeIngredient {
  id: string
  name: string
  slug: string | null
  image_url: string | null
  recipes: number
}

/** 3-3 타일 — 예전 "Build Your Korean Pantry" 8개 그대로(전부 재료 가이드 페이지가 있다) */
const BY_INGREDIENT = ['Gochujang', 'Gochugaru', 'Soy Sauce', 'Sesame Oil', 'Doenjang', 'Kimchi', 'Tofu', 'Rice']
const EXAMPLE = 'Gochujang'

export async function getHomeData() {
  const supabase = createPublicSupabase()
  const [{ count: recipeCount }, { data: ingredients }, { data: links }] = await Promise.all([
    supabase.from('pantry_recipes').select('id', { count: 'exact', head: true }),
    supabase.from('pantry_ingredients').select('id, name, slug, image_url, category'),
    supabase.from('pantry_recipe_ingredients').select('ingredient_id, recipe_id').limit(5000),
  ])

  const perIngredient = new Map<string, Set<string>>()
  for (const l of links ?? []) {
    const set = perIngredient.get(l.ingredient_id) ?? new Set<string>()
    set.add(l.recipe_id)
    perIngredient.set(l.ingredient_id, set)
  }
  const all: (HomeIngredient & { category: string | null })[] = (ingredients ?? []).map(i => ({
    id: i.id, name: i.name, slug: i.slug, image_url: i.image_url, category: i.category,
    recipes: perIngredient.get(i.id)?.size ?? 0,
  }))

  const byIngredient = BY_INGREDIENT
    .map(name => all.find(i => i.name === name))
    .filter((i): i is (typeof all)[number] => !!i && !!i.slug && i.recipes > 0)
    .sort((a, b) => b.recipes - a.recipes)

  const haveChips = all
    .filter(i => i.recipes > 0 && i.category !== 'pantry' && !BY_INGREDIENT.includes(i.name))
    .sort((a, b) => b.recipes - a.recipes)
    .slice(0, 8)

  // 예시 재료의 레시피 수를 셀 수 없으면 null → 화면은 숫자 없는 고정 문구(0을 보여 주지 않는다)
  const ex = all.find(i => i.name === EXAMPLE)
  const strip = <T extends { category: string | null }>({ category: _c, ...rest }: T) => rest

  return {
    recipeCount: recipeCount ?? null,
    haveChips: haveChips.map(strip),
    byIngredient: byIngredient.map(strip),
    example: ex && ex.recipes > 0 ? { name: ex.name.toLowerCase(), recipes: ex.recipes } : null,
  }
}
