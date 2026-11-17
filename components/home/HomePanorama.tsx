import type { CSSProperties, ReactNode } from 'react'
import { W, H, PAPER, INK, DARK_FILL, RED, INDIGO, OCHRE, GROUND, r1, rng, createInk, InkParts, delay, RIDGE, RIDGE_HATCH, TOWER, TOWER_D, CLOUD_A, CLOUD_B } from './panorama/ink'
import { CultureScene } from './panorama/CultureScene'
import { PanoramaStage } from './panorama/PanoramaStage'

/**
 * 홈 히어로 아래 — 두 폭의 펜화가 크로스페이드로 번갈아 나온다.
 *  1) Heritage: 한국어(한옥 서점 · 북카페) → 여행(골목 · 돌담 · 남산) → 음식(한옥 식당 · 평상), 아래로 축대와 개울.
 *  2) Culture:  궁궐 앞 드라마 촬영 → 남산 아래 콘서트 → 영화관 레드카펫 (panorama/CultureScene.tsx).
 * 글자 · 라벨은 없다.
 *
 * 히어로 검은 배너(.hero) 안쪽 하단에 놓인다. 색은 .hero 의 CSS 변수(--line · --line-muted-opacity · --fill-bg · --accent · --fill-dark · --warm)로만 정한다.
 * 선:  m 외곽 1.2px 크림(--line)  ·  d 기와골 · 창살 · 돌 · 물결 0.6px, 투명도 --line-muted-opacity
 * 채색: 벽 · 지붕 안쪽 = 배경색(뒤 선 가림), 붉은 포인트 = --accent, 짙은 옷 · 머리 = --fill-dark, 평상 · 그릇 = --warm.
 * 데스크톱은 4:1 비율 그대로 높이 260px 상한(폭 1040px), 폰은 156px 높이로 가운데 · 아래쪽만 잘라 보인다.
 * 움직임: 처음에 외곽선이 왼쪽부터 그려지고(세밀선 · 채색은 뒤따라 스며듦),
 *        그 뒤 구름 · 물결이 천천히 흐르고, 뚝배기 · 굴뚝 김이 피어오르고, 여행자가 골목을 걷는다.
 * 그림은 서버에서 그리고, 자동 전환만 작은 클라이언트 컴포넌트(PanoramaStage)가 맡는다.
 */

const { parts, m, dl, fl, roof, lattice, stones, seated } = createInk()

/* ════ 그림 ════════════════════════════════════════════════════ */

// 하늘 — 먼 능선과 남산서울타워, 소용돌이 구름
dl(RIDGE, 800); dl(RIDGE_HATCH, 800)
m(TOWER, 849); dl(TOWER_D, 849)

// 왼쪽 — 버드나무
m('M58 300 C62 270 60 240 70 214 C78 192 74 170 92 150 M70 214 C88 200 104 196 118 186 M66 240 C52 228 42 214 40 196', 70)
{
  const rand = rng(7)
  let d = ''
  for (let i = 0; i < 26; i++) {
    const sx = 30 + rand() * 110, sy = 150 + rand() * 50, len = 60 + rand() * 80, sway = (rand() - 0.5) * 18
    d += `M${r1(sx)} ${r1(sy)} C${r1(sx + sway)} ${r1(sy + len * 0.4)} ${r1(sx + sway * 1.4)} ${r1(sy + len * 0.75)} ${r1(sx + sway * 0.6)} ${r1(sy + len)} `
    for (let k = 1; k < 5; k++) { const t = k / 5; d += `M${r1(sx + sway * t * 1.2)} ${r1(sy + len * t)} l${r1(2 + rand() * 2)} 3 ` }
  }
  dl(d, 80)
}

// 한옥 서점 · 북카페(2층)
stones(116, 486, 286, 300, 7, 11)
roof(148, 452, 74, 124, 46, 14)
lattice(178, 136, 54, 38, 6, 4); lattice(274, 136, 56, 38, 6, 4); lattice(372, 136, 54, 38, 6, 4)
m('M170 128 V182 M250 128 V182 M352 128 V182 M432 128 V182', 300)
m('M286 104 H318 V114 H286 Z', 302)
roof(124, 476, 186, 206, 32, 9, 5)
m('M136 214 V286 M222 214 V286 M314 214 V286 M398 214 V286 M466 214 V286', 300)
lattice(142, 222, 74, 58, 8, 5)
lattice(404, 222, 56, 58, 6, 5)
// 가운데 큰 창: 위는 창살, 아래는 열려 책장과 두 사람이 보인다
lattice(228, 220, 80, 16, 10, 2); lattice(320, 220, 72, 16, 9, 2)
m('M228 238 H392 V284 H228 Z', 310)
{
  let sh = 'M232 248 H388 M232 262 H388 '
  const rand = rng(21)
  for (const y of [238, 248]) { let x = 233; while (x < 386) { const w = 2 + rand() * 3; sh += `M${r1(x)} ${y + 9.5} V${r1(y + 2 + rand() * 3)} `; x += w + 0.8 } }
  dl(sh, 310)
}
// 테이블 · 책 · 찻잔, 마주 앉은 두 사람
fl('M276 272 H344 V276 H276 Z', 310, OCHRE, 0.6)
m('M272 272 H348 M282 276 V284 M338 276 V284', 310)
m('M296 271 L306 268 L316 271 M306 268 V271 M322 271 C322 267 330 267 330 271', 310)
seated(262, 284, 1, INDIGO); seated(358, 284, -1, RED)

// 가운데 — 뒤 한옥 지붕 둘 · 돌담 · 전봇대 · 여행자
roof(560, 720, 198, 228, 30, 9, 5)
roof(880, 1040, 192, 224, 30, 9, 5)
m('M520 244 H1090', 805)
fl('M520 236 L1090 236 L1094 244 L516 244 Z', 805, INK, 0.08)
dl(Array.from({ length: 95 }, (_, i) => `M${522 + i * 6} 237 V243`).join(' '), 805)
stones(520, 1090, 244, 300, 11, 33)
// 전봇대와 전선, 참새
m('M770 300 V118 M740 128 H800 M748 140 H792', 770)
dl('M744 124 v4 M796 124 v4 M752 136 v4 M788 136 v4', 770)
m('M486 150 Q628 176 744 128 M796 128 Q980 170 1170 146', 800)
dl('M488 160 Q630 186 752 140 M788 140 Q980 182 1168 156', 800)
const sparrow = (x: number, y: number) => `M${x} ${y} c-2 -5 4 -8 7 -5 l4 -1 l-3 2 c1 3 -1 6 -5 6 l-5 2 Z`
fl([sparrow(880, 147), sparrow(902, 151), sparrow(1012, 158)].join(' '), 950, INK, 0.85)

// 오른쪽 — 한옥 식당 · 굴뚝 · 청사초롱 · 파라솔 · 평상
stones(1110, 1540, 286, 300, 7, 41)
m('M1462 150 V112 H1482 V146', 1472)
dl('M1462 122 H1482 M1462 132 H1482 M1468 112 V122 M1476 122 V132 M1468 132 V142', 1472)
roof(1124, 1520, 150, 198, 46, 14)
m('M1136 208 V286 M1220 208 V286 M1312 208 V286 M1404 208 V286 M1506 208 V286', 1320)
lattice(1142, 216, 72, 64, 8, 6); lattice(1226, 216, 80, 64, 9, 6); lattice(1410, 216, 90, 64, 10, 6)
m('M1318 216 H1398 V286 H1318 Z', 1358)
dl('M1358 216 V286 M1322 230 H1394', 1358)
// 청사초롱
for (const lx of [1196, 1366, 1462]) {
  m(`M${lx} 206 V218`, lx)
  fl(`M${lx - 7} 222 C${lx - 8} 226 ${lx - 8} 228 ${lx - 7} 230 H${lx + 7} C${lx + 8} 228 ${lx + 8} 226 ${lx + 7} 222 Z`, lx, INDIGO, 0.85)
  fl(`M${lx - 7} 230 C${lx - 8} 234 ${lx - 7} 238 ${lx - 5} 240 H${lx + 5} C${lx + 7} 238 ${lx + 8} 234 ${lx + 7} 230 Z`, lx, RED, 0.85)
  m(`M${lx - 6} 218 H${lx + 6} V222 H${lx - 6} Z M${lx - 7} 222 C${lx - 9} 230 ${lx - 7} 238 ${lx - 5} 240 H${lx + 5} C${lx + 7} 238 ${lx + 9} 230 ${lx + 7} 222 M${lx - 4} 240 V243 H${lx + 4} V240 M${lx} 243 V248`, lx)
}
// 평상(황토빛 나무) · 다리
fl('M1176 268 L1440 268 L1456 280 L1192 280 Z', 1316, OCHRE, 0.35)
m('M1176 268 L1440 268 L1456 280 L1192 280 Z M1192 280 V285 H1456 V280 M1198 285 V300 M1450 285 V300 M1440 268 V272', 1316)
dl(Array.from({ length: 12 }, (_, i) => `M${1196 + i * 21} 268 L${1210 + i * 21} 280`).join(' '), 1316)
// 붉은 파라솔
m('M1316 268 V172', 1316)
fl('M1234 194 C1260 166 1290 156 1316 154 C1342 156 1372 166 1398 194 C1388 190 1378 192 1370 197 C1362 191 1350 191 1343 197 C1334 191 1324 191 1316 197 C1308 191 1298 191 1289 197 C1282 191 1270 191 1262 197 C1254 192 1244 190 1234 194 Z', 1316, RED, 0.82)
m('M1234 194 C1260 166 1290 156 1316 154 C1342 156 1372 166 1398 194 C1388 190 1378 192 1370 197 C1362 191 1350 191 1343 197 C1334 191 1324 191 1316 197 C1308 191 1298 191 1289 197 C1282 191 1270 191 1262 197 C1254 192 1244 190 1234 194', 1316)
dl('M1316 154 L1262 197 M1316 154 L1289 197 M1316 154 L1343 197 M1316 154 L1370 197', 1316)
// 소반 · 뚝배기 · 반찬 그릇 · 식사하는 사람들
fl('M1282 258 A34 6 0 1 0 1350 258 A34 6 0 1 0 1282 258 Z', 1316, OCHRE, 0.5)
m('M1282 258 A34 6 0 1 0 1350 258 A34 6 0 1 0 1282 258 M1290 262 V268 M1342 262 V268', 1316)
fl('M1302 256 C1302 248 1306 244 1310 244 H1322 C1326 244 1330 248 1330 256 Z', 1316, DARK_FILL, 0.75)
m('M1302 256 C1302 248 1306 244 1310 244 H1322 C1326 244 1330 248 1330 256 M1304 244 H1328', 1316)
fl('M1288 256 C1288 252 1296 252 1296 256 Z M1336 256 C1336 252 1344 252 1344 256 Z M1318 260 C1318 257 1326 257 1326 260 Z', 1316, OCHRE, 0.9)
m('M1287 256 H1297 M1335 256 H1345 M1317 260 H1327', 1316)
seated(1262, 268, 1, INDIGO); seated(1372, 268, -1, OCHRE, DARK_FILL)
// 낮잠 자는 고양이 — 평상 오른쪽 끝
m('M1416 268 C1414 260 1420 254 1430 254 C1438 254 1442 258 1442 262 L1446 256 L1446 263 C1446 266 1444 268 1440 268 M1416 268 C1410 268 1406 266 1408 262 C1410 260 1414 262 1416 264', 1430, PAPER)
dl('M1436 262 c1 1 3 1 4 0 M1424 258 c2 -2 6 -2 8 0 M1428 262 c2 -1 4 -1 6 0', 1430)

// 길 · 축대 · 개울 · 징검다리
m(`M0 ${GROUND} H${W}`, 800)
dl(Array.from({ length: 40 }, (_, i) => `M${20 + i * 40} ${GROUND + 2} l-6 4`).join(' '), 800)
stones(0, W, GROUND + 4, 336, 10, 55, false)
m('M0 336 H1600', 800)
for (const [cx, cy, rx] of [[660, 362, 16], [700, 372, 14], [742, 362, 15], [786, 372, 13], [828, 361, 15]] as const) {
  fl(`M${cx - rx} ${cy} A${rx} 5 0 1 0 ${cx + rx} ${cy} A${rx} 5 0 1 0 ${cx - rx} ${cy} Z`, cx, PAPER, 1)
  m(`M${cx - rx} ${cy} A${rx} 5 0 1 0 ${cx + rx} ${cy} A${rx} 5 0 1 0 ${cx - rx} ${cy} M${cx - rx + 2} ${cy + 2} C${cx - rx / 2} ${cy + 6} ${cx + rx / 2} ${cy + 6} ${cx + rx - 2} ${cy + 2}`, cx)
}

// 물결(따로 그려 흐르게 한다)
const waves = (() => {
  const rand = rng(91)
  let d = ''
  for (let row = 0; row < 7; row++) {
    const y = 344 + row * 7.5
    let x = -60 + rand() * 30
    while (x < W + 60) {
      const w = 18 + rand() * 26
      d += `M${r1(x)} ${r1(y)} q${r1(w / 4)} -2.4 ${r1(w / 2)} 0 t${r1(w / 2)} 0 `
      x += w + 8 + rand() * 18
    }
  }
  return d
})()

const STEAM = ['M1310 240 C1304 230 1316 222 1310 212 C1306 204 1312 198 1310 190', 'M1322 240 C1316 228 1328 220 1322 208 C1318 200 1324 194 1322 186']
const SMOKE = ['M1472 108 C1464 96 1480 88 1472 74 C1466 62 1478 54 1474 42', 'M1478 108 C1488 94 1474 84 1484 70 C1492 58 1482 48 1488 38']

/* ── 걷는 여행자: 백팩(인디고) · 카메라 ─────────────────────────── */
function Traveler(): ReactNode {
  return (
    <g className="hp-walker">
      <g className="hp-bob">
        <path className="hp-f" d="M-6 -44 C-14 -42 -16 -30 -14 -22 L-4 -22 L-2 -40 Z" style={{ fill: INDIGO, fillOpacity: 0.9 }} />
        <path className="hp-f" d="M-4 -44 C-2 -40 4 -40 6 -44 L8 -22 L-6 -22 Z" style={{ fill: OCHRE, fillOpacity: 0.55 }} />
        <path className="hp-m" d="M-6 -44 C-14 -42 -16 -30 -14 -22 L-4 -22 M-4 -44 C-2 -40 4 -40 6 -44 L8 -22 L-6 -22 Z" />
        <circle className="hp-m" cx="1" cy="-50" r="5" style={{ fill: PAPER }} />
        <path className="hp-f" d="M-4 -52 C-4 -57 5 -58 6 -52 C3 -54 -1 -54 -4 -51 Z" style={{ fill: DARK_FILL }} />
        <path className="hp-m" d="M-2 -43 L8 -30 M6 -32 h5 v4 h-5 Z M8 -36 L14 -28" />
      </g>
      <path className="hp-m hp-leg-a" d="M0 -22 L-4 -10 L-6 0" />
      <path className="hp-m hp-leg-b" d="M2 -22 L5 -10 L8 0" />
    </g>
  )
}

/* ── 렌더 ──────────────────────────────────────────────────────── */

const HERITAGE_LABEL = 'A pen drawing of a Korean street: a hanok bookshop café, an alley with a stone wall under N Seoul Tower, and a hanok restaurant with diners on a wooden platform beside a stream'
const CULTURE_LABEL = 'A pen drawing of K-culture: a drama crew filming actors in hanbok before a palace gate, a crowd waving light sticks at an outdoor concert under N Seoul Tower, and a red-carpet premiere outside a cinema with photographers'

function HeritageScene() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" role="img" aria-label={HERITAGE_LABEL} focusable="false">
      <g className="hp-cloud">
        <path className="hp-d hp-draw" d={CLOUD_A} pathLength={1} vectorEffect="non-scaling-stroke" style={{ '--s': delay(600, 0.2) } as CSSProperties} />
        <path className="hp-d hp-draw" d={CLOUD_B} pathLength={1} vectorEffect="non-scaling-stroke" style={{ '--s': delay(1040, 0.2) } as CSSProperties} />
      </g>
      <InkParts parts={parts} drawIn />
      <g className="hp-fade" style={{ '--s': '1.6s' } as CSSProperties}>
        <g className="hp-water"><path className="hp-d" d={waves} vectorEffect="non-scaling-stroke" /></g>
      </g>
      {STEAM.map((d, i) => <path key={d} className="hp-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${3 + i * 1.2}s` } as CSSProperties} />)}
      {SMOKE.map((d, i) => <path key={d} className="hp-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${3.4 + i * 1.5}s` } as CSSProperties} />)}
      <Traveler />
    </svg>
  )
}

export function HomePanorama() {
  return (
    <div className="hp" role="group" aria-label="Pen-drawn panorama of Korea, alternating between heritage and K-culture scenes">
      <style>{`
        /* 검은 히어로 배너 안쪽 하단. 색 변수(--line …)는 .hero 에서 받는다 */
        .hp { position: relative; }
        .hp-inner { max-width: 1240px; margin: 0 auto; padding: 4px 12px 0; }
        .hp-stagewrap { position: relative; }
        /* 좌우 끝은 검정으로 스며들게 — 잘린 경계선이 보이지 않는다 */
        .hp-scroll { overflow: hidden; }
        /* 데스크톱: 원래 비율(4:1) 그대로, 높이 상한 260px → 폭 최대 1040px 가운데. 좌우 끝은 마스크로 검정에 녹인다 */
        .hp-stage {
          width: min(100%, var(--hp-w, 1040px)); margin: 0 auto;
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
                  mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
        }
        .hp svg { display: block; width: 100%; height: auto; }
        .hp path, .hp circle { stroke-linecap: round; stroke-linejoin: round; }
        .hp-m { fill: none; stroke: ${INK}; stroke-width: 1.2; }
        .hp-d { fill: none; stroke: ${INK}; stroke-width: .6; stroke-opacity: var(--line-muted-opacity, .42); }
        .hp-f { stroke: none; }

        /* 두 장면을 한 칸에 겹친다 */
        .hp-stage { display: grid; }
        .hp-scene { grid-area: 1 / 1; opacity: 0; transition: opacity 1.6s cubic-bezier(.4,0,.2,1); pointer-events: none; }
        .hp-scene[data-on="true"] { opacity: 1; }
        .hp-scene[data-on="false"] * { animation-play-state: paused !important; }

        .hp-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hp-draw 1.1s cubic-bezier(.45,.05,.3,1) var(--s) forwards; }
        @keyframes hp-draw { to { stroke-dashoffset: 0; } }
        .hp-fade { opacity: 0; animation: hp-fade .9s ease var(--s) forwards; }
        @keyframes hp-fade { to { opacity: 1; } }

        .hp-cloud { animation: hp-cloud 26s ease-in-out 3s infinite alternate; }
        @keyframes hp-cloud { to { translate: 34px 0; } }
        .hp-water { animation: hp-water 14s linear infinite; }
        @keyframes hp-water { to { translate: 60px 0; } }
        .hp-steam { fill: none; stroke: ${INK}; stroke-width: .7; stroke-opacity: .55; opacity: 0; transform-box: fill-box; transform-origin: center bottom;
          animation: hp-steam 3.2s ease-in-out var(--s) infinite; }
        @keyframes hp-steam { 0% { opacity: 0; transform: translateY(6px) scaleY(.9); } 35% { opacity: 1; } 100% { opacity: 0; transform: translateY(-8px) scaleY(1.05); } }
        .hp-walker { animation: hp-walk 34s linear 3s infinite; translate: 560px ${GROUND}px; opacity: 0; }
        @keyframes hp-walk {
          0% { translate: 560px ${GROUND}px; opacity: 0; } 4% { opacity: 1; }
          94% { opacity: 1; } 100% { translate: 1040px ${GROUND}px; opacity: 0; }
        }
        .hp-bob { animation: hp-bob .9s ease-in-out infinite; }
        @keyframes hp-bob { 50% { translate: 0 -1px; } }
        .hp-leg-a, .hp-leg-b { transform-box: fill-box; transform-origin: top center; animation: hp-step .9s ease-in-out infinite; }
        .hp-leg-b { animation-delay: -.45s; }
        @keyframes hp-step { 0%, 100% { rotate: 14deg; } 50% { rotate: -14deg; } }

        /* K-컬처 장면의 루프 */
        .hc-beam { transform-box: view-box; animation: hc-beam 5.5s ease-in-out infinite alternate; }
        .hc-beam-l { transform-origin: 704px 150px; }
        .hc-beam-r { transform-origin: 916px 150px; animation-delay: -2.7s; animation-direction: alternate-reverse; }
        .hc-beam-line { fill: none; stroke: ${INK}; stroke-width: .6; stroke-opacity: .45; }
        @keyframes hc-beam { 0% { rotate: -5deg; opacity: .55; } 50% { opacity: 1; } 100% { rotate: 6deg; opacity: .7; } }
        .hc-spot { fill-opacity: .14; animation: hc-spot 2.6s ease-in-out infinite alternate; }
        @keyframes hc-spot { from { fill-opacity: .06; } to { fill-opacity: .2; } }
        .hc-singer { animation: hp-bob 1.1s ease-in-out infinite; }
        .hc-stick { fill: none; stroke: ${RED}; stroke-width: 2.2; transform-box: fill-box; transform-origin: center bottom;
          animation: hc-stick 1.6s ease-in-out infinite; }
        @keyframes hc-stick { 0%, 100% { rotate: -16deg; } 50% { rotate: 16deg; } }
        .hc-crane { transform-box: view-box; transform-origin: 156px 300px; animation: hc-crane 9s ease-in-out infinite alternate; }
        @keyframes hc-crane { from { rotate: -2.5deg; } to { rotate: 3deg; } }
        .hc-flash { opacity: 0; animation: hc-flash 4.1s linear infinite; }
        @keyframes hc-flash { 0%, 100% { opacity: 0; } 2% { opacity: 1; } 9% { opacity: 0; } }
        .hc-bulb { fill-opacity: .25; animation: hc-bulb 1.2s steps(1) infinite; }
        .hc-bulb-b { animation-delay: -.6s; }
        @keyframes hc-bulb { 0% { fill-opacity: .9; } 50% { fill-opacity: .2; } }
        .hc-neon { fill: none; stroke: ${INK}; stroke-width: .8; animation: hc-neon 6s linear infinite; }
        @keyframes hc-neon { 0%, 61%, 64%, 67%, 100% { stroke-opacity: .85; } 62%, 66% { stroke-opacity: .15; } }

        /* 폰: 그대로 줄이면 선이 뭉개져서 높이를 정하고 가운데 · 아래쪽만 보이게 자른다(xMidYMax slice) */
        @media (max-width: 767px) {
          .hp-inner { padding: 6px 0 0; }
          .hp svg { height: 156px; }
          .hp-stage {
            width: 100%;
            -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
                    mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hp-draw { animation: none; stroke-dashoffset: 0; }
          .hp-fade { animation: none; opacity: 1; }
          .hp-cloud, .hp-water, .hp-bob, .hp-leg-a, .hp-leg-b { animation: none; }
          .hp-steam { animation: none; opacity: .6; }
          .hp-walker { animation: none; opacity: 1; translate: 820px ${GROUND}px; }
          .hc-beam, .hc-spot, .hc-singer, .hc-stick, .hc-crane, .hc-bulb, .hc-neon { animation: none; }
          .hc-flash { animation: none; opacity: 0; }
          .hp-scene { transition-duration: .01s; }
        }
      `}</style>
      <div className="hp-inner">
        <PanoramaStage heritage={<HeritageScene />} culture={<CultureScene label={CULTURE_LABEL} />} />
      </div>
    </div>
  )
}
