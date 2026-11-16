import { DEFAULT_TAB, KOREAN_TAB, groupKeyOf, isValidTab, postMatchesTab, tabLabel } from '@/lib/blog/sections'
import { KEEP_EMPTY_SUB_CHIPS, isCrossListed, isValidSubcategory, subcategoriesFor, subcategoriesOf } from '@/lib/blog/subcategories'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'
import { EXPLORE_REGIONS, type ExploreGeo } from '@/lib/blog/exploreRegions'

/** 지역 필터 · 지도 보기는 Explore Korea 탭에서만 쓴다 */
export const EXPLORE_TAB = 'explore-korea'

/**
 * /blog 목록 화면 계산 — 빌드 때 받은 전체 글(cards)에 쿼리(tab · sub · lang · page)를 적용한다.
 * /blog 는 정적 페이지라 서버가 쿼리를 못 본다. 서버는 기본 화면(쿼리 없음)을 HTML 로 굽고,
 * 브라우저에서 같은 함수로 쿼리를 적용해 다시 그린다.
 */

export type BlogCard = {
  slug: string
  title: string
  description: string | null
  app: string
  locale: string
  category: string | null
  published_at: string
  thumb: BlogThumbnail | null
  readMin: number
  /** Explore Korea 지역 · 좌표(lib/blog/exploreRegions) — 지역도 좌표도 없는 글은 비워 둔다 */
  geo?: ExploreGeo
}

export type BlogQuery = { page?: string | null; tab?: string | null; lang?: string | null; sub?: string | null; region?: string | null; view?: string | null }

const POSTS_PER_PAGE = 20

export function blogIndexView(cards: BlogCard[], q: BlogQuery) {
  const currentPage = Math.max(1, parseInt(q.page || '1') || 1)
  const activeTab = q.tab && isValidTab(q.tab) ? q.tab : DEFAULT_TAB
  // 언어는 lang 파라미터(기본 en). 한국어 글만 모아 보던 Patto 탭은 없앴다
  const activeLang: 'en' | 'ko' = q.lang === 'ko' ? 'ko' : 'en'
  // 예약 발행 글은 빌드 뒤에 시각이 지나면 보이도록 브라우저 시각으로 거른다
  const now = new Date().toISOString()
  const rows = cards.filter(p => p.locale === activeLang && p.published_at <= now)

  // 대표 그룹이 이 탭인 글 + 다른 탭 글 중 이 탭 태그(SECONDARY_TAGS)가 붙은 글
  const inTab = rows.filter(p => postMatchesTab(p, activeTab) || isCrossListed(p.slug, activeTab))

  // 서브 카테고리 칩 — 서브 분류가 정의된 그룹(explore-korea · food · life)에서만 쓴다.
  // 분류는 코드(lib/blog/subcategories)에서 하고, 한 글이 칩 여러 개에 걸릴 수 있다(다중 태깅).
  // 칩 옆 개수는 탭 전체 기준이다.
  const subDefs = subcategoriesFor(activeTab)
  const subsOf = (p: BlogCard) => subcategoriesOf(activeTab, groupKeyOf(p.app, p.category), p)
  const activeSub = q.sub && isValidSubcategory(activeTab, q.sub) ? q.sub : null
  const subChips = subDefs.map(s => ({ ...s, count: inTab.filter(p => subsOf(p).includes(s.key)).length }))
    .filter(s => s.count > 0 || KEEP_EMPTY_SUB_CHIPS.has(activeTab))   // Explore Korea 는 빈 칩도 보인다
  const bySub = activeSub ? inTab.filter(p => subsOf(p).includes(activeSub)) : inTab

  // 지역 필터 · Grid/Map — Explore Korea 만. 지역 칩 개수는 지금 서브 칩(Hotels · Places) 기준이다.
  // 기본은 Map(글 전부가 왼쪽 목록에 링크로 그려진다). Grid 는 ?view=grid, 페이지 번호는 Grid 에만
  const isExplore = activeTab === EXPLORE_TAB
  // 지금 서브 칩(All · Hotels · Places) 기준으로 글이 0편인 지역은 칩을 아예 숨긴다.
  // 고른 지역이 이 서브 칩에서 0편이 되면 All 로 돌아간다(주소 정리는 BlogIndexFromQuery)
  const activeView: 'grid' | 'map' = isExplore && q.view !== 'grid' ? 'map' : 'grid'
  const regionChips = isExplore
    ? EXPLORE_REGIONS.map(r => ({ key: r.id as string, label: r.name, count: bySub.filter(p => p.geo?.regions.includes(r.id)).length })).filter(r => r.count > 0)
    : []
  const activeRegion = isExplore && q.region && regionChips.some(r => r.key === q.region) ? q.region : null
  const matched = activeRegion ? bySub.filter(p => p.geo?.regions.includes(activeRegion as never)) : bySub

  // Korean 탭은 한 목록이 아니라 Basics · Phrases 섹션 두 개다(최신순으로 섞지 않는다).
  // 섹션마다 앞쪽 몇 편만 그리고, 페이지 번호는 쓰지 않는다 — 나머지는 섹션의 'View all' 이 맡는다.
  const isKorean = activeTab === KOREAN_TAB.key
  const sections = isKorean
    ? KOREAN_TAB.sections.map(s => {
        const all = matched.filter(p => groupKeyOf(p.app, p.category) === s.group)
        return { key: s.group, title: s.title, desc: s.desc, total: all.length, posts: all.slice(0, s.limit) }
      })
    : []

  const totalPages = isKorean || activeView === 'map' ? 0 : Math.ceil(matched.length / POSTS_PER_PAGE)
  const from = (currentPage - 1) * POSTS_PER_PAGE

  return {
    posts: isKorean ? [] : activeView === 'map' ? matched : matched.slice(from, from + POSTS_PER_PAGE),
    sections,
    activeTab,
    activeLang,
    subChips,
    activeSub,
    regionChips,
    activeRegion,
    activeView,
    regionTotal: bySub.length,
    totalCount: inTab.length,
    totalPages,
    currentPage,
    pageTitle: tabLabel(activeTab),
  }
}
