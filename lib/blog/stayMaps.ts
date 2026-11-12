/**
 * 숙소 글 상단 랜드마크 미니맵 데이터 — 본문 MDX 의 <StayMap id="..." /> 가 이 표를 읽는다(components/blog/StayMap).
 *
 * 좌표는 OpenStreetMap(Nominatim) 실측값이다(2026-11-12). 공원 윤곽은 OSM relation 8520267(송도 센트럴파크)을
 * 단순화한 것으로, 북쪽 · 남쪽 두 덩어리 사이가 수로(canal)다.
 * 지도마다 호텔 + 랜드마크가 꽉 차게 범위를 맞추고(크기 · 여백 규격은 모두 같다), 공원 · 수로 · 공항은 지역(FRAMES)에서 같이 쓴다.
 * 도보 시간은 원고 기준이며 좌표 간 직선거리와 어긋나지 않는지 확인했다.
 */

export type LatLon = readonly [lat: number, lon: number]

export type StayLandmark = {
  name: string
  /** 'area' 는 핀 없이 공원 면 자체를 가리킨다(범례에는 초록 견본으로 나온다).
   *  area 의 at 은 호텔에서 가장 가까운 공원 가장자리 — 지도 범위에 포함되고 그 자리에 이름 글자만 놓인다 */
  kind: 'place' | 'station' | 'shop' | 'area'
  at?: LatLon
  /** 범례의 이동 시간 라벨 */
  time: string
  mode: 'walk' | 'underground' | 'drive'
}

export type StayMapConfig = {
  frame: keyof typeof FRAMES
  /** 호텔 이름 글자는 지도 가장자리를 피해 자동으로 좌우가 정해진다 */
  hotel: { name: string; sub?: string; at: LatLon }
  landmarks: readonly StayLandmark[]
  airport: { name: string; time: string }
}

type Frame = {
  parks: readonly (readonly (readonly [lon: number, lat: number])[])[]
  water: readonly (readonly [lon: number, lat: number])[]
  airport: LatLon
}

export const FRAMES = {
  songdo: {
    parks: [
      // 북쪽 공원(수로 위)
      [[126.63298, 37.3951], [126.63317, 37.39474], [126.63606, 37.3952], [126.63754, 37.39418], [126.63743, 37.39362], [126.63897, 37.39257], [126.63936, 37.39204], [126.63958, 37.3922], [126.64007, 37.39204], [126.64043, 37.39242], [126.64048, 37.39211], [126.6402, 37.39187], [126.64025, 37.39166], [126.6423, 37.39076], [126.64342, 37.39071], [126.64389, 37.39052], [126.64445, 37.39103], [126.64443, 37.39129], [126.63701, 37.39594], [126.63298, 37.3951]],
      // 남쪽 공원(수로 아래)
      [[126.63423, 37.39469], [126.63603, 37.39195], [126.64158, 37.38862], [126.6419, 37.38864], [126.64342, 37.39011], [126.64059, 37.39109], [126.63922, 37.39134], [126.63884, 37.3922], [126.63855, 37.39204], [126.63853, 37.3925], [126.63738, 37.39319], [126.637, 37.39361], [126.63695, 37.39411], [126.63592, 37.39483], [126.63423, 37.39469]],
    ],
    // 두 공원 사이 수로 — 북쪽 공원의 남쪽 가장자리 + 남쪽 공원의 북쪽 가장자리(역순)
    water: [
      [126.63317, 37.39474], [126.63606, 37.3952], [126.63754, 37.39418], [126.63743, 37.39362], [126.63897, 37.39257], [126.63936, 37.39204], [126.64025, 37.39166], [126.6423, 37.39076], [126.64389, 37.39052], [126.64445, 37.39103],
      [126.64342, 37.39011], [126.64059, 37.39109], [126.63922, 37.39134], [126.63853, 37.3925], [126.63738, 37.39319], [126.63695, 37.39411], [126.63592, 37.39483], [126.63423, 37.39469],
    ],
    airport: [37.44957, 126.45212], // 인천공항 제1여객터미널
  },
} as const satisfies Record<string, Frame>

const PARK = 'Songdo Central Park'

export const STAY_MAPS: Record<string, StayMapConfig> = {
  gyeongwonjae: {
    frame: 'songdo',
    hotel: { name: 'Gyeongwonjae', sub: 'Hanok hotel inside the park', at: [37.39174, 126.63745] },
    landmarks: [
      { name: PARK, kind: 'area', time: 'You are in it', mode: 'walk' },
      { name: 'Central Park Station, Exit 3', kind: 'station', at: [37.39231, 126.63569], time: '3 min walk', mode: 'walk' },
      { name: 'Songdo Hanok Village', kind: 'place', at: [37.39072, 126.63921], time: '3 min walk', mode: 'walk' },
      { name: 'Tri-bowl Cultural Center', kind: 'place', at: [37.39425, 126.63483], time: '8 min walk', mode: 'walk' },
    ],
    airport: { name: "Incheon Int'l Airport", time: '20–25 min by car' },
  },
  oakwood: {
    frame: 'songdo',
    hotel: { name: 'Oakwood Premier', sub: 'Upper floors of Posco Tower', at: [37.38939, 126.64407] },
    landmarks: [
      { name: 'Lotte Mart Songdo', kind: 'shop', at: [37.38843, 126.64341], time: '1 min, underground link', mode: 'underground' },
      { name: PARK, kind: 'area', at: [37.3903, 126.6427], time: '2 min walk', mode: 'walk' },
      { name: "Incheon Nat'l Univ. Station, Exit 4", kind: 'station', at: [37.3855, 126.63876], time: '8 min walk', mode: 'walk' },
    ],
    airport: { name: "Incheon Int'l Airport", time: '20–25 min by car' },
  },
  sheraton: {
    frame: 'songdo',
    hotel: { name: 'Sheraton Grand', sub: 'Across from Central Park', at: [37.39011, 126.64544] },
    landmarks: [
      { name: PARK, kind: 'area', at: [37.3911, 126.6440], time: 'One crosswalk away', mode: 'walk' },
      { name: 'Songdo Convensia', kind: 'place', at: [37.38878, 126.64674], time: '1 min walk', mode: 'walk' },
      { name: 'Oakwood / Posco Tower', kind: 'place', at: [37.38939, 126.64407], time: '3 min walk', mode: 'walk' },
      { name: "Incheon Nat'l Univ. Station, Exit 4", kind: 'station', at: [37.3855, 126.63876], time: '10 min walk', mode: 'walk' },
    ],
    airport: { name: "Incheon Int'l Airport", time: '20–25 min by car' },
  },
}
