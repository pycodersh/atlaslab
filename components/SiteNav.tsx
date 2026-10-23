'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { MODAL_APPS } from '@/lib/apps'
import { LanguageSelector } from '@/components/LanguageSelector'
import { PURCHASE_PATH } from '@/lib/kpatto/purchase'

/**
 * Site-wide navigation bar — 로고 + 오른쪽 핵심 요소 셋만 둔다.
 *   1. 언어 선택      2. Get PDF (PDF 구매 페이지)      3. Get started ("Choose Your Path" 앱 선택 모달)
 * 카테고리·앱 링크는 홈과 글 목록 안에서 보여 주므로 상단바에는 두지 않는다(에디토리얼 여백을 살린다).
 * Red background (#C8102E via --brand-red CSS var).
 * Used in app/blog/layout.tsx, essential pages, and app/page.tsx.
 *
 * Get started 모달 때문에 클라이언트 컴포넌트다.
 * Mobile (≤480px): 세 요소 모두 보이되 버튼 크기·간격을 줄인다.
 */
export function SiteNav() {
  const [modalOpen, setModalOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

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

        /* ── Get PDF (보조 버튼: 빨간 바탕 위 흰 테두리) ───────────── */
        .site-nav-pdf {
          display: inline-flex; align-items: center;
          padding: 5px 15px;
          border: 1px solid rgba(255,255,255,0.75);
          color: #fff; background: transparent;
          font-size: 12px; font-weight: 700; letter-spacing: 0.03em;
          text-decoration: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .site-nav-pdf:hover { background: #fff; color: var(--brand-red, #C8102E); }

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
          .cyp-backdrop, .cyp-modal { animation: none; }
        }

        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 30px !important; }
          .site-nav-right { gap: 10px; }
          .site-nav-pdf { padding: 5px 10px; font-size: 11px; }
          .site-nav-cta { padding: 6px 11px; font-size: 11px; }
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
          <LanguageSelector />
          <Link href={PURCHASE_PATH} className="site-nav-pdf">Get PDF</Link>
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
