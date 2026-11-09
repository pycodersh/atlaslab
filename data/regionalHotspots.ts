/**
 * Regional Hotspot Finder 원본 — 방문객이 실제로 많이 찾는 곳만 도시별로 담는다(개수 제한 없음). 서울은 6개 권역 × 네 곳. 사진 없이 글자만 쓴다.
 * 요일이 정해진 야시장처럼 헛걸음하기 쉬운 내용은 tip 에 적는다(2026-11-09 공개 자료로 확인).
 * 자료마다 출구 번호가 갈리는 곳은 역 이름까지만 적는다.
 * transitCity 는 Transit Guide 의 도시 id. 서울은 출발지라 경로 버튼을 두지 않는다.
 */
import type { CityId } from './transitRoutes'

export type HotspotCategory = 'Heritage' | 'Trendy Cafe' | 'Local Market' | 'Shopping & Street' | 'Nature & Park' | 'Skyline & Modern' | 'Coastal & Sea' | 'Art & Culture'
export type Hotspot = { name: string; ko: string; category: HotspotCategory; what: string; tip: string }
type FourSpots = [Hotspot, Hotspot, Hotspot, Hotspot]
export type SeoulClusterId = 'jongno' | 'myeongdong' | 'hongdae' | 'seongsu' | 'yeouido' | 'gangnam'
export type SeoulCluster = { id: SeoulClusterId; name: string; short: string; ko: string; theme: string; spots: FourSpots }
export type HotspotCity = { id: CityId; name: string; routeLink: boolean; spots: Hotspot[]; clusters?: SeoulCluster[] }

// 서울은 한 덱으로 담기엔 넓어 6개 권역으로 나눈다. 권역 안의 네 곳끼리만 동선이다
const SEOUL_CLUSTERS: SeoulCluster[] = [
  {
    id: 'jongno', name: 'Jongno & Bukchon', short: 'Jongno', ko: '종로·북촌', theme: 'Palaces & Hanok Heritage', spots: [
      { name: 'Gyeongbokgung Palace', ko: '경복궁', category: 'Heritage', what: 'Walk the courtyards of Seoul’s main royal palace.', tip: 'Gyeongbokgung Station (Line 3). Closed on Tuesdays, so plan around it.' },
      { name: 'Bukchon Hanok Village', ko: '북촌 한옥마을', category: 'Heritage', what: 'Climb quiet lanes of tiled-roof houses where people still live.', tip: 'Near Anguk Station (Line 3). The main lanes bar tourists from 5 p.m. to 10 a.m., with a ₩100,000 fine.' },
      { name: 'Ikseon-dong Hanok Alley', ko: '익선동', category: 'Trendy Cafe', what: 'Browse cafes and small shops in narrow hanok alleys.', tip: 'Next to Jongno 3-ga Station (Lines 1, 3 and 5), one stop from Anguk on Line 3.' },
      { name: 'Changdeokgung & Secret Garden', ko: '창덕궁 & 후원', category: 'Heritage', what: 'Tour the UNESCO palace and its wooded royal garden.', tip: 'Near Anguk Station. Closed on Mondays. The garden is by guided tour only, with a separate ticket, so book ahead.' },
    ],
  },
  {
    id: 'myeongdong', name: 'Myeongdong & Central', short: 'Myeongdong', ko: '명동·중구', theme: 'Shopping, Markets & Tower', spots: [
      { name: 'Myeongdong Street & Night Market', ko: '명동거리 & 야시장', category: 'Local Market', what: 'Shop for K-beauty, then graze the street food stalls.', tip: 'Myeongdong Station (Line 4). The food stalls are at their fullest in the evening.' },
      { name: 'N Seoul Tower', ko: 'N서울타워', category: 'Skyline & Modern', what: 'Take in the whole city from the top of Namsan.', tip: 'Ride the Namsan cable car or a local bus up the mountain. Sunset is the busiest time.' },
      { name: 'Namdaemun Market', ko: '남대문시장', category: 'Local Market', what: 'Hunt for souvenirs and hot snacks in Korea’s biggest traditional market.', tip: 'Hoehyeon Station (Line 4), one stop from Myeongdong. Most shops close on Sundays.' },
      { name: 'DDP & Cheonggyecheon', ko: 'DDP & 청계천', category: 'Art & Culture', what: 'See the curving Zaha Hadid landmark, then follow the city stream.', tip: 'Dongdaemun History & Culture Park Station (Lines 2, 4 and 5). The stream is a short walk north.' },
    ],
  },
  {
    id: 'hongdae', name: 'Hongdae & Yeonnam', short: 'Hongdae', ko: '홍대·마포', theme: 'Youth & Indie Culture', spots: [
      { name: 'Hongdae Busking & Walk Street', ko: '홍대 걷고싶은거리', category: 'Art & Culture', what: 'Watch street performers and shop the youth fashion lanes.', tip: 'Hongik Univ. Station (Line 2), Exit 9. Evenings are the liveliest.' },
      { name: 'Yeonnam-dong Forest Trail', ko: '연남동 경의선숲길', category: 'Trendy Cafe', what: 'Stroll the leafy old rail line lined with cafes and wine bars.', tip: 'Hongik Univ. Station, Exit 3 opens right onto the park.' },
      { name: 'Mangwon Market', ko: '망원시장', category: 'Local Market', what: 'Snack through a neighborhood market that locals still use.', tip: 'Near Mangwon Station (Line 6). A short taxi ride from the trail.' },
      { name: 'Hapjeong & Sangsu Cafe Lanes', ko: '합정·상수', category: 'Trendy Cafe', what: 'Slow down in the quieter cafe lanes south of Hongdae.', tip: 'Sangsu Station (Line 6) is one stop from Hapjeong Station (Lines 2 and 6).' },
    ],
  },
  {
    id: 'seongsu', name: 'Seongsu & Seoul Forest', short: 'Seongsu', ko: '성수·뚝섬', theme: 'Pop-ups & Cafes', spots: [
      { name: 'Yeonmujang-gil Pop-up Street', ko: '연무장길 팝업스토어', category: 'Shopping & Street', what: 'Browse brand pop-ups, concept stores and small studios.', tip: 'Near Seongsu Station (Line 2). Pop-ups change often, so see what’s on that week.' },
      { name: 'Seoul Forest Park', ko: '서울숲', category: 'Nature & Park', what: 'Walk the wide lawns and tree-lined paths of the city’s big park.', tip: 'Next to Seoul Forest Station (Suin-Bundang Line). Free to enter.' },
      { name: 'Daelim Changgo Gallery', ko: '대림창고', category: 'Art & Culture', what: 'See a former red-brick warehouse turned art space and cafe.', tip: 'In the Seongsu Station area. We could not confirm current hours, so check before you go.' },
      { name: 'Ttukseom Cafe Street', ko: '뚝섬 카페거리', category: 'Trendy Cafe', what: 'Stop for coffee in the small lanes beside the park.', tip: 'Between Ttukseom Station (Line 2) and Seoul Forest, an easy walk from either.' },
    ],
  },
  {
    id: 'yeouido', name: 'Yeouido & Yongsan', short: 'Yeouido', ko: '여의도·용산', theme: 'Han River & Culture', spots: [
      { name: 'Yeouido Hangang Park', ko: '여의도 한강공원', category: 'Nature & Park', what: 'Picnic by the river and try convenience-store Han River ramen.', tip: 'Yeouinaru Station (Line 5) opens onto the park. Sunset is the best time.' },
      { name: 'The Hyundai Seoul', ko: '더현대 서울', category: 'Shopping & Street', what: 'Shop a department store built around an indoor garden.', tip: 'A short walk from Yeouido Station (Lines 5 and 9), or one stop from Yeouinaru.' },
      { name: 'Hannam-dong Designer Street', ko: '한남동 거리', category: 'Shopping & Street', what: 'Browse designer boutiques and stylish cafes.', tip: 'Near Hangangjin Station (Line 6). Best explored on foot.' },
      { name: 'National Museum of Korea', ko: '국립중앙박물관', category: 'Heritage', what: 'See Korea’s national treasures in one huge museum.', tip: 'Near Ichon Station. Open late on Wednesdays and Saturdays. Fees are reported to start in 2027.' },
    ],
  },
  {
    id: 'gangnam', name: 'Gangnam & Jamsil', short: 'Gangnam', ko: '강남·잠실', theme: 'Landmarks & Skyline', spots: [
      { name: 'Starfield Library at COEX', ko: '코엑스 별마당도서관', category: 'Shopping & Street', what: 'Photograph the towering bookshelves, then shop the mall.', tip: 'Connected to Samseong Station (Line 2) and Bongeunsa Station (Line 9). Free entry.' },
      { name: 'Lotte World Tower & Seoul Sky', ko: '롯데월드타워 & 서울스카이', category: 'Skyline & Modern', what: 'Go up Korea’s tallest building for the glass-floor view.', tip: 'Connected to Jamsil Station (Lines 2 and 8), a few stops along Line 2 from Samseong. Book a time slot online.' },
      { name: 'Seokchon Lake Trail', ko: '석촌호수', category: 'Nature & Park', what: 'Walk the lakeside path with skyline views.', tip: 'Right beside Lotte World Mall, an easy finish on foot.' },
      { name: 'Apgujeong Rodeo Street', ko: '압구정 로데오', category: 'Shopping & Street', what: 'Browse flagship stores, K-beauty clinics and upscale cafes.', tip: 'Apgujeongrodeo Station (Suin-Bundang Line). Farther from the rest, so give it its own trip.' },
    ],
  },
]

export const HOTSPOT_CITIES: HotspotCity[] = [
  {
    id: 'seoul', name: 'Seoul', routeLink: false, spots: SEOUL_CLUSTERS[0].spots, clusters: SEOUL_CLUSTERS,
  },
  {
    id: 'busan', name: 'Busan', routeLink: true, spots: [
      { name: 'Haeundae Beach', ko: '해운대 해변', category: 'Coastal & Sea', what: 'Walk Korea’s best-known city beach and its high-rise waterfront.', tip: 'About a 10-minute walk from Haeundae Station (Line 2).' },
      { name: 'Gwangalli Beach', ko: '광안리 해변', category: 'Coastal & Sea', what: 'Watch the free Saturday night drone show over the bridge.', tip: 'Near Gwangan Station (Line 2). The show runs on Saturdays, and start times change by season.' },
      { name: 'Gamcheon Culture Village', ko: '감천문화마을', category: 'Art & Culture', what: 'Wander the painted hillside lanes and small art shops.', tip: 'Toseong Station (Line 1), Exit 6, then a village bus. Walking up is a steep 20 minutes.' },
      { name: 'Huinnyeoul Culture Village', ko: '흰여울문화마을', category: 'Coastal & Sea', what: 'Follow a clifftop lane of white houses above the sea.', tip: 'On Yeongdo island. Take a bus or taxi from Nampo-dong, and check a map app for the route.' },
      { name: 'Jagalchi Market', ko: '자갈치시장', category: 'Local Market', what: 'See Korea’s best-known seafood market and eat upstairs.', tip: 'Next to Jagalchi Station (Line 1).' },
      { name: 'Haedong Yonggungsa Temple', ko: '해동용궁사', category: 'Heritage', what: 'Visit a Buddhist temple set right on the rocky shore.', tip: 'Bus 181 from Haeundae Station. Free entry. The way in goes down 108 stone steps.' },
    ],
  },
  {
    id: 'gyeongju', name: 'Gyeongju', routeLink: true, spots: [
      { name: 'Hwangnidan-gil', ko: '황리단길', category: 'Trendy Cafe', what: 'Cafe-hop along hanok-lined streets in the old town.', tip: 'About a 10-minute walk from Gyeongju Bus Terminal. Start here around lunchtime.' },
      { name: 'Daereungwon Tomb Complex', ko: '대릉원', category: 'Heritage', what: 'Stroll among the grassy royal tombs of Silla.', tip: 'Right next to Hwangnidan-gil, just a few minutes on foot.' },
      { name: 'Cheomseongdae Observatory', ko: '첨성대', category: 'Heritage', what: 'See one of Asia’s oldest surviving stone observatories.', tip: 'On the walk from Daereungwon toward Donggung Palace.' },
      { name: 'Donggung Palace and Wolji Pond', ko: '동궁과 월지', category: 'Heritage', what: 'Watch the palace pavilions reflected in the pond after dark.', tip: 'About a 20-minute walk from Daereungwon, passing Cheomseongdae. Time it for dusk.' },
      { name: 'Bulguksa Temple', ko: '불국사', category: 'Heritage', what: 'Climb the stone stairways of Silla’s UNESCO-listed temple.', tip: 'Outside downtown, so give it its own half day. Check a map app for the current bus.' },
    ],
  },
  {
    id: 'jeonju', name: 'Jeonju', routeLink: true, spots: [
      { name: 'Jeonju Hanok Village', ko: '전주 한옥마을', category: 'Heritage', what: 'Walk streets of traditional tiled-roof houses.', tip: '10–15 minutes by taxi from Jeonju Station, or 20–25 minutes by city bus.' },
      { name: 'Gyeonggijeon Shrine', ko: '경기전', category: 'Heritage', what: 'See the shrine built for the portrait of Joseon’s founding king.', tip: 'In the middle of Hanok Village, so pair it with your walk there.' },
      { name: 'Nambu Night Market', ko: '남부시장 야시장', category: 'Local Market', what: 'Graze on street food inside the traditional market.', tip: 'A short walk from Hanok Village. The night market runs only on Fridays and Saturdays.' },
      { name: 'Jaman Mural Village', ko: '자만벽화마을', category: 'Art & Culture', what: 'Photograph colorful murals on a quiet hillside.', tip: 'A short uphill walk from the east side of Hanok Village.' },
    ],
  },
  {
    id: 'gangneung', name: 'Gangneung', routeLink: true, spots: [
      { name: 'Anmok Beach Coffee Street', ko: '안목해변 커피거리', category: 'Trendy Cafe', what: 'Sip local roasts in cafes facing the sea.', tip: 'About 15 minutes by taxi from Gangneung Station.' },
      { name: 'Jungang Market', ko: '강릉 중앙시장', category: 'Local Market', what: 'Try local snacks in the city’s central market.', tip: 'In the city center. Take a taxi or local bus from Anmok.' },
      { name: 'ARTE Museum Gangneung', ko: '아르떼뮤지엄', category: 'Art & Culture', what: 'Step inside large-scale digital art rooms.', tip: 'Near Gyeongpo. A taxi is the easy way from the market.' },
      { name: 'Jeongdongjin Sea Fan Trail', ko: '정동진 바다부채길', category: 'Coastal & Sea', what: 'Walk a boardwalk along the raw east coast cliffs.', tip: 'About 3 km and an hour one way, from Jeongdongjin to Simgok. Small entry fee, no toilets on the way.' },
    ],
  },
  {
    id: 'sokcho', name: 'Sokcho', routeLink: true, spots: [
      { name: 'Sokcho Tourist and Fishery Market', ko: '속초관광수산시장', category: 'Local Market', what: 'Snack on sweet fried chicken and local seafood.', tip: 'In the town center. Check a map app for the walk from your bus terminal.' },
      { name: 'Sokcho Eye', ko: '속초아이', category: 'Coastal & Sea', what: 'Ride the beachfront Ferris wheel for coastal views.', tip: 'At Sokcho Beach. It may stop on windy days, so check before you go.' },
      { name: 'Yeonggeumjeong', ko: '영금정', category: 'Coastal & Sea', what: 'Walk out to the seaside pavilion above the rocks.', tip: 'A short taxi ride from the market. Lovely around sunrise.' },
      { name: 'Seoraksan Cable Car', ko: '설악산 케이블카', category: 'Nature & Park', what: 'Ride up to the granite ridges of Seoraksan.', tip: 'Bus 7 or 7-1 to Seorak-dong, the last stop. Round-trip tickets only, and autumn queues run long.' },
    ],
  },
  {
    id: 'yeosu', name: 'Yeosu', routeLink: true, spots: [
      { name: 'Yeosu Maritime Cable Car', ko: '여수 해상케이블카', category: 'Coastal & Sea', what: 'Cross the harbor by cable car between Jasan and Dolsan.', tip: 'Board at Jasan Station, on the Odongdo side of town. The ride takes 13–20 minutes.' },
      { name: 'Odongdo Island', ko: '오동도', category: 'Coastal & Sea', what: 'Walk the causeway and forest paths of a small island.', tip: 'Close to the Jasan side of the cable car. Allow about an hour.' },
      { name: 'Nangman Pocha Street', ko: '낭만포차거리', category: 'Local Market', what: 'End the day with seafood at the waterfront tents.', tip: 'On the Jongpo seafront. It comes alive after dark.' },
      { name: 'Yi Sun-sin Square Food Street', ko: '이순신광장 먹거리거리', category: 'Local Market', what: 'Try Yeosu’s snacks around the admiral’s square by the harbor.', tip: 'In the old town near the Jongpo seafront, so it pairs well with Nangman Pocha Street.' },
    ],
  },
  {
    id: 'daegu', name: 'Daegu', routeLink: true, spots: [
      { name: 'Dongseongno and Spark Land', ko: '동성로 & 스파크랜드', category: 'Shopping & Street', what: 'Shop downtown and ride the rooftop Ferris wheel.', tip: 'Downtown Daegu, close to Jungangno Station (Line 1).' },
      { name: 'Seomun Night Market', ko: '서문시장 야시장', category: 'Local Market', what: 'Work through grilled skewers and street food.', tip: 'Seomun Market Station (Line 3). Reported open Friday to Sunday evenings in 2026.' },
      { name: 'Kim Gwangseok Street', ko: '김광석 다시그리기길', category: 'Trendy Cafe', what: 'Follow a 350-meter mural lane of cafes and boutiques.', tip: 'A short taxi ride from Seomun Market. Go before the night market opens.' },
      { name: 'Apsan Observatory', ko: '앞산전망대', category: 'Skyline & Modern', what: 'Look over the whole basin city from the mountain deck.', tip: 'Ride the Apsan cable car most of the way up. Best around sunset.' },
    ],
  },
  {
    id: 'andong', name: 'Andong', routeLink: true, spots: [
      { name: 'Hahoe Folk Village', ko: '안동 하회마을', category: 'Heritage', what: 'Walk a UNESCO-listed clan village inside a bend of the river.', tip: 'Well outside the city, so allow time. Check a map app for the bus, or take a taxi.' },
      { name: 'Woryeonggyo Bridge', ko: '월영교', category: 'Nature & Park', what: 'Cross Korea’s long wooden footbridge when it is lit at night.', tip: 'East of downtown. A short taxi ride, best after dark.' },
      { name: 'Andong Jjimdak Alley', ko: '안동 구시장 찜닭골목', category: 'Local Market', what: 'Share the city’s famous soy-braised chicken in the old market.', tip: 'Inside Andong Old Market downtown. Dishes are sized for two or more.' },
    ],
  },
  {
    id: 'chuncheon', name: 'Chuncheon', routeLink: true, spots: [
      { name: 'Nami Island', ko: '남이섬', category: 'Nature & Park', what: 'Walk the tree-lined avenues of a small river island.', tip: 'Ferry from the Gapyeong wharf, a short taxi ride from Gapyeong Station. It is on the way to Chuncheon, not in town.' },
      { name: 'LEGOLAND Korea', ko: '레고랜드 코리아', category: 'Art & Culture', what: 'Spend a day at the brick-built theme park on a lake island.', tip: 'Near Chuncheon Station. Winter days and rides are limited, so check the park calendar first.' },
      { name: 'Myeongdong Dakgalbi Street', ko: '춘천 명동 닭갈비골목', category: 'Local Market', what: 'Eat Chuncheon’s spicy stir-fried chicken at a street of specialists.', tip: 'In downtown Chuncheon. Most places need an order for two.' },
    ],
  },
  {
    id: 'jeju', name: 'Jeju', routeLink: true, spots: [
      { name: 'Seongsan Ilchulbong', ko: '성산일출봉', category: 'Nature & Park', what: 'Climb the volcanic crater on the island’s eastern tip.', tip: 'Far east of Jeju City, so plan a long bus ride or rent a car. Go early to see sunrise.' },
      { name: 'Hamdeok Beach', ko: '함덕해수욕장', category: 'Coastal & Sea', what: 'Relax on pale sand beside clear turquoise water.', tip: 'On the north coast, east of Jeju City and an easy bus or taxi ride from town.' },
      { name: 'Dongmun Night Market', ko: '동문시장 야시장', category: 'Local Market', what: 'Taste tangerines, seafood and evening street food.', tip: 'In central Jeju City. The night stalls open around sunset and run to about midnight.' },
      { name: 'Soesokkak', ko: '쇠소깍', category: 'Nature & Park', what: 'See a jade-green river gorge where it meets the sea.', tip: 'On the south coast near Seogwipo, so pair it with other southern stops.' },
      { name: 'Osulloc Tea Museum', ko: '오설록 티뮤지엄', category: 'Trendy Cafe', what: 'Try green tea desserts beside the rolling tea fields.', tip: 'In the southwest of the island. Check a map app for the bus, or drive.' },
    ],
  },
]
