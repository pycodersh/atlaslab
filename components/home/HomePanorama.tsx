import type { CSSProperties, ReactNode } from 'react'

/**
 * 홈 히어로 아래 — 한 폭의 거리 펜화: 한국어(한옥 서점 · 북카페) → 여행(골목 · 돌담 · 남산) → 음식(한옥 식당 · 평상).
 * 아래로 돌 축대와 개울(청계천 느낌)이 화면을 가로지른다. 글자 · 라벨은 없다.
 *
 * 선:  m 외곽 1.2px 먹색 #262422  ·  d 기와골 · 창살 · 돌 · 물결 0.6px
 * 채색: 붉은 파라솔 · 청사초롱 · 인물 옷 · 나무 평상과 그릇에만 딥 레드 / 인디고 / 황토를 옅게.
 * 움직임: 처음에 외곽선이 왼쪽부터 그려지고(세밀선 · 채색은 뒤따라 스며듦),
 *        그 뒤 구름 · 물결이 천천히 흐르고, 뚝배기 · 굴뚝 김이 피어오르고, 여행자가 골목을 걷는다.
 * JS 없이 CSS 만 쓴다(서버 컴포넌트). 움직임 줄이기 설정이면 완성된 그림이 멈춰 보인다.
 */

const W = 1600, H = 400
const PAPER = '#F7F5EE'
const INK = '#262422'
const RED = '#9E2B25'
const INDIGO = '#2F3B5C'
const OCHRE = '#B5874A'
const GROUND = 300            // 길 높이

/* ── 작은 도구 ─────────────────────────────────────────────────── */
const r1 = (n: number) => Math.round(n * 10) / 10
function rng(seed: number) {   // 결정적 난수 — 서버 · 클라이언트가 같은 그림을 그린다
  let s = seed >>> 0
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
type Part = { k: 'm' | 'd' | 'f'; d: string; x: number; fill?: string; op?: number; sw?: number }
const parts: Part[] = []
const m = (d: string, x: number, fill?: string) => parts.push({ k: 'm', d, x, fill })
const dl = (d: string, x: number) => parts.push({ k: 'd', d, x })
const fl = (d: string, x: number, fill: string, op = 0.85) => parts.push({ k: 'f', d, x, fill, op })

/** 팔작지붕: 용마루 · 처마 끝이 들린 곡선 · 아래 처마선 · 기와골 · 서까래 끝 */
function roof(x0: number, x1: number, yR: number, yE: number, over: number, lift: number, step = 6) {
  const inset = (x1 - x0) * 0.2
  const rl = x0 + inset, rr = x1 - inset
  const tl = x0 - over, tr = x1 + over, ty = yE - lift
  const out = `M${rl} ${yR} L${rr} ${yR} C${rr + (tr - rr) * 0.35} ${yR + (yE - yR) * 0.75} ${tr - over * 0.5} ${yE} ${tr} ${ty} ` +
    `C${tr - over * 0.4} ${yE + 6} ${x1 - 6} ${yE + 5} ${x1 - 20} ${yE + 4} L${x0 + 20} ${yE + 4} ` +
    `C${x0 + 6} ${yE + 5} ${tl + over * 0.4} ${yE + 6} ${tl} ${ty} C${tl + over * 0.5} ${yE} ${rl - (rl - tl) * 0.35} ${yR + (yE - yR) * 0.75} ${rl} ${yR} Z`
  m(out, (x0 + x1) / 2, PAPER)
  // 용마루 덮개(두 줄) + 양끝 치미
  m(`M${rl - 4} ${yR - 4} L${rr + 4} ${yR - 4} M${rl - 4} ${yR - 4} C${rl - 10} ${yR - 8} ${rl - 12} ${yR - 14} ${rl - 8} ${yR - 18} M${rr + 4} ${yR - 4} C${rr + 10} ${yR - 8} ${rr + 12} ${yR - 14} ${rr + 8} ${yR - 18}`, (x0 + x1) / 2)
  dl(`M${rl - 2} ${yR - 2} L${rr + 2} ${yR - 2}`, (x0 + x1) / 2)
  // 기와골 — 용마루에서 처마로, 양끝은 바깥으로 펼쳐진다
  let ribs = ''
  for (let x = rl + step / 2; x < rr; x += step) {
    const t = (x - rl) / (rr - rl)
    const ex = x0 + 18 + t * (x1 - x0 - 36)
    ribs += `M${r1(x)} ${yR + 1} C${r1(x)} ${r1(yR + (yE - yR) * 0.5)} ${r1(ex)} ${r1(yE - 6)} ${r1(ex)} ${yE + 2} `
  }
  // 합각 쪽 기와골(처마 끝으로 휘어 나간다)
  for (let i = 1; i <= 5; i++) {
    const t = i / 6
    ribs += `M${r1(rl - (rl - x0 - 10) * t)} ${r1(yR + (yE - yR) * t * 0.9)} L${r1(x0 + 16 - t * 8)} ${yE + 2} `
    ribs += `M${r1(rr + (x1 - 10 - rr) * t)} ${r1(yR + (yE - yR) * t * 0.9)} L${r1(x1 - 16 + t * 8)} ${yE + 2} `
  }
  dl(ribs, (x0 + x1) / 2)
  // 서까래 끝(처마 밑 작은 원)
  let raft = ''
  for (let x = x0 + 24; x < x1 - 20; x += 9) raft += `M${x - 1.6} ${yE + 8} a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 `
  dl(raft + ` M${x0 + 20} ${yE + 11} L${x1 - 20} ${yE + 11}`, (x0 + x1) / 2)
}

/** 띠살 · 격자 창호 */
function lattice(x: number, y: number, w: number, h: number, cols: number, rows: number) {
  m(`M${x} ${y} H${x + w} V${y + h} H${x} Z`, x)
  let d = `M${x + 2} ${y + 2} H${x + w - 2} V${y + h - 2} H${x + 2} Z `
  for (let i = 1; i < cols; i++) d += `M${r1(x + (w * i) / cols)} ${y + 2} V${y + h - 2} `
  for (let j = 1; j < rows; j++) d += `M${x + 2} ${r1(y + (h * j) / rows)} H${x + w - 2} `
  dl(d, x)
}

/** 돌담 · 축대 — 결정적 난수로 고르지 않은 돌 */
function stones(x0: number, x1: number, y0: number, y1: number, rowH: number, seed: number, mainTop = true) {
  const rand = rng(seed)
  let d = ''
  for (let y = y0; y < y1 - 2; y += rowH) {
    let x = x0 + (Math.floor((y - y0) / rowH) % 2 ? rand() * 10 : 0)
    while (x < x1 - 6) {
      const w = 14 + rand() * 18, h = Math.min(rowH - 2, y1 - y - 2)
      const xe = Math.min(x + w, x1 - 2)
      d += `M${r1(x + 3)} ${r1(y + 1.5)} L${r1(xe - 3)} ${r1(y + 1 + rand())} Q${r1(xe)} ${r1(y + 2)} ${r1(xe - 0.5)} ${r1(y + h / 2)} Q${r1(xe)} ${r1(y + h - 1)} ${r1(xe - 3)} ${r1(y + h)} L${r1(x + 3)} ${r1(y + h - rand())} Q${r1(x)} ${r1(y + h - 1)} ${r1(x + 0.5)} ${r1(y + h / 2)} Q${r1(x)} ${r1(y + 2)} ${r1(x + 3)} ${r1(y + 1.5)} `
      x = xe + 1.5
    }
  }
  dl(d, (x0 + x1) / 2)
  if (mainTop) m(`M${x0} ${y0} H${x1}`, (x0 + x1) / 2)
}

/** 앉은 사람(옆모습) — dir 1 오른쪽을 본다 */
function seated(x: number, y: number, dir: 1 | -1, cloth: string, hair = INK) {
  const s = (v: number) => x + v * dir
  fl(`M${s(-7)} ${y - 26} C${s(-9)} ${y - 14} ${s(-9)} ${y - 4} ${s(-6)} ${y} L${s(12)} ${y} C${s(14)} ${y - 4} ${s(10)} ${y - 8} ${s(6)} ${y - 10} C${s(4)} ${y - 18} ${s(4)} ${y - 24} ${s(2)} ${y - 28} Z`, x, cloth)
  m(`M${s(-7)} ${y - 26} C${s(-9)} ${y - 14} ${s(-9)} ${y - 4} ${s(-6)} ${y} L${s(12)} ${y} C${s(14)} ${y - 4} ${s(10)} ${y - 8} ${s(6)} ${y - 10} C${s(4)} ${y - 18} ${s(4)} ${y - 24} ${s(2)} ${y - 28}`, x)
  // 머리 · 팔
  m(`M${s(-2.5)} ${y - 31} a5.5 5.5 0 1 0 0.1 0`, x, PAPER)
  fl(`M${s(-6)} ${y - 34} C${s(-6)} ${y - 41} ${s(4)} ${y - 42} ${s(4)} ${y - 35} C${s(1)} ${y - 37} ${s(-3)} ${y - 36} ${s(-6)} ${y - 32} Z`, x, hair, 0.9)
  m(`M${s(0)} ${y - 22} C${s(5)} ${y - 16} ${s(10)} ${y - 14} ${s(16)} ${y - 15}`, x)
}

/* ════ 그림 ════════════════════════════════════════════════════ */

// 하늘 — 먼 능선과 남산서울타워, 소용돌이 구름
dl('M470 214 C540 176 610 160 680 146 C740 132 800 106 852 106 C910 108 980 136 1050 156 C1100 170 1150 178 1200 184', 800)
dl('M600 166 C660 150 720 140 760 128 M940 124 C1000 140 1060 156 1120 168 ' +
  Array.from({ length: 22 }, (_, i) => { const x = 620 + i * 24; const y = x < 852 ? 214 - (x - 470) * 0.28 : 106 + (x - 852) * 0.22; return `M${x} ${r1(y + 6)} l-5 9` }).join(' '), 800)
m('M842 108 L846 62 M856 108 L852 62 M836 62 H862 L858 54 H840 Z M842 54 V44 H856 V54 M849 44 V14', 849)
dl('M846 70 H852 M845 80 H853 M844 90 H854 M845 100 H853', 849)
const CLOUD_A = 'M560 70 C566 56 588 52 596 62 C602 70 594 78 586 74 C580 70 584 64 590 66 M596 62 C606 50 628 52 632 64 C636 74 624 80 618 72 M560 70 H520 M632 64 C650 64 668 66 700 66 M548 78 H640'
const CLOUD_B = 'M1010 52 C1016 38 1040 34 1048 46 C1054 56 1044 62 1036 58 C1030 54 1036 48 1042 50 M1048 46 C1060 36 1080 40 1082 52 C1084 62 1072 66 1068 58 M1010 52 H970 M1082 52 H1150 M1000 60 H1090'

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
fl('M1302 256 C1302 248 1306 244 1310 244 H1322 C1326 244 1330 248 1330 256 Z', 1316, '#5A4636', 0.75)
m('M1302 256 C1302 248 1306 244 1310 244 H1322 C1326 244 1330 248 1330 256 M1304 244 H1328', 1316)
fl('M1288 256 C1288 252 1296 252 1296 256 Z M1336 256 C1336 252 1344 252 1344 256 Z M1318 260 C1318 257 1326 257 1326 260 Z', 1316, OCHRE, 0.9)
m('M1287 256 H1297 M1335 256 H1345 M1317 260 H1327', 1316)
seated(1262, 268, 1, INDIGO); seated(1372, 268, -1, OCHRE, '#3B2F28')
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
        <path className="hp-f" d="M-4 -52 C-4 -57 5 -58 6 -52 C3 -54 -1 -54 -4 -51 Z" style={{ fill: INK }} />
        <path className="hp-m" d="M-2 -43 L8 -30 M6 -32 h5 v4 h-5 Z M8 -36 L14 -28" />
      </g>
      <path className="hp-m hp-leg-a" d="M0 -22 L-4 -10 L-6 0" />
      <path className="hp-m hp-leg-b" d="M2 -22 L5 -10 L8 0" />
    </g>
  )
}

/* ── 렌더 ──────────────────────────────────────────────────────── */
const delay = (x: number, base: number) => `${(base + (x / W) * 2.4).toFixed(2)}s`

export function HomePanorama() {
  return (
    <section className="hp" aria-label="A pen drawing of a Korean street: a hanok bookshop café, an alley with a stone wall under N Seoul Tower, and a hanok restaurant with diners on a wooden platform beside a stream">
      <style>{`
        .hp { background: ${PAPER}; border-bottom: 1px solid #E6E1D6; }
        .hp-inner { max-width: 1240px; margin: 0 auto; padding: 18px 12px 10px; }
        .hp-scroll { overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }
        .hp-scroll::-webkit-scrollbar { display: none; }
        .hp svg { display: block; width: 100%; height: auto; min-width: 860px; }
        .hp path, .hp circle { stroke-linecap: round; stroke-linejoin: round; }
        .hp-m { fill: none; stroke: ${INK}; stroke-width: 1.2; }
        .hp-d { fill: none; stroke: ${INK}; stroke-width: .6; stroke-opacity: .75; }
        .hp-f { stroke: none; }

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

        @media (max-width: 767px) { .hp-inner { padding: 12px 0 6px; } }
        @media (prefers-reduced-motion: reduce) {
          .hp-draw { animation: none; stroke-dashoffset: 0; }
          .hp-fade { animation: none; opacity: 1; }
          .hp-cloud, .hp-water, .hp-bob, .hp-leg-a, .hp-leg-b { animation: none; }
          .hp-steam { animation: none; opacity: .6; }
          .hp-walker { animation: none; opacity: 1; translate: 820px ${GROUND}px; }
        }
      `}</style>
      <div className="hp-inner">
        <div className="hp-scroll">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden="false" focusable="false">
            <g className="hp-cloud">
              <path className="hp-d hp-draw" d={CLOUD_A} pathLength={1} vectorEffect="non-scaling-stroke" style={{ '--s': delay(600, 0.2) } as CSSProperties} />
              <path className="hp-d hp-draw" d={CLOUD_B} pathLength={1} vectorEffect="non-scaling-stroke" style={{ '--s': delay(1040, 0.2) } as CSSProperties} />
            </g>
            {parts.map((p, i) => p.k === 'm' ? (
              <path key={i} className="hp-m hp-draw" d={p.d} pathLength={1} vectorEffect="non-scaling-stroke"
                style={{ '--s': delay(p.x, 0), fill: p.fill ?? 'none' } as CSSProperties} />
            ) : p.k === 'd' ? (
              <path key={i} className="hp-d hp-fade" d={p.d} vectorEffect="non-scaling-stroke" style={{ '--s': delay(p.x, 0.7) } as CSSProperties} />
            ) : (
              <path key={i} className="hp-f hp-fade" d={p.d} style={{ '--s': delay(p.x, 1.1), fill: p.fill, fillOpacity: p.op } as CSSProperties} />
            ))}
            <g className="hp-fade" style={{ '--s': '1.6s' } as CSSProperties}>
              <g className="hp-water"><path className="hp-d" d={waves} vectorEffect="non-scaling-stroke" /></g>
            </g>
            {STEAM.map((d, i) => <path key={d} className="hp-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${3 + i * 1.2}s` } as CSSProperties} />)}
            {SMOKE.map((d, i) => <path key={d} className="hp-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${3.4 + i * 1.5}s` } as CSSProperties} />)}
            <Traveler />
          </svg>
        </div>
      </div>
    </section>
  )
}
