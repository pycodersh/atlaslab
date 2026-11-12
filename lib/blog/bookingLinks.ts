/**
 * 숙소 글의 예약 버튼(<BookingCta hotel="..." />) 링크 표 — components/blog/BookingCta.
 *
 * 제휴 링크를 받으면 href 에 넣는다. 그러면 버튼에 rel="sponsored" 가 붙고 버튼 아래 제휴 고지가 나온다.
 * href 가 비어 있는 동안에는 Google Hotels 검색(요금 · 빈방 비교)으로 보낸다 — 버튼이 죽은 링크가 되지 않게.
 * 본문(DB content)을 다시 올리지 않고 이 파일만 고쳐 푸시하면 된다.
 */
export type BookingLink = {
  /** Google Hotels 검색어 겸 버튼 aria-label 의 호텔 이름 */
  name: string
  /** 제휴 예약 링크(Trip.com · Agoda · Klook …). 없으면 Google Hotels 검색 */
  href?: string
  /** 버튼 글자(기본: Check Rates & Availability) */
  label?: string
}

export const BOOKING_LINKS: Record<string, BookingLink> = {
  gyeongwonjae: { name: 'Gyeongwonjae by Walkerhill' },
  oakwood: { name: 'Oakwood Premier Incheon' },
  sheraton: { name: 'Sheraton Grand Incheon Hotel' },
  'four-seasons-seoul': { name: 'Four Seasons Hotel Seoul' },
  lescape: { name: "L'Escape Hotel Seoul" },
}
