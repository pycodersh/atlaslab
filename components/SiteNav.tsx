import Link from 'next/link'
import { LanguageSelector } from '@/components/LanguageSelector'
import { PURCHASE_PATH } from '@/lib/kpatto/purchase'

/**
 * Site-wide navigation bar — 극도로 미니멀하게:
 *   좌측  로고(ATLAS LAB)
 *   우측  언어 선택 + "Get the E-Book"(PDF 구매 페이지) 버튼
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
        .site-nav-right { display: flex; align-items: center; gap: 18px; }

        /* 단일 CTA: 빨간 바탕 위 흰 테두리 버튼 */
        .site-nav-pdf {
          display: inline-flex; align-items: center;
          padding: 6px 16px;
          border: 1px solid rgba(255,255,255,0.8);
          color: #fff; background: transparent;
          font-size: 12px; font-weight: 700; letter-spacing: 0.03em;
          text-decoration: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .site-nav-pdf:hover { background: #fff; color: var(--brand-red, #C8102E); }

        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 30px !important; }
          .site-nav-right { gap: 12px; }
          .site-nav-pdf { padding: 5px 11px; font-size: 11px; }
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
          <Link href={PURCHASE_PATH} className="site-nav-pdf">Get the E-Book</Link>
        </div>
      </nav>
    </>
  )
}
