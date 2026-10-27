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
 * /kpatto — K-PATTO 판매 랜딩. 체험 · 무료 샘플 · 구매를 한 화면에서 끝낸다.
 * 앱 홈은 /kpatto/home 이다(하단 탭바의 Home). 이 페이지에는 탭바가 없다(KPattoTabBar 가 숨긴다).
 *
 * 문구는 실제 제품과 맞춘 것만 쓴다:
 *  - PDF 153쪽(최종본 실측), 무료 샘플은 패턴 10개(public/assets/K_Patto_Free_Sample_10.pdf)
 *  - 오디오 배속(0.8x)·오프라인 설치는 앱에 없어서 쓰지 않는다
 */

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const INK = '#111111'
const MUTED = '#6B6B6B'
const RULE = '#E5E1DC'
const RED = 'var(--brand-red, #C8102E)'

const SAMPLES: AudioSample[] = [
  { slug: 'juseyo', n: 1, ko: '물 주세요.', en: 'Water, please.' },
  { slug: 'mwoyeyo', n: 3, ko: '이 음식 뭐예요?', en: 'What is this food?' },
  { slug: 'eotteoke-gayo', n: 1, ko: '홍대 어떻게 가요?', en: 'How do I get to Hongdae?' },
  { slug: 'meokgo-sipeoyo', n: 2, ko: '떡볶이 먹고 싶어요.', en: 'I want to eat tteokbokki.' },
]

const VALUES = [
  { no: '01', title: '100-episode webtoon', desc: '300+ everyday patterns and situations, told as one story set in Seoul.' },
  { no: '02', title: 'Native audio on every line', desc: 'Hear each sentence spoken by a native voice before you say it yourself.' },
  { no: '03', title: 'Quizzes & streak tracker', desc: 'Short reviews after each episode and a streak that keeps you coming back.' },
  { no: '04', title: `${EBOOK_PAGES}-page printable PDF`, desc: 'Every pattern with grammar notes and examples — for paper, tablet, or iPad.' },
]

const hasCheckout = PRODUCTS.some(p => p.checkoutUrl)

export default function KPattoLandingPage() {
  return (
    <div className="lp" style={{ background: '#F9F8F6', color: INK, fontFamily: BODY, minHeight: '100vh' }}>
      {hasCheckout && <Script src="https://gumroad.com/js/gumroad.js" strategy="lazyOnload" />}
      <style>{`
        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        #${PRICING_ANCHOR} { scroll-margin-top: 72px; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        .lp-wrap { max-width: 1060px; margin: 0 auto; padding: 0 40px; }
        .lp-kicker { font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.5); margin: 0 0 22px; display: flex; align-items: center; gap: 10px; }
        .lp-kicker::before { content: ''; width: 24px; height: 1px; background: rgba(255,255,255,.3); }
        .lp-section { padding: 64px 0; }
        .lp-head { border-top: 1px solid ${INK}; padding-top: 14px; margin-bottom: 30px; }
        .lp-label { font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${MUTED}; margin: 0; }
        .lp-h2 { font-family: ${SERIF}; font-size: 30px; line-height: 1.2; letter-spacing: -.015em; margin: 0 0 12px; font-weight: 700; }
        .lp-lead { font-size: 15.5px; line-height: 1.75; color: ${MUTED}; margin: 0 0 30px; max-width: 620px; }

        /* 버튼 — 높이 52px, 히어로 두 개는 나란히(모바일은 세로로 화면 폭) */
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
        .lp-btn-ghost-dark { background: transparent; border-color: rgba(255,255,255,.4); color: #fff; }
        .lp-btn-ghost-dark:hover { border-color: #fff; background: rgba(255,255,255,.06); }
        .lp-actions { display: flex; flex-wrap: wrap; gap: 12px; }

        /* 핵심 가치 4칸 — 얇은 선으로 나눈 격자(홈 카드와 같은 문법) */
        .lp-values { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: ${RULE}; border: 1px solid ${RULE}; }
        .lp-value { background: #fff; padding: 26px 22px; }
        .lp-value-no { font-size: 11px; font-weight: 700; letter-spacing: .12em; color: ${RED}; margin: 0 0 12px; }
        .lp-value h3 { font-family: ${SERIF}; font-size: 18px; line-height: 1.3; margin: 0 0 8px; font-weight: 700; }
        .lp-value p { font-size: 14px; line-height: 1.65; color: ${MUTED}; margin: 0; }

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
          .lp-values { grid-template-columns: repeat(2, 1fr); }
          .lp-plans { grid-template-columns: 1fr; gap: 28px; max-width: 520px; }
        }
        @media (max-width: 640px) {
          .lp-wrap { padding: 0 20px; }
          .lp-section { padding: 48px 0; }
          .lp-h2 { font-size: 26px; }
          .lp-actions { flex-direction: column; }
          .lp-btn { width: 100%; min-width: 0; }
          .lp-values { grid-template-columns: 1fr; }
          .lp-trust { grid-template-columns: 1fr; }
        }
      `}</style>

      <SiteNav />

      {/* ── Hero ── */}
      <section style={{ background: '#121212' }}>
        <div className="lp-wrap" style={{ paddingTop: 'clamp(48px, 8vw, 88px)', paddingBottom: 'clamp(52px, 8vw, 92px)' }}>
          <p className="lp-kicker" translate="no">K-PATTO</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 4.4vw, 50px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-.02em', color: '#fff', margin: '0 0 18px', maxWidth: 760 }}>
            Master 300+ Everyday Korean Patterns
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,.68)', margin: '0 0 34px', maxWidth: 600 }}>
            Learn natural, real-life Korean through 100 webtoon episodes with native audio on every line, review quizzes, and a printable guide.
          </p>
          <div className="lp-actions">
            <a href={TRY_APP_PATH} className="lp-btn lp-btn-primary">Try the Web App Free</a>
            <a href={SAMPLE_PDF_URL} download className="lp-btn lp-btn-ghost-dark">Get Free {SAMPLE_PATTERNS}-Pattern Sample (PDF)</a>
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.45)', margin: '14px 0 0' }}>
            Episodes 1–{FREE_EPISODES} are free · Sample PDF needs no sign-up ·{' '}
            <a href={`#${PRICING_ANCHOR}`} style={{ color: 'rgba(255,255,255,.75)', textUnderlineOffset: 3 }}>See pricing</a>
          </p>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">What you get</p></div>
          <h2 className="lp-h2">Read it, hear it, then say it</h2>
          <p className="lp-lead">Every pattern shows up in a real scene from the story, with three example sentences and audio you can replay.</p>
          <div className="lp-values">
            {VALUES.map(v => (
              <div key={v.no} className="lp-value">
                <p className="lp-value-no">{v.no}</p>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: 640, marginTop: 48 }}>
            <p className="lp-label" style={{ marginBottom: 6 }}>Sample audio</p>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Tap to listen</h3>
            <p style={{ fontSize: 14.5, color: MUTED, margin: '0 0 16px' }}>Real audio from the app and the eBook.</p>
            <SampleAudio samples={SAMPLES} />
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
