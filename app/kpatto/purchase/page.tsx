import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SampleAudio, type AudioSample } from './SampleAudio'
import { BuyButton, LIST_PRICE, PRICE } from './BuyButton'

/** 무료 샘플(15패턴) — public/assets 에 파일을 두면 그대로 내려받아진다 */
const SAMPLE_PDF = '/assets/k_patto_sample.pdf'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

export const metadata: Metadata = {
  title: 'K-PATTO: 300 Essential Korean Patterns & Audio Guide',
  description:
    'The definitive guide for travelers and learners to speak natural Korean effortlessly — 300 TOPIK-aligned patterns, 900 audio examples, in Master (A4/tablet) and Pocket (mobile) PDF editions.',
  // 결제 링크·PDF 가 확정되기 전이라 검색에는 노출하지 않는다. 판매 시작 때 이 줄을 지운다.
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE}/kpatto/purchase` },
}

// 아틀라스랩 본 사이트와 같은 톤: 블랙 히어로 + 오프화이트 본문 + 얇은 라인 + 레드 포인트(--brand-red)
const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const KO = '"Pretendard Variable", Pretendard, "DM Sans", system-ui, sans-serif'
const INK = '#111111'
const MUTED = '#6B6B6B'
const RULE = '#E5E1DC'
const RED = 'var(--brand-red, #C8102E)'

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

const TIERS = [
  { name: 'Beginner', levels: [1, 2] },
  { name: 'Intermediate', levels: [3, 4] },
  { name: 'Advanced', levels: [5, 6] },
]

export default function KPattoPurchasePage() {
  return (
    <div className="pp-root" style={{ background: '#F9F8F6', color: INK, fontFamily: BODY, minHeight: '100vh' }}>
      <style>{`
        .pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; }
        .pp-wrap { max-width: 1060px; margin: 0 auto; padding: 0 40px; }
        .pp-kicker { font-family: ${BODY}; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.5); margin: 0 0 22px; display: flex; align-items: center; gap: 10px; }
        .pp-kicker::before { content: ''; width: 24px; height: 1px; background: rgba(255,255,255,.3); }
        /* 본 사이트의 섹션 머리: 검은 윗선 + 작은 대문자 라벨 */
        .pp-sec-head { border-top: 1px solid ${INK}; padding-top: 14px; margin-bottom: 34px; }
        .pp-label { font-family: ${BODY}; font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${MUTED}; margin: 0; }
        .pp-h2 { font-family: ${SERIF}; font-size: 30px; line-height: 1.2; letter-spacing: -.015em; color: ${INK}; margin: 0 0 12px; font-weight: 700; }
        .pp-lead { font-size: 15.5px; line-height: 1.75; color: ${MUTED}; margin: 0; max-width: 620px; }
        .pp-section { padding: 64px 0; }
        .pp-btn { display: inline-block; font-family: ${BODY}; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; background: ${RED}; color: #fff; padding: 12px 28px; text-decoration: none; transition: background .15s; }
        .pp-btn:hover { background: var(--brand-red-dark, #A30D25); }
        /* 단일 구매 버튼 — 히어로·결제 섹션 공통, 크고 꽉 찬 레드 */
        .pp-buy { border: none; cursor: pointer; font-family: inherit; text-transform: none; font-size: 16px; letter-spacing: .01em; padding: 17px 34px; }
        @media (max-width: 520px) { .pp-buy { display: block; width: 100%; text-align: center; padding: 16px 20px; } }
        /* 가격 앵커: 정상가는 작게·흐리게·취소선, 판매가는 크게·레드 */
        .pp-price { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin: 0 0 24px; }
        .pp-price-list { font-size: 18px; color: rgba(255,255,255,.42); text-decoration: line-through; text-decoration-thickness: 1.5px; }
        .pp-price-now { font-family: ${SERIF}; font-size: 48px; font-weight: 700; line-height: 1; letter-spacing: -.02em; color: ${RED}; }
        .pp-price-note { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.55); }
        /* 무료 샘플 — 구매 버튼 아래의 아웃라인 서브 버튼 */
        .pp-sample { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 12px 22px; font-size: 14px; font-weight: 600; color: #fff; text-decoration: none; border: 1px solid rgba(255,255,255,.4); transition: border-color .15s, background .15s; }
        .pp-sample:hover { border-color: #fff; background: rgba(255,255,255,.06); }
        @media (max-width: 520px) { .pp-sample { display: flex; justify-content: center; } }
        /* 얇은 선으로 칸을 나누는 그리드 — 홈의 제품 카드와 같은 문법 */
        .pp-cells { display: grid; gap: 1px; background: ${RULE}; border: 1px solid ${RULE}; }
        .pp-cells-3 { grid-template-columns: repeat(3, 1fr); }
        .pp-cell { background: #fff; padding: 28px 24px; }
        .pp-cell-no { font-family: ${BODY}; font-size: 11px; font-weight: 700; letter-spacing: .12em; color: ${RED}; margin: 0 0 14px; }
        .pp-cell h3 { font-family: ${SERIF}; font-size: 20px; line-height: 1.3; color: ${INK}; margin: 0 0 10px; font-weight: 700; }
        .pp-cell p, .pp-cell li { font-size: 14.5px; line-height: 1.7; color: ${MUTED}; margin: 0; }
        /* TOPIK 프로그레스: 트랙 + 1~3급까지 채워진 은은한 레드 + 같은 폭의 옅은 배경 */
        .pp-track { position: relative; height: 8px; background: ${RULE}; margin-bottom: 14px; }
        .pp-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 50%; background: linear-gradient(90deg, rgba(200,16,46,.16), rgba(200,16,46,.55)); }
        .pp-end { position: absolute; left: 50%; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: ${RED}; box-shadow: 0 0 0 4px #F9F8F6; }
        .pp-levels { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); border: 1px solid ${RULE}; background: #fff; }
        .pp-covered { position: absolute; left: 0; top: 0; bottom: 0; width: 50%; background: rgba(200,16,46,.06); pointer-events: none; }
        .pp-level { position: relative; padding: 16px 8px 14px; text-align: center; border-left: 1px solid ${RULE}; }
        .pp-covered + .pp-level { border-left: none; }
        .pp-body-text { font-size: 17px; line-height: 1.8; color: #333; margin: 0; }
        .pp-preview { display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: start; }
        .pp-tablet { aspect-ratio: 3 / 4; background: #fff; border: 1px solid ${RULE}; padding: 20px; display: flex; flex-direction: column; }
        .pp-phone { width: 200px; aspect-ratio: 9 / 19; background: #fff; border: 1px solid ${INK}; border-radius: 22px; padding: 18px 14px; display: flex; flex-direction: column; overflow: hidden; }
        @media (max-width: 820px) {
          .pp-wrap { padding: 0 20px; }
          .pp-cells-3 { grid-template-columns: 1fr; }
          .pp-preview { grid-template-columns: 1fr; }
          .pp-h2 { font-size: 26px; }
          .pp-section { padding: 48px 0; }
          .pp-body-text { font-size: 16px; }
        }
      `}</style>

      <SiteNav />

      {/* ── Hero (블랙, 본 사이트 히어로와 같은 구조) ── */}
      <section style={{ background: '#121212' }}>
        <div className="pp-wrap" style={{ paddingTop: 88, paddingBottom: 92 }}>
          <p className="pp-kicker" translate="no">K-PATTO E-Book Package</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, lineHeight: 1.14, letterSpacing: '-.02em', color: '#fff', margin: '0 0 18px', maxWidth: 760 }}>
            K-PATTO: 300 Essential Korean Patterns &amp; Audio Guide
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,.66)', margin: '0 0 36px', maxWidth: 560 }}>
            The definitive guide for travelers and learners to speak natural Korean effortlessly.
          </p>
          <BuyButton />
        </div>
      </section>

      {/* ── Learning outcome ── */}
      <section className="pp-section">
        <div className="pp-wrap">
          <div className="pp-sec-head"><p className="pp-label">Learning outcome</p></div>
          <div style={{ maxWidth: 720 }}>
            <h2 className="pp-h2">Mastering TOPIK-aligned grammar patterns by grade level</h2>
            <p className="pp-lead" style={{ marginBottom: 24 }}>
              This curriculum covers essential grammar expressions structured by proficiency tiers.
            </p>
            <p className="pp-body-text">
              By mastering all 300 curated patterns and 900 professional audio examples provided in our app and e-book package,
              learners gain the practical fluency equivalent to <strong style={{ color: INK }}>TOPIK Level 3</strong> — independent
              user proficiency for daily life, travel, and social interactions in Korea.
            </p>
          </div>

          <div style={{ marginTop: 48 }} role="img" aria-label="TOPIK levels 1 to 6. This package covers Levels 1 to 3, up to TOPIK Level 3.">
            {/* 연속된 프로그레스 바: 1~3급 구간이 하나로 채워진다 */}
            <div className="pp-track">
              <div className="pp-fill" />
              <span className="pp-end" />
            </div>
            <div className="pp-levels">
              <div className="pp-covered" />
              {TIERS.flatMap(t => t.levels).map(level => (
                <div key={level} className="pp-level">
                  <div style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: level <= 3 ? MUTED : '#B9B5AE' }}>Level</div>
                  <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, color: level <= 3 ? INK : '#B9B5AE' }}>{level}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 8 }} aria-hidden>
              {TIERS.map(t => (
                <div key={t.name} style={{ textAlign: 'center', fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED }}>{t.name}</div>
              ))}
            </div>
            <p style={{ width: '50%', margin: '14px 0 0', paddingTop: 8, borderTop: `2px solid ${RED}`, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: RED }}>
              Covered by this package — Level 1 to Level 3
            </p>
            <p style={{ fontSize: 12.5, color: MUTED, margin: '14px 0 0' }}>TOPIK = Test of Proficiency in Korean · Levels 1–6</p>
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="pp-section" style={{ paddingTop: 0 }}>
        <div className="pp-wrap">
          <div className="pp-sec-head"><p className="pp-label">What&apos;s included</p></div>
          <h2 className="pp-h2">Everything you need to speak, not just read</h2>
          <p className="pp-lead" style={{ marginBottom: 30 }}>
            Every pattern comes with three real-life example sentences — and you can hear each one.
          </p>
          <div className="pp-cells pp-cells-3">
            <div className="pp-cell">
              <p className="pp-cell-no">01</p>
              <h3>300 Curated Patterns</h3>
              <p>Essential sentence structures for dining, shopping, transportation, and daily situations in Korea.</p>
            </div>
            <div className="pp-cell">
              <p className="pp-cell-no">02</p>
              <h3>900 Pro Audio Examples</h3>
              <p>Crystal-clear audio files for every example sentence, recorded with a natural tone and comfortable pacing.</p>
            </div>
            <div className="pp-cell">
              <p className="pp-cell-no">03</p>
              <h3>Dual Formats Included</h3>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                <li><strong style={{ color: INK }}>1. Master Edition</strong> — A4/Tablet optimized, 2-column editorial grid for deep study and printing.</li>
                <li><strong style={{ color: INK }}>2. Pocket Edition</strong> — 1-pattern-per-page vertical layout designed specifically for effortless mobile reading.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Preview ── */}
      <section className="pp-section" style={{ paddingTop: 0 }}>
        <div className="pp-wrap">
          <div className="pp-sec-head"><p className="pp-label">Preview</p></div>
          <h2 className="pp-h2">See the layouts. Hear the audio.</h2>
          <p className="pp-lead" style={{ marginBottom: 34 }}>
            Layout previews show how a pattern page is set in each edition (illustrative — final PDF pages may differ slightly).
          </p>

          <div className="pp-preview" style={{ marginBottom: 56 }}>
            <figure style={{ margin: 0 }}>
              <div className="pp-tablet" aria-label="Master Edition layout preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${RULE}`, paddingBottom: 8, marginBottom: 14, fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED }}>
                  <span>K-PATTO · Master Edition</span><span>001–004</span>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: '14px 18px' }}>
                  {PATTERNS.map(p => (
                    <div key={p.no} style={{ borderTop: `1px solid ${INK}`, paddingTop: 8 }}>
                      <div style={{ fontSize: 9.5, color: RED, fontWeight: 700, letterSpacing: '.1em' }}>#{p.no}</div>
                      <div style={{ fontFamily: KO, fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, margin: '3px 0 2px', color: INK }}>{p.ko}</div>
                      <div style={{ fontSize: 'clamp(9px, 1.2vw, 12px)', color: MUTED, marginBottom: 8 }}>{p.en}</div>
                      <div style={{ borderLeft: `2px solid ${RULE}`, paddingLeft: 8 }}>
                        <div style={{ fontFamily: KO, fontSize: 'clamp(10px, 1.5vw, 14px)', fontWeight: 600 }}>{p.ex}</div>
                        <div style={{ fontSize: 'clamp(8px, 1.1vw, 11px)', color: MUTED }}>{p.exEn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <figcaption style={{ fontSize: 12.5, color: MUTED, marginTop: 12 }}>
                <strong style={{ color: INK }}>Master Edition</strong> · A4 / tablet · 2-column grid
              </figcaption>
            </figure>

            <figure style={{ margin: 0 }}>
              <div className="pp-phone" aria-label="Pocket Edition layout preview">
                <div style={{ fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: RED, fontWeight: 700 }}>Pattern #001</div>
                <div style={{ fontFamily: KO, fontSize: 28, fontWeight: 800, margin: '10px 0 2px', color: INK }}>~주세요</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>Give me ~, please.</div>
                {[['물 주세요.', 'Water, please.'], ['메뉴판 주세요.', 'Please give me the menu.'], ['영수증 주세요.', 'Please give me the receipt.']].map(([ko, en]) => (
                  <div key={ko} style={{ borderLeft: `2px solid ${RULE}`, padding: '2px 0 2px 9px', marginBottom: 10 }}>
                    <div style={{ fontFamily: KO, fontSize: 13, fontWeight: 700 }}>{ko}</div>
                    <div style={{ fontSize: 9.5, color: MUTED }}>{en}</div>
                  </div>
                ))}
                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 9, color: MUTED }}>1 / 300</div>
              </div>
              <figcaption style={{ fontSize: 12.5, color: MUTED, marginTop: 12 }}>
                <strong style={{ color: INK }}>Pocket Edition</strong> · mobile · 1 pattern per page
              </figcaption>
            </figure>
          </div>

          <div style={{ maxWidth: 640 }}>
            <p className="pp-label" style={{ marginBottom: 6 }}>Sample audio</p>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, margin: '0 0 6px', color: INK, fontWeight: 700 }}>Tap to listen</h3>
            <p style={{ fontSize: 14.5, color: MUTED, margin: '0 0 16px' }}>These are real audio files from the package.</p>
            <SampleAudio samples={SAMPLES} />
          </div>
        </div>
      </section>

      {/* ── Pricing & download — 푸터와 섞이지 않도록 오프화이트 바탕 위의 독립 패널 ── */}
      <section id="checkout" style={{ padding: '8px 0 96px' }}>
        <div className="pp-wrap">
          <div style={{ background: '#121212', padding: 'clamp(36px, 6vw, 60px) clamp(24px, 6vw, 56px)', borderTop: `3px solid ${RED}` }}>
            <div style={{ maxWidth: 680 }}>
              <p className="pp-kicker">Pricing &amp; Download</p>
              <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.015em', color: '#fff', margin: '0 0 14px' }}>
                Get the Premium PDF Package
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,.7)', margin: '0 0 28px' }}>
                Includes 300 patterns, 900 audio examples, and dual editions. One-time payment, lifetime access.
              </p>
              <p className="pp-price">
                <span className="pp-price-list"><span className="sr-only">Regular price </span>{LIST_PRICE}</span>
                <span className="pp-price-now"><span className="sr-only">Now </span>{PRICE}</span>
                <span className="pp-price-note">Launch price</span>
              </p>
              <BuyButton />
              <div>
                <a href={SAMPLE_PDF} download className="pp-sample">
                  <span aria-hidden>↓</span> Download Free Sample (15 Patterns)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
