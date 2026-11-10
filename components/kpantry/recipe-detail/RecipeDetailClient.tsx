'use client'
import { Lock, Play, ShoppingBasket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import UnlockModal from '@/components/kpantry/paywall/UnlockModal'
import { isFreeRecipe, TOTAL_RECIPES } from '@/lib/kpantry/access'
import { KPANTRY_PRICE } from '@/lib/kpantry/purchase'
import { useUnlocked } from '@/lib/kpantry/useUnlocked'

interface Props {
  /** 서버 컴포넌트가 존재 여부를 확인한 레시피 슬러그 */
  slug: string
}

export default function RecipeDetailClient({ slug }: Props) {
  const router = useRouter()

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
  const { isUnlocked, markUnlocked } = useUnlocked()
  // 무료 10개가 아니고 Pro 도 아니면 재료·조리 단계를 가린다(확인 중엔 가리지 않고 기다린다)
  const locked = isUnlocked === false && !isFreeRecipe(slug)
  const [showUnlock, setShowUnlock] = useState(true)

  useEffect(() => {
    async function load() {
      try {
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
      } catch {
        // getRecipeDetail 은 행이 없거나 조회 실패 시 throw 한다.
        // 잡지 않으면 "Loading recipe..." 상태로 영구히 멈춘다.
        setRecipe(null)
      } finally {
        setLoading(false)
      }
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

  if (loading || (isUnlocked === null && !isFreeRecipe(slug))) {
    return (
      <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading recipe...</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A', fontWeight: 600 }}>Recipe not found</p>
        <button onClick={() => router.back()} style={{ fontFamily: 'Inter, sans-serif', color: 'var(--kp-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Go back
        </button>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 120 }}>
      {/* PC 에서도 모바일 폭(430px) 한 줄로 가운데 — 아래 고정 액션 바와 같은 폭. 사진이 늘어나 흐려지지 않는다 */}
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
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

        {locked ? (
          <div style={{
            margin: '8px 16px 24px', padding: '28px 20px', textAlign: 'center',
            backgroundColor: '#FFFFFF', border: '1px solid var(--kp-rule)', borderRadius: 18,
          }}>
            <span style={{
              width: 44, height: 44, borderRadius: 999, margin: '0 auto 12px',
              backgroundColor: 'var(--kp-surface-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={20} strokeWidth={2} color="#1C1917" aria-hidden="true" />
            </span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1917', margin: 0 }}>
              Ingredients and steps are locked
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#78716C', margin: '6px 0 16px', lineHeight: 1.5 }}>
              Unlock all {TOTAL_RECIPES} recipes with a one-time Lifetime Pass.
            </p>
            <button
              type="button"
              onClick={() => setShowUnlock(true)}
              style={{
                padding: '12px 20px', backgroundColor: 'var(--kp-accent)', color: '#FFFFFF',
                border: 'none', borderRadius: 12, fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Unlock Lifetime Access — {KPANTRY_PRICE}
            </button>
          </div>
        ) : (
          <>
            <IngredientsSection
              recipeIngredients={recipe.pantry_recipe_ingredients ?? []}
              userPantryIds={userPantryIds}
              onAddToShoppingList={handleAddToShoppingList}
            />

            <div style={{ margin: '0 16px 20px', height: 1, backgroundColor: 'var(--kp-rule)' }} />

            <StepsSection slug={recipe.slug} steps={recipe.pantry_recipe_steps ?? []} />
          </>
        )}
      </div>

      {/* 상세 화면은 이 액션 바가 하단을 차지한다 — 전역 BottomNav 는 두지 않는다(둘 다 bottom:0 고정이라 겹쳤다).
          뒤로 가기는 HeroSection 의 버튼이 맡는다 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        backgroundColor: 'var(--kp-bg)',
        borderTop: '1px solid var(--kp-rule)',
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
            padding: '14px 10px',
            whiteSpace: 'nowrap',
            backgroundColor: '#FFFFFF',
            color: '#1A1A1A',
            border: '1.5px solid var(--kp-rule)',
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
          <ShoppingBasket size={16} strokeWidth={2} aria-hidden="true" />I Have Ingredients
        </button>

        <button
          style={{
            flex: 1,
            padding: '14px 10px',
            whiteSpace: 'nowrap',
            backgroundColor: 'var(--kp-accent)',
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
          <Play size={16} strokeWidth={2} aria-hidden="true" />Watch How to Cook
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
      {locked && showUnlock && (
        <UnlockModal
          recipeName={recipe.name_en}
          onClose={() => setShowUnlock(false)}
          onUnlocked={() => { markUnlocked(); setShowUnlock(false) }}
        />
      )}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); window.location.reload() }}
        />
      )}
    </div>
  )
}
