/**
 * K-Pop 공연 캘린더 원본 — 2026-11-08 에 공개 자료로 날짜 · 장소를 확인한 것만 넣는다.
 * 지난 공연은 화면이 오늘 날짜(KST)로 알아서 뺀다.
 *
 * status: 매진 보도나 공식 판매 페이지로 확인될 때만 'Ticket Open' · 'Sold Out' 을 쓰고, 나머지는 'Upcoming'.
 * ticketUrl: 공연별 공식 페이지를 확인했으면 그 주소, 아니면 NOL World K-POP 목록(NOL_WORLD).
 * guideSlug: 이 공연장 버튼이 바로 갈 정식 글. venueKey: data/venueQuickGuides 의 미니 모달 키.
 * guideSlug 가 있으면 글로, 없고 퀵 가이드가 있으면 모달을 띄우고, 둘 다 없으면 버튼을 그리지 않는다.
 */
import type { VenueKey } from './venueQuickGuides'

export type KpopEventStatus = 'Upcoming' | 'Ticket Open' | 'Sold Out'

export type KpopEvent = {
  /** 썸네일 배경색 — 포스터가 없거나 못 불러오면 이 색의 그라디언트를 보여 준다 */
  themeColor: string
  /** 공식 포스터. 사용 권한을 확인한 이미지만 넣는다(주최사 허락 또는 직접 호스팅) */
  posterUrl?: string
  id: string
  artist: string
  title: string
  date: string        // YYYY-MM-DD
  endDate?: string    // 여러 날 공연의 마지막 날
  venue: string
  ticketUrl: string
  guideSlug?: string
  venueKey?: VenueKey
  status: KpopEventStatus
}

const NOL_WORLD = 'https://world.nol.com/en/ticket'
const INSPIRE_GUIDE = '/blog/en/k-patto/mohegan-inspire-resort-guide'

export const KPOP_EVENTS: KpopEvent[] = [
  { id: 'txt-steal-the-wind', themeColor: '#2563EB', artist: 'TOMORROW X TOGETHER', title: 'STEAL THE WIND', date: '2026-11-13', endDate: '2026-11-15', venue: 'KSPO DOME, Seoul', ticketUrl: NOL_WORLD, venueKey: 'kspo-dome', status: 'Upcoming' },
  { id: 'mma-2026', themeColor: '#16A34A', artist: 'Melon Music Awards', title: 'MMA2026', date: '2026-11-14', endDate: '2026-11-15', venue: 'Gocheok Sky Dome, Seoul', ticketUrl: NOL_WORLD, venueKey: 'gocheok', status: 'Upcoming' },
  { id: 'monsta-x-nexus-encore', themeColor: '#991B1B', artist: 'MONSTA X', title: 'THE X : NEXUS ENCORE', date: '2026-11-21', endDate: '2026-11-22', venue: 'Inspire Arena, Incheon', ticketUrl: NOL_WORLD, guideSlug: INSPIRE_GUIDE, venueKey: 'inspire', status: 'Upcoming' },
  { id: 'roy-kim-roy', themeColor: '#B45309', artist: 'Roy Kim', title: 'R:O:Y Live Tour in Seoul', date: '2026-11-21', endDate: '2026-11-22', venue: 'KSPO DOME, Seoul', ticketUrl: NOL_WORLD, venueKey: 'kspo-dome', status: 'Upcoming' },
  { id: 'evnne-one-take', themeColor: '#7C3AED', artist: 'EVNNE', title: 'ONE TAKE', date: '2026-11-21', endDate: '2026-11-22', venue: 'YES24 Live Hall, Seoul', ticketUrl: NOL_WORLD, status: 'Upcoming' },
  { id: 'nmixx-zero-frontier', themeColor: '#DB2777', artist: 'NMIXX', title: 'EPISODE 1: ZERO FRONTIER FINALE', date: '2026-11-27', endDate: '2026-11-29', venue: 'Inspire Arena, Incheon', ticketUrl: NOL_WORLD, guideSlug: INSPIRE_GUIDE, venueKey: 'inspire', status: 'Upcoming' },
  { id: 'minho-mean', themeColor: '#0F766E', artist: 'Minho', title: 'MEAN : of feral', date: '2026-11-28', endDate: '2026-11-29', venue: 'KBS Arena, Seoul', ticketUrl: NOL_WORLD, status: 'Upcoming' },
  { id: 'davichi-in-our-scenes', themeColor: '#C026D3', artist: 'Davichi', title: 'IN OUR SCENES', date: '2026-12-12', endDate: '2026-12-13', venue: 'KSPO DOME, Seoul', ticketUrl: 'https://world.nol.com/en/ticket/places/26001203/products/26014056', venueKey: 'kspo-dome', status: 'Sold Out' },
  { id: 'kyuhyun-continue', themeColor: '#1D4ED8', artist: 'Kyuhyun', title: 'CONTINUE', date: '2026-12-18', endDate: '2026-12-20', venue: 'Jangchung Arena, Seoul', ticketUrl: NOL_WORLD, status: 'Upcoming' },
  { id: 'flare-u-where-ure', themeColor: '#EA580C', artist: 'FLARE U', title: "Where U'RE", date: '2026-12-26', endDate: '2026-12-27', venue: 'Jangchung Arena, Seoul', ticketUrl: NOL_WORLD, status: 'Upcoming' },
  { id: 'sung-si-kyung-year-end', themeColor: '#475569', artist: 'Sung Si-kyung', title: 'Year-End Concert', date: '2026-12-31', endDate: '2027-01-03', venue: 'KSPO DOME, Seoul', ticketUrl: NOL_WORLD, venueKey: 'kspo-dome', status: 'Upcoming' },
]
