'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'

const PANTRY_ESSENTIALS = [
  { name: 'Gochugaru',         recipeCount: 51, emoji: '🌶️' },
  { name: 'Soy Sauce',         recipeCount: 69, emoji: '🫙' },
  { name: 'Sesame Oil',        recipeCount: 63, emoji: '🛢️' },
  { name: 'Gochujang',         recipeCount: 21, emoji: '🌶️' },
  { name: 'Doenjang',          recipeCount: 11, emoji: '🫙' },
  { name: 'Kimchi',            recipeCount: 15, emoji: '🥬' },
  { name: 'Tofu',              recipeCount: 14, emoji: '⬜' },
  { name: 'Rice',              recipeCount: 16, emoji: '🍚' },
  { name: 'Zucchini',          recipeCount: 12, emoji: '🥒' },
  { name: 'Shiitake Mushroom', recipeCount: 10, emoji: '🍄' },
]

type IngredientRow = { id: string; name: string; image_url: string | null }

export default function KoreanPantrySection() {
  const router = useRouter()
  const [dbData, setDbData] = useState<IngredientRow[]>([])

  useEffect(() => {
    const names = PANTRY_ESSENTIALS.map(i => i.name)
    getPantryEssentials(names)
      .then(data => setDbData((data as IngredientRow[]) ?? []))
      .catch(() => {})
  }, [])

  // merge hardcoded list with DB ids/images (order preserved from PANTRY_ESSENTIALS)
  const items = PANTRY_ESSENTIALS.map(item => {
    const row = dbData.find(d => d.name === item.name)
    return { ...item, id: row?.id ?? null, imageUrl: row?.image_url ?? null }
  })

  return (
    <section style={{ padding: '20px 0 0' }}>
      {/* Header */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '0 0 3px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          🛒 Build Your Korean Pantry
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          color: '#6B6B6B',
          margin: 0,
        }}>
          Stock these essentials and unlock 50+ recipes
        </p>
      </div>

      {/* Horizontal scroll row */}
      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        padding: '4px 16px 12px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      } as React.CSSProperties}>
        {items.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              if (item.id) router.push(`/kpantry/en/recipes?ingredient=${item.id}`)
            }}
            style={{
              flexShrink: 0,
              width: 76,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: item.id ? 'pointer' : 'default',
              padding: 0,
            }}
          >
            {/* Circular image */}
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#F5E8D8',
              border: '1.5px solid #E8D8C4',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 6,
            }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 28, lineHeight: 1 }}>{item.emoji}</span>
              )}
            </div>

            {/* Name */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#1A1A1A',
              margin: '0 0 2px',
              textAlign: 'center',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              width: '100%',
            } as React.CSSProperties}>
              {item.name}
            </p>

            {/* Recipe count */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              color: '#9E9E9E',
              margin: 0,
              textAlign: 'center',
            }}>
              {item.recipeCount} recipes
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
