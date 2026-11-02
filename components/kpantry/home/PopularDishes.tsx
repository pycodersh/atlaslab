'use client'
import Link from 'next/link'
import { Flame, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPopularRecipes } from '@/lib/kpantry/recipes'
import { PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'
import SectionHeader, { SectionDivider } from './SectionHeader'

/**
 * 375px 에서 카드 약 2.3장이 보이는 폭 — 스크롤 띠가 화면 오른쪽 끝까지 뻗어서(아래 margin -16px)
 * 첫 카드 왼쪽 16px 뒤로 359px 가 보인다: 144×2 + 간격 14×2 = 316, 세 번째 카드가 43px 걸친다.
 * 160px 이면 세 번째 카드가 11px 만 보여(≈2.07장) 옆으로 넘길 수 있다는 단서가 약하다.
 */
const CARD_W = 144

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

const SCROLL_CSS = `
.kp-hscroll { scrollbar-width: none; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; }
.kp-hscroll::-webkit-scrollbar { display: none; }
.kp-hscroll > * { scroll-snap-align: start; scroll-margin-left: 16px; }
`

export default function PopularDishes() {
  const [dishes, setDishes] = useState<any[]>([])

  useEffect(() => {
    getPopularRecipes().then(d => setDishes(d ?? [])).catch(() => {})
  }, [])

  if (dishes.length === 0) return null

  return (
    <section style={{ padding: '0 16px' }}>
      <style>{SCROLL_CSS}</style>
      <SectionDivider />
      <SectionHeader
        icon={Flame}
        title="Popular Korean Dishes"
        desc="Explore Korea's most loved dishes."
        viewAllHref="/kpantry/en/recipes?filter=popular"
      />

      {/* 섹션 좌우 여백(16px)을 상쇄해 화면 끝까지 스크롤되게, 첫·끝 카드는 다시 16px 띄운다 */}
      <div
        className="kp-hscroll"
        style={{
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          margin: '0 -16px',
          padding: '0 16px 8px',
        }}
      >
        {dishes.map(dish => (
          <Link
            key={dish.id}
            href={`/kpantry/en/recipes/${dish.slug}`}
            style={{
              width: CARD_W,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(231, 229, 228, 0.7)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              textDecoration: 'none',
            }}
          >
            <div style={{
              height: 112,
              backgroundColor: 'var(--kp-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {dish.hero_image_url ? (
                <img src={dish.hero_image_url} alt="" loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UtensilsCrossed size={28} {...PLACEHOLDER_ICON} />
              )}
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: '#1C1917',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {dish.name_en}
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}>
                {[
                  dish.cooking_time_min != null ? `${dish.cooking_time_min} min` : null,
                  DIFFICULTY_LABEL[dish.difficulty] ?? null,
                ].filter(Boolean).join(' · ')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
