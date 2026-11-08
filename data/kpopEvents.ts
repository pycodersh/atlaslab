/**
 * K-Pop 공연 캘린더 원본 — 2026-11-08 에 공개 자료로 날짜 · 장소를 확인한 것만 넣는다.
 * 지난 공연은 화면이 오늘 날짜(KST)로 알아서 뺀다.
 *
 * status: 매진 보도나 공식 판매 페이지로 확인될 때만 'Ticket Open' · 'Sold Out' 을 쓰고, 나머지는 'Upcoming'.
 * ticketUrl: 공연별 공식 페이지를 확인했으면 그 주소, 아니면 NOL World K-POP 목록(NOL_WORLD).
 * guideSlug: 사이트에 실제 있는 글만. 공연장 글이 없으면 TRAVEL_GUIDES(/travel)로 두면 버튼 이름도 바뀐다.
 */
export type KpopEventStatus = 'Upcoming' | 'Ticket Open' | 'Sold Out'

export type KpopEvent = {
  id: string
  artist: string
  title: string
  date: string        // YYYY-MM-DD
  endDate?: string    // 여러 날 공연의 마지막 날
  venue: string
  ticketUrl: string
  guideSlug: string
  status: KpopEventStatus
}

const NOL_WORLD = 'https://world.nol.com/en/ticket'
export const TRAVEL_GUIDES = '/travel'
const INSPIRE_GUIDE = '/blog/en/k-patto/mohegan-inspire-resort-guide'

export const KPOP_EVENTS: KpopEvent[] = [
  { id: 'txt-steal-the-wind', artist: 'TOMORROW X TOGETHER', title: 'STEAL THE WIND', date: '2026-11-13', endDate: '2026-11-15', venue: 'KSPO DOME, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'mma-2026', artist: 'Melon Music Awards', title: 'MMA2026', date: '2026-11-14', endDate: '2026-11-15', venue: 'Gocheok Sky Dome, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'monsta-x-nexus-encore', artist: 'MONSTA X', title: 'THE X : NEXUS ENCORE', date: '2026-11-21', endDate: '2026-11-22', venue: 'Inspire Arena, Incheon', ticketUrl: NOL_WORLD, guideSlug: INSPIRE_GUIDE, status: 'Upcoming' },
  { id: 'roy-kim-roy', artist: 'Roy Kim', title: 'R:O:Y Live Tour in Seoul', date: '2026-11-21', endDate: '2026-11-22', venue: 'KSPO DOME, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'evnne-one-take', artist: 'EVNNE', title: 'ONE TAKE', date: '2026-11-21', endDate: '2026-11-22', venue: 'YES24 Live Hall, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'nmixx-zero-frontier', artist: 'NMIXX', title: 'EPISODE 1: ZERO FRONTIER FINALE', date: '2026-11-27', endDate: '2026-11-29', venue: 'Inspire Arena, Incheon', ticketUrl: NOL_WORLD, guideSlug: INSPIRE_GUIDE, status: 'Upcoming' },
  { id: 'minho-mean', artist: 'Minho', title: 'MEAN : of feral', date: '2026-11-28', endDate: '2026-11-29', venue: 'KBS Arena, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'davichi-in-our-scenes', artist: 'Davichi', title: 'IN OUR SCENES', date: '2026-12-12', endDate: '2026-12-13', venue: 'KSPO DOME, Seoul', ticketUrl: 'https://world.nol.com/en/ticket/places/26001203/products/26014056', guideSlug: TRAVEL_GUIDES, status: 'Sold Out' },
  { id: 'kyuhyun-continue', artist: 'Kyuhyun', title: 'CONTINUE', date: '2026-12-18', endDate: '2026-12-20', venue: 'Jangchung Arena, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'flare-u-where-ure', artist: 'FLARE U', title: "Where U'RE", date: '2026-12-26', endDate: '2026-12-27', venue: 'Jangchung Arena, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
  { id: 'sung-si-kyung-year-end', artist: 'Sung Si-kyung', title: 'Year-End Concert', date: '2026-12-31', endDate: '2027-01-03', venue: 'KSPO DOME, Seoul', ticketUrl: NOL_WORLD, guideSlug: TRAVEL_GUIDES, status: 'Upcoming' },
]
