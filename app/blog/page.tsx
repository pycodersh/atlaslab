import { Fragment } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  return {
    title: 'Blog — Atlas Lab',
    description:
      'Tips, guides, and insights on Korean learning, English patterns, Korean recipes, and career growth — from Atlas Lab.',
    robots: currentPage > 1 ? { index: false, follow: true } : undefined,
    alternates: { canonical: `${BASE}/blog` },
  }
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1
  const now = new Date().toISOString()

  // Count EN posts (primary locale for /blog)
  const { data: countRows } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', 'en')
    .eq('is_paused', false)
    .lte('published_at', now)

  const totalCount = countRows?.length || 0
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, published_at')
    .eq('locale', 'en')
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
    .range(from, to)

  // Distinct (locale, app) combos for category chips
  const { data: catRows } = await supabase
    .from('blog_posts')
    .select('locale, app')
    .eq('is_paused', false)
    .lte('published_at', now)

  const seenCats = new Set<string>()
  const categories: Array<{ locale: string; app: string }> = []
  for (const r of catRows || []) {
    const key = `${r.locale}:${r.app}`
    if (!seenCats.has(key)) { seenCats.add(key); categories.push(r) }
  }

  return (
    <div style={{
      background: '#0a0a1a', minHeight: '100vh', color: 'white',
      fontFamily: '"DM Sans","Inter",system-ui,sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Back nav */}
        <Link href="/" style={{
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none', letterSpacing: '0.04em',
        }}>
          ← Atlas Lab
        </Link>

        {/* Header */}
        <div style={{ marginTop: 32, marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 8px' }}>
            BLOG
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
            All Posts
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Tips, guides, and insights from Atlas Lab.
          </p>
        </div>

        {/* Language tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 12px',
            borderRadius: 999, background: '#7c6fff', color: 'white',
            display: 'inline-block',
          }}>EN</span>
          <Link href="/blog/ko" style={{
            fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 999,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
          }}>KO</Link>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
            {categories.map(c => {
              const meta = getAppMeta(c.app)
              return (
                <Link
                  key={`${c.locale}:${c.app}`}
                  href={`/blog/${c.locale}/${c.app}`}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: meta.color,
                    textDecoration: 'none',
                  }}
                >
                  {meta.label} · {c.locale.toUpperCase()}
                </Link>
              )
            })}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        {/* Post list */}
        {(!posts || posts.length === 0) ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', paddingTop: 24 }}>No posts yet.</p>
        ) : (
          <div>
            {posts.map(post => {
              const meta = getAppMeta(post.app)
              return (
                <div key={post.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Link
                    href={`/blog/en/${post.app}/${post.slug}`}
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
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
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
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {currentPage > 1 && (
              <Link href={`/blog?page=${currentPage - 1}`} style={pagLinkStyle(false)}>← Prev</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', padding: '0 2px' }}>…</span>
                  )}
                  <Link href={`/blog?page=${p}`} style={pagLinkStyle(p === currentPage)}>{p}</Link>
                </Fragment>
              ))}
            {currentPage < totalPages && (
              <Link href={`/blog?page=${currentPage + 1}`} style={pagLinkStyle(false)}>Next →</Link>
            )}
          </div>
        )}
        {totalPages > 1 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 10 }}>
            Page {currentPage} of {totalPages} · {totalCount} posts
          </p>
        )}

        {/* KO teaser */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            한국어 블로그도 있어요
          </p>
          <Link href="/blog/ko" style={{
            fontSize: 13, color: '#a89fff', textDecoration: 'none', fontWeight: 600,
          }}>
            → 한국어 블로그
          </Link>
        </div>

      </div>
    </div>
  )
}

function pagLinkStyle(active: boolean) {
  return {
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    padding: '5px 12px',
    borderRadius: 8 as const,
    textDecoration: 'none' as const,
    background: active ? '#7c6fff' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#7c6fff' : 'rgba(255,255,255,0.1)'}`,
    color: active ? 'white' : 'rgba(255,255,255,0.55)',
    display: 'inline-block' as const,
  }
}
