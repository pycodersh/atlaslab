'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'
import { getRecipeCountsByIngredient } from '@/lib/kpantry/recipes'

/**
 * 한국 요리 필수 양념·재료 고정 8개(2열 × 4행).
 * 탭하면 /recipes?ingredient=<id> — 그 재료가 들어가는 레시피 목록(IngredientFilterView).
 * 'N recipes' 는 pantry_recipe_ingredients 에서 매번 센다.
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

// 테두리는 :hover·:focus-visible 로 바꿔야 해서 인라인이 아니라 클래스에 둔다 — 홈 목차 카드와 같은 반응
const TILE_CSS = `
.kp-essential { border: 1px solid rgba(231, 229, 228, 0.8); transition: border-color 0.2s, transform 0.15s; }
a.kp-essential:hover, a.kp-essential:focus-visible { border-color: #A8A29E; }
a.kp-essential:active { transform: scale(0.99); }
@media (prefers-reduced-motion: reduce) { .kp-essential { transition: none; } a.kp-essential:active { transform: none; } }
`

type IngredientRow = { id: string; name: string; image_url: string | null }

export default function EssentialsGrid() {
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
    <>
      <style>{TILE_CSS}</style>
      <ul style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
      }}>
        {items.map(item => {
          const tile = (
            <>
              {/* 375px 에서 타일이 약 166px — 화살표 없이 사진 40px 라야 'Sesame Oil'·'Gochugaru' 가 다 들어간다 */}
              <span style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span aria-hidden="true" style={{ fontSize: 26, lineHeight: 1 }}>{item.emoji}</span>
                )}
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1C1917',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item.name}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A8A29E', minHeight: 16 }}>
                  {item.count != null ? `${item.count} recipe${item.count === 1 ? '' : 's'}` : ''}
                </span>
              </span>
            </>
          )
          const tileStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            textDecoration: 'none',
          }
          return (
            <li key={item.name} style={{ minWidth: 0 }}>
              {item.id ? (
                <Link href={`/kpantry/en/recipes?ingredient=${item.id}`} className="kp-essential" style={tileStyle}>
                  {tile}
                </Link>
              ) : (
                <div className="kp-essential" style={tileStyle}>{tile}</div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
