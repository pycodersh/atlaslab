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
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

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

        /* ── Split layout ──────────────────────────────────────────── */
        .ct-split {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 1px;
          background: #E5E3DF;
          border: 1px solid #E5E3DF;
          margin-bottom: 64px;
          align-items: start;
        }
        @media (max-width: 720px) {
          .ct-split { grid-template-columns: 1fr; }
        }

        /* ── Contact info (left) ───────────────────────────────────── */
        .ct-info {
          background: #F9F8F6;
          padding: 36px 28px;
          display: flex; flex-direction: column; gap: 24px;
        }
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

        /* ── Form (right) ──────────────────────────────────────────── */
        .ct-form-wrap {
          background: #fff;
          padding: 36px 32px;
        }
        .ct-form-title {
          font-family: ${SERIF};
          font-size: 18px; font-weight: 700;
          color: #111; margin-bottom: 24px;
          letter-spacing: -0.01em;
        }
        .ct-form {
          display: flex; flex-direction: column; gap: 16px;
        }
        .ct-field {
          display: flex; flex-direction: column; gap: 6px;
        }
        .ct-label {
          font-family: ${BODY};
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #666;
        }
        .ct-input, .ct-select, .ct-textarea {
          font-family: ${BODY};
          font-size: 13.5px; color: #111;
          background: #F9F8F6;
          border: 1px solid #D0CEC8;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          appearance: none; -webkit-appearance: none;
        }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color: #C8102E;
          background: #fff;
        }
        .ct-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
        .ct-select-wrap { position: relative; }
        .ct-select-wrap::after {
          content: '▾';
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #888; pointer-events: none; font-size: 12px;
        }
        .ct-submit {
          background: #C8102E; color: #fff;
          font-family: ${BODY};
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          border: none; padding: 13px 28px;
          cursor: pointer; align-self: flex-start;
          transition: background 0.15s;
          margin-top: 4px;
        }
        .ct-submit:hover { background: #A30D25; }

        /* ── Success ───────────────────────────────────────────────── */
        .ct-success {
          background: #fff;
          border: 1px solid #E5E3DF;
          padding: 32px 28px;
          text-align: center;
        }
        .ct-success-icon {
          width: 44px; height: 44px;
          background: #C8102E;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .ct-success-title {
          font-family: ${SERIF};
          font-size: 19px; font-weight: 700; color: #111;
          margin-bottom: 8px;
        }
        .ct-success-msg {
          font-family: ${BODY};
          font-size: 13px; color: #666; line-height: 1.65;
        }

        /* ── Simple single-column for Support / Partnerships ───────── */
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
            <div className="ct-split">
              {/* Left: contact info */}
              <div className="ct-info">
                <div>
                  <div className="ct-info-label">Direct contact</div>
                </div>

                <div className="ct-email-card">
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

                <div className="ct-meta">
                  <div className="ct-meta-icon">
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

                <div className="ct-meta">
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

              {/* Right: form */}
              <div className="ct-form-wrap">
                {submitted ? (
                  <div className="ct-success">
                    <div className="ct-success-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 10l4 4 8-8"/>
                      </svg>
                    </div>
                    <div className="ct-success-title">Message sent</div>
                    <div className="ct-success-msg">
                      Thanks for reaching out. We&apos;ll get back to you within 2–3 business days.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ct-form-title">Send a message</div>
                    <form className="ct-form" onSubmit={handleSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="ct-field">
                          <label className="ct-label" htmlFor="ct-name">Name</label>
                          <input id="ct-name" type="text" className="ct-input" placeholder="Your name" required />
                        </div>
                        <div className="ct-field">
                          <label className="ct-label" htmlFor="ct-email">Email</label>
                          <input id="ct-email" type="email" className="ct-input" placeholder="you@example.com" required />
                        </div>
                      </div>
                      <div className="ct-field">
                        <label className="ct-label" htmlFor="ct-subject">Subject</label>
                        <div className="ct-select-wrap">
                          <select id="ct-subject" className="ct-select" required defaultValue="">
                            <option value="" disabled>Select a topic</option>
                            <option>General question</option>
                            <option>Media / press inquiry</option>
                            <option>Bug report</option>
                            <option>Feedback</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="ct-field">
                        <label className="ct-label" htmlFor="ct-msg">Message</label>
                        <textarea id="ct-msg" className="ct-textarea" placeholder="Tell us what you have in mind…" required />
                      </div>
                      <button type="submit" className="ct-submit">Send message →</button>
                    </form>
                  </>
                )}
              </div>
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
