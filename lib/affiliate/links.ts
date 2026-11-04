/** 제휴 링크 — 배너가 여기 값을 쓴다 */

/** Klook 제휴 ID — aid 가 붙어야 클릭이 수수료로 잡힌다 */
const KLOOK_AID = '138930'
/** Klook 한국(국가 ID 10) 여행 탐색 페이지.
 *  ID 는 슬러그 글자가 아니라 숫자로 정해진다: country/14 는 대만, country/12 는 일본으로 갔다.
 *  한국은 10 — Klook 이 색인한 'Places to visit in South Korea'(coureg/10) · attractions/south-korea/g10 로 확인(2026-10-27) */
export const KLOOK_URL = `https://www.klook.com/en-US/coureg/10-south-korea-things-to-do/?aid=${KLOOK_AID}`
