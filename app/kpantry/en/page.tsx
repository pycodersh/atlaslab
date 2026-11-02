import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bookmark } from 'lucide-react'
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

/*
 * kp-blob: 288px 원을 64px 흐림 — 위치·색은 인라인으로 준다.
 * kp-hero-go: 사진 위 유리 원. backdrop-filter 를 못 쓰면 반투명 흰색만으로는 사진에 묻혀서 어둡게 깐다.
 */
const HOME_CSS = `
.kp-blob { position: absolute; width: 288px; height: 288px; border-radius: 50%; filter: blur(64px); pointer-events: none; }
.kp-hero-go { background: rgba(255, 255, 255, 0.25); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transition: background-color 0.15s; }
.kp-hero-go:hover, .kp-hero-go:focus-visible { background: rgba(255, 255, 255, 0.35); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .kp-hero-go { background: rgba(0, 0, 0, 0.35); }
}
`

/** 홈 — 헤더 · 다이닝 사진 배너 · 질문 카피, 그 아래 재료로 찾기 · 인기 요리 · 기본 양념 세 섹션 */
export default function KPantryHomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <style>{HOME_CSS}</style>
      {/* 배경 앰비언트 — 웜 베이지·테라코타 빛 번짐. 클릭을 막지 않고 본문 뒤에 깔린다 */}
      <div aria-hidden="true" className="kp-blob" style={{ top: -60, right: -110, backgroundColor: 'rgba(254, 243, 199, 0.5)' }} />
      <div aria-hidden="true" className="kp-blob" style={{ top: 620, left: -140, backgroundColor: 'rgba(253, 186, 116, 0.18)' }} />
      <div aria-hidden="true" className="kp-blob" style={{ bottom: 40, right: -120, backgroundColor: 'rgba(254, 243, 199, 0.5)' }} />

      <div style={{ position: 'relative' }}>
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
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '0 14px 14px 16px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
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
              {/* 사진 위 반투명 원 — 질문에 바로 답하듯 전체 레시피로 */}
              <Link
                href="/kpantry/en/recipes"
                aria-label="Browse all recipes"
                className="kp-hero-go"
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowRight size={18} strokeWidth={2} color="#FFFFFF" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <CookWithIngredientsCard />
        <PopularDishes />
        <KoreanPantrySection />
      </div>
    </div>
  )
}
