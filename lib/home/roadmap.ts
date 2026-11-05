/**
 * 홈 '첫 여행 로드맵' — 도착 → 교통 → 식당·카페 → 쇼핑·결제 → 여가 순으로 이미 있는 글을 엮는다.
 *
 * 최신순 나열 대신 여행자가 실제로 겪는 순서대로 고른 큐레이션이다. 단계마다
 *   hub     — 그 단계의 대표 글(카드 썸네일로 크게)
 *   more    — 같은 단계의 다음 글 3편(짧은 이름으로)
 *   phrase  — 그 상황에서 바로 쓰는 Phrases 글 1편
 * slug 는 en 글 기준. 글이 비공개·삭제되면 홈은 그 항목만 조용히 뺀다(app/page.tsx).
 * 새 글이 생기면(예: 전자입국신고 · 환전 · 메뉴판) 해당 단계의 more 에 slug 만 넣는다.
 */
export type RoadmapLink = { slug: string; label: string }
export type RoadmapStep = {
  key: string
  step: string
  title: string
  blurb: string
  hub: string
  more: RoadmapLink[]
  phrase: RoadmapLink
}

export const ROADMAP: readonly RoadmapStep[] = [
  {
    key: 'arrive',
    step: 'Arrive',
    title: 'Land and get connected',
    blurb: 'Airport to city, data on your phone, cash and cards sorted.',
    hub: 'incheon-airport-survival-guide',
    more: [
      { slug: 'korea-tourist-sim-vs-esim-airport-guide', label: 'SIM card vs eSIM' },
      { slug: 'foreign-credit-cards-global-atm-korea', label: 'Foreign cards & global ATMs' },
      { slug: 'hands-free-seoul-subway-lockers-guide', label: 'Lockers & luggage delivery' },
    ],
    phrase: { slug: 'hotel-check-in-korea', label: 'Checking into your hotel' },
  },
  {
    key: 'move',
    step: 'Get around',
    title: 'Subway, bus and taxi',
    blurb: 'The right transit card, a map app that works, and how to call a cab.',
    hub: 'climate-card-vs-t-money-seoul',
    more: [
      { slug: 'google-maps-alternatives-korea', label: 'Naver Map & KakaoMap' },
      { slug: 'seoul-taxi-cheapest-kakao-uber', label: 'Kakao T vs Uber' },
      { slug: 'korean-subway-etiquette-guide', label: 'Riding the Seoul subway' },
    ],
    phrase: { slug: 'korean-subway-phrases-first-trip', label: 'Subway phrases' },
  },
  {
    key: 'eat',
    step: 'Eat & drink',
    title: 'Restaurants and cafes',
    blurb: 'How ordering works, the two-serving rule, and how spicy it really is.',
    hub: 'korean-restaurant-ordering-guide',
    more: [
      { slug: 'samgyeopsal-hanwoo-chadolbaegi-korean-bbq', label: 'Korean BBQ, step by step' },
      { slug: 'is-korean-food-spicy', label: 'Heat levels & mild dishes' },
      { slug: 'korean-cafe-kiosk-ordering-guide', label: 'Ordering at a cafe kiosk' },
    ],
    phrase: { slug: 'order-non-spicy-food-korea', label: 'Asking for less spicy' },
  },
  {
    key: 'shop',
    step: 'Shop & pay',
    title: 'Shopping and paying',
    blurb: 'Tax-free checkout, mobile pay, and why nobody tips.',
    hub: 'olive-young-instant-tax-refund-guide',
    more: [
      { slug: 'mobile-payment-apple-pay-korea-foreigners', label: 'Apple Pay & mobile payment' },
      { slug: 'zero-tipping-split-bills-korea', label: 'No tipping, split bills' },
      { slug: 'korean-convenience-store-dining-guide', label: 'Eating at convenience stores' },
    ],
    phrase: { slug: 'need-a-bag-korean-checkout', label: '“Do you need a bag?”' },
  },
  {
    key: 'play',
    step: 'Have fun',
    title: 'Evenings and days off',
    blurb: 'Han River picnics, bathhouses, karaoke and the newest neighborhoods.',
    hub: 'han-river-parks-seoul-guide',
    more: [
      { slug: 'korean-bathhouse-jjimjilbang-guide', label: 'Jjimjilbang bathhouses' },
      { slug: 'noraebang-korean-karaoke-guide', label: 'Noraebang karaoke' },
      { slug: 'seongsu-dong-pop-up-cafe-guide', label: 'Seongsu pop-ups & cafes' },
    ],
    phrase: { slug: 'korean-noraebang-phrases', label: 'Karaoke room phrases' },
  },
]
