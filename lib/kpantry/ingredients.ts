import { createClient } from '@/lib/kpantry/supabase'

/**
 * 재료 선택 화면 목록 — 레시피에 하나라도 연결된 재료만 준다.
 * 마스터(pantry_ingredients)에는 레시피가 없는 재료·옛 seed 중복이 섞여 있어서, 고르면 아무것도 안 나오는
 * 재료를 보여 주지 않으려는 것이다(2026-11-01 실측 95개 중 84개만 연결). 행은 지우지 않는다.
 */
export async function getIngredients(category?: string) {
  const supabase = createClient()
  let query = supabase
    .from('pantry_ingredients')
    .select('id, name, name_ko, category, image_url, aliases')
    .order('name')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const [{ data, error }, { data: links, error: linkError }] = await Promise.all([
    query,
    supabase.from('pantry_recipe_ingredients').select('ingredient_id').limit(10000),
  ])
  if (error) throw error
  if (linkError) throw linkError
  const used = new Set((links ?? []).map(l => l.ingredient_id))
  return (data ?? []).filter(ing => used.has(ing.id))
}

export async function savePantry(userId: string, ingredientIds: string[]) {
  const supabase = createClient()

  await supabase.from('pantry_user_items').delete().eq('user_id', userId)

  if (ingredientIds.length === 0) return

  const rows = ingredientIds.map(id => ({
    user_id: userId,
    ingredient_id: id,
  }))

  const { error } = await supabase.from('pantry_user_items').insert(rows)
  if (error) throw error
}

export async function loadPantry(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pantry_user_items')
    .select('ingredient_id')
    .eq('user_id', userId)
  if (error) throw error
  return data?.map(p => p.ingredient_id) ?? []
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// URL 의 ?ids=a,b,c 를 재료 UUID 배열로 — 형식이 틀린 값과 중복은 버린다
export function parseIngredientIds(raw: string | null): string[] {
  if (!raw) return []
  const ids = raw.split(',').map(s => s.trim()).filter(s => UUID_RE.test(s))
  return [...new Set(ids)].slice(0, 200)
}

// 이 기기에서 마지막으로 고른 재료 — 재료 화면을 다시 열 때 이어서 보여 준다(로그인 불필요)
const SELECTION_KEY = 'kpantry_selected_ingredients'

export function readSelectedIngredients(): string[] {
  try {
    return parseIngredientIds(localStorage.getItem(SELECTION_KEY))
  } catch {
    return []
  }
}

export function writeSelectedIngredients(ids: string[]) {
  try {
    if (ids.length > 0) localStorage.setItem(SELECTION_KEY, ids.join(','))
    else localStorage.removeItem(SELECTION_KEY)
  } catch { /* 저장 못 해도 이번 화면은 그대로 동작한다 */ }
}

export async function getPantryEssentials(names: string[]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pantry_ingredients')
    .select('id, name, name_ko, image_url')
    .in('name', names)
  if (error) throw error
  return data ?? []
}

export async function getIngredientById(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('pantry_ingredients')
    .select('id, name, name_ko, image_url')
    .eq('id', id)
    .single()
  return data
}
