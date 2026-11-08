/**
 * 도시 간 교통 비교 원본 — 2026-11-08 공개 자료의 대략값(Rome2Rio 구간표, 여행 가이드, Korail 통합 보도).
 * 노선은 방향 없이 한 번만 적는다: mode.hubs 는 [route.a 쪽, route.b 쪽]. 스왑하면 화면이 허브를 뒤집어 읽는다.
 * 팁은 허브에 붙어 있어(그 허브에 내렸을 때 할 일) 어느 방향이든 도착지 기준으로 맞게 나온다.
 *
 * 직항 · 직행이 확인되지 않으면 값을 지어내지 않는다. 항공 mode 를 빼면 화면이 한 줄 배너로 접고,
 * 환승만 있으면 via 를 적는다. minutes · minFare 는 Fastest / Cheapest 를 고르는 데만 쓴다.
 */
export type CityId = 'seoul' | 'busan' | 'daegu' | 'gyeongju' | 'jeonju' | 'gangneung' | 'sokcho' | 'chuncheon' | 'yeosu' | 'andong' | 'jeju'
export type City = { id: CityId; name: string; ko: string; lon: number; lat: number; label: 'left' | 'right' }

export const CITIES: City[] = [
  { id: 'seoul', name: 'Seoul', ko: '서울', lon: 126.98, lat: 37.57, label: 'left' },
  { id: 'busan', name: 'Busan', ko: '부산', lon: 129.08, lat: 35.18, label: 'right' },
  { id: 'daegu', name: 'Daegu', ko: '대구', lon: 128.6, lat: 35.87, label: 'left' },
  { id: 'gyeongju', name: 'Gyeongju', ko: '경주', lon: 129.22, lat: 35.84, label: 'right' },
  { id: 'jeonju', name: 'Jeonju', ko: '전주', lon: 127.15, lat: 35.82, label: 'left' },
  { id: 'gangneung', name: 'Gangneung', ko: '강릉', lon: 128.9, lat: 37.75, label: 'right' },
  { id: 'sokcho', name: 'Sokcho', ko: '속초', lon: 128.59, lat: 38.2, label: 'right' },
  { id: 'chuncheon', name: 'Chuncheon / Nami Island', ko: '춘천/남이섬', lon: 127.73, lat: 37.88, label: 'left' },
  { id: 'yeosu', name: 'Yeosu', ko: '여수', lon: 127.66, lat: 34.76, label: 'left' },
  { id: 'andong', name: 'Andong', ko: '안동', lon: 128.73, lat: 36.57, label: 'left' },
  { id: 'jeju', name: 'Jeju', ko: '제주', lon: 126.53, lat: 33.5, label: 'right' },
]

export const FROM_HUBS: CityId[] = ['seoul', 'busan', 'daegu']
export const TO_CITIES: CityId[] = ['busan', 'daegu', 'gyeongju', 'jeonju', 'gangneung', 'sokcho', 'chuncheon', 'yeosu', 'andong', 'jeju']

export const HUBS = {
  'seoul-suseo': { name: 'Seoul Station or Suseo Station', tip: 'Seoul Station is on Lines 1 and 4. Suseo is on Line 3 and the Suin-Bundang Line. Check which one is on your ticket.' },
  'seoul-yongsan': { name: 'Yongsan Station or Seoul Station', tip: 'Yongsan is on Line 1 and Seoul Station is on Lines 1 and 4. Check which one is on your ticket.' },
  yongsan: { name: 'Yongsan Station', tip: 'Yongsan is on Line 1.' },
  'seoul-cheongnyangni': { name: 'Seoul Station or Cheongnyangni Station', tip: 'Both are on Line 1. Check which one is on your ticket.' },
  cheongnyangni: { name: 'Cheongnyangni Station', tip: 'Cheongnyangni is on Line 1.' },
  'yongsan-cheongnyangni': { name: 'Yongsan or Cheongnyangni Station', tip: 'Both are on Line 1. Check which one is on your ticket.' },
  'seoul-express': { name: 'Seoul Express Bus Terminal', tip: 'Use Express Bus Terminal Station on Lines 3, 7 and 9.' },
  'central-city': { name: 'Central City Terminal (Honam Line side)', tip: 'Use Express Bus Terminal Station on Lines 3, 7 and 9.' },
  'dong-seoul': { name: 'Dong Seoul Terminal', tip: 'Use Gangbyeon Station on Line 2.' },
  'seoul-any-bus': { name: 'Dong Seoul Terminal or Seoul Express Bus Terminal', tip: 'Dong Seoul is at Gangbyeon Station on Line 2. The Express Bus Terminal is on Lines 3, 7 and 9.' },
  gimpo: { name: 'Gimpo Airport (GMP)', tip: 'Connects to Lines 5 and 9 and the Airport Railroad.' },

  'busan-station': { name: 'Busan Station', tip: 'On Metro Line 1. For Haeundae or Gwangalli, change to Line 2 at Seomyeon and allow 45–60 minutes.' },
  bujeon: { name: 'Bujeon Station', tip: 'This is a different station from Busan Station. Check your ticket.' },
  'busan-central': { name: 'Busan Central Bus Terminal', tip: 'On the north edge of the city. Take Metro Line 1 into town.' },
  gimhae: { name: 'Gimhae Airport (PUS)', tip: 'Farther from central Busan than Busan Station. The bus to Haeundae takes about 1h 40m.' },

  'dongdaegu-station': { name: 'Dongdaegu Station', tip: 'On Metro Line 1. Ride toward Banwoldang for the Dongseongno shopping area.' },
  'daegu-station': { name: 'Daegu Station', tip: 'On Metro Line 1, close to downtown.' },
  'dongdaegu-terminal': { name: 'Dongdaegu Terminal', tip: 'At Dongdaegu Station, so you can walk straight to Metro Line 1.' },
  'daegu-bukbu': { name: 'Daegu Bukbu Bus Terminal', tip: 'Check a map app for the current local connection.' },
  'west-daegu': { name: 'West Daegu Express Bus Terminal', tip: 'Check a map app for the current local connection.' },
  'daegu-airport': { name: 'Daegu Airport (TAE)', tip: 'Check a map app for the current bus or taxi into town.' },

  'gyeongju-station': { name: 'Gyeongju Station (formerly Singyeongju)', tip: 'About 11 km from downtown. Buses reach the Express Bus Terminal in about 20 minutes, then it’s a 10-minute walk to Hwangnidan-gil.' },
  'gyeongju-bus': { name: 'Gyeongju Bus Terminal', tip: 'You arrive right in town, about a 10-minute walk from Hwangnidan-gil.' },
  'jeonju-station': { name: 'Jeonju Station', tip: 'Hanok Village is 10–15 minutes by taxi, around ₩6,000 – 8,000, or 20–25 minutes by city bus.' },
  'jeonju-bus': { name: 'Jeonju Bus Terminal', tip: 'Take a taxi or city bus to Hanok Village. Check a map app for the current route.' },
  'gangneung-station': { name: 'Gangneung Station', tip: 'Anmok Beach and Coffee Street are about 15 minutes by taxi, around ₩7,000 – 9,000. Local buses run less often.' },
  'gangneung-bus': { name: 'Gangneung Bus Terminal', tip: 'Check a map app for the local bus to the coast.' },
  'sokcho-bus': { name: 'Sokcho Intercity Bus Terminal', tip: 'Check a map app for the local bus to Seoraksan or the beach.' },
  'chuncheon-station': { name: 'Namchuncheon or Chuncheon Station', tip: 'For Nami Island, get off earlier at Gapyeong Station and take a short taxi or bus ride to the ferry wharf.' },
  'chuncheon-intercity': { name: 'Chuncheon Intercity Bus Terminal', tip: 'Check a map app for the local connection. For Nami Island, the train to Gapyeong is easier.' },
  'chuncheon-express': { name: 'Chuncheon Express Bus Terminal', tip: 'Check a map app for the local connection.' },
  'yeosu-station': { name: 'Yeocheon or Yeosu EXPO Station', tip: 'Stay on to Yeosu EXPO Station for the seafront and the cable car. Check where your train ends.' },
  'yeocheon-bus': { name: 'Yeocheon Intercity Bus Terminal', tip: 'Yeocheon is part of Yeosu city. Check a map app for the bus or taxi to the seafront.' },
  suncheon: { name: 'Suncheon Bus Terminal (connect for Yeosu)', tip: 'Continue to Yeosu by local bus or train. Check current times on the day.' },
  'andong-station': { name: 'Andong Station', tip: 'Hahoe Folk Village is a local bus or taxi ride away. Check a map app for the current bus.' },
  'andong-bus': { name: 'Andong Bus Terminal', tip: 'Hahoe Folk Village is a local bus or taxi ride away. Check a map app for the current bus.' },
  'yeosu-airport': { name: 'Yeosu Airport (RSU)', tip: 'Check a map app for the current bus or taxi into Yeosu.' },
  jeju: { name: 'Jeju International Airport (CJU)', tip: 'In Jeju City. A rental car helps, because buses are slow and infrequent outside the main towns.' },
} as const

export type HubId = keyof typeof HUBS
export type ModeKind = 'train' | 'flight' | 'bus' | 'transfer'
export type TransitMode = {
  kind: ModeKind
  name: string
  duration: string
  fare: string
  minutes: number
  minFare: number
  hubs: [HubId, HubId]
  via?: string
  highSpeed?: boolean
}
export type TransitRoute = { a: CityId; b: CityId; modes: TransitMode[]; note?: string; flightNote?: string }

const KTX = 'Train (KTX/SRT)'
const EXPRESS = 'Express Bus'
const FLIGHT = 'Flight'
const JEJU_FERRY = 'Ferry not recommended. No ferry runs directly from here. Going overland to Mokpo or Wando and then sailing takes about 7–9 hours door to door from Seoul.'

export const ROUTES: TransitRoute[] = [
  {
    a: 'seoul', b: 'busan', modes: [
      { kind: 'train', name: KTX, highSpeed: true, duration: '2h 15m – 3h', fare: 'About ₩54,400', minutes: 135, minFare: 54400, hubs: ['seoul-suseo', 'busan-station'] },
      { kind: 'flight', name: FLIGHT, duration: 'About 1h 10m in the air; 2h 45m with airport time', fare: 'About ₩50,000 – 125,000', minutes: 165, minFare: 50000, hubs: ['gimpo', 'gimhae'] },
      { kind: 'bus', name: EXPRESS, duration: '4h – 4h 40m', fare: 'About ₩23,000 – 44,000', minutes: 240, minFare: 23000, hubs: ['seoul-express', 'busan-central'] },
    ],
  },
  {
    a: 'seoul', b: 'daegu', modes: [
      { kind: 'train', name: KTX, highSpeed: true, duration: 'About 1h 40m', fare: 'About ₩43,500', minutes: 100, minFare: 43500, hubs: ['seoul-suseo', 'dongdaegu-station'] },
      { kind: 'bus', name: EXPRESS, duration: 'About 3h 45m', fare: 'About ₩22,100 – 42,500', minutes: 225, minFare: 22100, hubs: ['seoul-express', 'dongdaegu-terminal'] },
    ],
  },
  {
    a: 'seoul', b: 'gyeongju', modes: [
      { kind: 'train', name: KTX, highSpeed: true, duration: '2h – 2h 45m', fare: 'About ₩48,500', minutes: 120, minFare: 48500, hubs: ['seoul-suseo', 'gyeongju-station'] },
      { kind: 'bus', name: EXPRESS, duration: '3h 30m – 3h 50m', fare: 'About ₩23,000 – 48,000', minutes: 210, minFare: 23000, hubs: ['seoul-express', 'gyeongju-bus'] },
    ],
  },
  {
    a: 'seoul', b: 'jeonju', modes: [
      { kind: 'train', name: 'Train (KTX)', highSpeed: true, duration: '1h 26m – 1h 53m', fare: 'About ₩31,300 – 34,600', minutes: 86, minFare: 31300, hubs: ['seoul-yongsan', 'jeonju-station'] },
      { kind: 'bus', name: EXPRESS, duration: '2h 40m – 3h 30m', fare: 'About ₩14,300 – 27,100', minutes: 160, minFare: 14300, hubs: ['central-city', 'jeonju-bus'] },
    ],
  },
  {
    a: 'seoul', b: 'gangneung', modes: [
      { kind: 'train', name: 'Train (KTX-Eum)', highSpeed: true, duration: '1h 50m – 2h', fare: 'About ₩27,600', minutes: 110, minFare: 27600, hubs: ['seoul-cheongnyangni', 'gangneung-station'] },
      { kind: 'bus', name: EXPRESS, duration: '2h 30m – 2h 50m', fare: 'About ₩24,300 – 33,100', minutes: 150, minFare: 24300, hubs: ['seoul-any-bus', 'gangneung-bus'] },
    ],
  },
  {
    a: 'seoul', b: 'sokcho', note: 'Sokcho has no train service. Take an express or intercity bus.', modes: [
      { kind: 'bus', name: 'Express / Intercity Bus', duration: '2h 12m – 2h 35m', fare: 'About ₩14,000 – 28,900', minutes: 132, minFare: 14000, hubs: ['dong-seoul', 'sokcho-bus'] },
    ],
  },
  {
    a: 'seoul', b: 'chuncheon', note: 'For Nami Island, take the ITX-Cheongchun and get off at Gapyeong Station.', modes: [
      { kind: 'train', name: 'Train (ITX-Cheongchun)', duration: 'About 1h – 1h 20m', fare: 'About ₩9,800 – 20,000', minutes: 64, minFare: 9800, hubs: ['yongsan-cheongnyangni', 'chuncheon-station'] },
      { kind: 'bus', name: 'Intercity Bus', duration: '1h 10m – 1h 40m', fare: 'About ₩6,000 – 14,000', minutes: 70, minFare: 6000, hubs: ['dong-seoul', 'chuncheon-intercity'] },
    ],
  },
  {
    a: 'seoul', b: 'yeosu', flightNote: 'Gimpo–Yeosu flights are reported to resume on December 17, 2026. Check with the airlines.', modes: [
      { kind: 'train', name: 'Train (KTX Jeolla Line)', highSpeed: true, duration: 'About 3h', fare: 'From about ₩42,000', minutes: 177, minFare: 42000, hubs: ['yongsan', 'yeosu-station'] },
      { kind: 'bus', name: EXPRESS, duration: 'About 4h – 5h', fare: 'About ₩24,000 – 49,000', minutes: 244, minFare: 24000, hubs: ['central-city', 'yeocheon-bus'] },
    ],
  },
  {
    a: 'seoul', b: 'andong', note: 'Andong is the gateway to Hahoe Folk Village.', modes: [
      { kind: 'train', name: 'Train (KTX-Eum)', highSpeed: true, duration: 'About 1h 54m', fare: 'About ₩25,000 – 34,000', minutes: 114, minFare: 25000, hubs: ['cheongnyangni', 'andong-station'] },
      { kind: 'bus', name: EXPRESS, duration: '2h 30m – 2h 40m', fare: 'About ₩15,000 – 34,900', minutes: 150, minFare: 15000, hubs: ['dong-seoul', 'andong-bus'] },
    ],
  },
  {
    a: 'seoul', b: 'jeju', note: JEJU_FERRY, modes: [
      { kind: 'flight', name: FLIGHT, duration: 'About 55m – 1h 10m in the air', fare: 'About ₩30,000 – 80,000', minutes: 70, minFare: 30000, hubs: ['gimpo', 'jeju'] },
    ],
  },

  {
    a: 'busan', b: 'daegu', modes: [
      { kind: 'train', name: 'Train (ITX-Saemaeul)', duration: 'About 1h 17m', fare: 'About ₩14,000 – 27,000', minutes: 77, minFare: 14000, hubs: ['busan-station', 'daegu-station'] },
      { kind: 'bus', name: EXPRESS, duration: 'About 1h 15m', fare: 'About ₩7,500 – 13,000', minutes: 75, minFare: 7500, hubs: ['busan-central', 'dongdaegu-terminal'] },
    ],
  },
  {
    a: 'busan', b: 'gyeongju', modes: [
      { kind: 'train', name: KTX, highSpeed: true, duration: 'About 30 – 35m', fare: 'About ₩10,000 – 19,000', minutes: 30, minFare: 10000, hubs: ['busan-station', 'gyeongju-station'] },
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 50m', fare: 'About ₩7,700 – 13,000', minutes: 50, minFare: 7700, hubs: ['busan-central', 'gyeongju-bus'] },
    ],
  },
  {
    a: 'busan', b: 'jeonju', note: 'There is no direct train. Rail trips need a change, such as at Osong.', modes: [
      { kind: 'bus', name: EXPRESS, duration: 'About 3h', fare: 'About ₩17,000 – 35,600', minutes: 180, minFare: 17000, hubs: ['busan-central', 'jeonju-bus'] },
    ],
  },
  {
    a: 'busan', b: 'gangneung', note: 'We could not confirm a direct train. Listed rail trips need a change.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 5h', fare: 'About ₩36,000 – 48,000', minutes: 302, minFare: 36000, hubs: ['busan-central', 'gangneung-bus'] },
    ],
  },
  {
    a: 'busan', b: 'sokcho', note: 'Sokcho has no train service. Take the bus.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 5h 15m', fare: 'About ₩43,000 – 60,000', minutes: 317, minFare: 43000, hubs: ['busan-central', 'sokcho-bus'] },
    ],
  },
  {
    a: 'busan', b: 'chuncheon', note: 'There is no direct train or bus on this route.', modes: [
      { kind: 'train', name: 'Train (with a change)', via: 'Change in Seoul', duration: 'About 4h 40m', fare: 'About ₩38,000 – 116,000', minutes: 279, minFare: 38000, hubs: ['busan-station', 'chuncheon-station'] },
      { kind: 'bus', name: 'Bus (with a change)', via: 'Change at Dongdaegu', duration: 'About 5h 35m', fare: 'About ₩29,000 – 46,000', minutes: 335, minFare: 29000, hubs: ['busan-central', 'chuncheon-express'] },
    ],
  },
  {
    a: 'busan', b: 'yeosu', note: 'There is no direct train to Yeosu.', modes: [
      { kind: 'bus', name: EXPRESS, duration: 'About 2h 20m', fare: 'About ₩13,000 – 24,000', minutes: 140, minFare: 13000, hubs: ['busan-central', 'yeocheon-bus'] },
    ],
  },
  {
    a: 'busan', b: 'andong', note: 'There is no direct bus. The KTX-Eum leaves from Bujeon, not Busan Station.', modes: [
      { kind: 'train', name: 'Train (KTX-Eum)', highSpeed: true, duration: 'About 2h – 3h 10m', fare: 'About ₩25,000 – 50,000', minutes: 120, minFare: 25000, hubs: ['bujeon', 'andong-station'] },
    ],
  },
  {
    a: 'busan', b: 'jeju', note: 'No ferry runs directly from Busan. Flying is the practical choice.', modes: [
      { kind: 'flight', name: FLIGHT, duration: 'About 1h 5m in the air', fare: 'About ₩36,000 – 160,000', minutes: 65, minFare: 36000, hubs: ['gimhae', 'jeju'] },
    ],
  },

  {
    a: 'daegu', b: 'gyeongju', modes: [
      { kind: 'train', name: KTX, highSpeed: true, duration: 'About 18m', fare: 'About ₩6,200 – 12,000', minutes: 18, minFare: 6200, hubs: ['dongdaegu-station', 'gyeongju-station'] },
      { kind: 'bus', name: 'Intercity Bus', duration: '50 – 55m', fare: 'About ₩6,500 – 12,000', minutes: 50, minFare: 6500, hubs: ['dongdaegu-terminal', 'gyeongju-bus'] },
    ],
  },
  {
    a: 'daegu', b: 'jeonju', note: 'There is no direct train on this route.', modes: [
      { kind: 'bus', name: EXPRESS, duration: '2h 30m – 3h 40m', fare: 'About ₩12,000 – 25,000', minutes: 150, minFare: 12000, hubs: ['dongdaegu-terminal', 'jeonju-bus'] },
    ],
  },
  {
    a: 'daegu', b: 'gangneung', note: 'There is no direct train on this route.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 3h 30m', fare: 'About ₩27,000 – 40,000', minutes: 210, minFare: 27000, hubs: ['daegu-bukbu', 'gangneung-bus'] },
    ],
  },
  {
    a: 'daegu', b: 'sokcho', note: 'Sokcho has no train service. Take the bus.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 4h 40m', fare: 'About ₩33,000 – 47,000', minutes: 280, minFare: 33000, hubs: ['daegu-bukbu', 'sokcho-bus'] },
    ],
  },
  {
    a: 'daegu', b: 'chuncheon', note: 'There is no direct train on this route.', modes: [
      { kind: 'bus', name: EXPRESS, duration: '3h 10m – 4h 10m', fare: 'About ₩20,000 – 40,000', minutes: 190, minFare: 20000, hubs: ['west-daegu', 'chuncheon-express'] },
    ],
  },
  {
    a: 'daegu', b: 'yeosu', note: 'We could not confirm a direct train or bus. The usual route connects through Suncheon.', modes: [
      { kind: 'bus', name: 'Bus (with a change)', via: 'Change at Suncheon', duration: 'About 3h 25m to Suncheon, plus the connection', fare: 'About ₩13,000 – 34,400, plus the connection', minutes: 205, minFare: 13000, hubs: ['dongdaegu-terminal', 'suncheon'] },
    ],
  },
  {
    a: 'daegu', b: 'andong', note: 'There is no direct train on this route.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: '1h 15m – 1h 53m', fare: 'About ₩8,400 – 15,500', minutes: 75, minFare: 8400, hubs: ['daegu-bukbu', 'andong-bus'] },
    ],
  },
  {
    a: 'daegu', b: 'jeju', note: 'Flying is the practical choice. We don’t recommend going by ferry.', modes: [
      { kind: 'flight', name: FLIGHT, duration: 'About 1h 5m in the air', fare: 'From about ₩41,000', minutes: 65, minFare: 41000, hubs: ['daegu-airport', 'jeju'] },
    ],
  },

  // 거점을 끼지 않아도 직행이 확인된 구간
  {
    a: 'gangneung', b: 'sokcho', note: 'Sokcho has no train service. Take the bus.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 1h – 1h 10m', fare: 'About ₩7,000 – 12,000', minutes: 60, minFare: 7000, hubs: ['gangneung-bus', 'sokcho-bus'] },
    ],
  },
  {
    a: 'chuncheon', b: 'gangneung', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 2h', fare: 'About ₩17,000 – 24,000', minutes: 120, minFare: 17000, hubs: ['chuncheon-intercity', 'gangneung-bus'] },
    ],
  },
  {
    a: 'chuncheon', b: 'sokcho', note: 'Sokcho has no train service. Take the bus.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 2h', fare: 'About ₩15,400', minutes: 120, minFare: 15400, hubs: ['chuncheon-intercity', 'sokcho-bus'] },
    ],
  },
  {
    a: 'gyeongju', b: 'andong', modes: [
      { kind: 'train', name: 'Train (KTX-Eum)', highSpeed: true, duration: 'About 45m', fare: 'About ₩14,000 – 27,000', minutes: 45, minFare: 14000, hubs: ['gyeongju-station', 'andong-station'] },
      { kind: 'bus', name: 'Intercity Bus', duration: 'About 1h 40m', fare: 'About ₩14,000 – 19,000', minutes: 100, minFare: 14000, hubs: ['gyeongju-bus', 'andong-bus'] },
    ],
  },
  {
    a: 'jeonju', b: 'yeosu', modes: [
      { kind: 'train', name: 'Train (KTX Jeolla Line)', highSpeed: true, duration: '1h 20m – 1h 40m', fare: 'About ₩9,600 – 40,000', minutes: 80, minFare: 9600, hubs: ['jeonju-station', 'yeosu-station'] },
    ],
  },
  {
    a: 'jeonju', b: 'gyeongju', note: 'There is no direct train on this route.', modes: [
      { kind: 'bus', name: 'Intercity Bus', duration: '3h 30m – 3h 55m', fare: 'About ₩24,000 – 36,000', minutes: 210, minFare: 24000, hubs: ['jeonju-bus', 'gyeongju-bus'] },
    ],
  },
  {
    a: 'yeosu', b: 'jeju', note: 'Flying is the practical choice. No ferry runs directly from Yeosu.', modes: [
      { kind: 'flight', name: FLIGHT, duration: 'About 55m in the air', fare: 'About ₩46,000 – 200,000', minutes: 55, minFare: 46000, hubs: ['yeosu-airport', 'jeju'] },
    ],
  },
]

export const findRoute = (from: CityId, to: CityId) =>
  ROUTES.find(r => (r.a === from && r.b === to) || (r.a === to && r.b === from))

const cityName = (id: CityId) => (CITIES.find(c => c.id === id) as City).name.split(' / ')[0]
const fastest = (route: TransitRoute) => route.modes.filter(m => !m.via).sort((x, y) => x.minutes - y.minutes)[0]
const hubAt = (route: TransitRoute, mode: TransitMode, city: CityId) => mode.hubs[route.a === city ? 0 : 1]
const clock = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(Math.round(minutes % 60 / 5) * 5).padStart(2, '0')}m`

/**
 * 직행이 없거나 확인되지 않은 구간은 값을 지어내지 않고, 이미 있는 두 구간을 3대 거점에서 이어 붙인다.
 * 시간 · 요금은 두 구간의 합이고, 갈아타는 시간은 넣지 않았다고 화면에 적는다.
 */
function buildTransfer(from: CityId, to: CityId): TransitRoute | undefined {
  const options = FROM_HUBS.flatMap(hub => {
    const first = findRoute(from, hub)
    const second = findRoute(hub, to)
    const firstMode = first && fastest(first)
    const secondMode = second && fastest(second)
    return first && second && firstMode && secondMode ? [{ hub, first, second, firstMode, secondMode }] : []
  })
  const best = options.sort((x, y) => (x.firstMode.minutes + x.secondMode.minutes) - (y.firstMode.minutes + y.secondMode.minutes))[0]
  if (!best) return undefined
  const minutes = best.firstMode.minutes + best.secondMode.minutes
  const minFare = best.firstMode.minFare + best.secondMode.minFare
  return {
    a: from,
    b: to,
    note: 'We could not confirm a direct service on this route, so this is a connection through a major hub. Ask at the terminal about direct buses.',
    modes: [{
      kind: 'transfer',
      name: `Transfer via ${cityName(best.hub)}`,
      via: `${best.firstMode.name} to ${cityName(best.hub)}, then ${best.secondMode.name} to ${cityName(to)}`,
      duration: `About ${clock(minutes)} plus connection time`,
      fare: `From about ₩${minFare.toLocaleString('en-US')}`,
      minutes,
      minFare,
      hubs: [hubAt(best.first, best.firstMode, from), hubAt(best.second, best.secondMode, to)],
    }],
  }
}

/** 화면이 쓰는 입구: 방향과 함께 노선을 돌려준다(reversed 면 hubs 를 뒤집어 읽는다) */
export function routeBetween(from: CityId, to: CityId) {
  if (from === to) return undefined
  const direct = findRoute(from, to)
  if (direct) return { route: direct, reversed: direct.a !== from, transfer: false }
  const route = buildTransfer(from, to)
  return route ? { route, reversed: false, transfer: true } : undefined
}
