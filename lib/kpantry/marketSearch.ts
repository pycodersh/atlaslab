/**
 * 내 주변 한인 마트 찾기 — Places API 없이 Google Maps 검색 결과를 새 탭으로 연다.
 * 위치 권한을 우리가 요청하지 않는다. "near me" 는 Google Maps 가 사용자의 위치로 풀어 준다.
 * 사용자가 입력한 우편번호·도시만 이 기기(localStorage)에 남긴다. 좌표는 다루지 않는다.
 */

export type MarketKind = 'korean' | 'asian'

const QUERY: Record<MarketKind, string> = {
  korean: 'korean grocery store',
  asian: 'asian grocery store',
}

/** location 이 비면 "near me" */
export function buildMarketSearchUrl(kind: MarketKind, location?: string): string {
  const where = location?.trim() ? `near ${location.trim()}` : 'near me'
  const query = `${QUERY[kind]} ${where}`.replace(/\s+/g, ' ')
  // api=1 형식은 공백을 + 로 받는다 — encodeURIComponent 결과의 %20 을 + 로 바꾼다
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query).replace(/%20/g, '+')}`
}

const LOCATION_KEY = 'k_pantry_location'

export function readSavedLocation(): string {
  try {
    return (localStorage.getItem(LOCATION_KEY) ?? '').slice(0, 80)
  } catch {
    return ''
  }
}

export function writeSavedLocation(value: string) {
  try {
    const v = value.trim().slice(0, 80)
    if (v) localStorage.setItem(LOCATION_KEY, v)
    else localStorage.removeItem(LOCATION_KEY)
  } catch { /* 저장 못 해도 검색은 그대로 된다 */ }
}
