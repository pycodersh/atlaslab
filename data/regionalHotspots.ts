/**
 * Regional Hotspot Finder 원본 — 도시마다 반나절~하루에 묶어 도는 세 곳. 사진 없이 글자만 쓴다.
 * 요일이 정해진 야시장처럼 헛걸음하기 쉬운 내용은 tip 에 적는다(2026-11-08 공개 자료로 확인).
 * transitCity 는 Transit Guide 의 도시 id. 서울 · 부산은 출발 거점이라 경로 버튼을 두지 않는다.
 */
import type { CityId } from './transitRoutes'

export type HotspotCategory = 'Heritage' | 'Trendy Cafe' | 'Local Market' | 'Scenic View' | 'Shopping & Arts'
export type Hotspot = { name: string; ko: string; category: HotspotCategory; what: string; tip: string }
type ThreeSpots = [Hotspot, Hotspot, Hotspot]
export type SeoulClusterId = 'jongno' | 'seongsu' | 'hongdae' | 'hannam' | 'gangnam'
export type SeoulCluster = { id: SeoulClusterId; name: string; short: string; ko: string; theme: string; spots: ThreeSpots }
export type HotspotCity = { id: CityId; name: string; routeLink: boolean; spots: ThreeSpots; clusters?: SeoulCluster[] }

// 서울은 한 덱으로 담기엔 넓어 5개 권역으로 나눈다. 권역 안의 세 곳끼리만 반나절 동선이다
const SEOUL_CLUSTERS: SeoulCluster[] = [
  {
    id: 'jongno', name: 'Jongno & Central', short: 'Jongno', ko: '종로·중구', theme: 'Heritage & Local Flavor', spots: [
      { name: 'Gyeongbokgung Palace', ko: '경복궁', category: 'Heritage', what: 'Walk the courtyards of Seoul’s main royal palace.', tip: 'Gyeongbokgung Station (Line 3). Closed on Tuesdays, so plan around it.' },
      { name: 'Ikseon-dong Hanok Alley', ko: '익선동', category: 'Trendy Cafe', what: 'Browse cafes and small shops in narrow hanok alleys.', tip: 'Two stops on Line 3 to Jongno 3-ga, or about a 25-minute walk from the palace.' },
      { name: 'Gwangjang Market', ko: '광장시장', category: 'Local Market', what: 'Eat mung bean pancakes and mini gimbap at the food stalls.', tip: 'About a 15-minute walk east of Ikseon-dong, near Jongno 5-ga Station (Line 1).' },
    ],
  },
  {
    id: 'seongsu', name: 'Seongsu & Seoul Forest', short: 'Seongsu', ko: '성수·성동', theme: 'Trends & Pop-ups', spots: [
      { name: 'Yeonmujang-gil Pop-up Street', ko: '연무장길', category: 'Shopping & Arts', what: 'Browse brand pop-ups, concept stores and small studios.', tip: 'Near Seongsu Station (Line 2). Pop-ups change often, so see what’s on that week.' },
      { name: 'Seoul Forest Cafe Street', ko: '서울숲 카페거리', category: 'Trendy Cafe', what: 'Stop for coffee in the quiet lanes beside the park.', tip: 'Next to Seoul Forest Station (Suin-Bundang Line). Check a map app for the walk from Yeonmujang-gil.' },
      { name: 'Daelim Changgo Gallery', ko: '대림창고', category: 'Shopping & Arts', what: 'See a former red-brick rice mill warehouse turned art space and cafe.', tip: 'In the Seongsu Station area. We could not confirm current hours, so check before you go.' },
    ],
  },
  {
    id: 'hongdae', name: 'Hongdae & Yeonnam', short: 'Hongdae', ko: '홍대·마포', theme: 'Youth & Indie Culture', spots: [
      { name: 'Hongdae Busking & Walk Street', ko: '홍대 걷고싶은거리', category: 'Shopping & Arts', what: 'Watch street performers and shop the youth fashion lanes.', tip: 'Hongik Univ. Station (Line 2), Exit 9. Evenings are the liveliest.' },
      { name: 'Yeonnam-dong Forest Trail', ko: '경의선숲길', category: 'Trendy Cafe', what: 'Stroll the leafy old rail line lined with cafes and wine bars.', tip: 'Hongik Univ. Station, Exit 3 opens right onto the park.' },
      { name: 'Mangwon Market', ko: '망원시장', category: 'Local Market', what: 'Snack through a neighborhood market that locals still use.', tip: 'Near Mangwon Station (Line 6). A short taxi ride from the trail.' },
    ],
  },
  {
    id: 'hannam', name: 'Hannam & Itaewon', short: 'Hannam', ko: '용산', theme: 'Culture & City Views', spots: [
      { name: 'Hannam-dong Designer Cafes', ko: '한남동 거리', category: 'Trendy Cafe', what: 'Browse designer boutiques and stylish cafes.', tip: 'Near Hangangjin Station (Line 6). Best explored on foot.' },
      { name: 'National Museum of Korea', ko: '국립중앙박물관', category: 'Heritage', what: 'See Korea’s national treasures in one huge museum.', tip: 'Near Ichon Station. Open late on Wednesdays and Saturdays. Fees are reported to start in 2027.' },
      { name: 'N Seoul Tower', ko: 'N서울타워', category: 'Scenic View', what: 'Take in the whole city from the top of Namsan.', tip: 'Ride the Namsan cable car or a local bus up the mountain. Sunset is the busiest time.' },
    ],
  },
  {
    id: 'gangnam', name: 'Gangnam & Jamsil', short: 'Gangnam', ko: '강남·송파', theme: 'Skyline & Modern', spots: [
      { name: 'Starfield COEX Library & Mall', ko: '별마당도서관', category: 'Shopping & Arts', what: 'Photograph the towering bookshelves, then shop the mall.', tip: 'Connected to Samseong Station (Line 2) and Bongeunsa Station (Line 9). Free entry.' },
      { name: 'Lotte World Tower & Mall', ko: '롯데월드타워', category: 'Shopping & Arts', what: 'Shop the mall and go up Korea’s tallest building.', tip: 'Direct from Jamsil Station (Lines 2 and 8), a few stops along Line 2 from Samseong.' },
      { name: 'Seokchon Lake Trail', ko: '석촌호수', category: 'Scenic View', what: 'Walk the lakeside path with skyline views.', tip: 'Right beside Lotte World Mall, an easy finish on foot.' },
    ],
  },
]

export const CATEGORY_EMOJI: Record<HotspotCategory, string> = {
  Heritage: '⛩️',
  'Trendy Cafe': '☕',
  'Local Market': '🍢',
  'Scenic View': '🌊',
  'Shopping & Arts': '🛍️',
}

export const HOTSPOT_CITIES: HotspotCity[] = [
  {
    id: 'seoul', name: 'Seoul', routeLink: false, spots: SEOUL_CLUSTERS[0].spots, clusters: SEOUL_CLUSTERS,
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
