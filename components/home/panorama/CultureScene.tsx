import type { CSSProperties } from 'react'
import {
  W, H, PAPER, INK, RED, INDIGO, OCHRE, GROUND, r1, rng, circ, createInk, InkParts,
  RIDGE, RIDGE_HATCH, TOWER, TOWER_D, CLOUD_A, CLOUD_B,
} from './ink'

/**
 * 두 번째 장면 — K-컬처: 궁궐 앞 드라마 촬영(왼쪽) → 남산 아래 야외 콘서트(가운데) → 영화관 레드카펫(오른쪽).
 * 첫 장면과 같은 종이 · 먹선 · 딥 레드 규칙. 빨강은 한복 · 파라솔 · 레드카펫 · 야광봉에만.
 * 움직임: 크레인 팔이 천천히 흔들리고, 무대 빔이 일렁이고, 야광봉이 흔들리고, 플래시가 터지고, 연기가 피어오른다.
 * 처음엔 숨어 있다가 크로스페이드로 나타나므로 선 그리기 등장 연출은 없다.
 */

/* 붓 네 벌: 뒤 배경 · 무대 위 가수 · 앞 전경 · 움직이는 크레인 팔 */
const bg = createInk(), singer = createInk(), fg = createInk(), crane = createInk()

type Kind = 'hanbok' | 'dopo' | 'parka' | 'suit' | 'gown'
/** 선 사람(발끝 x,y). dir 1 이면 오른쪽을 본다. 덧그릴 수 있게 좌표 함수 P 를 돌려준다. */
function figure(ink: ReturnType<typeof createInk>, x: number, y: number, kind: Kind, cloth: string, s = 1, dir: 1 | -1 = 1) {
  const P = (dx: number, dy: number) => `${r1(x + dx * s * dir)} ${r1(y + dy * s)}`
  const { m, dl, fl } = ink
  const headY = kind === 'hanbok' || kind === 'gown' ? -40 : -41
  if (kind === 'hanbok') {
    const skirt = `M${P(-4, -25)} C${P(-8, -15)} ${P(-12, -5)} ${P(-13, 0)} L${P(13, 0)} C${P(12, -5)} ${P(8, -15)} ${P(4, -25)} Z`
    fl(skirt, x, cloth, 0.85); m(skirt, x)
    dl(`M${P(-6, -8)} C${P(-3, -6)} ${P(3, -6)} ${P(6, -8)} M${P(-2, -24)} L${P(-5, 0)} M${P(3, -24)} L${P(6, 0)}`, x)
    m(`M${P(-5, -35)} L${P(5, -35)} L${P(6, -24)} L${P(-6, -24)} Z`, x, PAPER)
    fl(`M${P(1, -31)} L${P(2.5, -22)} L${P(4.5, -23)} Z`, x, RED, 0.9)
    dl(`M${P(-3, -35)} L${P(1, -30)} L${P(3, -35)}`, x)
    m(`M${P(4, -33)} C${P(8, -28)} ${P(8, -24)} ${P(5, -20)}`, x)
  } else if (kind === 'dopo') {
    const robe = `M${P(-6, -35)} L${P(6, -35)} L${P(9, 0)} L${P(-9, 0)} Z`
    fl(robe, x, cloth, 0.85); m(robe, x)
    dl(`M${P(-6, -22)} L${P(7, -22)} M${P(0, -35)} L${P(1, 0)}`, x)
    m(`M${P(5, -33)} C${P(9, -27)} ${P(9, -22)} ${P(6, -19)}`, x)
  } else if (kind === 'parka') {
    const body = `M${P(-8, -36)} C${P(-11, -28)} ${P(-11, -18)} ${P(-9, -14)} L${P(9, -14)} C${P(11, -18)} ${P(11, -28)} ${P(8, -36)} Z`
    fl(body, x, cloth, 0.4); m(body, x)
    dl(`M${P(-10, -28)} L${P(10, -28)} M${P(-10, -21)} L${P(10, -21)} M${P(0, -36)} L${P(0, -14)}`, x)
    m(`M${P(-4, -14)} L${P(-5, 0)} M${P(4, -14)} L${P(5, 0)} M${P(-7, 0)} L${P(-3, 0)} M${P(3, 0)} L${P(7, 0)}`, x)
    m(`M${P(-6, -37)} C${P(-9, -48)} ${P(8, -49)} ${P(6, -37)}`, x)
  } else if (kind === 'suit') {
    const jacket = `M${P(-7, -35)} L${P(7, -35)} L${P(7, -16)} L${P(-7, -16)} Z`
    fl(jacket, x, cloth, 0.85); m(jacket, x)
    fl(`M${P(-2, -35)} L${P(0, -28)} L${P(2, -35)} Z`, x, PAPER, 1)
    m(`M${P(-3, -16)} L${P(-4, 0)} M${P(3, -16)} L${P(4, 0)} M${P(-6, 0)} L${P(-2, 0)} M${P(2, 0)} L${P(6, 0)}`, x)
  } else {
    const dress = `M${P(-5, -35)} L${P(5, -35)} L${P(6, -22)} C${P(8, -12)} ${P(12, -4)} ${P(17, 0)} L${P(-10, 0)} C${P(-8, -10)} ${P(-6, -20)} ${P(-6, -22)} Z`
    fl(dress, x, cloth, 0.85); m(dress, x)
    dl(`M${P(-2, -20)} C${P(-3, -10)} ${P(-4, -4)} ${P(-5, 0)} M${P(3, -20)} C${P(5, -10)} ${P(9, -4)} ${P(12, 0)}`, x)
  }
  // 머리
  m(circ(x, y + headY * s, 4.6 * s), x, PAPER)
  if (kind === 'parka') fl(`M${P(-4.6, headY - 1)} C${P(-4, headY - 7)} ${P(4, headY - 7)} ${P(4.6, headY - 1)} Z`, x, INK, 0.85)
  else if (kind === 'dopo') {
    fl(`M${P(-3.2, headY - 3)} L${P(-2.8, headY - 10)} L${P(2.8, headY - 10)} L${P(3.2, headY - 3)} Z`, x, INK, 0.9)
    m(`M${P(-9, headY - 3)} L${P(9, headY - 3)}`, x)
  } else if (kind === 'gown') {
    fl(`M${P(-4.6, headY)} C${P(-5, headY - 7)} ${P(5, headY - 7)} ${P(4.6, headY - 1)} C${P(2, headY - 3)} ${P(-1, headY - 3)} ${P(-3, headY)} C${P(-4, headY + 5)} ${P(-5, headY + 9)} ${P(-7, headY + 11)} C${P(-7, headY + 6)} ${P(-6, headY + 3)} ${P(-4.6, headY)} Z`, x, INK, 0.9)
  } else {
    fl(`M${P(-4.6, headY)} C${P(-4.6, headY - 7)} ${P(4.6, headY - 7)} ${P(4.6, headY - 1)} C${P(2, headY - 3)} ${P(-2, headY - 3)} ${P(-4.6, headY + 1)} Z`, x, INK, 0.9)
    if (kind === 'hanbok') fl(circ(x - 5 * s * dir, y + (headY + 1) * s, 2.2 * s), x, INK, 0.9)
  }
  return P
}

/** 군중 한 사람(머리 + 어깨). 손을 들면 손끝 좌표를 돌려준다. */
function crowdPerson(x: number, y: number, s: number, rand: () => number) {
  const sh = `M${r1(x - 5 * s)} ${r1(y + 10 * s)}v${r1(-7 * s)}c0 ${r1(-3.5 * s)} ${r1(10 * s)} ${r1(-3.5 * s)} ${r1(10 * s)} 0v${r1(7 * s)}z`
  const hr = r1(2.6 * s)   // 머리: 한 번의 호로 거의 닫히는 원(짧은 경로)
  let d = sh + `M${r1(x - hr)} ${r1(y - 3.6 * s)}a${hr} ${hr} 0 1 0 .1 0`
  const hands: [number, number][] = []
  const r = rand()
  if (r < 0.22) {        // 두 팔 만세
    d += `M${r1(x - 4 * s)} ${r1(y + 2 * s)}l${r1(-2.5 * s)} ${r1(-9 * s)}M${r1(x + 4 * s)} ${r1(y + 2 * s)}l${r1(2.5 * s)} ${r1(-9 * s)}`
    hands.push([x - 6.5 * s, y - 7 * s], [x + 6.5 * s, y - 7 * s])
  } else if (r < 0.42) { // 한 팔
    const side = rand() < 0.5 ? -1 : 1
    d += `M${r1(x + 4 * side * s)} ${r1(y + 2 * s)}l${r1(1.5 * side * s)} ${r1(-10 * s)}`
    hands.push([x + 5.5 * side * s, y - 8 * s])
  }
  return { d, hands }
}

/* ════ 하늘 ════════════════════════════════════════════════════ */
bg.dl(RIDGE, 800); bg.dl(RIDGE_HATCH, 800)
bg.m(TOWER, 849); bg.dl(TOWER_D, 849)

/* ════ 왼쪽 — 궁궐 · 담장 · 드라마 촬영장 ═══════════════════════ */
{
  const { m, dl, fl, roof, lattice, stones } = bg
  // 소나무
  m('M24 238 C30 206 22 176 36 142 M30 196 C40 186 52 182 60 172', 30)
  dl('M10 150 C18 138 40 134 52 144 C60 150 48 158 36 154 M20 176 C30 166 56 166 66 176 C70 182 56 186 46 182 M2 196 C10 188 28 188 34 196', 30)
  // 정전: 겹지붕 · 창호 · 월대
  roof(120, 300, 46, 82, 34, 12, 5)
  m('M128 94 V112 M292 94 V112', 210)
  lattice(136, 96, 148, 14, 16, 2)
  roof(70, 350, 116, 138, 34, 10, 5)
  m('M84 150 V200 M140 150 V200 M210 150 V200 M280 150 V200 M336 150 V200', 210)
  lattice(90, 156, 44, 40, 5, 4); lattice(146, 156, 58, 40, 6, 4); lattice(216, 156, 58, 40, 6, 4); lattice(286, 156, 44, 40, 5, 4)
  stones(50, 370, 200, 236, 8, 13)
  // 궁궐 담장(기와 지붕 · 돌)과 문
  fl('M0 236 L560 236 L564 244 L-4 244 Z', 280, INK, 0.08)
  dl(Array.from({ length: 93 }, (_, i) => `M${2 + i * 6} 237 V243`).join(' '), 280)
  stones(0, 560, 244, 286, 10, 29)
  m('M0 286 H560', 280)
  roof(420, 520, 206, 228, 18, 7, 5)
  m('M432 240 V286 M508 240 V286', 470)
  m('M444 244 H496 V286 H444 Z', 470, PAPER)
  dl('M470 244 V286 M448 252 H492 M448 278 H492 ' + [452, 460, 480, 488].map((x) => `M${x} 264 h0.1`).join(' '), 470)
  // 마당 박석
  dl('M0 314 H548 M0 338 H522 M0 366 H490 M60 300 L52 314 M180 300 L176 314 M300 300 L298 314 M420 300 L422 314 M120 314 L110 338 M260 314 L256 338 M400 314 L402 338 M60 338 L44 366 M220 338 L212 366 M370 338 L368 366', 280)
}

/* ════ 가운데 — 남산 아래 야외 콘서트 무대 ═════════════════════ */
{
  const { m, dl, fl } = bg
  // 지붕 아치 · 위 트러스
  m('M620 150 C700 116 920 116 1000 150', 810, PAPER)
  dl('M640 146 C710 124 910 124 980 146', 810)
  m('M628 150 H992 M628 162 H992', 810)
  dl(Array.from({ length: 30 }, (_, i) => `M${630 + i * 12} 162 L${636 + i * 12} 150 L${642 + i * 12} 162`).join(' '), 810)
  // 매달린 조명
  for (const x of [690, 740, 880, 930]) fl(`M${x - 5} 162 L${x + 5} 162 L${x + 7} 172 L${x - 7} 172 Z`, x, INK, 0.8)
  // LED 스크린
  m('M672 178 H948 V250 H672 Z', 810, PAPER)
  dl(Array.from({ length: 11 }, (_, i) => `M${695 + i * 23} 180 V248`).join(' ') + ' M674 202 H946 M674 226 H946', 810)
  // 기둥 트러스(좌우)
  for (const x0 of [636, 968]) {
    m(`M${x0} 262 V150 M${x0 + 16} 262 V150`, x0)
    dl(Array.from({ length: 9 }, (_, i) => `M${x0} ${262 - i * 12} L${x0 + 16} ${256 - i * 12} L${x0} ${250 - i * 12}`).join(' '), x0)
  }
  // 스피커
  for (const x0 of [598, 994]) {
    m(`M${x0} 214 H${x0 + 30} V262 H${x0} Z M${x0} 238 H${x0 + 30}`, x0, PAPER)
    dl(circ(x0 + 15, 226, 7) + circ(x0 + 15, 250, 8) + circ(x0 + 15, 226, 2.5) + circ(x0 + 15, 250, 3), x0)
  }
  // 무대 바닥 · 앞 펜스
  m('M590 262 H1030 V276 H590 Z', 810, PAPER)
  dl(Array.from({ length: 21 }, (_, i) => `M${600 + i * 20} 264 V274`).join(' '), 810)
  m('M600 284 H1020', 810)
  dl(Array.from({ length: 22 }, (_, i) => `M${602 + i * 19} 278 V284`).join(' ') + ' M600 280 H1020', 810)
}
// 무대 위 가수 — 마이크를 든 손을 높이 든다
{
  const P = figure(singer, 810, 262, 'suit', INK, 1.05)
  singer.m(`M${P(5, -33)} L${P(12, -44)} M${P(-5, -33)} L${P(-8, -22)}`, 810)
  singer.m(`M${P(12, -44)} l2 -4`, 810)
}

/* ════ 오른쪽 — 네온 빌딩 · 포장마차 · 영화관 ═══════════════════ */
{
  const { m, dl, fl, lattice } = bg
  // 네온 빌딩
  m('M1096 300 V96 H1236 V300 Z', 1166, PAPER)
  m('M1090 96 H1242 M1204 96 V66 M1214 96 V78', 1166)
  dl('M1200 84 L1204 74 L1208 84 M1210 88 L1214 82 L1218 88', 1204)
  m('M1104 112 H1126 V234 H1104 Z', 1115, PAPER)
  dl('M1100 102 H1232 M1100 106 H1232', 1166)
  m('M1140 116 H1226 V198 H1140 Z', 1183, PAPER)
  dl('M1144 120 H1222 V194 H1144 Z', 1183)
  m(circ(1183, 148, 12) + 'M1160 194 C1162 172 1204 172 1206 194', 1183, PAPER)
  fl('M1171 148 C1170 132 1196 130 1195 150 C1192 140 1180 138 1171 148 Z', 1183, INK, 0.85)
  lattice(1140, 210, 40, 24, 4, 2); lattice(1186, 210, 40, 24, 4, 2)
  m('M1132 252 L1236 252 L1228 262 L1140 262 Z', 1184, PAPER)
  dl(Array.from({ length: 9 }, (_, i) => `M${1146 + i * 10} 252 L${1146 + i * 10} 262`).join(' ') + ' M1146 266 V300 M1226 266 V300 M1186 266 V300', 1184)
  // 포장마차 · 붉은 파라솔
  m('M1056 270 H1106 V292 H1056 Z', 1080, PAPER)
  dl('M1060 276 H1102 M1060 282 H1102 M1060 288 H1102', 1080)
  m(circ(1064, 295, 5) + circ(1098, 295, 5), 1080, PAPER)
  m('M1080 270 V230', 1080)
  const parasol = 'M1044 250 C1056 234 1068 228 1080 228 C1092 228 1104 234 1116 250 C1110 247 1102 248 1098 252 C1093 248 1086 248 1080 252 C1074 248 1067 248 1062 252 C1058 248 1050 247 1044 250 Z'
  fl(parasol, 1080, RED, 0.82); m(parasol, 1080)
  dl('M1080 228 L1062 252 M1080 228 L1098 252', 1080)
  // 영화관(고전 파사드)
  m('M1252 300 V112 H1590 V300 Z', 1420, PAPER)
  m('M1560 104 V84 H1574 V104', 1567, PAPER)
  m('M1244 112 H1598 M1248 104 H1594 V112 M1248 104 V112', 1420)
  m('M1330 104 C1370 72 1470 72 1510 104', 1420, PAPER)
  dl('M1350 100 C1384 80 1456 80 1490 100 M1396 94 c6 -6 14 -6 20 0 c6 6 14 6 20 0 M1256 108 H1590', 1420)
  m('M1262 112 V300 M1322 112 V300 M1520 112 V300 M1580 112 V300', 1420)
  dl('M1266 116 V296 M1318 116 V296 M1524 116 V296 M1576 116 V296', 1420)
  for (const x of [1274, 1338, 1403, 1468, 1532]) {
    m(`M${x} 176 V140 a18 18 0 0 1 36 0 V176 Z`, x, PAPER)
    dl(`M${x + 18} 122 V176 M${x} 150 H${x + 36} M${x} 163 H${x + 36}`, x)
  }
  // 발코니(구경하는 사람들)
  m('M1330 202 H1512 M1330 210 H1512', 1420)
  dl(Array.from({ length: 18 }, (_, i) => `M${1334 + i * 10} 202 V210`).join(' '), 1420)
  {
    const rand = rng(61)
    let d = ''
    for (let x = 1340; x < 1504; x += 9 + rand() * 4) d += crowdPerson(r1(x), 192, 0.62, () => 0.9).d
    m(d, 1420, PAPER)
  }
  // 마키 간판 · 차양 · 입구
  m('M1346 214 H1496 V240 H1346 Z', 1420, PAPER)
  dl('M1350 218 H1492 V236 H1350 Z M1384 225 H1458 M1396 231 H1446', 1420)
  m('M1340 240 L1502 240 L1492 248 L1350 248 Z', 1420, PAPER)
  m('M1380 252 H1462 V300 H1380 Z', 1421, PAPER)
  lattice(1384, 256, 36, 40, 3, 4); lattice(1422, 256, 36, 40, 3, 4)
  lattice(1270, 214, 44, 60, 4, 5); lattice(1530, 214, 44, 60, 4, 5)
  dl('M1374 292 H1468 M1370 296 H1472', 1421)
  // 길
  m(`M0 ${GROUND} H560 M1052 ${GROUND} H1600`, 800)
  dl('M1070 320 H1250 M1090 346 H1236 M1110 374 H1222', 1160)
}

/* ════ 콘서트 군중 — 뒤에서 앞으로, 원근을 따라 커진다 ═════════════ */
const crowdRows: { d: string; sw: number }[] = []
const sticks: { x: number; y: number; len: number; dl: number }[] = []
{
  const rand = rng(303)
  let y = 288
  while (y < 414) {
    const t = Math.min(1, (y - 288) / 112)
    const s = 0.55 + t * 0.8
    const L = 586 - (y - 288) * 1.12, R = 1034 + (y - 288) * 0.98
    let d = ''
    let x = L + 4 + rand() * 6 * s
    while (x < R - 4) {
      const p = crowdPerson(Math.round(x), Math.round(y + (rand() - 0.5) * 2 * s), s, rand)
      d += p.d
      for (const [hx, hy] of p.hands) {
        if (t > 0.08 && rand() < 0.42 && sticks.length < 70) sticks.push({ x: r1(hx), y: r1(hy), len: r1(7.5 * s), dl: r1(rand() * 1.6) })
      }
      x += (14.5 + rand() * 3) * s
    }
    crowdRows.push({ d, sw: r1(0.55 + t * 0.5) })
    y += 9.2 * s
  }
}

/* ════ 전경 — 촬영 장비 · 사진기자 · 레드카펫 · 팬 · 차 ═══════════ */
{
  const { m, dl, fl } = fg
  // 군중 양옆 바리케이드
  m('M580 290 L452 404 M586 296 L462 408 M1040 290 L1150 404 M1034 296 L1140 408', 800)
  dl(Array.from({ length: 10 }, (_, i) => {
    const a = i / 9
    return `M${r1(580 - 128 * a)} ${r1(290 + 114 * a)} l6 6 M${r1(1040 + 110 * a)} ${r1(290 + 114 * a)} l-6 6`
  }).join(' '), 800)

  // 소프트박스 조명
  m('M38 392 L46 362 L54 392 M46 362 V262', 46)
  m('M22 236 L66 228 L70 264 L26 272 Z', 46, PAPER)
  dl('M27 241 L63 234 M29 268 L67 260 M44 233 L48 268', 46)
  // 크레인 받침(돌리)
  m('M118 380 H194 V388 H118 Z M138 380 L156 300 L174 380', 156, PAPER)
  dl('M144 352 H168 M148 334 H164', 156)
  m(circ(126, 393, 4.5) + circ(186, 393, 4.5), 156, PAPER)
  // 배우들(한복)
  figure(fg, 300, 344, 'hanbok', RED, 1.15)
  figure(fg, 330, 342, 'dopo', INDIGO, 1.2, -1)
  figure(fg, 360, 345, 'hanbok', INDIGO, 1.15, -1)
  // 붐 마이크 기사
  {
    const P = figure(fg, 226, 390, 'parka', OCHRE, 1.2)
    m(`M${P(6, -32)} L${P(12, -44)} M${P(-4, -32)} L${P(8, -40)} M${P(4, -40)} L${P(90, -110)}`, 226)
    const mic = 'M322 254 h20 a4 4 0 0 1 0 8 h-20 a4 4 0 0 1 0 -8 Z'
    fl(mic, 330, INK, 0.15); m(mic, 330)
    dl('M326 255 v6 M330 255 v6 M334 255 v6 M338 255 v6', 330)
  }
  // 삼각대 카메라 · 촬영기사
  m('M392 334 L376 392 M392 334 L392 392 M392 334 L408 392', 392)
  m('M378 318 H406 V334 H378 Z M378 322 L366 319 V333 L378 330', 392, PAPER)
  dl('M396 318 V312 H404 M382 326 H402', 392)
  {
    const P = figure(fg, 426, 392, 'parka', OCHRE, 1.15, -1)
    m(`M${P(4, -32)} L410 328 M${P(-4, -30)} L${P(2, -24)}`, 426)
  }
  dl('M392 392 C360 398 300 396 262 399 M186 392 C200 398 220 397 240 400', 300)
  m('M196 384 H222 V394 H196 Z', 209, PAPER)
  dl('M206 384 V381 H212 V384', 209)

  // 레드카펫 · 계단 앞
  const carpet = 'M1388 300 L1456 300 L1414 402 L1298 402 Z'
  fl(carpet, 1380, RED, 0.82)
  m('M1388 300 L1298 402 M1456 300 L1414 402 M1388 300 H1456', 1380)
  dl('M1402 312 L1330 400 M1440 312 L1394 400', 1380)
  // 차단봉 · 로프
  const post = (a: number, side: -1 | 1) => side < 0 ? [1378 - 90 * a, 302 + 100 * a] : [1466 - 42 * a, 302 + 100 * a]
  for (const side of [-1, 1] as const) {
    const ts = [0.08, 0.36, 0.64, 0.92].map((a) => post(a, side))
    m(ts.map(([px, py]) => `M${r1(px)} ${r1(py)} V${r1(py - 16)} M${r1(px - 3)} ${r1(py)} H${r1(px + 3)}`).join(' '), 1380)
    fl(ts.map(([px, py]) => circ(px, py - 17, 1.8)).join(''), 1380, INK, 0.85)
    dl(ts.slice(1).map(([px, py], i) => { const [qx, qy] = ts[i]; return `M${r1(qx)} ${r1(qy - 14)} Q${r1((px + qx) / 2)} ${r1((py + qy) / 2 - 6)} ${r1(px)} ${r1(py - 14)}` }).join(' '), 1380)
  }
  // 사진기자(뒤 줄 → 앞 줄) — 카메라를 얼굴에 댄다
  for (const [x, y] of [[1262, 326], [1234, 356], [1336, 330], [1310, 358], [1282, 388]] as const) {
    const s = 0.95 + (y - 300) / 100 * 0.35
    const P = figure(fg, x, y, x % 2 ? 'suit' : 'parka', x % 2 ? INK : OCHRE, s)
    m(`M${P(4, -44)} L${P(12, -44)} L${P(12, -37)} L${P(4, -37)} Z M${P(12, -42)} L${P(15, -42)} L${P(15, -39)} L${P(12, -39)}`, x, PAPER)
    m(`M${P(3, -32)} L${P(6, -38)}`, x)
  }
  // 주인공 둘
  {
    const P = figure(fg, 1418, 346, 'suit', INK, 1.08, -1)
    m(`M${P(5, -33)} L${P(12, -48)} M${P(-5, -33)} L${P(-7, -20)}`, 1418)
    figure(fg, 1386, 376, 'gown', INK, 1.12, -1)
  }
  // 오른쪽 바리케이드 · 팬들 · 대기 차량
  m('M1478 302 L1446 404 M1488 302 L1456 404', 1470)
  dl(Array.from({ length: 7 }, (_, i) => `M${r1(1478 - 32 * i / 6)} ${r1(302 + 102 * i / 6)} h10`).join(' '), 1470)
  {
    const rand = rng(77)
    for (const [y, s] of [[300, 0.85], [318, 0.95], [338, 1.05]] as const) {
      let d = ''
      for (let x = 1500 + rand() * 6 - (y - 300) * 0.3; x < 1600; x += 12 * s + rand() * 3) {
        const p = crowdPerson(Math.round(x), y, s, rand)
        d += p.d
        for (const [hx, hy] of p.hands) d += `M${r1(hx - 1.6)} ${r1(hy - 4)}h3.2v4.6h-3.2z`   // 휴대폰
      }
      m(d, 1550, PAPER)
    }
  }
  m('M1492 388 C1492 378 1498 374 1510 372 L1532 358 C1544 351 1582 351 1598 357 L1614 368 V392 H1492 Z', 1550, PAPER)
  dl('M1536 370 L1546 360 H1578 L1584 370 Z M1562 360 V370 M1496 380 H1504 M1530 376 V390', 1550)
  m(circ(1516, 392, 8.5) + circ(1592, 392, 8.5), 1550, PAPER)
  dl(circ(1516, 392, 3.5) + circ(1592, 392, 3.5), 1550)
}

/* ════ 크레인 팔(따로 흔든다) — 받침점 156,300 ══════════════════ */
{
  const { m, dl, fl } = crane
  m('M70 352 L262 236 M73 357 L265 241', 156)
  dl(Array.from({ length: 16 }, (_, i) => {
    const a = i / 16, b = (i + 0.5) / 16
    return `M${r1(70 + 192 * a)} ${r1(352 - 116 * a)} L${r1(73 + 192 * b)} ${r1(357 - 116 * b)}`
  }).join(' '), 156)
  fl('M54 346 L76 356 L69 370 L47 360 Z', 62, INK, 0.7)
  m('M54 346 L76 356 L69 370 L47 360 Z', 62)
  m(circ(156, 300, 3.5), 156, PAPER)
  m('M263 238 V246 M252 246 H274 V258 H252 Z M274 249 L284 246 V259 L274 256', 266, PAPER)
}

/* ════ 움직이는 조각들 ══════════════════════════════════════════ */
const beamFan = (ox: number, oy: number, targets: number[]) => targets.map((tx) => `M${ox} ${oy} L${tx} -10 M${ox} ${oy} L${tx + 16} -10`).join(' ')
const BEAMS_L = beamFan(704, 150, [440, 540, 640, 724])
const BEAMS_R = beamFan(916, 150, [880, 964, 1064, 1164])
const wedge = (ox: number, oy: number, tx: number) => `M${ox} ${oy} L${tx} -10 L${tx + 16} -10 Z`
const BEAM_FILL_L = [440, 540, 640, 724].map((t) => wedge(704, 150, t)).join(' ')
const BEAM_FILL_R = [880, 964, 1064, 1164].map((t) => wedge(916, 150, t)).join(' ')

const FLASHES = [[1278, 270], [1250, 302], [1352, 274], [1328, 302], [1302, 332]] as const
const star = (x: number, y: number) => `M${x} ${y - 7} L${x + 1.8} ${y - 1.8} L${x + 7} ${y} L${x + 1.8} ${y + 1.8} L${x} ${y + 7} L${x - 1.8} ${y + 1.8} L${x - 7} ${y} L${x - 1.8} ${y - 1.8} Z`
const rays = (x: number, y: number) => `M${x - 12} ${y - 12} l4 4 M${x + 12} ${y - 12} l-4 4 M${x + 12} ${y + 12} l-4 -4 M${x - 12} ${y + 12} l4 -4 M${x} ${y - 14} v3 M${x + 14} ${y} h-3`

const BULBS_A = Array.from({ length: 8 }, (_, i) => circ(1352 + i * 20, 214, 1.8) + circ(1362 + i * 20, 240, 1.8)).join('')
const BULBS_B = Array.from({ length: 8 }, (_, i) => circ(1362 + i * 20, 214, 1.8) + circ(1352 + i * 20, 240, 1.8)).join('')
const NEON = Array.from({ length: 6 }, (_, i) => `M1109 ${120 + i * 19} H1121 V${132 + i * 19} H1109 Z M1115 ${120 + i * 19} V${132 + i * 19}`).join(' ')

const FOG = ['M612 212 C604 200 620 192 612 178 C606 168 616 160 612 150', 'M1008 212 C1016 200 1000 192 1008 178 C1014 168 1004 160 1008 150']
const CHIMNEY = ['M1564 84 C1556 72 1572 64 1564 50 C1558 40 1570 32 1566 22', 'M1570 84 C1580 70 1566 60 1576 46 C1584 36 1574 26 1580 16']
const CART_STEAM = ['M1072 268 C1068 262 1076 258 1072 254', 'M1088 268 C1084 262 1092 258 1088 254']

export function CultureScene({ label }: { label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} focusable="false">
      <g className="hp-cloud">
        <path className="hp-d" d={CLOUD_A} vectorEffect="non-scaling-stroke" />
        <path className="hp-d" d={CLOUD_B} vectorEffect="non-scaling-stroke" />
      </g>
      <g className="hc-beam hc-beam-l">
        <path className="hp-f" d={BEAM_FILL_L} style={{ fill: INK, fillOpacity: 0.035 }} />
        <path className="hc-beam-line" d={BEAMS_L} vectorEffect="non-scaling-stroke" />
      </g>
      <g className="hc-beam hc-beam-r">
        <path className="hp-f" d={BEAM_FILL_R} style={{ fill: INK, fillOpacity: 0.035 }} />
        <path className="hc-beam-line" d={BEAMS_R} vectorEffect="non-scaling-stroke" />
      </g>
      <InkParts parts={bg.parts} />
      <path className="hp-f hc-spot" d="M800 166 L820 166 L852 262 L768 262 Z" style={{ fill: OCHRE }} />
      <g className="hc-singer"><InkParts parts={singer.parts} /></g>
      <path className="hc-neon" d={NEON} vectorEffect="non-scaling-stroke" />
      <path className="hp-f hc-bulb" d={BULBS_A} style={{ fill: OCHRE }} />
      <path className="hp-f hc-bulb hc-bulb-b" d={BULBS_B} style={{ fill: OCHRE }} />
      {crowdRows.map((r, i) => (
        <path key={i} className="hp-m" d={r.d} vectorEffect="non-scaling-stroke" style={{ fill: PAPER, strokeWidth: r.sw }} />
      ))}
      {sticks.map((s, i) => (
        <path key={i} className="hc-stick" d={`M${s.x} ${s.y} v${-s.len}`} vectorEffect="non-scaling-stroke"
          style={{ animationDelay: `-${s.dl}s` } as CSSProperties} />
      ))}
      <InkParts parts={fg.parts} />
      <g className="hc-crane"><InkParts parts={crane.parts} /></g>
      {FLASHES.map(([x, y], i) => (
        <g key={i} className="hc-flash" style={{ animationDelay: `${(i * 1.37) % 4.1}s` }}>
          <path className="hp-m" d={star(x, y)} vectorEffect="non-scaling-stroke" style={{ fill: PAPER }} />
          <path className="hp-d" d={rays(x, y)} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      {[...FOG, ...CHIMNEY, ...CART_STEAM].map((d, i) => (
        <path key={d} className="hp-steam" d={d} vectorEffect="non-scaling-stroke" style={{ '--s': `${(i * 0.9) % 3.2}s` } as CSSProperties} />
      ))}
    </svg>
  )
}
