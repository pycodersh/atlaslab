'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPopularRecipes } from '@/lib/kpantry/recipes'

export default function PopularDishes() {
  const router = useRouter()
  const [dishes, setDishes] = useState<any[]>([])

  useEffect(() => {
    getPopularRecipes().then(d => setDishes(d ?? [])).catch(() => {})
  }, [])

  if (dishes.length === 0) return null

  return (
    <section style={{ padding: '8px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          🔥 Popular Korean Dishes
        </h3>
        <button
          onClick={() => router.push('/kpantry/en/recipes')}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          View all
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
        {dishes.map((dish) => (
          <div
            key={dish.id}
            onClick={() => router.push(`/kpantry/en/recipes/${dish.slug}`)}
            style={{
              flexShrink: 0,
              width: 140,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #E8E0D0',
              cursor: 'pointer',
            }}
          >
            <div style={{
              height: 100,
              backgroundColor: '#F5E8D8',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {dish.hero_image_url ? (
                <img src={dish.hero_image_url} alt={dish.name_en}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 44 }}>🍲</span>
              )}
            </div>
            <div style={{ padding: '10px 10px 12px' }}>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#1A1A1A',
                margin: 0,
              }}>
                {dish.name_en}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#9E9E9E',
                margin: '2px 0 4px',
              }}>
                {dish.description?.slice(0, 28) ?? ''}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#6B6B6B',
                margin: 0,
              }}>
                ⏱ {dish.cooking_time_min} min
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
