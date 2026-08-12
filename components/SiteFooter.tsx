import Link from 'next/link'

const F = '"DM Sans","Inter",system-ui,sans-serif'

/**
 * Site-wide footer — Server Component.
 * Black background (var(--ink) / #111111).
 * Used in app/blog/layout.tsx and individual essential pages.
 * The home page (app/page.tsx) renders this component directly.
 *
 * Columns per spec: Products / Resources (Articles only) / Company
 * Omitted: Videos, Guides, Newsletter, Help Center, Careers, social icons
 * (no confirmed operating social accounts to link)
 */
export function SiteFooter() {
  const colTitle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 14, fontFamily: F,
  }
  const link: React.CSSProperties = {
    display: 'block', fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none', marginBottom: 10,
    fontFamily: F, transition: 'color 0.15s',
  }
  const muted: React.CSSProperties = {
    ...link, color: 'rgba(255,255,255,0.2)', cursor: 'default',
  }

  return (
    <footer style={{
      background: 'var(--ink, #111111)',
      borderTop: '1px solid #222',
      padding: '52px 40px 32px',
      color: 'white',
      fontFamily: F,
    }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '36px 28px',
          marginBottom: 44,
        }}>
          <div>
            <p style={colTitle}>Products</p>
            <Link href="/patto/home"  style={link}>Patto</Link>
            <Link href="/kpatto"      style={link}>K-Patto</Link>
            <Link href="/kpantry/en"  style={link}>K-Pantry</Link>
            <span style={muted}>Career Navi</span>
          </div>
          <div>
            <p style={colTitle}>Resources</p>
            <Link href="/blog" style={link}>Articles</Link>
          </div>
          <div>
            <p style={colTitle}>Company</p>
            <Link href="/about"   style={link}>About</Link>
            <Link href="/contact" style={link}>Contact</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          paddingTop: 20,
          display: 'flex', flexWrap: 'wrap',
          gap: '8px 20px',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: F }}>
              Privacy Policy
            </Link>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>·</span>
            <Link href="/terms" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: F }}>
              Terms of Service
            </Link>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: F }}>
            © 2025 Atlas Lab Studios · atlaslabstudios.com
          </p>
        </div>
      </div>
    </footer>
  )
}
