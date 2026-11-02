'use client'
import Link from 'next/link'
import { Clock, Flame, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPopularRecipes } from '@/lib/kpantry/recipes'
import { META_ICON, PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'
import SectionHeader, { SectionDivider } from './SectionHeader'

/**
 * 375px 에서 카드 2.5장이 보이는 폭 — 스크롤 띠가 화면 오른쪽 끝까지 뻗어서(아래 margin -16px)
 * 화면 359px ÷ (136 + 간격 14) ≈ 2.4장. 160px 이면 2장만 보여 옆으로 넘길 수 있다는 단서(잘린 세 번째 카드)가 안 생긴다.
 */
const CARD_W = 136

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
        desc="Most loved classic Korean dishes."
        viewAllHref="/kpantry/en/recipes"
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
              backgroundColor: '#FFFFFF',
              border: '1px solid #F5F5F4',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px rgba(0,0,0,0.05)',
              textDecoration: 'none',
            }}
          >
            <div style={{
              height: 88,
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
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              {dish.description && (
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  color: '#A8A29E',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {dish.description}
                </span>
              )}
              {dish.cooking_time_min != null && (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#78716C' }}>
                  <Clock {...META_ICON} size={11} />{dish.cooking_time_min}m
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
