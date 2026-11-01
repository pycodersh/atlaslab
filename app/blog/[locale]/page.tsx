import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PagedList, PagedListView } from '@/components/blog/PagedList'

// 정적 페이지 — 한 시간에 한 번만 다시 굽는다. ?page= 는 PagedList 가 브라우저에서 적용한다
export const dynamic = 'force-static'
export const revalidate = 3600

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }]
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const POSTS_PER_PAGE = 20

const APP_META: Record<string, { label: string; color: string }> = {
  'k-patto':    { label: 'K-Patto',    color: '#60a5fa' },
  'patto':      { label: 'Patto',      color: '#a89fff' },
  'kpantry':    { label: 'K-Pantry',   color: '#fbbf24' },
  'k-pantry':   { label: 'K-Pantry',   color: '#fbbf24' },
  'careernavi': { label: 'CareerNavi', color: '#5DCAA5' },
}

function getAppMeta(app: string) {
  return APP_META[app] ?? { label: app, color: '#a89fff' }
}

const LOCALE_LABEL: Record<string, string> = { en: 'English', ko: '한국어' }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const otherLocale = locale === 'ko' ? 'en' : 'ko'

  const title = locale === 'ko' ? 'Blog — Atlas Lab (한국어)' : 'Blog — Atlas Lab (English)'
  const description =
    locale === 'ko'
      ? 'Atlas Lab의 한국어 블로그 — 한국어 학습, 경력 개발, 레시피 가이드.'
      : 'Tips, guides, and insights from Atlas Lab — K-Patto, Patto, K-Pantry, and more.'

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/blog/${locale}`,
      languages: {
        [locale]: `${BASE}/blog/${locale}`,
        [otherLocale]: `${BASE}/blog/${otherLocale}`,
      },
    },
  }
}

export default async function BlogLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const now = new Date().toISOString()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, published_at')
    .eq('locale', locale)
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })

  const totalCount = posts?.length || 0

  // Category chips for this locale
  const seenApps = new Set<string>()
  const apps: string[] = []
  for (const r of posts || []) {
    if (!seenApps.has(r.app)) { seenApps.add(r.app); apps.push(r.app) }
  }

  const items = (posts || []).map(post => {
    const meta = getAppMeta(post.app)
    return (
      <div key={post.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          href={`/blog/${locale}/${post.app}/${post.slug}`}
          style={{ textDecoration: 'none', display: 'block', padding: '16px 0' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              color: meta.color, background: `${meta.color}22`,
              borderRadius: 4, padding: '1px 6px',
            }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
              {new Date(post.published_at).toLocaleDateString(
                locale === 'ko' ? 'ko-KR' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' },
              )}
            </span>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
            {post.title}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>
            {post.description}
          </p>
        </Link>
      </div>
    )
  })

  const list = { items, perPage: POSTS_PER_PAGE, basePath: `/blog/${locale}`, variant: 'compact' as const }

  const otherLocale = locale === 'ko' ? 'en' : 'ko'

  return (
    <div style={{
      background: '#0a0a1a', minHeight: '100vh', color: 'white',
      fontFamily: '"DM Sans","Inter",system-ui,sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Atlas Lab</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{locale.toUpperCase()}</span>
        </div>

        {/* Header */}
        <div style={{ marginTop: 32, marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 8px' }}>
            BLOG
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
            {LOCALE_LABEL[locale] ?? locale.toUpperCase()} Posts
          </h1>
          {totalCount > 0 && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              {totalCount} {totalCount === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>

        {/* Language switch */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <Link href={`/blog/${locale}`} style={{
            fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999,
            background: '#7c6fff', color: 'white', textDecoration: 'none',
            display: 'inline-block',
          }}>{locale.toUpperCase()}</Link>
          <Link href={`/blog/${otherLocale}`} style={{
            fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 999,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
          }}>{otherLocale.toUpperCase()}</Link>
        </div>

        {/* Category chips */}
        {apps.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
            {apps.map(app => {
              const meta = getAppMeta(app)
              return (
                <Link
                  key={app}
                  href={`/blog/${locale}/${app}`}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: meta.color,
                    textDecoration: 'none',
                  }}
                >
                  {meta.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        {/* Post list */}
        {items.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', paddingTop: 24 }}>No posts yet.</p>
        ) : (
          <Suspense fallback={<PagedListView {...list} page={1} />}>
            <PagedList {...list} />
          </Suspense>
        )}

      </div>
    </div>
  )
}
