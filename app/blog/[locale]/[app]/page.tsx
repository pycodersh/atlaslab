import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PagedList, PagedListView } from '@/components/blog/PagedList'

// 정적 페이지 — 한 시간에 한 번만 다시 굽는다. ?page= 는 PagedList 가 브라우저에서 적용한다
export const dynamic = 'force-static'
export const revalidate = 3600

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('locale, app')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  // /blog/{locale}/patto 는 정적 세그먼트 patto/ 가 맡는다
  const combos = new Set((data ?? []).filter(p => p.app !== 'patto').map(p => `${p.locale}/${p.app}`))
  return [...combos].map(c => {
    const [locale, app] = c.split('/')
    return { locale, app }
  })
}

const POSTS_PER_PAGE = 10

// App href for CTA buttons in list header
const APP_HREF: Record<string, string | null> = {
  'k-patto':    '/kpatto',
  'patto':      '/patto/home',
  'kpantry':    '/kpantry/en',
  'k-pantry':   '/kpantry/en',
  'careernavi': null,
}

const APP_LABELS: Record<string, { en: string; ko: string; desc: string }> = {
  'k-patto': {
    en: 'K-Patto Blog',
    ko: 'K-Patto 블로그',
    desc: 'Tips and guides on mastering Korean patterns.',
  },
  patto: {
    en: 'Patto Blog',
    ko: 'Patto 블로그',
    desc: 'Tips and guides on mastering English patterns.',
  },
  'k-pantry': {
    en: 'K-Pantry Blog',
    ko: 'K-Pantry 블로그',
    desc: 'Korean recipes, ingredients, and cooking guides for home cooks everywhere.',
  },
  kpantry: {
    en: 'K-Pantry Blog',
    ko: 'K-Pantry 블로그',
    desc: 'Korean recipes, ingredients, and cooking guides for home cooks everywhere.',
  },
  careernavi: {
    en: 'CareerNavi Blog',
    ko: 'CareerNavi 블로그',
    desc: 'AI career navigation tips for Korean professionals.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; app: string }>
}): Promise<Metadata> {
  const { locale, app } = await params
  const label = APP_LABELS[app] ?? { en: `${app} Blog`, ko: `${app} 블로그`, desc: '' }
  const title = locale === 'ko' ? label.ko : label.en
  const otherLocale = locale === 'ko' ? 'en' : 'ko'

  // noindex when no active posts (e.g. all paused) — auto-removed when posts return
  const { data: sample } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', locale)
    .eq('app', app)
    .lte('published_at', new Date().toISOString())
    .eq('is_paused', false)
    .limit(1)
  const hasContent = (sample?.length ?? 0) > 0

  return {
    title,
    description: label.desc,
    robots: hasContent ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `${BASE}/blog/${locale}/${app}`,
      languages: {
        [locale]:      `${BASE}/blog/${locale}/${app}`,
        [otherLocale]: `${BASE}/blog/${otherLocale}/${app}`,
      },
    },
  }
}

export default async function AppBlogListPage({
  params,
}: {
  params: Promise<{ locale: string; app: string }>
}) {
  const { locale, app } = await params

  const label = APP_LABELS[app] ?? { en: `${app} Blog`, ko: `${app} 블로그`, desc: '' }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, tags, published_at')
    .eq('locale', locale)
    .eq('app', app)
    .lte('published_at', new Date().toISOString())
    .eq('is_paused', false)
    .order('published_at', { ascending: false })

  const items = (posts || []).map(post => (
    <Link key={post.slug} href={`/blog/${locale}/${app}/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {post.tags?.map((tag: string) => (
            <span key={tag} style={{
              background: 'rgba(124,111,255,0.2)',
              color: '#a89fff',
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}>{tag}</span>
          ))}
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          {post.title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {post.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            Atlas Lab · {new Date(post.published_at).toLocaleDateString(
              locale === 'ko' ? 'ko-KR' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </span>
          <span style={{ color: '#7c6fff', fontSize: '0.9rem' }}>Read →</span>
        </div>
      </div>
    </Link>
  ))

  const list = {
    items,
    perPage: POSTS_PER_PAGE,
    basePath: `/blog/${locale}/${app}`,
    variant: 'pill' as const,
    listStyle: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  }

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', padding: '2rem 1.5rem', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Atlas Lab</Link>
        <span>/</span>
        <Link href={`/blog/${locale}`} style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Blog</Link>
        <span>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{locale === 'ko' ? label.ko : label.en}</span>
      </div>

      <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          BLOG
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {locale === 'ko' ? label.ko : label.en}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: APP_HREF[app] ? '1rem' : '0' }}>{label.desc}</p>
        {APP_HREF[app] && (
          <Link href={APP_HREF[app]!} style={{
            display: 'inline-block',
            background: '#7c6fff', color: 'white',
            fontSize: '0.85rem', fontWeight: 600,
            padding: '8px 20px', borderRadius: 999,
            textDecoration: 'none',
          }}>
            {locale === 'ko' ? '앱 열기 →' : 'Open app →'}
          </Link>
        )}
      </div>

      {items.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>No posts yet.</p>
      )}

      <Suspense fallback={<PagedListView {...list} page={1} />}>
        <PagedList {...list} />
      </Suspense>
    </div>
  )
}
