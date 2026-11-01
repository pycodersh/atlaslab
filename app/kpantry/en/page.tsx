import type { Metadata } from 'next'
import BottomNav from '@/components/kpantry/layout/BottomNav'
import HomeHeader from '@/components/kpantry/home/HomeHeader'
import QuickStartCards from '@/components/kpantry/home/QuickStartCards'
import PopularDishes from '@/components/kpantry/home/PopularDishes'
import KoreanPantrySection from '@/components/kpantry/home/KoreanPantrySection'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

export const metadata: Metadata = {
  alternates: {
    canonical: `${BASE_URL}/kpantry/en`,
  },
  // layout 의 noindex 기본값을 랜딩에서만 해제한다
  robots: { index: true, follow: true },
}

const HERO_IMG = process.env.NEXT_PUBLIC_IMG_HERO

export default function KPantryHomePage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      <HomeHeader heroImg={HERO_IMG} />
      <QuickStartCards />
      <PopularDishes />
      <KoreanPantrySection />

      <BottomNav />
    </div>
  )
}
