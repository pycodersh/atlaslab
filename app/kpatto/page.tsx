import type { Metadata } from 'next'
import Script from 'next/script'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import {
  EBOOK_PAGES, PRICING_ANCHOR, PRODUCTS, SAMPLE_PATTERNS, SAMPLE_PDF_URL, TRY_APP_PATH,
} from '@/lib/kpatto/purchase'
import { BuyButton } from './_landing/BuyButton'
import { SampleAudio, type AudioSample } from './_landing/SampleAudio'

const CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'}/kpatto`

export const metadata: Metadata = {
  title: 'K-PATTO — Master 300+ Everyday Korean Patterns',
  description:
    'Learn natural, real-life Korean through 100 webtoon episodes with native audio, review quizzes, and a printable eBook. Try the first episodes free.',
  alternates: { canonical: CANONICAL },
  openGraph:  { url: CANONICAL },
  // TEMP(AdSense review): 심사 기간에만 색인 제외 — 승인 후 이 줄을 지우고
  // app/sitemap.ts 의 INDEX_KPATTO_LANDING 을 true 로 되돌린다. robots.txt 는 /kpatto 를 막지 않는다.
  robots: { index: false, follow: true },
}

/**
 * /kpatto — K-PATTO 판매 랜딩.
 * 순서: 짧은 히어로 → TOPIK 단계 → 실제 웹툰 화면 → 실제 PDF 페이지 → 무료 체험·무료 샘플 → 가격 3종 → 보장.
 * 버튼은 히어로에 몰지 않고, 무엇을 받는지 보여 준 뒤 그 자리에 둔다.
 *
 * 이미지는 전부 실물이다(public/kpatto/landing):
 *  - webtoon-ep01-a/b.webp  실제 앱 EP01 화면 캡처(390px, 2x)
 *  - pdf-cover/p005/p041.webp  K_Patto_Final_Edition.pdf 실제 페이지 렌더
 * 문구는 실물과 맞춘다: PDF 153쪽 · 120×270mm(휴대폰·태블릿·인쇄), 무료 샘플은 7쪽·패턴 10개,
 * 오디오 배속·오프라인 설치·필기 칸은 없어서 쓰지 않는다.
 */

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const INK = '#111111'
const MUTED = '#6B6B6B'
const RULE = '#E5E1DC'
const RED = 'var(--brand-red, #C8102E)'
const IMG = '/kpatto/landing'

const SAMPLE_PAGES = 7

const SAMPLES: AudioSample[] = [
  { slug: 'juseyo', n: 1, ko: '물 주세요.', en: 'Water, please.' },
  { slug: 'mwoyeyo', n: 3, ko: '이 음식 뭐예요?', en: 'What is this food?' },
  { slug: 'eotteoke-gayo', n: 1, ko: '홍대 어떻게 가요?', en: 'How do I get to Hongdae?' },
  { slug: 'meokgo-sipeoyo', n: 2, ko: '떡볶이 먹고 싶어요.', en: 'I want to eat tteokbokki.' },
]

const TIERS = [
  { name: 'Beginner', levels: [1, 2] },
  { name: 'Intermediate', levels: [3, 4] },
  { name: 'Advanced', levels: [5, 6] },
]

const hasCheckout = PRODUCTS.some(p => p.checkoutUrl)

export default function KPattoLandingPage() {
  return (
    <div className="lp" style={{ background: '#F9F8F6', color: INK, fontFamily: BODY, minHeight: '100vh' }}>
      {hasCheckout && <Script src="https://gumroad.com/js/gumroad.js" strategy="lazyOnload" />}
      <style>{`
        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        #${PRICING_ANCHOR}, #inside { scroll-margin-top: 72px; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        .lp-wrap { max-width: 1060px; margin: 0 auto; padding: 0 40px; }
        .lp-kicker { font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.5); margin: 0 0 22px; display: flex; align-items: center; gap: 10px; }
        .lp-kicker::before { content: ''; width: 24px; height: 1px; background: rgba(255,255,255,.3); }
        .lp-section { padding: 64px 0; }
        .lp-head { border-top: 1px solid ${INK}; padding-top: 14px; margin-bottom: 30px; }
        .lp-label { font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${MUTED}; margin: 0; }
        .lp-h2 { font-family: ${SERIF}; font-size: 30px; line-height: 1.2; letter-spacing: -.015em; margin: 0 0 12px; font-weight: 700; }
        .lp-lead { font-size: 15.5px; line-height: 1.75; color: ${MUTED}; margin: 0 0 30px; max-width: 640px; }
        .lp-body-text { font-size: 17px; line-height: 1.8; color: #333; margin: 0; }

        /* 버튼 — 높이 52px */
        .lp-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 52px; padding: 0 24px; min-width: 240px; border-radius: 6px;
          font-family: ${BODY}; font-size: 15px; font-weight: 600; line-height: 1; text-align: center;
          text-decoration: none; white-space: nowrap; cursor: pointer; border: 1px solid transparent;
          transition: background .15s, border-color .15s, color .15s;
        }
        .lp-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
        .lp-btn-primary { background: ${RED}; border-color: ${RED}; color: #fff; }
        .lp-btn-primary:hover { background: var(--brand-red-dark, #A30D25); border-color: var(--brand-red-dark, #A30D25); }
        .lp-btn-outline { background: transparent; border-color: ${INK}; color: ${INK}; }
        .lp-btn-outline:hover { background: ${INK}; color: #fff; }
        .lp-scroll { display: inline-flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; font-size: 14.5px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,.35); padding-bottom: 4px; }
        .lp-scroll:hover { border-color: #fff; }

        /* TOPIK 프로그레스: 트랙 + 1~3급까지 채워진 은은한 레드 + 같은 폭의 옅은 배경 */
        .lp-track { position: relative; height: 8px; background: ${RULE}; margin-bottom: 14px; }
        .lp-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 50%; background: linear-gradient(90deg, rgba(200,16,46,.16), rgba(200,16,46,.55)); }
        .lp-end { position: absolute; left: 50%; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: ${RED}; box-shadow: 0 0 0 4px #F9F8F6; }
        .lp-levels { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); border: 1px solid ${RULE}; background: #fff; }
        .lp-covered { position: absolute; left: 0; top: 0; bottom: 0; width: 50%; background: rgba(200,16,46,.06); pointer-events: none; }
        .lp-level { position: relative; padding: 16px 8px 14px; text-align: center; border-left: 1px solid ${RULE}; }
        .lp-covered + .lp-level { border-left: none; }

        /* 실물 쇼케이스 — 왼쪽 글, 오른쪽 이미지 */
        .lp-show { display: grid; grid-template-columns: 1fr 1.25fr; gap: 48px; align-items: center; }
        .lp-show-text h3 { font-family: ${SERIF}; font-size: 26px; line-height: 1.25; letter-spacing: -.01em; margin: 0 0 12px; font-weight: 700; }
        .lp-show-text p { font-size: 15.5px; line-height: 1.75; color: ${MUTED}; margin: 0 0 18px; }
        .lp-points { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .lp-points li { position: relative; padding-left: 22px; font-size: 14.5px; line-height: 1.55; color: #333; }
        .lp-points li::before { content: ''; position: absolute; left: 2px; top: 6px; width: 10px; height: 6px; border-left: 2px solid ${RED}; border-bottom: 2px solid ${RED}; transform: rotate(-45deg); }
        /* 휴대폰 프레임 두 장 — 실제 앱 캡처 */
        .lp-phones { display: flex; justify-content: center; gap: 18px; }
        .lp-phone { width: 46%; max-width: 290px; border-radius: 28px; padding: 8px; background: #121212; box-shadow: 0 20px 50px rgba(0,0,0,.18); }
        .lp-phone img { display: block; width: 100%; height: auto; border-radius: 21px; }
        .lp-phone:nth-child(2) { margin-top: 48px; }
        /* PDF 실제 페이지 세 장 — 펼쳐 놓은 모양 */
        .lp-pages { position: relative; display: flex; justify-content: center; align-items: flex-end; padding: 12px 0 0; }
        .lp-page { width: 34%; max-width: 220px; background: #fff; box-shadow: 0 14px 34px rgba(0,0,0,.14); border: 1px solid ${RULE}; }
        .lp-page img { display: block; width: 100%; height: auto; }
        .lp-page:nth-child(1) { transform: rotate(-5deg) translate(18px, 10px); z-index: 1; }
        .lp-page:nth-child(2) { z-index: 3; width: 38%; max-width: 250px; }
        .lp-page:nth-child(3) { transform: rotate(5deg) translate(-18px, 10px); z-index: 2; }
        .lp-caption { font-size: 12.5px; color: ${MUTED}; text-align: center; margin: 20px 0 0; }

        /* 무료 체험 · 무료 샘플 — 두 블록 */
        .lp-free { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .lp-free-card { background: #fff; border: 1px solid ${RULE}; padding: 28px 26px; display: flex; flex-direction: column; }
        .lp-free-card .lp-label { margin-bottom: 10px; color: ${RED}; }
        .lp-free-card h3 { font-family: ${SERIF}; font-size: 22px; line-height: 1.25; margin: 0 0 10px; font-weight: 700; }
        .lp-free-card p { font-size: 14.5px; line-height: 1.7; color: #4A4540; margin: 0 0 22px; flex: 1; }
        .lp-free-card .lp-btn { width: 100%; min-width: 0; }

        /* 가격 3단 — 번들은 레드 테두리 + BEST VALUE 뱃지 */
        .lp-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch; }
        .lp-plan { position: relative; display: flex; flex-direction: column; background: #fff; border: 1px solid ${RULE}; padding: 30px 24px 26px; }
        .lp-plan--featured { border: 2px solid ${RED}; box-shadow: 0 10px 30px rgba(200,16,46,.10); }
        .lp-badge { position: absolute; top: -12px; left: 24px; background: ${RED}; color: #fff; font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 5px 10px; border-radius: 4px; }
        .lp-plan-ed { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${MUTED}; margin: 0 0 6px; }
        .lp-plan h3 { font-family: ${SERIF}; font-size: 21px; line-height: 1.25; margin: 0 0 16px; font-weight: 700; }
        .lp-price { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin: 0 0 4px; }
        .lp-price-now { font-family: ${SERIF}; font-size: 40px; font-weight: 700; line-height: 1; letter-spacing: -.02em; }
        .lp-plan--featured .lp-price-now { color: ${RED}; }
        .lp-price-was { font-size: 15px; color: #A8A39C; text-decoration: line-through; }
        .lp-price-save { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${RED}; }
        .lp-once { font-size: 12.5px; color: ${MUTED}; margin: 0 0 18px; }
        .lp-for { font-size: 13.5px; color: ${INK}; font-weight: 600; margin: 0 0 14px; padding-top: 14px; border-top: 1px solid ${RULE}; }
        .lp-list { list-style: none; margin: 0 0 24px; padding: 0; display: grid; gap: 9px; flex: 1; }
        .lp-list li { position: relative; padding-left: 22px; font-size: 14px; line-height: 1.5; color: #444; }
        .lp-list li::before { content: ''; position: absolute; left: 2px; top: 6px; width: 10px; height: 6px; border-left: 2px solid ${RED}; border-bottom: 2px solid ${RED}; transform: rotate(-45deg); }
        /* gumroad.js 가 .gumroad-button 에 자체 스타일을 입혀도 카드 디자인을 지킨다 */
        .lp .lp-plan .lp-buy { width: 100%; min-width: 0; height: 50px; border-radius: 6px; font-size: 14.5px; font-weight: 600; box-shadow: none; background-image: none; }
        .lp .lp-plan .lp-buy:not(.lp-btn-primary) { background: transparent; border: 1px solid ${INK}; color: ${INK}; }
        .lp .lp-plan .lp-buy:not(.lp-btn-primary):hover { background: ${INK}; color: #fff; }

        /* 보장 2칸 */
        .lp-trust { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .lp-trust-item { background: #fff; border: 1px solid ${RULE}; padding: 24px; }
        .lp-trust-item h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
        .lp-trust-item p { font-size: 14px; line-height: 1.7; color: #4A4540; margin: 0; }

        @media (max-width: 900px) {
          .lp-show { grid-template-columns: 1fr; gap: 32px; }
          .lp-plans { grid-template-columns: 1fr; gap: 28px; max-width: 520px; }
        }
        @media (max-width: 640px) {
          .lp-wrap { padding: 0 20px; }
          .lp-section { padding: 48px 0; }
          .lp-h2 { font-size: 26px; }
          .lp-body-text { font-size: 16px; }
          .lp-btn { width: 100%; min-width: 0; }
          .lp-free { grid-template-columns: 1fr; }
          .lp-trust { grid-template-columns: 1fr; }
          .lp-phone { border-radius: 22px; padding: 6px; }
          .lp-phone img { border-radius: 17px; }
          .lp-phone:nth-child(2) { margin-top: 32px; }
          .lp-level { padding: 12px 4px 10px; }
        }
      `}</style>

      <SiteNav />

      {/* ── Hero — 짧게, 아래로 안내만 ── */}
      <section style={{ background: '#121212' }}>
        <div className="lp-wrap" style={{ paddingTop: 'clamp(48px, 8vw, 88px)', paddingBottom: 'clamp(52px, 8vw, 88px)' }}>
          <p className="lp-kicker" translate="no">K-PATTO</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 4.4vw, 50px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-.02em', color: '#fff', margin: '0 0 18px', maxWidth: 760 }}>
            Master 300+ Everyday Korean Patterns
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,.68)', margin: '0 0 30px', maxWidth: 600 }}>
            Learn natural, real-life Korean through 100 webtoon episodes with native audio on every line, review quizzes, and a printable guide.
          </p>
          <a href="#inside" className="lp-scroll">See what&rsquo;s inside <span aria-hidden>↓</span></a>
        </div>
      </section>

      {/* ── Learning outcome — TOPIK 단계 ── */}
      <section id="inside" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">Learning outcome</p></div>
          <div style={{ maxWidth: 720 }}>
            <h2 className="lp-h2">Mastering TOPIK-aligned grammar patterns by grade level</h2>
            <p className="lp-lead" style={{ marginBottom: 24 }}>
              This curriculum covers essential grammar expressions structured by proficiency tiers.
            </p>
            <p className="lp-body-text">
              By mastering all 300 curated patterns and 900 native audio examples in the app and the eBook, learners gain practical
              fluency equivalent to <strong style={{ color: INK }}>TOPIK Level 3</strong> — independent proficiency for daily life,
              travel, and social interactions in Korea.
            </p>
          </div>

          <div style={{ marginTop: 44 }} role="img" aria-label="TOPIK levels 1 to 6. K-PATTO covers Levels 1 to 3.">
            <div className="lp-track">
              <div className="lp-fill" />
              <span className="lp-end" />
            </div>
            <div className="lp-levels">
              <div className="lp-covered" />
              {TIERS.flatMap(t => t.levels).map(level => (
                <div key={level} className="lp-level">
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
              Covered by K-PATTO — Level 1 to Level 3
            </p>
            <p style={{ fontSize: 12.5, color: MUTED, margin: '14px 0 0' }}>TOPIK = Test of Proficiency in Korean · Levels 1–6</p>
          </div>
        </div>
      </section>

      {/* ── Webtoon showcase — 실제 앱 화면 ── */}
      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">The webtoon</p></div>
          <div className="lp-show">
            <div className="lp-show-text">
              <h3>How real Koreans actually talk in everyday situations.</h3>
              <p>
                Follow one story through cafés, subways, and markets in Seoul. Every line is a sentence Koreans really use —
                with the English right underneath and the pattern you&rsquo;re learning highlighted in the bubble.
              </p>
              <ul className="lp-points">
                <li>100 full-color episodes, 300+ patterns</li>
                <li>Native audio on every line — tap and listen</li>
                <li>Switch Korean / English on and off as you improve</li>
                <li>Review quizzes and a streak to keep you going</li>
              </ul>
            </div>
            <figure style={{ margin: 0 }}>
              <div className="lp-phones">
                <div className="lp-phone">
                  <img src={`${IMG}/webtoon-ep01-a.webp`} alt="K-PATTO app, Episode 1 'At the Café': a speech bubble in Korean with the English translation, under the KO, EN and audio buttons" width={780} height={1520} loading="lazy" />
                </div>
                <div className="lp-phone">
                  <img src={`${IMG}/webtoon-ep01-b.webp`} alt="K-PATTO app: the pattern 뭐예요? highlighted inside a speech bubble, 'Excuse me, what is this?'" width={780} height={1520} loading="lazy" />
                </div>
              </div>
              <figcaption className="lp-caption">Real screens from Episode 1 of the app.</figcaption>
            </figure>
          </div>

          <div style={{ maxWidth: 640, marginTop: 52 }}>
            <p className="lp-label" style={{ marginBottom: 6 }}>Sample audio</p>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Tap to listen</h3>
            <p style={{ fontSize: 14.5, color: MUTED, margin: '0 0 16px' }}>Real audio from the app and the eBook.</p>
            <SampleAudio samples={SAMPLES} />
          </div>
        </div>
      </section>

      {/* ── eBook preview — 실제 PDF 페이지 ── */}
      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">The eBook</p></div>
          <div className="lp-show">
            <div className="lp-show-text">
              <h3>Clean, printable layout with 300 essential patterns.</h3>
              <p>
                {EBOOK_PAGES} pages, two patterns per page. Read it on your phone or tablet, or print it out.
              </p>
              <ul className="lp-points">
                <li>The pattern and its meaning at a glance</li>
                <li>Rules &amp; usage in plain English</li>
                <li>Three real example sentences, each with audio</li>
                <li>A pro tip on how Koreans actually say it</li>
              </ul>
            </div>
            <figure style={{ margin: 0 }}>
              <div className="lp-pages">
                <div className="lp-page"><img src={`${IMG}/pdf-cover.webp`} alt="K-PATTO eBook cover: 300 Korean Patterns" width={615} height={1382} loading="lazy" /></div>
                <div className="lp-page"><img src={`${IMG}/pdf-p005.webp`} alt="eBook page with patterns ~있어요? and ~이에요/예요: rules, three examples, and a pro tip" width={615} height={1382} loading="lazy" /></div>
                <div className="lp-page"><img src={`${IMG}/pdf-p041.webp`} alt="eBook page with patterns ~았/었- and ~것 같아요: rules, three examples, and a pro tip" width={615} height={1382} loading="lazy" /></div>
              </div>
              <figcaption className="lp-caption">Actual pages from the {EBOOK_PAGES}-page eBook.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Try it free — 무료 체험 · 무료 샘플 ── */}
      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">Try it free</p></div>
          <div className="lp-free">
            <div className="lp-free-card">
              <p className="lp-label">Web app demo</p>
              <h3>Read the first {FREE_EPISODES} episodes free</h3>
              <p>Experience the first {FREE_EPISODES} episodes directly in your browser with synchronized native audio. No sign-up required.</p>
              {/* 새 탭 — 랜딩을 떠나지 않게 */}
              <a href={TRY_APP_PATH} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-primary">
                🚀 Launch Free Demo ({FREE_EPISODES} Episodes) →
              </a>
            </div>
            <div className="lp-free-card">
              <p className="lp-label">eBook sample</p>
              <h3>Download {SAMPLE_PATTERNS} patterns as a PDF</h3>
              <p>Download a {SAMPLE_PAGES}-page printable PDF containing the top {SAMPLE_PATTERNS} core patterns and grammar points.</p>
              <a href={SAMPLE_PDF_URL} download className="lp-btn lp-btn-outline">📥 Download Free Sample PDF</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id={PRICING_ANCHOR} className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">Pricing</p></div>
          <h2 className="lp-h2">Pick how you want to learn</h2>
          <p className="lp-lead">
            One-time payment, lifetime access. No subscription. The WebApp Pass and Bundle come with a license key by email —{' '}
            <a href="/kpatto/redeem" style={{ color: INK, fontWeight: 600, textUnderlineOffset: 3 }}>already bought? Unlock the app here</a>.
          </p>
          <div className="lp-plans">
            {PRODUCTS.map(p => (
              <div key={p.id} className={`lp-plan${p.featured ? ' lp-plan--featured' : ''}`}>
                {p.featured && <span className="lp-badge">Best value</span>}
                <p className="lp-plan-ed">{p.edition}</p>
                <h3>{p.name}</h3>
                <p className="lp-price notranslate" translate="no">
                  <span className="lp-price-now">{p.price}</span>
                  {p.regular && <span className="lp-price-was"><span className="sr-only">Regular price </span>{p.regular}</span>}
                  {p.saving && <span className="lp-price-save">{p.saving}</span>}
                </p>
                <p className="lp-once">One-time · Lifetime access</p>
                <p className="lp-for">For: {p.for}</p>
                <ul className="lp-list">
                  {p.highlights.map(h => <li key={h}>{h}</li>)}
                </ul>
                <BuyButton
                  href={p.checkoutUrl}
                  label={p.cta}
                  product={`${p.name} — ${p.edition}`}
                  price={p.price}
                  className={`lp-btn lp-buy${p.featured ? ' lp-btn-primary' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantees ── */}
      <section className="lp-section" style={{ paddingTop: 8, paddingBottom: 96 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">Buy with confidence</p></div>
          <div className="lp-trust">
            <div className="lp-trust-item">
              <h3><span aria-hidden>🔒</span> 14-Day Money-Back Guarantee</h3>
              <p>Not happy with it? Email us within 14 days of purchase for a 100% full refund.</p>
            </div>
            <div className="lp-trust-item">
              <h3><span aria-hidden>💡</span> Fair Upgrade Guarantee</h3>
              <p>Bought the $14.99 eBook first? Upgrade to the Complete Bundle anytime by paying just the $10 difference. You will never pay more than the bundle price.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
