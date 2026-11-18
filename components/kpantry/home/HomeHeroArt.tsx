import type { CSSProperties } from 'react'
import { createInk, circ, r1, type Part } from '@/components/home/panorama/ink'

/**
 * K-Pantry 홈 히어로 — 한국 가정식 한 상(비스듬히 위에서 본 구도). 사이트 홈 파노라마와 같은 펜 도구(createInk)로 그린다.
 *   뒷줄: 밥그릇 · 김치 접시 · 김치찌개 뚝배기 · 나물 접시
 *   앞줄: 수저 · 비빔밥 돌솥(계란 프라이) · 삼겹살 불판(+ 상추 한 장)
 * 선은 K-Pantry 글자색, 면은 페이지 크림색(뒤 선을 가린다). 포인트 색은 세 가지뿐:
 *   레드 #C8102E(고추장 · 김치 · 찌개 국물, 불투명도로 톤 차이) · 노른자 노랑 · 차분한 초록(나물 · 상추)
 * 움직임: 0~2.5s 선이 그려지고(요소별 시차) → 2.5~3.2s 포인트 색이 스민다 →
 *         이후 찌개 김 · 불판 연기만 4~6초 주기로 피어오르고, 찌개 거품이 가끔 하나씩 올라왔다 터진다.
 *         전체를 다시 그리지는 않는다. prefers-reduced-motion 이면 완성된 그림 그대로, 김 · 연기도 멈춘다.
 * 서버 컴포넌트 — 그림은 HTML 에 바로 들어간다(자바스크립트 없음).
 */

const W = 640, H = 360
const PAPER = 'var(--kh-paper)'
const RED = 'var(--kh-red)'
const YOLK = 'var(--kh-yolk)'
const GREEN = 'var(--kh-green)'

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r1(cx - rx)} ${r1(cy)} A${rx} ${ry} 0 1 0 ${r1(cx + rx)} ${r1(cy)} A${rx} ${ry} 0 1 0 ${r1(cx - rx)} ${r1(cy)} Z`
/** 그릇 몸통 — 테두리 타원 아래로 둥글게 내려간다 */
const bowl = (cx: number, cy: number, rx: number, depth: number, foot = 0) =>
  `M${cx - rx} ${cy} C${cx - rx + 2} ${cy + depth * 0.62} ${cx - rx * 0.55} ${cy + depth} ${cx} ${cy + depth} ` +
  `C${cx + rx * 0.55} ${cy + depth} ${cx + rx - 2} ${cy + depth * 0.62} ${cx + rx} ${cy}` +
  (foot ? ` M${cx - foot} ${cy + depth - 1} l1 6 h${foot * 2 - 2} l1 -6` : '')

const { parts, m, dl, fl } = createInk()

/* ── 뒷줄 ─────────────────────────────────────────── */

// 밥그릇 — 고봉밥
m(bowl(100, 150, 44, 46, 14), 100, PAPER)
m(ell(100, 150, 44, 14), 100, PAPER)
m('M62 148 C70 128 86 120 100 120 C114 120 130 128 138 148', 100, PAPER)
dl('M80 134 l3 -1 M92 127 l3 0 M108 128 l3 1 M120 134 l2 1 M86 142 l3 0 M114 141 l3 0 M100 136 l2 0', 100)

// 김치 접시
m(ell(232, 118, 46, 15), 232, PAPER)
dl(ell(232, 118, 38, 11), 232)
fl('M204 118 C206 104 218 98 230 100 C244 98 258 104 260 116 C252 124 214 126 204 118 Z', 232, RED, 0.72)
m('M204 118 C206 104 218 98 230 100 C244 98 258 104 260 116 M214 110 C222 104 232 106 238 112 M232 104 C242 100 250 104 254 110', 232)

// 김치찌개 뚝배기
m(bowl(410, 120, 72, 64, 30), 410, PAPER)
m(ell(410, 120, 72, 22), 410, PAPER)
fl(ell(410, 121, 63, 17), 410, RED, 0.5)
dl(ell(410, 121, 63, 17), 410)
dl('M348 140 C360 150 376 156 396 158 M424 158 C444 156 462 150 472 140', 410)
// 국물 속 두부 · 김치 · 파
m('M380 116 l14 -4 l11 5 l-14 4 Z M418 112 l13 -3 l10 5 l-13 3 Z', 410, PAPER)
fl('M436 122 c6 -4 14 -2 16 3 c-6 4 -12 3 -16 -3 Z M368 124 c5 -3 12 -1 13 3 c-5 3 -10 2 -13 -3 Z', 410, RED, 0.85)
m('M436 122 c6 -4 14 -2 16 3 c-6 4 -12 3 -16 -3 Z M368 124 c5 -3 12 -1 13 3 c-5 3 -10 2 -13 -3 Z', 410)
fl('M398 126 l10 -2 l-1 3 Z M404 118 l8 3 l-3 1 Z', 410, GREEN, 0.9)
m('M398 126 l10 -2 M404 118 l8 3', 410)

// 나물 접시
m(ell(566, 126, 44, 14), 566, PAPER)
dl(ell(566, 126, 36, 10), 566)
fl('M540 126 C544 112 558 108 568 110 C580 108 592 114 594 124 C584 132 548 132 540 126 Z', 566, GREEN, 0.7)
m('M540 126 C544 112 558 108 568 110 C580 108 592 114 594 124', 566)
dl('M548 122 c6 -6 12 -8 18 -6 M558 126 c6 -8 14 -10 22 -6 M570 114 c4 2 8 6 10 10', 566)
dl(circ(560, 118, 0.8) + circ(578, 120, 0.8) + circ(568, 124, 0.8), 566)

/* ── 앞줄 ─────────────────────────────────────────── */

// 수저 — 숟가락 · 젓가락
m('M44 336 L92 262', 70)
m(ell(97, 254, 9, 13).replace('Z', ''), 70, PAPER)
m('M64 342 L124 264 M74 344 L132 268', 70)

// 비빔밥 돌솥
m(bowl(232, 236, 92, 70), 232, PAPER)
dl('M152 270 C170 292 200 302 232 304 C264 302 294 292 312 270', 232)
m(ell(232, 236, 92, 30), 232, PAPER)
dl(ell(232, 236, 84, 26), 232)
// 시금치(초록) · 당근 채 · 콩나물 · 버섯 · 고추장 · 계란 프라이
fl('M160 240 C164 226 182 218 198 222 C202 232 194 246 178 250 C168 252 160 248 160 240 Z', 232, GREEN, 0.72)
m('M160 240 C164 226 182 218 198 222 C202 232 194 246 178 250 C168 252 160 248 160 240 Z', 232)
dl('M168 238 c8 -6 16 -10 24 -12 M172 246 c6 -4 12 -10 16 -16', 232)
m('M206 214 l22 -6 M210 220 l24 -7 M214 226 l22 -6 M236 210 l18 -4', 232)
dl('M272 222 c6 -6 14 -6 18 0 M278 232 c6 -6 14 -6 18 0 M268 242 c6 -6 14 -6 18 0', 232)
dl(circ(290, 222, 1.4) + circ(296, 232, 1.4) + circ(286, 242, 1.4), 232)
m('M250 252 c4 -8 16 -8 20 0 Z M226 256 c4 -7 14 -7 18 0 Z', 232, PAPER)
fl('M196 252 c2 -10 18 -12 24 -4 c4 6 -2 12 -12 12 c-6 0 -12 -2 -12 -8 Z', 232, RED, 0.9)
m('M196 252 c2 -10 18 -12 24 -4 c4 6 -2 12 -12 12 c-6 0 -12 -2 -12 -8 Z', 232)
m('M222 232 C214 220 226 206 244 208 C262 206 276 216 270 230 C266 240 248 244 236 242 C226 242 224 238 222 232 Z', 232, PAPER)
fl(circ(246, 225, 8), 232, YOLK, 0.95)
m(circ(246, 225, 8), 232)
dl('M240 220 c2 -2 4 -3 6 -2', 232)

// 삼겹살 불판
m(ell(466, 262, 108, 38), 466, PAPER)
dl(ell(466, 262, 96, 32), 466)
dl(Array.from({ length: 9 }, (_, i) => {
  const x = 392 + i * 18, dy = Math.sqrt(Math.max(0, 1 - ((x - 466) / 96) ** 2)) * 28
  return `M${x} ${r1(262 - dy)} L${x + 10} ${r1(262 + dy)}`
}).join(' '), 466)
// 고기 세 줄(비계 줄무늬) · 마늘
for (const [x, y] of [[396, 262], [430, 274], [470, 258]] as const) {
  // 삼겹살 한 줄 — 길쭉하게, 비계 두 줄 · 살코기 결
  m(`M${x} ${y} c4 -9 54 -24 64 -17 c5 4 3 13 -3 16 c-13 7 -50 20 -59 13 c-4 -3 -4 -8 -2 -12 Z`, 466, PAPER)
  dl(`M${x + 4} ${y + 1} c14 -6 32 -12 52 -16 M${x + 6} ${y + 7} c14 -6 32 -11 50 -15 M${x + 18} ${y - 3} l2 6 M${x + 36} ${y - 9} l2 6`, 466)
}
m(circ(540, 276, 5) + circ(526, 288, 4.5), 466, PAPER)
dl('M538 274 l3 3 M524 286 l3 2', 466)
// 상추 한 장 — 불판 오른쪽에 걸쳐
fl('M548 232 C566 210 600 208 612 226 C620 240 608 262 588 268 C570 274 554 262 550 250 C546 244 546 238 548 232 Z', 590, GREEN, 0.62)
m('M548 232 C566 210 600 208 612 226 C620 240 608 262 588 268 C570 274 554 262 550 250 C546 244 546 238 548 232 Z', 590)
dl('M556 252 C570 240 586 230 606 222 M574 244 l-6 -12 M588 236 l-2 -14 M584 242 l12 6 M570 248 l10 8', 590)

// 상 앞쪽 가장자리 — 그림이 떠 보이지 않게 아주 옅게
dl('M24 352 C200 346 440 346 616 352', 320)

/* ── 계속 움직이는 것: 찌개 김 · 불판 연기 · 거품 ─────────────── */
const STEAM = [
  'M392 92 C384 80 400 72 392 60 C386 50 398 42 394 32',
  'M414 96 C406 82 424 74 416 60 C410 48 422 40 418 28',
  'M436 92 C430 82 444 74 438 62',
]
const SMOKE = [
  'M446 226 C440 214 454 206 446 194 C440 186 450 178 446 170',
  'M486 222 C480 210 494 202 488 190',
]
const BUBBLES = [[388, 124, 3.2, '3.6s'], [426, 118, 2.6, '6.1s'], [404, 128, 2.2, '8.4s']] as const

const drawDelay = (p: Part) => `${(0.1 + (p.x / W) * 1.3).toFixed(2)}s`
const detailDelay = (p: Part) => `${(0.9 + (p.x / W) * 1.1).toFixed(2)}s`
const fillDelay = (p: Part) => `${(2.5 + (p.x / W) * 0.3).toFixed(2)}s`

const CSS = `
.kh-art { --kh-line: #2A2522; --kh-paper: var(--kp-bg, #FDFBF7); --kh-red: #C8102E; --kh-yolk: #F2B53A; --kh-green: #7C9A6A; display: block; width: 100%; height: auto; overflow: visible; }
.kh-art path { stroke-linecap: round; stroke-linejoin: round; }
.kh-m { stroke: var(--kh-line); stroke-width: 1.3; stroke-dasharray: 1; stroke-dashoffset: 1; animation: kh-draw 1s cubic-bezier(.45,.05,.3,1) var(--s) forwards; }
.kh-d { fill: none; stroke: var(--kh-line); stroke-width: .7; stroke-opacity: .55; opacity: 0; animation: kh-in .6s ease var(--s) forwards; }
.kh-f { stroke: none; opacity: 0; animation: kh-in .7s ease var(--s) forwards; }
.kh-steam { fill: none; stroke: var(--kh-line); stroke-width: .9; stroke-opacity: .45; opacity: 0; transform-box: fill-box; transform-origin: center bottom; animation: kh-steam 5s ease-in-out var(--s) infinite; }
.kh-bubble { fill: var(--kh-paper); stroke: var(--kh-line); stroke-width: .8; opacity: 0; transform-box: fill-box; transform-origin: center; animation: kh-bubble 7s ease-out var(--s) infinite; }
@keyframes kh-draw { to { stroke-dashoffset: 0; } }
@keyframes kh-in { to { opacity: 1; } }
@keyframes kh-steam { 0% { opacity: 0; transform: translateY(8px) scaleY(.9); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px) scaleY(1.08); } }
@keyframes kh-bubble { 0%, 80% { opacity: 0; transform: scale(.3); } 86% { opacity: 1; transform: scale(1); } 92% { opacity: 1; transform: scale(1.15); } 96%, 100% { opacity: 0; transform: scale(1.5); } }
@media (prefers-reduced-motion: reduce) {
  .kh-m { animation: none; stroke-dashoffset: 0; }
  .kh-d, .kh-f { animation: none; opacity: 1; }
  .kh-steam { animation: none; opacity: .5; }
  .kh-bubble { animation: none; opacity: 0; }
}
`

export default function HomeHeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={['kh-art', className].filter(Boolean).join(' ')} role="img"
      aria-label="Line drawing of a Korean home-cooked table: bibimbap with a fried egg, bubbling kimchi stew, pork belly on a grill, side dishes, rice and spoon and chopsticks"
      fill="none">
      <style>{CSS}</style>
      {parts.map((p, i) => p.k === 'm' ? (
        <path key={i} className="kh-m" d={p.d} pathLength={1} vectorEffect="non-scaling-stroke"
          style={{ '--s': drawDelay(p), fill: p.fill ?? 'none' } as CSSProperties} />
      ) : p.k === 'd' ? (
        <path key={i} className="kh-d" d={p.d} vectorEffect="non-scaling-stroke" style={{ '--s': detailDelay(p) } as CSSProperties} />
      ) : (
        <path key={i} className="kh-f" d={p.d} style={{ '--s': fillDelay(p), fill: p.fill, fillOpacity: p.op } as CSSProperties} />
      ))}
      {STEAM.map((d, i) => <path key={d} className="kh-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${3.2 + i * 1.6}s` } as CSSProperties} />)}
      {SMOKE.map((d, i) => <path key={d} className="kh-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${3.8 + i * 2.1}s`, animationDuration: '6s' } as CSSProperties} />)}
      {BUBBLES.map(([x, y, r, s]) => <circle key={`${x}-${y}`} className="kh-bubble" cx={x} cy={y} r={r} vectorEffect="non-scaling-stroke" style={{ '--s': s } as CSSProperties} />)}
    </svg>
  )
}
