'use client'
import { BUY_LINK_REL, buildAmazonIngredientUrl, buildWeeeIngredientUrl, isAffiliateActive } from '@/lib/kpantry/affiliate'
import { trackBuyClick, type BuyPlacement } from '@/lib/kpantry/analytics'

interface Props {
  /** Amazon 검색어 — 비면 Amazon 링크를 내지 않는다(신선 재료: Amazon 은 사실상 팔지 않는다) */
  buyQuery?: string | null
  /** Weee! 전용 짧은 검색어 — 비면 buyQuery 를 쓴다 */
  weeeQuery?: string | null
  ingredientSlug: string
  ingredientName: string
  recipeSlug?: string
  placement: BuyPlacement
  /** 링크가 하나도 없을 때 대신 보일 회색 글씨 — 신선 재료 행에만 준다 */
  emptyText?: string
}

/**
 * 구매 텍스트 링크 `Amazon ↗  Weee! ↗` — 새 탭, rel="noopener sponsored".
 * buy_query 가 없고 weee_query 만 있으면 Weee! 만 나온다.
 */
export default function BuyLinks({ buyQuery, weeeQuery, ingredientSlug, ingredientName, recipeSlug, placement, emptyText }: Props) {
  const links = [
    buyQuery ? { key: 'amazon' as const, label: 'Amazon', href: buildAmazonIngredientUrl(buyQuery) } : null,
    (weeeQuery || buyQuery) ? { key: 'weee' as const, label: 'Weee!', href: buildWeeeIngredientUrl((weeeQuery || buyQuery)!) } : null,
  ].filter(Boolean) as { key: 'amazon' | 'weee'; label: string; href: string }[]

  if (links.length === 0) return emptyText ? <span className="kpb-fresh">{emptyText}</span> : null

  return (
    <span className="kpb-links">
      {links.map(l => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel={BUY_LINK_REL}
          className="kpb-link"
          aria-label={`Buy ${ingredientName} on ${l.label} (opens in a new tab)`}
          onClick={() => trackBuyClick({ store: l.key, ingredient_slug: ingredientSlug, recipe_slug: recipeSlug, placement })}
        >
          {l.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </span>
  )
}

/** 제휴 태그가 하나라도 켜져 있을 때만 보이는 고지 문구 */
export function AffiliateDisclosure() {
  if (!isAffiliateActive()) return null
  return (
    <p className="kpb-small" style={{ marginTop: 10 }}>
      Some links are affiliate links. We may earn a small commission at no extra cost to you.
    </p>
  )
}
