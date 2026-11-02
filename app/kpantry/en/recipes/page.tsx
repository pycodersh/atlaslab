'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ExploreView from '@/components/kpantry/recipes/ExploreView'
import PantryResultsView from '@/components/kpantry/recipes/PantryResultsView'
import IngredientFilterView from '@/components/kpantry/recipes/IngredientFilterView'
import { parseIngredientIds } from '@/lib/kpantry/ingredients'

function RecipesContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const ingredientId = searchParams.get('ingredient')
  const selectedIds = searchParams.get('ids')

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      {ingredientId
        ? <IngredientFilterView ingredientId={ingredientId} />
        : mode === 'pantry'
          ? <PantryResultsView key={selectedIds ?? ''} ingredientIds={parseIngredientIds(selectedIds)} />
          : <ExploreView />
      }
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
