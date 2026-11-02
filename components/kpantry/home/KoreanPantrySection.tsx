'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'
import { getRecipeCountsByIngredient } from '@/lib/kpantry/recipes'
import SectionHeader, { SectionDivider } from './SectionHeader'
import SectionButton from './SectionButton'

/**
 * 한국 요리 필수 양념·재료 고정 8개(4열 × 2행). 아래 버튼은 같은 8개를 크게 보여 주는 /essentials 로.
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

// 테두리는 :hover·:focus-visible 로 바꿔야 해서 인라인이 아니라 클래스에 둔다
const TILE_CSS = `
.kp-pantry-tile { border: 1px solid #EFEDEB; transition: border-color 0.15s; }
a.kp-pantry-tile:hover, a.kp-pantry-tile:focus-visible { border-color: #D6D3D1; }
a.kp-pantry-tile:active { border-color: #C8102E; }
`

type IngredientRow ={ id: string; name: string; image_url: string | null }

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
        desc="Essential ingredients for Korean cooking."
      />
      <style>{TILE_CSS}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {items.map(item => {
          const tile = (
            <>
              {/* 1번 섹션 재료 칩과 같은 원형 — 48px, 흰 바탕, 얇은 테두리, 안쪽 4px 띄우고 사진도 원으로 */}
              <span style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(231, 229, 228, 0.8)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
              }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>{item.emoji}</span>
                )}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: '#292524',
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
                color: '#A8A29E',
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
            justifyContent: 'center',
            // 좌우는 4px — 375px 에서 타일이 78px 라 10px 씩 띄우면 'Gochugaru'·'Sesame Oil' 이 잘린다
            padding: '10px 4px',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            textDecoration: 'none',
          }
          return item.id ? (
            <Link key={item.name} href={`/kpantry/en/recipes?ingredient=${item.id}`} className="kp-pantry-tile" style={tileStyle}>
              {tile}
            </Link>
          ) : (
            <div key={item.name} className="kp-pantry-tile" style={tileStyle}>{tile}</div>
          )
        })}
      </div>

      <SectionButton href="/kpantry/en/essentials">View All 8 Essentials &amp; Dishes</SectionButton>
    </section>
  )
}
