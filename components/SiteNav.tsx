import Link from 'next/link'

/**
 * Site-wide navigation bar — Server Component.
 * Used in app/blog/layout.tsx and individual essential pages.
 * The home page (app/page.tsx) has its own .nav CSS class instead.
 *
 * Mobile (≤480px): logo + 3 links compact in one row (gap shrinks, logo smaller).
 * "Get started" button hidden at ≤480px to save space; links always visible.
 */
export function SiteNav() {
  return (
    <>
      <style>{`
        .site-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 56px;
          background: rgba(8,6,20,0.9);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
          font-family: "DM Sans","Inter",system-ui,sans-serif;
        }
        .site-nav-right { display: flex; align-items: center; gap: 24px; }
        .site-nav-links { display: flex; align-items: center; gap: 24px; }
        .site-nav-link {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none; letter-spacing: 0.01em;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .site-nav-link:hover { color: rgba(255,255,255,0.9); }
        .site-nav-cta {
          display: inline-flex; align-items: center;
          padding: 6px 14px; border-radius: 20px;
          background: rgba(124,111,255,0.15); border: 1px solid rgba(124,111,255,0.4);
          color: #a89fff; font-size: 12px; font-weight: 600;
          text-decoration: none; white-space: nowrap;
          transition: background 0.2s, border-color 0.2s;
        }
        .site-nav-cta:hover {
          background: rgba(124,111,255,0.28); border-color: rgba(124,111,255,0.7);
        }
        @media (max-width: 480px) {
          .site-nav { padding: 0 16px; }
          .site-nav-logo { height: 32px !important; }
          .site-nav-right { gap: 14px; }
          .site-nav-links { gap: 14px; }
          .site-nav-cta { display: none; }
        }
      `}</style>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src="/atlaslab_nav_logo.png"
            alt="Atlas Lab"
            className="site-nav-logo"
            style={{ height: 40, width: 'auto', display: 'block' }}
          />
        </Link>
        <div className="site-nav-right">
          <div className="site-nav-links">
            <Link href="/#products" className="site-nav-link">Apps</Link>
            <Link href="/blog" className="site-nav-link">Articles</Link>
            <Link href="/about" className="site-nav-link">About</Link>
          </div>
          <Link href="/kpatto" className="site-nav-cta">Get started →</Link>
        </div>
      </nav>
    </>
  )
}
