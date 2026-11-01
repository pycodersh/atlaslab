'use client'
import { Lightbulb, ShoppingBasket } from 'lucide-react'
import { META_ICON, PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getIngredientsByIds, loadPantry, readSelectedIngredients } from '@/lib/kpantry/ingredients'
import { ingredientEmoji } from '@/lib/kpantry/ingredientEmoji'
import { createClient } from '@/lib/kpantry/supabase'

const IMG_URL = process.env.NEXT_PUBLIC_IMG_INGREDIENTS
/** 카드에 그림으로 보여 줄 최대 개수 — 나머지는 +N. 375px 폭에서 4칸 + +N 칸이 가로 스크롤 없이 들어간다 */
const MAX_SHOWN = 4

type IngRow = { id: string; name: string; image_url: string | null }

export default function HaveIngredientsCard() {
  const router = useRouter()
  // null = 불러오는 중
  const [selected, setSelected] = useState<IngRow[] | null>(null)

  // 이 기기에서 마지막으로 고른 재료(재료 화면이 남긴 것), 없으면 계정에 저장된 pantry
  useEffect(() => {
    async function load() {
      let ids = readSelectedIngredients()
      if (ids.length === 0) {
        const { data: { user } } = await createClient().auth.getUser()
        if (user) ids = await loadPantry(user.id).catch(() => [])
      }
      const rows = await getIngredientsByIds(ids).catch(() => [])
      setSelected(rows as IngRow[])
    }
    load()
  }, [])

  const ids = selected?.map(r => r.id) ?? []
  const hasSelection = ids.length > 0
  const shown = selected?.slice(0, MAX_SHOWN) ?? []
  const extra = ids.length - shown.length

  const goSelect = () => router.push(
    hasSelection ? `/kpantry/en/ingredients?ids=${ids.join(',')}` : '/kpantry/en/ingredients',
  )
  const goRecipes = () => router.push(`/kpantry/en/recipes?mode=pantry&ids=${ids.join(',')}`)

  return (
    <div style={{
      margin: '20px 16px 12px',
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid var(--kp-rule)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: 'var(--kp-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="#C8102E" strokeWidth="1.5"/>
              <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6" stroke="#C8102E" strokeWidth="1.5"/>
              <path d="M8 11H16M8 15H12" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1.2,
          }}>
            I Have<br />Ingredients
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            margin: '6px 0 0',
          }}>
            Find recipes with<br />the ingredients you have.
          </p>
        </div>

        {/* Right card image */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: 'var(--kp-surface-muted)',
        }}>
          {IMG_URL ? (
            <img src={IMG_URL} alt="Ingredients"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><ShoppingBasket size={44} {...PLACEHOLDER_ICON} /></div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
            My Ingredients{hasSelection ? ` (${ids.length})` : ''}
          </span>
          {hasSelection && (
            <button
              onClick={goSelect}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: 'var(--kp-secondary)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Edit
            </button>
          )}
        </div>

        {selected === null ? (
          <div style={{ height: 70 }} aria-busy="true" />
        ) : hasSelection ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
            {shown.map(ing => (
              <div key={ing.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                width: 52,
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: 'var(--kp-bg)',
                  border: '1px solid var(--kp-rule)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  overflow: 'hidden',
                }}>
                  {ing.image_url ? (
                    <img src={ing.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span aria-hidden="true">{ingredientEmoji(ing.name)}</span>
                  )}
                </div>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#6B6B6B', textAlign: 'center',
                  maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ing.name}
                </span>
              </div>
            ))}

            {extra > 0 && (
              <button
                type="button"
                onClick={goSelect}
                aria-label={`${extra} more ingredients`}
                style={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  borderRadius: 14,
                  backgroundColor: 'var(--kp-bg)',
                  border: '1px solid var(--kp-rule)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#6B6B6B',
                  cursor: 'pointer',
                }}
              >
                +{extra}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={goSelect}
            style={{
              width: '100%',
              padding: '18px 16px',
              backgroundColor: 'var(--kp-bg)',
              border: '1.5px dashed var(--kp-secondary-border)',
              borderRadius: 14,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'var(--kp-secondary)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <ShoppingBasket {...META_ICON} />Tap to select your ingredients
          </button>
        )}
      </div>

      <button
        onClick={hasSelection ? goRecipes : goSelect}
        style={{
          marginTop: 16,
          width: '100%',
          padding: '16px',
          backgroundColor: 'var(--kp-accent)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 14,
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {hasSelection ? 'Find Recipes' : 'Select Ingredients'}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5"/>
          <path d="M8 6L12 10L8 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <p style={{
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        color: '#9E9E9E',
        margin: '8px 0 0',
      }}>
        <Lightbulb {...META_ICON} />See what you can cook with what you have!
      </p>
    </div>
  )
}
