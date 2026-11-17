/**
 * Basics 상황 장면 배경 5종 — 1920×1080 펜화. 캐릭터보다 연하게(#111111 · opacity 0.35), 소품 3~5개.
 * 가운데 아래(x 300~1620, y 420~)는 캐릭터 자리라 비워 둔다. 장면의 주인공은 대사다.
 */
import type { JSX } from 'react'

export type SceneBackground = 'cafe' | 'street' | 'restaurant' | 'home' | 'shop'

const s = { fill: 'none', stroke: '#111111', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const FLOOR = 'M0 930 H1920'

function Cafe() {
  return (
    <>
      {/* 창문(왼쪽 위) */}
      <path d="M90 120 H520 V520 H90 Z M305 120 V520 M90 320 H520" {...s} />
      <path d="M130 470 C170 430 210 450 250 420 M350 300 l40 -40 M380 300 l40 -40" {...s} strokeWidth={3} />
      {/* 펜던트 조명 2개 */}
      <path d="M1180 0 V110 M1130 160 Q1180 96 1230 160 Z M1500 0 V150 M1450 200 Q1500 136 1550 200 Z" {...s} />
      {/* 카운터 + 컵(오른쪽) */}
      <path d="M1640 640 H1920 M1640 640 V930" {...s} />
      <path d="M1700 640 V580 H1770 V640 M1770 596 C1800 596 1800 628 1770 628 M1716 560 q8 -14 0 -28 M1748 560 q8 -14 0 -28" {...s} strokeWidth={3} />
      {/* 화분(왼쪽 아래) */}
      <path d="M120 930 L140 820 H240 L260 930 M190 820 C160 760 130 740 110 700 M190 820 C200 750 240 720 270 690 M190 820 C186 770 190 740 200 700" {...s} />
      <path d={FLOOR} {...s} />
    </>
  )
}

function Street() {
  return (
    <>
      {/* 건물 두 동(양옆) */}
      <path d="M40 930 V220 H330 V930 M80 280 h60 v70 h-60 Z M220 280 h60 v70 h-60 Z M80 420 h60 v70 h-60 Z M220 420 h60 v70 h-60 Z" {...s} />
      <path d="M1600 930 V300 H1880 V930 M1640 360 h60 v70 h-60 Z M1780 360 h60 v70 h-60 Z M1640 500 h60 v70 h-60 Z" {...s} />
      {/* 가로등 */}
      <path d="M470 930 V200 Q470 150 530 150 H580 M560 150 v26 h40 v-26" {...s} />
      {/* 택시 표지(위 가운데) */}
      <path d="M1330 120 h180 v70 h-180 Z M1420 190 V330" {...s} />
      <text x={1420} y={168} textAnchor="middle" fontSize={44} fontWeight={700} fill="#111111" fontFamily="'DM Sans', system-ui, sans-serif">TAXI</text>
      {/* 길 */}
      <path d="M0 930 H1920 M200 1000 h160 M760 1000 h160 M1320 1000 h160" {...s} />
    </>
  )
}

function Restaurant() {
  return (
    <>
      {/* 메뉴판(왼쪽 위) */}
      <path d="M110 110 H500 V430 H110 Z M150 180 h180 M150 240 h240 M150 300 h150 M150 360 h210" {...s} />
      {/* 등(오른쪽 위) */}
      <path d="M1520 0 V120 M1460 120 h120 l-20 80 h-80 Z" {...s} />
      {/* 식탁 + 그릇 · 젓가락(아래 양옆) */}
      <path d="M0 800 H330 M1590 800 H1920" {...s} />
      <path d="M100 800 Q100 740 170 740 Q240 740 240 800 M1660 800 Q1660 750 1730 750 Q1800 750 1800 800 M1820 760 l70 -90 M1840 770 l70 -90" {...s} />
      <path d={FLOOR} {...s} />
    </>
  )
}

function Home() {
  return (
    <>
      {/* 창문 + 커튼(왼쪽) */}
      <path d="M100 140 H480 V520 H100 Z M290 140 V520" {...s} />
      <path d="M70 110 H510 M70 110 C110 260 90 420 120 560 M510 110 C470 260 490 420 460 560" {...s} />
      {/* 액자(오른쪽 위) */}
      <path d="M1520 150 h260 v190 h-260 Z M1560 300 l60 -70 l40 40 l40 -50 l40 50" {...s} />
      {/* 소파 끝(오른쪽 아래) */}
      <path d="M1660 930 V700 Q1660 660 1700 660 H1920 M1660 780 H1920" {...s} />
      {/* 화분 */}
      <path d="M140 930 L156 850 H236 L252 930 M196 850 C170 800 150 780 140 740 M196 850 C210 790 240 770 262 740" {...s} />
      <path d={FLOOR} {...s} />
    </>
  )
}

function Shop() {
  return (
    <>
      {/* 선반 + 상자(왼쪽) */}
      <path d="M60 300 H460 M60 500 H460 M60 700 H460 M60 160 V930 M460 160 V930" {...s} />
      <path d="M100 300 v-90 h90 v90 M220 300 v-60 h70 v60 M320 300 v-110 h100 v110 M100 500 v-70 h120 v70 M260 500 v-100 h70 v100 M100 700 v-90 h80 v90 M230 700 v-60 h160 v60" {...s} strokeWidth={3} />
      {/* 가격표 */}
      <path d="M1540 160 h220 v110 h-220 Z M1650 120 v40" {...s} />
      <text x={1650} y={232} textAnchor="middle" fontSize={50} fontWeight={700} fill="#111111" fontFamily="'DM Sans', system-ui, sans-serif">₩</text>
      {/* 계산대(오른쪽 아래) */}
      <path d="M1620 700 H1920 M1620 700 V930 M1700 700 V630 H1820 V700 M1720 650 h80" {...s} />
      <path d={FLOOR} {...s} />
    </>
  )
}

const ART: Record<SceneBackground, () => JSX.Element> = { cafe: Cafe, street: Street, restaurant: Restaurant, home: Home, shop: Shop }

export function Background({ name, opacity = 0.35 }: { name: SceneBackground; opacity?: number }) {
  const Art = ART[name]
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity }}>
      <Art />
    </svg>
  )
}
