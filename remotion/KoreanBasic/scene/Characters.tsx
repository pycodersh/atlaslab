/**
 * Basics 상황 장면의 고정 캐릭터 2명 — 홈 히어로와 같은 펜화 결(먹선 #111111, 포인트만 #C8102E).
 *
 *   A  말하는 사람(학습자 역) · 여성 — 단발 · 앞머리 · 빨간 머리핀. 한국어 대사 음성(SunHi)과 맞춘다
 *   B  듣는 사람(한국인 역) · 남성 — 짧은 머리 · 둥근 안경 · 셔츠 깃
 *
 * 상반신 정면, viewBox 400×560(아래쪽은 화면 밖으로 잘려도 된다).
 * 몸 · 머리 · 얼굴을 그룹으로 나눴다 — 표정은 <Face> 만 바뀌고, nod 는 머리 그룹만 끄덕인다.
 * 면은 흰색으로 채워 뒤 배경 선을 가린다.
 */
import { createContext, useContext } from 'react'
export type Expression = 'neutral' | 'awkward' | 'smile' | 'nod'
export type Speaker = 'A' | 'B'

export const INK = '#111111'
export const RED = '#C8102E'
const SW = 5

export type CharTheme = { ink: string; paper: string; accent: string; /** 머리 채움 — 어두운 배경에서 선 색으로 채우면 흰 머리가 된다 */ hair?: string }
export const DEFAULT_THEME: CharTheme = { ink: INK, paper: '#fff', accent: RED }
/** 썸네일 배경(검정 · 빨강)에서도 쓰도록 선 · 면 · 포인트 색을 바꾼다 — 기본은 영상의 크림 배경용 */
const ThemeCtx = createContext<CharTheme>(DEFAULT_THEME)
const lineOf = (T: CharTheme) => ({ fill: 'none', stroke: T.ink, strokeWidth: SW, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const

/** 표정 — 눈 · 눈썹 · 입만. 두 캐릭터가 같은 얼굴 좌표(머리 중심 200,190)를 쓴다 */
function Face({ expression, glasses }: { expression: Expression; glasses?: boolean }) {
  const T = useContext(ThemeCtx)
  const eyeY = 196
  const L = 162, R = 238
  let eyes, brows, mouth, extra = null
  switch (expression) {
    case 'awkward':
      eyes = (
        <>
          <circle cx={L} cy={eyeY} r={6.5} fill={T.ink} />
          <circle cx={R} cy={eyeY} r={6.5} fill={T.ink} />
        </>
      )
      // 한쪽 눈썹만 올라간 떨떠름한 얼굴 + 물결 입 + 땀 한 방울
      brows = <path d={`M${L - 18} ${eyeY - 26} L${L + 16} ${eyeY - 22} M${R - 16} ${eyeY - 30} Q${R} ${eyeY - 42} ${R + 18} ${eyeY - 32}`} {...lineOf(T)} strokeWidth={3.5} />
      mouth = <path d="M176 252 Q186 244 196 252 T216 252 T228 249" {...lineOf(T)} strokeWidth={3.5} />
      extra = <path d="M292 150 C286 162 284 170 292 174 C300 170 298 162 292 150 Z" {...lineOf(T)} strokeWidth={3} />
      break
    case 'smile':
      eyes = <path d={`M${L - 11} ${eyeY + 2} Q${L} ${eyeY - 10} ${L + 11} ${eyeY + 2} M${R - 11} ${eyeY + 2} Q${R} ${eyeY - 10} ${R + 11} ${eyeY + 2}`} {...lineOf(T)} strokeWidth={3.5} />
      brows = <path d={`M${L - 16} ${eyeY - 28} Q${L} ${eyeY - 34} ${L + 16} ${eyeY - 28} M${R - 16} ${eyeY - 28} Q${R} ${eyeY - 34} ${R + 16} ${eyeY - 28}`} {...lineOf(T)} strokeWidth={3.5} />
      mouth = <path d="M172 240 Q200 272 228 240" {...lineOf(T)} strokeWidth={3.5} />
      extra = <path d="M138 228 l10 -4 M140 236 l10 -4 M252 224 l10 4 M250 232 l10 4" stroke={T.accent} strokeWidth={3} strokeLinecap="round" opacity={0.75} />
      break
    case 'nod':
      eyes = <path d={`M${L - 11} ${eyeY - 2} Q${L} ${eyeY + 8} ${L + 11} ${eyeY - 2} M${R - 11} ${eyeY - 2} Q${R} ${eyeY + 8} ${R + 11} ${eyeY - 2}`} {...lineOf(T)} strokeWidth={3.5} />
      brows = <path d={`M${L - 16} ${eyeY - 26} Q${L} ${eyeY - 31} ${L + 16} ${eyeY - 26} M${R - 16} ${eyeY - 26} Q${R} ${eyeY - 31} ${R + 16} ${eyeY - 26}`} {...lineOf(T)} strokeWidth={3.5} />
      mouth = <path d="M180 244 Q200 258 220 244" {...lineOf(T)} strokeWidth={3.5} />
      break
    default:
      eyes = (
        <>
          <circle cx={L} cy={eyeY} r={6.5} fill={T.ink} />
          <circle cx={R} cy={eyeY} r={6.5} fill={T.ink} />
        </>
      )
      brows = <path d={`M${L - 16} ${eyeY - 26} Q${L} ${eyeY - 31} ${L + 16} ${eyeY - 26} M${R - 16} ${eyeY - 26} Q${R} ${eyeY - 31} ${R + 16} ${eyeY - 26}`} {...lineOf(T)} strokeWidth={3.5} />
      mouth = <path d="M184 246 Q200 254 216 246" {...lineOf(T)} strokeWidth={3.5} />
  }
  return (
    <g>
      {glasses && (
        <path
          d={`M${L - 24} ${eyeY} a24 22 0 1 0 48 0 a24 22 0 1 0 -48 0 M${R - 24} ${eyeY} a24 22 0 1 0 48 0 a24 22 0 1 0 -48 0 M${L + 24} ${eyeY - 3} Q200 ${eyeY - 10} ${R - 24} ${eyeY - 3}`}
          {...lineOf(T)} strokeWidth={3.5}
        />
      )}
      {brows}
      {eyes}
      {/* 코 */}
      <path d="M200 206 Q196 222 204 226" {...lineOf(T)} strokeWidth={3} />
      {mouth}
      {extra}
    </g>
  )
}

/** 고개 끄덕임 — nod 표정일 때 머리 그룹만 아래로 살짝 숙였다 올라온다(frame 은 표정이 바뀐 뒤 경과 프레임) */
function nodTransform(expression: Expression, since: number) {
  if (expression !== 'nod' || since < 0) return undefined
  const a = Math.max(0, Math.sin((since / 30) * Math.PI * 2 * 1.4)) * 6 * Math.max(0, 1 - since / 40)
  return `rotate(${a} 200 300) translate(0 ${a * 1.2})`
}

function PersonA({ expression, since }: { expression: Expression; since: number }) {
  const T = useContext(ThemeCtx)
  return (
    <>
      {/* 몸 — 둥근 깃 블라우스 */}
      <path d="M40 600 C40 450 92 372 170 352 L230 352 C308 372 360 450 360 600 Z" {...lineOf(T)} fill={T.paper} />
      <path d="M170 352 Q200 392 230 352 M200 380 V600" {...lineOf(T)} strokeWidth={3.5} />
      <path d="M118 470 Q122 540 120 600 M282 470 Q278 540 280 600" {...lineOf(T)} strokeWidth={3.5} opacity={0.6} />
      {/* 목 */}
      <path d="M178 290 V352 M222 290 V352" {...lineOf(T)} />
      <g transform={nodTransform(expression, since)}>
        {/* 뒷머리(단발) — 머리보다 넓게, 턱선까지 */}
        <path d="M100 196 C96 112 140 74 200 74 C262 74 306 112 300 196 C298 236 304 262 312 284 C284 292 262 284 252 268 L148 268 C138 284 116 292 88 284 C96 262 102 236 100 196 Z" fill={T.hair ?? T.ink} />
        {/* 얼굴 */}
        <ellipse cx={200} cy={196} rx={86} ry={98} {...lineOf(T)} fill={T.paper} />
        {/* 앞머리 */}
        <path d="M112 176 C122 118 162 92 206 94 C252 96 286 124 292 176 C268 150 240 136 214 140 C200 150 178 160 112 176 Z" fill={T.hair ?? T.ink} />
        {/* 귀 */}
        <path d="M114 196 C100 192 98 222 116 226" {...lineOf(T)} strokeWidth={3.5} />
        <path d="M286 196 C300 192 302 222 284 226" {...lineOf(T)} strokeWidth={3.5} />
        <Face expression={expression} />
        {/* 빨간 머리핀 */}
        <path d="M244 118 L280 132" stroke={T.accent} strokeWidth={9} strokeLinecap="round" />
      </g>
    </>
  )
}

function PersonB({ expression, since }: { expression: Expression; since: number }) {
  const T = useContext(ThemeCtx)
  return (
    <>
      {/* 몸 — 셔츠 + 깃 */}
      <path d="M36 600 C36 444 94 368 172 352 L228 352 C306 368 364 444 364 600 Z" {...lineOf(T)} fill={T.paper} />
      <path d="M172 352 L200 404 L228 352 M172 352 L150 392 L188 388 M228 352 L250 392 L212 388" {...lineOf(T)} strokeWidth={3.5} fill={T.paper} />
      <path d="M200 404 V600" {...lineOf(T)} strokeWidth={3.5} />
      <circle cx={200} cy={448} r={4} fill={T.ink} />
      <circle cx={200} cy={500} r={4} fill={T.ink} />
      <path d="M256 456 h40 v34 h-40 Z" {...lineOf(T)} strokeWidth={3.5} opacity={0.7} />
      <path d="M266 448 v12" stroke={T.accent} strokeWidth={5} strokeLinecap="round" />
      {/* 목 */}
      <path d="M176 288 V352 M224 288 V352" {...lineOf(T)} />
      <g transform={nodTransform(expression, since)}>
        {/* 귀 */}
        <path d="M118 194 C102 188 100 224 120 228" {...lineOf(T)} strokeWidth={3.5} fill={T.paper} />
        <path d="M282 194 C298 188 300 224 280 228" {...lineOf(T)} strokeWidth={3.5} fill={T.paper} />
        {/* 얼굴 — A 보다 각진 턱 */}
        <path d="M116 176 C116 116 154 92 200 92 C246 92 284 116 284 176 C284 236 268 278 230 292 C214 298 186 298 170 292 C132 278 116 236 116 176 Z" {...lineOf(T)} fill={T.paper} />
        {/* 짧은 머리 — 정수리만 덮는다 */}
        <path d="M110 170 C104 106 146 72 202 74 C258 76 298 110 290 170 C282 150 270 138 252 132 C232 140 196 140 168 128 C146 138 124 150 110 170 Z" fill={T.hair ?? T.ink} />
        <Face expression={expression} glasses />
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
}: {
  who: Speaker
  expression: Expression
  /** 지금 표정이 시작된 뒤 지난 프레임 — nod 동작에 쓴다 */
  since?: number
  height: number
  /** 서로 마주 보게 살짝 돌린 느낌을 주려고 좌우를 뒤집는다(얼굴이 대칭이라 핀 · 주머니 위치만 바뀐다) */
  flip?: boolean
  theme?: CharTheme
}) {
  return (
    <ThemeCtx.Provider value={theme ?? DEFAULT_THEME}>
    <svg viewBox="0 0 400 560" width={(height * 400) / 560} height={height} style={{ overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}>
      {who === 'A' ? <PersonA expression={expression} since={since} /> : <PersonB expression={expression} since={since} />}
    </svg>
    </ThemeCtx.Provider>
  )
}
