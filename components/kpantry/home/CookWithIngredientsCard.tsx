'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, CookingPot } from 'lucide-react'
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
 * 홈 섹션 1(히어로) — 재료로 레시피 찾기. 흰 카드 위 원형 재료 5개를 탭해 고르면
 * 버튼이 그 재료를 미리 고른 채로 /ingredients 를 연다(?ids=). 아무것도 안 고르면 빈 선택으로 연다.
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
    <section style={{ padding: '0 16px' }}>
      <SectionHeader
        icon={CookingPot}
        title="Cook with What I Have"
        desc="Select ingredients in your fridge to discover matching recipes."
      />

      <div style={{
        padding: 20,
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(231, 229, 228, 0.8)',
        borderRadius: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        {/* 고른 개수 뱃지는 자리를 미리 잡아 둬서 나타날 때 줄이 흔들리지 않는다 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 20,
          marginBottom: 14,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#A8A29E',
          }}>
            Your Ingredients
          </span>
          {picked.length > 0 && (
            <span aria-live="polite" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--kp-accent)',
              backgroundColor: 'var(--kp-accent-soft)',
              borderRadius: 999,
              padding: '3px 8px',
            }}>
              Selected: {picked.length} item{picked.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
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
                  position: 'relative',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: on ? 'rgba(200, 16, 46, 0.05)' : 'rgba(250, 250, 249, 0.5)',
                  // 고른 재료는 2px 레드 — 테두리 1px + 같은 색 링 1px 이라 크기가 흔들리지 않는다
                  border: `1px solid ${on ? '#C8102E' : '#E7E5E4'}`,
                  boxShadow: on ? '0 0 0 1px #C8102E' : 'none',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
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
                  {on && (
                    <span aria-hidden="true" style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: '#C8102E',
                      border: '1.5px solid #FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={9} strokeWidth={3.5} color="#FFFFFF" />
                    </span>
                  )}
                </span>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: on ? '#C8102E' : '#44403C',
                  marginTop: 6,
                  textAlign: 'center',
                }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        <Link href={href} style={{
          marginTop: 16,
          padding: '14px 16px',
          borderRadius: 12,
          backgroundColor: 'var(--kp-accent)',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          textDecoration: 'none',
          transition: 'background-color 0.15s',
        }}>
          Find Recipes with My Ingredients
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
        </Link>
      </div>
    </section>
  )
}
