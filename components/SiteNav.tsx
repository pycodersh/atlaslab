'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { MODAL_APPS, NAV_APPS } from '@/lib/apps'
import { LanguageSelector } from '@/components/LanguageSelector'
import { BLOG_GROUPS } from '@/lib/blog/sections'
import { subcategoriesFor } from '@/lib/blog/subcategories'

/** 글 카테고리 메뉴 — Korean · Explore Korea · Food · Life (구조는 lib/blog/sections 한 곳에서 온다) */
const NAV_CATEGORIES = BLOG_GROUPS.map(g => ({
  key: g.key as string,
  label: g.title as string,
  href: `/blog?tab=${g.key}`,
  subs: subcategoriesFor(g.key).map(sub => ({ label: sub.label, href: `/blog?tab=${g.key}&sub=${sub.key}` })),
}))

/**
 * Site-wide navigation bar.
 * Red background (#C8102E via --brand-red CSS var).
 * Used in app/blog/layout.tsx, essential pages, and app/page.tsx.
 *
 * 인터랙션이 둘 있어 클라이언트 컴포넌트다.
 *  - Apps 드롭다운: 데스크톱은 호버+클릭, 모바일(≤480px)은 클릭으로 펼치는 목록
 *  - Get started: 특정 앱으로 바로 보내지 않고 "Choose Your Path" 모달을 연다
 *
 * Mobile (≤480px): logo + 3 links always visible (gap shrinks).
 * "Get started" CTA hidden at ≤480px; links NEVER hidden.
 */
export function SiteNav() {
  // 호버와 클릭을 따로 둔다. 하나로 합치면 마우스 사용자가 버튼을 누르는 순간
  // (hover 로 이미 열린 것을) 클릭 토글이 곧바로 닫아버린다.
  // 열림 = 호버 중이거나, 클릭으로 고정했거나. 터치·키보드는 호버가 없으니 클릭만 쓴다.
  const [hoverOpen, setHoverOpen] = useState(false)
  const [clickOpen, setClickOpen] = useState(false)
  const appsOpen = hoverOpen || clickOpen
  const closeApps = () => { setHoverOpen(false); setClickOpen(false) }

  // 좁은 화면용 "Articles" 드롭다운(클릭) — 넓은 화면은 카테고리 링크가 그대로 보인다
  const [articlesOpen, setArticlesOpen] = useState(false)
  const articlesRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!articlesOpen) return
    const onDown = (e: MouseEvent) => {
      if (articlesRef.current && !articlesRef.current.contains(e.target as Node)) setArticlesOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setArticlesOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [articlesOpen])

  const [modalOpen, setModalOpen] = useState(false)
  const appsRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  // 바깥 클릭 / Esc 로 드롭다운 닫기
  useEffect(() => {
    if (!appsOpen) return
    const onDown = (e: MouseEvent) => {
      if (appsRef.current && !appsRef.current.contains(e.target as Node)) closeApps()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeApps() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [appsOpen])

  // 모달: Esc 닫기 + 배경 스크롤 잠금 + 닫기 버튼에 포커스
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [modalOpen])

  return (
    <>
      <style>{`
        .site-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 56px;
          background: var(--brand-red, #C8102E);
          font-family: "DM Sans","Inter",system-ui,sans-serif;
        }
        .site-nav-right { display: flex; align-items: center; gap: 28px; }
        .site-nav-links { display: flex; align-items: center; gap: 28px; }
        .site-nav-link {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.82);
          text-decoration: none; letter-spacing: 0.01em;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .site-nav-link:hover { color: #fff; }
        .site-nav-cta {
          display: inline-flex; align-items: center;
          padding: 6px 16px;
          background: var(--ink, #111111);
          color: #fff;
          font-size: 12px; font-weight: 700;
          text-decoration: none; white-space: nowrap;
          letter-spacing: 0.03em;
          border: none; cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .site-nav-cta:hover { background: #333; }

        /* ── Apps 드롭다운 ─────────────────────────────────────── */
        .nav-apps { position: relative; display: flex; align-items: center; }
        .nav-apps-btn {
          display: inline-flex; align-items: center; gap: 4px;
          background: none; border: none; padding: 0; cursor: pointer;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.82); letter-spacing: 0.01em;
          white-space: nowrap; transition: color 0.15s;
        }
        .nav-apps-btn:hover, .nav-apps[data-open="true"] .nav-apps-btn { color: #fff; }
        .nav-apps-caret { transition: transform 0.15s; }
        .nav-apps[data-open="true"] .nav-apps-caret { transform: rotate(180deg); }

        .nav-apps-menu {
          position: absolute; top: calc(100% + 12px); left: 50%;
          transform: translateX(-50%);
          min-width: 230px;
          background: #fff;
          border: 1px solid var(--rule, #E5E1DC);
          box-shadow: 0 12px 32px rgba(0,0,0,0.10);
          padding: 6px;
          animation: navFade 0.14s ease-out;
        }
        .nav-apps-item {
          display: block; padding: 10px 12px;
          text-decoration: none; color: var(--ink, #111);
          transition: background 0.12s;
        }
        .nav-apps-item:hover { background: var(--paper-warm, #F7F5F2); }
        .nav-apps-name { font-size: 13px; font-weight: 700; display: block; }
        .nav-apps-desc {
          font-size: 11.5px; color: var(--ink-muted, #6B6B6B);
          display: block; margin-top: 2px; line-height: 1.45;
        }

        @keyframes navFade { from { opacity: 0; transform: translate(-50%, -4px); } }

        /* ── 글 카테고리 메뉴 (넓은 화면: 링크 + 호버 서브메뉴 / 좁은 화면: Articles 드롭다운) ── */
        .nav-cats { display: flex; align-items: center; gap: 24px; }
        .nav-cat { position: relative; display: flex; align-items: center; }
        .nav-cat-menu { display: none; position: absolute; top: 100%; left: -14px; padding-top: 14px; z-index: 5; }
        .nav-cat:hover .nav-cat-menu, .nav-cat:focus-within .nav-cat-menu { display: block; }
        .nav-cat-menu-in {
          min-width: 200px; background: #fff; border: 1px solid var(--rule, #E5E1DC);
          box-shadow: 0 12px 32px rgba(0,0,0,0.10); padding: 6px;
        }
        .nav-sub {
          display: block; padding: 8px 12px; font-size: 13px; font-weight: 500;
          color: var(--ink, #111); text-decoration: none; white-space: nowrap;
          transition: background 0.12s;
        }
        .nav-sub:hover { background: var(--paper-warm, #F7F5F2); }
        .nav-sub-all { font-weight: 700; }
        .nav-articles { display: none; position: relative; align-items: center; }
        .nav-articles-menu {
          position: absolute; top: calc(100% + 12px); right: -8px; min-width: 250px;
          max-height: 70vh; overflow-y: auto;
          background: #fff; border: 1px solid var(--rule, #E5E1DC);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12); padding: 8px 6px;
        }
        .nav-articles-group { padding: 4px 0 6px; border-bottom: 1px solid var(--rule, #E5E1DC); }
        .nav-articles-group:last-of-type { border-bottom: none; }
        .nav-articles-head {
          display: block; padding: 6px 12px 2px; font-size: 13px; font-weight: 800;
          color: var(--ink, #111); text-decoration: none;
        }
        .nav-articles-subs { display: flex; flex-wrap: wrap; gap: 2px 4px; padding: 0 8px; }
        .nav-articles-subs .nav-sub { padding: 5px 8px; font-size: 12.5px; color: var(--ink-muted, #6B6B6B); }
        @media (max-width: 1040px) {
          .nav-cats { display: none; }
          .nav-articles { display: flex; }
        }

        /* ── Choose Your Path 모달 ─────────────────────────────── */
        .cyp-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(17,17,17,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: cypFade 0.16s ease-out;
        }
        .cyp-modal {
          position: relative;
          background: var(--paper, #fff);
          border: 1px solid var(--rule, #E5E1DC);
          width: 100%; max-width: 460px;
          padding: 36px 32px 32px;
          animation: cypRise 0.2s ease-out;
        }
        .cyp-title {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 26px; font-weight: 700; color: var(--ink, #111);
          text-align: center; margin: 0 0 6px; letter-spacing: -0.01em;
        }
        .cyp-sub {
          font-size: 13px; color: var(--ink-muted, #6B6B6B);
          text-align: center; margin: 0 0 24px; line-height: 1.6;
        }
        .cyp-list { display: flex; flex-direction: column; gap: 10px; }
        .cyp-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px;
          border: 1px solid var(--rule, #E5E1DC);
          padding: 16px 18px;
          text-decoration: none; color: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .cyp-card:hover {
          border-color: var(--brand-red, #C8102E);
          background: var(--paper-warm, #F7F5F2);
        }
        .cyp-card-name {
          font-size: 15px; font-weight: 700; color: var(--ink, #111);
          display: block; margin-bottom: 3px;
        }
        .cyp-card-desc {
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          display: block; line-height: 1.5;
        }
        .cyp-card-arrow {
          color: var(--brand-red, #C8102E); font-size: 16px; flex-shrink: 0;
        }
        .cyp-close {
          position: absolute; top: 12px; right: 12px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          color: var(--ink-muted, #6B6B6B); font-size: 20px; line-height: 1;
          font-family: inherit;
          transition: color 0.15s;
        }
        .cyp-close:hover { color: var(--ink, #111); }

        @keyframes cypFade { from { opacity: 0; } }
        @keyframes cypRise { from { opacity: 0; transform: translateY(8px); } }

        @media (prefers-reduced-motion: reduce) {
          .nav-apps-menu, .cyp-backdrop, .cyp-modal { animation: none; }
        }

        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 30px !important; }
          .site-nav-right { gap: 16px; }
          .site-nav-links { gap: 16px; }
          .site-nav-cta { display: none; }
          /* 좁은 화면에서는 가운데 띄우면 넘치므로 오른쪽 기준으로 붙인다 */
          .nav-apps-menu {
            left: auto; right: -16px; transform: none;
            min-width: 210px;
          }
          @keyframes navFade { from { opacity: 0; transform: translateY(-4px); } }
          .cyp-modal { padding: 32px 20px 24px; }
          .cyp-title { font-size: 22px; }
        }
      `}</style>

      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src="/atlaslab_nav_logo.png"
            alt="Atlas Lab"
            className="site-nav-logo"
            style={{ height: 38, width: 'auto', display: 'block' }}
          />
        </Link>

        <div className="site-nav-right">
          <div className="site-nav-links">
            {/* Apps — 호버(데스크톱) / 클릭(모바일·키보드) 드롭다운 */}
            <div
              className="nav-apps"
              ref={appsRef}
              data-open={appsOpen}
              onMouseEnter={() => setHoverOpen(true)}
              onMouseLeave={closeApps}
            >
              <button
                type="button"
                className="nav-apps-btn"
                aria-expanded={appsOpen}
                aria-haspopup="true"
                onClick={() => setClickOpen(o => !o)}
              >
                Apps
                <svg
                  className="nav-apps-caret"
                  width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden="true"
                >
                  <path d="M1 1.5L4.5 5L8 1.5" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {appsOpen && (
                <div className="nav-apps-menu" role="menu">
                  {NAV_APPS.map(app => (
                    <Link
                      key={app.key}
                      href={app.href}
                      role="menuitem"
                      className="nav-apps-item"
                      onClick={closeApps}
                    >
                      <span className="nav-apps-name notranslate" translate="no">{app.name}</span>
                      <span className="nav-apps-desc">{app.blurb}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 글 카테고리: 넓은 화면은 링크 + 호버 서브메뉴 */}
            <div className="nav-cats">
              {NAV_CATEGORIES.map(cat => (
                <div key={cat.key} className="nav-cat">
                  <Link href={cat.href} className="site-nav-link">{cat.label}</Link>
                  <div className="nav-cat-menu">
                    <div className="nav-cat-menu-in">
                      <Link href={cat.href} className="nav-sub nav-sub-all">All {cat.label}</Link>
                      {cat.subs.map(sub => (
                        <Link key={sub.href} href={sub.href} className="nav-sub">{sub.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/blog" className="site-nav-link">All articles</Link>
            </div>

            {/* 좁은 화면: Articles 한 개로 접어 둔다 */}
            <div className="nav-articles" ref={articlesRef}>
              <button
                type="button"
                className="nav-apps-btn"
                aria-expanded={articlesOpen}
                aria-haspopup="true"
                onClick={() => setArticlesOpen(o => !o)}
              >
                Articles
                <svg width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden="true"
                  style={{ transform: articlesOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}>
                  <path d="M1 1.5L4.5 5L8 1.5" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {articlesOpen && (
                <div className="nav-articles-menu" role="menu">
                  {NAV_CATEGORIES.map(cat => (
                    <div key={cat.key} className="nav-articles-group">
                      <Link href={cat.href} className="nav-articles-head" role="menuitem" onClick={() => setArticlesOpen(false)}>
                        {cat.label}
                      </Link>
                      <div className="nav-articles-subs">
                        {cat.subs.map(sub => (
                          <Link key={sub.href} href={sub.href} className="nav-sub" role="menuitem" onClick={() => setArticlesOpen(false)}>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link href="/blog" className="nav-articles-head" role="menuitem" style={{ paddingTop: 10 }} onClick={() => setArticlesOpen(false)}>
                    All articles →
                  </Link>
                </div>
              )}
            </div>
            <Link href="/about" className="site-nav-link">About</Link>
            <LanguageSelector />
          </div>

          <button
            type="button"
            className="site-nav-cta"
            onClick={() => setModalOpen(true)}
            aria-haspopup="dialog"
          >
            Get started
          </button>
        </div>
      </nav>

      {modalOpen && (
        <div
          className="cyp-backdrop"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="cyp-modal" role="dialog" aria-modal="true" aria-labelledby="cyp-title">
            <button
              type="button"
              className="cyp-close"
              ref={closeBtnRef}
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="cyp-title" id="cyp-title">Choose Your Path</h2>
            <p className="cyp-sub">Three apps, one mission — pick where you want to start.</p>

            <div className="cyp-list">
              {MODAL_APPS.map(app => (
                <Link
                  key={app.key}
                  href={app.href}
                  className="cyp-card"
                  onClick={() => setModalOpen(false)}
                >
                  <span>
                    <span className="cyp-card-name notranslate" translate="no">{app.name}</span>
                    <span className="cyp-card-desc">{app.blurb}</span>
                  </span>
                  <span className="cyp-card-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
