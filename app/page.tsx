import { createClient } from '@supabase/supabase-js'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

/* ── Typography constants ─────────────────────────────────────────────── */
const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

/* ── Product data ─────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    mark: 'P',
    name: 'Patto',
    desc: 'Learn English patterns the way native speakers actually use them.',
    tag: 'Live' as const,
    href: '/patto/home',
  },
  {
    mark: '한',
    name: 'K-Patto',
    desc: 'Korean pattern learning built for global learners — audio, stories, drills.',
    tag: 'Beta' as const,
    href: '/kpatto',
  },
  {
    mark: '食',
    name: 'K-Pantry',
    desc: 'Discover Korean recipes based on what is already in your fridge.',
    tag: 'Live' as const,
    href: '/kpantry/en',
  },
  {
    mark: 'C',
    name: 'Career Navi',
    desc: 'AI career navigation for Korean professionals exploring new paths.',
    tag: 'Soon' as const,
    href: null,
  },
] as const

/* ── Blog app labels ──────────────────────────────────────────────────── */
const APP_LABEL: Record<string, string> = {
  'k-patto':   'K-Patto',
  patto:       'Patto',
  kpantry:     'K-Pantry',
  'k-pantry':  'K-Pantry',
  careernavi:  'Career Navi',
}

/* ── Why Atlas Lab items ──────────────────────────────────────────────── */
const WHY = [
  {
    title: 'Pattern-first learning',
    desc:  'Every app teaches through repeating real patterns — not isolated vocabulary or one-off drills.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h9l3 3v13H4V2z"/>
        <path d="M13 2v3h3"/>
        <line x1="7" y1="9"  x2="13" y2="9"/>
        <line x1="7" y1="12" x2="13" y2="12"/>
        <line x1="7" y1="15" x2="10" y2="15"/>
      </svg>
    ),
  },
  {
    title: 'Real AI, not a wrapper',
    desc:  'AI generates content, adapts to each user, and gives feedback — it does not just relay a chat model.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round">
        <rect x="6" y="6" width="8" height="8"/>
        <line x1="10" y1="1" x2="10" y2="6"/>
        <line x1="10" y1="14" x2="10" y2="19"/>
        <line x1="1"  y1="10" x2="6"  y2="10"/>
        <line x1="14" y1="10" x2="19" y2="10"/>
      </svg>
    ),
  },
  {
    title: 'Habit-sized by design',
    desc:  'Built for phones and offline use. Five focused minutes a day beats five interrupted hours.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="1" width="8" height="18" rx="1.5"/>
        <circle cx="10" cy="16" r="0.75" fill="var(--ink,#111)" stroke="none"/>
        <line x1="8" y1="4" x2="12" y2="4"/>
      </svg>
    ),
  },
  {
    title: 'One mission, many tools',
    desc:  'Language, food, career — every Atlas Lab product helps build a skill that lasts.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="10" cy="10" r="8"/>
        <line x1="10" y1="2"  x2="10" y2="5"/>
        <line x1="10" y1="15" x2="10" y2="18"/>
        <line x1="2"  y1="10" x2="5"  y2="10"/>
        <line x1="15" y1="10" x2="18" y2="10"/>
        <circle cx="10" cy="10" r="2.5"/>
      </svg>
    ),
  },
]

/* ── ISR ──────────────────────────────────────────────────────────────── */
export const revalidate = 3600

/* ══════════════════════════════════════════════════════════════════════════
   Home page
   ══════════════════════════════════════════════════════════════════════════ */
export default async function AtlasLabHome() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
  const { data: latestPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(4)

  return (
    <>
      {/* ── Page-level styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--paper, #fff); color: var(--ink, #111); overflow-x: hidden; }

        /* ── Hero (red) ────────────────────────────────────────────── */
        .hero {
          background: var(--brand-red, #C8102E);
          overflow: hidden;
        }
        .hero-text {
          padding: 72px 48px 72px 48px;
          max-width: 680px;
        }
        @media (max-width: 700px) {
          .hero-text { padding: 48px 20px 56px; }
        }
        .hero-eyebrow {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 22px;
          display: flex; align-items: center; gap: 10px;
        }
        .hero-eyebrow::before {
          content: '';
          display: inline-block; width: 24px; height: 1px;
          background: rgba(255,255,255,0.4);
        }
        .hero-h1 {
          font-family: ${SERIF};
          font-size: clamp(34px, 4.2vw, 58px);
          font-weight: 700; line-height: 1.08;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 20px;
        }
        .hero-desc {
          font-family: ${BODY};
          font-size: clamp(14px, 1.6vw, 16px);
          color: rgba(255,255,255,0.72);
          line-height: 1.75;
          margin-bottom: 36px;
          max-width: 380px;
        }
        .hero-btn {
          display: inline-block;
          font-family: ${BODY};
          font-size: 13px; font-weight: 700;
          background: var(--ink, #111);
          color: #fff;
          padding: 12px 28px;
          text-decoration: none;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: background 0.15s;
        }
        .hero-btn:hover { background: #2a2a2a; }

        /* ── Inner container ───────────────────────────────────────── */
        .wrap {
          max-width: 1060px; margin: 0 auto;
          padding-left: 40px; padding-right: 40px;
        }
        @media (max-width: 700px) {
          .wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Section header (double-border editorial) ──────────────── */
        .sec-head {
          display: flex; align-items: baseline;
          justify-content: space-between;
          border-top: 2.5px solid var(--ink, #111);
          padding-top: 11px;
          margin-bottom: 36px;
        }
        .sec-label {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--ink-muted, #6B6B6B);
        }
        .sec-more {
          font-family: ${BODY};
          font-size: 12px; font-weight: 600;
          color: var(--brand-red, #C8102E);
          text-decoration: none;
        }
        .sec-more:hover { text-decoration: underline; }

        /* ── Products section ──────────────────────────────────────── */
        .products-wrap { padding: 36px 0 64px; }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--rule, #E5E1DC);
          border: 1px solid var(--rule, #E5E1DC);
        }
        @media (max-width: 820px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 460px) {
          .products-grid { grid-template-columns: 1fr; }
        }
        .pcard {
          background: var(--paper, #fff);
          padding: 28px 22px 24px;
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
          transition: background 0.15s;
        }
        .pcard-link:hover { background: var(--paper-warm, #F7F5F2); }
        .pmark {
          width: 42px; height: 42px;
          background: var(--brand-red, #C8102E);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; flex-shrink: 0;
        }
        .pmark-muted { background: #c8c8c8; }
        .pmark-letter {
          color: #fff;
          font-family: ${SERIF};
          font-weight: 700; font-size: 18px; line-height: 1;
          letter-spacing: -0.02em;
        }
        .pbadge {
          display: inline-block; align-self: flex-start;
          font-family: ${BODY};
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 3px 8px; margin-bottom: 12px;
        }
        .badge-live { background: var(--brand-red, #C8102E); color: #fff; }
        .badge-beta { background: #e8e8e8; color: var(--ink-muted, #6B6B6B); }
        .badge-soon { background: #f0f0f0; color: #aaa; }
        .pname {
          font-family: ${SERIF};
          font-size: 19px; font-weight: 700;
          color: var(--ink, #111); margin-bottom: 8px;
          letter-spacing: -0.01em; line-height: 1.2;
        }
        .pdesc {
          font-family: ${BODY};
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          line-height: 1.6; margin-bottom: 20px; flex: 1;
        }
        .pbtn {
          display: block;
          font-family: ${BODY};
          font-size: 12px; font-weight: 700;
          text-align: center; text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--brand-red, #C8102E); color: #fff;
          padding: 9px 12px;
          transition: background 0.15s;
          margin-top: auto;
        }
        .pbtn:hover { background: var(--brand-red-dark, #A30D25); }
        .psoon {
          font-family: ${BODY};
          font-size: 12px; color: #bbb;
          text-align: center; margin-top: auto; padding-top: 4px;
        }

        /* ── Blog section ──────────────────────────────────────────── */
        .blog-outer {
          background: var(--paper-warm, #F7F5F2);
          padding: 60px 0 64px;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--rule, #E5E1DC);
          border: 1px solid var(--rule, #E5E1DC);
        }
        @media (max-width: 560px) {
          .blog-grid { grid-template-columns: 1fr; }
        }
        .bcard {
          background: var(--paper-warm, #F7F5F2);
          padding: 28px 24px;
          text-decoration: none;
          display: flex; flex-direction: column;
          transition: background 0.15s;
        }
        .bcard:hover { background: #ede9e3; }
        .bcat {
          font-family: ${BODY};
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--brand-red, #C8102E);
          margin-bottom: 10px;
        }
        .btitle {
          font-family: ${SERIF};
          font-size: 16.5px; font-weight: 700;
          color: var(--ink, #111); line-height: 1.32;
          margin-bottom: 10px; letter-spacing: -0.01em;
        }
        .bexcerpt {
          font-family: ${BODY};
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          line-height: 1.65; flex: 1; margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bdate {
          font-family: ${BODY};
          font-size: 11px; color: var(--ink-muted, #6B6B6B);
          letter-spacing: 0.02em;
        }

        /* ── Why section ───────────────────────────────────────────── */
        .why-wrap { padding: 60px 0 72px; }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px 28px;
        }
        @media (max-width: 820px) {
          .why-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 460px) {
          .why-grid { grid-template-columns: 1fr; gap: 28px; }
        }
        .why-item { display: flex; flex-direction: column; gap: 12px; }
        .why-icon {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--ink, #111);
          flex-shrink: 0;
        }
        .why-title {
          font-family: ${SERIF};
          font-size: 16px; font-weight: 700;
          color: var(--ink, #111); line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .why-desc {
          font-family: ${BODY};
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          line-height: 1.7;
        }
      `}</style>

      {/* ── Navigation (red) ── */}
      <SiteNav />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-eyebrow">Atlas Lab</p>
          <h1 className="hero-h1">Tools that make you better, one skill at a time.</h1>
          <p className="hero-desc">AI-powered apps for language learning, career growth, and Korean cooking.</p>
          <a href="#products" className="hero-btn">Explore our apps</a>
        </div>
      </section>

      {/* ── Products ── */}
      <div id="products">
        <div className="wrap products-wrap">
          <div className="sec-head">
            <span className="sec-label">Our Apps</span>
          </div>
          <div className="products-grid">
            {PRODUCTS.map(p => {
              const badge = (
                <span className={`pbadge ${
                  p.tag === 'Live' ? 'badge-live' :
                  p.tag === 'Beta' ? 'badge-beta' : 'badge-soon'
                }`}>
                  {p.tag === 'Soon' ? 'Coming soon' : p.tag}
                </span>
              )
              const inner = (
                <>
                  <div className={`pmark ${p.tag === 'Soon' ? 'pmark-muted' : ''}`}>
                    <span className="pmark-letter">{p.mark}</span>
                  </div>
                  {badge}
                  <div className="pname">{p.name}</div>
                  <div className="pdesc">{p.desc}</div>
                  {p.href
                    ? <span className="pbtn">Start for free →</span>
                    : <span className="psoon">Coming soon</span>
                  }
                </>
              )
              return p.href ? (
                <a key={p.name} href={p.href} className="pcard pcard-link">
                  {inner}
                </a>
              ) : (
                <div key={p.name} className="pcard">{inner}</div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── From the Blog ── */}
      {latestPosts && latestPosts.length > 0 && (
        <div className="blog-outer">
          <div className="wrap">
            <div className="sec-head">
              <span className="sec-label">From the Blog</span>
              <a href="/blog" className="sec-more">Browse all articles →</a>
            </div>
            <div className="blog-grid">
              {latestPosts.map(post => (
                <a
                  key={post.slug}
                  href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                  className="bcard"
                >
                  <div className="bcat">
                    {post.category ?? APP_LABEL[post.app] ?? post.app}
                  </div>
                  <div className="btitle">{post.title}</div>
                  {post.description && (
                    <div className="bexcerpt">{post.description}</div>
                  )}
                  <div className="bdate">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Why Atlas Lab ── */}
      <div className="wrap why-wrap">
        <div className="sec-head">
          <span className="sec-label">Why Atlas Lab</span>
        </div>
        <div className="why-grid">
          {WHY.map(item => (
            <div key={item.title} className="why-item">
              <div className="why-icon">{item.icon}</div>
              <div className="why-title">{item.title}</div>
              <div className="why-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer (black) ── */}
      <SiteFooter />
    </>
  )
}
