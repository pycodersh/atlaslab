'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BottomNav from '@/components/kpantry/layout/BottomNav'
import HeroSection from '@/components/kpantry/recipe-detail/HeroSection'
import NutritionBar from '@/components/kpantry/recipe-detail/NutritionBar'
import IngredientsSection from '@/components/kpantry/recipe-detail/IngredientsSection'
import StepsSection from '@/components/kpantry/recipe-detail/StepsSection'
import {
  getRecipeDetail,
  isRecipeSaved,
  toggleSaveRecipe,
  addToShoppingList,
  getUserPantry,
} from '@/lib/kpantry/recipes'
import { getUserPlan, canAccess } from '@/lib/kpantry/subscription'
import { createClient } from '@/lib/kpantry/supabase'
import PaywallModal from '@/components/kpantry/paywall/PaywallModal'
import AuthModal from '@/components/kpantry/auth/AuthModal'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [recipe, setRecipe] = useState<any>(null)
  // UUID for DB operations (save, shopping list)
  const [recipeUuid, setRecipeUuid] = useState<string>('')
  const [saved, setSaved] = useState(false)
  const [userPantryIds, setUserPantryIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // getRecipeDetail now queries by slug column
      const recipeData = await getRecipeDetail(slug)
      setRecipe(recipeData)

      if (recipeData?.id) {
        setRecipeUuid(recipeData.id)
        if (user) {
          const [savedStatus, pantry, userPlan] = await Promise.all([
            isRecipeSaved(recipeData.id, user.id),
            getUserPantry(user.id),
            getUserPlan(user.id),
          ])
          setSaved(savedStatus)
          setUserPantryIds(pantry?.map((p: any) => p.ingredient_id) ?? [])
          setPlan(userPlan)
        }
      }

      setLoading(false)
    }
    load()
  }, [slug])

  const handleToggleSave = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setShowAuth(true)
      return
    }
    await toggleSaveRecipe(recipeUuid, user.id, saved)
    setSaved(!saved)
    showToast(saved ? 'Removed from saved' : 'Saved!')
  }

  const handleAddToShoppingList = async (ingredientId: string, name: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setShowAuth(true)
      return
    }
    if (!canAccess('shopping_list', plan)) {
      setShowPaywall(true)
      return
    }
    await addToShoppingList(ingredientId, recipeUuid, user.id)
    showToast(`${name} added to shopping list`)
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading recipe...</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A', fontWeight: 600 }}>Recipe not found</p>
        <button onClick={() => router.back()} style={{ fontFamily: 'Inter, sans-serif', color: '#2D5016', background: 'none', border: 'none', cursor: 'pointer' }}>
          Go back
        </button>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 120 }}>
      <HeroSection
        nameEn={recipe.name_en}
        nameKo={recipe.name_ko}
        description={recipe.description}
        category={recipe.category}
        cookingTimeMin={recipe.cooking_time_min}
        difficulty={recipe.difficulty}
        heroImageUrl={recipe.hero_image_url}
        isSaved={saved}
        onToggleSave={handleToggleSave}
      />

      <NutritionBar
        calories={recipe.calories}
        proteinG={recipe.protein_g}
        carbsG={recipe.carbs_g}
        fatG={recipe.fat_g}
        servings={recipe.servings}
      />

      <IngredientsSection
        recipeIngredients={recipe.pantry_recipe_ingredients ?? []}
        userPantryIds={userPantryIds}
        onAddToShoppingList={handleAddToShoppingList}
      />

      <div style={{ margin: '0 16px 20px', height: 1, backgroundColor: '#E8E0D0' }} />

      <StepsSection steps={recipe.pantry_recipe_steps ?? []} />

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        backgroundColor: '#F5F0E8',
        borderTop: '1px solid #E8E0D0',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        display: 'flex',
        gap: 10,
        zIndex: 50,
      }}>
        <button
          onClick={() => router.push('/kpantry/en/ingredients')}
          style={{
            flex: 1,
            padding: '14px',
            backgroundColor: '#FFFFFF',
            color: '#1A1A1A',
            border: '1.5px solid #E8E0D0',
            borderRadius: 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          🧺 I Have Ingredients
        </button>

        <button
          style={{
            flex: 1.5,
            padding: '14px',
            backgroundColor: '#C4622D',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          ▶ Watch How to Cook
        </button>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          borderRadius: 20,
          padding: '10px 20px',
          zIndex: 200,
          whiteSpace: 'nowrap',
        }}>
          {toastMsg}
        </div>
      )}

      {showPaywall && (
        <PaywallModal
          feature="shopping_list"
          onClose={() => setShowPaywall(false)}
          onSignIn={() => { setShowPaywall(false); setShowAuth(true) }}
        />
      )}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); window.location.reload() }}
        />
      )}

      <BottomNav />
    </div>
  )
}
