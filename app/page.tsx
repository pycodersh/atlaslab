import Image from 'next/image'
import { getLatestPosts } from '@/lib/blog/latest'

export const revalidate = 3600

const TICKER_ITEMS = [
  '이게 뭐예요?', 'have you ever', '~할 수 있어요?', 'it turns out',
  '~주세요', 'I was wondering', '어떻게 됐어요?', 'as long as you',
  '~인 것 같아요', "I can't help but", '~아도 돼요?', 'now that you mention',
]

export default async function AtlasLabHome() {
  const posts = await getLatestPosts(5)

  return (
    <>
      <style>{`
        :root {
          --ink:       #100E0C;
          --ink-2:     #171410;
          --line:      #2B2620;
          --line-2:    #3A342C;
          --paper:     #ECE6DB;
          --muted:     #8B8177;
          --dim:       #5F584F;
          --amber:     #D4873A;
          --amber-dim: #8A5A28;
          --font-sans: -apple-system, 'Helvetica Neue', Arial,
                       'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          --font-mono: 'SF Mono', 'Fira Code', 'Menlo', 'Consolas', monospace;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--ink); color: var(--paper); font-family: var(--font-sans); }

        /* ── Nav ─────────────────────────────────────────── */
        .al-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 56px;
          border-bottom: 1px solid transparent;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
        }
        .al-nav.scrolled {
          background: rgba(16,14,12,0.88);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-color: var(--line);
        }
        .al-logo {
          font-family: var(--font-mono); font-size: 14px; font-weight: 400;
          color: var(--paper); text-decoration: none; letter-spacing: 0.04em;
        }
        .al-logo-dot { color: var(--amber); }
        .al-nav-links { display: flex; align-items: center; gap: 32px; }
        .al-nav-link {
          font-family: var(--font-mono); font-size: 12px;
          color: var(--muted); text-decoration: none; transition: color 0.15s;
        }
        .al-nav-link:hover { color: var(--paper); }
        .al-nav-link:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; border-radius: 2px; }
        @media (max-width: 600px) {
          .al-nav { padding: 0 20px; }
          .al-nav-links { gap: 20px; }
          .al-nav-link.al-nav-hide { display: none; }
        }

        /* ── Hero ────────────────────────────────────────── */
        .al-hero {
          min-height: 100svh; padding: 112px 32px 40px;
          display: flex; flex-direction: column; align-items: flex-start;
          max-width: 880px; margin: 0 auto;
        }
        @media (max-width: 600px) { .al-hero { padding: 96px 20px 32px; } }

        .al-label {
          font-family: var(--font-mono); font-size: 11px;
          color: var(--dim); letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 28px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s, transform 0.5s;
        }
        .al-label.vis { opacity: 1; transform: translateY(0); }

        .al-h1 {
          font-size: clamp(28px, 3.2vw, 44px); font-weight: 500;
          line-height: 1.3; color: var(--paper); letter-spacing: -0.01em;
          max-width: 560px; margin-bottom: 44px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s 0.08s, transform 0.5s 0.08s;
        }
        .al-h1.vis { opacity: 1; transform: translateY(0); }

        /* Demo slot */
        .al-demo {
          margin-bottom: 36px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s 0.16s, transform 0.5s 0.16s;
        }
        .al-demo.vis { opacity: 1; transform: translateY(0); }
        .al-slot-row {
          display: flex; align-items: baseline;
          font-size: clamp(34px, 5vw, 58px); font-weight: 600;
          line-height: 1.15; color: var(--paper); flex-wrap: wrap; gap: 0;
        }
        .al-slot-bracket { color: var(--dim); font-weight: 300; margin: 0 4px; }
        .al-slot-word {
          border-bottom: 2px solid var(--amber);
          padding: 0 2px; white-space: nowrap;
          transition: opacity 0.25s;
        }
        .al-slot-suffix { margin-left: 10px; }
        .al-slot-translation {
          font-size: clamp(13px, 1.5vw, 16px); color: var(--muted);
          margin-top: 10px; font-style: italic;
          transition: opacity 0.25s;
        }
        .al-slot-pattern {
          font-family: var(--font-mono); font-size: 11px;
          color: var(--amber); margin-top: 6px; letter-spacing: 0.06em;
        }

        .al-lead {
          font-size: clamp(14px, 1.6vw, 17px); color: var(--muted);
          line-height: 1.75; max-width: 420px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s 0.24s, transform 0.5s 0.24s;
        }
        .al-lead.vis { opacity: 1; transform: translateY(0); }

        /* ── Ticker ──────────────────────────────────────── */
        .al-ticker-wrap {
          border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
          overflow: hidden; padding: 11px 0; background: var(--ink-2);
        }
        .al-ticker {
          display: flex; white-space: nowrap;
          animation: al-scroll 28s linear infinite;
        }
        @keyframes al-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) { .al-ticker { animation: none; } }
        .al-ticker-item {
          font-family: var(--font-mono); font-size: 12px;
          color: var(--dim); padding: 0 28px;
          display: inline-flex; align-items: center;
        }
        .al-ticker-item::after { content: '·'; color: var(--line-2); margin-left: 28px; font-size: 14px; }

        /* ── Section ─────────────────────────────────────── */
        .al-section { max-width: 1040px; margin: 0 auto; padding: 72px 32px; }
        @media (max-width: 600px) { .al-section { padding: 56px 20px; } }
        .al-section-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 40px; gap: 12px;
          border-top: 1px solid var(--line); padding-top: 24px;
          flex-wrap: wrap;
        }
        .al-section-title {
          font-family: var(--font-mono); font-size: 11px;
          color: var(--dim); letter-spacing: 0.12em; text-transform: uppercase;
        }
        .al-section-meta { font-family: var(--font-mono); font-size: 11px; color: var(--dim); }

        /* ── Product rows (big 2-col) ────────────────────── */
        .al-prod-row {
          display: grid; grid-template-columns: 1fr 1fr;
          border: 1px solid var(--line); border-radius: 2px;
          overflow: hidden; position: relative; margin-bottom: 2px;
        }
        .al-prod-row::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, var(--amber), transparent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
          z-index: 2;
        }
        .al-prod-row:hover::before { transform: scaleX(1); }
        @media (max-width: 820px) { .al-prod-row { grid-template-columns: 1fr; } }

        .al-prod-text {
          padding: 40px 36px; background: var(--ink-2);
          display: flex; flex-direction: column;
        }
        @media (max-width: 600px) { .al-prod-text { padding: 28px 24px; } }

        .al-prod-preview {
          position: relative; overflow: hidden; min-height: 320px;
          background: #0a0805;
        }
        @media (max-width: 820px) { .al-prod-preview { min-height: 220px; } }

        /* ── Product grid (small 2-col) ──────────────────── */
        .al-prod-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 2px;
        }
        @media (max-width: 820px) { .al-prod-grid { grid-template-columns: 1fr; } }

        .al-prod-cell {
          background: var(--ink-2); border: 1px solid var(--line);
          border-radius: 2px; padding: 32px 28px;
          display: flex; flex-direction: column; position: relative; overflow: hidden;
        }
        .al-prod-cell::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, var(--amber), transparent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .al-prod-cell:hover::before { transform: scaleX(1); }
        .al-prod-cell-preview {
          margin-top: 24px; flex: 1;
          border-top: 1px solid var(--line); padding-top: 18px;
        }

        /* Product text atoms */
        .al-badge {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
          display: inline-block; padding: 3px 8px; border-radius: 2px;
          margin-bottom: 16px; align-self: flex-start;
        }
        .al-badge-live  { color: #5DCAA5; border: 1px solid rgba(93,202,165,0.3); background: rgba(93,202,165,0.07); }
        .al-badge-soon  { color: var(--dim); border: 1px solid var(--line); }
        .al-badge-build { color: var(--amber); border: 1px solid var(--amber-dim); }

        .al-pname { font-size: 22px; font-weight: 600; color: var(--paper); letter-spacing: -0.02em; margin-bottom: 4px; }
        .al-psub  { font-size: 12px; color: var(--dim); margin-bottom: 14px; }
        .al-pone  { font-size: 15px; color: var(--paper); line-height: 1.5; margin-bottom: 12px; }
        .al-pdesc { font-size: 13px; color: var(--muted); line-height: 1.65; margin-bottom: 18px; }
        .al-pspecs {
          font-family: var(--font-mono); font-size: 11px; color: var(--dim);
          display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 22px;
        }
        .al-plink {
          font-family: var(--font-mono); font-size: 12px; color: var(--amber);
          text-decoration: none; letter-spacing: 0.04em; transition: color 0.15s;
          align-self: flex-start; margin-top: auto;
        }
        .al-plink:hover { color: var(--paper); }
        .al-plink:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; border-radius: 2px; }

        /* ── k-patto preview ─────────────────────────────── */
        .kp-overlay {
          position: absolute; inset: 0; background: rgba(16,14,12,0.45);
        }
        .kp-bubbles {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; padding: 24px; gap: 10px;
        }
        .kp-bubble {
          background: rgba(236,230,219,0.96); border-radius: 14px 14px 4px 14px;
          padding: 8px 14px; font-size: 14px; color: #111; font-weight: 500;
          align-self: flex-end; max-width: 240px; line-height: 1.4;
        }
        .kp-bubble-l { border-radius: 4px 14px 14px 14px; align-self: flex-start; }
        .kp-hi { color: var(--amber); font-weight: 700; }

        /* ── patto preview ───────────────────────────────── */
        .pt-drill-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(10,8,5,0.95));
          padding: 48px 20px 20px;
        }
        .pt-drill-card {
          background: rgba(16,14,12,0.95); border: 1px solid var(--line);
          border-radius: 3px; padding: 14px 16px;
        }
        .pt-pattern-label {
          font-family: var(--font-mono); font-size: 10px;
          color: var(--dim); letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .pt-sentence { font-size: 15px; color: var(--paper); font-weight: 500; }
        .pt-blank {
          border-bottom: 2px solid var(--amber); padding: 0 3px;
          color: var(--amber); font-weight: 600;
          transition: opacity 0.25s;
        }

        /* ── Career Navi preview ─────────────────────────── */
        .cn-graph { display: flex; flex-direction: column; gap: 0; }
        .cn-node {
          display: flex; align-items: center; gap: 10px;
          opacity: 0; transform: translateX(-8px);
          transition: opacity 0.35s, transform 0.35s;
        }
        .cn-node.in { opacity: 1; transform: translateX(0); }
        .cn-line {
          width: 1px; height: 18px; background: var(--line-2); margin-left: 3.5px;
          opacity: 0; transition: opacity 0.3s;
        }
        .cn-line.in { opacity: 1; }
        .cn-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cn-dot-a { background: var(--amber); }
        .cn-dot-m { background: var(--line-2); }
        .cn-nlabel { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
        .cn-nlabel-a { color: var(--paper); }

        /* ── k-pantry preview ────────────────────────────── */
        .kpan-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .kpan-chip {
          font-family: var(--font-mono); font-size: 11px; color: var(--muted);
          border: 1px solid var(--line-2); border-radius: 2px; padding: 4px 10px;
        }
        .kpan-arrow { font-family: var(--font-mono); font-size: 11px; color: var(--dim); margin-bottom: 10px; }
        .kpan-dish { font-size: 20px; color: var(--paper); font-weight: 600; margin-bottom: 4px; }
        .kpan-meta { font-family: var(--font-mono); font-size: 10px; color: var(--amber); }

        /* ── Blog list ───────────────────────────────────── */
        .al-blog-list { display: flex; flex-direction: column; }
        .al-blog-row {
          display: flex; align-items: baseline; gap: 16px;
          padding: 15px 0; border-bottom: 1px solid var(--line);
          text-decoration: none; color: inherit;
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .al-blog-row:hover { transform: translateX(10px); }
        .al-blog-row:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; border-radius: 2px; }
        .al-blog-tag {
          font-family: var(--font-mono); font-size: 10px; color: var(--amber);
          letter-spacing: 0.08em; text-transform: uppercase;
          flex-shrink: 0; min-width: 60px;
        }
        .al-blog-title { font-size: 14px; color: var(--paper); line-height: 1.4; flex: 1; }
        .al-blog-lang {
          font-family: var(--font-mono); font-size: 10px; color: var(--dim);
          flex-shrink: 0; letter-spacing: 0.06em;
        }
        .al-blog-more {
          display: inline-block; margin-top: 22px;
          font-family: var(--font-mono); font-size: 12px; color: var(--amber);
          text-decoration: none; letter-spacing: 0.04em; transition: color 0.15s;
        }
        .al-blog-more:hover { color: var(--paper); }
        .al-blog-more:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; border-radius: 2px; }

        /* ── Footer ──────────────────────────────────────── */
        .al-footer {
          border-top: 1px solid var(--line); padding: 28px 32px 40px;
        }
        .al-footer-inner {
          max-width: 1040px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .al-fcopy { font-family: var(--font-mono); font-size: 11px; color: var(--dim); }
        .al-flinks { display: flex; gap: 24px; flex-wrap: wrap; }
        .al-flink {
          font-family: var(--font-mono); font-size: 11px; color: var(--dim);
          text-decoration: none; transition: color 0.15s;
        }
        .al-flink:hover { color: var(--paper); }
        .al-flink:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; border-radius: 2px; }

        /* ── Scroll reveal ───────────────────────────────── */
        .al-reveal {
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.5s, transform 0.5s;
        }
        .al-reveal.vis { opacity: 1; transform: translateY(0); }

        /* ── Reduced motion ──────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; animation: none !important; }
          .al-label, .al-h1, .al-demo, .al-lead,
          .al-reveal, .cn-node, .cn-line { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div style={{ background: 'var(--ink)', minHeight: '100svh' }}>

        {/* ── Nav ── */}
        <nav className="al-nav" id="al-nav" aria-label="Main navigation">
          <a href="/" className="al-logo">Atlas<span className="al-logo-dot">·</span>Lab</a>
          <div className="al-nav-links">
            <a href="#products" className="al-nav-link al-nav-hide">Products</a>
            <a href="#writing"  className="al-nav-link al-nav-hide">Writing</a>
            <a href="mailto:shkim7025@gmail.com" className="al-nav-link">Contact</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="al-hero" aria-label="Hero">
          <p className="al-label" id="al-label">Built in Korea · Language apps</p>

          <h1 className="al-h1" id="al-h1">
            Atlas Lab builds apps that teach<br />
            Korean and English through patterns.
          </h1>

          <div className="al-demo" id="al-demo" aria-label="Pattern example">
            <div className="al-slot-row">
              <span className="al-slot-bracket">[</span>
              <span id="slot-word" className="al-slot-word">아이스 아메리카노</span>
              <span className="al-slot-bracket">]</span>
              <span className="al-slot-suffix">주세요</span>
            </div>
            <p id="slot-trans" className="al-slot-translation">Iced americano, please.</p>
            <p className="al-slot-pattern">~주세요 · juseyo · Give me ~, please</p>
          </div>

          <p className="al-lead" id="al-lead">
            Learn the pattern, then fill it in — with
            stories, audio, and the phrases people
            actually use.
          </p>
        </section>

        {/* ── Ticker ── */}
        <div className="al-ticker-wrap" aria-hidden="true">
          <div className="al-ticker">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="al-ticker-item">{item}</span>
            ))}
          </div>
        </div>

        {/* ── Products ── */}
        <section className="al-section" id="products" aria-label="Products">
          <div className="al-section-header">
            <span className="al-section-title">Products</span>
            <span className="al-section-meta">Two shipping · two in build</span>
          </div>

          {/* k-patto — big row */}
          <div className="al-prod-row al-reveal">
            <div className="al-prod-text">
              <span className="al-badge al-badge-live">LIVE</span>
              <h2 className="al-pname">k-patto</h2>
              <p className="al-psub">케이패토 — Korean webtoon learning</p>
              <p className="al-pone">Read a webtoon, learn the Korean inside it. First 10 episodes free.</p>
              <p className="al-pdesc">
                Each episode is a short webtoon with real dialogue. Tap any expression
                to see the pattern, listen to native audio, and drill it with challenges.
              </p>
              <div className="al-pspecs">
                <span>100 episodes</span>
                <span>325 expressions</span>
                <span>10 free</span>
              </div>
              <a href="/kpatto/welcome" className="al-plink">Start reading →</a>
            </div>
            <div className="al-prod-preview">
              <Image
                src="/kpatto/ep-001/cut-1.jpg"
                alt="k-patto webtoon — Episode 1, a Korean café scene"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top' }}
                sizes="(max-width: 820px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="kp-overlay" />
              <div className="kp-bubbles">
                <div className="kp-bubble kp-bubble-l">
                  이게 <span className="kp-hi">뭐예요</span>?
                </div>
                <div className="kp-bubble">
                  아, 이거요? 그냥 커피예요.
                </div>
              </div>
            </div>
          </div>

          {/* patto — big row */}
          <div className="al-prod-row al-reveal">
            <div className="al-prod-text">
              <span className="al-badge al-badge-live">LIVE</span>
              <h2 className="al-pname">patto</h2>
              <p className="al-psub">패토 — English pattern learning</p>
              <p className="al-pone">Daily English drills built on sentence patterns, in Korean and English.</p>
              <p className="al-pdesc">
                500 sentence patterns, native audio, and spaced-repetition review.
                Stories connect patterns into real conversation, not isolated phrases.
              </p>
              <a href="/patto/home" className="al-plink">Start learning →</a>
            </div>
            <div className="al-prod-preview">
              <Image
                src="/PATTO Dark.png"
                alt="patto app — English pattern drill screen"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top' }}
                sizes="(max-width: 820px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="pt-drill-overlay">
                <div className="pt-drill-card">
                  <div className="pt-pattern-label">be looking forward to ~</div>
                  <div className="pt-sentence">
                    I&apos;m <span id="pt-blank" className="pt-blank">looking forward</span> to it.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Career Navi + k-pantry — small grid */}
          <div className="al-prod-grid">

            {/* Career Navi */}
            <div className="al-prod-cell al-reveal">
              <span className="al-badge al-badge-build">IN BUILD</span>
              <h2 className="al-pname" style={{ fontSize: '19px' }}>Career Navi.</h2>
              <p className="al-psub">경력 네비 — AI career mapping</p>
              <p className="al-pone" style={{ fontSize: '14px' }}>
                See where your career can go next, based on what you&apos;ve done.
              </p>
              <p className="al-pdesc" style={{ fontSize: '12px' }}>
                Upload your résumé. Get a map of roles, companies, and paths
                that match your actual experience — not generic job boards.
              </p>
              <div className="al-prod-cell-preview">
                <div className="cn-graph" id="cn-graph">
                  <div className="cn-node" data-d="0">
                    <div className="cn-dot cn-dot-m" /><span className="cn-nlabel">Junior Developer</span>
                  </div>
                  <div className="cn-line" data-d="1" />
                  <div className="cn-node" data-d="2">
                    <div className="cn-dot cn-dot-m" /><span className="cn-nlabel">Senior Developer</span>
                  </div>
                  <div className="cn-line" data-d="3" />
                  <div className="cn-node" data-d="4">
                    <div className="cn-dot cn-dot-a" /><span className="cn-nlabel cn-nlabel-a">Tech Lead ↗</span>
                  </div>
                  <div className="cn-line" data-d="5" />
                  <div className="cn-node" data-d="6">
                    <div className="cn-dot cn-dot-m" /><span className="cn-nlabel">Engineering Manager</span>
                  </div>
                </div>
              </div>
            </div>

            {/* k-pantry */}
            <div className="al-prod-cell al-reveal">
              <span className="al-badge al-badge-build">IN BUILD</span>
              <h2 className="al-pname" style={{ fontSize: '19px' }}>k-pantry</h2>
              <p className="al-psub">케이팬트리 — Korean recipe finder</p>
              <p className="al-pone" style={{ fontSize: '14px' }}>
                Tell it what&apos;s in your fridge, get a Korean dish you can cook tonight.
              </p>
              <p className="al-pdesc" style={{ fontSize: '12px' }}>
                No shopping list needed. Type what you have — kimchi, eggs, tofu, gochujang —
                and get a recipe that actually works.
              </p>
              <div className="al-prod-cell-preview">
                <div className="kpan-chips">
                  {['계란', '두부', '고추장', '참기름', '대파'].map(c => (
                    <span key={c} className="kpan-chip">{c}</span>
                  ))}
                </div>
                <div className="kpan-arrow">↓</div>
                <div className="kpan-dish">순두부찌개</div>
                <div className="kpan-meta">Soft tofu jjigae · 25 min</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Blog ── */}
        {posts.length > 0 && (
          <section className="al-section" id="writing" style={{ paddingTop: 0 }} aria-label="Writing">
            <div className="al-section-header">
              <span className="al-section-title">Writing</span>
              <span className="al-section-meta">1,048 posts · EN · KO</span>
            </div>
            <div className="al-blog-list">
              {posts.map(post => (
                <a
                  key={`${post.app}-${post.slug}`}
                  href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                  className="al-blog-row"
                >
                  <span className="al-blog-tag">{post.app}</span>
                  <span className="al-blog-title">{post.title}</span>
                  <span className="al-blog-lang">{post.locale.toUpperCase()}</span>
                </a>
              ))}
            </div>
            <a href="/blog/en/patto" className="al-blog-more">All writing →</a>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="al-footer">
          <div className="al-footer-inner">
            <span className="al-fcopy">© 2026 Atlas Lab</span>
            <div className="al-flinks">
              <a href="/kpatto/welcome" className="al-flink">k-patto</a>
              <a href="/patto/home"     className="al-flink">patto</a>
              <a href="/blog/en/patto"  className="al-flink">Writing</a>
              <a href="/videos"         className="al-flink">Videos</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Client JS ── */}
      <script dangerouslySetInnerHTML={{ __html: `(function(){
        // Nav scroll blur
        var nav = document.getElementById('al-nav');
        window.addEventListener('scroll', function(){
          if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
        }, { passive: true });

        // Hero entrance
        ['al-label','al-h1','al-demo','al-lead'].forEach(function(id){
          var el = document.getElementById(id);
          if (el) requestAnimationFrame(function(){ el.classList.add('vis'); });
        });

        // Slot rotation — 2.9 s
        var slots = [
          { ko: '아이스 아메리카노', en: 'Iced americano, please.' },
          { ko: '물 한 잔',          en: 'A glass of water, please.' },
          { ko: '영수증',            en: 'A receipt, please.' },
          { ko: '포장',              en: 'To go, please.' },
        ];
        var sw = document.getElementById('slot-word');
        var st = document.getElementById('slot-trans');
        var si = 0;
        if (sw && st && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setInterval(function(){
            si = (si + 1) % slots.length;
            sw.style.opacity = '0'; st.style.opacity = '0';
            setTimeout(function(){
              sw.textContent = slots[si].ko;
              st.textContent = slots[si].en;
              sw.style.opacity = '1'; st.style.opacity = '1';
            }, 260);
          }, 2900);
        }

        // Scroll reveal
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduced && 'IntersectionObserver' in window) {
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
              if (e.isIntersecting){ e.target.classList.add('vis'); io.unobserve(e.target); }
            });
          }, { threshold: 0.1 });
          document.querySelectorAll('.al-reveal').forEach(function(el){ io.observe(el); });
        } else {
          document.querySelectorAll('.al-reveal').forEach(function(el){ el.classList.add('vis'); });
        }

        // Career Navi graph — runs once on enter
        var cnGraph = document.getElementById('cn-graph');
        if (cnGraph) {
          var cno = new IntersectionObserver(function(entries){
            if (!entries[0].isIntersecting) return;
            cno.disconnect();
            if (reduced){
              cnGraph.querySelectorAll('[data-d]').forEach(function(el){ el.classList.add('in'); });
              return;
            }
            cnGraph.querySelectorAll('[data-d]').forEach(function(el){
              var d = parseInt(el.getAttribute('data-d') || '0');
              setTimeout(function(){ el.classList.add('in'); }, d * 200);
            });
          }, { threshold: 0.3 });
          cno.observe(cnGraph);
        }
      })();` }} />
    </>
  )
}
