import Link from 'next/link'
import { LanguageSelector } from '@/components/LanguageSelector'

/**
 * Site-wide navigation bar — 극도로 미니멀하게:
 *   좌측  로고(ATLAS LAB)
 *   우측  언어 선택(🌐 EN ⌵) 하나
 * 카테고리·앱 링크는 홈의 제품 카드와 글 목록 안에서 보여 주므로 상단바에는 두지 않는다.
 * K-PATTO 구매는 /kpatto 랜딩 한 곳으로 모은다(홈 카드·글 CTA 가 그리로 보낸다).
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

        /* 우측 버튼(언어 선택) 규격 — 높이를 고정해 글자 기준선이 맞는다 */
        .nav-pill {
          box-sizing: border-box; height: 34px; padding: 0 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          border: 1px solid transparent; border-radius: 999px; cursor: pointer;
          font-family: inherit; font-size: 12px; font-weight: 700; line-height: 1;
          letter-spacing: 0.03em; text-decoration: none; white-space: nowrap;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .nav-pill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        /* 테두리·배경 없는 텍스트형 */
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
        </div>
      </nav>
    </>
  )
}
