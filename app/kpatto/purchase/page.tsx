import type { Metadata } from 'next'
import Link from 'next/link'
import { SampleAudio, type AudioSample } from './SampleAudio'
import { CHECKOUT_URL, VOICE_NAME } from '@/lib/kpatto/purchase'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

export const metadata: Metadata = {
  title: 'K-PATTO: 300 Essential Korean Patterns & Audio Guide',
  description:
    'The definitive guide for travelers and learners to speak natural Korean effortlessly — 300 patterns, 900 audio examples, in Master (A4/tablet) and Pocket (mobile) PDF editions.',
  // 결제 링크·PDF 가 확정되기 전이라 검색에는 노출하지 않는다. 판매 시작 때 이 줄을 지운다.
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE}/kpatto/purchase` },
}

// ── 팔레트: Warm Espresso / Terracotta / Sand Beige ───────────────────────────
const ESPRESSO = '#2B1D17'
const BRICK = '#B4502E'
const BRICK_DARK = '#9A4125'
const SAND = '#F4EDE0'
const SAND_DEEP = '#EADFCB'
const ROSE = '#F7ECE6'
const PAPER = '#FFFBF7'
const MUTED = '#6B544A'
const LINE = '#E3D6C4'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const KO = '"Pretendard Variable", Pretendard, "DM Sans", system-ui, sans-serif'

const SAMPLES: AudioSample[] = [
  { slug: 'juseyo', n: 1, ko: '물 주세요.', en: 'Water, please.' },
  { slug: 'mwoyeyo', n: 3, ko: '이 음식 뭐예요?', en: 'What is this food?' },
  { slug: 'eotteoke-gayo', n: 1, ko: '홍대 어떻게 가요?', en: 'How do I get to Hongdae?' },
  { slug: 'gago-sipeoyo', n: 1, ko: '제주도 가고 싶어요.', en: 'I want to go to Jeju Island.' },
  { slug: 'meokgo-sipeoyo', n: 2, ko: '떡볶이 먹고 싶어요.', en: 'I want to eat tteokbokki.' },
  { slug: 'mot-meogeoyo', n: 2, ko: '매운 거 못 먹어요.', en: "I can't eat spicy food." },
]

// 레이아웃 미리보기에 쓰는 실제 패턴(교재 1~4번)
const PATTERNS = [
  { no: '001', ko: '~주세요', en: 'Give me ~, please.', ex: '물 주세요.', exEn: 'Water, please.' },
  { no: '002', ko: '~뭐예요?', en: 'What is ~?', ex: '이거 뭐예요?', exEn: 'What is this?' },
  { no: '003', ko: '~있어요?', en: 'Is there ~? / Do you have ~?', ex: '와이파이 있어요?', exEn: 'Is there Wi-Fi?' },
  { no: '004', ko: '~이에요/예요', en: 'is; am; are', ex: '저는 학생이에요.', exEn: "I'm a student." },
]

const FEATURES = [
  {
    n: '01',
    title: '300 Curated Patterns',
    body: 'Essential sentence structures for dining, shopping, transportation, and daily situations in Korea.',
  },
  {
    n: '02',
    title: '900 Pro Audio Examples',
    body: `Crystal-clear audio files for every example sentence, voiced with the Typecast voice ${VOICE_NAME} (Normal tone, natural pacing).`,
  },
]

export default function KPattoPurchasePage() {
  return (
    <div className="pp-root" style={{ background: SAND, color: ESPRESSO, fontFamily: BODY, minHeight: '100vh' }}>
      <style>{`
        .pp-wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px; }
        .pp-eyebrow { font-family: ${BODY}; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: ${BRICK}; margin: 0 0 14px; }
        .pp-h2 { font-family: ${SERIF}; font-size: 30px; line-height: 1.2; letter-spacing: -.01em; margin: 0 0 14px; color: ${ESPRESSO}; }
        .pp-lead { font-size: 16px; line-height: 1.7; color: ${MUTED}; margin: 0; max-width: 620px; }
        .pp-section { padding: 64px 0; }
        .pp-btn { display: inline-block; background: ${BRICK}; color: #fff; padding: 14px 30px; font-size: 15px; font-weight: 600; text-decoration: none; box-shadow: 0 1px 0 ${BRICK_DARK}; transition: background .15s; }
        .pp-btn:hover { background: ${BRICK_DARK}; }
        .pp-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .pp-grid2 { display: grid; grid-template-columns: 1.25fr 1fr; gap: 28px; align-items: start; }
        .pp-card { background: ${PAPER}; border: 1px solid ${LINE}; padding: 26px 24px; }
        .pp-tablet { aspect-ratio: 3 / 4; background: ${PAPER}; border: 1px solid ${LINE}; box-shadow: 0 18px 40px rgba(43,29,23,.12); padding: 22px 22px 18px; display: flex; flex-direction: column; }
        .pp-phone { width: 210px; aspect-ratio: 9 / 19; background: ${PAPER}; border: 8px solid ${ESPRESSO}; border-radius: 30px; box-shadow: 0 18px 40px rgba(43,29,23,.18); padding: 18px 14px; display: flex; flex-direction: column; overflow: hidden; }
        @media (max-width: 820px) {
          .pp-grid3 { grid-template-columns: 1fr; }
          .pp-grid2 { grid-template-columns: 1fr; }
          .pp-h2 { font-size: 26px; }
          .pp-section { padding: 48px 0; }
        }
      `}</style>

      {/* Top bar */}
      <div className="pp-wrap" style={{ paddingTop: 22 }}>
        <Link href="/blog" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>← Atlas Lab Articles</Link>
      </div>

      {/* ── Hero ── */}
      <section className="pp-section" style={{ paddingTop: 44 }}>
        <div className="pp-wrap" style={{ textAlign: 'center' }}>
          <p className="pp-eyebrow">K-PATTO E-Book Package</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 6vw, 52px)', lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 auto 18px', maxWidth: 760, color: ESPRESSO }}>
            K-PATTO: 300 Essential Korean Patterns &amp; Audio Guide
          </h1>
          <p className="pp-lead" style={{ margin: '0 auto 30px', fontSize: 18 }}>
            The definitive guide for travelers and learners to speak natural Korean effortlessly.
          </p>
          <a href="#checkout" className="pp-btn">Get the Premium PDF Package →</a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginTop: 40, flexWrap: 'wrap' }}>
            {[['300', 'patterns'], ['900', 'audio examples'], ['2', 'PDF editions']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: SERIF, fontSize: 34, color: BRICK, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: MUTED, marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="pp-section" style={{ background: ROSE }}>
        <div className="pp-wrap">
          <p className="pp-eyebrow">What&apos;s included</p>
          <h2 className="pp-h2">Everything you need to speak, not just read</h2>
          <p className="pp-lead" style={{ marginBottom: 34 }}>
            Every pattern comes with three real-life example sentences — and you can hear each one.
          </p>
          <div className="pp-grid3">
            {FEATURES.map(f => (
              <div key={f.n} className="pp-card">
                <div style={{ fontFamily: SERIF, fontSize: 28, color: BRICK, marginBottom: 10 }}>{f.n}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, margin: '0 0 10px', color: ESPRESSO }}>{f.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: MUTED, margin: 0 }}>{f.body}</p>
              </div>
            ))}
            <div className="pp-card">
              <div style={{ fontFamily: SERIF, fontSize: 28, color: BRICK, marginBottom: 10 }}>03</div>
              <h3 style={{ fontFamily: SERIF, fontSize: 21, margin: '0 0 12px', color: ESPRESSO }}>Dual Formats Included</h3>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                <li style={{ fontSize: 15, lineHeight: 1.6, color: MUTED }}>
                  <strong style={{ color: ESPRESSO }}>1. Master Edition</strong> — A4/Tablet optimized, 2-column editorial grid for deep study and printing.
                </li>
                <li style={{ fontSize: 15, lineHeight: 1.6, color: MUTED }}>
                  <strong style={{ color: ESPRESSO }}>2. Pocket Edition</strong> — 1-pattern-per-page vertical layout designed specifically for effortless mobile reading.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Preview / Samples ── */}
      <section className="pp-section">
        <div className="pp-wrap">
          <p className="pp-eyebrow">Preview</p>
          <h2 className="pp-h2">See the layouts. Hear the audio.</h2>
          <p className="pp-lead" style={{ marginBottom: 36 }}>
            Layout previews below show how a pattern page is set in each edition (illustrative — final PDF pages may differ slightly).
          </p>

          <div className="pp-grid2" style={{ marginBottom: 56 }}>
            {/* Tablet / Master Edition */}
            <figure style={{ margin: 0 }}>
              <div className="pp-tablet" aria-label="Master Edition layout preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}`, paddingBottom: 8, marginBottom: 14, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED }}>
                  <span>K-PATTO · Master Edition</span><span>Patterns 001–004</span>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: '14px 18px' }}>
                  {PATTERNS.map(p => (
                    <div key={p.no} style={{ borderTop: `2px solid ${BRICK}`, paddingTop: 8 }}>
                      <div style={{ fontSize: 10, color: BRICK, fontWeight: 700, letterSpacing: '.1em' }}>#{p.no}</div>
                      <div style={{ fontFamily: KO, fontSize: 'clamp(15px, 2.4vw, 22px)', fontWeight: 700, margin: '3px 0 2px', color: ESPRESSO }}>{p.ko}</div>
                      <div style={{ fontSize: 'clamp(9px, 1.3vw, 12px)', color: MUTED, marginBottom: 8 }}>{p.en}</div>
                      <div style={{ background: SAND, padding: '6px 8px' }}>
                        <div style={{ fontFamily: KO, fontSize: 'clamp(10px, 1.6vw, 14px)', fontWeight: 600 }}>{p.ex}</div>
                        <div style={{ fontSize: 'clamp(8px, 1.1vw, 11px)', color: MUTED }}>{p.exEn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <figcaption style={{ fontSize: 13, color: MUTED, marginTop: 12, textAlign: 'center' }}>
                <strong style={{ color: ESPRESSO }}>Master Edition</strong> · A4 / tablet · 2-column grid
              </figcaption>
            </figure>

            {/* Mobile / Pocket Edition */}
            <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="pp-phone" aria-label="Pocket Edition layout preview">
                <div style={{ fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: BRICK, fontWeight: 700 }}>Pattern #001</div>
                <div style={{ fontFamily: KO, fontSize: 30, fontWeight: 800, margin: '10px 0 2px', color: ESPRESSO }}>~주세요</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>Give me ~, please.</div>
                {[['물 주세요.', 'Water, please.'], ['메뉴판 주세요.', 'Please give me the menu.'], ['영수증 주세요.', 'Please give me the receipt.']].map(([ko, en]) => (
                  <div key={ko} style={{ background: SAND, padding: '7px 9px', marginBottom: 7, borderLeft: `3px solid ${BRICK}` }}>
                    <div style={{ fontFamily: KO, fontSize: 13, fontWeight: 700 }}>{ko}</div>
                    <div style={{ fontSize: 9.5, color: MUTED }}>{en}</div>
                  </div>
                ))}
                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 9, color: MUTED }}>1 / 300</div>
              </div>
              <figcaption style={{ fontSize: 13, color: MUTED, marginTop: 14, textAlign: 'center' }}>
                <strong style={{ color: ESPRESSO }}>Pocket Edition</strong> · mobile · 1 pattern per page
              </figcaption>
            </figure>
          </div>

          {/* Sample audio */}
          <div className="pp-card" style={{ maxWidth: 640, margin: '0 auto' }}>
            <p className="pp-eyebrow" style={{ marginBottom: 8 }}>Sample audio</p>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, margin: '0 0 6px', color: ESPRESSO }}>Tap to listen</h3>
            <p style={{ fontSize: 14, color: MUTED, margin: '0 0 18px' }}>
              These are the real audio files from the package, voiced with Typecast voice {VOICE_NAME}.
            </p>
            <SampleAudio samples={SAMPLES} />
          </div>
        </div>
      </section>

      {/* ── Pricing & Checkout ── */}
      <section id="checkout" className="pp-section" style={{ background: SAND_DEEP }}>
        <div className="pp-wrap" style={{ textAlign: 'center', maxWidth: 680 }}>
          <p className="pp-eyebrow">Pricing &amp; Download</p>
          <h2 className="pp-h2">Get the Premium PDF Package</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: MUTED, margin: '0 auto 8px' }}>
            Includes the Master Edition (A4/Tablet), the Pocket Edition (Mobile), and all 900 audio examples.
          </p>
          <p
            role="status"
            style={{
              display: 'inline-block', background: PAPER, border: `1px dashed ${BRICK}`,
              color: ESPRESSO, fontSize: 14.5, fontWeight: 600, padding: '12px 18px', margin: '18px 0 26px',
            }}
          >
            PDF files and download links will be updated soon upon final completion.
          </p>
          <div>
            {CHECKOUT_URL ? (
              <a href={CHECKOUT_URL} className="pp-btn" rel="noopener noreferrer">Buy now →</a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                style={{
                  background: '#C9B7A3', color: '#fff', border: 'none', padding: '14px 30px',
                  fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'not-allowed',
                }}
              >
                Checkout link coming soon
              </button>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, marginTop: 14 }}>
            Secure checkout via Gumroad / Smart Store. Pricing will be announced at launch.
          </p>
        </div>
      </section>

      <div className="pp-wrap" style={{ padding: '28px 24px 40px', textAlign: 'center', fontSize: 13, color: MUTED }}>
        <Link href="/kpatto" style={{ color: BRICK, textDecoration: 'none', fontWeight: 600 }}>Try the free K-PATTO app</Link>
        {' · '}
        <Link href="/blog" style={{ color: BRICK, textDecoration: 'none', fontWeight: 600 }}>Read the articles</Link>
      </div>
    </div>
  )
}
