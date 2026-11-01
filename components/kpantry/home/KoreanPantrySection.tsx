'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'
import { getRecipeCountsByIngredient } from '@/lib/kpantry/recipes'
import SectionHeader, { SectionDivider } from './SectionHeader'

/**
 * 한국 요리 필수 양념·재료 고정 8개(4열 × 2행). 이 세트가 전부라 View all 은 두지 않는다.
 * 탭하면 /recipes?ingredient=<id> — 그 재료가 들어가는 레시피 목록(IngredientFilterView).
 * 'N recipes' 는 pantry_recipe_ingredients 에서 매번 센다(예전엔 손으로 적은 숫자였다).
 */
const PANTRY_ESSENTIALS = [
  { name: 'Gochugaru',  emoji: '🌶️' },
  { name: 'Soy Sauce',  emoji: '🫙' },
  { name: 'Sesame Oil', emoji: '🛢️' },
  { name: 'Gochujang',  emoji: '🌶️' },
  { name: 'Doenjang',   emoji: '🫙' },
  { name: 'Kimchi',     emoji: '🥬' },
  { name: 'Tofu',       emoji: '⬜' },
  { name: 'Rice',       emoji: '🍚' },
]

type IngredientRow = { id: string; name: string; image_url: string | null }

export default function KoreanPantrySection() {
  const [dbData, setDbData] = useState<IngredientRow[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const rows = (await getPantryEssentials(PANTRY_ESSENTIALS.map(i => i.name)).catch(() => [])) as IngredientRow[]
      setDbData(rows)
      setCounts(await getRecipeCountsByIngredient(rows.map(r => r.id)).catch(() => ({})))
    }
    load()
  }, [])

  // 고정 목록 순서를 지키고 DB 의 id · 사진 · 레시피 수를 붙인다
  const items = PANTRY_ESSENTIALS.map(item => {
    const row = dbData.find(d => d.name === item.name)
    return { ...item, id: row?.id ?? null, imageUrl: row?.image_url ?? null, count: row ? counts[row.id] : undefined }
  })

  return (
    <section style={{ padding: '0 16px' }}>
      <SectionDivider />
      <SectionHeader
        icon={ShoppingCart}
        title="Build Your Korean Pantry"
        desc="Tap an essential to see the recipes that use it."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {items.map(item => {
          const tile = (
            <>
              <span style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--kp-surface-muted)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
              }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span aria-hidden="true" style={{ fontSize: 24, lineHeight: 1 }}>{item.emoji}</span>
                )}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#1A1A1A',
                textAlign: 'center',
                lineHeight: 1.2,
                width: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {item.name}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#6B6B6B',
                marginTop: 2,
                minHeight: 14,
              }}>
                {item.count != null ? `${item.count} recipe${item.count === 1 ? '' : 's'}` : ''}
              </span>
            </>
          )
          const tileStyle: React.CSSProperties = {
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 4px 8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--kp-rule)',
            borderRadius: 14,
            textDecoration: 'none',
          }
          return item.id ? (
            <Link key={item.name} href={`/kpantry/en/recipes?ingredient=${item.id}`} style={tileStyle}>
              {tile}
            </Link>
          ) : (
            <div key={item.name} style={tileStyle}>{tile}</div>
          )
        })}
      </div>
    </section>
  )
}
