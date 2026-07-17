const BG = '#0d0820'
const ACCENT = '#7c6fd4'
const ACCENT_DIM = 'rgba(124,111,212,0.18)'
const TEXT = '#e8e0f8'
const TEXT_MUTED = 'rgba(232,224,248,0.55)'
const TEXT_FAINT = 'rgba(232,224,248,0.35)'
const CARD_BG = 'rgba(255,255,255,0.055)'
const CARD_BORDER = 'rgba(255,255,255,0.09)'
const FONT_BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const FONT_DISPLAY = '"Playfair Display", Georgia, serif'

// ── Shared token objects ──────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: CARD_BG,
  border: `0.5px solid ${CARD_BORDER}`,
  borderRadius: 20,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}

const accentBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  background: ACCENT_DIM,
  border: `0.5px solid rgba(124,111,212,0.4)`,
  borderRadius: 999,
  padding: '5px 14px',
  fontSize: 12,
  fontWeight: 600,
  color: '#b8b0f0',
  letterSpacing: '0.03em',
  fontFamily: FONT_BODY,
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────

function PhoneMockup({ screen, style }: {
  screen: 'home' | 'pattern' | 'progress'
  style?: React.CSSProperties
}) {
  const W = 160, H = 290

  const screenContent = {
    home: (
      <g>
        {/* Story list */}
        <rect x="10" y="10" width="110" height="14" rx="4" fill="rgba(255,255,255,0.15)" />
        <rect x="10" y="30" width="70" height="8" rx="3" fill="rgba(255,255,255,0.08)" />
        {/* Story cards */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x="8" y={54 + i*58} width="114" height="50" rx="10" fill="rgba(124,111,212,0.15)" stroke="rgba(124,111,212,0.25)" strokeWidth="0.5" />
            <rect x="16" y={62 + i*58} width="40" height="34" rx="7" fill="rgba(124,111,212,0.3)" />
            <rect x="62" y={65 + i*58} width="50" height="7" rx="3" fill="rgba(255,255,255,0.18)" />
            <rect x="62" y={76 + i*58} width="35" height="5" rx="2" fill="rgba(255,255,255,0.1)" />
            <rect x="62" y={87 + i*58} width="42" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
          </g>
        ))}
        {/* Tab bar hint */}
        <rect x="8" y="228" width="114" height="28" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <circle cx="30" cy="242" r="5" fill="rgba(124,111,212,0.6)" />
        <circle cx="55" cy="242" r="5" fill="rgba(255,255,255,0.2)" />
        <circle cx="80" cy="242" r="5" fill="rgba(255,255,255,0.2)" />
        <circle cx="105" cy="242" r="5" fill="rgba(255,255,255,0.2)" />
      </g>
    ),
    pattern: (
      <g>
        {/* Top label */}
        <rect x="10" y="10" width="60" height="9" rx="3" fill="rgba(124,111,212,0.4)" />
        <rect x="10" y="25" width="100" height="14" rx="4" fill="rgba(255,255,255,0.15)" />
        {/* Pattern card */}
        <rect x="8" y="50" width="114" height="100" rx="12" fill="rgba(124,111,212,0.12)" stroke="rgba(124,111,212,0.3)" strokeWidth="0.5" />
        <rect x="16" y="62" width="45" height="8" rx="3" fill="rgba(124,111,212,0.5)" />
        <rect x="16" y="76" width="90" height="10" rx="3" fill="rgba(255,255,255,0.18)" />
        <rect x="16" y="91" width="70" height="8" rx="3" fill="rgba(255,255,255,0.12)" />
        {/* Dots indicator */}
        {[0,1,2,3,4].map(i => (
          <circle key={i} cx={55 + i*10} cy="136" r="3.5" fill={i < 2 ? 'rgba(124,111,212,0.8)' : 'rgba(255,255,255,0.12)'} />
        ))}
        {/* Example rows */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x="8" y={158 + i*28} width="114" height="22" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
            <rect x="16" y={164 + i*28} width="60" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            <rect x="16" y={174 + i*28} width="44" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
          </g>
        ))}
      </g>
    ),
    progress: (
      <g>
        {/* Score ring area */}
        <circle cx="65" cy="70" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <circle cx="65" cy="70" r="40" fill="none" stroke={ACCENT} strokeWidth="6"
          strokeDasharray="251" strokeDashoffset="100" strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 70px' }} />
        <text x="65" y="66" textAnchor="middle" fontSize="18" fontWeight="700" fill={TEXT} fontFamily={FONT_BODY}>72</text>
        <text x="65" y="78" textAnchor="middle" fontSize="8" fill={TEXT_MUTED} fontFamily={FONT_BODY}>%</text>
        {/* Weekly strip */}
        <rect x="8" y="122" width="114" height="44" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <g key={i}>
            <text x={20 + i*16} y="135" textAnchor="middle" fontSize="6" fill={TEXT_FAINT} fontFamily={FONT_BODY}>{d}</text>
            <circle cx={20 + i*16} cy="152" r="7"
              fill={i < 4 ? 'rgba(124,111,212,0.7)' : 'rgba(255,255,255,0.07)'}
              stroke={i === 3 ? 'rgba(124,111,212,1)' : 'transparent'}
              strokeWidth="1.5" />
          </g>
        ))}
        {/* Story list */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x="8" y={178 + i*24} width="114" height="18" rx="6" fill="rgba(255,255,255,0.04)" />
            <rect x="14" y={184 + i*24} width="50" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
            <g transform={`translate(${94}, ${183 + i*24})`}>
              {[0,1,2,3,4].map(j => (
                <circle key={j} cx={j*6} cy="4" r="2.5" fill={j < 3-i ? 'rgba(124,111,212,0.7)' : 'rgba(255,255,255,0.1)'} />
              ))}
            </g>
          </g>
        ))}
      </g>
    ),
  }

  return (
    <div style={{ position: 'relative', width: W, height: H, ...style }}>
      {/* Phone shell */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <defs>
          <filter id={`shadow-${screen}`} x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="rgba(0,0,0,0.45)" />
          </filter>
        </defs>
        {/* Body */}
        <rect x="2" y="2" width={W-4} height={H-4} rx="26" fill="rgba(18,12,40,0.95)"
          stroke="rgba(255,255,255,0.12)" strokeWidth="1"
          filter={`url(#shadow-${screen})`} />
        {/* Status bar pill */}
        <rect x="52" y="10" width="56" height="8" rx="4" fill="rgba(255,255,255,0.07)" />
        {/* Screen content */}
        <g transform="translate(16, 26)" clipPath={`url(#clip-${screen})`}>
          <clipPath id={`clip-${screen}`}>
            <rect x="0" y="0" width="128" height="248" rx="4" />
          </clipPath>
          {screenContent[screen]}
        </g>
        {/* Home indicator */}
        <rect x="60" y={H-14} width="40" height="3" rx="2" fill="rgba(255,255,255,0.15)" />
      </svg>
    </div>
  )
}

// ── Feature icons ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
    title: 'Story-based learning',
    desc: '100 short stories written for natural English. Each story teaches 5 core patterns in context — the way you actually encounter them.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Spaced repetition',
    desc: 'Our SRS engine schedules each pattern for review right before you forget it. 500 patterns, learned for life — not just for the test.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
      </svg>
    ),
    title: 'Native audio',
    desc: 'Every story and pattern has native-quality audio. Listen while reading, or let the full story narration guide you through.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'AI essay feedback',
    desc: 'Write freely using the patterns you\'ve learned. AI reviews your essay, highlights strengths, and suggests natural improvements.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PattoLanding() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; }

        .pl-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 60px;
          background: rgba(13,8,32,0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
        }
        .pl-logo {
          font-family: "${FONT_DISPLAY}"; font-size: 20px; font-weight: 700;
          color: ${TEXT}; text-decoration: none; letter-spacing: -0.02em;
        }
        .pl-logo span { color: ${ACCENT}; }
        .pl-nav-links {
          display: flex; align-items: center; gap: 28px;
          list-style: none;
        }
        .pl-nav-links a {
          font-family: ${FONT_BODY}; font-size: 13.5px; font-weight: 500;
          color: ${TEXT_MUTED}; text-decoration: none;
          transition: color 0.15s;
        }
        .pl-nav-links a:hover { color: ${TEXT}; }
        .pl-btn-start {
          font-family: ${FONT_BODY}; font-size: 13px; font-weight: 600;
          color: #fff; background: ${ACCENT};
          border: none; border-radius: 999px;
          padding: 8px 18px; cursor: pointer;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .pl-btn-start:hover { opacity: 0.88; }
        .pl-nav-mobile-hide { display: flex; align-items: center; gap: 24px; }
        @media (max-width: 600px) {
          .pl-nav-mobile-hide { display: none; }
          .pl-nav { padding: 0 20px; }
        }

        .pl-hero {
          min-height: 100svh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 100px 24px 48px;
        }
        .pl-hero-title {
          font-family: ${FONT_DISPLAY};
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 700; line-height: 1.15;
          color: ${TEXT}; letter-spacing: -0.025em;
          max-width: 760px; margin: 16px auto 0;
        }
        .pl-hero-sub {
          font-family: ${FONT_BODY};
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 400; line-height: 1.7;
          color: ${TEXT_MUTED};
          max-width: 560px; margin: 20px auto 0;
        }
        .pl-cta-row {
          display: flex; align-items: center; gap: 12px;
          margin-top: 36px; flex-wrap: wrap; justify-content: center;
        }
        .pl-btn-primary {
          font-family: ${FONT_BODY}; font-size: 15px; font-weight: 600;
          color: #fff; background: ${ACCENT};
          border: none; border-radius: 999px;
          padding: 14px 30px; cursor: pointer;
          text-decoration: none; display: inline-flex; align-items: center; gap: 7px;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 24px rgba(124,111,212,0.4);
        }
        .pl-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .pl-btn-ghost {
          font-family: ${FONT_BODY}; font-size: 15px; font-weight: 500;
          color: ${TEXT_MUTED};
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 999px; padding: 14px 26px;
          cursor: pointer; text-decoration: none;
          transition: color 0.15s, background 0.15s;
        }
        .pl-btn-ghost:hover { color: ${TEXT}; background: rgba(255,255,255,0.08); }
        .pl-hero-note {
          font-family: ${FONT_BODY}; font-size: 12px;
          color: ${TEXT_FAINT}; margin-top: 20px; letter-spacing: 0.02em;
        }

        /* Mockups */
        .pl-mockups {
          display: flex; align-items: flex-end; justify-content: center;
          gap: 0; padding: 0 24px 80px;
          position: relative;
        }
        .pl-mockup-side {
          opacity: 0.7; transform-origin: bottom center;
          flex-shrink: 0;
        }
        .pl-mockup-left  { transform: rotate(-10deg) translateX(24px); }
        .pl-mockup-right { transform: rotate(10deg) translateX(-24px); }
        .pl-mockup-center { z-index: 2; flex-shrink: 0; }

        /* Sections */
        .pl-section {
          max-width: 1080px; margin: 0 auto;
          padding: 96px 24px;
        }
        .pl-eyebrow {
          font-family: ${FONT_BODY}; font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; color: ${ACCENT}; text-transform: uppercase;
          margin-bottom: 12px;
        }
        .pl-section-title {
          font-family: ${FONT_DISPLAY};
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700; line-height: 1.2;
          color: ${TEXT}; letter-spacing: -0.02em;
          margin-bottom: 48px;
        }

        /* Features grid */
        .pl-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .pl-features-grid { grid-template-columns: 1fr; }
        }
        .pl-feature-card {
          padding: 28px 26px 26px;
          transition: transform 0.18s;
        }
        .pl-feature-card:hover { transform: translateY(-2px); }
        .pl-feature-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: ${ACCENT_DIM};
          border: 0.5px solid rgba(124,111,212,0.3);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .pl-feature-title {
          font-family: ${FONT_BODY}; font-size: 15px; font-weight: 700;
          color: ${TEXT}; margin-bottom: 8px;
        }
        .pl-feature-desc {
          font-family: ${FONT_BODY}; font-size: 13.5px;
          color: ${TEXT_MUTED}; line-height: 1.65;
        }

        /* Pricing */
        .pl-pricing-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px; max-width: 680px;
        }
        @media (max-width: 600px) {
          .pl-pricing-grid { grid-template-columns: 1fr; }
        }
        .pl-plan-card { padding: 32px 28px; }
        .pl-plan-card-pro {
          border-color: rgba(124,111,212,0.35) !important;
          background: rgba(124,111,212,0.08) !important;
          position: relative; overflow: hidden;
        }
        .pl-plan-card-pro::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,111,212,0.25), transparent 70%);
          pointer-events: none;
        }
        .pl-plan-label {
          font-family: ${FONT_BODY}; font-size: 10px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: ${ACCENT}; margin-bottom: 10px;
        }
        .pl-plan-price {
          font-family: ${FONT_DISPLAY}; font-size: 42px; font-weight: 700;
          color: ${TEXT}; line-height: 1; letter-spacing: -0.03em;
        }
        .pl-plan-period {
          font-family: ${FONT_BODY}; font-size: 13px; color: ${TEXT_MUTED};
          margin: 6px 0 24px;
        }
        .pl-plan-divider {
          height: 0.5px; background: rgba(255,255,255,0.08);
          margin-bottom: 20px;
        }
        .pl-plan-items { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .pl-plan-item {
          font-family: ${FONT_BODY}; font-size: 13.5px; color: ${TEXT_MUTED};
          display: flex; align-items: center; gap: 9px;
        }
        .pl-plan-item::before {
          content: ''; display: block; width: 5px; height: 5px;
          border-radius: 50%; background: ${ACCENT}; flex-shrink: 0;
        }
        .pl-plan-cta {
          display: block; width: 100%; margin-top: 28px;
          font-family: ${FONT_BODY}; font-size: 14px; font-weight: 600;
          color: #fff; background: ${ACCENT};
          border: none; border-radius: 12px;
          padding: 13px 0; cursor: pointer;
          text-decoration: none; text-align: center;
          transition: opacity 0.15s;
        }
        .pl-plan-cta:hover { opacity: 0.88; }
        .pl-plan-cta-ghost {
          color: ${TEXT_MUTED};
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.12) !important;
        }
        .pl-plan-cta-ghost:hover { color: ${TEXT}; background: rgba(255,255,255,0.08); }

        /* Divider */
        .pl-divider {
          max-width: 1080px; margin: 0 auto;
          border: none; border-top: 0.5px solid rgba(255,255,255,0.07);
        }

        /* Footer */
        .pl-footer {
          max-width: 1080px; margin: 0 auto;
          padding: 40px 24px calc(40px + env(safe-area-inset-bottom, 0px));
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .pl-footer-left {
          font-family: ${FONT_DISPLAY}; font-size: 16px; font-weight: 700;
          color: ${TEXT_MUTED}; text-decoration: none;
        }
        .pl-footer-left span { color: ${ACCENT}; }
        .pl-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .pl-footer-links a {
          font-family: ${FONT_BODY}; font-size: 12.5px; color: ${TEXT_FAINT};
          text-decoration: none; transition: color 0.15s;
        }
        .pl-footer-links a:hover { color: ${TEXT_MUTED}; }

        /* Orb background */
        .pl-orb {
          position: fixed; border-radius: 50%;
          filter: blur(100px); pointer-events: none; z-index: 0;
        }
        .pl-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(124,111,212,0.18), transparent 70%);
          top: -120px; left: -100px;
          animation: orbFloat1 18s ease-in-out infinite alternate;
        }
        .pl-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(90,60,180,0.14), transparent 70%);
          bottom: 0; right: -80px;
          animation: orbFloat2 22s ease-in-out infinite alternate;
        }
        @keyframes orbFloat1 { from { transform: translate(0,0); } to { transform: translate(60px,80px); } }
        @keyframes orbFloat2 { from { transform: translate(0,0); } to { transform: translate(-50px,-60px); } }
      `}</style>

      <div style={{ background: BG, minHeight: '100svh', color: TEXT, position: 'relative', overflow: 'hidden' }}>

        {/* Orbs */}
        <div className="pl-orb pl-orb-1" />
        <div className="pl-orb pl-orb-2" />

        {/* ── Nav ── */}
        <nav className="pl-nav">
          <a href="/" className="pl-logo">patt<span>o</span></a>
          <div className="pl-nav-mobile-hide">
            <ul className="pl-nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
            <a href="/patto" className="pl-btn-start">Start free</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="pl-hero">
          <div style={accentBadge}>
            <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill={ACCENT} /></svg>
            Story-based English learning
          </div>

          <h1 className="pl-hero-title">
            Learn English patterns<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(232,224,248,0.82)' }}>the way natives do</em>
          </h1>

          <p className="pl-hero-sub">
            Read real stories. Master 5 patterns per story.<br />
            Review with spaced repetition. Write and get AI feedback.
          </p>

          <div className="pl-cta-row">
            <a href="/patto" className="pl-btn-primary">
              Start for free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#features" className="pl-btn-ghost">See how it works</a>
          </div>

          <p className="pl-hero-note">Free forever · No credit card required</p>
        </section>

        {/* ── Phone Mockups ── */}
        <div className="pl-mockups">
          <div className="pl-mockup-side pl-mockup-left">
            <PhoneMockup screen="home" style={{ width: 130, height: 236 }} />
          </div>
          <div className="pl-mockup-center">
            <PhoneMockup screen="pattern" style={{ width: 170, height: 309 }} />
          </div>
          <div className="pl-mockup-side pl-mockup-right">
            <PhoneMockup screen="progress" style={{ width: 130, height: 236 }} />
          </div>
        </div>

        {/* ── Features ── */}
        <section className="pl-section" id="features" style={{ position: 'relative', zIndex: 1 }}>
          <p className="pl-eyebrow">Why Patto</p>
          <h2 className="pl-section-title">Everything you need to actually remember</h2>
          <div className="pl-features-grid">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="pl-feature-card" style={card}>
                <div className="pl-feature-icon">{icon}</div>
                <h3 className="pl-feature-title">{title}</h3>
                <p className="pl-feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="pl-divider" />

        {/* ── Pricing ── */}
        <section className="pl-section" id="pricing" style={{ position: 'relative', zIndex: 1 }}>
          <p className="pl-eyebrow">Pricing</p>
          <h2 className="pl-section-title">Simple pricing, no surprises</h2>
          <div className="pl-pricing-grid">

            {/* Free plan */}
            <div className="pl-plan-card" style={card}>
              <p className="pl-plan-label">Free</p>
              <div className="pl-plan-price">$0</div>
              <p className="pl-plan-period">forever</p>
              <div className="pl-plan-divider" />
              <ul className="pl-plan-items">
                {['10 stories', '50 patterns', 'Basic review', 'Audio playback'].map(item => (
                  <li key={item} className="pl-plan-item">{item}</li>
                ))}
              </ul>
              <a href="/patto" className="pl-plan-cta pl-plan-cta-ghost" style={{ ...card, display: 'block', textDecoration: 'none', textAlign: 'center', padding: '13px 0', marginTop: 28, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: TEXT_MUTED, border: `0.5px solid rgba(255,255,255,0.12)` }}>
                Get started free
              </a>
            </div>

            {/* Pro plan */}
            <div className="pl-plan-card pl-plan-card-pro" style={{ ...card, background: 'rgba(124,111,212,0.08)', borderColor: 'rgba(124,111,212,0.35)' }}>
              <p className="pl-plan-label">Pro</p>
              <div className="pl-plan-price">$4.99</div>
              <p className="pl-plan-period">per month</p>
              <div className="pl-plan-divider" />
              <ul className="pl-plan-items">
                {['100 stories', '500 patterns', 'Full SRS system', 'AI essay feedback'].map(item => (
                  <li key={item} className="pl-plan-item" style={{ color: TEXT }}>{item}</li>
                ))}
              </ul>
              <a href="/patto" className="pl-plan-cta">Upgrade to Pro</a>
            </div>

          </div>
        </section>

        <hr className="pl-divider" />

        {/* ── Footer ── */}
        <footer className="pl-footer">
          <a href="/" className="pl-footer-left">patt<span>o</span></a>
          <nav className="pl-footer-links">
            <a href="/patto/settings/about/terms">Terms</a>
            <a href="/patto/settings/about/privacy">Privacy</a>
            <a href="/patto/settings/about/refunds">Refunds</a>
          </nav>
        </footer>

      </div>
    </>
  )
}
