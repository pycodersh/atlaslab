import type { Metadata } from 'next'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import CookWithIngredientsCard from '@/components/kpantry/home/CookWithIngredientsCard'
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

/** 배너 사진 — 한식 코스 다이닝 테이블 컷(1280×853). 바꾸려면 이 파일을 교체한다 */
const HERO_IMG = '/kpantry/home-hero.jpg'

/** 홈 — 헤더 · 다이닝 사진 배너 · 질문 카피, 그 아래 재료로 찾기 · 인기 요리 · 기본 양념 세 섹션 */
export default function KPantryHomePage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <div style={{ padding: '0 16px' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '28px 4px 16px',
        }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 26,
            fontWeight: 700,
            color: '#1C1917',
            margin: 0,
            lineHeight: 1.1,
          }}>
            K-Pantry
          </h1>
          <Link
            href="/kpantry/en/saved"
            aria-label="Saved recipes"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(231, 229, 228, 0.8)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bookmark size={18} strokeWidth={1.75} color="#1C1917" aria-hidden="true" />
          </Link>
        </header>

        {/* 사진 안 왼쪽 아래에 카피 — 아래쪽만 어둡게 깔아 흰 글씨를 읽히게 하고 위쪽 상차림은 그대로 보인다 */}
        <div style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          backgroundColor: '#292524',
          marginBottom: 28,
        }}>
          <img
            src={HERO_IMG}
            alt=""
            width={1280}
            height={853}
            fetchPriority="high"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div aria-hidden="true" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 75%)',
          }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 16px 14px' }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              margin: 0,
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            }}>
              What are you cooking today?
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              lineHeight: 1.45,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '4px 0 0',
            }}>
              Choose your path to authentic Korean home cooking.
            </p>
          </div>
        </div>
      </div>

      <CookWithIngredientsCard />
      <PopularDishes />
      <KoreanPantrySection />
    </div>
  )
}
