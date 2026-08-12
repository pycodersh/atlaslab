'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

const TABS = ['Our Mission', 'Products', 'Team', 'Philosophy'] as const
type Tab = typeof TABS[number]

/* ── Mission cards ────────────────────────────────────────────────────── */
const MISSION_CARDS = [
  {
    title: 'Why We Build',
    desc: 'Most learning apps optimize for engagement, not mastery. Atlas Lab was built to flip that — every product is designed around a single skill and measured by how well users actually use it in real life.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <path d="M10 6v4l3 2"/>
      </svg>
    ),
    link: true,
  },
  {
    title: 'Pattern-First Approach',
    desc: 'Language and skill acquisition works through patterns. We surface the 20% of patterns that cover 80% of real usage — then drill them until they become automatic.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h9l3 3v13H4V2z"/>
        <path d="M13 2v3h3"/>
        <line x1="7" y1="9" x2="13" y2="9"/>
        <line x1="7" y1="12" x2="13" y2="12"/>
      </svg>
    ),
    link: true,
  },
  {
    title: 'Real AI, Not a Wrapper',
    desc: 'AI inside Atlas Lab apps generates content, adapts difficulty per user, gives contextual feedback, and explains why — it does not just relay a chat model response with a thin UI on top.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
        <rect x="6" y="6" width="8" height="8"/>
        <line x1="10" y1="1" x2="10" y2="6"/>
        <line x1="10" y1="14" x2="10" y2="19"/>
        <line x1="1" y1="10" x2="6" y2="10"/>
        <line x1="14" y1="10" x2="19" y2="10"/>
      </svg>
    ),
    link: false,
  },
  {
    title: 'Habit-Sized by Design',
    desc: 'Every Atlas Lab product fits into five focused minutes. Built mobile-first, works offline, and strips out everything that gets in the way of the one thing you are trying to learn.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="1" width="8" height="18" rx="1.5"/>
        <circle cx="10" cy="16" r="0.75" fill="#fff" stroke="none"/>
        <line x1="8" y1="4" x2="12" y2="4"/>
      </svg>
    ),
    link: false,
  },
]

/* ── Products data ────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    mark: 'P',
    name: 'Patto',
    tag: 'Live',
    desc: 'Master English through 500 high-frequency sentence patterns. Drill them in context, track your progress, and build fluency one habit at a time.',
    href: '/patto/home',
    muted: false,
  },
  {
    mark: '한',
    name: 'K-Patto',
    tag: 'Beta',
    desc: 'Korean pattern learning rebuilt for global learners. Audio drills, webtoon stories, and AI pronunciation feedback — all around 500 core Korean patterns.',
    href: '/kpatto',
    muted: false,
  },
  {
    mark: '食',
    name: 'K-Pantry',
    tag: 'Live',
    desc: 'Discover Korean recipes based on ingredients already in your fridge. Learn the techniques, not just the recipes. Every dish teaches a transferable cooking method.',
    href: '/kpantry/en',
    muted: false,
  },
  {
    mark: 'C',
    name: 'Career Navi',
    tag: 'Soon',
    desc: 'AI career navigation for Korean professionals exploring international paths. Pattern-maps the skills gap between where you are and where you want to go.',
    href: null,
    muted: true,
  },
]

/* ── Philosophy items ─────────────────────────────────────────────────── */
const PHILOSOPHY = [
  {
    num: '01',
    title: 'Mastery over engagement',
    desc: 'We do not optimize for daily active users or session length. We measure whether users can actually use what they learned. These are different targets and they produce different products.',
  },
  {
    num: '02',
    title: 'Context is the curriculum',
    desc: 'Isolated facts do not transfer. Every pattern, recipe, or skill we teach is embedded in realistic context — real sentences, real dishes, real career situations — so the brain files it correctly.',
  },
  {
    num: '03',
    title: 'Five minutes beats five hours',
    desc: 'Habit formation science says frequency matters more than duration. A focused five-minute daily drill compounds faster than a long weekly session. Our UX is built around this.',
  },
  {
    num: '04',
    title: 'AI as a real teacher',
    desc: 'A great teacher does not just answer questions — they diagnose gaps, adjust to the student, and decide what to teach next. Our AI models are evaluated against that standard, not against chat quality.',
  },
]

/* ══════════════════════════════════════════════════════════════════════════
   About page
   ══════════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Our Mission')

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #F9F8F6; color: var(--ink, #111); overflow-x: hidden; }

        /* ── Hero ──────────────────────────────────────────────────── */
        .ab-hero {
          background: #121212;
          padding: 56px 48px 64px;
        }
        @media (max-width: 700px) {
          .ab-hero { padding: 40px 20px 52px; }
        }
        .ab-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: ${BODY};
          font-size: 13px; color: rgba(255,255,255,0.5);
          text-decoration: none; margin-bottom: 32px;
          transition: color 0.15s;
        }
        .ab-back:hover { color: rgba(255,255,255,0.85); }
        .ab-kicker {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 14px;
        }
        .ab-h1 {
          font-family: ${SERIF};
          font-size: clamp(28px, 3.8vw, 52px);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 16px;
          max-width: 640px;
        }
        .ab-sub {
          font-family: ${BODY};
          font-size: clamp(13px, 1.5vw, 15px);
          color: rgba(255,255,255,0.52);
          line-height: 1.7;
          max-width: 520px;
        }

        /* ── Wrap ──────────────────────────────────────────────────── */
        .ab-wrap {
          max-width: 1060px; margin: 0 auto;
          padding-left: 48px; padding-right: 48px;
        }
        @media (max-width: 700px) {
          .ab-wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Tab nav ───────────────────────────────────────────────── */
        .ab-tabs {
          display: flex; align-items: center; gap: 0;
          border-bottom: 1px solid #E5E3DF;
          padding-top: 36px; margin-bottom: 44px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
        }
        .ab-tab {
          background: transparent; border: none;
          border-bottom: 2px solid transparent;
          padding: 0 0 12px; margin-right: 32px;
          font-family: ${BODY};
          font-size: 13px; font-weight: 500;
          color: #888; cursor: pointer;
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .ab-tab:hover { color: #111; }
        .ab-tab.active {
          border-bottom-color: #C8102E;
          color: #111; font-weight: 700;
        }

        /* ── Mission 2×2 grid ──────────────────────────────────────── */
        .mission-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: #E5E3DF;
          border: 1px solid #E5E3DF;
          margin-bottom: 64px;
        }
        @media (max-width: 600px) {
          .mission-grid { grid-template-columns: 1fr; }
        }
        .mcard {
          background: #F9F8F6;
          padding: 32px 28px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .micon {
          width: 40px; height: 40px;
          background: #C8102E;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .micon-muted { background: #C0B9AF; }
        .mtitle {
          font-family: ${SERIF};
          font-size: 17px; font-weight: 700;
          color: #111; line-height: 1.25;
        }
        .mdesc {
          font-family: ${BODY};
          font-size: 13px; color: #666;
          line-height: 1.7; flex: 1;
        }
        .mlink {
          font-family: ${BODY};
          font-size: 12px; font-weight: 600;
          color: #C8102E; text-decoration: none;
          letter-spacing: 0.02em;
        }
        .mlink:hover { text-decoration: underline; }

        /* ── Products grid ─────────────────────────────────────────── */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: #E5E3DF;
          border: 1px solid #E5E3DF;
          margin-bottom: 64px;
        }
        @media (max-width: 600px) {
          .prod-grid { grid-template-columns: 1fr; }
        }
        .pcard {
          background: #F9F8F6;
          padding: 28px 24px;
          display: flex; flex-direction: column; gap: 12px;
          text-decoration: none; color: inherit;
          transition: background 0.15s;
        }
        .pcard-link:hover { background: #EDEAE6; }
        .pcard-top {
          display: flex; align-items: center;
          justify-content: space-between;
        }
        .pmark {
          width: 40px; height: 40px;
          background: #C8102E;
          display: flex; align-items: center; justify-content: center;
        }
        .pmark-muted { background: #C0B9AF; }
        .pmark-letter {
          font-family: ${SERIF};
          font-size: 17px; font-weight: 700;
          color: #fff; line-height: 1;
        }
        .pbadge {
          font-family: ${BODY};
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 3px 8px;
        }
        .badge-live { background: #C8102E; color: #fff; }
        .badge-beta { background: #E8E8E8; color: #888; }
        .badge-soon { background: #F0F0F0; color: #aaa; }
        .pname {
          font-family: ${SERIF};
          font-size: 18px; font-weight: 700;
          color: #111; letter-spacing: -0.01em;
        }
        .pdesc {
          font-family: ${BODY};
          font-size: 13px; color: #666;
          line-height: 1.65;
        }
        .popen {
          font-family: ${BODY};
          font-size: 12px; font-weight: 600;
          color: #C8102E; text-decoration: none;
          letter-spacing: 0.02em; margin-top: 4px;
          align-self: flex-start;
        }
        .popen:hover { text-decoration: underline; }
        .psoon-text {
          font-family: ${BODY};
          font-size: 12px; color: #bbb;
        }

        /* ── Philosophy list ───────────────────────────────────────── */
        .phil-list {
          display: flex; flex-direction: column;
          gap: 0;
          border: 1px solid #E5E3DF;
          margin-bottom: 64px;
        }
        .phil-item {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 24px;
          padding: 28px 28px;
          border-bottom: 1px solid #E5E3DF;
          background: #F9F8F6;
        }
        .phil-item:last-child { border-bottom: none; }
        .phil-num {
          font-family: ${BODY};
          font-size: 11px; font-weight: 700;
          color: #C8102E; letter-spacing: 0.06em;
          padding-top: 3px;
        }
        .phil-title {
          font-family: ${SERIF};
          font-size: 17px; font-weight: 700;
          color: #111; margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .phil-desc {
          font-family: ${BODY};
          font-size: 13px; color: #666;
          line-height: 1.7;
        }

        /* ── Team section ──────────────────────────────────────────── */
        .team-wrap {
          border: 1px solid #E5E3DF;
          background: #F9F8F6;
          padding: 40px 32px;
          margin-bottom: 64px;
        }
        .team-label {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #999; margin-bottom: 20px;
        }
        .team-body {
          font-family: ${BODY};
          font-size: 14px; color: #444;
          line-height: 1.8; max-width: 680px;
        }
        .team-body p + p { margin-top: 16px; }
        .team-contact {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 28px;
          font-family: ${BODY};
          font-size: 13px; font-weight: 600;
          color: #C8102E; text-decoration: none;
        }
        .team-contact:hover { text-decoration: underline; }
      `}</style>

      <SiteNav />

      {/* ── Hero ── */}
      <section className="ab-hero">
        <div className="ab-wrap">
          <Link href="/" className="ab-back">← Atlas Lab</Link>
          <p className="ab-kicker">About Us</p>
          <h1 className="ab-h1">Building Tools for Skill Mastery</h1>
          <p className="ab-sub">
            We craft AI-powered products focused on language learning, Korean cooking, and career growth.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ background: '#F9F8F6', minHeight: '60vh' }}>
        <div className="ab-wrap">

          {/* Tab nav */}
          <div className="ab-tabs" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`ab-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Our Mission */}
          {activeTab === 'Our Mission' && (
            <div className="mission-grid">
              {MISSION_CARDS.map(card => (
                <div key={card.title} className="mcard">
                  <div className="micon">
                    {card.icon}
                  </div>
                  <div className="mtitle">{card.title}</div>
                  <div className="mdesc">{card.desc}</div>
                  {card.link && (
                    <Link href="/about" className="mlink">Learn more →</Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {activeTab === 'Products' && (
            <div className="prod-grid">
              {PRODUCTS.map(p => {
                const inner = (
                  <>
                    <div className="pcard-top">
                      <div className={`pmark ${p.muted ? 'pmark-muted' : ''}`}>
                        <span className="pmark-letter">{p.mark}</span>
                      </div>
                      <span className={`pbadge ${
                        p.tag === 'Live' ? 'badge-live' :
                        p.tag === 'Beta' ? 'badge-beta' : 'badge-soon'
                      }`}>{p.tag === 'Soon' ? 'Coming soon' : p.tag}</span>
                    </div>
                    <div className="pname">{p.name}</div>
                    <div className="pdesc">{p.desc}</div>
                    {p.href
                      ? <span className="popen">Open app →</span>
                      : <span className="psoon-text">In development</span>
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
          )}

          {/* Team */}
          {activeTab === 'Team' && (
            <div className="team-wrap">
              <div className="team-label">Our team</div>
              <div className="team-body">
                <p>
                  Atlas Lab is an independent studio building focused learning tools at the intersection of AI and real-world skill acquisition. We are a small team of designers, engineers, and language learners who believe that technology should make you measurably better at things that matter.
                </p>
                <p>
                  We do not chase virality or engagement loops. We chase outcomes — can you use the language? Can you cook the dish? Can you navigate the career transition? If yes, the product worked.
                </p>
                <p>
                  Our team spans Seoul, and we build every product with the assumption that the user has five minutes, an unreliable internet connection, and a clear goal they have been putting off for too long.
                </p>
              </div>
              <Link href="/contact" className="team-contact">
                Get in touch →
              </Link>
            </div>
          )}

          {/* Philosophy */}
          {activeTab === 'Philosophy' && (
            <div className="phil-list">
              {PHILOSOPHY.map(item => (
                <div key={item.num} className="phil-item">
                  <div className="phil-num">{item.num}</div>
                  <div>
                    <div className="phil-title">{item.title}</div>
                    <div className="phil-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <SiteFooter />
    </>
  )
}
