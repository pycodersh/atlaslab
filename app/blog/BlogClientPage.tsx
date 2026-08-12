'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans","Inter",system-ui,sans-serif'

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

type Post = {
  slug: string
  title: string
  description: string | null
  app: string
  locale: string
  category: string | null
  published_at: string
}

function buildUrl(app: string, page?: number) {
  const params = new URLSearchParams()
  if (app !== 'all') params.set('app', app)
  if (page && page > 1) params.set('page', String(page))
  const q = params.toString()
  return q ? `/blog?${q}` : '/blog'
}

export function BlogClientPage({
  posts,
  activeApp,
  totalPages,
  currentPage,
  pageTitle,
}: {
  posts: Post[]
  activeApp: string
  totalPages: number
  currentPage: number
  pageTitle: string
}) {
  const [lang, setLang] = useState<'EN' | 'KO'>('EN')

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; scrollbar-gutter: stable; }
        body { background: #F9F8F6; color: #111; overflow-x: hidden; scrollbar-gutter: stable; }

        /* ── Hero ──────────────────────────────────────────────────── */
        .bl-hero {
          background: #121212;
          padding: 52px 0 60px;
        }
        @media (max-width: 700px) {
          .bl-hero { padding: 36px 0 48px; }
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
          background: transparent; border: none;
          border-bottom: 2px solid transparent;
          padding: 0 0 12px; margin-right: 28px;
          font-family: ${BODY};
          font-size: 14px; font-weight: 500;
          color: #888; cursor: pointer;
          text-decoration: none; white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .bl-tab:hover { color: #111; border-bottom-color: rgba(200,16,46,0.35); }
        .bl-tab.active { color: #111; font-weight: 700; border-bottom-color: #C8102E; }

        /* ── Lang switcher ─────────────────────────────────────────── */
        .bl-lang {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0; padding-bottom: 12px;
        }
        .bl-lang-btn {
          font-family: ${BODY};
          font-size: 12px; font-weight: 500;
          color: #888; background: none; border: none;
          cursor: pointer; transition: color 0.15s;
          padding: 0;
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
          background: #F9F8F6; padding: 28px 24px;
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
          font-size: 11px; color: #aaa; letter-spacing: 0.02em;
        }

        /* ── Empty state ───────────────────────────────────────────── */
        .bl-empty {
          min-height: 380px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 60px 24px;
          border: 1px solid #E5E3DF;
          background: #F9F8F6;
          margin-bottom: 48px;
          gap: 0;
        }
        .bl-empty-icon {
          width: 48px; height: 48px;
          border: 1.5px solid #E5E3DF;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .bl-empty-title {
          font-family: ${BODY};
          font-size: 18px; font-weight: 700;
          color: #111; margin-bottom: 8px;
        }
        .bl-empty-desc {
          font-family: ${BODY};
          font-size: 14px; color: #777;
          line-height: 1.65; max-width: 320px;
          margin-bottom: 24px;
        }
        .bl-empty-action {
          font-family: ${BODY};
          font-size: 13px; font-weight: 600;
          background: transparent;
          border: 1.5px solid #C8102E;
          color: #C8102E;
          padding: 10px 22px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.02em;
        }
        .bl-empty-action:hover { background: #C8102E; color: #fff; }

        /* ── Pagination ────────────────────────────────────────────── */
        .bl-pag {
          display: flex; align-items: center; justify-content: center;
          gap: 4px; margin-bottom: 64px; flex-wrap: wrap;
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
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .bl-ko-msg { font-family: ${BODY}; font-size: 13px; color: #aaa; }
        .bl-ko-link {
          font-family: ${BODY}; font-size: 13px; font-weight: 600;
          color: #C8102E; text-decoration: none;
        }
        .bl-ko-link:hover { text-decoration: underline; }
      `}</style>

      {/* ── Hero ── */}
      <section className="bl-hero">
        <div className="bl-wrap">
          <Link href="/" className="bl-back">← Atlas Lab</Link>
          <p className="bl-kicker">Articles</p>
          <h1 className="bl-h1">
            {lang === 'KO' ? '한국어 아티클' : pageTitle}
          </h1>
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
                  className={`bl-tab${activeApp === tab.key && lang === 'EN' ? ' active' : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <div className="bl-lang">
              <button
                className={`bl-lang-btn${lang === 'EN' ? ' active' : ''}`}
                onClick={() => setLang('EN')}
              >
                EN
              </button>
              <span className="bl-lang-div">/</span>
              <button
                className={`bl-lang-btn${lang === 'KO' ? ' active' : ''}`}
                onClick={() => setLang('KO')}
              >
                KO
              </button>
            </div>
          </div>

          {/* KO Empty State */}
          {lang === 'KO' ? (
            <div className="bl-empty">
              <div className="bl-empty-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z"/>
                  <line x1="9" y1="21" x2="15" y2="21"/>
                  <line x1="10" y1="17" x2="10" y2="21"/>
                  <line x1="14" y1="17" x2="14" y2="21"/>
                </svg>
              </div>
              <h3 className="bl-empty-title">No articles in Korean yet</h3>
              <p className="bl-empty-desc">
                We are currently working on Korean content. Switch back to English to read all the latest posts.
              </p>
              <button className="bl-empty-action" onClick={() => setLang('EN')}>
                Switch to English →
              </button>
            </div>
          ) : (
            <>
              {/* EN post grid */}
              {(!posts || posts.length === 0) ? (
                <div className="bl-empty">
                  <h3 className="bl-empty-title">No articles yet for this filter</h3>
                  <p className="bl-empty-desc">Try a different filter or check back later.</p>
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
                    <Link href={buildUrl(activeApp, currentPage - 1)} className="bl-pag-btn">
                      ← Prev
                    </Link>
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
                    <Link href={buildUrl(activeApp, currentPage + 1)} className="bl-pag-btn">
                      Next →
                    </Link>
                  )}
                </div>
              )}

              {/* KO teaser (only when EN and no KO state active) */}
              <div className="bl-ko-teaser">
                <p className="bl-ko-msg">한국어 블로그도 있어요</p>
                <button className="bl-ko-link" onClick={() => setLang('KO')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  → 한국어로 보기
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
