/**
 * K-Pantry GA4 이벤트 — 루트 layout 이 심는 전역 gtag 를 부른다.
 * gtag 가 없으면(광고 차단·스크립트 로드 전·SSR) 조용히 무시한다. 절대 throw 하지 않는다.
 *
 * 이벤트 (GA4 관리 화면에서 buy_click·market_search 를 주요 이벤트로 표시할 것)
 *   buy_click               store, ingredient_slug, recipe_slug?, placement
 *   market_search           method (near_me / zip), market (korean / asian), placement
 *   ingredient_popover_open ingredient_slug, recipe_slug
 */

export type BuyPlacement = 'recipe_section' | 'popover' | 'ingredient_page'
export type MarketPlacement = 'recipe_section' | 'ingredient_page' | 'saved_tab'

type Params = Record<string, string | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params: Params = {}) {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    window.gtag('event', name, clean)
  } catch {
    /* 측정 실패가 화면 동작을 막지 않는다 */
  }
}

export function trackBuyClick(p: { store: 'amazon' | 'weee'; ingredient_slug: string; recipe_slug?: string; placement: BuyPlacement }) {
  trackEvent('buy_click', p)
}

/** market: 기본은 korean, "Try Asian markets instead" 링크는 asian */
export function trackMarketSearch(p: { method: 'near_me' | 'zip'; market: 'korean' | 'asian'; placement: MarketPlacement }) {
  trackEvent('market_search', p)
}

export function trackIngredientPopoverOpen(p: { ingredient_slug: string; recipe_slug?: string }) {
  trackEvent('ingredient_popover_open', p)
}
