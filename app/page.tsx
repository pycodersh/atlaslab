
const FONT_BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const FONT_DISPLAY = '"Playfair Display", Georgia, serif'

const PattoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect x="4" y="8" width="20" height="2.8" rx="1.4" fill="#a89fff"/>
    <rect x="4" y="14" width="15" height="2.8" rx="1.4" fill="#7c6fff" opacity="0.85"/>
    <rect x="4" y="20" width="18" height="2.8" rx="1.4" fill="#6655cc" opacity="0.7"/>
    <circle cx="24" cy="22" r="6.5" fill="#150d3a"/>
    <circle cx="24" cy="22" r="6.5" stroke="#a89fff" strokeWidth="1.2"/>
    <text x="24" y="26" textAnchor="middle" fontSize="8.5" fill="#c4b8ff" fontWeight="800" fontFamily="Georgia,serif">P</text>
  </svg>
)

const KPattoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect x="5" y="7" width="9" height="2.5" rx="1.25" fill="#60a5fa"/>
    <rect x="5" y="7" width="2.5" height="8" rx="1.25" fill="#60a5fa"/>
    <rect x="20" y="7" width="2.5" height="18" rx="1.25" fill="#93c5fd" opacity="0.9"/>
    <rect x="20" y="15" width="7" height="2.5" rx="1.25" fill="#93c5fd" opacity="0.9"/>
    <rect x="5" y="19" width="2.5" height="7" rx="1.25" fill="#60a5fa" opacity="0.8"/>
    <rect x="5" y="24" width="9" height="2.5" rx="1.25" fill="#60a5fa" opacity="0.8"/>
  </svg>
)

const CareerNaviIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="7" cy="25" r="2.2" fill="#5DCAA5"/>
    <circle cx="13" cy="19" r="2.2" fill="#5DCAA5" opacity="0.85"/>
    <circle cx="19" cy="13" r="2.2" fill="#5DCAA5" opacity="0.7"/>
    <line x1="7" y1="25" x2="13" y2="19" stroke="#5DCAA5" strokeWidth="1.2" opacity="0.4" strokeDasharray="2 2"/>
    <line x1="13" y1="19" x2="19" y2="13" stroke="#5DCAA5" strokeWidth="1.2" opacity="0.4" strokeDasharray="2 2"/>
    <line x1="19" y1="13" x2="26" y2="6" stroke="#5DCAA5" strokeWidth="1.5" opacity="0.6"/>
    <polyline points="20,6 26,6 26,12" stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const KPantryIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M12 9 Q11 7 12 5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M16 8 Q15 6 16 4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    <path d="M20 9 Q19 7 20 5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M5 14 h22 a1 1 0 0 1 1 1 L25 22 a10 10 0 0 1-18 0 L5 15 a1 1 0 0 1 1-1z" fill="#3d1f00" stroke="#f59e0b" strokeWidth="1.2"/>
    <rect x="5" y="14" width="22" height="3" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="2" y="15" width="4" height="3" rx="1.5" fill="#d97706"/>
    <rect x="26" y="15" width="4" height="3" rx="1.5" fill="#d97706"/>
  </svg>
)

const PRODUCTS = [
  {
    Icon: PattoIcon,
    iconBg: 'linear-gradient(135deg, #1a0f4a, #0d0820)',
    iconGlow: 'rgba(124,111,255,0.3)',
    name: 'patto',
    desc: 'Learn English patterns the way natives do',
    tag: 'Live',
    tagStyle: { background: 'rgba(29,158,117,0.15)', color: '#5DCAA5', border: '0.5px solid rgba(29,158,117,0.4)' },
    accentColor: 'rgba(124,111,255,0.15)',
    borderHover: 'rgba(124,111,255,0.5)',
    href: '/patto/home',
  },
  {
    Icon: KPattoIcon,
    iconBg: 'linear-gradient(135deg, #0a1628, #060e1c)',
    iconGlow: 'rgba(96,165,250,0.3)',
    name: 'k-patto',
    desc: 'Korean pattern learning for global learners',
    tag: 'Coming soon',
    tagStyle: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(255,255,255,0.1)' },
    accentColor: 'rgba(96,165,250,0.08)',
    borderHover: 'rgba(96,165,250,0.4)',
    href: null,
  },
  {
    Icon: CareerNaviIcon,
    iconBg: 'linear-gradient(135deg, #081a10, #040d08)',
    iconGlow: 'rgba(93,202,165,0.3)',
    name: 'Career Navi.',
    desc: 'AI career navigation for Korean professionals',
    tag: 'Coming soon',
    tagStyle: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(255,255,255,0.1)' },
    accentColor: 'rgba(93,202,165,0.08)',
    borderHover: 'rgba(93,202,165,0.4)',
    href: null,
  },
  {
    Icon: KPantryIcon,
    iconBg: 'linear-gradient(135deg, #1a1000, #0d0800)',
    iconGlow: 'rgba(251,191,36,0.3)',
    name: 'k-pantry',
    desc: 'Korean recipes with what\'s in your fridge',
    tag: 'Coming soon',
    tagStyle: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(255,255,255,0.1)' },
    accentColor: 'rgba(251,191,36,0.08)',
    borderHover: 'rgba(251,191,36,0.4)',
    href: null,
  },
]

export default function AtlasLabHome() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080614; overflow-x: hidden; }

        /* ── Animations ─────────────────────────────── */
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,80px) scale(1.08); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-60px) scale(1.05); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.1); } }
        @keyframes gradShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes particleDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
        }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px var(--glow,rgba(124,111,255,0.2)); } 50% { box-shadow: 0 0 40px var(--glow,rgba(124,111,255,0.4)), 0 0 80px var(--glow,rgba(124,111,255,0.1)); } }
        @keyframes borderGlow { 0%,100% { border-color: rgba(124,111,255,0.2); } 50% { border-color: rgba(124,111,255,0.5); } }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }

        /* ── Background orbs ─────────────────────────── */
        .orb {
          position: fixed; border-radius: 50%;
          filter: blur(90px); pointer-events: none; z-index: 0; will-change: transform;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(100,80,220,0.18) 0%, transparent 70%);
          top: -150px; left: -120px;
          animation: float1 22s ease-in-out infinite;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(60,40,180,0.14) 0%, transparent 70%);
          bottom: -80px; right: -100px;
          animation: float2 28s ease-in-out infinite;
        }
        .orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(180,100,255,0.1) 0%, transparent 70%);
          top: 40%; left: 50%; transform: translate(-50%,-50%);
          animation: float3 18s ease-in-out infinite;
        }

        /* ── Noise texture ───────────────────────────── */
        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── Nav ─────────────────────────────────────── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; height: 62px;
          background: rgba(8,6,20,0.7);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          animation: fadeIn 0.6s ease both;
        }
        .nav-right { display: flex; align-items: center; gap: 28px; }
        .nav-link {
          font-family: ${FONT_BODY}; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.45); text-decoration: none;
          transition: color 0.2s; letter-spacing: 0.01em;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }
        .nav-btn {
          font-family: ${FONT_BODY}; font-size: 13px; font-weight: 600;
          color: white;
          background: linear-gradient(135deg, rgba(124,111,255,0.9), rgba(168,143,255,0.9));
          border: none; border-radius: 999px; padding: 8px 18px;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(124,111,255,0.3);
          transition: all 0.2s;
        }
        .nav-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 30px rgba(124,111,255,0.5);
        }
        @media (max-width: 600px) {
          .nav-right { gap: 16px; }
          .nav-link { display: none; }
        }

        /* ── Hero ────────────────────────────────────── */
        .hero {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 160px 24px 100px;
          overflow: hidden;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,111,255,0.08);
          border: 0.5px solid rgba(124,111,255,0.3);
          border-radius: 999px; padding: 6px 16px;
          font-family: ${FONT_BODY}; font-size: 11px; font-weight: 600;
          color: rgba(168,143,255,0.8); letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 36px;
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a89fff;
          animation: pulse 2s ease-in-out infinite;
        }
        .hero-title {
          font-family: ${FONT_DISPLAY};
          font-size: clamp(38px, 6.5vw, 72px);
          font-weight: 700; line-height: 1.12;
          letter-spacing: -0.03em;
          max-width: 780px; margin-bottom: 24px;
          color: white;
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, #c4b8ff 0%, #a89fff 40%, #7c6fff 80%, #c084fc 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .hero-sub {
          font-family: ${FONT_BODY}; font-size: clamp(15px, 2.2vw, 18px);
          color: rgba(255,255,255,0.45); line-height: 1.75;
          max-width: 480px; margin-bottom: 48px;
          animation: fadeUp 0.8s 0.3s ease both;
        }
        .hero-cta {
          display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.8s 0.4s ease both;
        }
        .btn-primary {
          font-family: ${FONT_BODY}; font-size: 14px; font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #7c6fff, #a855f7);
          border: none; border-radius: 999px; padding: 13px 28px;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 4px 30px rgba(124,111,255,0.4);
          transition: all 0.25s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(124,111,255,0.6);
        }
        .btn-ghost {
          font-family: ${FONT_BODY}; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.15);
          border-radius: 999px; padding: 13px 28px;
          text-decoration: none; cursor: pointer;
          transition: all 0.25s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        /* Hero grid lines */
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(124,111,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,111,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        /* ── Section labels ──────────────────────────── */
        .section-wrap {
          max-width: 960px; margin: 0 auto; padding: 80px 24px;
          position: relative; z-index: 2;
        }
        .section-label {
          font-family: ${FONT_BODY}; font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.25); text-align: center;
          margin-bottom: 40px;
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .section-label::before, .section-label::after {
          content: ''; flex: 1; max-width: 80px;
          height: 0.5px; background: rgba(255,255,255,0.08);
        }

        /* ── Product cards ───────────────────────────── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 720px) {
          .products-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .product-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 22px 18px 20px;
          text-decoration: none; display: block;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      border-color 0.3s, background 0.3s, box-shadow 0.3s;
          cursor: default;
        }
        .product-card-link { cursor: pointer; }
        .product-card-link:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(124,111,255,0.4);
          background: rgba(124,111,255,0.06);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,111,255,0.1);
        }
        /* Shine overlay on hover */
        .product-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
          opacity: 0; transition: opacity 0.3s; border-radius: inherit;
        }
        .product-card-link:hover::before { opacity: 1; }
        /* Glow bottom edge */
        .product-card::after {
          content: '';
          position: absolute; bottom: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,111,255,0.4), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .product-card-link:hover::after { opacity: 1; }

        .product-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
          position: relative;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .product-card-link:hover .product-icon-wrap { transform: scale(1.1) rotate(-3deg); }
        .product-name {
          font-family: ${FONT_BODY}; font-size: 14.5px; font-weight: 700;
          color: white; margin-bottom: 7px; letter-spacing: -0.01em;
        }
        .product-desc {
          font-family: ${FONT_BODY}; font-size: 12px;
          color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 16px;
        }
        .product-tag {
          display: inline-block;
          font-family: ${FONT_BODY}; font-size: 10px; font-weight: 700;
          letter-spacing: 0.06em; border-radius: 999px; padding: 3px 9px;
        }

        /* ── Video button ────────────────────────────── */
        .video-wrap {
          text-align: center; padding: 0 0 60px; position: relative; z-index: 2;
        }
        .video-btn {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: ${FONT_BODY}; font-size: 13.5px; font-weight: 600;
          color: rgba(168,143,255,0.9);
          background: rgba(124,111,255,0.08);
          border: 1px solid rgba(124,111,255,0.25);
          border-radius: 999px; padding: 10px 22px;
          text-decoration: none;
          transition: all 0.25s;
          animation: borderGlow 3s ease-in-out infinite;
        }
        .video-btn:hover {
          background: rgba(124,111,255,0.15);
          border-color: rgba(124,111,255,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124,111,255,0.2);
        }
        .play-icon {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(124,111,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Divider ─────────────────────────────────── */
        .divider {
          max-width: 960px; margin: 0 auto 0;
          border: none; border-top: 0.5px solid rgba(255,255,255,0.05);
          position: relative; z-index: 2;
        }
        .divider-glow {
          max-width: 400px; margin: 0 auto;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,111,255,0.3), transparent);
          position: relative; z-index: 2;
        }

        /* ── Blog section ────────────────────────────── */
        .blog-wrap {
          max-width: 960px; margin: 0 auto;
          padding: 60px 24px 80px; position: relative; z-index: 2;
        }
        .blog-app-group { margin-bottom: 28px; }
        .blog-app-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
        }
        .blog-app-name {
          font-family: ${FONT_BODY}; font-size: 12px; font-weight: 700;
          color: white; letter-spacing: 0.02em;
        }
        .blog-app-desc {
          font-family: ${FONT_BODY}; font-size: 11px;
          color: rgba(255,255,255,0.3);
        }
        .blog-app-line {
          flex: 1; height: 0.5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }
        .blog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 600px) { .blog-grid { grid-template-columns: 1fr; } }
        .blog-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 18px;
          text-decoration: none; display: block;
          transition: all 0.25s;
        }
        .blog-card:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(124,111,255,0.25);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .blog-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,111,255,0.3), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .blog-card:hover::before { opacity: 1; }
        .blog-locale {
          font-family: ${FONT_BODY}; font-size: 9.5px; font-weight: 700;
          color: #a89fff; text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
        .blog-title {
          font-family: ${FONT_DISPLAY}; font-size: 14px; font-weight: 700;
          color: rgba(255,255,255,0.9); line-height: 1.45; margin-bottom: 12px;
        }
        .blog-link {
          font-family: ${FONT_BODY}; font-size: 11px;
          color: rgba(255,255,255,0.25);
        }
        .blog-single .blog-card { max-width: 480px; }

        /* ── Footer ──────────────────────────────────── */
        .footer {
          padding: 28px 24px calc(28px + env(safe-area-inset-bottom,0px));
          text-align: center; position: relative; z-index: 2;
          font-family: ${FONT_BODY}; font-size: 11px;
          color: rgba(255,255,255,0.15); letter-spacing: 0.04em;
        }
        .footer-links {
          display: flex; justify-content: center; gap: 20px;
          margin-bottom: 10px;
        }
        .footer-link {
          font-family: ${FONT_BODY}; font-size: 11px;
          color: rgba(255,255,255,0.2); text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: rgba(255,255,255,0.5); }
      `}</style>

      {/* Background */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="noise" />

      <div style={{ background: '#080614', minHeight: '100svh', color: 'white', position: 'relative', overflowX: 'hidden' }}>

        {/* Nav */}
        <nav className="nav">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/atlaslab_nav_logo.png" alt="Atlas Lab" style={{ height: '47px', width: 'auto' }} />
          </a>
          <div className="nav-right">
            <a href="#products" className="nav-link">Products</a>
            <a href="#blog" className="nav-link">Blog</a>
            <a href="/patto/home" className="nav-btn">Get started</a>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-badge">
            <span className="badge-dot" />
            ATLAS LAB · AI-POWERED APPS
          </div>
          <h1 className="hero-title">
            Tools that make you{' '}
            <span className="hero-title-accent">better</span>,<br />
            one skill at a time.
          </h1>
          <p className="hero-sub">
            Atlas Lab builds AI-powered apps for language learning,<br />
            career growth, and daily life.
          </p>
          <div className="hero-cta">
            <a href="/patto/home" className="btn-primary">Start learning free →</a>
            <a href="#products" className="btn-ghost">Explore products</a>
          </div>
        </section>

        {/* Products */}
        <div className="section-wrap" id="products" style={{ paddingTop: 20 }}>
          <p className="section-label">Our Products</p>
          <div className="products-grid">
            {PRODUCTS.map(p => {
              const inner = (
                <>
                  <div className="product-icon-wrap" style={{ background: p.iconBg }}>
                    <p.Icon />
                  </div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-desc">{p.desc}</div>
                  <span className="product-tag" style={p.tagStyle}>{p.tag}</span>
                </>
              )
              return p.href ? (
                <a key={p.name} href={p.href} className="product-card product-card-link">
                  {inner}
                </a>
              ) : (
                <div key={p.name} className="product-card">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>

        {/* Video CTA */}
        <div className="video-wrap">
          <a href="/videos" className="video-btn">
            <span className="play-icon">
              <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
                <path d="M2 2l7 3.5L2 9V2z" fill="#a89fff"/>
              </svg>
            </span>
            Watch Patto in action
          </a>
        </div>

        {/* Divider */}
        <div className="divider-glow" />

        {/* Blog */}
        <div className="blog-wrap" id="blog">
          <p className="section-label" style={{ marginBottom: '32px' }}>From the blog</p>

          {/* patto */}
          <div className="blog-app-group">
            <div className="blog-app-header">
              <span className="blog-app-name">patto</span>
              <span className="blog-app-desc">English pattern learning</span>
              <div className="blog-app-line" />
            </div>
            <div className="blog-grid">
              <a href="/blog/en/patto" className="blog-card">
                <div className="blog-locale">EN</div>
                <div className="blog-title">Why Patto teaches patterns, not grammar rules</div>
                <div className="blog-link">/blog/en/patto →</div>
              </a>
              <a href="/blog/ko/patto" className="blog-card">
                <div className="blog-locale">KO</div>
                <div className="blog-title">패토가 문법 대신 패턴을 가르치는 이유</div>
                <div className="blog-link">/blog/ko/patto →</div>
              </a>
            </div>
          </div>

          {/* k-patto */}
          <div className="blog-app-group">
            <div className="blog-app-header">
              <span className="blog-app-name">k-patto</span>
              <span className="blog-app-desc">Korean pattern learning</span>
              <div className="blog-app-line" />
            </div>
            <div className="blog-single">
              <a href="/blog/en/k-patto" className="blog-card">
                <div className="blog-locale">EN</div>
                <div className="blog-title">Why Korean patterns are the fastest path to fluency</div>
                <div className="blog-link">/blog/en/k-patto →</div>
              </a>
            </div>
          </div>

          {/* k-pantry */}
          <div className="blog-app-group" style={{ marginBottom: 0 }}>
            <div className="blog-app-header">
              <span className="blog-app-name">k-pantry</span>
              <span className="blog-app-desc">Korean food & cooking</span>
              <div className="blog-app-line" />
            </div>
            <div className="blog-single">
              <a href="/blog/en/k-pantry" className="blog-card">
                <div className="blog-locale">EN</div>
                <div className="blog-title">Complete guide to Korean pantry essentials</div>
                <div className="blog-link">/blog/en/k-pantry →</div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <hr className="divider" />
        <footer className="footer">
          <div className="footer-links">
            <a href="/patto/home" className="footer-link">patto</a>
            <a href="/blog/en/patto" className="footer-link">blog</a>
            <a href="/videos" className="footer-link">videos</a>
          </div>
          © 2025 Atlas Lab Studios · atlaslabstudios.com
        </footer>
      </div>
    </>
  )
}
