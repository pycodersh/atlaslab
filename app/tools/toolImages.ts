import type { ToolId } from './toolList'

/**
 * 도구 일러스트(2026-11-17~) — 아이보리 배경 · 프로스티드 아크릴 타일 위 소프트 3D 미니어처.
 * 좌상단 광원 · 바닥 그림자 · 화이트/아이보리/저채도 네이비 + 딥 레드(#9E2B25) 포인트로 10장 모두 같다.
 * 원본은 Figma 파일 'Atlas Lab — Travel Tools glass icons'(AI 생성, 1536×1024) → 1200×800 WebP.
 * 피사체가 가운데 45% 안에 있어 홈 2:1 카드 · 허브 4:3 썸네일 · 폰 정사각에 object-fit: cover 로 잘라 쓴다.
 *
 * 되돌리기: 예전 코드 일러스트(그라데이션 SVG)는 ./toolArt 의 TOOL_ART 에 그대로 있다 —
 * ToolsHubBanner · ToolsHub 의 <img> 를 TOOL_ART[id].art 로 바꾸면 원래대로 돌아간다.
 */
export const TOOL_IMAGE: Record<ToolId, { src: string; alt: string }> = {
  'hotspot-finder': { src: '/images/tools/glass/hotspot-finder.webp', alt: 'Folded terrain map with a deep red location pin' },
  'transit-guide': { src: '/images/tools/glass/transit-guide.webp', alt: 'Miniature KTX high-speed train on a short rail track' },
  'kpop-calendar': { src: '/images/tools/glass/kpop-calendar.webp', alt: 'Miniature concert arena with a navy dome and stage lights' },
  'krw-converter': { src: '/images/tools/glass/krw-converter.webp', alt: 'Red Korean Won sign with a stack of coins' },
  'order-builder': { src: '/images/tools/glass/order-builder.webp', alt: 'Stone-bowl bibimbap with brass spoon and chopsticks' },
  weather: { src: '/images/tools/glass/weather.webp', alt: 'Pastel sun behind a white cloud' },
  'holiday-calendar': { src: '/images/tools/glass/holiday-calendar.webp', alt: 'Desk calendar with one day marked in red' },
  'size-units': { src: '/images/tools/glass/size-units.webp', alt: 'Folded white T-shirt with a ruler' },
  'subway-timer': { src: '/images/tools/glass/subway-timer.webp', alt: 'Subway ticket gates and a stopwatch with a red 15-minute section' },
  'world-time': { src: '/images/tools/glass/world-time.webp', alt: 'Desk globe with a red pin on Seoul' },
}
