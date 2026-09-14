import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { BlogClientPage } from './BlogClientPage'
import { PATTO_TAB, isValidTab, postMatchesTab, tabLabel } from '@/lib/blog/sections'
import { readThumbnail } from '@/lib/blog/thumbnail'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const POSTS_PER_PAGE = 20

function resolveTab(tab: string | undefined): string {
  return tab && isValidTab(tab) ? tab : 'all'
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
    title: activeTab === 'all'
      ? 'Articles — Atlas Lab'
      : `${tabLabel(activeTab)} — Atlas Lab`,
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
  searchParams: Promise<{ page?: string; tab?: string; lang?: string }>
}) {
  const { page, tab, lang } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const activeTab = resolveTab(tab)
  // Patto 탭은 항상 KO; 나머지는 lang 파라미터(기본 en)
  const activeLang: 'en' | 'ko' =
    activeTab === PATTO_TAB.key ? 'ko' : (lang === 'ko' ? 'ko' : 'en')
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

  const matched = (rows ?? []).filter(p => postMatchesTab(p, activeTab))

  const totalPages = Math.ceil(matched.length / POSTS_PER_PAGE)
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const pageRows = matched.slice(from, from + POSTS_PER_PAGE)

  // 썸네일은 본문에서 뽑아야 하는데, 위 쿼리에 content 를 넣으면 매 요청마다
  // 전체 본문(수백 KB)을 끌어오게 된다. 화면에 나갈 20편만 따로 받는다.
  // slug 는 전 테이블에서 유일하다(삽입 스크립트가 slug 단독으로 충돌을 막는다).
  const { data: bodies } = pageRows.length
    ? await supabase
        .from('blog_posts')
        .select('slug, content')
        .in('slug', pageRows.map(p => p.slug))
    : { data: [] as { slug: string; content: string | null }[] }

  const contentBySlug = new Map((bodies ?? []).map(b => [b.slug, b.content]))
  const posts = pageRows.map(p => ({
    ...p,
    thumb: readThumbnail(contentBySlug.get(p.slug)),
  }))

  return (
    <BlogClientPage
      posts={posts}
      activeTab={activeTab}
      activeLang={activeLang}
      totalPages={totalPages}
      currentPage={currentPage}
      pageTitle={activeTab === 'all' ? 'All Articles' : tabLabel(activeTab)}
    />
  )
}
