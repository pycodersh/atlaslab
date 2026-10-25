import Link from 'next/link'
import { LanguageSelector } from '@/components/LanguageSelector'
import { NavBookmarks } from '@/components/NavBookmarks'
import { PURCHASE_PATH } from '@/lib/kpatto/purchase'

/**
 * Site-wide navigation bar — 극도로 미니멀하게:
 *   좌측  로고(ATLAS LAB)
 *   우측  내 북마크(/bookmarks) · 언어 선택 + "📖 E-Book"(PDF 구매 페이지) 버튼
 * 카테고리·앱 링크는 홈의 제품 카드와 글 목록 안에서 보여 주므로 상단바에는 두지 않는다.
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
        .site-nav-right { display: flex; align-items: center; gap: 10px; }

        /* 우측 두 버튼(언어 → E-Book 순)이 공유하는 필 규격 — 높이를 고정해 두 버튼의 글자 기준선이 맞는다 */
        .nav-pill {
          box-sizing: border-box; height: 34px; padding: 0 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          border: 1px solid transparent; border-radius: 999px; cursor: pointer;
          font-family: inherit; font-size: 12px; font-weight: 700; line-height: 1;
          letter-spacing: 0.03em; text-decoration: none; white-space: nowrap;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .nav-pill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        /* 서브(언어 선택): 테두리·배경 없는 텍스트 — 시선이 옆의 E-Book 솔리드 버튼으로 가게 무게를 뺀다 */
        .nav-pill--sub {
          color: rgba(255,255,255,0.88); background: none; border-color: transparent;
          padding: 0 8px;
        }
        .nav-pill--sub:hover { color: #fff; }
        /* 메인 액션: 헤더 자체가 브랜드 레드라 레드 솔리드는 묻힌다 → 흰 솔리드 + 레드 글자로 반전 */
        .nav-pill--main {
          color: var(--brand-red, #C8102E); background: #fff; border-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.14);
        }
        .nav-pill--main:hover { background: #F4EDE0; border-color: #F4EDE0; }

        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 30px !important; }
          .site-nav-right { gap: 8px; }
          .nav-pill { height: 30px; padding: 0 12px; font-size: 11px; }
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
          <NavBookmarks />
          <LanguageSelector />
          <Link href={PURCHASE_PATH} className="nav-pill nav-pill--main" aria-label="Get the E-Book">
            <span aria-hidden>📖</span> E-Book
          </Link>
        </div>
      </nav>
    </>
  )
}
