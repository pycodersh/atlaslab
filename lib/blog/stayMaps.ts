/**
 * 숙소 글 상단 랜드마크 미니맵 데이터 — 본문 MDX 의 <StayMap id="..." /> 가 이 표를 읽는다(components/blog/StayMap).
 *
 * 좌표 · 윤곽은 OpenStreetMap(Nominatim · Overpass) 실측값이다(2026-11-12).
 *  - 송도: 센트럴파크 relation 8520267 — 북쪽 · 남쪽 두 덩어리 사이가 수로(canal)
 *  - 서울 도심: 경복궁 relation 5501517, 광화문광장 relation 5672803, 청계천 way 368276771(청계광장에서 시작)
 * 지도마다 호텔 + 랜드마크가 꽉 차게 범위를 맞추고(크기 · 여백 규격은 모두 같다), 바탕 도형(공원 · 광장 · 물)은 지역(FRAMES)에서 같이 쓴다.
 * 도보 시간은 좌표 간 직선거리로 확인했다(원고와 어긋나면 실측 쪽으로 고쳤다).
 * 지도 밖 목적지(공항 · 서울역)는 offmap 으로 두면 왼쪽 아래 칩에 실제 방위 화살표와 함께 나온다.
 */

export type LatLon = readonly [lat: number, lon: number]
type LonLat = readonly [lon: number, lat: number]

export type StayLandmark = {
  name: string
  /** 'area' 는 핀 없이 공원 면 자체를 가리킨다(범례에는 초록 견본으로 나온다).
   *  area 의 at 은 호텔에서 가장 가까운 공원 가장자리 — 지도 범위에 포함되고 그 자리에 label 글자만 놓인다 */
  kind: 'place' | 'station' | 'shop' | 'area'
  at?: LatLon
  /** area 의 지도 위 짧은 이름(기본: name) */
  label?: string
  /** 범례의 이동 시간 라벨 */
  time: string
  mode: 'walk' | 'underground' | 'drive'
}

export type StayMapConfig = {
  frame: keyof typeof FRAMES
  /** 호텔 이름 글자는 지도 가장자리를 피해 자동으로 좌우가 정해진다 */
  hotel: { name: string; sub?: string; at: LatLon }
  landmarks: readonly StayLandmark[]
  /** 지도 밖 목적지 — chip 은 지도 왼쪽 아래 칩 글자, time 은 범례 글자 */
  offmap: { name: string; at: LatLon; time: string; chip: string; icon: 'plane' | 'train' }
}

type Frame = {
  shapes: readonly { kind: 'park' | 'plaza' | 'water'; poly: readonly LonLat[] }[]
  lines?: readonly { kind: 'stream'; pts: readonly LonLat[] }[]
}

const ICN: LatLon = [37.44957, 126.45212] // 인천공항 제1여객터미널
const SEOUL_STATION: LatLon = [37.55542, 126.97259]

export const FRAMES = {
  songdo: {
    shapes: [
      // 북쪽 공원(수로 위)
      { kind: 'park', poly: [[126.63298, 37.3951], [126.63317, 37.39474], [126.63606, 37.3952], [126.63754, 37.39418], [126.63743, 37.39362], [126.63897, 37.39257], [126.63936, 37.39204], [126.63958, 37.3922], [126.64007, 37.39204], [126.64043, 37.39242], [126.64048, 37.39211], [126.6402, 37.39187], [126.64025, 37.39166], [126.6423, 37.39076], [126.64342, 37.39071], [126.64389, 37.39052], [126.64445, 37.39103], [126.64443, 37.39129], [126.63701, 37.39594], [126.63298, 37.3951]] },
      // 남쪽 공원(수로 아래)
      { kind: 'park', poly: [[126.63423, 37.39469], [126.63603, 37.39195], [126.64158, 37.38862], [126.6419, 37.38864], [126.64342, 37.39011], [126.64059, 37.39109], [126.63922, 37.39134], [126.63884, 37.3922], [126.63855, 37.39204], [126.63853, 37.3925], [126.63738, 37.39319], [126.637, 37.39361], [126.63695, 37.39411], [126.63592, 37.39483], [126.63423, 37.39469]] },
      // 두 공원 사이 수로 — 북쪽 공원의 남쪽 가장자리 + 남쪽 공원의 북쪽 가장자리(역순)
      { kind: 'water', poly: [
        [126.63317, 37.39474], [126.63606, 37.3952], [126.63754, 37.39418], [126.63743, 37.39362], [126.63897, 37.39257], [126.63936, 37.39204], [126.64025, 37.39166], [126.6423, 37.39076], [126.64389, 37.39052], [126.64445, 37.39103],
        [126.64342, 37.39011], [126.64059, 37.39109], [126.63922, 37.39134], [126.63853, 37.3925], [126.63738, 37.39319], [126.63695, 37.39411], [126.63592, 37.39483], [126.63423, 37.39469],
      ] },
    ],
  },
  seoul: {
    shapes: [
      // 경복궁 담장 안
      { kind: 'park', poly: [[126.97375, 37.58291], [126.974, 37.57883], [126.97445, 37.57609], [126.97693, 37.57587], [126.97886, 37.57601], [126.97932, 37.57646], [126.97943, 37.5795], [126.97932, 37.57969], [126.97944, 37.57969], [126.97946, 37.57999], [126.97969, 37.57998], [126.98002, 37.58104], [126.98005, 37.58217], [126.97978, 37.58294], [126.9793, 37.58329], [126.97672, 37.58367], [126.97412, 37.58328], [126.97394, 37.58323], [126.97394, 37.583], [126.97375, 37.58291]] },
      // 광화문광장(세종대로 가운데)
      { kind: 'plaza', poly: [[126.97638, 37.57166], [126.97641, 37.57046], [126.97677, 37.57039], [126.97701, 37.57047], [126.9771, 37.57124], [126.97695, 37.57484], [126.97687, 37.575], [126.97641, 37.5751], [126.97652, 37.575], [126.9765, 37.57466], [126.97641, 37.57467], [126.97638, 37.57166]] },
    ],
    lines: [
      // 청계천 — 청계광장에서 동쪽으로
      { kind: 'stream', pts: [[126.9786, 37.56914], [126.98344, 37.56881], [126.98667, 37.56811], [126.9887, 37.56808], [126.99678, 37.56869]] },
    ],
  },
} as const satisfies Record<string, Frame>

const PARK = 'Songdo Central Park'
const ICN_OFFMAP = { name: "Incheon Int'l Airport", at: ICN, time: '20–25 min by car', chip: 'ICN Airport · 20–25 min drive', icon: 'plane' } as const

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
    offmap: ICN_OFFMAP,
  },
  oakwood: {
    frame: 'songdo',
    hotel: { name: 'Oakwood Premier', sub: 'Upper floors of Posco Tower', at: [37.38939, 126.64407] },
    landmarks: [
      { name: 'Lotte Mart Songdo', kind: 'shop', at: [37.38843, 126.64341], time: '1 min, underground link', mode: 'underground' },
      { name: PARK, kind: 'area', label: 'Central Park', at: [37.3903, 126.6427], time: '2 min walk', mode: 'walk' },
      { name: "Incheon Nat'l Univ. Station, Exit 4", kind: 'station', at: [37.3855, 126.63876], time: '8 min walk', mode: 'walk' },
    ],
    offmap: ICN_OFFMAP,
  },
  sheraton: {
    frame: 'songdo',
    hotel: { name: 'Sheraton Grand', sub: 'Across from Central Park', at: [37.39011, 126.64544] },
    landmarks: [
      { name: PARK, kind: 'area', label: 'Central Park', at: [37.3911, 126.6440], time: 'One crosswalk away', mode: 'walk' },
      { name: 'Songdo Convensia', kind: 'place', at: [37.38878, 126.64674], time: '1 min walk', mode: 'walk' },
      { name: 'Oakwood / Posco Tower', kind: 'place', at: [37.38939, 126.64407], time: '3 min walk', mode: 'walk' },
      { name: "Incheon Nat'l Univ. Station, Exit 4", kind: 'station', at: [37.3855, 126.63876], time: '10 min walk', mode: 'walk' },
    ],
    offmap: ICN_OFFMAP,
  },
  // 호텔 ↔ 각 점 직선거리: 광화문역 7번 출구(OSM subway_entrance) ~100m · 광장 ~200m · 청계광장 ~330m · 광화문(경복궁 정문) ~600m
  'four-seasons-seoul': {
    frame: 'seoul',
    hotel: { name: 'Four Seasons Seoul', sub: 'Saemunan-ro, Gwanghwamun', at: [37.57065, 126.97537] },
    landmarks: [
      { name: 'Gwanghwamun Station, Exit 7', kind: 'station', at: [37.57047, 126.97651], time: '2 min walk', mode: 'walk' },
      { name: 'Gwanghwamun Square', kind: 'place', at: [37.5720, 126.97675], time: '3 min walk', mode: 'walk' },
      { name: 'Cheonggyecheon Stream (Cheonggye Plaza)', kind: 'place', at: [37.56914, 126.9786], time: '4 min walk', mode: 'walk' },
      { name: 'Gyeongbokgung Palace (Gwanghwamun Gate)', kind: 'place', at: [37.57593, 126.97682], time: '7 min walk', mode: 'walk' },
    ],
    offmap: { name: 'Seoul Station', at: SEOUL_STATION, time: '10 min by car', chip: 'Seoul Station · 10 min drive', icon: 'train' },
  },
  // 호텔 ↔ 각 점 직선거리: 회현역 7번 출구(OSM subway_entrance) ~25m · 남대문시장 ~190m · 신세계 본점 ~150m · 명동길 ~520m
  lescape: {
    frame: 'seoul',
    hotel: { name: "L'Escape", sub: 'Toegye-ro, by Namdaemun Market', at: [37.55967, 126.97945] },
    landmarks: [
      { name: 'Hoehyeon Station, Exit 7', kind: 'station', at: [37.55951, 126.97964], time: 'At the hotel door', mode: 'walk' },
      { name: 'Namdaemun Market', kind: 'shop', at: [37.55928, 126.97735], time: '2 min walk', mode: 'walk' },
      { name: 'Shinsegae Main Dept. Store', kind: 'shop', at: [37.56047, 126.98084], time: '3 min walk', mode: 'walk' },
      { name: 'Myeongdong Walking Street', kind: 'place', at: [37.56384, 126.98505], time: '8 min walk', mode: 'walk' },
    ],
    offmap: { name: 'Seoul Station', at: SEOUL_STATION, time: '1 stop on Line 4 · 5 min by car', chip: 'Seoul Station · 1 stop / 5 min drive', icon: 'train' },
  },
}
