'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import BottomNav from '@/components/kpantry/layout/BottomNav'
import ExploreView from '@/components/kpantry/recipes/ExploreView'
import PantryResultsView from '@/components/kpantry/recipes/PantryResultsView'
import IngredientFilterView from '@/components/kpantry/recipes/IngredientFilterView'

function RecipesContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const ingredientId = searchParams.get('ingredient')

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      {ingredientId
        ? <IngredientFilterView ingredientId={ingredientId} />
        : mode === 'pantry'
          ? <PantryResultsView />
          : <ExploreView />
      }
      <BottomNav />
    </div>
  )
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading...</p>
      </div>
    }>
      <RecipesContent />
    </Suspense>
  )
}
