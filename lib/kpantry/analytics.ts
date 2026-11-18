/**
 * K-Pantry GA4 이벤트 — 루트 layout 이 심는 전역 gtag 를 부른다.
 * gtag 가 없으면(광고 차단·스크립트 로드 전·SSR) 조용히 무시한다. 절대 throw 하지 않는다.
 * localhost 에서는 보내지 않는다(window.__kpEvents 에만 쌓는다).
 *
 * 이벤트 (GA4 관리 화면에서 buy_click·market_search 를 주요 이벤트로 표시할 것)
 *   buy_click               store, ingredient_slug, recipe_slug?, placement
 *   market_search           method (near_me / zip), market (korean / asian), placement
 *   ingredient_popover_open ingredient_slug, recipe_slug
 *   buy_sheet_open          recipe_slug, trigger (banner / top_link)
 */

export type BuyPlacement = 'buy_sheet' | 'popover' | 'ingredient_page'
export type MarketPlacement = 'buy_sheet' | 'ingredient_page' | 'saved_tab'

type Params = Record<string, string | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** 로컬 개발·테스트(localhost·127.0.0.1·[::1]·*.localhost)에서는 실제 GA 속성으로 보내지 않는다 */
function isLocalHost(): boolean {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1' || h.endsWith('.localhost')
}

export function trackEvent(name: string, params: Params = {}) {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    if (isLocalHost()) {
      // 검증용 — 전송 대신 콘솔과 window.__kpEvents 에 남긴다
      const w = window as unknown as { __kpEvents?: unknown[] }
      ;(w.__kpEvents ??= []).push([name, params])
      console.debug('[kpantry ga:local]', name, params)
      return
    }
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

/** 레시피 상세의 구매 시트가 열릴 때 — 배너 또는 재료 위 "Where to buy these ingredients" 링크 */
export function trackBuySheetOpen(p: { recipe_slug: string; trigger: 'banner' | 'top_link' }) {
  trackEvent('buy_sheet_open', p)
}

/** 홈 "3가지 길" 카드 클릭 — have(재료로 찾기) / browse(전체 레시피) / by_ingredient(재료 하나로) */
export function trackHomePathClick(p: { path: 'have' | 'browse' | 'by_ingredient' }) {
  trackEvent('home_path_click', p)
}
