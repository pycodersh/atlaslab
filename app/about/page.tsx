'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

const TABS = ['Why we exist', 'What we build', 'How we write', 'Who we are'] as const
type Tab = typeof TABS[number]

/* ── Products data — 'What we build' 탭 ───────────────────────────────── */
const PRODUCTS = [
  {
    mark: '한',
    name: 'K-Patto',
    tag: 'Live',
    desc: "Teaches Korean through a 100-episode webtoon set in Seoul. Each episode follows its characters through an ordinary day — ordering at a café, giving a taxi driver an address, paying at Olive Young — and teaches the expressions that actually come up, with native audio on every line. More than 300 expressions, each tied to the moment you'd use it.",
    href: '/kpatto',
    muted: false,
  },
  {
    mark: '食',
    name: 'K-Pantry',
    tag: 'Live',
    desc: "Answers a narrower question: what can I cook with what's already in my fridge? Tell it what you have, and it tells you which Korean dishes are within reach, what to substitute when something is missing, and what that unfamiliar jar in the aisle is actually for.",
    href: '/kpantry/en',
    muted: false,
  },
  {
    mark: 'P',
    name: 'Patto',
    tag: 'Live',
    desc: 'Runs the other direction — English for Korean speakers. 100 short stories built around the sentence patterns people use when they speak, rather than the ones textbooks drill.',
    href: '/patto/home',
    muted: false,
  },
  {
    mark: 'C',
    name: 'Career Navi',
    tag: 'Soon',
    desc: 'Maps where a career could go next, and what each move would actually require.',
    href: null,
    muted: true,
  },
]

/* ══════════════════════════════════════════════════════════════════════════
   About page
   ══════════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Why we exist')

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

        /* 비활성 탭도 HTML 에는 남겨 두고 CSS 로만 감춘다 —
           조건부 렌더로 빼면 본문 대부분이 서버 HTML 에서 사라져
           크롤러가 기본 탭 하나밖에 읽지 못한다. */
        .ab-panel[hidden] { display: none; }

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
          <h1 className="ab-h1">About Atlas Lab</h1>
          <p className="ab-sub">
            Atlas Lab is an independent studio building language and daily-life apps
            for people moving between Korean and English.
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

          {/* Why we exist */}
          <div className="ab-panel" role="tabpanel" hidden={activeTab !== 'Why we exist'}>
            <div className="team-wrap">
              <div className="team-label">Why we exist</div>
              <div className="team-body">
                <p>
                  Most language tools teach sentences nobody actually says. You can finish a
                  course and still freeze when a convenience store clerk asks whether you want
                  a bag. The gap isn&apos;t vocabulary. It&apos;s that textbooks are organized around
                  grammar points, while real conversations are organized around situations —
                  a counter, a queue, a question you have three seconds to answer.
                </p>
                <p>
                  Everything we make starts from a situation.
                </p>
              </div>
            </div>
          </div>

          {/* What we build */}
          <div className="ab-panel" role="tabpanel" hidden={activeTab !== 'What we build'}>
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
                    {/* 미출시 앱은 상단 COMING SOON 배지로 충분 — 하단 라벨은 중복 */}
                    {p.href && <span className="popen">Open app →</span>}
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

          {/* How we write */}
          <div className="ab-panel" role="tabpanel" hidden={activeTab !== 'How we write'}>
            <div className="team-wrap">
              <div className="team-label">How we write</div>
              <div className="team-body">
                <p>
                  Alongside the apps we publish a blog — more than 160 articles on Korean
                  phrases, food, and everyday life in Korea. Most of them answer a question
                  someone actually asked: why side dishes are free, why Google Maps doesn&apos;t
                  work here, what to say when a pharmacist asks what&apos;s wrong.
                </p>
                <p>
                  The articles are grouped into four areas — Korean phrases, life in Korea,
                  Korean food, and Korean basics — so you can read around a whole situation
                  instead of hunting one phrase at a time. Some of them pair with a short video,
                  so you can hear an exchange before you read it broken down.
                </p>
                <p>
                  When we&apos;re not sure about something, we say so rather than filling the gap.
                </p>
              </div>
            </div>
          </div>

          {/* Who we are */}
          <div className="ab-panel" role="tabpanel" hidden={activeTab !== 'Who we are'}>
            <div className="team-wrap">
              <div className="team-label">Who we are</div>
              <div className="team-body">
                <p>
                  Atlas Lab is a small independent studio based in South Korea. We build and
                  maintain everything here ourselves — the apps, the writing, the illustrations,
                  and the audio.
                </p>
                <p>
                  If you&apos;ve found something wrong in one of our articles, or there&apos;s a situation
                  you&apos;d like us to cover, we&apos;d like to hear about it. You can reach us on our
                  contact page.
                </p>
              </div>
              <Link href="/contact" className="team-contact">
                Contact page →
              </Link>
            </div>
          </div>

        </div>
      </div>

      <SiteFooter />
    </>
  )
}
