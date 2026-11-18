import type { Metadata } from 'next'
import KPantryHeader from '@/components/kpantry/home/KPantryHeader'
import HomeHeroArt from '@/components/kpantry/home/HomeHeroArt'
import HomePaths from '@/components/kpantry/home/HomePaths'
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

/*
 * 히어로: 모바일은 글 → 그림(그림 위에 글을 겹치지 않는다), 768px 이상은 왼쪽 글 · 오른쪽 그림.
 * 폰에서도 그림 전체를 화면 폭(좌우 여백 없이)으로 — 375px 에서 0.59배라 선(1.3px 고정)이 뭉개지지 않아 자르지 않는다.
 */
const HOME_CSS = `
.kp-home { max-width: 1040px; margin: 0 auto; }
.kp-hero { display: grid; grid-template-columns: 1fr; gap: 8px; padding: 8px 4px 0; }
.kp-hero-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #1C1917; margin: 0; }
.kp-hero-sub { font-family: Inter, sans-serif; font-size: 15px; line-height: 1.5; color: #57534E; margin: 8px 0 0; }
.kp-hero-art { overflow: hidden; margin: 0 -16px; }
@media (min-width: 768px) {
  .kp-hero { grid-template-columns: 5fr 7fr; align-items: center; gap: 24px; padding-top: 24px; }
  .kp-hero-title { font-size: 40px; }
  .kp-hero-art { margin: 0; }
}
`

/** 홈 — 헤더 · 라인아트 히어로 · 3가지 길 카드, 그 아래 같은 번호의 미리보기 섹션 셋 */
export default async function KPantryHomePage() {
  const home = await getHomeData()

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <style>{HOME_CSS}</style>
      <KPantryHeader />
      <div className="kp-home">
        <div style={{ padding: '0 16px' }}>

          {/* 제목 · 부제가 그림보다 DOM 앞 — 그림은 SVG 라 글자가 먼저 그려진다 */}
          <section className="kp-hero" aria-labelledby="kp-hero-title">
            <div>
              <h2 id="kp-hero-title" className="kp-hero-title">What are you cooking today?</h2>
              <p className="kp-hero-sub">Three ways to find your next Korean meal.</p>
            </div>
            <div className="kp-hero-art">
              <HomeHeroArt />
            </div>
          </section>

          <div style={{ margin: '8px 0 36px' }}>
            <HomePaths recipeCount={home.recipeCount} example={home.example} />
          </div>
        </div>

        <CookWithIngredientsCard chips={home.haveChips} />
        <PopularDishes recipeCount={home.recipeCount} />
        <KoreanPantrySection tiles={home.byIngredient} />
      </div>
    </div>
  )
}
