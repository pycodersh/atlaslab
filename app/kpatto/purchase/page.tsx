import type { Metadata } from 'next'
import Link from 'next/link'
import { SampleAudio, type AudioSample } from './SampleAudio'
import { CHECKOUT_URL } from '@/lib/kpatto/purchase'
import { PROMO } from '@/lib/blog/promoTheme'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

export const metadata: Metadata = {
  title: 'K-PATTO: 300 Essential Korean Patterns & Audio Guide',
  description:
    'The definitive guide for travelers and learners to speak natural Korean effortlessly — 300 TOPIK-aligned patterns, 900 audio examples, in Master (A4/tablet) and Pocket (mobile) PDF editions.',
  // 결제 링크·PDF 가 확정되기 전이라 검색에는 노출하지 않는다. 판매 시작 때 이 줄을 지운다.
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE}/kpatto/purchase` },
}

// ── 팔레트: 글 하단 프로모션 박스와 같은 토큰(lib/blog/promoTheme) — 한 세트로 보이도록 한 곳에서 가져온다 ──
const { espresso: ESPRESSO, brick: BRICK, brickDark: BRICK_DARK, sand: SAND, line: LINE, muted: MUTED, serif: SERIF, body: BODY } = PROMO
const SAND_DEEP = '#EADFCB'
const ROSE = '#F7ECE6'
const PAPER = '#FFFBF7'
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

// TOPIK 등급 사다리 — 3급까지가 이 패키지가 데려다 주는 곳
const TOPIK_TIERS = [
  { tier: 'Beginner', levels: [1, 2] },
  { tier: 'Intermediate', levels: [3, 4] },
  { tier: 'Advanced', levels: [5, 6] },
]

export default function KPattoPurchasePage() {
  return (
    <div className="pp-root" style={{ background: SAND, color: ESPRESSO, fontFamily: BODY, minHeight: '100vh' }}>
      <style>{`
        .pp-wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px; }
        .pp-narrow { max-width: 720px; margin: 0 auto; }
        .pp-eyebrow { font-family: ${BODY}; font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: ${BRICK}; margin: 0 0 16px; }
        .pp-h2 { font-family: ${SERIF}; font-size: 34px; line-height: 1.2; letter-spacing: -.015em; margin: 0 0 16px; color: ${ESPRESSO}; }
        .pp-lead { font-size: 17px; line-height: 1.7; color: ${MUTED}; margin: 0; max-width: 640px; }
        .pp-section { padding: 88px 0; }
        .pp-head { margin-bottom: 44px; }
        .pp-card { background: ${PAPER}; border: 1px solid ${LINE}; border-top: 3px solid ${BRICK}; padding: 30px 26px 28px; }
        .pp-num { font-family: ${SERIF}; font-size: 30px; line-height: 1; color: ${BRICK}; margin-bottom: 16px; }
        .pp-card h3 { font-family: ${SERIF}; font-size: 22px; line-height: 1.25; margin: 0 0 12px; color: ${ESPRESSO}; }
        .pp-card p, .pp-card li { font-size: 15.5px; line-height: 1.7; color: ${MUTED}; margin: 0; }
        .pp-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: stretch; }
        .pp-grid2 { display: grid; grid-template-columns: 1.25fr 1fr; gap: 36px; align-items: start; }
        .pp-tablet { aspect-ratio: 3 / 4; background: ${PAPER}; border: 1px solid ${LINE}; box-shadow: 0 18px 40px rgba(43,29,23,.12); padding: 22px 22px 18px; display: flex; flex-direction: column; }
        .pp-phone { width: 210px; aspect-ratio: 9 / 19; background: ${PAPER}; border: 8px solid ${ESPRESSO}; border-radius: 30px; box-shadow: 0 18px 40px rgba(43,29,23,.18); padding: 18px 14px; display: flex; flex-direction: column; overflow: hidden; }
        .pp-quote { font-family: ${SERIF}; font-style: italic; font-weight: 700; font-size: 25px; line-height: 1.45; color: ${ESPRESSO}; margin: 0; padding-left: 22px; border-left: 4px solid ${BRICK}; }
        .pp-quote strong { color: ${BRICK}; font-style: normal; }
        .pp-ladder { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 8px; }
        .pp-level { text-align: center; padding: 14px 4px 12px; background: ${PAPER}; border: 1px solid ${LINE}; }
        .pp-level.on { background: ${BRICK}; border-color: ${BRICK}; color: #fff; }
        .pp-level.reach { background: #F3E3DA; border-color: ${BRICK}; }
        @media (max-width: 820px) {
          .pp-grid3, .pp-grid2 { grid-template-columns: 1fr; }
          .pp-h2 { font-size: 28px; }
          .pp-section { padding: 60px 0; }
          .pp-head { margin-bottom: 32px; }
          .pp-quote { font-size: 21px; padding-left: 16px; }
          .pp-lead { font-size: 16px; }
        }
      `}</style>

      {/* Top bar */}
      <div className="pp-wrap" style={{ paddingTop: 22 }}>
        <Link href="/blog" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>← Atlas Lab Articles</Link>
      </div>

      {/* ── Hero ── */}
      <section style={{ padding: '56px 0 72px' }}>
        <div className="pp-wrap" style={{ textAlign: 'center' }}>
          <p className="pp-eyebrow">K-PATTO E-Book Package</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 auto 22px', maxWidth: 780, color: ESPRESSO }}>
            K-PATTO: 300 Essential Korean Patterns &amp; Audio Guide
          </h1>
          <p className="pp-lead" style={{ margin: '0 auto 34px', fontSize: 19, maxWidth: 600 }}>
            The definitive guide for travelers and learners to speak natural Korean effortlessly.
          </p>
          <a href="#checkout" className="promo-btn">Get the Premium PDF Package →</a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 52, flexWrap: 'wrap' }}>
            {[['300', 'patterns'], ['900', 'audio examples'], ['2', 'PDF editions']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: SERIF, fontSize: 38, color: BRICK, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED, marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning outcome: TOPIK 등급 ── */}
      <section className="pp-section" style={{ background: PAPER, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div className="pp-wrap">
          <div className="pp-narrow">
            <p className="pp-eyebrow">Learning outcome</p>
            <h2 className="pp-h2">Mastering TOPIK-aligned grammar patterns by grade level</h2>
            <p className="pp-lead" style={{ marginBottom: 40 }}>
              This curriculum covers essential grammar expressions structured by proficiency tiers.
            </p>
            <blockquote className="pp-quote">
              By mastering all 300 curated patterns and 900 professional audio examples provided in our app and e-book package,
              learners gain the practical fluency equivalent to <strong>TOPIK Level 3</strong> — independent user proficiency
              for daily life, travel, and social interactions in Korea.
            </blockquote>
          </div>

          <div style={{ marginTop: 56 }}>
            <p className="pp-eyebrow" style={{ textAlign: 'center', marginBottom: 20 }}>Where the 300 patterns take you</p>
            <div className="pp-ladder" role="img" aria-label="TOPIK levels 1 to 6. The package takes you up to Level 3.">
              {TOPIK_TIERS.flatMap(t => t.levels).map(level => (
                <div key={level} className={`pp-level ${level <= 3 ? (level === 3 ? 'on' : 'reach') : ''}`} style={{ opacity: level > 3 ? 0.55 : 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', opacity: level === 3 ? 0.85 : 0.7 }}>Level</div>
                  <div style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.1, color: level === 3 ? '#fff' : ESPRESSO }}>{level}</div>
                </div>
              ))}
            </div>
            <div className="pp-ladder" style={{ marginTop: 6 }} aria-hidden>
              {TOPIK_TIERS.map(t => (
                <div key={t.tier} style={{ gridColumn: 'span 2', textAlign: 'center', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, borderTop: `2px solid ${t.levels.includes(3) ? BRICK : LINE}`, paddingTop: 8 }}>
                  {t.tier}
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, margin: '18px 0 0' }}>
              TOPIK = Test of Proficiency in Korean · Levels 1–6
            </p>
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="pp-section" style={{ background: ROSE }}>
        <div className="pp-wrap">
          <div className="pp-head">
            <p className="pp-eyebrow">What&apos;s included</p>
            <h2 className="pp-h2">Everything you need to speak, not just read</h2>
            <p className="pp-lead">
              Every pattern comes with three real-life example sentences — and you can hear each one.
            </p>
          </div>
          <div className="pp-grid3">
            <div className="pp-card">
              <div className="pp-num">01</div>
              <h3>300 Curated Patterns</h3>
              <p>Essential sentence structures for dining, shopping, transportation, and daily situations in Korea.</p>
            </div>
            <div className="pp-card">
              <div className="pp-num">02</div>
              <h3>900 Pro Audio Examples</h3>
              <p>Crystal-clear audio files for every example sentence, recorded with a natural tone and comfortable pacing.</p>
            </div>
            <div className="pp-card">
              <div className="pp-num">03</div>
              <h3>Dual Formats Included</h3>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                <li>
                  <strong style={{ color: ESPRESSO }}>1. Master Edition</strong> — A4/Tablet optimized, 2-column editorial grid for deep study and printing.
                </li>
                <li>
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
          <div className="pp-head">
            <p className="pp-eyebrow">Preview</p>
            <h2 className="pp-h2">See the layouts. Hear the audio.</h2>
            <p className="pp-lead">
              Layout previews below show how a pattern page is set in each edition (illustrative — final PDF pages may differ slightly).
            </p>
          </div>

          <div className="pp-grid2" style={{ marginBottom: 64 }}>
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
              <figcaption style={{ fontSize: 13, color: MUTED, marginTop: 14, textAlign: 'center' }}>
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
            <h3 style={{ fontFamily: SERIF, fontSize: 24, margin: '0 0 8px', color: ESPRESSO }}>Tap to listen</h3>
            <p style={{ fontSize: 14.5, color: MUTED, margin: '0 0 20px' }}>
              These are real audio files from the package.
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
          <p style={{ fontSize: 16, lineHeight: 1.7, color: MUTED, margin: '0 auto 8px' }}>
            Includes the Master Edition (A4/Tablet), the Pocket Edition (Mobile), and all 900 audio examples.
          </p>
          <p
            role="status"
            style={{
              display: 'inline-block', background: PAPER, border: `1px dashed ${BRICK}`,
              color: ESPRESSO, fontSize: 14.5, fontWeight: 600, padding: '12px 18px', margin: '20px 0 28px',
            }}
          >
            PDF files and download links will be updated soon upon final completion.
          </p>
          <div>
            {CHECKOUT_URL ? (
              <a href={CHECKOUT_URL} className="promo-btn" rel="noopener noreferrer">Buy now →</a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                style={{
                  background: '#C9B7A3', color: '#fff', border: 'none', padding: '13px 26px', borderRadius: 4,
                  fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'not-allowed',
                }}
              >
                Checkout link coming soon
              </button>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, marginTop: 16 }}>
            Secure checkout via Gumroad / Smart Store. Pricing will be announced at launch.
          </p>
        </div>
      </section>

      <div className="pp-wrap" style={{ padding: '32px 24px 44px', textAlign: 'center', fontSize: 13, color: MUTED }}>
        <Link href="/kpatto" style={{ color: BRICK, textDecoration: 'none', fontWeight: 600 }}>Try the free K-PATTO app</Link>
        {' · '}
        <Link href="/blog" style={{ color: BRICK, textDecoration: 'none', fontWeight: 600 }}>Read the articles</Link>
      </div>
    </div>
  )
}
