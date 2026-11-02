'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CookingPot } from 'lucide-react'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'
import SectionHeader from './SectionHeader'

/**
 * 대표 재료 5개 — label 은 화면에 보이는 이름, name 은 pantry_ingredients 의 실제 이름.
 * 'Pork' 행은 레시피에 연결된 게 없어(2026-11-02 실측 0개) 재료 화면에서 숨겨지므로,
 * 돼지고기 중 레시피가 가장 많은 Pork Belly(9개)로 잇는다.
 */
const SHOWCASE = [
  { label: 'Kimchi', name: 'Kimchi',     emoji: '🥬' },
  { label: 'Egg',    name: 'Egg',        emoji: '🥚' },
  { label: 'Onion',  name: 'Onion',      emoji: '🧅' },
  { label: 'Pork',   name: 'Pork Belly', emoji: '🥓' },
  { label: 'Tofu',   name: 'Tofu',       emoji: '⬜' },
]

type IngredientRow = { id: string; name: string; image_url: string | null }

/**
 * 홈 섹션 1 — 재료로 레시피 찾기. 섹션 2(완성 요리 사진 가로 스크롤)와 겹치지 않게
 * 요리 사진 대신 원형 재료 5개를 보여 준다. 재료를 탭해 고르면 버튼이 그 재료를 미리 고른 채로
 * /ingredients 를 연다(?ids=). 아무것도 안 고르면 빈 선택으로 연다.
 */
export default function CookWithIngredientsCard() {
  const [rows, setRows] = useState<IngredientRow[]>([])
  const [picked, setPicked] = useState<string[]>([])

  useEffect(() => {
    getPantryEssentials(SHOWCASE.map(i => i.name))
      .then(d => setRows(d as IngredientRow[]))
      .catch(() => {})
  }, [])

  const items = SHOWCASE.map(item => {
    const row = rows.find(r => r.name === item.name)
    return { ...item, id: row?.id ?? null, imageUrl: row?.image_url ?? null }
  })

  const toggle = (id: string) =>
    setPicked(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))

  const href = picked.length > 0
    ? `/kpantry/en/ingredients?ids=${picked.join(',')}`
    : '/kpantry/en/ingredients'

  return (
    <section style={{ padding: '12px 16px 0' }}>
      <SectionHeader
        icon={CookingPot}
        title="Cook with What You Have"
        desc="Select ingredients in your fridge to discover matching recipes."
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 16,
        backgroundColor: '#FAFAF9',
        border: '1px solid rgba(231, 229, 228, 0.8)',
        borderRadius: 16,
      }}>
        <div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: '#78716C',
            margin: '0 0 10px',
          }}>
            Tap ingredients you already have
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {items.map(item => {
              const on = item.id != null && picked.includes(item.id)
              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={!item.id}
                  aria-pressed={on}
                  onClick={() => item.id && toggle(item.id)}
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: item.id ? 'pointer' : 'default',
                  }}
                >
                  <span style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    // 고른 재료는 테두리만 브랜드 레드로 — 두께가 같아 크기가 흔들리지 않는다
                    border: `1px solid ${on ? 'var(--kp-accent)' : '#E7E5E4'}`,
                    boxShadow: on ? '0 0 0 1px var(--kp-accent)' : '0 1px rgba(0,0,0,0.05)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }} />
                    ) : (
                      <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>{item.emoji}</span>
                    )}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: on ? 'var(--kp-accent)' : '#44403C',
                    marginTop: 4,
                    textAlign: 'center',
                  }}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Link href={href} style={{
          padding: '12px 16px',
          borderRadius: 12,
          backgroundColor: 'var(--kp-accent)',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          // (100+) 가 붙어 길어져서 375px 카드 안 한 줄에 들어가도록 12px — 화살표는 줄어들지 않게 고정
          fontSize: 12,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          textDecoration: 'none',
        }}>
          Select Ingredients &amp; Find Recipes (100+)
          <ArrowRight size={14} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
        </Link>
      </div>
    </section>
  )
}
