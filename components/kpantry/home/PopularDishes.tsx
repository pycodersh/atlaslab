'use client'
import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPopularRecipes } from '@/lib/kpantry/recipes'
import DishGridCard from '@/components/kpantry/recipes/DishGridCard'
import SectionHeader from './SectionHeader'

/** 홈에는 대표 메뉴만 2×2 로 — 나머지는 View all 로 레시피 목록에서 */
const SHOWN = 4

export default function PopularDishes() {
  const [dishes, setDishes] = useState<any[]>([])

  useEffect(() => {
    getPopularRecipes().then(d => setDishes((d ?? []).slice(0, SHOWN))).catch(() => {})
  }, [])

  if (dishes.length === 0) return null

  return (
    <section style={{ padding: '28px 16px 0' }}>
      <SectionHeader
        icon={Flame}
        title="Popular Korean Dishes"
        desc="Most loved classic Korean dishes."
        viewAllHref="/kpantry/en/recipes"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {dishes.map(dish => (
          <DishGridCard
            key={dish.id}
            slug={dish.slug}
            nameEn={dish.name_en}
            cookingTimeMin={dish.cooking_time_min}
            heroImageUrl={dish.hero_image_url}
            compact
          />
        ))}
      </div>
    </section>
  )
}
