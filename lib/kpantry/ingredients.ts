import { createClient } from '@/lib/kpantry/supabase'

export async function getIngredients(category?: string) {
  const supabase = createClient()
  let query = supabase
    .from('pantry_ingredients')
    .select('id, name, name_ko, category, image_url, aliases')
    .order('name')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data
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
