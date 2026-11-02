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

/** 커버 사진 — 한식 코스 다이닝 테이블 컷(1280×853). 바꾸려면 이 파일을 교체한다 */
const HERO_IMG = '/kpantry/home-hero.jpg'

/** 목차 카드 3개 — 01 재료 매칭 · 02 요리로 찾기 · 03 기본 양념 8가지 */
const PATHS = [
  {
    index: '01',
    href: '/kpantry/en/ingredients',
    title: 'Cook with What I Have',
    desc: 'Select fridge ingredients. See dishes you can make right now + with +1 item.',
  },
  {
    index: '02',
    href: '/kpantry/en/recipes',
    title: 'Craving a Specific Dish?',
    desc: 'Craving Bulgogi or Stew? Browse all Korean recipes directly.',
  },
  {
    index: '03',
    href: '/kpantry/en/essentials',
    title: 'The 8 Korean Essentials',
    desc: 'Got Soy Sauce, Gochujang, or Kimchi? Discover dishes made with basic pantry staples.',
  },
]

// 호버·누름은 인라인으로 못 써서 클래스에 둔다. 누름 축소는 움직임 줄이기 설정이면 끈다
const TOC_CSS = `
.kp-toc-card { border: 1px solid rgba(231, 229, 228, 0.8); transition: border-color 0.2s, transform 0.15s; }
.kp-toc-card:hover, .kp-toc-card:focus-visible { border-color: #A8A29E; }
.kp-toc-card:active { transform: scale(0.99); }
@media (prefers-reduced-motion: reduce) { .kp-toc-card { transition: none; } .kp-toc-card:active { transform: none; } }
`

/** 홈 — 매거진 표지(커버 사진 + 질문) 아래에 목차처럼 진입 경로 3개 */
export default function KPantryHomePage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', padding: '0 16px 24px' }}>
      <style>{TOC_CSS}</style>

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bookmark size={18} strokeWidth={1.75} color="#1C1917" aria-hidden="true" />
        </Link>
      </header>

      <figure style={{ margin: 0 }}>
        <img
          src={HERO_IMG}
          alt=""
          width={1280}
          height={853}
          fetchPriority="high"
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(28, 25, 23, 0.08)',
            backgroundColor: 'var(--kp-surface-muted)',
          }}
        />
      </figure>

      <div style={{ padding: '24px 4px 20px' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.25,
          color: '#1C1917',
          margin: 0,
        }}>
          What are you cooking today?
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
          color: '#78716C',
          margin: '6px 0 0',
        }}>
          Choose your path to authentic Korean home cooking.
        </p>
      </div>

      <nav aria-label="Ways to start">
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PATHS.map(p => (
            <li key={p.index}>
              <Link
                href={p.href}
                className="kp-toc-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  textDecoration: 'none',
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: 'block',
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    // Playfair 기본 숫자는 올드스타일(0·1 이 소문자 높이)이라 목차 번호답게 대문자 높이로
                    fontVariantNumeric: 'lining-nums',
                    color: '#C8102E',
                  }}>
                    {p.index}
                  </span>
                  <span style={{
                    display: 'block',
                    marginTop: 6,
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#1C1917',
                  }}>
                    {p.title}
                  </span>
                  <span style={{
                    display: 'block',
                    marginTop: 6,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#78716C',
                  }}>
                    {p.desc}
                  </span>
                </span>
                <ArrowRight size={20} strokeWidth={1.75} color="#1C1917" aria-hidden="true" style={{ flexShrink: 0 }} />
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
