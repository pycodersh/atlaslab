import { createClient } from '@/lib/kpantry/supabase'

export async function getRecipes(category?: string) {
  const supabase = createClient()
  let query = supabase
    .from('recipes')
    .select(`
      id, slug, name_en, name_ko, description, category,
      hero_image_url, cooking_time_min, difficulty,
      calories, is_popular, is_featured, is_recently_added
    `)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFeaturedRecipe() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, name_en, name_ko, description, cooking_time_min, calories, hero_image_url')
    .eq('is_featured', true)
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function getPopularRecipes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, name_en, name_ko, description, cooking_time_min, calories, difficulty, hero_image_url')
    .eq('is_popular', true)
    .limit(8)
  if (error) throw error
  return data
}

export async function getRecentRecipes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, name_en, name_ko, description, cooking_time_min, calories, hero_image_url')
    .eq('is_recently_added', true)
    .limit(4)
  if (error) throw error
  return data
}

export async function getUserPantry(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_pantry')
    .select('ingredient_id, ingredients(id, name, name_ko)')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

// slug 컬럼으로 조회 (UUID → slug 전환)
export async function getRecipeDetail(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id, slug, name_en, name_ko, description, category,
      hero_image_url, cooking_time_min, difficulty, servings,
      calories, protein_g, carbs_g, fat_g,
      recipe_ingredients(
        id, amount, type, sort_order,
        ingredients(id, name, name_ko, image_url)
      ),
      recipe_steps(
        id, step_order, title, description, image_url
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error

  if (data?.recipe_ingredients) {
    data.recipe_ingredients.sort((a: any, b: any) => a.sort_order - b.sort_order)
  }
  if (data?.recipe_steps) {
    data.recipe_steps.sort((a: any, b: any) => a.step_order - b.step_order)
  }

  return data
}

export async function isRecipeSaved(recipeId: string, userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_saved_recipes')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .single()
  return !!data
}

export async function toggleSaveRecipe(recipeId: string, userId: string, currentlySaved: boolean) {
  const supabase = createClient()
  if (currentlySaved) {
    await supabase
      .from('user_saved_recipes')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
  } else {
    await supabase
      .from('user_saved_recipes')
      .insert({ recipe_id: recipeId, user_id: userId })
  }
}

export async function addToShoppingList(
  ingredientId: string,
  recipeId: string,
  userId: string,
  quantity?: string
) {
  const supabase = createClient()
  await supabase
    .from('shopping_list')
    .upsert({
      ingredient_id: ingredientId,
      recipe_id: recipeId,
      user_id: userId,
      quantity,
      is_checked: false,
    }, { onConflict: 'user_id,ingredient_id' })
}

export async function getRecipesByIngredient(ingredientId: string) {
  const supabase = createClient()

  const { data: riData, error: riError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .eq('ingredient_id', ingredientId)
  if (riError) throw riError

  const recipeIds = riData?.map((r: any) => r.recipe_id) ?? []
  if (recipeIds.length === 0) return []

  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, name_en, name_ko, description, category, hero_image_url, cooking_time_min, difficulty, calories')
    .in('id', recipeIds)
    .order('name_en')
  if (error) throw error
  return data ?? []
}

export async function getPantryMatches(userId: string) {
  const supabase = createClient()

  const { data: pantry } = await supabase
    .from('user_pantry')
    .select('ingredient_id')
    .eq('user_id', userId)

  const pantryIds = pantry?.map(p => p.ingredient_id) ?? []

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`
      id, slug, name_en, name_ko, cooking_time_min, difficulty, hero_image_url, category,
      recipe_ingredients!inner(ingredient_id, type, ingredients(id, name))
    `)

  if (error) throw error

  const results = recipes.map(recipe => {
    const essentials = recipe.recipe_ingredients.filter(
      (ri: any) => ri.type === 'essential'
    )
    const missing = essentials.filter(
      (ri: any) => !pantryIds.includes(ri.ingredient_id)
    )
    const missingIngredients = missing.map((ri: any) => ri.ingredients?.name).filter(Boolean)

    return {
      ...recipe,
      missingCount: missing.length,
      missingIngredients,
    }
  })

  return {
    ready: results.filter(r => r.missingCount === 0),
    addOne: results.filter(r => r.missingCount === 1),
    addTwo: results.filter(r => r.missingCount === 2),
  }
}
