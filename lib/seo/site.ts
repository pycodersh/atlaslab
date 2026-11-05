/**
 * 사이트 공통 SEO 값 — 루트 레이아웃 · 홈 · 목록 · 글 페이지가 같은 값을 쓴다.
 *
 * Next.js 메타데이터는 openGraph · twitter 객체를 얕게(통째로) 덮어쓴다. 페이지가 openGraph 를 하나라도 정하면
 * 루트의 type · siteName · 기본 이미지가 사라지므로, openGraph 를 쓰는 페이지는 DEFAULT_OPEN_GRAPH 를 펼친 뒤 덮어쓴다.
 * 기본 공유 이미지는 public/og-default.png(1200×630, scripts/render-og-default.mjs 로 만든다).
 */
import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'
export const SITE_NAME = 'Atlas Lab'
export const SITE_TITLE = 'Atlas Lab — Guides, Culture & Smart Tools'
export const SITE_DESC =
  'Speak, travel and live like a local in Korea: real-life Korean phrases from K-PATTO’s webtoon-based pattern lessons, Korean basics explained simply, and practical Korea travel guides.'

export const DEFAULT_OG_IMAGE = {
  url: '/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Atlas Lab — speak, travel and live like a local in Korea',
} as const

export const DEFAULT_OPEN_GRAPH = {
  type: 'website',
  siteName: SITE_NAME,
  locale: 'en_US',
  images: [DEFAULT_OG_IMAGE],
} satisfies NonNullable<Metadata['openGraph']>

export const DEFAULT_TWITTER = {
  card: 'summary_large_image',
  images: [DEFAULT_OG_IMAGE.url],
} satisfies NonNullable<Metadata['twitter']>

/**
 * 글의 공유 이미지 — 목록 카드와 같은 썸네일(cardThumbnailForPost)을 쓴다.
 *   DB thumbnail → 코드 표지 → Basics 영상 스틸(16:9) → 본문 첫 YouTube(hqdefault, 항상 있는 크기) → 본문 첫 이미지 → 사이트 기본 이미지.
 * 상대 경로는 루트 레이아웃의 metadataBase 로 절대 주소가 된다.
 */
export function ogImageForPost(
  thumb: { kind: 'youtube'; videoId: string } | { kind: 'image'; src: string; alt?: string } | null,
  title: string,
): { url: string; alt: string; width?: number; height?: number } {
  if (!thumb) return { ...DEFAULT_OG_IMAGE }
  if (thumb.kind === 'youtube') return { url: `https://i.ytimg.com/vi/${thumb.videoId}/hqdefault.jpg`, width: 480, height: 360, alt: title }
  return { url: thumb.src, alt: thumb.alt ?? title }
}

/** 글 상세의 빵부스러기 경로 — Home › Articles › 탭(Phrases · Basics · Explore Korea · Food · Life) › 글 */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  }
}

/** 홈의 Organization · WebSite 구조화 데이터 */
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: 'Atlas Lab Studios',
  url: SITE_URL,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  email: 'contact@atlaslabstudios.com',
} as const

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
} as const
