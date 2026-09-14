/**
 * 사이트에서 바로 보낼 수 있는 라이브 앱 목록 — 네비 드롭다운과
 * "Get started" 모달의 단일 출처.
 *
 * 순서가 두 군데에서 다르다(요구사항):
 *   드롭다운  Patto → K-Patto → K-Pantry
 *   모달      K-Patto → K-Pantry → Patto
 * 그래서 목록을 따로 내보낸다.
 */

export type SiteApp = {
  key: 'patto' | 'kpatto' | 'kpantry'
  name: string
  href: string
  /** 모달 카드에 쓰는 한 줄 설명 */
  blurb: string
}

export const SITE_APPS: Record<SiteApp['key'], SiteApp> = {
  patto: {
    key: 'patto',
    name: 'Patto',
    href: '/patto/home',
    blurb: 'Master native English patterns for everyday fluency',
  },
  kpatto: {
    key: 'kpatto',
    name: 'K-Patto',
    href: '/kpatto',
    blurb: 'Learn Korean sentence patterns through natural audio & drills',
  },
  kpantry: {
    key: 'kpantry',
    name: 'K-Pantry',
    href: '/kpantry/en',
    blurb: 'Find authentic Korean recipes with ingredients in your fridge',
  },
}

/** 네비 'Apps' 드롭다운 순서 */
export const NAV_APPS: SiteApp[] = [
  SITE_APPS.patto,
  SITE_APPS.kpatto,
  SITE_APPS.kpantry,
]

/** "Get started" 모달 카드 순서 */
export const MODAL_APPS: SiteApp[] = [
  SITE_APPS.kpatto,
  SITE_APPS.kpantry,
  SITE_APPS.patto,
]
