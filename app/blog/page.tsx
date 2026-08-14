import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { BlogClientPage } from './BlogClientPage'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const POSTS_PER_PAGE = 20

const APP_LABEL: Record<string, string> = {
  'k-patto':  'K-Patto',
  'patto':    'Patto',
  'kpantry':  'K-Pantry',
  'k-pantry': 'K-Pantry',
}

function buildCountQuery(app: string, now: string, locale: string) {
  const base = supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', locale)
    .eq('is_paused', false)
    .lte('published_at', now)

  if (app === 'all') return base
  if (app === 'k-pantry') return supabase
    .from('blog_posts').select('id')
    .eq('locale', locale).eq('is_paused', false).lte('published_at', now)
    .in('app', ['k-pantry', 'kpantry'])
  return base.eq('app', app)
}

function buildPostsQuery(app: string, now: string, from: number, to: number, locale: string) {
  const base = supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at')
    .eq('locale', locale)
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (app === 'all') return base
  if (app === 'k-pantry') return supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at')
    .eq('locale', locale).eq('is_paused', false).lte('published_at', now)
    .in('app', ['k-pantry', 'kpantry'])
    .order('published_at', { ascending: false })
    .range(from, to)
  return base.eq('app', app)
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; app?: string; lang?: string }>
}): Promise<Metadata> {
  const { page, app } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const appLabel = app ? (APP_LABEL[app] ?? app) : null
  return {
    title: appLabel ? `${appLabel} Articles — Atlas Lab` : 'Articles — Atlas Lab',
    description:
      'Tips, guides, and insights on Korean learning, English patterns, Korean recipes, and career growth — from Atlas Lab.',
    robots: currentPage > 1 ? { index: false, follow: true } : undefined,
    alternates: { canonical: `${BASE}/blog` },
  }
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; app?: string; lang?: string }>
}) {
  const { page, app, lang } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const activeApp   = app ?? 'all'
  // patto 앱은 항상 KO; 나머지는 lang 파라미터(기본 en)
  const activeLang: 'en' | 'ko' = activeApp === 'patto' ? 'ko' : (lang === 'ko' ? 'ko' : 'en')
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to   = from + POSTS_PER_PAGE - 1
  const now  = new Date().toISOString()

  const [{ data: countRows }, { data: posts }] = await Promise.all([
    buildCountQuery(activeApp, now, activeLang),
    buildPostsQuery(activeApp, now, from, to, activeLang),
  ])

  const totalCount = countRows?.length || 0
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  const pageTitle = activeApp !== 'all'
    ? (APP_LABEL[activeApp] ?? activeApp)
    : 'All Articles'

  return (
    <BlogClientPage
      posts={posts ?? []}
      activeApp={activeApp}
      activeLang={activeLang}
      totalPages={totalPages}
      currentPage={currentPage}
      pageTitle={pageTitle}
    />
  )
}
