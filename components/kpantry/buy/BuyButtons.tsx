'use client'
import { ExternalLink } from 'lucide-react'
import { BUY_LINK_REL, buildAmazonIngredientUrl, buildWeeeIngredientUrl, isAffiliateActive } from '@/lib/kpantry/affiliate'
import { trackBuyClick, type BuyPlacement } from '@/lib/kpantry/analytics'

interface Props {
  query: string
  /** Weee! 는 긴 검색어에 약해서 따로 줄 수 있다 — 없으면 query */
  weeeQuery?: string | null
  ingredientSlug: string
  recipeSlug?: string
  placement: BuyPlacement
  size?: 'sm' | 'md'
  /** 화면 낭독기용 — "Buy Gochujang on Amazon" */
  ingredientName: string
}

const STORES = [
  { key: 'amazon', label: 'Amazon', build: buildAmazonIngredientUrl },
  { key: 'weee', label: 'Weee!', build: buildWeeeIngredientUrl },
] as const

/** Amazon·Weee! 검색 결과로 가는 버튼 한 쌍. 링크는 새 탭 + rel="noopener sponsored" */
export default function BuyButtons({ query, weeeQuery, ingredientSlug, recipeSlug, placement, size = 'sm', ingredientName }: Props) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      {STORES.map(s => (
        <a
          key={s.key}
          href={s.build(s.key === 'weee' && weeeQuery ? weeeQuery : query)}
          target="_blank"
          rel={BUY_LINK_REL}
          className={`kpb-btn kpb-btn-outline kpb-btn-${size}`}
          aria-label={`Buy ${ingredientName} on ${s.label} (opens in a new tab)`}
          onClick={() => trackBuyClick({ store: s.key, ingredient_slug: ingredientSlug, recipe_slug: recipeSlug, placement })}
        >
          {s.label}
          <ExternalLink size={size === 'sm' ? 11 : 13} strokeWidth={2} aria-hidden="true" />
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
