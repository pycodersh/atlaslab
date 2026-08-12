import Link from 'next/link'

const F = '"DM Sans","Inter",system-ui,sans-serif'

const linkStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'rgba(255,255,255,0.45)',
  textDecoration: 'none',
  marginBottom: 8,
  fontFamily: F,
}

const colTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
  marginBottom: 12,
  fontFamily: F,
}

/**
 * Site-wide footer — Server Component.
 * Used in app/blog/layout.tsx and individual essential pages.
 * The home page (app/page.tsx) renders its own expanded footer inline.
 */
export function SiteFooter() {
  return (
    <footer style={{
      background: '#05041a',
      borderTop: '0.5px solid rgba(255,255,255,0.06)',
      padding: '48px 24px 32px',
      color: 'white',
      fontFamily: F,
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '32px 24px',
          marginBottom: 40,
        }}>
          <div>
            <p style={colTitleStyle}>Products</p>
            <Link href="/patto/home" style={linkStyle}>Patto</Link>
            <Link href="/kpatto" style={linkStyle}>K-Patto</Link>
            <Link href="/kpantry/en" style={linkStyle}>K-Pantry</Link>
            <span style={{ ...linkStyle, color: 'rgba(255,255,255,0.2)', cursor: 'default' }}>Career Navi</span>
          </div>
          <div>
            <p style={colTitleStyle}>Resources</p>
            <Link href="/blog" style={linkStyle}>Articles</Link>
            <Link href="/videos" style={linkStyle}>Videos</Link>
          </div>
          <div>
            <p style={colTitleStyle}>Company</p>
            <Link href="/about" style={linkStyle}>About</Link>
            <Link href="/contact" style={linkStyle}>Contact</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '0.5px solid rgba(255,255,255,0.07)',
          paddingTop: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 20px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: F }}>
              Privacy Policy
            </Link>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>·</span>
            <Link href="/terms" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: F }}>
              Terms of Service
            </Link>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: F }}>
            © 2025 Atlas Lab Studios
          </p>
        </div>
      </div>
    </footer>
  )
}
