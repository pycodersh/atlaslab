'use client'

import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

/** 사이트에 존재하는 단 하나의 수신 주소. 창구를 쪼개지 않고 제목으로 분류한다. */
const EMAIL = 'contact@atlaslabstudios.com'

/* ══════════════════════════════════════════════════════════════════════════
   Contact page
   ══════════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #F9F8F6; color: var(--ink, #111); overflow-x: hidden; }

        /* ── Hero ──────────────────────────────────────────────────── */
        .ct-hero {
          background: #121212;
          padding: 56px 48px 64px;
        }
        @media (max-width: 700px) {
          .ct-hero { padding: 40px 20px 52px; }
        }
        .ct-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: ${BODY};
          font-size: 13px; color: rgba(255,255,255,0.5);
          text-decoration: none; margin-bottom: 32px;
          transition: color 0.15s;
        }
        .ct-back:hover { color: rgba(255,255,255,0.85); }
        .ct-kicker {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 14px;
        }
        .ct-h1 {
          font-family: ${SERIF};
          font-size: clamp(28px, 3.8vw, 52px);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 16px;
        }
        .ct-sub {
          font-family: ${BODY};
          font-size: clamp(13px, 1.5vw, 15px);
          color: rgba(255,255,255,0.52);
          line-height: 1.7;
          max-width: 520px;
        }

        /* ── Wrap ──────────────────────────────────────────────────── */
        .ct-wrap {
          max-width: 1060px; margin: 0 auto;
          padding-left: 48px; padding-right: 48px;
        }
        @media (max-width: 700px) {
          .ct-wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Tab nav ───────────────────────────────────────────────── */
        .ct-tabs {
          display: flex; align-items: center;
          border-bottom: 1px solid #E5E3DF;
          padding-top: 36px; margin-bottom: 44px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
        }
        .ct-tab {
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
        .ct-tab:hover { color: #111; }
        .ct-tab.active {
          border-bottom-color: #C8102E;
          color: #111; font-weight: 700;
        }

        /* ── Contact info ──────────────────────────────────────────── */
        .ct-info-label {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #999; margin-bottom: 4px;
        }
        .ct-email-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 20px 18px;
          background: #fff;
          border: 1px solid #E5E3DF;
        }
        .ct-email-icon {
          width: 36px; height: 36px;
          background: #C8102E;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ct-email-type {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #999; margin-bottom: 5px;
        }
        .ct-email-addr {
          font-family: ${BODY};
          font-size: 13px; font-weight: 600;
          color: #111; text-decoration: none;
        }
        .ct-email-addr:hover { color: #C8102E; }
        .ct-email-note {
          font-family: ${BODY};
          font-size: 11.5px; color: #888;
          line-height: 1.6; margin-top: 4px;
        }
        .ct-meta {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 18px 18px;
          background: #fff;
          border: 1px solid #E5E3DF;
        }
        .ct-meta-icon {
          width: 36px; height: 36px;
          background: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ct-meta-label {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #999; margin-bottom: 5px;
        }
        .ct-meta-value {
          font-family: ${BODY};
          font-size: 13px; color: #444;
          line-height: 1.55;
        }

        /* ── Mailto button ─────────────────────────────────────────── */
        .ct-mailto-btn {
          display: inline-block;
          background: #C8102E; color: #fff;
          font-family: ${BODY};
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.04em;
          text-decoration: none;
          padding: 13px 24px;
          transition: background 0.15s;
          margin-top: 28px;
        }
        .ct-mailto-btn:hover { background: #A30D25; }

        /* ── Single-column layout ───────────────────────────────────── */
        .ct-single {
          background: #F9F8F6;
          border: 1px solid #E5E3DF;
          padding: 40px 32px;
          margin-bottom: 64px;
        }
        .ct-single-title {
          font-family: ${SERIF};
          font-size: 20px; font-weight: 700; color: #111;
          margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .ct-single-desc {
          font-family: ${BODY};
          font-size: 13.5px; color: #555;
          line-height: 1.75; max-width: 600px;
          margin-bottom: 28px;
        }
        .ct-cards {
          display: flex; flex-direction: column; gap: 1px;
          background: #E5E3DF;
          border: 1px solid #E5E3DF;
        }
        .ct-card-row {
          display: flex; align-items: flex-start; gap: 14px;
          background: #fff; padding: 20px 20px;
        }

        /* 탭 바가 빠졌으므로 첫 블록이 히어로에 붙지 않게 위 여백을 준다
           (기존에는 .ct-tabs 의 padding-top/margin-bottom 이 그 역할을 했다) */
        .ct-single:first-of-type { margin-top: 44px; }

        /* 본문 블록 — 기존 .ct-single 과 같은 틀을 그대로 쓴다 */
        .ct-h2 {
          font-family: ${SERIF};
          font-size: 20px; font-weight: 700; color: #111;
          margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .ct-body {
          font-family: ${BODY};
          font-size: 13.5px; color: #555;
          line-height: 1.75; max-width: 600px;
        }
        .ct-body p + p { margin-top: 14px; }
        .ct-list {
          font-family: ${BODY};
          font-size: 13.5px; color: #555;
          line-height: 1.75; max-width: 600px;
          list-style: none; margin-top: 14px;
        }
        .ct-list li { padding-left: 14px; position: relative; }
        .ct-list li + li { margin-top: 8px; }
        .ct-list li::before {
          content: ''; position: absolute; left: 0; top: 9px;
          width: 4px; height: 4px; background: #C8102E;
        }
        .ct-list strong { color: #111; font-weight: 700; }
      `}</style>

      <SiteNav />

      {/* ── Hero ── */}
      <section className="ct-hero">
        <div className="ct-wrap">
          <Link href="/" className="ct-back">← Atlas Lab</Link>
          <p className="ct-kicker">Get in touch</p>
          <h1 className="ct-h1">Contact</h1>
          <p className="ct-sub">
            We read everything that comes in, and we answer. Whether it&apos;s a bug, a
            correction to something we wrote, or a question about one of the apps,
            this is the place.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ background: '#F9F8F6', minHeight: '60vh' }}>
        <div className="ct-wrap">

          {/* ── Email us ── */}
          <div className="ct-single">
            <div className="ct-h2">Email us</div>
            <div className="ct-cards">
              <div className="ct-card-row">
                <div className="ct-email-icon">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="16" height="12" rx="1"/>
                    <path d="M2 6l8 6 8-6"/>
                  </svg>
                </div>
                <div>
                  <div className="ct-email-type">Email</div>
                  <a href={`mailto:${EMAIL}`} className="ct-email-addr">{EMAIL}</a>
                  <div className="ct-email-note">Patto · K-Patto · K-Pantry · Career Navi · the blog</div>
                </div>
              </div>
              <div className="ct-card-row">
                <div className="ct-meta-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="10" r="8"/>
                    <line x1="2" y1="10" x2="18" y2="10"/>
                    <path d="M10 2a14.5 14.5 0 0 1 0 16M10 2a14.5 14.5 0 0 0 0 16"/>
                  </svg>
                </div>
                <div>
                  <div className="ct-meta-label">Based in</div>
                  <div className="ct-meta-value">Seoul, South Korea (KST, UTC+9)</div>
                </div>
              </div>
            </div>

            <div className="ct-body" style={{ marginTop: 24 }}>
              <p>
                Everything reaches the same inbox, so putting the topic at the front of
                the subject line helps us get to it faster:
              </p>
            </div>
            <ul className="ct-list">
              <li><strong>Support</strong> — a bug, a payment problem, or an account you can&apos;t get into</li>
              <li><strong>Correction</strong> — an error in one of our articles</li>
              <li><strong>Partnerships</strong> — collaborations, licensing, or press</li>
              <li>
                <strong>Everything else</strong> — questions about Atlas Lab, our writing, or a
                situation you&apos;d like us to cover
              </li>
            </ul>

            <a href={`mailto:${EMAIL}`} className="ct-mailto-btn">
              Email us at {EMAIL} →
            </a>
          </div>

          {/* ── What helps ── */}
          <div className="ct-single">
            <div className="ct-h2">What helps</div>
            <div className="ct-body">
              <p>
                A link to the exact page, a screenshot, and the device and browser you were
                using. For an app issue, the email address on your account. With those we
                can usually answer in one reply instead of three.
              </p>
            </div>
          </div>

          {/* ── Response time ── */}
          <div className="ct-single">
            <div className="ct-h2">Response time</div>
            <div className="ct-body">
              <p>
                We&apos;re a small team, so replies usually take one to two business days, and
                sometimes longer around Korean public holidays. If something is urgent and
                involves a payment or an account you&apos;ve lost access to, say so in the
                subject line and we&apos;ll move it up the queue.
              </p>
            </div>
          </div>

          {/* ── Corrections ── */}
          <div className="ct-single">
            <div className="ct-h2">Corrections</div>
            <div className="ct-body">
              <p>
                We write about a language and a country that both keep changing, and we get
                things wrong sometimes. Prices move, shops close, a phrase that was common
                five years ago starts to sound dated. If you spot an error, tell us which
                article and what&apos;s wrong — we&apos;ll check it and fix it.
              </p>
            </div>
          </div>

        </div>
      </div>

      <SiteFooter />
    </>
  )
}
