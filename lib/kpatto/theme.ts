/**
 * K-PATTO 테마 컬러 — 비비드 탠저린 코랄.
 * 예전 황토 오렌지(#D4873A)를 대체한다. CSS 에서는 app/kpatto/kpatto.css 의 --kp-* 변수와 같은 값을 쓴다.
 * 활성 탭·주요 버튼·에피소드 태그·강조 숫자·패턴 카드 포인트에 primary,
 * 카드/배지 배경 틴트에 primaryLight, 연한 테두리에 primaryBorder 를 쓴다.
 */
export const KP = {
  primary: '#FF5A36',
  primaryHover: '#E04826',
  primaryLight: '#FFF3F0',
  primaryBorder: '#FFD6CC',
  /** 하단 탭 비활성(= Tailwind gray-400) */
  inactive: '#9CA3AF',
} as const
