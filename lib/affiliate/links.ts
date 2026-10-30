/**
 * 제휴 링크 — 배너 · 본문 인라인 링크가 모두 여기 값을 쓴다.
 *
 * Airalo 는 Impact 승인 전이라 아직 추적 파라미터가 없는 일반 상품 페이지다.
 * 승인되면 Vercel 환경변수 AIRALO_URL 에 Impact 추적 링크를 넣고 재배포하면 된다(코드 수정 없음).
 * 본문(DB) 의 <AiraloLink> 도 이 값을 읽으므로 글을 다시 발행할 필요가 없다.
 */
export const AIRALO_URL = process.env.AIRALO_URL || 'https://www.airalo.com/south-korea-esim'

/** Klook 제휴 ID — aid 가 붙어야 클릭이 수수료로 잡힌다 */
const KLOOK_AID = '138930'
/** Klook 한국(국가 ID 10) 여행 탐색 페이지.
 *  ID 는 슬러그 글자가 아니라 숫자로 정해진다: country/14 는 대만, country/12 는 일본으로 갔다.
 *  한국은 10 — Klook 이 색인한 'Places to visit in South Korea'(coureg/10) · attractions/south-korea/g10 로 확인(2026-10-27) */
export const KLOOK_URL = `https://www.klook.com/en-US/coureg/10-south-korea-things-to-do/?aid=${KLOOK_AID}`
