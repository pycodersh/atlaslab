const BG = '#0d0820'
const FONT_BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const FONT_DISPLAY = '"Playfair Display", Georgia, serif'

const PRODUCTS = [
  {
    emoji: null,
    iconBg: '#1a1240',
    name: 'patto',
    desc: 'Learn English patterns the way natives do',
    tag: 'Live',
    tagStyle: { background: 'rgba(29,158,117,0.2)', color: '#5DCAA5', border: '0.5px solid rgba(29,158,117,0.3)' },
    href: '/patto/home',
    featured: false,
  },
  {
    emoji: '🇰🇷',
    iconBg: 'rgba(124,111,255,0.15)',
    name: 'k-patto',
    desc: 'Korean pattern learning for global learners',
    tag: 'Coming soon',
    tagStyle: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '0.5px solid rgba(255,255,255,0.1)' },
    href: null,
    featured: false,
  },
  {
    emoji: '🧭',
    iconBg: 'rgba(29,158,117,0.15)',
    name: 'Career Navi.',
    desc: 'AI career navigation for Korean professionals',
    tag: 'Coming soon',
    tagStyle: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '0.5px solid rgba(255,255,255,0.1)' },
    href: null,
    featured: false,
  },
  {
    emoji: '🥘',
    iconBg: 'rgba(186,117,23,0.15)',
    name: 'k-pantry',
    desc: 'Korean recipes with what\'s in your fridge',
    tag: 'Coming soon',
    tagStyle: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '0.5px solid rgba(255,255,255,0.1)' },
    href: null,
    featured: false,
  },
]

const BLOG_POSTS = [
  {
    flag: 'patto · EN',
    title: 'Why Patto teaches patterns, not grammar rules',
    link: '/blog/en/patto →',
    href: '/blog/en/patto',
  },
  {
    flag: 'patto · KO',
    title: '패토가 문법 대신 패턴을 가르치는 이유',
    link: '/blog/ko/patto →',
    href: '/blog/ko/patto',
  },
]

export default function AtlasLabHome() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; }

        .al-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 60px;
          background: rgba(13,8,32,0.80);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
        }
        .al-nav-right { display: flex; align-items: center; gap: 24px; }
        .al-nav-link {
          font-family: ${FONT_BODY}; font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.15s;
        }
        .al-nav-link:hover { color: white; }
        .al-nav-btn {
          font-family: ${FONT_BODY}; font-size: 13px; font-weight: 600;
          color: #a89fff;
          background: rgba(124,111,255,0.2);
          border: 1px solid rgba(124,111,255,0.4);
          border-radius: 999px; padding: 7px 16px;
          text-decoration: none; transition: background 0.15s;
        }
        .al-nav-btn:hover { background: rgba(124,111,255,0.3); }
        @media (max-width: 600px) {
          .al-nav-right { gap: 14px; }
          .al-nav-link { display: none; }
        }

        .al-hero {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 140px 24px 80px;
        }
        .al-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 999px; padding: 5px 14px;
          font-family: ${FONT_BODY}; font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.45); letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 28px;
        }
        .al-hero-title {
          font-family: ${FONT_DISPLAY};
          font-size: clamp(32px, 5.5vw, 58px);
          font-weight: 700; line-height: 1.18;
          color: white; letter-spacing: -0.025em;
          max-width: 700px; margin-bottom: 20px;
        }
        .al-hero-sub {
          font-family: ${FONT_BODY}; font-size: clamp(14px, 2vw, 17px);
          color: rgba(255,255,255,0.5); line-height: 1.7;
          max-width: 500px;
        }

        .al-section { max-width: 960px; margin: 0 auto; padding: 80px 24px; }
        .al-section-label {
          font-family: ${FONT_BODY}; font-size: 11px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); text-align: center;
          margin-bottom: 32px;
        }

        /* Product grid */
        .al-products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 720px) {
          .al-products-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .al-product-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 20px 16px;
          text-decoration: none; display: block;
          transition: border-color 0.15s, background 0.15s;
          cursor: default;
        }
        .al-product-card-link { cursor: pointer; }
        .al-product-card-link:hover {
          border-color: rgba(124,111,255,0.4);
          background: rgba(124,111,255,0.04);
        }
        .al-product-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 14px;
        }
        .al-product-name {
          font-family: ${FONT_BODY}; font-size: 15px; font-weight: 700;
          color: white; margin-bottom: 6px;
        }
        .al-product-desc {
          font-family: ${FONT_BODY}; font-size: 12.5px;
          color: rgba(255,255,255,0.45); line-height: 1.55; margin-bottom: 14px;
        }
        .al-product-tag {
          display: inline-block;
          font-family: ${FONT_BODY}; font-size: 10px; font-weight: 600;
          letter-spacing: 0.05em; border-radius: 999px; padding: 2px 8px;
        }

        /* Blog grid */
        .al-blog-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        @media (max-width: 600px) { .al-blog-grid { grid-template-columns: 1fr; } }
        .al-blog-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 20px;
          text-decoration: none; display: block;
          transition: border-color 0.15s, background 0.15s;
        }
        .al-blog-card:hover {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
        }
        .al-blog-flag {
          font-family: ${FONT_BODY}; font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #a89fff; margin-bottom: 10px;
        }
        .al-blog-title {
          font-family: ${FONT_DISPLAY}; font-size: 16px; font-weight: 700;
          color: white; line-height: 1.4; margin-bottom: 14px;
        }
        .al-blog-link {
          font-family: ${FONT_BODY}; font-size: 12px;
          color: rgba(255,255,255,0.3);
        }

        .al-divider {
          max-width: 960px; margin: 0 auto;
          border: none; border-top: 0.5px solid rgba(255,255,255,0.07);
        }

        .al-footer {
          padding: 32px 24px calc(32px + env(safe-area-inset-bottom, 0px));
          text-align: center;
          font-family: ${FONT_BODY}; font-size: 11px;
          color: rgba(255,255,255,0.2); letter-spacing: 0.02em;
        }

        .al-orb {
          position: fixed; border-radius: 50%;
          filter: blur(110px); pointer-events: none; z-index: 0;
        }
        .al-orb-1 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(124,111,212,0.16), transparent 70%);
          top: -100px; left: -80px;
          animation: alFloat1 20s ease-in-out infinite alternate;
        }
        .al-orb-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(80,50,180,0.12), transparent 70%);
          bottom: 0; right: -60px;
          animation: alFloat2 24s ease-in-out infinite alternate;
        }
        @keyframes alFloat1 { from { transform: translate(0,0); } to { transform: translate(50px,70px); } }
        @keyframes alFloat2 { from { transform: translate(0,0); } to { transform: translate(-40px,-50px); } }
      `}</style>

      <div style={{ background: BG, minHeight: '100svh', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />

        {/* Nav */}
        <nav className="al-nav">
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/atlaslab_logo_white_transparent.png" alt="Atlas Lab" style={{ height: 48, width: 'auto', display: 'block' }} />
          </a>
          <div className="al-nav-right">
            <a href="#products" className="al-nav-link">Products</a>
            <a href="#blog" className="al-nav-link">Blog</a>
            <a href="/patto/home" className="al-nav-btn">Get started</a>
          </div>
        </nav>

        {/* Hero */}
        <section className="al-hero" style={{ position: 'relative', zIndex: 1 }}>
          <div className="al-badge">
            <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="rgba(124,111,255,0.8)" /></svg>
            ATLAS LAB · AI-POWERED APPS
          </div>
          <h1 className="al-hero-title">
            Tools that make you <span style={{ color: '#a89fff' }}>better</span>,<br />
            one skill at a time.
          </h1>
          <p className="al-hero-sub">
            Atlas Lab builds AI-powered apps for language learning, career growth, and daily life.
          </p>
        </section>

        {/* Products */}
        <section className="al-section" id="products" style={{ position: 'relative', zIndex: 1, paddingTop: 0 }}>
          <p className="al-section-label">Our Products</p>
          <div className="al-products-grid">
            {PRODUCTS.map(p => {
              const inner = (
                <>
                  <div className="al-product-icon" style={{ background: p.iconBg }}>
                    {p.emoji === null ? (
                      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <rect x="3" y="7" width="24" height="2.5" rx="1.25" fill="#6655cc"/>
                        <rect x="3" y="13" width="18" height="2.5" rx="1.25" fill="#5544aa" opacity="0.8"/>
                        <rect x="3" y="19" width="21" height="2.5" rx="1.25" fill="#443388" opacity="0.6"/>
                        <circle cx="23" cy="21" r="5" fill="#2d1f6e"/>
                        <circle cx="23" cy="21" r="5" stroke="#6655cc" strokeWidth="1"/>
                        <text x="23" y="25" textAnchor="middle" fontSize="8" fill="#a090ff" fontWeight="700">P</text>
                      </svg>
                    ) : p.emoji}
                  </div>
                  <div className="al-product-name">{p.name}</div>
                  <div className="al-product-desc">{p.desc}</div>
                  <span className="al-product-tag" style={p.tagStyle}>{p.tag}</span>
                </>
              )
              return p.href ? (
                <a
                  key={p.name}
                  href={p.href}
                  className="al-product-card al-product-card-link"
                >
                  {inner}
                </a>
              ) : (
                <div key={p.name} className="al-product-card">
                  {inner}
                </div>
              )
            })}
          </div>
        </section>

        <hr className="al-divider" />

        {/* Blog */}
        <section className="al-section" id="blog" style={{ position: 'relative', zIndex: 1 }}>
          <p className="al-section-label">From the Blog</p>
          <div className="al-blog-grid">
            {BLOG_POSTS.map(post => (
              <a key={post.href} href={post.href} className="al-blog-card">
                <div className="al-blog-flag">{post.flag}</div>
                <div className="al-blog-title">{post.title}</div>
                <div className="al-blog-link">{post.link}</div>
              </a>
            ))}
          </div>
        </section>

        <hr className="al-divider" />

        {/* Footer */}
        <footer className="al-footer">
          © 2025 Atlas Lab Studios · atlaslabstudios.com
        </footer>
      </div>
    </>
  )
}
