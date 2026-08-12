import Link from 'next/link'

/**
 * Site-wide navigation bar — Server Component.
 * Red background (#C8102E via --brand-red CSS var).
 * Used in app/blog/layout.tsx, essential pages, and app/page.tsx.
 *
 * Mobile (≤480px): logo + 3 links always visible (gap shrinks).
 * "Get started" CTA hidden at ≤480px; links NEVER hidden.
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
          transition: background 0.15s;
        }
        .site-nav-cta:hover { background: #333; }
        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 30px !important; }
          .site-nav-right { gap: 16px; }
          .site-nav-links { gap: 16px; }
          .site-nav-cta { display: none; }
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
            <Link href="/#products" className="site-nav-link">Apps</Link>
            <Link href="/blog"      className="site-nav-link">Articles</Link>
            <Link href="/about"     className="site-nav-link">About</Link>
          </div>
          <Link href="/kpatto" className="site-nav-cta">Get started</Link>
        </div>
      </nav>
    </>
  )
}
