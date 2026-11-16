/**
 * 펜화 지도(Explore Korea 지도 · Hotspot Finder 지도) 공용 좌표계.
 *
 * 그림은 scripts/make-penmap.mts 가 public/maps/penmap-v1.svg 로 굽고(해안 · 도 경계 · 강 · 산 · 물결 해칭),
 * 핀 · 글자는 화면(components/maps/PenMap.tsx)이 이 투영으로 같은 자리에 얹는다.
 * 투영: 등장방형(위도 36° 기준 cos 보정) — 1 단위 ≈ 100 m. 남한 전체가 약 5,900 × 6,500 단위.
 */
export type LL = [number, number] // [lat, lon]
export type Box = { x: number; y: number; w: number; h: number }

export const LON0 = 124.5
export const LAT0 = 38.9
export const KX = 111.32 * Math.cos((36 * Math.PI) / 180) * 10 // 경도 1° → 단위
export const KY = 111.32 * 10 // 위도 1° → 단위

export const project = (lat: number, lon: number): [number, number] => [(lon - LON0) * KX, (LAT0 - lat) * KY]

/** [남, 서, 북, 동] 위경도 상자 → 지도 단위 상자 */
export const boxOf = ([s, w, n, e]: [number, number, number, number]): Box => {
  const [x0, y0] = project(n, w)
  const [x1, y1] = project(s, e)
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

/** 남한 전체(울릉도 포함, 제주 아래까지) */
export const NATIONAL_BBOX: [number, number, number, number] = [33.0, 125.0, 38.75, 131.0]
export const NATIONAL = boxOf(NATIONAL_BBOX)
/** 그림이 덮는 전체 범위(북한 일부 · 바다 여백) */
export const CANVAS = boxOf([32.6, 124.5, 38.9, 131.3])

/** 지역 상세 범위 — 생성기가 이 상자마다 시군구 해안선 · 경계 · 강 · 물 · 봉우리를 굽는다 */
export const REGION_BBOX: Record<string, [number, number, number, number]> = {
  seoul: [37.42, 126.76, 37.72, 127.19],
  // 인천 — 영종도(공항 · 파라다이스시티 · 인스파이어)부터 송도까지
  incheon: [37.36, 126.36, 37.53, 126.72],
  busan: [35.03, 128.92, 35.26, 129.27],
  gyeongju: [35.74, 129.15, 35.86, 129.37],
  jeonju: [35.78, 127.10, 35.86, 127.20],
  gangneung: [37.66, 128.84, 37.83, 129.08],
  sokcho: [38.14, 128.44, 38.24, 128.64],
  yeosu: [34.70, 127.68, 34.78, 127.80],
  daegu: [35.80, 128.53, 35.89, 128.64],
  andong: [36.50, 128.47, 36.60, 128.80],
  chuncheon: [37.76, 127.48, 37.92, 127.77],
  jeju: [33.18, 126.12, 33.58, 126.98],
}
/** 화면에 처음 보여 줄 범위 — 서울은 그림(위 상자)보다 좁게: 여섯 권역과 호텔이 모인 한강 양쪽 */
const REGION_FOCUS: Record<string, [number, number, number, number]> = {
  seoul: [37.49, 126.885, 37.6, 127.115],
}
export const REGION_VIEW: Record<string, Box> = Object.fromEntries(Object.entries(REGION_BBOX).map(([k, b]) => [k, boxOf(REGION_FOCUS[k] ?? b)]))

/** 이보다 넓게 보이면 전국 그림, 좁으면 지역 상세 그림 */
export const DETAIL_BELOW = 900

/** 전국 지도의 영문 지명(글자는 화면이 그린다 — 확대해도 같은 크기) */
export const PLACE_LABELS: { name: string; ll: LL; kind: 'city' | 'sea' | 'island'; anchor?: 'start' | 'end' | 'middle' }[] = [
  { name: 'SEOUL', ll: [37.5665, 126.978], kind: 'city', anchor: 'end' },
  { name: 'INCHEON', ll: [37.4563, 126.7052], kind: 'city', anchor: 'end' },
  { name: 'CHUNCHEON', ll: [37.8813, 127.7298], kind: 'city', anchor: 'start' },
  { name: 'SOKCHO', ll: [38.207, 128.5918], kind: 'city', anchor: 'start' },
  { name: 'GANGNEUNG', ll: [37.7519, 128.8761], kind: 'city', anchor: 'start' },
  { name: 'ANDONG', ll: [36.5684, 128.7294], kind: 'city', anchor: 'start' },
  { name: 'JEONJU', ll: [35.8242, 127.148], kind: 'city', anchor: 'end' },
  { name: 'DAEGU', ll: [35.8714, 128.6014], kind: 'city', anchor: 'end' },
  { name: 'GYEONGJU', ll: [35.8562, 129.2247], kind: 'city', anchor: 'start' },
  { name: 'BUSAN', ll: [35.1796, 129.0756], kind: 'city', anchor: 'start' },
  { name: 'YEOSU', ll: [34.7604, 127.6622], kind: 'city', anchor: 'end' },
  { name: 'JEJU', ll: [33.4996, 126.5312], kind: 'city', anchor: 'middle' },
  { name: 'ULLEUNGDO', ll: [37.505, 130.86], kind: 'island', anchor: 'middle' },
  { name: 'YELLOW SEA', ll: [36.2, 125.55], kind: 'sea', anchor: 'middle' },
  { name: 'EAST SEA', ll: [37.0, 130.2], kind: 'sea', anchor: 'middle' },
  { name: 'KOREA STRAIT', ll: [34.3, 128.85], kind: 'sea', anchor: 'middle' },
]

/** 펜화 색 — 홈 파노라마(components/home/panorama/ink)와 같다 */
export const PAPER = '#F7F5EE'
export const INK = '#262422'
export const HOTEL_RED = '#9E2B25'
