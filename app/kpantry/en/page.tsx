import type { Metadata } from 'next'
import KPantryHeader from '@/components/kpantry/home/KPantryHeader'
import CookWithIngredientsCard from '@/components/kpantry/home/CookWithIngredientsCard'
import PopularDishes from '@/components/kpantry/home/PopularDishes'
import KoreanPantrySection from '@/components/kpantry/home/KoreanPantrySection'
import { getHomeData } from '@/lib/kpantry/home'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

export const metadata: Metadata = {
  alternates: {
    canonical: `${BASE_URL}/kpantry/en`,
  },
  // layout 의 noindex 기본값을 랜딩에서만 해제한다
  robots: { index: true, follow: true },
}

// 레시피 수 · 칩 · 타일 숫자를 DB 에서 센다 — 정적으로 굽고 한 시간마다 다시 센다
export const dynamic = 'force-static'
export const revalidate = 3600

/** 배너 사진 — 한식 상차림 컷(1280×853). 바꾸려면 이 파일을 교체한다 */
const HERO_IMG = '/kpantry/home-hero.jpg'

const HOME_CSS = `
.kp-hero { position: relative; aspect-ratio: 16 / 9; border-radius: 16px; overflow: hidden; background: #292524; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.kp-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.kp-hero-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.3) 45%, rgba(0,0,0,0) 75%); }
.kp-hero-copy { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 16px 16px; }
.kp-hero-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; line-height: 1.2; letter-spacing: -0.025em; color: #FFFFFF; margin: 0; text-shadow: 0 1px 6px rgba(0,0,0,.35); }
.kp-hero-sub { font-family: Inter, sans-serif; font-size: 13px; line-height: 1.45; color: rgba(255,255,255,.85); margin: 4px 0 0; }
@media (min-width: 768px) {
  .kp-hero { aspect-ratio: 21 / 8; }
  .kp-hero-copy { padding: 0 28px 26px; }
  .kp-hero-title { font-size: 34px; }
  .kp-hero-sub { font-size: 15px; }
}
`

/** 홈 — 한 줄 헤더 · 상차림 사진 히어로, 그 아래 동등한 세 기능 구역(가운데만 아이보리 밴드) */
export default async function KPantryHomePage() {
  const home = await getHomeData()

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <style>{HOME_CSS}</style>
      <div>
        <div style={{ padding: '0 16px' }}>
          <KPantryHeader />

          {/* 사진 안 왼쪽 아래에 카피 — 아래쪽만 어둡게 깔아 흰 글씨를 읽히게 하고 위쪽 상차림은 그대로 보인다 */}
          <section className="kp-hero" aria-labelledby="kp-hero-title">
            <img src={HERO_IMG} alt="" width={1280} height={853} fetchPriority="high" />
            <div className="kp-hero-shade" aria-hidden="true" />
            <div className="kp-hero-copy">
              <h2 id="kp-hero-title" className="kp-hero-title">What are you cooking today?</h2>
              <p className="kp-hero-sub">Three ways to find your next Korean meal.</p>
            </div>
          </section>

        </div>

        <CookWithIngredientsCard chips={home.haveChips} />
        <PopularDishes recipeCount={home.recipeCount} />
        <KoreanPantrySection tiles={home.byIngredient} />
      </div>
    </div>
  )
}
