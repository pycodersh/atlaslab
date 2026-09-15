'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { BLOG_TABS, layoutForKey, tabDescription } from '@/lib/blog/sections'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'
import { BlogThumb } from '@/components/blog/BlogThumb'
import { PostListRow } from '@/components/blog/PostListRow'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans","Inter",system-ui,sans-serif'

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
  thumb: BlogThumbnail | null
}

/** 탭은 화면상의 필터라 쿼리 파라미터로만 표현한다(새 라우트 없음). */
function buildUrl(tab: string, opts: { lang?: 'en' | 'ko'; page?: number } = {}) {
  const params = new URLSearchParams()
  if (tab !== 'all') params.set('tab', tab)
  if (opts.lang === 'ko') params.set('lang', 'ko')
  if (opts.page && opts.page > 1) params.set('page', String(opts.page))
  const q = params.toString()
  return q ? `/blog?${q}` : '/blog'
}

export function BlogClientPage({
  posts,
  activeTab,
  activeLang,
  totalPages,
  currentPage,
  pageTitle,
}: {
  posts: Post[]
  activeTab: string
  activeLang: 'en' | 'ko'
  totalPages: number
  currentPage: number
  pageTitle: string
}) {
  const lang: 'EN' | 'KO' = activeLang === 'ko' ? 'KO' : 'EN'
  // 격자로 그릴지 세로 리스트로 그릴지는 홈과 같은 기준(sections.ts)을 본다
  const isList = layoutForKey(activeTab) === 'list'

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'KO' ? 'ko-KR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; scrollbar-gutter: stable; }
        body { background: #F9F8F6; color: #111; overflow-x: hidden; scrollbar-gutter: stable; }

        /* ── Hero ──────────────────────────────────────────────────── */
        /* 아래 여백은 탭 바(.bl-filterbar, padding-top 32px)와 붙는 자리라
           히어로 쪽을 32/40px 으로 줄여 둘이 한 덩어리로 읽히게 한다. */
        .bl-hero {
          background: #121212;
          padding: 36px 0 32px;
        }
        @media (min-width: 768px) {
          .bl-hero { padding: 52px 0 40px; }
        }
        /* 뒤로가기 — 텍스트 링크에서 고스트 알약 버튼으로 */
        .bl-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: ${BODY};
          font-size: 12px; line-height: 1;
          color: #A3A3A3; text-decoration: none;
          padding: 6px 12px; border-radius: 999px;
          border: 1px solid #262626;
          background: rgba(23,23,23,0.6);
          margin-bottom: 20px;
          transition: color 0.15s, background 0.15s;
        }
        .bl-back:hover { color: #fff; background: #262626; }
        .bl-kicker {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #A3A3A3;
          margin-bottom: 8px;
        }
        /* 세리프는 유지하고 크기만 30/36px 로 눌러 설명·탭과 위계를 맞춘다 */
        .bl-h1 {
          font-family: ${SERIF};
          font-size: 30px;
          font-weight: 700; line-height: 1.15;
          letter-spacing: -0.025em;
          color: #fff;
          margin-bottom: 12px;
        }
        @media (min-width: 768px) {
          .bl-h1 { font-size: 36px; }
        }
        .bl-sub {
          font-family: ${BODY};
          font-size: 14px; color: #A3A3A3;
          line-height: 1.625; max-width: 576px;
        }
        @media (min-width: 768px) {
          .bl-sub { font-size: 16px; }
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

        /* ── Post grid ─────────────────────────────────────────────── */
        /* 카드 사이 1px 구분선 — 컨테이너 배경이 아니라 카드 테두리로 그린다.
           행이 덜 찼을 때 빈 칸이 회색 블록으로 보이지 않는다.
           위·왼쪽은 컨테이너가, 오른쪽·아래는 각 카드가 맡아 1px 로 맞물린다. */
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);   /* 태블릿 */
          gap: 0;
          border-top: 1px solid #E5E1DC;
          border-left: 1px solid #E5E1DC;
          margin-bottom: 48px;
        }
        @media (min-width: 1200px) {
          .bl-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 620px) {
          .bl-grid { grid-template-columns: 1fr; }
        }
        .bl-card {
          background: #F9F8F6;
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
          border-right: 1px solid #E5E1DC;
          border-bottom: 1px solid #E5E1DC;
          transition: background 0.15s;
        }
        /* 썸네일은 카드 가장자리에 붙고 글은 안쪽에 — 패딩을 본문 래퍼로 옮겼다 */
        .bl-body {
          padding: 28px 24px;
          display: flex; flex-direction: column; flex: 1;
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

        /* 세로 리스트(.plist) 여백만 목록 페이지 기준으로 맞춘다.
           나머지 규칙은 globals.css 에 있다(홈과 공유). */
        .plist { margin-bottom: 48px; }

        /* 한국어 안내 블록을 걷어냈으므로, 페이지네이션이 없는 탭에서는
           마지막 요소가 푸터와 64px 을 유지하도록 맞춘다(.bl-pag 와 동일). */
        .bl-grid:last-child, .bl-empty:last-child, .plist:last-child { margin-bottom: 64px; }
      `}</style>

      {/* ── Hero ── */}
      <section className="bl-hero">
        <div className="bl-wrap">
          <Link href="/" className="bl-back">← Atlas Lab</Link>
          <p className="bl-kicker">Articles</p>
          <h1 className="bl-h1">
            {lang === 'KO' ? '한국어 아티클' : pageTitle}
          </h1>
          <p className="bl-sub">{tabDescription(activeTab)}</p>
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ background: '#F9F8F6' }}>
        <div className="bl-wrap">

          {/* Filter bar */}
          <div className="bl-filterbar">
            <div className="bl-tabs">
              {BLOG_TABS.map(tab => (
                <Link
                  key={tab.key}
                  href={buildUrl(tab.key)}
                  className={`bl-tab${activeTab === tab.key ? ' active' : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Post grid (EN & KO 공통) */}
          {(!posts || posts.length === 0) ? (
            <div className="bl-empty">
              <h3 className="bl-empty-title">No articles yet for this filter</h3>
              <p className="bl-empty-desc">Try a different filter or check back later.</p>
            </div>
          ) : isList ? (
            <div className="plist">
              {posts.map(post => (
                <PostListRow
                  key={post.slug}
                  href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                  kicker={post.category ?? APP_LABEL[post.app] ?? post.app}
                  title={post.title}
                  excerpt={post.description}
                  date={formatDate(post.published_at)}
                />
              ))}
            </div>
          ) : (
            <div className="bl-grid">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                  className="bl-card"
                >
                  <BlogThumb thumb={post.thumb} alt={post.title} />
                  <div className="bl-body">
                    {/* 주제 탭에서는 탭 이름과 중복이라 라벨을 숨긴다 */}
                    {activeTab === 'all' && (
                      <div className="bl-cat">
                        {post.category ?? APP_LABEL[post.app] ?? post.app}
                      </div>
                    )}
                    <div className="bl-title">{post.title}</div>
                    {post.description && (
                      <div className="bl-desc">{post.description}</div>
                    )}
                    <div className="bl-date">{formatDate(post.published_at)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bl-pag">
              {currentPage > 1 && (
                <Link href={buildUrl(activeTab, { lang: activeLang, page: currentPage - 1 })} className="bl-pag-btn">
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
                      href={buildUrl(activeTab, { lang: activeLang, page: p })}
                      className={`bl-pag-btn${p === currentPage ? ' active' : ''}`}
                    >
                      {p}
                    </Link>
                  </Fragment>
                ))}
              {currentPage < totalPages && (
                <Link href={buildUrl(activeTab, { lang: activeLang, page: currentPage + 1 })} className="bl-pag-btn">
                  Next →
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
