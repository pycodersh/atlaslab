'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CookingPot } from 'lucide-react'
import { getPopularRecipes } from '@/lib/kpantry/recipes'
import SectionHeader from './SectionHeader'

/**
 * 무한 마키 — 같은 사진 줄을 두 번 이어 붙이고 트랙을 -50% 까지 옮긴 뒤 처음으로 되돌린다.
 * 두 번째 줄이 첫 줄 자리에 정확히 겹치는 순간 되돌아가므로 이음매가 보이지 않는다.
 * transform 만 움직여 GPU 합성으로 돈다(레이아웃·페인트 없음). 움직임 줄이기 설정이면 멈춘다.
 * 한 바퀴 시간은 사진 수에서 계산한다 — 사진 크기·개수가 바뀌어도 속도(SPEED)가 그대로다.
 */
const MARQUEE_CSS = `
@keyframes kp-marquee { from { transform: translate3d(0, 0, 0) } to { transform: translate3d(-50%, 0, 0) } }
.kp-marquee-track { display: flex; width: max-content; animation-name: kp-marquee; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) { .kp-marquee-track { animation: none; } }
`

// 375px 카드 안쪽(약 311px)에 2.5장 정도 보이는 크기
const TILE_W = 112
const TILE_H = 96
const GAP = 12
/** 초당 이동 px — 요리를 보며 따라갈 수 있게 느리게 */
const SPEED = 16

/**
 * 홈 섹션 1 — 재료로 레시피 찾기. 머리는 섹션 2·3 과 같은 SectionHeader,
 * 본문은 레시피 사진이 천천히 흐르는 띠 + 빨간 버튼이 든 카드. 카드 전체가 /ingredients 링크다.
 */
export default function CookWithIngredientsCard() {
  const [photos, setPhotos] = useState<{ id: string; src: string }[]>([])

  useEffect(() => {
    getPopularRecipes()
      .then(rows => setPhotos(
        (rows ?? []).filter(r => r.hero_image_url).map(r => ({ id: r.id, src: r.hero_image_url as string })),
      ))
      .catch(() => {})
  }, [])

  return (
    <section style={{ padding: '12px 16px 0' }}>
      <style>{MARQUEE_CSS}</style>
      <SectionHeader
        icon={CookingPot}
        title="Cook with What You Have"
        desc="Select ingredients in your fridge to discover matching recipes."
      />

      <Link
        href="/kpantry/en/ingredients"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 16,
          backgroundColor: '#FAFAF9',
          border: '1px solid rgba(231, 229, 228, 0.8)',
          borderRadius: 16,
          overflow: 'hidden',
          textDecoration: 'none',
        }}
      >
        {/* 사진 띠 — 양 끝은 마스크로 흐리게. 사진이 오기 전에도 높이를 잡아 둬 아래가 밀리지 않는다 */}
        <span aria-hidden="true" style={{
          display: 'block',
          height: TILE_H + 8,
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
        }}>
          {photos.length > 0 && (
            <span
              className="kp-marquee-track"
              style={{
                paddingTop: 4,
                // 한 줄(= 트랙 절반) 폭 ÷ 속도 = 한 바퀴 시간
                animationDuration: `${(photos.length * (TILE_W + GAP)) / SPEED}s`,
              }}
            >
              {[...photos, ...photos].map((p, i) => (
                <img
                  key={`${p.id}-${i}`}
                  src={p.src}
                  alt=""
                  width={TILE_W}
                  height={TILE_H}
                  style={{
                    width: TILE_W,
                    height: TILE_H,
                    marginRight: GAP,
                    flexShrink: 0,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 1px rgba(0,0,0,0.05)',
                  }}
                />
              ))}
            </span>
          )}
        </span>

        <span style={{
          padding: '12px 14px',
          borderRadius: 12,
          backgroundColor: 'var(--kp-accent)',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          // (100+) 가 붙어 길어져서 375px 카드 안 한 줄에 들어가도록 13px — 화살표는 줄어들지 않게 고정
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}>
          Select Ingredients &amp; Find Recipes (100+)
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
        </span>
      </Link>
    </section>
  )
}
