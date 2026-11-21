/**
 * Basics 상황 장면의 고정 캐릭터 2명 — 손그림 연필 선화 결(먹선 #111111, 포인트 #C8102E, 피치 · 코랄 볼터치).
 *
 *   A  말하는 사람(학습자 역) · 여성 — 단발 · 비스듬한 앞머리 · 빨간 머리핀 · 둥근 깃 퍼프소매 블라우스
 *   B  듣는 사람(한국인 역) · 남성 — 흐트러진 짧은 머리 · 둥근 안경 · 셔츠 + 재킷 · 주머니의 빨간 펜
 *
 * 2026-11-21 리뉴얼(참고: 사용자 일러스트 시트):
 *   - 선: 굵기가 다른 획(윤곽 5.5 · 세부 2~3.5)에 미세한 흔들림 필터(feTurbulence)를 얹어 연필 손그림처럼
 *   - 머리카락 결 · 안경테 · 옷깃 주름 · 단추 · 주머니 펜 디테일, 방사형 그라데이션 볼터치
 *   - 3대 감정 포즈(팔 · 손 포함) — 표정(Expression)에서 자동으로 고른다(emotionOf)
 *       confused  걱정 눈썹 + 땀 — A 는 볼에 손, B 는 머리를 긁적
 *       happy     활짝 웃으며 손 인사(wave)
 *       curious   턱을 괴고 갸우뚱 + 물음표, 반대 팔은 팔짱
 *   - gesture 를 주면 포즈보다 우선한다(wave · cup)
 *
 * 상반신 정면, viewBox 400×560(아래쪽은 화면 밖으로 잘려도 된다).
 * 몸 · 머리 · 얼굴을 그룹으로 나눴다 — 표정은 <Face> 만 바뀌고, 머리 그룹만 끄덕 · 갸우뚱하며, shiver 는 몸 전체가 잘게 떤다.
 */
import { createContext, useContext, type JSX, type ReactNode } from 'react'

export type Expression =
  | 'neutral'
  | 'smile'
  | 'awkward' // 떨떠름 · 당황
  | 'nod' // 끄덕
  | 'sweat' // 급함 · 식은땀
  | 'shiver' // 추워서 오들오들
  | 'pleading' // 다급한 부탁
  | 'proud' // 뿌듯 · 설렘
  | 'curious' // 궁금
  | 'yummy' // 맛있음
  | 'friendly' // 친절하게 건네는 밝은 얼굴
export type Speaker = 'A' | 'B'
export type Gesture = 'wave' | 'cup'
/** 3대 감정 포즈 — 팔 · 손 · 소품(땀 · 물음표)이 달라진다 */
export type Emotion = 'neutral' | 'confused' | 'happy' | 'curious'

/** 표정 → 포즈. 표정은 11가지지만 팔 동작은 이 넷 중 하나다 */
export function emotionOf(e: Expression): Emotion {
  if (e === 'awkward' || e === 'sweat' || e === 'shiver') return 'confused'
  if (e === 'friendly' || e === 'proud' || e === 'pleading') return 'happy'
  if (e === 'curious') return 'curious'
  return 'neutral'
}

export const INK = '#111111'
export const RED = '#C8102E'

export type CharTheme = { ink: string; paper: string; accent: string; hair?: string; blush?: string; shade?: string }
export const DEFAULT_THEME: CharTheme = { ink: INK, paper: '#FFFFFF', accent: RED, blush: '#F29A86', shade: 'rgba(17,17,17,0.08)' }
type Ctx = CharTheme & { id: string }
const ThemeCtx = createContext<Ctx>({ ...DEFAULT_THEME, id: 'c' })

/** 획 — 굵기만 고르면 된다. round 끝이라 연필 끝처럼 부드럽다 */
const ln = (T: CharTheme, w = 5.5) => ({ fill: 'none', stroke: T.ink, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const

const EYE_Y = 200
const L = 160
const R = 240

/* ───────── 얼굴 ───────── */

function Eyes({ kind }: { kind: 'dot' | 'big' | 'happy' | 'closed' | 'squeeze' | 'up' | 'worry' }) {
  const T = useContext(ThemeCtx)
  if (kind === 'happy')
    return <path d={`M${L - 13} ${EYE_Y + 4} Q${L} ${EYE_Y - 12} ${L + 13} ${EYE_Y + 4} M${R - 13} ${EYE_Y + 4} Q${R} ${EYE_Y - 12} ${R + 13} ${EYE_Y + 4}`} {...ln(T, 4.5)} />
  if (kind === 'closed')
    return <path d={`M${L - 12} ${EYE_Y - 2} Q${L} ${EYE_Y + 9} ${L + 12} ${EYE_Y - 2} M${R - 12} ${EYE_Y - 2} Q${R} ${EYE_Y + 9} ${R + 12} ${EYE_Y - 2}`} {...ln(T, 4.5)} />
  if (kind === 'squeeze')
    return <path d={`M${L - 12} ${EYE_Y - 6} L${L + 6} ${EYE_Y} L${L - 12} ${EYE_Y + 6} M${R + 12} ${EYE_Y - 6} L${R - 6} ${EYE_Y} L${R + 12} ${EYE_Y + 6}`} {...ln(T, 4)} />
  const big = kind === 'big'
  const r = big ? 8.5 : 7.5
  const dy = kind === 'up' ? -4 : kind === 'worry' ? 2 : 0
  const dx = kind === 'up' ? 3 : 0
  return (
    <g>
      {/* 흰자 윤곽 — 아몬드꼴 */}
      <path d={`M${L - 15} ${EYE_Y} Q${L} ${EYE_Y - (big ? 18 : 13)} ${L + 15} ${EYE_Y} Q${L} ${EYE_Y + (big ? 14 : 9)} ${L - 15} ${EYE_Y} Z M${R - 15} ${EYE_Y} Q${R} ${EYE_Y - (big ? 18 : 13)} ${R + 15} ${EYE_Y} Q${R} ${EYE_Y + (big ? 14 : 9)} ${R - 15} ${EYE_Y} Z`} {...ln(T, 2)} fill={T.paper} opacity={0.9} />
      <circle cx={L + dx} cy={EYE_Y + dy} r={r} fill={T.ink} />
      <circle cx={R + dx} cy={EYE_Y + dy} r={r} fill={T.ink} />
      <circle cx={L + dx + 2.6} cy={EYE_Y + dy - 2.8} r={2.4} fill={T.paper} />
      <circle cx={R + dx + 2.6} cy={EYE_Y + dy - 2.8} r={2.4} fill={T.paper} />
      {/* 윗눈꺼풀 — 굵은 한 획 + 속눈썹 끝 */}
      <path d={`M${L - 16} ${EYE_Y - 3} Q${L} ${EYE_Y - (big ? 20 : 15)} ${L + 15} ${EYE_Y - 4} M${R - 15} ${EYE_Y - 4} Q${R} ${EYE_Y - (big ? 20 : 15)} ${R + 16} ${EYE_Y - 3}`} {...ln(T, 4)} />
      <path d={`M${L - 16} ${EYE_Y - 3} l-5 -3 M${R + 16} ${EYE_Y - 3} l5 -3`} {...ln(T, 2.5)} />
    </g>
  )
}

function Face({ expression, glasses, since }: { expression: Expression; glasses?: boolean; since: number }) {
  const T = useContext(ThemeCtx)
  const brow = (lUp: number, rUp: number, tilt = 0) =>
    `M${L - 18} ${EYE_Y - 28 - lUp + tilt} Q${L} ${EYE_Y - 36 - lUp} ${L + 17} ${EYE_Y - 30 - lUp - tilt} M${R - 17} ${EYE_Y - 30 - rUp - tilt} Q${R} ${EYE_Y - 36 - rUp} ${R + 18} ${EYE_Y - 28 - rUp + tilt}`
  // 걱정 눈썹 — 안쪽 끝이 올라간다
  const worried = `M${L - 18} ${EYE_Y - 26} Q${L - 2} ${EYE_Y - 30} ${L + 16} ${EYE_Y - 40} M${R - 16} ${EYE_Y - 40} Q${R + 2} ${EYE_Y - 30} ${R + 18} ${EYE_Y - 26}`
  let eyes: JSX.Element = <Eyes kind="dot" />
  let brows = brow(0, 0)
  let mouth: JSX.Element = <path d="M186 252 Q200 259 214 252" {...ln(T, 3.5)} />
  let blush = 0.75
  const extras: JSX.Element[] = []
  const t = Math.max(0, since)
  const drop = (x: number, y: number, s = 1) => (
    <path d={`M${x} ${y} C${x - 7 * s} ${y + 13 * s} ${x - 8 * s} ${y + 22 * s} ${x} ${y + 26 * s} C${x + 8 * s} ${y + 22 * s} ${x + 7 * s} ${y + 13 * s} ${x} ${y} Z`} {...ln(T, 2.5)} fill="#BFE3F2" />
  )

  switch (expression) {
    case 'smile':
      eyes = <Eyes kind="happy" />
      mouth = <path d="M176 244 Q200 270 224 244" {...ln(T, 3.8)} />
      blush = 1
      break
    case 'awkward':
      eyes = <Eyes kind="worry" />
      brows = worried
      mouth = <path d="M180 256 Q189 248 198 256 T216 256 T226 253" {...ln(T, 3.5)} />
      extras.push(<g key="d">{drop(298, 146)}</g>)
      break
    case 'nod':
      eyes = <Eyes kind="closed" />
      mouth = <path d="M182 246 Q200 262 218 246" {...ln(T, 3.8)} />
      blush = 1
      break
    case 'sweat': {
      eyes = <Eyes kind="big" />
      brows = worried
      mouth = <path d="M188 252 Q200 246 212 252 Q208 264 200 264 Q192 264 188 252 Z" {...ln(T, 3.5)} fill="#E9897B" />
      const drip = (t % 40) * 0.6
      extras.push(<g key="s1">{drop(300, 140 + drip)}</g>, <g key="s2">{drop(104, 168, 0.8)}</g>)
      blush = 0.9
      break
    }
    case 'shiver': {
      eyes = <Eyes kind="squeeze" />
      brows = worried
      mouth = (
        <g>
          <path d="M180 246 H220 V260 H180 Z" {...ln(T, 3)} fill={T.paper} />
          <path d="M180 253 L186 248 L192 258 L198 248 L204 258 L210 248 L216 258 L220 252" {...ln(T, 2.5)} />
        </g>
      )
      const j = Math.sin(t * 2.2) * 3
      extras.push(<path key="w" d={`M${84 + j} 170 q-10 10 0 20 q10 10 0 20 M${316 - j} 170 q10 10 0 20 q-10 10 0 20`} {...ln(T, 3)} opacity={0.7} />)
      blush = 0.3
      break
    }
    case 'pleading':
      brows = worried
      mouth = <path d="M186 246 Q200 240 214 246 Q212 266 200 266 Q188 266 186 246 Z" {...ln(T, 3.5)} fill="#E9897B" />
      blush = 1.1
      break
    case 'proud': {
      eyes = <Eyes kind="happy" />
      brows = brow(3, 3)
      mouth = <path d="M174 242 Q200 278 226 242 Q200 252 174 242 Z" {...ln(T, 3.5)} fill="#E9897B" />
      blush = 1.4
      const tw = 0.7 + 0.3 * Math.sin(t / 4)
      extras.push(<path key="sp" d="M318 118 v26 M305 131 h26 M86 108 v18 M77 117 h18" stroke={T.accent} strokeWidth={4} strokeLinecap="round" opacity={tw} />)
      break
    }
    case 'curious':
      eyes = <Eyes kind="up" />
      brows = `M${L - 18} ${EYE_Y - 28} Q${L} ${EYE_Y - 33} ${L + 17} ${EYE_Y - 29} M${R - 17} ${EYE_Y - 37} Q${R} ${EYE_Y - 49} ${R + 18} ${EYE_Y - 39}`
      mouth = <path d="M190 254 Q200 250 212 256" {...ln(T, 3.5)} />
      extras.push(
        <g key="q" transform={`translate(0 ${Math.sin(t / 6) * 3})`}>
          <path d="M314 84 q0 -20 20 -20 q20 0 20 18 q0 13 -15 19 q-7 3 -7 14" {...ln(T, 4.5)} />
          <circle cx={332} cy={130} r={4.5} fill={T.ink} />
        </g>,
      )
      break
    case 'yummy': {
      eyes = <Eyes kind="closed" />
      brows = brow(4, 4)
      mouth = (
        <g>
          <path d="M176 244 Q200 270 224 244" {...ln(T, 3.8)} />
          <path d="M206 256 q8 10 16 -2" fill={T.accent} stroke={T.ink} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      )
      blush = 1.4
      extras.push(<path key="sp" d="M320 150 l8 -8 M330 166 h12 M90 150 l-8 -8 M80 166 h-12" {...ln(T, 3.5)} />)
      break
    }
    case 'friendly':
      eyes = <Eyes kind="happy" />
      brows = brow(4, 4)
      mouth = (
        <g>
          <path d="M172 240 Q200 280 228 240 Z" {...ln(T, 3.5)} fill="#E9897B" />
          <path d="M178 243 Q200 251 222 243" stroke={T.paper} strokeWidth={6} strokeLinecap="round" />
        </g>
      )
      blush = 1.2
      break
  }

  return (
    <g>
      {/* 볼터치 — 피치 · 코랄 방사형 그라데이션 */}
      <ellipse cx={140} cy={236} rx={24} ry={14} fill={`url(#${T.id}-blush)`} opacity={blush} />
      <ellipse cx={260} cy={236} rx={24} ry={14} fill={`url(#${T.id}-blush)`} opacity={blush} />
      <path d="M130 232 l6 -4 M142 234 l6 -4 M254 232 l6 -4 M266 234 l6 -4" stroke={T.accent} strokeWidth={1.6} strokeLinecap="round" opacity={0.35 * blush} />
      {glasses && (
        <g>
          {/* 안경테 — 굵은 테 + 안쪽 가는 테로 두께감 */}
          <path d={`M${L - 26} ${EYE_Y} a26 24 0 1 0 52 0 a26 24 0 1 0 -52 0 M${R - 26} ${EYE_Y} a26 24 0 1 0 52 0 a26 24 0 1 0 -52 0`} {...ln(T, 4.5)} />
          <path d={`M${L - 21} ${EYE_Y} a21 19 0 1 0 42 0 a21 19 0 1 0 -42 0 M${R - 21} ${EYE_Y} a21 19 0 1 0 42 0 a21 19 0 1 0 -42 0`} {...ln(T, 1.2)} opacity={0.45} />
          <path d={`M${L + 26} ${EYE_Y - 4} Q200 ${EYE_Y - 13} ${R - 26} ${EYE_Y - 4} M${L - 26} ${EYE_Y - 5} L116 ${EYE_Y - 12} M${R + 26} ${EYE_Y - 5} L284 ${EYE_Y - 12}`} {...ln(T, 4)} />
          <path d={`M${L - 14} ${EYE_Y - 13} l9 -7 M${R - 14} ${EYE_Y - 13} l9 -7`} stroke={T.ink} strokeWidth={2} strokeLinecap="round" opacity={0.3} />
        </g>
      )}
      <path d={brows} {...ln(T, 5)} />
      {eyes}
      {/* 코 */}
      <path d="M202 212 Q196 226 204 230" {...ln(T, 2.8)} />
      {mouth}
      {extras}
    </g>
  )
}

/** 머리 그룹 움직임 — 끄덕 · 갸우뚱 · 뿌듯하게 고개를 든다 */
function headTransform(expression: Expression, since: number) {
  if (expression === 'nod' && since >= 0) {
    const a = Math.max(0, Math.sin((since / 30) * Math.PI * 2 * 1.4)) * 6 * Math.max(0, 1 - since / 40)
    return `rotate(${a} 200 300) translate(0 ${a * 1.2})`
  }
  if (expression === 'curious') return 'rotate(-6 200 300)'
  if (expression === 'proud') return 'rotate(3 200 300) translate(0 -3)'
  if (expression === 'awkward' || expression === 'sweat') return 'rotate(3 200 300)'
  return undefined
}

/* ───────── 팔 · 손 ───────── */

/** 소매 팔 — 굵은 먹선 위에 paper 선을 얹어 소매 윤곽을 만든다. 손목에 소매 끝단 */
function Arm({ d, cuff }: { d: string; cuff?: string }) {
  const T = useContext(ThemeCtx)
  return (
    <g>
      <path d={d} fill="none" stroke={T.ink} strokeWidth={40} strokeLinecap="round" />
      <path d={d} fill="none" stroke={T.paper} strokeWidth={30} strokeLinecap="round" />
      {cuff && <path d={cuff} {...ln(T, 3)} />}
    </g>
  )
}

/** 펼친 손(인사 · 볼에 댄 손) — 원점이 손목, 위로 손가락 */
function OpenHand({ x, y, rot = 0, scale = 1 }: { x: number; y: number; rot?: number; scale?: number }) {
  const T = useContext(ThemeCtx)
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path
        d="M-16 0 C-22 -16 -26 -30 -30 -42 C-33 -50 -24 -54 -20 -46 L-12 -30 L-14 -62 C-15 -72 -3 -73 -3 -63 L-1 -36 L2 -68 C3 -78 15 -77 14 -67 L11 -34 L18 -60 C20 -69 31 -66 29 -57 L20 -26 C18 -8 10 2 -2 4 Z"
        {...ln(T, 4)}
        fill={T.paper}
      />
      <path d="M-6 -20 q6 4 12 0" {...ln(T, 2)} opacity={0.5} />
    </g>
  )
}

/** 쥔 손(턱 괴기 · 머리 긁적) — 원점이 손목 */
function Fist({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  const T = useContext(ThemeCtx)
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-20 0 C-26 -14 -24 -36 -10 -40 C2 -44 18 -42 24 -32 C30 -22 26 -6 16 2 Z" {...ln(T, 4)} fill={T.paper} />
      <path d="M-8 -40 q-2 10 2 16 M4 -42 q-2 10 2 18 M16 -38 q-2 8 2 14" {...ln(T, 2.5)} />
      <path d="M-20 -6 q-12 -10 -4 -22" {...ln(T, 3)} />
    </g>
  )
}

function Pose({ emotion, who, since }: { emotion: Emotion; who: Speaker; since: number }) {
  const T = useContext(ThemeCtx)
  const t = Math.max(0, since)
  if (emotion === 'happy') {
    // 손 인사 — 어깨에서 위로, 손을 좌우로 흔든다
    const a = Math.sin(t / 3) * 9
    return (
      <g>
        <g transform={`rotate(${a} 320 330)`}>
          <Arm d="M314 420 C350 380 352 330 336 290" cuff="M318 300 q18 6 34 -4" />
          <OpenHand x={336} y={286} rot={8} />
        </g>
        <path d="M384 238 q10 8 6 20 M394 222 q14 12 8 30" {...ln(T, 3)} opacity={0.55} />
      </g>
    )
  }
  if (emotion === 'confused') {
    if (who === 'A')
      // 볼에 손을 댄 곤란한 손
      return (
        <g>
          <Arm d="M320 430 C336 380 326 320 296 290" cuff="M282 300 q14 -10 30 -2" />
          <OpenHand x={292} y={292} rot={-28} scale={0.95} />
        </g>
      )
    // 머리를 긁적
    return (
      <g>
        <Arm d="M322 420 C380 360 370 210 318 130" cuff="M302 142 q14 -12 32 -2" />
        <Fist x={312} y={126} rot={-130} />
        <path d="M352 74 q10 -6 18 0 M360 56 q10 -6 18 0" {...ln(T, 3)} opacity={0.6} />
      </g>
    )
  }
  if (emotion === 'curious')
    // 턱 괴기 + 반대 팔 팔짱
    return (
      <g>
        <Arm d="M90 470 C150 492 250 492 300 470" />
        <Arm d="M300 470 C300 410 268 350 234 318" cuff="M222 330 q14 -14 30 -4" />
        <Fist x={226} y={316} rot={-150} />
      </g>
    )
  return null
}

/** 두 손으로 컵을 건넨다 — 가슴 앞 */
function Cup() {
  const T = useContext(ThemeCtx)
  return (
    <g>
      <Arm d="M100 560 C110 500 140 470 170 460" />
      <Arm d="M300 560 C290 500 260 470 230 460" />
      <path d="M168 418 H232 L224 488 Q200 498 176 488 Z" {...ln(T, 4)} fill={T.paper} />
      <path d="M232 432 c22 0 22 34 -4 34" {...ln(T, 4)} />
      <path d="M172 438 H228" stroke={T.accent} strokeWidth={7} />
      <path d="M190 404 q6 -10 0 -20 M210 404 q6 -10 0 -20" {...ln(T, 3)} opacity={0.6} />
      <path d="M164 452 q-10 10 4 22 M236 452 q10 10 -4 22" {...ln(T, 4)} />
    </g>
  )
}

/* ───────── 두 사람 ───────── */

function Neck() {
  const T = useContext(ThemeCtx)
  return (
    <>
      <path d="M178 284 C178 310 177 334 176 356 M222 284 C222 310 223 334 224 356" {...ln(T, 5)} />
      <path d="M180 292 Q200 314 220 292 L221 320 Q200 330 179 320 Z" fill={T.shade} />
    </>
  )
}

function PersonA({ expression, since, gesture }: { expression: Expression; since: number; gesture?: Gesture }) {
  const T = useContext(ThemeCtx)
  const hair = T.hair ?? T.ink
  const strand = { fill: 'none', stroke: T.paper, strokeWidth: 2, strokeLinecap: 'round', opacity: 0.42 } as const
  const emotion = gesture === 'wave' ? 'happy' : emotionOf(expression)
  return (
    <>
      {/* 몸 — 퍼프소매 블라우스 */}
      <path d="M36 600 C34 470 70 392 150 360 L250 360 C330 392 366 470 364 600 Z" {...ln(T, 5.5)} fill={T.paper} />
      <path d="M64 452 C80 420 104 400 132 392 M336 452 C320 420 296 400 268 392" {...ln(T, 3)} />
      <path d="M70 470 q20 -12 40 -4 M290 466 q20 -8 40 4 M78 500 q14 6 26 2 M296 500 q14 6 26 2" {...ln(T, 2.2)} opacity={0.5} />
      <path d="M200 400 V600" {...ln(T, 3)} />
      {[438, 482, 526, 570].map(y => <circle key={y} cx={200} cy={y} r={5} {...ln(T, 2.5)} fill={T.paper} />)}
      <path d="M122 430 Q118 500 124 560 M278 430 Q282 500 276 560" {...ln(T, 2.2)} opacity={0.4} />
      {/* 둥근 깃 — 두 장, 안쪽 바늘땀 */}
      <path d="M168 354 C140 370 140 404 172 408 C192 410 200 394 200 380 C200 394 208 410 228 408 C260 404 260 370 232 354" {...ln(T, 4)} fill={T.paper} />
      <path d="M170 366 C154 376 156 398 174 399 M230 366 C246 376 244 398 226 399" {...ln(T, 1.5)} strokeDasharray="4 5" opacity={0.55} />
      <Neck />
      {gesture === 'cup' && <Cup />}
      <g transform={headTransform(expression, since)}>
        {/* 뒷머리(단발) — 끝이 안쪽으로, 결 */}
        <path d="M96 202 C88 110 140 66 204 66 C270 68 314 112 304 202 C302 240 308 262 318 288 C298 302 270 296 256 280 L144 280 C128 296 100 302 82 288 C92 262 98 240 96 202 Z" fill={hair} />
        <path d="M110 232 Q114 266 98 284 M290 232 Q286 266 302 284 M124 140 Q108 196 116 252 M278 140 Q296 196 286 252 M136 120 Q118 170 122 230 M266 120 Q286 170 280 230" {...strand} />
        {/* 얼굴 — 갸름한 턱선 */}
        <path d="M116 190 C116 128 152 104 200 104 C248 104 284 128 284 190 C284 246 254 292 200 296 C146 292 116 246 116 190 Z" {...ln(T, 5.5)} fill={T.paper} />
        <path d="M118 196 C100 190 98 226 120 232" {...ln(T, 4)} fill={T.paper} />
        <path d="M282 196 C300 190 302 226 280 232" {...ln(T, 4)} fill={T.paper} />
        <path d="M110 212 q4 6 10 6 M290 212 q-4 6 -10 6" {...ln(T, 2)} />
        {/* 앞머리 — 비스듬히, 결 */}
        <path d="M104 186 C112 116 160 82 210 84 C258 86 294 120 300 186 C280 152 254 132 224 132 C212 146 188 160 146 166 C130 168 114 176 104 186 Z" fill={hair} />
        <path d="M150 100 Q132 130 126 166 M172 94 Q156 126 146 162 M196 90 Q182 120 170 156 M226 98 Q214 120 204 142 M256 110 Q272 140 280 172 M276 124 Q290 150 292 176" {...strand} />
        <path d="M146 166 Q196 152 268 160" {...ln(T, 2)} opacity={0.25} />
        <Face expression={expression} since={since} />
        {/* 빨간 머리핀 */}
        <path d="M240 112 L284 128" stroke={T.accent} strokeWidth={11} strokeLinecap="round" />
        <path d="M244 112 L280 125" stroke={T.paper} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      </g>
      {/* 팔 포즈는 머리 위에 얹는다 — 볼 · 턱에 댄 손이 얼굴 앞에 보이게 */}
      {gesture !== 'cup' && <Pose emotion={emotion} who="A" since={since} />}
    </>
  )
}

function PersonB({ expression, since, gesture }: { expression: Expression; since: number; gesture?: Gesture }) {
  const T = useContext(ThemeCtx)
  const hair = T.hair ?? T.ink
  const strand = { fill: 'none', stroke: T.paper, strokeWidth: 2, strokeLinecap: 'round', opacity: 0.42 } as const
  const emotion = gesture === 'wave' ? 'happy' : emotionOf(expression)
  return (
    <>
      {/* 재킷 */}
      <path d="M32 600 C32 456 92 374 170 354 L230 354 C308 374 368 456 368 600 Z" {...ln(T, 5.5)} fill={T.paper} />
      {/* 셔츠 앞판 + 단추 */}
      <path d="M156 380 L200 470 L244 380" {...ln(T, 3)} fill={T.paper} />
      <path d="M200 470 V600" {...ln(T, 2.5)} />
      {[500, 548].map(y => <circle key={y} cx={200} cy={y} r={4.5} {...ln(T, 2.2)} fill={T.paper} />)}
      {/* 재킷 라펠 */}
      <path d="M156 378 L120 450 L150 446 L136 520 M244 378 L280 450 L250 446 L264 520" {...ln(T, 4)} />
      <path d="M136 520 L178 600 M264 520 L222 600" {...ln(T, 3)} />
      {/* 셔츠 깃 */}
      <path d="M170 354 L200 404 L230 354 M170 354 L150 392 L188 392 M230 354 L250 392 L212 392" {...ln(T, 3.5)} fill={T.paper} />
      {/* 주머니 + 빨간 펜 */}
      <path d="M276 478 h44 v40 h-44 Z" {...ln(T, 3)} />
      <path d="M276 488 h44" {...ln(T, 2)} opacity={0.5} />
      <path d="M290 462 v26" stroke={T.accent} strokeWidth={7} strokeLinecap="round" />
      <path d="M290 462 v6" stroke={T.ink} strokeWidth={7} strokeLinecap="round" />
      <path d="M84 470 q10 30 6 80 M316 470 q-10 30 -6 80" {...ln(T, 2)} opacity={0.4} />
      <Neck />
      {gesture === 'cup' && <Cup />}
      <g transform={headTransform(expression, since)}>
        <path d="M118 196 C100 190 98 228 120 232" {...ln(T, 4)} fill={T.paper} />
        <path d="M282 196 C300 190 302 228 280 232" {...ln(T, 4)} fill={T.paper} />
        {/* 얼굴 — 각진 턱 */}
        <path d="M116 180 C116 118 154 94 200 94 C246 94 284 118 284 180 C284 238 270 280 232 294 C214 300 186 300 168 294 C130 280 116 238 116 180 Z" {...ln(T, 5.5)} fill={T.paper} />
        {/* 흐트러진 짧은 머리 — 삐친 끝 · 결 */}
        <path d="M106 176 C96 104 144 62 204 64 C266 66 306 104 294 176 C288 150 272 134 252 126 C236 138 210 142 186 128 C164 140 132 150 106 176 Z" fill={hair} />
        <path d="M140 80 l-10 -16 M164 68 l-6 -18 M192 62 l0 -18 M220 64 l6 -18 M246 72 l12 -14 M270 88 l16 -8 M124 98 l-14 -6" {...ln(T, 4.5)} />
        <path d="M132 110 Q156 96 178 106 M196 94 Q224 84 250 98 M262 110 Q280 124 286 146 M124 136 Q136 122 154 118 M188 112 Q206 104 226 110" {...strand} />
        <path d="M116 176 Q114 198 118 216 M284 176 Q286 198 282 216" {...ln(T, 3)} />
        <Face expression={expression} since={since} glasses />
      </g>
      {gesture !== 'cup' && <Pose emotion={emotion} who="B" since={since} />}
    </>
  )
}

/** 연필 손그림 결 — 선이 아주 조금 흔들리게 · 볼터치 그라데이션 */
function Defs({ id, blush }: { id: string; blush: string }): ReactNode {
  return (
    <defs>
      <filter id={`${id}-pencil`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <radialGradient id={`${id}-blush`}>
        <stop offset="0%" stopColor={blush} stopOpacity={0.75} />
        <stop offset="60%" stopColor={blush} stopOpacity={0.35} />
        <stop offset="100%" stopColor={blush} stopOpacity={0} />
      </radialGradient>
    </defs>
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
  /** 지금 표정이 시작된 뒤 지난 프레임 — 끄덕 · 떨림 · 땀 · 손 인사 움직임에 쓴다 */
  since?: number
  height: number
  flip?: boolean
  theme?: CharTheme
  gesture?: Gesture
}) {
  const T = { ...DEFAULT_THEME, ...theme }
  // 같은 화면에 여러 장이 있어도 필터 · 그라데이션 id 가 겹치지 않게 사람 · 테마 색으로 짓는다
  const id = `ch-${who}-${(T.ink + T.paper + T.blush).replace(/[^0-9a-z]/gi, '')}`
  const shake = expression === 'shiver' ? Math.sin(since * 2.4) * 2.5 : 0
  return (
    <ThemeCtx.Provider value={{ ...T, id }}>
      <svg
        viewBox="0 0 400 560"
        width={(height * 400) / 560}
        height={height}
        style={{ overflow: 'visible', display: 'block', transform: `${flip ? 'scaleX(-1) ' : ''}translateX(${shake}px)` }}
      >
        <Defs id={id} blush={T.blush ?? DEFAULT_THEME.blush!} />
        <g filter={`url(#${id}-pencil)`}>
          {who === 'A' ? <PersonA expression={expression} since={since} gesture={gesture} /> : <PersonB expression={expression} since={since} gesture={gesture} />}
        </g>
      </svg>
    </ThemeCtx.Provider>
  )
}

/** 글마다 고르는 배역 표정 — videos.json 의 cast. 표정이 포즈(emotionOf)까지 정한다 */
export type Cast = { a: Expression; b: Expression; aGesture?: Gesture; bGesture?: Gesture }
