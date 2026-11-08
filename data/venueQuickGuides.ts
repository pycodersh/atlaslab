/**
 * 공연장 현장 퀵 가이드 — K-Pop 캘린더의 미니 모달에 쓴다.
 * 출구 번호 · 물품보관함처럼 자료마다 다른 내용은 확인된 만큼만 적는다(2026-11-08 NOL World, Hanok Days).
 * fullGuide 는 더 자세한 정식 글이 있을 때 모달 아래 링크로 보여 준다.
 */
export type VenueKey = 'kspo-dome' | 'gocheok' | 'inspire'
export type VenueQuickGuide = { name: string; location: string; subway: string; lockers: string; exitTip: string; fullGuide?: string }

export const VENUE_QUICK_GUIDES: Partial<Record<VenueKey, VenueQuickGuide>> = {
  'kspo-dome': {
    name: 'KSPO DOME',
    location: 'Olympic Park, Songpa-gu, Seoul',
    subway: 'Olympic Park Station (Lines 5 and 9), Exit 3 or 4, about a 5 to 7 minute walk.',
    lockers: 'Coin lockers inside Olympic Park Station fill up fast on concert days. Leave large bags at your hotel.',
    exitTip: 'Line 5 gets packed after concerts. Line 9 is often faster, or wait about 20 minutes for the crowd to clear.',
    fullGuide: '/blog/en/k-patto/kspo-dome-concert-guide-seoul',
  },
  gocheok: {
    name: 'Gocheok Sky Dome',
    location: 'Guro-gu, Seoul',
    subway: 'Guil Station (Line 1), Exit 2, about a 3 minute walk. Express trains skip Guil.',
    lockers: 'Lockers near the dome fill quickly. Store bulky bags earlier at a larger station, such as Sindorim or Yeongdeungpo.',
    exitTip: 'Taxis are hard to catch right after big events. Walking about 15 minutes to Gaebong Station can be faster.',
    fullGuide: '/blog/en/k-patto/gocheok-sky-dome-concert-guide-seoul',
  },
}
