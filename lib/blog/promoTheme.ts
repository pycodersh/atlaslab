/**
 * 글 하단 프로모션 박스(앱 안내 ArticleAppBanner · PDF 패키지 PdfPromoBanner) 공용 디자인 토큰.
 * 두 박스가 위아래로 이어져 한 세트로 보이도록 색·글꼴·간격을 한 곳에서 관리한다.
 * 버튼의 hover 는 인라인 스타일로 못 하므로 .promo-btn / .promo-card 규칙은 app/globals.css 에 있다.
 */
export const PROMO = {
  espresso: '#2B1D17',
  brick: '#C8102E',      // 사이트 기본 레드(상단 선·버튼·라벨)
  brickDark: '#A30D25',  // hover
  sand: '#F4EDE0',
  line: '#E3D6C4',
  muted: '#6B544A',
  serif: '"Playfair Display", Georgia, serif',
  body: '"DM Sans", "Inter", system-ui, sans-serif',
} as const

/** 박스 껍데기: Sand 배경 + 위쪽 4px 테라코타 선 */
export const promoCardStyle = {
  background: PROMO.sand,
  border: `1px solid ${PROMO.line}`,
  borderTop: `4px solid ${PROMO.brick}`,
  padding: '32px 24px 30px',
  margin: '40px 0 8px',
  textAlign: 'center',
} as const

/** 작은 대문자 라벨 */
export const promoEyebrowStyle = {
  fontFamily: PROMO.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: PROMO.brick,
  margin: '0 0 12px',
} as const

/** 타이틀(세리프) */
export const promoTitleStyle = {
  fontFamily: PROMO.serif,
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  color: PROMO.espresso,
  margin: '0 auto 14px',
  maxWidth: 480,
} as const

/** 서브 텍스트 */
export const promoBodyStyle = {
  fontFamily: PROMO.body,
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 1.7,
  color: PROMO.muted,
  margin: '0 auto 24px',
  maxWidth: 520,
} as const
