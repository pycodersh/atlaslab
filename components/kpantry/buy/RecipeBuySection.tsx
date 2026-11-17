'use client'
import Link from 'next/link'
import { STORE_GROUPS, guideHref, hasBuyLinks, type PriceTier, type StoreLevel } from '@/lib/kpantry/buyInfo'
import BuyButtons, { AffiliateDisclosure } from './BuyButtons'
import MarketFinder from './MarketFinder'
import { BuyStyles } from './BuyStyles'

export interface RecipeBuyIngredient {
  id: string
  name: string
  name_ko?: string | null
  image_url?: string | null
  slug?: string | null
  store_level?: StoreLevel | null
  price_tier?: PriceTier | null
  buy_query?: string | null
  weee_query?: string | null
}

export const WHERE_TO_BUY_ID = 'where-to-buy'

/**
 * 레시피 상세 재료 목록 아래 — 이 레시피 재료를 살 곳별로 묶는다.
 * 한인·아시안 마트 묶음을 맨 위에 두고 재료마다 Amazon·Weee! 버튼, 그 아래 마트 찾기.
 */
export default function RecipeBuySection({ ingredients, recipeSlug }: { ingredients: RecipeBuyIngredient[]; recipeSlug: string }) {
  // 같은 재료가 여러 구분(essential·optional)에 들어가도 한 번만
  const unique = [...new Map(ingredients.filter(i => i.slug && i.store_level).map(i => [i.id, i])).values()]
  if (unique.length === 0) return null

  const groups = STORE_GROUPS
    .map(g => ({ ...g, items: unique.filter(i => i.store_level === g.level) }))
    .filter(g => g.items.length > 0)

  return (
    <section id={WHERE_TO_BUY_ID} style={{ padding: '0 16px 20px', scrollMarginTop: 16 }} aria-labelledby="kpb-wtb-h">
      <BuyStyles />
      <h2 id="kpb-wtb-h" style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
        Where to buy
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.map(g => (
          <div key={g.level} className="kpb-card" style={{ padding: '14px 14px 6px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px' }}>
              <span className="kpb-badge" data-level={g.level}>{g.title}</span>
              <span className="kpb-small">{g.items.length}</span>
            </h3>

            {g.level === 'common' ? (
              <p className="kpb-p" style={{ fontSize: 13, padding: '2px 0 10px' }}>
                {g.items.map((i, idx) => (
                  <span key={i.id}>
                    {idx > 0 && ', '}
                    <Link href={guideHref(i.slug!)} style={{ color: 'inherit' }}>{i.name}</Link>
                  </span>
                ))}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {g.items.map(i => (
                  <li key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--kp-surface-muted)' }}>
                    {i.image_url ? (
                      <img src={i.image_url} alt="" width={36} height={36} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    ) : <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--kp-surface-muted)', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={guideHref(i.slug!)} style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1C1917', textDecoration: 'none' }}>
                        {i.name}
                      </Link>
                      {/* 한국어 이름은 가격과 둘째 줄에 — 버튼 옆 좁은 칸에서 영어 이름 옆에 두면 "고 / 추장"으로 쪼개진다 */}
                      {(i.name_ko || i.price_tier) && (
                        <p className="kpb-small" style={{ whiteSpace: 'nowrap' }}>
                          {i.name_ko && <span lang="ko">{i.name_ko}</span>}
                          {i.name_ko && i.price_tier && ' · '}
                          {i.price_tier}
                        </p>
                      )}
                    </div>
                    {g.level === 'korean_asian' && hasBuyLinks(i as { store_level: StoreLevel; buy_query: string | null }) && (
                      <BuyButtons query={i.buy_query!} weeeQuery={i.weee_query} ingredientSlug={i.slug!} ingredientName={i.name} recipeSlug={recipeSlug} placement="recipe_section" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <AffiliateDisclosure />
        <MarketFinder placement="recipe_section" headingLevel="h3" />
      </div>
    </section>
  )
}
