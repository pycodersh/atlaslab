'use client'
import { useCallback, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import IngredientPopover, { type PopoverIngredient } from '@/components/kpantry/buy/IngredientPopover'
import { BuyStyles } from '@/components/kpantry/buy/BuyStyles'
import { trackIngredientPopoverOpen } from '@/lib/kpantry/analytics'
import type { PriceTier, StoreLevel } from '@/lib/kpantry/buyInfo'

interface Ingredient {
  id: string
  amount: string
  type: 'essential' | 'recommended' | 'optional'
  pantry_ingredients: {
    id: string
    name: string
    name_ko: string
    image_url?: string
    // 구매 정보(Where to Buy) — 없으면 이름은 그냥 글자로 남는다
    slug?: string | null
    store_level?: StoreLevel | null
    price_tier?: PriceTier | null
    shopping_tip?: string | null
    substitute?: string | null
    buy_query?: string | null
    weee_query?: string | null
  }
}

interface IngredientsSectionProps {
  recipeIngredients: Ingredient[]
  userPantryIds?: string[]
  onAddToShoppingList?: (ingredientId: string, name: string) => void
  /** 구매 팝오버·측정에 쓰는 레시피 슬러그. 주면 재료 이름 팝오버가 켜진다 */
  recipeSlug?: string
  /** 주면 위에 "Where to buy these ingredients" 링크가 생기고, 누르면 구매 시트를 연다 */
  onOpenBuySheet?: (el: HTMLElement) => void
}

const TYPE_TABS = [
  { key: 'essential', label: 'Essential' },
  { key: 'recommended', label: 'Recommended' },
  { key: 'optional', label: 'Optional' },
] as const

const INGREDIENT_EMOJIS: Record<string, string> = {
  Kimchi: '🥬', Egg: '🥚', Rice: '🍚', 'Green Onion': '🌿',
  Onion: '🧅', Garlic: '🧄', 'Soy Sauce': '🫙', 'Sesame Oil': '🫒',
  'Sesame Seeds': '🌰', Gochugaru: '🌶', Gochujang: '🌶',
  Doenjang: '🫙', Sugar: '🍬', Salt: '🧂', Tofu: '⬜',
  Beef: '🥩', Pork: '🥩', Chicken: '🍗', Tuna: '🐟',
  Spam: '🥫', Potato: '🥔', Zucchini: '🥒', Mushroom: '🍄',
  Carrot: '🥕', Spinach: '🌿', 'Bean Sprouts': '🌱',
  'Glass Noodles': '🍜', 'Rice Cake': '🍡', 'Anchovy Broth': '🍵',
  'Perilla Oil': '🫒',
}

export default function IngredientsSection({
  recipeIngredients,
  userPantryIds = [],
  onAddToShoppingList,
  recipeSlug,
  onOpenBuySheet,
}: IngredientsSectionProps) {
  const [activeTab, setActiveTab] = useState<'essential' | 'recommended' | 'optional'>('essential')
  const [popover, setPopover] = useState<{ ing: PopoverIngredient; anchor: DOMRect } | null>(null)
  const closePopover = useCallback(() => setPopover(null), [])

  const openPopover = (ing: Ingredient['pantry_ingredients'], el: HTMLElement) => {
    if (!ing.slug) return
    setPopover({
      ing: {
        name: ing.name,
        name_ko: ing.name_ko,
        slug: ing.slug,
        store_level: ing.store_level ?? null,
        price_tier: ing.price_tier ?? null,
        shopping_tip: ing.shopping_tip ?? null,
        substitute: ing.substitute ?? null,
        buy_query: ing.buy_query ?? null,
        weee_query: ing.weee_query ?? null,
      },
      anchor: el.getBoundingClientRect(),
    })
    trackIngredientPopoverOpen({ ingredient_slug: ing.slug, recipe_slug: recipeSlug })
  }

  const byType = {
    essential: recipeIngredients.filter(ri => ri.type === 'essential'),
    recommended: recipeIngredients.filter(ri => ri.type === 'recommended'),
    optional: recipeIngredients.filter(ri => ri.type === 'optional'),
  }

  const totalCount = recipeIngredients.length

  return (
    <section style={{ padding: '0 16px 20px' }}>
      {recipeSlug && <BuyStyles />}
      {onOpenBuySheet && (
        <>
          <button type="button" className="kpb-link" aria-haspopup="dialog" onClick={e => onOpenBuySheet(e.currentTarget)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 10, fontSize: 12 }}>
            <ShoppingBag size={13} strokeWidth={2} aria-hidden="true" />
            Where to buy these ingredients
          </button>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
        }}>
          Ingredients
        </h2>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: 'var(--kp-accent)',
          fontWeight: 500,
        }}>
          {totalCount} items
        </span>
      </div>

      <div style={{
        display: 'flex',
        backgroundColor: 'var(--kp-surface-muted)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
      }}>
        {TYPE_TABS.map(tab => {
          const count = byType[tab.key].length
          if (count === 0) return null
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#FFFFFF' : 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#1A1A1A' : '#6B6B6B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {activeTab === tab.key && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              {tab.label} {count}
            </button>
          )
        })}
      </div>

      {/* 세 구분 모두 DOM 에 둔다(안 보이는 탭은 hidden) — 서버 HTML·검색엔진에 재료 전부가 들어간다 */}
      {TYPE_TABS.map(tab => (
      <div key={tab.key} hidden={activeTab !== tab.key} style={{
        display: activeTab === tab.key ? 'grid' : 'none',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {byType[tab.key].map(ri => {
          const ing = ri.pantry_ingredients
          const isOwned = userPantryIds.includes(ing.id)
          const emoji = INGREDIENT_EMOJIS[ing.name] ?? '🥘'

          return (
            <div
              key={ri.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: isOwned ? 'var(--kp-accent-soft)' : 'var(--kp-bg)',
                border: isOwned ? '2px solid var(--kp-accent)' : '1.5px solid var(--kp-rule)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                position: 'relative',
              }}>
                {ing.image_url ? (
                  <img src={ing.image_url} alt={ing.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                ) : (
                  <span>{emoji}</span>
                )}

                {/* 한인·아시안 마트에서 사야 하는 재료 — 좌측 상단 작은 점(우측 하단 + 버튼과 안 겹친다). 라벨은 달지 않는다 */}
                {ing.store_level === 'korean_asian' && (
                  <span className="kpb-dot" title="Korean or Asian market" />
                )}

                {isOwned ? (
                  <div style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'var(--kp-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                ) : onAddToShoppingList && (
                  <button
                    onClick={() => onAddToShoppingList(ing.id, ing.name)}
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: 'var(--kp-accent)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2V8M2 5H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#1A1A1A',
                fontWeight: 500,
                margin: 0,
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {recipeSlug && ing.slug ? (
                  <button
                    type="button"
                    className="kpb-name-btn"
                    aria-haspopup="dialog"
                    aria-label={`${ing.name}: where to buy`}
                    onClick={e => openPopover(ing, e.currentTarget)}
                  >
                    {ing.name}
                  </button>
                ) : ing.name}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#9E9E9E',
                margin: 0,
                textAlign: 'center',
              }}>
                {ri.amount}
              </p>
            </div>
          )
        })}
      </div>
      ))}

      {popover && (
        <IngredientPopover ingredient={popover.ing} anchor={popover.anchor} recipeSlug={recipeSlug} onClose={closePopover} />
      )}
    </section>
  )
}
