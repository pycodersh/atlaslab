'use client'
import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { INLINE_ICON } from '@/components/kpantry/ui/icon'
import { useEffect, useState } from 'react'
import { getPopularRecipes } from '@/lib/kpantry/recipes'
import DishGridCard from '@/components/kpantry/recipes/DishGridCard'

/** 홈에는 대표 메뉴만 2×2 로 — 나머지는 View all 로 레시피 목록에서 */
const SHOWN = 4

export default function PopularDishes() {
  const [dishes, setDishes] = useState<any[]>([])

  useEffect(() => {
    getPopularRecipes().then(d => setDishes((d ?? []).slice(0, SHOWN))).catch(() => {})
  }, [])

  if (dishes.length === 0) return null

  return (
    <section style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
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
          <Flame {...INLINE_ICON} color="#C8102E" />Popular Korean Dishes
        </h3>
        <Link
          href="/kpantry/en/recipes"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--kp-secondary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View all <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {dishes.map(dish => (
          <DishGridCard
            key={dish.id}
            slug={dish.slug}
            nameEn={dish.name_en}
            cookingTimeMin={dish.cooking_time_min}
            heroImageUrl={dish.hero_image_url}
          />
        ))}
      </div>
    </section>
  )
}
