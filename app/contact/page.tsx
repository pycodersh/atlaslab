'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

const TABS = ['General Inquiries', 'App Support', 'Partnerships'] as const
type Tab = typeof TABS[number]

/* ══════════════════════════════════════════════════════════════════════════
   Contact page
   ══════════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<Tab>('General Inquiries')

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
      `}</style>

      <SiteNav />

      {/* ── Hero ── */}
      <section className="ct-hero">
        <div className="ct-wrap">
          <Link href="/" className="ct-back">← Atlas Lab</Link>
          <p className="ct-kicker">Contact</p>
          <h1 className="ct-h1">Get in Touch</h1>
          <p className="ct-sub">
            Have questions, partnership inquiries, or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ background: '#F9F8F6', minHeight: '60vh' }}>
        <div className="ct-wrap">

          {/* Tab nav */}
          <div className="ct-tabs" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`ct-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── General Inquiries ── */}
          {activeTab === 'General Inquiries' && (
            <div className="ct-single">
              <div className="ct-single-title">General Inquiries</div>
              <div className="ct-single-desc">
                Have questions, feedback, or media inquiries? Drop us an email and we&apos;ll get back to you.
              </div>
              <div className="ct-cards">
                <div className="ct-card-row">
                  <div className="ct-email-icon">
                    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="16" height="12" rx="1"/>
                      <path d="M2 6l8 6 8-6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ct-email-type">General</div>
                    <a href="mailto:contact@atlaslabstudios.com" className="ct-email-addr">
                      contact@atlaslabstudios.com
                    </a>
                    <div className="ct-email-note">For general questions, media, and feedback.</div>
                  </div>
                </div>
                <div className="ct-card-row">
                  <div className="ct-meta-icon" style={{ background: '#1a1a1a', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="8"/>
                      <path d="M10 6v4l3 2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ct-meta-label">Response time</div>
                    <div className="ct-meta-value">We typically reply within 2–3 business days.</div>
                  </div>
                </div>
                <div className="ct-card-row">
                  <div className="ct-meta-icon" style={{ background: '#1a1a1a', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              <a href="mailto:contact@atlaslabstudios.com" className="ct-mailto-btn">
                Email us at contact@atlaslabstudios.com →
              </a>
            </div>
          )}

          {/* ── App Support ── */}
          {activeTab === 'App Support' && (
            <div className="ct-single">
              <div className="ct-single-title">App Support</div>
              <div className="ct-single-desc">
                Having trouble with one of our apps? Reach out directly to our support team with details about the issue — the app name, your device, and what you were doing when it happened helps us respond faster.
              </div>
              <div className="ct-cards">
                <div className="ct-card-row">
                  <div className="ct-email-icon">
                    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="16" height="12" rx="1"/>
                      <path d="M2 6l8 6 8-6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ct-email-type">Support email</div>
                    <a href="mailto:contact@atlaslabstudios.com" className="ct-email-addr">
                      contact@atlaslabstudios.com
                    </a>
                    <div className="ct-email-note">Patto · K-Patto · K-Pantry · Career Navi</div>
                  </div>
                </div>
                <div className="ct-card-row">
                  <div className="ct-meta-icon" style={{ background: '#1a1a1a', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="8"/>
                      <path d="M10 6v4l3 2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ct-meta-label">Response time</div>
                    <div className="ct-meta-value">Bug reports: 1–2 business days<br/>General support: 2–3 business days</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Partnerships ── */}
          {activeTab === 'Partnerships' && (
            <div className="ct-single">
              <div className="ct-single-title">Partnership Inquiries</div>
              <div className="ct-single-desc">
                We&apos;re open to partnerships that align with our mission — content collaborations, educational institution licensing, API integrations, and co-development with teams working in language, food, or career tech. If you see a fit, reach out and tell us what you have in mind.
              </div>
              <div className="ct-cards">
                <div className="ct-card-row">
                  <div className="ct-email-icon">
                    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="16" height="12" rx="1"/>
                      <path d="M2 6l8 6 8-6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ct-email-type">Business &amp; press</div>
                    <a href="mailto:contact@atlaslabstudios.com" className="ct-email-addr">
                      contact@atlaslabstudios.com
                    </a>
                    <div className="ct-email-note">Partnerships, licensing, press &amp; media inquiries.</div>
                  </div>
                </div>
                <div className="ct-card-row">
                  <div className="ct-meta-icon" style={{ background: '#1a1a1a', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="8"/>
                      <path d="M10 6v4l3 2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ct-meta-label">Response time</div>
                    <div className="ct-meta-value">Partnership inquiries: 3–5 business days</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <SiteFooter />
    </>
  )
}
