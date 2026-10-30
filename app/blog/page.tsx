import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { BlogClientPage } from './BlogClientPage'
import { DEFAULT_TAB, KOREAN_TAB, groupKeyOf, legacyTabTarget, isValidTab, postMatchesTab, tabLabel } from '@/lib/blog/sections'
import { badgeFor } from '@/lib/blog/badge'
import { KEEP_EMPTY_SUB_CHIPS, isCrossListed, isValidSubcategory, subcategoriesFor, subcategoriesOf } from '@/lib/blog/subcategories'
import { permanentRedirect } from 'next/navigation'
import { readMinutes } from '@/lib/blog/readTime'
import { thumbnailForPost } from '@/lib/blog/thumbnail'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const POSTS_PER_PAGE = 20

function resolveTab(tab: string | undefined): string {
  return tab && isValidTab(tab) ? tab : DEFAULT_TAB
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string; lang?: string }>
}): Promise<Metadata> {
  const { page, tab } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const activeTab = resolveTab(tab)
  return {
    title: `${tabLabel(activeTab)} — Atlas Lab`,
    description:
      'Tips, guides, and insights on Korean learning, English patterns, Korean recipes, and career growth — from Atlas Lab.',
    robots: currentPage > 1 ? { index: false, follow: true } : undefined,
    // 탭은 화면상의 필터일 뿐이라 canonical 은 항상 /blog 로 모은다.
    alternates: { canonical: `${BASE}/blog` },
  }
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string; lang?: string; sub?: string }>
}) {
  const { page, tab, lang, sub } = await searchParams
  // 예전 탭 주소(stay-in-korea, 통합 Korean 보기)는 현재 구조로 영구 이동
  const legacy = tab ? legacyTabTarget(tab, sub) : null
  if (legacy) {
    const q = new URLSearchParams({ tab: legacy.tab })
    if (legacy.sub) q.set('sub', legacy.sub)
    if (lang === 'ko') q.set('lang', 'ko')
    if (page && page !== '1') q.set('page', page)
    permanentRedirect(`/blog?${q.toString()}`)
  }
  const currentPage = Math.max(1, parseInt(page || '1'))
  const activeTab = resolveTab(tab)
  // 언어는 lang 파라미터(기본 en). 한국어 글만 모아 보던 Patto 탭은 없앴다
  const activeLang: 'en' | 'ko' = lang === 'ko' ? 'ko' : 'en'
  const now = new Date().toISOString()

  // 한 번만 조회하고 탭 분류는 lib/blog/sections 로 코드에서 한다.
  // 주제 탭은 category + app 조합이라 SQL 로 표현하면 홈과 기준이 갈라진다.
  // (기존에도 총 개수를 세려고 전체 행을 읽고 있었으므로 쿼리는 2개 → 1개로 준다.)
  const { data: rows } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at')
    .eq('locale', activeLang)
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })

  // 대표 그룹이 이 탭인 글 + 다른 탭 글 중 이 탭 태그(SECONDARY_TAGS)가 붙은 글
  const inTab = (rows ?? []).filter(p => postMatchesTab(p, activeTab) || isCrossListed(p.slug, activeTab))

  // 서브 카테고리 칩 — 서브 분류가 정의된 그룹(explore-korea · food · life)에서만 쓴다.
  // 분류는 코드(lib/blog/subcategories)에서 하고, 한 글이 칩 여러 개에 걸릴 수 있다(다중 태깅).
  // 칩 옆 개수는 탭 전체 기준이다.
  const subDefs = subcategoriesFor(activeTab)
  const subsOf = (p: { slug: string; title: string; app: string; category: string | null }) =>
    subcategoriesOf(activeTab, groupKeyOf(p.app, p.category), p)
  const activeSub = isValidSubcategory(activeTab, sub) ? sub : null
  const subChips = subDefs.map(s => ({ ...s, count: inTab.filter(p => subsOf(p).includes(s.key)).length }))
    .filter(s => s.count > 0 || KEEP_EMPTY_SUB_CHIPS.has(activeTab))   // Explore Korea 는 빈 칩도 보인다
  const matched = activeSub ? inTab.filter(p => subsOf(p).includes(activeSub)) : inTab

  // Korean 탭은 한 목록이 아니라 Basics · Phrases 섹션 두 개다(최신순으로 섞지 않는다).
  // 섹션마다 앞쪽 몇 편만 그리고, 페이지 번호는 쓰지 않는다 — 나머지는 섹션의 'View all' 이 맡는다.
  const isKorean = activeTab === KOREAN_TAB.key
  const sectionRows = isKorean
    ? KOREAN_TAB.sections.map(s => {
        const all = matched.filter(p => groupKeyOf(p.app, p.category) === s.group)
        return { ...s, total: all.length, rows: all.slice(0, s.limit) }
      })
    : []

  const totalPages = isKorean ? 0 : Math.ceil(matched.length / POSTS_PER_PAGE)
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const pageRows = isKorean ? sectionRows.flatMap(s => s.rows) : matched.slice(from, from + POSTS_PER_PAGE)

  // 썸네일은 본문에서 뽑아야 하는데, 위 쿼리에 content 를 넣으면 매 요청마다
  // 전체 본문(수백 KB)을 끌어오게 된다. 화면에 나갈 글만 따로 받는다.
  // slug 는 전 테이블에서 유일하다(삽입 스크립트가 slug 단독으로 충돌을 막는다).
  const { data: bodies } = pageRows.length
    ? await supabase
        .from('blog_posts')
        .select('slug, content, thumbnail')
        .in('slug', pageRows.map(p => p.slug))
    : { data: [] as { slug: string; content: string | null; thumbnail: string | null }[] }

  const bodyBySlug = new Map((bodies ?? []).map(b => [b.slug, b]))
  const toCard = (p: (typeof pageRows)[number]) => ({
    ...p,
    thumb: thumbnailForPost(p.slug, bodyBySlug.get(p.slug)?.content, bodyBySlug.get(p.slug)?.thumbnail),
    readMin: readMinutes(bodyBySlug.get(p.slug)?.content),
    badge: badgeFor(p),
  })

  return (
    <BlogClientPage
      posts={isKorean ? [] : pageRows.map(toCard)}
      sections={sectionRows.map(s => ({ key: s.group, title: s.title, desc: s.desc, total: s.total, posts: s.rows.map(toCard) }))}
      activeTab={activeTab}
      activeLang={activeLang}
      subChips={subChips}
      activeSub={activeSub}
      totalCount={inTab.length}
      totalPages={totalPages}
      currentPage={currentPage}
      pageTitle={tabLabel(activeTab)}
    />
  )
}
