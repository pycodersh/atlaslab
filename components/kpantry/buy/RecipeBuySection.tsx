'use client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useId, useState } from 'react'
import { FRESH_TEXT, STORE_GROUPS, guideHref, type PriceTier, type StoreLevel } from '@/lib/kpantry/buyInfo'
import BuyLinks, { AffiliateDisclosure } from './BuyButtons'
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

/** 같은 재료가 여러 구분(essential·optional)에 들어가도 한 번만, 구매 정보가 있는 것만 */
export function uniqueBuyIngredients(ingredients: RecipeBuyIngredient[]) {
  return [...new Map(ingredients.filter(i => i.slug && i.store_level).map(i => [i.id, i])).values()]
}

/**
 * 구매 시트 안 내용 — 레시피 "Ingredients" 섹션과 같은 문법(2026-11-18 2차):
 * 소제목 + 회색 개수, 구분선 행(40px 썸네일 · 이름 · 회색 "고추장 · $$" · 오른쪽 텍스트 링크).
 * 한인·아시안 마트 → 일반 마트 → (접힌) 어디서나 → 마트 찾기 순서.
 */
export default function RecipeBuyContent({ ingredients, recipeSlug }: { ingredients: RecipeBuyIngredient[]; recipeSlug: string }) {
  const unique = uniqueBuyIngredients(ingredients)
  const groups = STORE_GROUPS
    .filter(g => g.level !== 'common')
    .map(g => ({ ...g, items: unique.filter(i => i.store_level === g.level) }))
    .filter(g => g.items.length > 0)
  const common = unique.filter(i => i.store_level === 'common')

  return (
    <div>
      <BuyStyles />
      {groups.map(g => (
        <section key={g.level} className="kpb-group" aria-label={g.title}>
          <h3 className="kpb-sub">{g.title} <span className="kpb-count">{g.items.length}</span></h3>
          <ul className="kpb-rows">
            {g.items.map(i => (
              <li key={i.id} className="kpb-row">
                {i.image_url
                  ? <img src={i.image_url} alt="" width={40} height={40} className="kpb-thumb" />
                  : <span className="kpb-thumb" />}
                {/* 이름 줄과 링크가 한 줄에 안 들어가면(375px) 링크가 다음 줄로 내려간다 — 한국어 이름을 쪼개지 않는다 */}
                <div className="kpb-row-main">
                  <div style={{ minWidth: 0 }}>
                    <Link href={guideHref(i.slug!)} className="kpb-row-name">{i.name}</Link>
                    {(i.name_ko || i.price_tier) && (
                      <p className="kpb-small" style={{ whiteSpace: 'nowrap' }}>
                        {i.name_ko && <span lang="ko">{i.name_ko}</span>}
                        {i.name_ko && i.price_tier && ' · '}
                        {i.price_tier}
                      </p>
                    )}
                  </div>
                  <BuyLinks
                    buyQuery={i.buy_query}
                    weeeQuery={i.weee_query}
                    ingredientSlug={i.slug!}
                    ingredientName={i.name}
                    recipeSlug={recipeSlug}
                    placement="buy_sheet"
                    emptyText={g.level === 'korean_asian' ? FRESH_TEXT : undefined}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {common.length > 0 && <CommonGroup items={common} />}

      <AffiliateDisclosure />
      <div style={{ marginTop: 32 }}>
        <MarketFinder placement="buy_sheet" headingLevel="h3" />
      </div>
    </div>
  )
}

/** 어디서나 사는 재료 — 기본 접힘, 펼치면 이름만 쉼표로 */
function CommonGroup({ items }: { items: RecipeBuyIngredient[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  return (
    <section className="kpb-group">
      <button type="button" className="kpb-disclose" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(o => !o)}>
        <span>At any grocery store <span className="kpb-count">· {items.length}</span></span>
        <ChevronRight size={16} strokeWidth={2} color="#78716C" aria-hidden="true" />
      </button>
      <p id={panelId} hidden={!open} className="kpb-p" style={{ fontSize: 14, padding: '12px 0 0' }}>
        {items.map((i, idx) => (
          <span key={i.id}>
            {idx > 0 && ', '}
            <Link href={guideHref(i.slug!)} style={{ color: 'inherit' }}>{i.name}</Link>
          </span>
        ))}
      </p>
    </section>
  )
}
