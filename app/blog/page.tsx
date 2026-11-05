import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { BlogClientPage } from './BlogClientPage'
import { BlogIndexFromQuery } from './BlogIndexFromQuery'
import { DEFAULT_TAB, tabLabel } from '@/lib/blog/sections'
import { blogIndexView, type BlogCard } from '@/lib/blog/indexView'
import { readMinutes } from '@/lib/blog/readTime'
import { cardThumbnailForPost } from '@/lib/blog/thumbnail'
import { DEFAULT_OPEN_GRAPH, DEFAULT_TWITTER } from '@/lib/seo/site'

// 정적 페이지 — 한 시간에 한 번만 다시 굽는다(요청마다 서버 함수가 돌지 않게).
// 탭 · 언어 · 페이지 쿼리는 서버가 읽지 않고 BlogIndexFromQuery 가 브라우저에서 적용한다.
export const dynamic = 'force-static'
export const revalidate = 3600

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const BLOG_DESC =
  'Real-life Korean phrases, Korean basics explained simply, and practical guides to traveling, eating and living in Korea — from Atlas Lab and K-PATTO.'

export const metadata: Metadata = {
  title: `${tabLabel(DEFAULT_TAB)} — Atlas Lab`,
  description: BLOG_DESC,
  // 탭은 화면상의 필터일 뿐이라 canonical 은 항상 /blog 로 모은다.
  alternates: { canonical: `${BASE}/blog` },
  // openGraph 를 쓰면 루트의 openGraph 가 통째로 바뀌므로 기본 이미지 · 사이트 이름까지 같이 준다
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: `${tabLabel(DEFAULT_TAB)} — Atlas Lab`, description: BLOG_DESC, url: `${BASE}/blog` },
  twitter: { ...DEFAULT_TWITTER, title: `${tabLabel(DEFAULT_TAB)} — Atlas Lab`, description: BLOG_DESC },
}

export default async function BlogIndexPage() {
  // 두 언어의 글을 한 번에 받아 카드로 만든다. 예약 발행 글도 받아 두고
  // 발행 시각이 지났는지는 indexView 가 거른다(다음 재생성을 기다리지 않게).
  // 썸네일 · 읽기 시간은 본문에서 뽑으므로 여기서만 content 를 읽고 카드에는 싣지 않는다.
  const { data: rows } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at, content, thumbnail')
    .eq('is_paused', false)
    .order('published_at', { ascending: false })

  const cards: BlogCard[] = (rows ?? []).map(({ content, thumbnail, ...p }) => ({
    ...p,
    thumb: cardThumbnailForPost(p.slug, content, thumbnail),
    readMin: readMinutes(content),
  }))

  // 쿼리를 읽기 전(정적 HTML · 크롤러)에는 기본 탭 화면을 그대로 보여 준다
  return (
    <Suspense fallback={<BlogClientPage {...blogIndexView(cards, {})} headingTag="div" />}>
      <BlogIndexFromQuery cards={cards} />
    </Suspense>
  )
}
