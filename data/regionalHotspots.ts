/**
 * Regional Hotspot Finder 원본 — 도시마다 반나절~하루에 묶어 도는 세 곳. 사진 없이 글자만 쓴다.
 * 요일이 정해진 야시장처럼 헛걸음하기 쉬운 내용은 tip 에 적는다(2026-11-08 공개 자료로 확인).
 * transitCity 는 Transit Guide 의 도시 id. 서울 · 부산은 출발 거점이라 경로 버튼을 두지 않는다.
 */
import type { CityId } from './transitRoutes'

export type HotspotCategory = 'Heritage' | 'Trendy Cafe' | 'Local Market' | 'Scenic View' | 'Shopping & Arts'
export type Hotspot = { name: string; ko: string; category: HotspotCategory; what: string; tip: string }
export type HotspotCity = { id: CityId; name: string; routeLink: boolean; spots: [Hotspot, Hotspot, Hotspot] }

export const CATEGORY_EMOJI: Record<HotspotCategory, string> = {
  Heritage: '⛩️',
  'Trendy Cafe': '☕',
  'Local Market': '🍢',
  'Scenic View': '🌊',
  'Shopping & Arts': '🛍️',
}

export const HOTSPOT_CITIES: HotspotCity[] = [
  {
    id: 'seoul', name: 'Seoul', routeLink: false, spots: [
      { name: 'Gyeongbokgung Palace', ko: '경복궁', category: 'Heritage', what: 'Walk the courtyards of Seoul’s main royal palace.', tip: 'Gyeongbokgung Station (Line 3). Closed on Tuesdays, so plan around it.' },
      { name: 'Ikseon-dong', ko: '익선동', category: 'Trendy Cafe', what: 'Browse cafes and small shops in narrow hanok alleys.', tip: 'Two stops on Line 3 to Jongno 3-ga, or about a 25-minute walk from the palace.' },
      { name: 'Gwangjang Market', ko: '광장시장', category: 'Local Market', what: 'Eat mung bean pancakes and mini gimbap at the food stalls.', tip: 'About a 15-minute walk east of Ikseon-dong, near Jongno 5-ga Station (Line 1).' },
    ],
  },
  {
    id: 'busan', name: 'Busan', routeLink: false, spots: [
      { name: 'Gamcheon Culture Village', ko: '감천문화마을', category: 'Shopping & Arts', what: 'Wander the painted hillside lanes and small art shops.', tip: 'Toseong Station (Line 1), Exit 6, then a village bus. Walking up is a steep 20 minutes.' },
      { name: 'Jagalchi Market', ko: '자갈치시장', category: 'Local Market', what: 'See Korea’s best-known seafood market and eat upstairs.', tip: 'From Toseong Station, ride Line 1 one stop to Jagalchi.' },
      { name: 'Busan Tower', ko: '부산타워', category: 'Scenic View', what: 'Look over the harbor from Yongdusan Park.', tip: 'Walk through Nampo-dong, then take the outdoor escalator up the hill.' },
    ],
  },
  {
    id: 'gyeongju', name: 'Gyeongju', routeLink: true, spots: [
      { name: 'Hwangnidan-gil', ko: '황리단길', category: 'Trendy Cafe', what: 'Cafe-hop along hanok-lined streets in the old town.', tip: 'About a 10-minute walk from Gyeongju Bus Terminal. Start here around lunchtime.' },
      { name: 'Daereungwon Tomb Complex', ko: '대릉원', category: 'Heritage', what: 'Stroll among the grassy royal tombs of Silla.', tip: 'Right next to Hwangnidan-gil, just a few minutes on foot.' },
      { name: 'Donggung Palace and Wolji Pond', ko: '동궁과 월지', category: 'Scenic View', what: 'Watch the palace pavilions reflected in the pond after dark.', tip: 'About a 20-minute walk from Daereungwon, passing Cheomseongdae. Time it for dusk.' },
    ],
  },
  {
    id: 'jeonju', name: 'Jeonju', routeLink: true, spots: [
      { name: 'Jeonju Hanok Village', ko: '전주 한옥마을', category: 'Heritage', what: 'Walk streets of traditional tiled-roof houses.', tip: '10–15 minutes by taxi from Jeonju Station, or 20–25 minutes by city bus.' },
      { name: 'Nambu Night Market', ko: '남부시장 야시장', category: 'Local Market', what: 'Graze on street food inside the traditional market.', tip: 'A short walk from Hanok Village. The night market runs only on Fridays and Saturdays.' },
      { name: 'Jaman Mural Village', ko: '자만벽화마을', category: 'Shopping & Arts', what: 'Photograph colorful murals on a quiet hillside.', tip: 'A short uphill walk from the east side of Hanok Village.' },
    ],
  },
  {
    id: 'gangneung', name: 'Gangneung', routeLink: true, spots: [
      { name: 'Anmok Beach Coffee Street', ko: '안목해변 커피거리', category: 'Trendy Cafe', what: 'Sip local roasts in cafes facing the sea.', tip: 'About 15 minutes by taxi from Gangneung Station.' },
      { name: 'Jungang Market', ko: '중앙시장', category: 'Local Market', what: 'Try local snacks in the city’s central market.', tip: 'In the city center. Take a taxi or local bus from Anmok.' },
      { name: 'ARTE Museum Gangneung', ko: '아르떼뮤지엄 강릉', category: 'Shopping & Arts', what: 'Step inside large-scale digital art rooms.', tip: 'Near Gyeongpo. A taxi is the easy way from the market.' },
    ],
  },
  {
    id: 'sokcho', name: 'Sokcho', routeLink: true, spots: [
      { name: 'Sokcho Tourist and Fishery Market', ko: '속초관광수산시장', category: 'Local Market', what: 'Snack on sweet fried chicken and local seafood.', tip: 'In the town center. Check a map app for the walk from your bus terminal.' },
      { name: 'Sokcho Eye', ko: '속초아이', category: 'Scenic View', what: 'Ride the beachfront Ferris wheel for coastal views.', tip: 'At Sokcho Beach. It may stop on windy days, so check before you go.' },
      { name: 'Yeonggeumjeong', ko: '영금정', category: 'Scenic View', what: 'Walk out to the seaside pavilion above the rocks.', tip: 'A short taxi ride from the market. Lovely around sunrise.' },
    ],
  },
  {
    id: 'yeosu', name: 'Yeosu', routeLink: true, spots: [
      { name: 'Yeosu Maritime Cable Car', ko: '해상케이블카', category: 'Scenic View', what: 'Cross the harbor by cable car between Jasan and Dolsan.', tip: 'Board at Jasan Station, on the Odongdo side of town. The ride takes 13–20 minutes.' },
      { name: 'Odongdo Island', ko: '오동도', category: 'Scenic View', what: 'Walk the causeway and forest paths of a small island.', tip: 'Close to the Jasan side of the cable car. Allow about an hour.' },
      { name: 'Nangman Pocha Street', ko: '낭만포차거리', category: 'Local Market', what: 'End the day with seafood at the waterfront tents.', tip: 'On the Jongpo seafront. It comes alive after dark.' },
    ],
  },
  {
    id: 'daegu', name: 'Daegu', routeLink: true, spots: [
      { name: 'Dongseongno and Spark Land', ko: '동성로 & 스파크랜드', category: 'Shopping & Arts', what: 'Shop downtown and ride the rooftop Ferris wheel.', tip: 'Downtown Daegu, close to Jungangno Station (Line 1).' },
      { name: 'Seomun Night Market', ko: '서문시장 야시장', category: 'Local Market', what: 'Work through grilled skewers and street food.', tip: 'Seomun Market Station (Line 3). Reported open Friday to Sunday evenings in 2026.' },
      { name: 'Kim Gwangseok Street', ko: '김광석길', category: 'Trendy Cafe', what: 'Follow a 350-meter mural lane of cafes and boutiques.', tip: 'A short taxi ride from Seomun Market. Go before the night market opens.' },
    ],
  },
  {
    id: 'jeju', name: 'Jeju', routeLink: true, spots: [
      { name: 'Samseonghyeol', ko: '삼성혈', category: 'Heritage', what: 'Visit the shrine tied to Jeju’s founding legend.', tip: 'In Jeju City, so you don’t need a rental car for this route.' },
      { name: 'Dongmun Traditional Market', ko: '동문시장', category: 'Local Market', what: 'Taste tangerines, seafood and evening street food.', tip: 'A short walk or taxi ride from Samseonghyeol.' },
      { name: 'Yongduam Rock', ko: '용두암', category: 'Scenic View', what: 'See the dragon-head rock on the lava coast.', tip: 'A short taxi ride from the market, and close to the airport.' },
    ],
  },
]
