import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bookmark } from 'lucide-react'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

export const metadata: Metadata = {
  alternates: {
    canonical: `${BASE_URL}/kpantry/en`,
  },
  // layout 의 noindex 기본값을 랜딩에서만 해제한다
  robots: { index: true, follow: true },
}

/** 배경 사진 — 한식 코스 다이닝 테이블 컷(1280×853). 바꾸려면 이 파일을 교체한다 */
const HERO_IMG = '/kpantry/home-hero.jpg'

/** 진입 경로 3개 — 재료 매칭 · 요리로 찾기 · 기본 양념 8가지 */
const PATHS = [
  {
    emoji: '🍳',
    href: '/kpantry/en/ingredients',
    title: 'Cook with What I Have',
    desc: 'Match fridge ingredients (+1 missing item suggestions)',
  },
  {
    emoji: '🍜',
    href: '/kpantry/en/recipes',
    title: 'Craving a Specific Dish?',
    desc: 'Browse all authentic recipes directly',
  },
  {
    emoji: '🥢',
    href: '/kpantry/en/essentials',
    title: '8 Korean Essentials',
    desc: 'Cook classic dishes with basic pantry staples',
  },
]

/*
 * 유리 카드 — 호버·누름은 인라인으로 못 써서 클래스에 둔다.
 * backdrop-filter 를 못 쓰는 브라우저는 반투명 흰색만 남아 글씨가 사진에 묻히므로 배경을 더 어둡게 깐다.
 * 누름 축소는 움직임 줄이기 설정이면 끈다.
 */
const GLASS_CSS = `
.kp-glass {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
}
.kp-glass:hover, .kp-glass:focus-visible { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); }
.kp-glass:active { transform: scale(0.98); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .kp-glass { background: rgba(28, 25, 23, 0.6); }
}
@media (prefers-reduced-motion: reduce) { .kp-glass { transition: none; } .kp-glass:active { transform: none; } }
`

/** 홈 — 다이닝 사진을 화면 전체 배경으로 깔고 그 위에 흰 글씨 카피 + 유리 카드 3개 */
export default function KPantryHomePage() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100svh',
      overflow: 'hidden',
      backgroundColor: '#1C1917',
      color: '#FFFFFF',
    }}>
      <style>{GLASS_CSS}</style>

      <img
        src={HERO_IMG}
        alt=""
        width={1280}
        height={853}
        fetchPriority="high"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // 세로 화면에서는 가운데가 잘려 나오는데, 상차림이 몰린 왼쪽 가운데를 남긴다
          objectPosition: '40% 50%',
        }}
      />
      {/* 위는 사진이 보이게 옅게, 카드가 놓이는 아래로 갈수록 진하게 */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.75) 100%)',
      }} />

      <div style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px calc(24px + env(safe-area-inset-bottom))',
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '28px 4px 0',
        }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 26,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.1,
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
          }}>
            K-Pantry
          </h1>
          <Link
            href="/kpantry/en/saved"
            aria-label="Saved recipes"
            className="kp-glass"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
            }}
          >
            <Bookmark size={18} strokeWidth={1.75} color="#FFFFFF" aria-hidden="true" />
          </Link>
        </header>

        {/* 카피와 카드는 화면 아래쪽에 모은다 — 위쪽은 사진이 보이는 자리 */}
        <div style={{ marginTop: 'auto', paddingTop: 160 }}>
          <div style={{ padding: '0 4px 20px' }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              margin: 0,
              textShadow: '0 1px 8px rgba(0,0,0,0.3)',
            }}>
              What are you cooking today?
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '6px 0 0',
            }}>
              Choose your path to authentic Korean home cooking.
            </p>
          </div>

          <nav aria-label="Ways to start">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PATHS.map(p => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="kp-glass"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 20,
                      borderRadius: 16,
                      color: '#FFFFFF',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: 'block',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}>
                        <span aria-hidden="true" style={{ marginRight: 8 }}>{p.emoji}</span>
                        {p.title}
                      </span>
                      <span style={{
                        display: 'block',
                        marginTop: 4,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'rgba(255, 255, 255, 0.75)',
                      }}>
                        {p.desc}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{
                      flexShrink: 0,
                      padding: 8,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                    }}>
                      <ArrowRight size={18} strokeWidth={2} color="#FFFFFF" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
