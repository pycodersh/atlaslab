/**
 * K-Pantry 아이콘 공통 props — lucide-react SVG 를 글자 줄에 맞춰 끼운다.
 * 예전 이모지(⏱ 📊 🔥 …)는 OS·브라우저마다 모양·색이 달라 벡터 아이콘으로 바꿨다.
 * Tailwind preflight 가 svg 를 display:block 으로 두므로 inline-block 을 명시한다.
 * 색은 currentColor(주변 글자색)를 따르고, 강조가 필요한 곳만 color 를 따로 준다.
 */
export const META_ICON = {
  size: 13,
  strokeWidth: 2,
  'aria-hidden': true,
  style: { display: 'inline-block', verticalAlign: '-2px', marginRight: 4, flexShrink: 0 },
} as const

/** 버튼·제목 안 아이콘 — 글자보다 조금 크게 */
export const INLINE_ICON = {
  size: 16,
  strokeWidth: 2,
  'aria-hidden': true,
  style: { display: 'inline-block', verticalAlign: '-3px', marginRight: 6, flexShrink: 0 },
} as const

/** 이미지 없는 자리·빈 상태에 쓰는 큰 아이콘 */
export const PLACEHOLDER_ICON = {
  strokeWidth: 1.5,
  'aria-hidden': true,
  color: '#A3A3A3',
} as const
