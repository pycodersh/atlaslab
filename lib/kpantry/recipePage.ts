import { createPublicSupabase } from '@/lib/kpantry/publicSupabase'
import { RECIPE_BUY_COLUMNS } from '@/lib/kpantry/buyInfo'

/**
 * 레시피 상세 서버 렌더링용 조회 — publishable 키라 RLS 가 그대로 걸린다.
 * 조리 단계는 무료 레시피만 돌아오고, 잠긴 93개는 빈 배열이다(서버 HTML 에 넣지 않는다).
 * 잠금을 연 사용자는 화면에서 /api/kpantry/recipe-steps 로 따로 받는다.
 */

export interface RecipePageData {
  id: string
  slug: string
  name_en: string
  name_ko: string | null
  description: string | null
  category: string | null
  hero_image_url: string | null
  cooking_time_min: number | null
  difficulty: string | null
  servings: number | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  is_free: boolean
  pantry_recipe_ingredients: any[]
  pantry_recipe_steps: any[]
}

export async function getRecipeSlugs(): Promise<string[]> {
  const { data, error } = await createPublicSupabase().from('pantry_recipes').select('slug')
  if (error) throw error
  return (data ?? []).map(r => r.slug).filter(Boolean)
}

export async function getRecipeForPage(slug: string): Promise<RecipePageData | null> {
  const { data, error } = await createPublicSupabase()
    .from('pantry_recipes')
    .select(`
      id, slug, name_en, name_ko, description, category,
      hero_image_url, cooking_time_min, difficulty, servings,
      calories, protein_g, carbs_g, fat_g, is_free,
      pantry_recipe_ingredients(
        id, amount, type, sort_order,
        pantry_ingredients(id, name, name_ko, image_url, ${RECIPE_BUY_COLUMNS})
      ),
      pantry_recipe_steps(id, step_order, title, description, image_url)
    `)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const recipe = data as unknown as RecipePageData
  recipe.pantry_recipe_ingredients?.sort((a, b) => a.sort_order - b.sort_order)
  recipe.pantry_recipe_steps?.sort((a, b) => a.step_order - b.step_order)
  return recipe
}
