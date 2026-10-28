import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'
const CANONICAL = `${SITE}/kpantry/landing`

export const metadata: Metadata = {
  title: 'K-Pantry — Cook Real Korean Food with What You Already Have',
  description:
    'Match the ingredients in your fridge to 100+ beginner-friendly Korean recipes, see what one or two extra ingredients unlock, and get calories and nutrition for every dish.',
  alternates: { canonical: CANONICAL },
  openGraph: { url: CANONICAL },
  // TEMP(AdSense review): /kpatto 랜딩과 같이 심사 기간에는 색인 제외 — 승인 후 이 줄을 지운다.
  robots: { index: false, follow: true },
}

/**
 * /kpantry/landing — K-Pantry 소개 랜딩. /kpatto 랜딩과 같은 글꼴 · 색 · 섹션 구조를 쓴다.
 * (/kpantry 는 next.config 의 영구 리다이렉트로 앱 /kpantry/en 에 묶여 있어 — 브라우저가 캐시한다 — 이 경로를 쓴다.)
 *
 * 이미지는 전부 실제 앱 화면이다(public/kpantry/landing, 390px 2x 캡처, 2026-10-28).
 * 문구는 실물과 맞춘다: 레시피 103개 · 재료 95개(pantry_recipes · pantry_ingredients),
 * 영양은 kcal · 단백질 · 탄수화물 · 지방, 재료는 Essential / Recommended / Optional 세 단계.
 * '+1 · +2 재료' 결과는 Pro 기능(lib/kpantry/subscription.ts 의 pantry_plus1/2)이라 Pro 로 표시한다.
 * 가격은 결제 연동을 확인하지 못해 적지 않는다.
 */

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const INK = '#111111'
const MUTED = '#6B6B6B'
const RULE = '#E5E1DC'
const RED = 'var(--brand-red, #C8102E)'
const IMG = '/kpantry/landing'
const APP = '/kpantry/en'

const RECIPES = '100+'
const INGREDIENTS = 95

function LaunchButton({ className = 'lp-btn lp-btn-primary', label = 'Launch WebApp ↗' }: { className?: string; label?: string }) {
  return (
    <a href={APP} target="_blank" rel="noopener noreferrer" className={className} aria-label="Launch the K-Pantry web app (opens in a new tab)">
      {label}
    </a>
  )
}

function Phones({ a, b, altA, altB }: { a: string; b: string; altA: string; altB: string }) {
  return (
    <div className="lp-phones">
      {/* 이미 780px webp 로 줄여 둔 캡처라 next/image 최적화 없이 그대로 쓴다(/kpatto 랜딩과 같음) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="lp-phone"><img src={`${IMG}/${a}.webp`} alt={altA} width={780} height={1520} loading="lazy" /></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="lp-phone"><img src={`${IMG}/${b}.webp`} alt={altB} width={780} height={1520} loading="lazy" /></div>
    </div>
  )
}

export default function KPantryLandingPage() {
  return (
    <div className="lp" style={{ background: '#F9F8F6', color: INK, fontFamily: BODY, minHeight: '100vh' }}>
      <style>{`
        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        .lp-wrap { max-width: 1060px; margin: 0 auto; padding: 0 40px; }
        .lp-kicker { font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.5); margin: 0 0 22px; display: flex; align-items: center; gap: 10px; }
        .lp-kicker::before { content: ''; width: 24px; height: 1px; background: rgba(255,255,255,.3); }
        .lp-section { padding: 64px 0; }
        .lp-head { border-top: 1px solid ${INK}; padding-top: 14px; margin-bottom: 30px; }
        .lp-label { font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${MUTED}; margin: 0; }
        .lp-h2 { font-family: ${SERIF}; font-size: 30px; line-height: 1.2; letter-spacing: -.015em; margin: 0 0 12px; font-weight: 700; }
        .lp-lead { font-size: 15.5px; line-height: 1.75; color: ${MUTED}; margin: 0 0 30px; max-width: 640px; }

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
        .lp-btn-ghost { background: transparent; border-color: rgba(255,255,255,.4); color: #fff; }
        .lp-btn-ghost:hover { background: #fff; color: ${INK}; }

        /* 숫자 띠 — 실제 데이터 수 */
        .lp-stats { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid ${RULE}; background: #fff; }
        .lp-stat { padding: 22px 18px; border-left: 1px solid ${RULE}; }
        .lp-stat:first-child { border-left: none; }
        .lp-stat-n { font-family: ${SERIF}; font-size: 30px; font-weight: 700; line-height: 1.1; letter-spacing: -.01em; }
        .lp-stat-l { font-size: 12.5px; color: ${MUTED}; margin-top: 6px; line-height: 1.45; }

        /* 기능 쇼케이스 — 글 / 실제 화면 두 장. 짝수 블록은 좌우를 바꾼다 */
        .lp-show { display: grid; grid-template-columns: 1fr 1.25fr; gap: 48px; align-items: center; }
        .lp-show + .lp-show { margin-top: 72px; }
        .lp-show--flip .lp-show-text { order: 2; }
        .lp-num { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${RED}; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .lp-pro { font-size: 10px; font-weight: 700; letter-spacing: .1em; color: #fff; background: ${INK}; padding: 3px 7px; border-radius: 3px; }
        .lp-show-text h3 { font-family: ${SERIF}; font-size: 26px; line-height: 1.25; letter-spacing: -.01em; margin: 0 0 12px; font-weight: 700; }
        .lp-show-text p { font-size: 15.5px; line-height: 1.75; color: ${MUTED}; margin: 0 0 18px; }
        .lp-points { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .lp-points li { position: relative; padding-left: 22px; font-size: 14.5px; line-height: 1.55; color: #333; }
        .lp-points li::before { content: ''; position: absolute; left: 2px; top: 6px; width: 10px; height: 6px; border-left: 2px solid ${RED}; border-bottom: 2px solid ${RED}; transform: rotate(-45deg); }
        .lp-phones { display: flex; justify-content: center; gap: 18px; }
        .lp-phone { width: 46%; max-width: 290px; border-radius: 28px; padding: 8px; background: #121212; box-shadow: 0 20px 50px rgba(0,0,0,.18); }
        .lp-phone img { display: block; width: 100%; height: auto; border-radius: 21px; }
        .lp-phone:nth-child(2) { margin-top: 48px; }

        /* +1 · +2 재료 — 화면 대신 단계 그림 (Pro 화면은 로그인이 있어야 보여서 캡처하지 않았다) */
        .lp-tiers { display: grid; gap: 12px; }
        .lp-tier { display: grid; grid-template-columns: 92px 1fr; gap: 16px; align-items: center; background: #fff; border: 1px solid ${RULE}; padding: 18px 20px; }
        .lp-tier-tag { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; text-align: center; padding: 8px 6px; border-radius: 4px; background: #F2EFEB; color: ${INK}; }
        .lp-tier--ready .lp-tier-tag { background: #2D5016; color: #fff; }
        .lp-tier--plus .lp-tier-tag { background: #C4622D; color: #fff; }
        .lp-tier h4 { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
        .lp-tier p { font-size: 13.5px; line-height: 1.6; color: ${MUTED}; margin: 0; }

        /* 무료 · Pro */
        .lp-plans { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .lp-plan { background: #fff; border: 1px solid ${RULE}; padding: 28px 26px; display: flex; flex-direction: column; }
        .lp-plan--pro { border: 2px solid ${INK}; }
        .lp-plan h3 { font-family: ${SERIF}; font-size: 22px; line-height: 1.25; margin: 0 0 6px; font-weight: 700; }
        .lp-plan-sub { font-size: 13.5px; color: ${MUTED}; margin: 0 0 18px; }
        .lp-list { list-style: none; margin: 0 0 24px; padding: 0; display: grid; gap: 9px; flex: 1; }
        .lp-list li { position: relative; padding-left: 22px; font-size: 14px; line-height: 1.5; color: #444; }
        .lp-list li::before { content: ''; position: absolute; left: 2px; top: 6px; width: 10px; height: 6px; border-left: 2px solid ${RED}; border-bottom: 2px solid ${RED}; transform: rotate(-45deg); }
        .lp-plan .lp-btn { width: 100%; min-width: 0; }

        /* 고정 'Launch App' — PC 는 오른쪽 아래 알약, 모바일은 아래 띠 */
        .lp-sticky { position: fixed; right: 24px; bottom: 24px; z-index: 50; }
        .lp-sticky .lp-btn { min-width: 0; height: 48px; padding: 0 22px; border-radius: 999px; box-shadow: 0 10px 28px rgba(0,0,0,.22); }
        .lp-end-pad { height: 40px; }

        @media (max-width: 900px) {
          .lp-show { grid-template-columns: 1fr; gap: 32px; }
          .lp-show--flip .lp-show-text { order: 0; }
          .lp-stats { grid-template-columns: repeat(2, 1fr); }
          .lp-stat:nth-child(3) { border-left: none; }
          .lp-stat:nth-child(n+3) { border-top: 1px solid ${RULE}; }
        }
        @media (max-width: 640px) {
          .lp-wrap { padding: 0 20px; }
          .lp-section { padding: 48px 0; }
          .lp-h2 { font-size: 26px; }
          .lp-btn { width: 100%; min-width: 0; }
          .lp-hero-btns { flex-direction: column; }
          .lp-plans { grid-template-columns: 1fr; }
          .lp-phone { border-radius: 22px; padding: 6px; }
          .lp-phone img { border-radius: 17px; }
          .lp-phone:nth-child(2) { margin-top: 32px; }
          .lp-tier { grid-template-columns: 1fr; gap: 10px; }
          .lp-tier-tag { justify-self: start; padding: 6px 10px; }
          .lp-sticky { left: 0; right: 0; bottom: 0; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: rgba(249,248,246,.94); border-top: 1px solid ${RULE}; backdrop-filter: blur(8px); }
          .lp-sticky .lp-btn { width: 100%; border-radius: 6px; box-shadow: none; }
          .lp-end-pad { height: 84px; }
        }
      `}</style>

      <SiteNav />

      {/* ── Hero ── */}
      <section style={{ background: '#121212' }}>
        <div className="lp-wrap" style={{ paddingTop: 'clamp(48px, 8vw, 88px)', paddingBottom: 'clamp(52px, 8vw, 88px)' }}>
          <p className="lp-kicker" translate="no">K-PANTRY</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 4.4vw, 50px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-.02em', color: '#fff', margin: '0 0 18px', maxWidth: 780 }}>
            Cook Real Korean Food with What&rsquo;s Already in Your Fridge
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,.68)', margin: '0 0 30px', maxWidth: 640 }}>
            {`Tell K-Pantry what you have, and it matches you to ${RECIPES} beginner-friendly Korean recipes — no extra grocery run. `}
            Or pick the dish you&rsquo;re craving and get the exact ingredient list and step-by-step guide.
          </p>
          <div className="lp-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <LaunchButton />
            <a href="#features" className="lp-btn lp-btn-ghost">See how it works</a>
          </div>
        </div>
      </section>

      {/* ── Numbers ── */}
      <section className="lp-section" style={{ paddingBottom: 24 }}>
        <div className="lp-wrap">
          <div className="lp-stats">
            <div className="lp-stat"><div className="lp-stat-n">{RECIPES}</div><div className="lp-stat-l">Korean recipes, from kimchi fried rice to bulgogi</div></div>
            <div className="lp-stat"><div className="lp-stat-n">{INGREDIENTS}</div><div className="lp-stat-l">everyday ingredients to pick from</div></div>
            <div className="lp-stat"><div className="lp-stat-n">4</div><div className="lp-stat-l">nutrition facts per serving: kcal, protein, carbs, fat</div></div>
            <div className="lp-stat"><div className="lp-stat-n">3</div><div className="lp-stat-l">ingredient levels: essential, recommended, optional</div></div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="lp-section" style={{ scrollMarginTop: 72 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">What K-Pantry does</p></div>

          {/* 1 — 냉장고 재료 → 레시피 */}
          <div className="lp-show">
            <div className="lp-show-text">
              <p className="lp-num">01 · From your fridge</p>
              <h3>{RECIPES} Korean recipes, matched to what you already have.</h3>
              <p>
                Tap the ingredients in your kitchen and K-Pantry shows the authentic, beginner-friendly Korean dishes you can
                cook right now — no shopping list, no guesswork.
              </p>
              <ul className="lp-points">
                <li>Pick from {INGREDIENTS} everyday ingredients, grouped by vegetables, meat &amp; seafood and more</li>
                <li>See every recipe you can make, with cooking time and calories on each card</li>
                <li>Browse by stews, rice, noodles and side dishes</li>
              </ul>
            </div>
            <Phones
              a="app-home" altA="K-Pantry home: 'I Have Ingredients' with the user's ingredients — kimchi, egg, rice, green onion, onion — and a Find Recipes button"
              b="app-recipes" altB="K-Pantry recipes screen: category tabs and popular recipe cards with cooking time and calories"
            />
          </div>

          {/* 2 — +1 · +2 재료 (Pro) */}
          <div className="lp-show lp-show--flip">
            <div className="lp-show-text">
              <p className="lp-num">02 · One step further <span className="lp-pro">PRO</span></p>
              <h3>See what one or two extra ingredients unlock.</h3>
              <p>
                Missing just a little something? K-Pantry suggests the next-level dishes you could make by adding only one or two
                simple ingredients — so a quick stop at the store turns into a whole new meal.
              </p>
              <ul className="lp-points">
                <li>Results grouped by how close you are: ready now, +1 ingredient, +2 ingredients</li>
                <li>Each recipe shows exactly which ingredient is missing</li>
                <li>Add what you need to your shopping list in one tap</li>
              </ul>
            </div>
            <div className="lp-tiers" role="img" aria-label="K-Pantry groups recipes into: ready to cook now, needs one more ingredient, and needs two more ingredients">
              <div className="lp-tier lp-tier--ready">
                <span className="lp-tier-tag">Ready now</span>
                <div><h4>Cook it tonight</h4><p>You already have every essential ingredient.</p></div>
              </div>
              <div className="lp-tier lp-tier--plus">
                <span className="lp-tier-tag">+1</span>
                <div><h4>One ingredient away</h4><p>K-Pantry names the single item that unlocks the dish.</p></div>
              </div>
              <div className="lp-tier">
                <span className="lp-tier-tag">+2</span>
                <div><h4>Two ingredients away</h4><p>Bigger dishes that are still just a short shopping trip away.</p></div>
              </div>
            </div>
          </div>

          {/* 3 — 먹고 싶은 요리 → 재료 · 순서 */}
          <div className="lp-show">
            <div className="lp-show-text">
              <p className="lp-num">03 · Start from a craving</p>
              <h3>Pick the dish you want. Get the exact checklist.</h3>
              <p>
                Already know what you&rsquo;re in the mood for? Choose it from the dish picker and K-Pantry gives you the precise
                ingredient list and a step-by-step cooking guide with photos.
              </p>
              <ul className="lp-points">
                <li>Search or swipe through dishes — bulgogi, tteokbokki, japchae and more</li>
                <li>Every ingredient with its amount</li>
                <li>Numbered steps with a photo for each stage</li>
              </ul>
            </div>
            <Phones
              a="app-want-to-cook" altA="K-Pantry 'I Want to Cook' card with Bulgogi selected and a View Recipe button"
              b="app-dishes" altB="K-Pantry dish picker: search box, category tabs and a swipeable card for Altang with time and calories"
            />
          </div>

          {/* 4 — 영양 · 킥 재료 */}
          <div className="lp-show lp-show--flip">
            <div className="lp-show-text">
              <p className="lp-num">04 · Know what you eat</p>
              <h3>Nutrition per serving, plus the ingredients that make it taste Korean.</h3>
              <p>
                Every recipe shows calories, protein, carbs and fat per serving. Ingredients are split into essential,
                recommended and optional — the optional ones are the secret seasonings and flavor kicks that take a dish from good
                to authentically Korean.
              </p>
              <ul className="lp-points">
                <li>kcal · protein · carbs · fat on every recipe</li>
                <li>Essential, recommended and optional ingredients at a glance</li>
                <li>Curated flavor enhancers for a deeper, more authentic taste</li>
              </ul>
            </div>
            <Phones
              a="app-recipe-nutrition" altA="Kimchi Fried Rice recipe: 190 kcal, 6 g protein, 29 g carbs, 6 g fat, with essential ingredients kimchi, rice, egg and soy sauce"
              b="app-recipe-optional" altB="Kimchi Fried Rice recipe with the Optional tab open, showing sesame seeds as an optional ingredient"
            />
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, textAlign: 'center', margin: '28px 0 0' }}>Real screens from the K-Pantry web app.</p>
        </div>
      </section>

      {/* ── Free · Pro ── */}
      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap">
          <div className="lp-head"><p className="lp-label">Start free</p></div>
          <h2 className="lp-h2">Start cooking free, upgrade when you want more</h2>
          <p className="lp-lead">No sign-up needed to browse recipes. Open the web app in your browser on any phone or computer.</p>
          <div className="lp-plans">
            <div className="lp-plan">
              <p className="lp-label" style={{ color: RED, marginBottom: 10 }}>Free</p>
              <h3>Everything you need to cook tonight</h3>
              <p className="lp-plan-sub">Open the app and start.</p>
              <ul className="lp-list">
                <li>All {RECIPES} recipes with step-by-step guides</li>
                <li>Nutrition per serving on every recipe</li>
                <li>Recipes you can cook with what you have</li>
                <li>&ldquo;I want to cook&rdquo; dish picker</li>
              </ul>
              <LaunchButton />
            </div>
            <div className="lp-plan lp-plan--pro">
              <p className="lp-label" style={{ color: INK, marginBottom: 10 }}>K-Pantry Pro</p>
              <h3>For cooking Korean every week</h3>
              <p className="lp-plan-sub">Unlock inside the app.</p>
              <ul className="lp-list">
                <li>+1 and +2 ingredient suggestions</li>
                <li>Shopping list for missing ingredients</li>
                <li>Save your pantry and unlimited favorite recipes</li>
                <li>Find stores for Korean ingredients</li>
              </ul>
              <LaunchButton className="lp-btn" label="Open the app to upgrade ↗" />
            </div>
          </div>
          <div className="lp-end-pad" />
        </div>
      </section>

      {/* ── 고정 Launch App ── */}
      <div className="lp-sticky">
        <LaunchButton label="Launch App ↗" />
      </div>

      <SiteFooter />
    </div>
  )
}
