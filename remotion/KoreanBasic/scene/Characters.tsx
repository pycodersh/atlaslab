/**
 * Basics 캐릭터 2명 — 손그림 일러스트 에셋(투명 PNG)을 그대로 쓴다(2026-11-21, 코드로 그린 SVG 를 대체).
 *
 *   A  말하는 사람(학습자 역) · 여성 — 단발 · 빨간 머리핀 · 둥근 깃 블라우스
 *   B  듣는 사람(한국인 역) · 남성 — 짧은 머리 · 둥근 안경 · 셔츠 · 주머니의 빨간 펜
 *
 * 에셋: public/images/characters/{a|b}-{confused|happy|curious}.png — scripts/basics-character-assets.mjs 가
 *       캐릭터 시트 한 장(assets/characters/character-sheet.png)에서 잘라 배경을 투명하게 만든다. 시트를 바꾸면 그 스크립트만 다시 돌린다.
 *
 * 3대 감정 포즈:
 *   confused  걱정 · 당황 — A 는 볼에 손 + 땀방울, B 는 머리를 긁적
 *   happy     활짝 웃으며 손 인사
 *   curious   턱을 괴고 갸우뚱 + 물음표
 * 글마다 고른 표정(Expression, videos.json 의 cast)을 emotionOf 로 이 셋 중 하나에 맞춘다.
 * 끄덕(nod) · 오들오들(shiver)은 그림 전체를 살짝 숙이거나 떨게 해 움직임만 더한다.
 */
import { Img, staticFile } from 'remotion'

export type Expression =
  | 'neutral'
  | 'smile'
  | 'awkward' // 떨떠름 · 당황
  | 'nod' // 끄덕
  | 'sweat' // 급함 · 식은땀
  | 'shiver' // 추워서 오들오들
  | 'pleading' // 다급한 부탁(손짓)
  | 'proud' // 뿌듯 · 설렘
  | 'curious' // 궁금
  | 'yummy' // 맛있음
  | 'friendly' // 친절하게 건네는 밝은 얼굴
export type Speaker = 'A' | 'B'
export type Gesture = 'wave' | 'cup'
export type Emotion = 'confused' | 'happy' | 'curious'

/** 표정 → 그림(포즈) */
export function emotionOf(e: Expression): Emotion {
  if (e === 'awkward' || e === 'sweat' || e === 'shiver') return 'confused'
  if (e === 'curious') return 'curious'
  return 'happy'
}

/** 그림 상자의 가로 · 세로 비 — 에셋 폭이 조금씩 달라 상자는 고정하고 그림은 아래 가운데에 맞춘다 */
export const CHAR_ASPECT = 0.72

export function Character({
  who,
  expression,
  since = 0,
  height,
  flip,
  gesture,
}: {
  who: Speaker
  expression: Expression
  /** 지금 표정이 시작된 뒤 지난 프레임 — 끄덕 · 떨림 움직임에 쓴다 */
  since?: number
  height: number
  flip?: boolean
  /** wave 는 손 인사(happy) 그림으로, cup 은 따로 그림이 없어 표정대로 둔다 */
  gesture?: Gesture
}) {
  const emotion: Emotion = gesture === 'wave' ? 'happy' : emotionOf(expression)
  const t = Math.max(0, since)
  const nod = expression === 'nod' ? Math.max(0, Math.sin((t / 30) * Math.PI * 2 * 1.4)) * 3 * Math.max(0, 1 - t / 40) : 0
  const shake = expression === 'shiver' ? Math.sin(t * 2.4) * 2.5 : 0
  return (
    <div style={{ position: 'relative', width: height * CHAR_ASPECT, height, transform: `${flip ? 'scaleX(-1) ' : ''}translateX(${shake}px) rotate(${nod}deg)`, transformOrigin: '50% 100%' }}>
      <Img
        src={staticFile(`images/characters/${who.toLowerCase()}-${emotion}.png`)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%' }}
      />
    </div>
  )
}

/** 글마다 고르는 배역 표정 — videos.json 의 cast. 표정이 그림(emotionOf)까지 정한다 */
export type Cast = { a: Expression; b: Expression; aGesture?: Gesture; bGesture?: Gesture }
