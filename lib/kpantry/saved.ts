import { createClient } from '@/lib/kpantry/supabase'

export async function getSavedRecipes(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_saved_recipes')
    .select(`
      id, created_at,
      recipes(
        id, slug, name_en, name_ko, description,
        cooking_time_min, difficulty, hero_image_url, calories
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getShoppingList(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shopping_list')
    .select(`
      id, quantity, is_checked, created_at,
      ingredients(id, name, name_ko, image_url),
      recipes(id, name_en)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function toggleShoppingItem(itemId: string, isChecked: boolean) {
  const supabase = createClient()
  await supabase
    .from('shopping_list')
    .update({ is_checked: isChecked })
    .eq('id', itemId)
}

export async function deleteShoppingItem(itemId: string) {
  const supabase = createClient()
  await supabase.from('shopping_list').delete().eq('id', itemId)
}

export async function clearCheckedItems(userId: string) {
  const supabase = createClient()
  await supabase
    .from('shopping_list')
    .delete()
    .eq('user_id', userId)
    .eq('is_checked', true)
}

export async function unsaveRecipe(userId: string, recipeId: string) {
  const supabase = createClient()
  await supabase
    .from('user_saved_recipes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
}
