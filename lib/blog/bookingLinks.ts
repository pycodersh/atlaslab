/**
 * 숙소 글 예약 버튼(<BookingCta hotel="..." />) 제휴 링크 표 — components/blog/BookingCta.
 *
 * trip: Trip.com 제휴 단축 링크(빨간 버튼), klook: Klook 제휴 리다이렉트(아웃라인 버튼). 입점하지 않은 곳은 비워 두면 버튼이 안 나온다.
 * 둘 다 없으면 Google Hotels 검색으로 보낸다(버튼이 죽은 링크가 되지 않게).
 * 본문(DB content)을 다시 올리지 않고 이 파일만 고쳐 푸시하면 된다. 제휴 고지는 각 글 맨 위 post-disclosure 줄이 맡는다.
 */
export type BookingLink = {
  /** Google Hotels 검색어 겸 버튼 aria-label 의 호텔 이름 */
  name: string
  trip?: string
  klook?: string
}

const KLOOK = (adid: number, path: string) =>
  `https://affiliate.klook.com/redirect?aid=138930&aff_adid=${adid}&k_site=${encodeURIComponent(`https://www.klook.com/en-US/hotels/detail/${path}/`)}`

/** Trip.com 호텔 상세 직접 링크 — 단축 링크가 리다이렉트하며 붙이는 것과 같은 제휴 파라미터 */
const TRIP = (idSlug: string, city = 'seoul') =>
  `https://www.trip.com/hotels/${city}-hotel-detail-${idSlug}/?Allianceid=10997841&SID=333357760`

export const BOOKING_LINKS: Record<string, BookingLink> = {
  inspire: {
    name: 'Mohegan INSPIRE Entertainment Resort',
    trip: 'https://www.trip.com/t/WFyKkjPJ8X2',
    klook: KLOOK(1561855, '1314498-inspire-entertainment-resort'),
  },
  gyeongwonjae: {
    name: 'Gyeongwonjae by Walkerhill',
    trip: 'https://www.trip.com/t/Q0B4aoRJ8X2',
    klook: KLOOK(1561855, '558259-gyeongwonjae-by-walkerhill'),
  },
  oakwood: {
    name: 'Oakwood Premier Incheon',
    trip: 'https://www.trip.com/t/MmVi5SSJ8X2',
    klook: KLOOK(1561855, '275167-oakwood-premier-incheon'),
  },
  // Klook 미입점 — Trip.com 버튼 하나만 나온다
  sheraton: {
    name: 'Sheraton Grand Incheon Hotel',
    trip: 'https://www.trip.com/t/bmBgz7TJ8X2',
  },
  'four-seasons-seoul': {
    name: 'Four Seasons Hotel Seoul',
    trip: 'https://www.trip.com/t/7RBQcqTJ8X2',
    klook: KLOOK(1561855, '436182-four-seasons-hotel-seoul'),
  },
  lescape: {
    name: "L'Escape Hotel Seoul",
    trip: 'https://www.trip.com/t/QXbhMbUJ8X2',
    klook: KLOOK(1561859, '285832-lescape-a-luxury-collection-hotel-seoul-myeongdong'),
  },
  // 강남 · 잠실 5곳 — Trip.com 호텔 상세에 제휴 파라미터(TRIP)를 붙인 직접 링크(2026-11-13 브라우저로 200 · 호텔 페이지 확인)
  signiel: { name: 'Signiel Seoul', trip: TRIP('19624480/signiel-seoul') },
  'park-hyatt-seoul': { name: 'Park Hyatt Seoul', trip: TRIP('991995/park-hyatt-seoul') },
  'josun-palace': {
    name: 'Josun Palace, a Luxury Collection Hotel, Seoul Gangnam',
    trip: TRIP('76113894/josun-palace-a-luxury-collection-hotel-seoul-gangnam'),
  },
  'jw-marriott-seoul': { name: 'JW Marriott Hotel Seoul', trip: TRIP('1465733/jw-marriott-hotel-seoul') },
  'grand-intercontinental-parnas': {
    name: 'Grand InterContinental Seoul Parnas',
    trip: TRIP('1517243/intercontinental-grand-seoul-parnas-by-ihg'),
  },
  // 강북 · 남산 · 여의도 · 이태원 · 마포 7곳 (2026-11-13 브라우저로 200 · 호텔 페이지 확인)
  shilla: { name: 'The Shilla Seoul', trip: TRIP('988584/the-shilla-seoul') },
  'banyan-tree-seoul': { name: 'Banyan Tree Club & Spa Seoul', trip: TRIP('988402/banyan-tree-club-and-spa-seoul') },
  'fairmont-ambassador': { name: 'Fairmont Ambassador Seoul', trip: TRIP('68168684/fairmont-ambassador-seoul') },
  conrad: { name: 'Conrad Seoul', trip: TRIP('1465780/conrad-seoul') },
  mondrian: { name: 'Mondrian Seoul Itaewon', trip: TRIP('59478652/mondrian-seoul-itaewon') },
  'westin-josun': { name: 'The Westin Josun Seoul', trip: TRIP('988507/the-westin-josun-seoul') },
  'hotel-naru': { name: 'Hotel Naru Seoul - MGallery', trip: TRIP('100964631/hotel-naru-seoul-mgallery-collection') },
  // 홍대 · 압구정 · 부산 · 제주 6곳 (2026-11-13 브라우저로 200 · 호텔 페이지 확인). 부산 · 제주는 Trip.com 도시 경로가 다르다
  ryse: { name: 'RYSE, Autograph Collection', trip: TRIP('687886/ryse-autograph-collection') },
  'l7-hongdae': { name: 'L7 Hongdae by LOTTE', trip: TRIP('14186936/l7-hongdae-by-lotte-hotels') },
  'andaz-seoul': { name: 'Andaz Seoul Gangnam', trip: TRIP('44995054/andaz-seoul-gangnam') },
  'paradise-busan': { name: 'Paradise Hotel Busan', trip: TRIP('689014/paradise-hotel-busan', 'busan') },
  'signiel-busan': { name: 'Signiel Busan', trip: TRIP('61927965/signiel-busan', 'busan') },
  'parnas-jeju': { name: 'Parnas Hotel Jeju', trip: TRIP('94311150/parnas-hotel-jeju', 'seogwipo') },
}
