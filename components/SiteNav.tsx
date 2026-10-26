import Link from 'next/link'
import { LanguageSelector } from '@/components/LanguageSelector'
import { PURCHASE_PATH } from '@/lib/kpatto/purchase'

/**
 * Site-wide navigation bar — 극도로 미니멀하게:
 *   좌측  로고(ATLAS LAB)
 *   우측  언어 선택(🌐 EN ⌵) · PDF(전자책 구매 섹션으로) — 두 개 모두 같은 텍스트형 버튼
 * 카테고리·앱 링크는 홈의 제품 카드와 글 목록 안에서 보여 주므로 상단바에는 두지 않는다.
 * 내 북마크(/bookmarks)는 푸터의 Resources 에서 들어간다.
 * Red background (#C8102E via --brand-red CSS var).
 * Used in app/blog/layout.tsx, essential pages, app/page.tsx and the purchase page.
 *
 * 상태가 없는 서버 컴포넌트다(언어 선택만 자체적으로 클라이언트).
 */
export function SiteNav() {
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
        .site-nav-right { display: flex; align-items: center; gap: 6px; }

        /* 우측 두 버튼(언어 · PDF)이 공유하는 규격 — 높이를 고정해 글자 기준선이 맞는다 */
        .nav-pill {
          box-sizing: border-box; height: 34px; padding: 0 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          border: 1px solid transparent; border-radius: 999px; cursor: pointer;
          font-family: inherit; font-size: 12px; font-weight: 700; line-height: 1;
          letter-spacing: 0.03em; text-decoration: none; white-space: nowrap;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .nav-pill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        /* 테두리·배경 없는 텍스트형 — 언어 선택과 PDF 가 같은 무게로 나란히 선다 */
        .nav-pill--sub {
          color: rgba(255,255,255,0.88); background: none; border-color: transparent;
          padding: 0 8px;
        }
        .nav-pill--sub:hover { color: #fff; }

        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 30px !important; }
          .site-nav-right { gap: 2px; }
          .nav-pill { height: 30px; font-size: 11px; }
          .nav-pill--sub { padding: 0 6px; }
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
          {/* 구매 페이지의 Pricing & Download 섹션으로 — 같은 페이지면 부드럽게 스크롤된다 */}
          <Link href={`${PURCHASE_PATH}#checkout`} className="nav-pill nav-pill--sub" aria-label="K-PATTO PDF e-book">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 7v13" />
              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
            </svg>
            <span className="notranslate" translate="no">PDF</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
