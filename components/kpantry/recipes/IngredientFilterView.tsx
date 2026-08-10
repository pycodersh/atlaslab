'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RecipeCard from './RecipeCard'
import { getRecipesByIngredient } from '@/lib/kpantry/recipes'
import { getIngredientById } from '@/lib/kpantry/ingredients'

interface Props {
  ingredientId: string
}

export default function IngredientFilterView({ ingredientId }: Props) {
  const router = useRouter()
  const [ingredient, setIngredient] = useState<{ name: string; image_url: string | null } | null>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [ing, recs] = await Promise.all([
          getIngredientById(ingredientId),
          getRecipesByIngredient(ingredientId),
        ])
        setIngredient(ing)
        setRecipes(recs ?? [])
      } catch (e) {
        console.error('[IngredientFilterView]', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ingredientId])

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '52px 16px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid #E8E0D0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {ingredient?.image_url && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid #E8D8C4',
            flexShrink: 0,
          }}>
            <img
              src={ingredient.image_url}
              alt={ingredient.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {ingredient?.name ?? '…'}
          </h1>
          {!loading && (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#6B6B6B',
              margin: '2px 0 0',
            }}>
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading…</p>
        </div>
      ) : recipes.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>No recipes found.</p>
        </div>
      ) : (
        <section style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {recipes.map(r => (
              <RecipeCard
                key={r.id}
                slug={r.slug}
                nameEn={r.name_en}
                nameKo={r.name_ko}
                description={r.description}
                cookingTimeMin={r.cooking_time_min}
                calories={r.calories}
                difficulty={r.difficulty}
                heroImageUrl={r.hero_image_url}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
