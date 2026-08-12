import { Fragment } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans","Inter",system-ui,sans-serif'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const POSTS_PER_PAGE = 20

/* ── App filter tabs ──────────────────────────────────────────────────── */
const APP_TABS = [
  { key: 'all',       label: 'All Articles' },
  { key: 'k-patto',  label: 'K-Patto'      },
  { key: 'k-pantry', label: 'K-Pantry'     },
  { key: 'patto',    label: 'Patto'        },
] as const

const APP_LABEL: Record<string, string> = {
  'k-patto':  'K-Patto',
  'patto':    'Patto',
  'kpantry':  'K-Pantry',
  'k-pantry': 'K-Pantry',
}

function buildUrl(app: string, page?: number) {
  const params = new URLSearchParams()
  if (app !== 'all') params.set('app', app)
  if (page && page > 1) params.set('page', String(page))
  const q = params.toString()
  return q ? `/blog?${q}` : '/blog'
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; app?: string }>
}): Promise<Metadata> {
  const { page, app } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const appLabel = app ? APP_LABEL[app] ?? app : null
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
  searchParams: Promise<{ page?: string; app?: string }>
}) {
  const { page, app } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const activeApp  = app ?? 'all'
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to   = from + POSTS_PER_PAGE - 1
  const now  = new Date().toISOString()

  /* ── Fetch total count for pagination ── */
  let countQuery = supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', 'en')
    .eq('is_paused', false)
    .lte('published_at', now)

  if (activeApp !== 'all') {
    // k-pantry may also be stored as 'kpantry' — handle both
    if (activeApp === 'k-pantry') {
      countQuery = supabase
        .from('blog_posts')
        .select('id')
        .eq('locale', 'en')
        .eq('is_paused', false)
        .lte('published_at', now)
        .in('app', ['k-pantry', 'kpantry'])
    } else {
      countQuery = countQuery.eq('app', activeApp)
    }
  }

  const { data: countRows } = await countQuery
  const totalCount = countRows?.length || 0
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  /* ── Fetch posts ── */
  let postsQuery = supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at')
    .eq('locale', 'en')
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (activeApp !== 'all') {
    if (activeApp === 'k-pantry') {
      postsQuery = supabase
        .from('blog_posts')
        .select('slug, title, description, app, locale, category, published_at')
        .eq('locale', 'en')
        .eq('is_paused', false)
        .lte('published_at', now)
        .in('app', ['k-pantry', 'kpantry'])
        .order('published_at', { ascending: false })
        .range(from, to)
    } else {
      postsQuery = postsQuery.eq('app', activeApp)
    }
  }

  const { data: posts } = await postsQuery

  const pageTitle = activeApp !== 'all'
    ? (APP_LABEL[activeApp] ?? activeApp)
    : 'All Articles'

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #F9F8F6; color: #111; overflow-x: hidden; }

        /* ── Hero ──────────────────────────────────────────────────── */
        .bl-hero {
          background: #121212;
          padding: 52px 48px 60px;
        }
        @media (max-width: 700px) {
          .bl-hero { padding: 36px 20px 48px; }
        }
        .bl-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: ${BODY};
          font-size: 13px; color: rgba(255,255,255,0.45);
          text-decoration: none; margin-bottom: 28px;
          transition: color 0.15s;
        }
        .bl-back:hover { color: rgba(255,255,255,0.8); }
        .bl-kicker {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 12px;
        }
        .bl-h1 {
          font-family: ${SERIF};
          font-size: clamp(26px, 3.4vw, 44px);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 12px;
        }
        .bl-sub {
          font-family: ${BODY};
          font-size: 14px; color: rgba(255,255,255,0.46);
          line-height: 1.65; max-width: 480px;
        }

        /* ── Wrap ──────────────────────────────────────────────────── */
        .bl-wrap {
          max-width: 1060px; margin: 0 auto;
          padding-left: 48px; padding-right: 48px;
        }
        @media (max-width: 700px) {
          .bl-wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Filter bar ────────────────────────────────────────────── */
        .bl-filterbar {
          display: flex; align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E5E3DF;
          padding-top: 32px;
          margin-bottom: 36px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          gap: 12px;
        }
        .bl-tabs {
          display: flex; align-items: center; gap: 0;
          flex-shrink: 0;
        }
        .bl-tab {
          display: inline-block;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0 0 12px; margin-right: 28px;
          font-family: ${BODY};
          font-size: 14px; font-weight: 500;
          color: #888; cursor: pointer;
          text-decoration: none; white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .bl-tab:hover {
          color: #111;
          border-bottom-color: rgba(200,16,46,0.35);
        }
        .bl-tab.active {
          color: #111; font-weight: 700;
          border-bottom-color: #C8102E;
        }
        .bl-lang {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0; padding-bottom: 12px;
        }
        .bl-lang-btn {
          font-family: ${BODY};
          font-size: 12px; font-weight: 500;
          color: #888; text-decoration: none;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .bl-lang-btn:hover { color: #111; }
        .bl-lang-btn.active { color: #C8102E; font-weight: 700; }
        .bl-lang-div { font-size: 11px; color: #D0CEC8; }

        /* ── Post grid ─────────────────────────────────────────────── */
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: #DDDBD8;
          border: 1px solid #DDDBD8;
          margin-bottom: 48px;
        }
        @media (max-width: 620px) {
          .bl-grid { grid-template-columns: 1fr; }
        }
        .bl-card {
          background: #F9F8F6;
          padding: 28px 24px;
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
          transition: background 0.15s;
        }
        .bl-card:hover { background: #ECEAE7; }
        .bl-cat {
          font-family: ${BODY};
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #C8102E; margin-bottom: 10px;
        }
        .bl-title {
          font-family: ${SERIF};
          font-size: 16px; font-weight: 700;
          color: #111; line-height: 1.3;
          margin-bottom: 10px; letter-spacing: -0.01em;
          flex: 0 0 auto;
        }
        .bl-desc {
          font-family: ${BODY};
          font-size: 12.5px; color: #777;
          line-height: 1.65; margin-bottom: 16px; flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bl-date {
          font-family: ${BODY};
          font-size: 11px; color: #aaa;
          letter-spacing: 0.02em;
        }

        /* ── Empty state ───────────────────────────────────────────── */
        .bl-empty {
          padding: 48px 24px; text-align: center;
          background: #F9F8F6; border: 1px solid #E5E3DF;
          margin-bottom: 48px;
        }
        .bl-empty-msg {
          font-family: ${BODY};
          font-size: 14px; color: #aaa;
        }

        /* ── Pagination ────────────────────────────────────────────── */
        .bl-pag {
          display: flex; align-items: center;
          justify-content: center;
          gap: 4px; margin-bottom: 64px;
          flex-wrap: wrap;
        }
        .bl-pag-btn {
          font-family: ${BODY};
          font-size: 13px; font-weight: 500;
          padding: 6px 14px;
          text-decoration: none; color: #666;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .bl-pag-btn:hover { color: #111; border-bottom-color: rgba(200,16,46,0.35); }
        .bl-pag-btn.active { color: #111; font-weight: 700; border-bottom-color: #C8102E; }
        .bl-pag-ellipsis { color: #ccc; font-size: 13px; padding: 6px 4px; }

        /* ── KO teaser ─────────────────────────────────────────────── */
        .bl-ko-teaser {
          border-top: 1px solid #E5E3DF;
          padding: 28px 0 64px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
          flex-wrap: wrap;
        }
        .bl-ko-msg {
          font-family: ${BODY};
          font-size: 13px; color: #aaa;
        }
        .bl-ko-link {
          font-family: ${BODY};
          font-size: 13px; font-weight: 600;
          color: #C8102E; text-decoration: none;
        }
        .bl-ko-link:hover { text-decoration: underline; }
      `}</style>

      {/* ── Hero ── */}
      <section className="bl-hero">
        <div className="bl-wrap">
          <Link href="/" className="bl-back">← Atlas Lab</Link>
          <p className="bl-kicker">Articles</p>
          <h1 className="bl-h1">{pageTitle}</h1>
          <p className="bl-sub">
            Tips, guides, and insights on Korean learning, English patterns, and Korean cooking.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ background: '#F9F8F6' }}>
        <div className="bl-wrap">

          {/* Filter bar */}
          <div className="bl-filterbar">
            <div className="bl-tabs">
              {APP_TABS.map(tab => (
                <Link
                  key={tab.key}
                  href={buildUrl(tab.key)}
                  className={`bl-tab${activeApp === tab.key ? ' active' : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <div className="bl-lang">
              <Link href="/blog" className={`bl-lang-btn active`}>EN</Link>
              <span className="bl-lang-div">/</span>
              <Link href="/blog/ko" className="bl-lang-btn">KO</Link>
            </div>
          </div>

          {/* Post grid */}
          {(!posts || posts.length === 0) ? (
            <div className="bl-empty">
              <p className="bl-empty-msg">No articles yet for this filter.</p>
            </div>
          ) : (
            <div className="bl-grid">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                  className="bl-card"
                >
                  <div className="bl-cat">
                    {post.category ?? APP_LABEL[post.app] ?? post.app}
                  </div>
                  <div className="bl-title">{post.title}</div>
                  {post.description && (
                    <div className="bl-desc">{post.description}</div>
                  )}
                  <div className="bl-date">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bl-pag">
              {currentPage > 1 && (
                <Link
                  href={buildUrl(activeApp, currentPage - 1)}
                  className="bl-pag-btn"
                >← Prev</Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="bl-pag-ellipsis">…</span>
                    )}
                    <Link
                      href={buildUrl(activeApp, p)}
                      className={`bl-pag-btn${p === currentPage ? ' active' : ''}`}
                    >
                      {p}
                    </Link>
                  </Fragment>
                ))}
              {currentPage < totalPages && (
                <Link
                  href={buildUrl(activeApp, currentPage + 1)}
                  className="bl-pag-btn"
                >Next →</Link>
              )}
            </div>
          )}

          {/* KO teaser */}
          <div className="bl-ko-teaser">
            <p className="bl-ko-msg">한국어 블로그도 있어요</p>
            <Link href="/blog/ko" className="bl-ko-link">→ 한국어 블로그</Link>
          </div>

        </div>
      </div>
    </>
  )
}
