'use client'
import { Lock, ShoppingBasket } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RecipePageData } from '@/lib/kpantry/recipePage'
import HeroSection from '@/components/kpantry/recipe-detail/HeroSection'
import NutritionBar from '@/components/kpantry/recipe-detail/NutritionBar'
import IngredientsSection from '@/components/kpantry/recipe-detail/IngredientsSection'
import StepsSection from '@/components/kpantry/recipe-detail/StepsSection'
import RecipeBuyContent from '@/components/kpantry/buy/RecipeBuySection'
import BuyBanner from '@/components/kpantry/buy/BuyBanner'
import BuySheet from '@/components/kpantry/buy/BuySheet'
import { trackBuySheetOpen } from '@/lib/kpantry/analytics'
import {
  isRecipeSaved,
  toggleSaveRecipe,
  addToShoppingList,
  getUserPantry,
} from '@/lib/kpantry/recipes'
import { getUserPlan, canAccess } from '@/lib/kpantry/subscription'
import { fetchRecipeSteps } from '@/lib/kpantry/recipeSteps'
import { createClient } from '@/lib/kpantry/supabase'
import PaywallModal from '@/components/kpantry/paywall/PaywallModal'
import AuthModal from '@/components/kpantry/auth/AuthModal'
import UnlockModal from '@/components/kpantry/paywall/UnlockModal'
import { canOpenRecipe, LOCKED_STEPS_CLASS, TOTAL_RECIPES } from '@/lib/kpantry/access'
import { KPANTRY_PRICE } from '@/lib/kpantry/purchase'
import { useUnlocked } from '@/lib/kpantry/useUnlocked'
import { APP_MAX_WIDTH } from '@/lib/appLayout'

interface Props {
  /** 서버(app/kpantry/en/recipes/[slug]/page.tsx)가 읽어 온 레시피 — 재료 전부, 조리 단계는 무료 레시피만(RLS) */
  initialRecipe: RecipePageData
}

export default function RecipeDetailClient({ initialRecipe }: Props) {
  const router = useRouter()
  const slug = initialRecipe.slug

  // 하위 컴포넌트(Hero·Nutrition)는 예전처럼 느슨한 값을 받는다 — DB 의 null 을 그대로 넘긴다
  const [recipe, setRecipe] = useState<any>(initialRecipe)
  // UUID for DB operations (save, shopping list)
  const recipeUuid = recipe.id
  const [saved, setSaved] = useState(false)
  const [userPantryIds, setUserPantryIds] = useState<string[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const { isUnlocked, markUnlocked } = useUnlocked()
  // 재료는 누구에게나 보인다. 무료 10개가 아니면 조리 단계만 잠근다.
  // 확인 중(null)에도 잠금 자리를 보여 준다 — 서버 HTML 과 같은 모양이라 깜빡이지 않는다
  const stepsLocked = !canOpenRecipe(slug, false) && isUnlocked !== true
  // 잠금 모달은 확인이 끝나 Pro 가 아닐 때만 띄운다
  const locked = isUnlocked === false && !canOpenRecipe(slug, false)
  const [showUnlock, setShowUnlock] = useState(true)
  const steps: any[] = recipe.pantry_recipe_steps ?? []

  // 구매 시트 — 배너나 재료 위 링크로 연다. 닫히면 연 버튼으로 포커스를 돌려준다
  const [buySheet, setBuySheet] = useState<{ returnTo: HTMLElement } | null>(null)
  const buyIngredients = (recipe.pantry_recipe_ingredients ?? []).map((ri: any) => ri.pantry_ingredients).filter(Boolean)
  const openBuySheet = (trigger: 'banner' | 'top_link') => (el: HTMLElement) => {
    setBuySheet({ returnTo: el })
    trackBuySheetOpen({ recipe_slug: slug, trigger })
  }
  const closeBuySheet = useCallback(() => setBuySheet(null), [])

  // 로그인 사용자 정보 — 저장 여부·내 팬트리·플랜
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser()
        if (!user || !alive) return
        const [savedStatus, pantry, userPlan] = await Promise.all([
          isRecipeSaved(recipeUuid, user.id),
          getUserPantry(user.id),
          getUserPlan(user.id),
        ])
        if (!alive) return
        setSaved(savedStatus)
        setUserPantryIds(pantry?.map((p: any) => p.ingredient_id) ?? [])
        setPlan(userPlan)
      } catch { /* 비로그인과 같게 보인다 */ }
    })()
    return () => { alive = false }
  }, [recipeUuid])

  // 잠긴 레시피 단계는 서버 HTML·공개 키(RLS)에 없다 — 열 수 있게 되면 서버 경로로 받는다
  useEffect(() => {
    if (steps.length > 0 || stepsLocked) return
    let alive = true
    fetchRecipeSteps(slug).then(s => {
      if (alive && s) setRecipe((r: any) => ({ ...r, pantry_recipe_steps: s }))
    })
    return () => { alive = false }
  }, [slug, stepsLocked, steps.length])

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

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 120 }}>
      {/* 폭은 K-Pantry 레이아웃의 표준 폭(lib/appLayout APP_MAX_WIDTH)을 따른다 — 아래 고정 액션 바도 같은 폭 */}
      <div>
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
          recipeSlug={recipe.slug}
          onOpenBuySheet={openBuySheet('top_link')}
        />

        {/* 재료 → 조리 단계 흐름을 끊지 않게 구매 정보는 한 줄 배너로만 두고, 자세한 내용은 시트에서 */}
        <BuyBanner ingredients={buyIngredients} onOpen={openBuySheet('banner')} />

        {stepsLocked ? (
          <section className={LOCKED_STEPS_CLASS} style={{ padding: '0 16px 20px' }} aria-labelledby="kp-steps-locked-h">
            <h2 id="kp-steps-locked-h" style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              Steps
            </h2>
            <div style={{
              padding: '28px 20px', textAlign: 'center',
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
                Step-by-step instructions are locked
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#78716C', margin: '6px 0 16px', lineHeight: 1.5 }}>
                The ingredient list is free. Unlock the cooking steps for all {TOTAL_RECIPES} recipes with a one-time Lifetime Pass.
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
          </section>
        ) : steps.length > 0 ? (
          <StepsSection slug={recipe.slug} steps={steps} />
        ) : (
          <p style={{ padding: '0 16px 20px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9E9E9E' }}>Loading steps…</p>
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
        maxWidth: APP_MAX_WIDTH,
        backgroundColor: 'var(--kp-bg)',
        borderTop: '1px solid var(--kp-rule)',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
      }}>
        <button
          onClick={() => router.push('/kpantry/en/ingredients')}
          style={{
            width: '100%',
            maxWidth: 320,
            padding: '14px 16px',
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
      </div>

      {buySheet && (
        <BuySheet title="Where to buy" onClose={closeBuySheet} returnFocusTo={buySheet.returnTo}>
          <RecipeBuyContent ingredients={buyIngredients} recipeSlug={recipe.slug} />
        </BuySheet>
      )}

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
