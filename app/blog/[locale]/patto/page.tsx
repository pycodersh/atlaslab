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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const otherLocale = locale === 'ko' ? 'en' : 'ko'
  const title = locale === 'ko' ? 'Patto 블로그' : 'Patto Blog'

  // noindex when no active posts (e.g. all paused) — auto-removed when posts return
  const { data: sample } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', locale)
    .eq('app', 'patto')
    .lte('published_at', new Date().toISOString())
    .eq('is_paused', false)
    .limit(1)
  const hasContent = (sample?.length ?? 0) > 0

  return {
    title,
    description: 'Tips and guides on mastering English patterns.',
    robots: hasContent ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `${BASE}/blog/${locale}/patto`,
      languages: {
        [locale]:      `${BASE}/blog/${locale}/patto`,
        [otherLocale]: `${BASE}/blog/${otherLocale}/patto`,
      },
    },
  }
}

const POSTS_PER_PAGE = 10

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, tags, published_at')
    .eq('locale', locale)
    .eq('app', 'patto')
    .lte('published_at', new Date().toISOString())
    .eq('is_paused', false)
    .order('published_at', { ascending: false })

  const items = (posts || []).map(post => (
    <Link key={post.slug} href={`/blog/${locale}/patto/${post.slug}`} style={{ textDecoration: 'none' }}>
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
            Patto Team · {new Date(post.published_at).toLocaleDateString(
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
    basePath: `/blog/${locale}/patto`,
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
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{locale === 'ko' ? 'Patto 블로그' : 'Patto Blog'}</span>
      </div>

      <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          BLOG
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Learning Insights</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          {locale === 'ko' ? '영어 패턴 마스터를 위한 팁과 가이드' : 'Tips and guides on mastering English patterns.'}
        </p>
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
