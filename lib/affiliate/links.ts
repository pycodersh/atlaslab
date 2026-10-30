/**
 * 제휴 링크 — 배너 · 본문 인라인 링크가 모두 여기 값을 쓴다.
 *
 * Airalo 는 Impact 승인 전이라 아직 추적 파라미터가 없는 일반 상품 페이지다.
 * 승인되면 Vercel 환경변수 AIRALO_URL 에 Impact 추적 링크를 넣고 재배포하면 된다(코드 수정 없음).
 * 본문(DB) 의 <AiraloLink> 도 이 값을 읽으므로 글을 다시 발행할 필요가 없다.
 */
export const AIRALO_URL = process.env.AIRALO_URL || 'https://www.airalo.com/south-korea-esim'
