/**
 * Basics 상황 장면의 고정 캐릭터 2명 — 홈 히어로와 같은 펜화 결(먹선 #111111, 포인트 #C8102E, 은은한 코랄 볼터치).
 *
 *   A  말하는 사람(학습자 역) · 여성 — 단발 · 비스듬한 앞머리 · 빨간 머리핀 · 둥근 깃 블라우스
 *   B  듣는 사람(한국인 역) · 남성 — 짧은 머리 · 둥근 안경 · 셔츠 깃 + 니트 조끼 · 주머니의 빨간 펜
 *
 * 2026-11-21 개편: 머리카락 결 · 얼굴 윤곽(턱 · 귀 · 목 그림자) · 옷깃 · 소품 디테일과 볼터치 · 옅은 음영을 더했고,
 * 표정을 11가지로 늘렸다(글마다 videos.json 의 cast 로 고른다). 손짓(wave) · 컵(cup) 소품을 고를 수 있다.
 *
 * 상반신 정면, viewBox 400×560(아래쪽은 화면 밖으로 잘려도 된다).
 * 몸 · 머리 · 얼굴을 그룹으로 나눴다 — 표정은 <Face> 만 바뀌고, nod 는 머리 그룹만 끄덕이며, shiver 는 몸 전체가 잘게 떤다.
 * 면은 paper 색으로 채워 뒤 배경 선을 가린다.
 */
import { createContext, useContext, type JSX } from 'react'

export type Expression =
  | 'neutral' // 기본
  | 'smile' // 미소
  | 'awkward' // 떨떠름 · 당황(한쪽 눈썹, 물결 입)
  | 'nod' // 끄덕(감은 눈 + 머리 숙임)
  | 'sweat' // 급함 · 식은땀(큰 눈, 땀방울 둘)
  | 'shiver' // 추워서 오들오들(질끈 감은 눈, 덜덜 이, 떨림 선)
  | 'pleading' // 다급한 부탁(올라간 눈썹, 벌린 입)
  | 'proud' // 뿌듯 · 설렘(감은 웃는 눈, 진한 볼, 반짝)
  | 'curious' // 궁금(한쪽 눈썹, 위를 보는 눈, 물음표)
  | 'yummy' // 맛있음(감은 눈, 혀, 반짝)
  | 'friendly' // 친절하게 건네는 밝은 얼굴(크게 웃는 입)
export type Speaker = 'A' | 'B'
export type Gesture = 'wave' | 'cup'

export const INK = '#111111'
export const RED = '#C8102E'
const SW = 5

export type CharTheme = { ink: string; paper: string; accent: string; /** 머리 채움 — 어두운 배경에서 선 색으로 채우면 흰 머리가 된다 */ hair?: string; blush?: string; shade?: string }
export const DEFAULT_THEME: CharTheme = { ink: INK, paper: '#fff', accent: RED, blush: 'rgba(232,112,100,0.30)', shade: 'rgba(17,17,17,0.07)' }
const ThemeCtx = createContext<CharTheme>(DEFAULT_THEME)
const stroke = (T: CharTheme, w = SW) => ({ fill: 'none', stroke: T.ink, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const

const EYE_Y = 200
const L = 160
const R = 240

/* ───────── 얼굴 ───────── */

function Eyes({ kind }: { kind: 'dot' | 'big' | 'happy' | 'closed' | 'squeeze' | 'up' }) {
  const T = useContext(ThemeCtx)
  if (kind === 'happy')
    return <path d={`M${L - 12} ${EYE_Y + 3} Q${L} ${EYE_Y - 11} ${L + 12} ${EYE_Y + 3} M${R - 12} ${EYE_Y + 3} Q${R} ${EYE_Y - 11} ${R + 12} ${EYE_Y + 3}`} {...stroke(T, 4)} />
  if (kind === 'closed')
    return <path d={`M${L - 12} ${EYE_Y - 2} Q${L} ${EYE_Y + 9} ${L + 12} ${EYE_Y - 2} M${R - 12} ${EYE_Y - 2} Q${R} ${EYE_Y + 9} ${R + 12} ${EYE_Y - 2}`} {...stroke(T, 4)} />
  if (kind === 'squeeze')
    return <path d={`M${L - 12} ${EYE_Y - 6} L${L + 6} ${EYE_Y} L${L - 12} ${EYE_Y + 6} M${R + 12} ${EYE_Y - 6} L${R - 6} ${EYE_Y} L${R + 12} ${EYE_Y + 6}`} {...stroke(T, 4)} />
  const r = kind === 'big' ? 9 : 7
  const dy = kind === 'up' ? -4 : 0
  const dx = kind === 'up' ? 3 : 0
  return (
    <g>
      {kind === 'big' && <path d={`M${L - 14} ${EYE_Y} a14 13 0 1 0 28 0 a14 13 0 1 0 -28 0 M${R - 14} ${EYE_Y} a14 13 0 1 0 28 0 a14 13 0 1 0 -28 0`} {...stroke(T, 3)} fill={T.paper} />}
      <circle cx={L + dx} cy={EYE_Y + dy} r={r} fill={T.ink} />
      <circle cx={R + dx} cy={EYE_Y + dy} r={r} fill={T.ink} />
      {/* 눈빛 */}
      <circle cx={L + dx + 2.5} cy={EYE_Y + dy - 2.5} r={2.2} fill={T.paper} />
      <circle cx={R + dx + 2.5} cy={EYE_Y + dy - 2.5} r={2.2} fill={T.paper} />
      {/* 위 속눈썹 선 */}
      {kind !== 'big' && <path d={`M${L - 11} ${EYE_Y - 8} Q${L} ${EYE_Y - 13} ${L + 11} ${EYE_Y - 8} M${R - 11} ${EYE_Y - 8} Q${R} ${EYE_Y - 13} ${R + 11} ${EYE_Y - 8}`} {...stroke(T, 3)} />}
    </g>
  )
}

function Face({ expression, glasses, since }: { expression: Expression; glasses?: boolean; since: number }) {
  const T = useContext(ThemeCtx)
  const thin = stroke(T, 3.5)
  const brow = (lUp: number, rUp: number, tilt = 0) =>
    `M${L - 17} ${EYE_Y - 27 - lUp + tilt} Q${L} ${EYE_Y - 34 - lUp} ${L + 16} ${EYE_Y - 28 - lUp - tilt} M${R - 16} ${EYE_Y - 28 - rUp - tilt} Q${R} ${EYE_Y - 34 - rUp} ${R + 17} ${EYE_Y - 27 - rUp + tilt}`
  let eyes: JSX.Element = <Eyes kind="dot" />
  let brows = brow(0, 0)
  let mouth: JSX.Element = <path d="M184 250 Q200 259 216 250" {...thin} />
  let blush = 0.8
  const extras: JSX.Element[] = []
  const t = Math.max(0, since)

  switch (expression) {
    case 'smile':
      eyes = <Eyes kind="happy" />
      mouth = <path d="M174 244 Q200 272 226 244" {...thin} />
      blush = 1
      break
    case 'awkward':
      brows = `M${L - 18} ${EYE_Y - 25} L${L + 16} ${EYE_Y - 21} M${R - 16} ${EYE_Y - 32} Q${R} ${EYE_Y - 44} ${R + 18} ${EYE_Y - 34}`
      mouth = <path d="M178 254 Q187 246 196 254 T214 254 T226 251" {...thin} />
      extras.push(<path key="d" d="M296 150 C290 162 288 170 296 175 C304 170 302 162 296 150 Z" {...stroke(T, 3)} fill={T.paper} />)
      break
    case 'nod':
      eyes = <Eyes kind="closed" />
      mouth = <path d="M180 246 Q200 262 220 246" {...thin} />
      blush = 1
      break
    case 'sweat': {
      eyes = <Eyes kind="big" />
      brows = brow(6, 6, 5)
      mouth = <path d="M184 250 Q200 244 216 250 Q208 262 200 262 Q192 262 184 250 Z" {...thin} fill={T.paper} />
      // 땀방울 둘 — 천천히 흘러내린다
      const drip = (t % 40) * 0.6
      extras.push(
        <path key="s1" d={`M300 ${142 + drip} C293 ${156 + drip} 291 ${166 + drip} 300 ${172 + drip} C309 ${166 + drip} 307 ${156 + drip} 300 ${142 + drip} Z`} {...stroke(T, 3)} fill={T.paper} />,
        <path key="s2" d="M104 168 C99 178 98 185 104 189 C110 185 109 178 104 168 Z" {...stroke(T, 3)} fill={T.paper} />,
      )
      blush = 0.5
      break
    }
    case 'shiver': {
      eyes = <Eyes kind="squeeze" />
      brows = brow(4, 4, 6)
      // 덜덜 떠는 이 — 지그재그
      mouth = (
        <g>
          <path d="M178 246 H222 V260 H178 Z" {...thin} fill={T.paper} />
          <path d="M178 253 L184 248 L190 258 L196 248 L202 258 L208 248 L214 258 L222 252" {...stroke(T, 3)} />
        </g>
      )
      const j = Math.sin(t * 2.2) * 3
      extras.push(<path key="w" d={`M${84 + j} 170 q-10 10 0 20 q10 10 0 20 M${316 - j} 170 q10 10 0 20 q-10 10 0 20`} {...stroke(T, 3)} opacity={0.7} />)
      blush = 0.2
      break
    }
    case 'pleading':
      eyes = <Eyes kind="dot" />
      brows = `M${L - 17} ${EYE_Y - 26} Q${L} ${EYE_Y - 40} ${L + 16} ${EYE_Y - 38} M${R - 16} ${EYE_Y - 38} Q${R} ${EYE_Y - 40} ${R + 17} ${EYE_Y - 26}`
      mouth = <path d="M186 246 Q200 240 214 246 Q212 266 200 266 Q188 266 186 246 Z" {...thin} fill={T.paper} />
      blush = 1
      break
    case 'proud': {
      eyes = <Eyes kind="happy" />
      brows = brow(3, 3)
      mouth = <path d="M172 242 Q200 278 228 242 Q200 252 172 242 Z" {...thin} fill={T.paper} />
      blush = 1.6
      const tw = 0.7 + 0.3 * Math.sin(t / 4)
      extras.push(<path key="sp" d="M318 120 v26 M305 133 h26 M86 110 v18 M77 119 h18" stroke={T.accent} strokeWidth={4} strokeLinecap="round" opacity={tw} />)
      break
    }
    case 'curious':
      eyes = <Eyes kind="up" />
      brows = `M${L - 17} ${EYE_Y - 27} Q${L} ${EYE_Y - 32} ${L + 16} ${EYE_Y - 28} M${R - 16} ${EYE_Y - 36} Q${R} ${EYE_Y - 48} ${R + 17} ${EYE_Y - 38}`
      mouth = <path d="M192 252 a8 6 0 1 0 16 0 a8 6 0 1 0 -16 0" {...thin} />
      extras.push(
        <g key="q" transform={`translate(0 ${Math.sin(t / 6) * 3})`}>
          <path d="M312 92 q0 -18 18 -18 q18 0 18 16 q0 12 -14 18 q-6 3 -6 12" {...stroke(T, 4)} />
          <circle cx={328} cy={134} r={4} fill={T.ink} />
        </g>,
      )
      break
    case 'yummy': {
      eyes = <Eyes kind="closed" />
      brows = brow(4, 4)
      mouth = (
        <g>
          <path d="M174 244 Q200 272 226 244" {...thin} />
          <path d="M206 256 q8 10 16 -2" fill={T.accent} stroke={T.ink} strokeWidth={3} strokeLinejoin="round" />
        </g>
      )
      blush = 1.5
      extras.push(<path key="sp" d="M320 150 l8 -8 M330 166 h12 M90 150 l-8 -8 M80 166 h-12" {...stroke(T, 4)} />)
      break
    }
    case 'friendly':
      eyes = <Eyes kind="happy" />
      brows = brow(4, 4)
      mouth = <path d="M170 240 Q200 280 230 240 Z" {...thin} fill={T.paper} />
      extras.push(<path key="tooth" d="M178 244 Q200 250 222 244" {...stroke(T, 2.5)} />)
      blush = 1.2
      break
  }

  return (
    <g>
      {/* 볼터치 */}
      <ellipse cx={142} cy={236} rx={20} ry={11} fill={T.blush ?? DEFAULT_THEME.blush} opacity={blush} />
      <ellipse cx={258} cy={236} rx={20} ry={11} fill={T.blush ?? DEFAULT_THEME.blush} opacity={blush} />
      {glasses && (
        <g>
          <path d={`M${L - 25} ${EYE_Y} a25 23 0 1 0 50 0 a25 23 0 1 0 -50 0 M${R - 25} ${EYE_Y} a25 23 0 1 0 50 0 a25 23 0 1 0 -50 0`} {...thin} />
          <path d={`M${L + 25} ${EYE_Y - 4} Q200 ${EYE_Y - 12} ${R - 25} ${EYE_Y - 4} M${L - 25} ${EYE_Y - 4} L118 ${EYE_Y - 10} M${R + 25} ${EYE_Y - 4} L282 ${EYE_Y - 10}`} {...thin} />
          {/* 렌즈 반사 */}
          <path d={`M${L - 14} ${EYE_Y - 12} l8 -6 M${R - 14} ${EYE_Y - 12} l8 -6`} stroke={T.ink} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
        </g>
      )}
      <path d={brows} {...stroke(T, 4)} />
      {eyes}
      {/* 코 — 그림자 한 획 */}
      <path d="M201 210 Q195 226 203 230" {...stroke(T, 3)} />
      {mouth}
      {extras}
    </g>
  )
}

/** 고개 끄덕임 — nod 표정일 때 머리 그룹만 아래로 살짝 숙였다 올라온다 */
function headTransform(expression: Expression, since: number) {
  if (expression === 'nod' && since >= 0) {
    const a = Math.max(0, Math.sin((since / 30) * Math.PI * 2 * 1.4)) * 6 * Math.max(0, 1 - since / 40)
    return `rotate(${a} 200 300) translate(0 ${a * 1.2})`
  }
  if (expression === 'curious') return 'rotate(-4 200 300)'
  if (expression === 'proud') return 'rotate(3 200 300) translate(0 -3)'
  return undefined
}

/* ───────── 손 · 소품 ───────── */

/** 손을 들어 흔든다 — 오른쪽(화면 기준) 어깨에서 얼굴 옆으로 */
function Wave({ since }: { since: number }) {
  const T = useContext(ThemeCtx)
  const a = Math.sin(Math.max(0, since) / 3) * 8
  return (
    <g transform={`rotate(${a} 318 300)`}>
      <path d="M300 400 C330 360 336 320 326 286" {...stroke(T)} strokeWidth={30} />
      <path d="M300 400 C330 360 336 320 326 286" fill="none" stroke={T.paper} strokeWidth={21} strokeLinecap="round" />
      {/* 손바닥 + 손가락 */}
      <path d="M308 290 C300 262 304 236 312 232 C318 230 320 240 320 252 L322 222 C322 212 334 212 334 222 L334 248 L338 218 C339 208 351 209 350 220 L348 252 L356 230 C358 221 369 224 366 234 L356 276 C352 296 336 306 322 302 Z" {...stroke(T, 4)} fill={T.paper} />
      {/* 움직임 선 */}
      <path d="M376 236 q10 8 6 20 M384 222 q14 12 8 30" {...stroke(T, 3)} opacity={0.6} />
    </g>
  )
}

/** 두 손으로 컵을 건넨다 — 가슴 앞 */
function Cup() {
  const T = useContext(ThemeCtx)
  return (
    <g>
      <path d="M150 560 C150 500 160 470 176 452 M250 560 C250 500 240 470 224 452" {...stroke(T)} />
      <path d="M168 418 H232 L224 488 Q200 498 176 488 Z" {...stroke(T, 4)} fill={T.paper} />
      <path d="M232 432 c22 0 22 34 -4 34" {...stroke(T, 4)} />
      <path d="M172 438 H228" stroke={T.accent} strokeWidth={6} />
      <path d="M190 404 q6 -10 0 -20 M210 404 q6 -10 0 -20" {...stroke(T, 3)} opacity={0.6} />
      {/* 컵을 감싼 손가락 */}
      <path d="M164 452 q-8 10 4 20 M236 452 q8 10 -4 20" {...stroke(T, 4)} />
    </g>
  )
}

/* ───────── 두 사람 ───────── */

function PersonA({ expression, since, gesture }: { expression: Expression; since: number; gesture?: Gesture }) {
  const T = useContext(ThemeCtx)
  const line = stroke(T)
  const thin = stroke(T, 3.5)
  const hair = T.hair ?? T.ink
  const strand = { fill: 'none', stroke: T.paper, strokeWidth: 2.2, strokeLinecap: 'round', opacity: 0.35 } as const
  return (
    <>
      {/* 몸 — 블라우스, 어깨 솔기 · 단추 · 소매 주름 */}
      <path d="M40 600 C40 452 92 374 170 352 L230 352 C308 374 360 452 360 600 Z" {...line} fill={T.paper} />
      <path d="M200 392 V600" {...thin} />
      {[430, 474, 518].map(y => <circle key={y} cx={200} cy={y} r={4.5} fill={T.paper} stroke={T.ink} strokeWidth={2.5} />)}
      <path d="M118 410 Q110 470 116 540 M282 410 Q290 470 284 540" {...stroke(T, 3)} opacity={0.5} />
      <path d="M96 520 q14 -8 26 2 M304 520 q-14 -8 -26 2" {...stroke(T, 3)} opacity={0.45} />
      {/* 둥근 깃 */}
      <path d="M170 352 C150 370 150 398 176 400 C192 400 200 388 200 376 C200 388 208 400 224 400 C250 398 250 370 230 352" {...thin} fill={T.paper} />
      {/* 목 + 턱 그림자 */}
      <path d="M178 286 V354 M222 286 V354" {...line} />
      <path d="M180 292 Q200 312 220 292 L220 316 Q200 326 180 316 Z" fill={T.shade ?? DEFAULT_THEME.shade} />
      {gesture === 'wave' && <Wave since={since} />}
      <g transform={headTransform(expression, since)}>
        {/* 뒷머리(단발) — 턱선까지, 끝이 안으로 말린다 */}
        <path d="M98 200 C92 112 140 70 202 70 C266 72 310 114 302 200 C300 238 306 262 316 286 C298 298 272 294 258 278 L144 278 C128 294 102 298 84 286 C94 262 100 238 98 200 Z" fill={hair} />
        <path d="M112 240 Q118 268 102 282 M292 240 Q286 268 300 282 M126 150 Q114 200 120 250 M276 150 Q290 200 282 250" {...strand} />
        {/* 얼굴 — 갸름한 턱선 */}
        <path d="M116 190 C116 128 152 104 200 104 C248 104 284 128 284 190 C284 246 254 292 200 296 C146 292 116 246 116 190 Z" {...line} fill={T.paper} />
        {/* 귀 */}
        <path d="M118 194 C102 190 100 222 120 228" {...thin} fill={T.paper} />
        <path d="M282 194 C298 190 300 222 280 228" {...thin} fill={T.paper} />
        {/* 앞머리 — 비스듬히, 결 선 */}
        <path d="M108 182 C116 116 160 86 208 88 C256 90 290 122 296 182 C276 150 252 132 222 132 C210 146 186 160 146 166 C132 168 118 174 108 182 Z" fill={hair} />
        <path d="M150 104 Q136 130 128 160 M184 96 Q170 126 160 158 M224 100 Q214 120 204 140 M256 112 Q270 140 276 168" {...strand} />
        {/* 이마 그림자 */}
        <path d="M150 168 Q200 150 270 160 Q230 168 200 172 Q170 176 150 168 Z" fill={T.shade ?? DEFAULT_THEME.shade} />
        <Face expression={expression} since={since} />
        {/* 빨간 머리핀 */}
        <path d="M242 114 L282 128" stroke={T.accent} strokeWidth={10} strokeLinecap="round" />
        <circle cx={246} cy={115} r={3} fill={T.paper} />
      </g>
    </>
  )
}

function PersonB({ expression, since, gesture }: { expression: Expression; since: number; gesture?: Gesture }) {
  const T = useContext(ThemeCtx)
  const line = stroke(T)
  const thin = stroke(T, 3.5)
  const hair = T.hair ?? T.ink
  const strand = { fill: 'none', stroke: T.paper, strokeWidth: 2.2, strokeLinecap: 'round', opacity: 0.35 } as const
  return (
    <>
      {/* 셔츠 */}
      <path d="M36 600 C36 446 94 370 172 352 L228 352 C306 370 364 446 364 600 Z" {...line} fill={T.paper} />
      {/* 니트 조끼 — V넥 + 골 선 */}
      <path d="M86 600 C90 480 112 420 150 392 L200 470 L250 392 C288 420 310 480 314 600 Z" {...thin} fill={T.paper} />
      <path d="M150 392 L200 470 L250 392 M160 402 L200 462 L240 402" {...stroke(T, 2.5)} />
      {[120, 150, 250, 280].map(x => <path key={x} d={`M${x} ${x < 200 ? 470 - (x - 110) : 470 - (290 - x)} V600`} {...stroke(T, 2)} opacity={0.35} />)}
      {/* 셔츠 깃 */}
      <path d="M172 352 L200 404 L228 352 M172 352 L148 392 L188 390 M228 352 L252 392 L212 390" {...thin} fill={T.paper} />
      {/* 주머니 + 빨간 펜 */}
      <path d="M254 470 h40 v38 h-40 Z" {...stroke(T, 3)} />
      <path d="M266 460 v18" stroke={T.accent} strokeWidth={6} strokeLinecap="round" />
      {/* 목 + 그림자 */}
      <path d="M176 286 V352 M224 286 V352" {...line} />
      <path d="M178 292 Q200 312 222 292 L222 318 Q200 328 178 318 Z" fill={T.shade ?? DEFAULT_THEME.shade} />
      {gesture === 'cup' && <Cup />}
      {gesture === 'wave' && <Wave since={since} />}
      <g transform={headTransform(expression, since)}>
        {/* 귀 */}
        <path d="M118 194 C100 188 98 226 120 230" {...thin} fill={T.paper} />
        <path d="M282 194 C300 188 302 226 280 230" {...thin} fill={T.paper} />
        {/* 얼굴 — 각진 턱 */}
        <path d="M116 180 C116 118 154 94 200 94 C246 94 284 118 284 180 C284 238 270 280 232 294 C214 300 186 300 168 294 C130 280 116 238 116 180 Z" {...line} fill={T.paper} />
        {/* 짧은 머리 — 정수리 + 옆머리, 위로 선 결 */}
        <path d="M108 172 C100 104 146 66 204 68 C262 70 302 106 292 172 C286 150 274 136 256 128 C238 136 200 138 170 124 C148 134 124 150 108 172 Z" fill={hair} />
        <path d="M150 84 l-6 -12 M176 74 l-2 -14 M204 70 l2 -14 M232 74 l6 -12 M258 84 l10 -10" {...stroke(T, 4)} />
        <path d="M140 110 Q160 98 182 108 M206 100 Q230 92 252 104 M128 140 Q138 128 152 124" {...strand} />
        <path d="M118 176 Q116 196 120 214 M282 176 Q284 196 280 214" {...stroke(T, 3)} />
        {/* 이마 그림자 */}
        <path d="M150 140 Q200 130 254 140 Q200 150 150 140 Z" fill={T.shade ?? DEFAULT_THEME.shade} />
        <Face expression={expression} since={since} glasses />
      </g>
    </>
  )
}

export function Character({
  who,
  expression,
  since = 0,
  height,
  flip,
  theme,
  gesture,
}: {
  who: Speaker
  expression: Expression
  /** 지금 표정이 시작된 뒤 지난 프레임 — nod · 떨림 · 땀 · 손짓 움직임에 쓴다 */
  since?: number
  height: number
  /** 좌우 뒤집기(얼굴이 대칭이라 핀 · 주머니 위치만 바뀐다) */
  flip?: boolean
  theme?: CharTheme
  gesture?: Gesture
}) {
  // 오들오들 — 몸 전체가 잘게 떤다
  const shake = expression === 'shiver' ? Math.sin(since * 2.4) * 2.5 : 0
  return (
    <ThemeCtx.Provider value={{ ...DEFAULT_THEME, ...theme }}>
      <svg
        viewBox="0 0 400 560"
        width={(height * 400) / 560}
        height={height}
        style={{ overflow: 'visible', display: 'block', transform: `${flip ? 'scaleX(-1) ' : ''}translateX(${shake}px)` }}
      >
        {who === 'A' ? <PersonA expression={expression} since={since} gesture={gesture} /> : <PersonB expression={expression} since={since} gesture={gesture} />}
      </svg>
    </ThemeCtx.Provider>
  )
}

/** 글마다 고르는 배역 표정 — videos.json 의 cast */
export type Cast = { a: Expression; b: Expression; aGesture?: Gesture; bGesture?: Gesture }
