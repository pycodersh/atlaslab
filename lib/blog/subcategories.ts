/**
 * 블로그 하위 분류(서브 카테고리) — Phrases / Basics / Food / Life 목록의 칩 필터(Explore Korea 는 category 로). 대분류마다 2~3개만 둔다.
 *
 * 저장 위치: DB 컬럼이 아니라 이 파일이다.
 *  - blog_posts 에 컬럼을 추가하면 마이그레이션을 사람이 SQL 에디터에서 따로 돌려야 하고,
 *    돌리기 전에 배포되면 select 가 통째로 실패한다. 코드 쪽에 두면 푸시만으로 끝난다.
 *  - 기존 글은 SUBCATEGORY_OVERRIDES 에 슬러그별로 못 박아 둔다(제목만으로는 애매한 글이 있다).
 *  - 새로 자동 생성되는 글은 오버라이드에 없으므로 classifyBySubcategoryRules 가 제목·슬러그로 분류한다.
 *    규칙이 못 잡으면 섹션의 마지막 분류로 떨어져 어떤 글도 필터에서 사라지지 않는다.
 *  - 재분류 검토는 scripts/classify-subcategories.ts 로 한다.
 *
 * 다중 태깅: 글의 대표 분류(위 오버라이드 · 규칙)는 하나지만, SECONDARY_TAGS 로 다른 칩 · 다른 탭에도 걸 수 있다.
 * 태그는 'group/sub' 형식이다(예: 남이섬 = 대표 Explore Korea/Places + 'life/getting-around').
 * 목록은 subcategoriesOf(배열)와 includes 로 거르고, 다른 탭 태그가 있으면 그 탭 목록에도 나온다.
 * 대표 분류는 검색 의도로 정한다: 무엇을 먹을까 → Food, 어떻게 움직이고 대처할까 → Life, 어디를 갈까 → Explore Korea.
 */
import { topicSectionKey, type BlogGroupKey } from './sections'

export type Subcategory = { key: string; label: string; short?: string }

/** 섹션별 서브 카테고리. 배열 순서가 칩 순서다. 마지막 항목이 기본값(fallback)이다. */
export const SUBCATEGORIES: Partial<Record<BlogGroupKey, readonly Subcategory[]>> = {
  // 카테고리(section)가 곧 서브 분류인 그룹 — 글의 category 로 정해지며 규칙·오버라이드가 필요 없다
  'explore-korea': [
    { key: 'hotels', label: 'Hotels' },
    { key: 'places', label: 'Places' },
  ],
  // 대분류마다 2~3개만 둔다. 폰에서는 short 를 써서 칩이 한 줄에 들어오게 한다
  phrases: [
    { key: 'survival', label: 'Survival & Order', short: 'Survival' },
    { key: 'social', label: 'Social & Casual', short: 'Social' },
  ],
  // DB category 는 그대로(Korean Grammar · Hangul & Pronunciation …) 두고 칩만 여기서 나눈다
  basics: [
    { key: 'hangul', label: 'Hangul & Pronunciation', short: 'Hangul' },
    { key: 'grammar', label: 'Core Grammar & Rules', short: 'Grammar' },
  ],
  food: [
    { key: 'dishes', label: 'Must-Try Dishes', short: 'Dishes' },
    { key: 'street', label: 'Street Food & Snacks', short: 'Street Food' },
    { key: 'culture', label: 'Dining Culture & Rules', short: 'Culture' },
  ],
  life: [
    { key: 'getting-around', label: 'Getting Around', short: 'Transit' },
    { key: 'etiquette', label: 'Local Etiquette', short: 'Etiquette' },
    { key: 'essentials', label: 'Travel Essentials', short: 'Essentials' },
  ],
}

/** 글이 아직 없어도 칩을 보여 주는 그룹(구조를 먼저 드러낸다). 나머지는 글이 있는 칩만 보인다. */
export const KEEP_EMPTY_SUB_CHIPS: ReadonlySet<string> = new Set(['explore-korea'])

export function subcategoriesFor(section: string): readonly Subcategory[] {
  return SUBCATEGORIES[section as BlogGroupKey] ?? []
}

export function isValidSubcategory(section: string, sub: string | undefined): sub is string {
  return !!sub && subcategoriesFor(section).some(s => s.key === sub)
}

/** 기존 글의 확정 분류 (slug → 서브 카테고리 key). 섹션은 슬러그가 속한 섹션으로 정해진다. */
export const SUBCATEGORY_OVERRIDES: Record<string, string> = {
  // ── Phrases ──────────────────────────────────────────────────
  // Survival & Order — 식당 · 카페 · 쇼핑 · 결제 · 길 찾기 · 숙소 · 약국처럼 현장에서 해결해야 하는 말
  'korean-cafe-words-you-need': 'survival',
  'return-tray-korean-cafe': 'survival',
  'where-is-the-bathroom-korean-cafe': 'survival',
  'korean-cafe-wifi-and-outlets': 'survival',
  'for-here-or-to-go-korean': 'survival',
  'order-iced-americano-korea': 'survival',
  'how-to-order-at-a-korean-cafe': 'survival',
  'spicy-food-korean-phrases': 'survival',
  'pay-at-table-or-counter-korea': 'survival',
  'korean-bbq-alone-2-servings': 'survival',
  'order-non-spicy-food-korea': 'survival',
  'korean-restaurant-call-bell': 'survival',
  'are-side-dishes-free-in-korea': 'survival',
  'how-to-order-at-a-korean-restaurant': 'survival',
  'ordering-korean-street-food': 'survival',
  'ordering-food-delivery-in-korea': 'survival',
  'paying-at-olive-young-korea': 'survival',
  'asking-recommendations-olive-young-korea': 'survival',
  'finding-items-olive-young-korea': 'survival',
  'k-beauty-store-korean-vocabulary': 'survival',
  'show-id-buying-alcohol-korea': 'survival',
  'one-plus-one-convenience-store-korea': 'survival',
  'need-a-bag-korean-checkout': 'survival',
  'cup-ramen-convenience-store-korea': 'survival',
  'korean-convenience-store-phrases': 'survival',
  'shopping-at-a-korean-traditional-market': 'survival',
  'buying-clothes-in-korean': 'survival',
  'asking-bus-destination-korea': 'survival',
  'paying-for-taxi-korea': 'survival',
  'taxi-where-to-go-korea': 'survival',
  'asking-for-directions-in-korean': 'survival',
  'korean-subway-phrases-first-trip': 'survival',
  'hotel-check-in-korea': 'survival',
  'hotel-luggage-storage-korea': 'survival',
  'hotel-late-checkout-korea': 'survival',
  'hotel-airport-shuttle-korea': 'survival',
  'visiting-a-korean-palace-phrases': 'survival',
  'korean-pharmacy-what-to-say': 'survival',
  'seeing-a-doctor-in-korea': 'survival',
  'korean-restaurant-drop-yo-water': 'survival',
  'korean-shopping-try-on-clothes': 'survival',
  // Social & Casual — 인사 · 스몰토크 · 친구와 노는 자리의 말
  'giving-seat-elderly-korea-bus': 'social',
  'korean-noraebang-phrases': 'social',
  'adding-time-coin-norebang-korea': 'social',
  'how-to-search-songs-korean-norebang': 'social',
  'how-to-use-korean-photo-booth': 'social',
  'picking-background-korean-photo-booth': 'social',
  'han-river-picnic-korean-phrases': 'social',
  'lifting-heavy-box-korean': 'social',

  // ── Basics ──────────────────────────────────────────────────
  // Hangul & Pronunciation — 자모 · 받침 · 발음 · 표기 · 숫자 읽기
  'how-to-read-hangul-in-one-day': 'hangul',
  'korean-vowels-all-21-explained': 'hangul',
  'korean-consonants-19-basic-sounds': 'hangul',
  'korean-batchim-final-consonants-explained': 'hangul',
  'korean-syllable-structure-why-every-block-matters': 'hangul',
  'common-pronunciation-mistakes-korean-learners-make': 'hangul',
  'how-long-to-learn-hangul': 'hangul',
  'why-hangul-is-called-scientific-alphabet': 'hangul',
  'korean-romanization-two-spellings': 'hangul',
  'how-to-type-korean-phone-computer': 'hangul',
  'busan-dialect-vs-seoul-korean': 'hangul',
  'korean-two-number-systems': 'hangul',
  'korean-counters-gae-myeong-jan-byeong': 'hangul',
  'korean-prices-money-eolmayeyo': 'hangul',
  'korean-dates-days-of-week': 'hangul',
  'korean-age-sal-man-nai': 'hangul',
  // Core Grammar & Rules — 조사 · 어순 · 시제 · 어미 · 높임
  'korean-verb-conjugation-ayo-eoyo': 'grammar',
  'korean-past-tense-explained': 'grammar',
  'korean-future-tense-eul-geoyeyo': 'grammar',
  'korean-irregular-verbs-seven-types': 'grammar',
  'korean-have-you-ever-eo-boda': 'grammar',
  'korean-can-su-itda-eopda': 'grammar',
  'korean-connecting-go-vs-myeonseo': 'grammar',
  'korean-politeness-levels-explained': 'grammar',
  'korean-never-say-dangsin-neo': 'grammar',
  'korean-requests-a-eo-juseyo': 'grammar',
  'korean-because-aseo-vs-euni-kka': 'grammar',
  'korean-particle-euro-by-to-as': 'grammar',
  'korean-particles-e-vs-eseo': 'grammar',
  'korean-topic-vs-subject-particle': 'grammar',
  'korean-object-particle-eul-reul': 'grammar',
  'korean-an-vs-mot-negation': 'grammar',
  'korean-sentence-structure-sov-why-the-verb-goes-last': 'grammar',
  'why-korean-has-no-articles': 'grammar',
  'is-korean-hard-to-learn-for-english-speakers': 'grammar',
  'korean-vs-japanese-what-transfers': 'grammar',
  'what-k-drama-titles-teach-you-about-korean': 'grammar',

  // ── Korean food ──────────────────────────────────────────────────
  // Must-Try Dishes — 고기 · 국물 · 밥 · 면 대표 요리
  'how-to-eat-korean-bossam': 'dishes',
  'chimaek-korean-fried-chicken-beer-guide': 'dishes',
  'bulgogi-vs-galbi-korean-beef-guide': 'dishes',
  'why-korean-marinades-use-asian-pear': 'dishes',
  'korean-vs-american-fried-chicken': 'dishes',
  'galbijjim-vs-western-beef-stew': 'dishes',
  'korean-bbq-fried-rice-guide': 'dishes',
  'korean-ssambap-dining-guide': 'dishes',
  'chuncheon-dakgalbi-at-home': 'dishes',
  'jeju-black-pork-vs-samgyeopsal': 'dishes',
  'andong-jjimdak-why-soy-not-spicy': 'dishes',
  'kalguksu-knife-cut-noodle-soup-ordering-guide': 'dishes',
  'korean-ttukbaegi-cooking-guide': 'dishes',
  'seolleongtang-seasoning-guide-ox-bone-soup': 'dishes',
  'haejangguk-korean-hangover-soups-guide': 'dishes',
  'budae-jjigae-korean-army-stew-guide': 'dishes',
  'sundubu-jjigae-ordering-guide': 'dishes',
  'samgyetang-korean-ginseng-chicken-soup-guide': 'dishes',
  'gukbap-and-juk-korean-comfort-food': 'dishes',
  'korean-guk-tang-jjigae-jeongol-explained': 'dishes',
  'kimchi-jjigae-vs-doenjang-jjigae': 'dishes',
  'korean-anchovy-stock-guide': 'dishes',
  'gyeran-jjim-korean-steamed-egg-guide': 'dishes',
  'korean-japchae-guide': 'dishes',
  'jajangmyeon-vs-jjamppong-korean-chinese-food': 'dishes',
  'gyeongju-ssambap-what-is-it': 'dishes',
  'mackerel-jorim-vs-galchi-jorim': 'dishes',
  'busan-milmyeon-vs-naengmyeon': 'dishes',
  'jeonju-bibimbap-vs-regular-bibimbap': 'dishes',
  'easy-korean-dishes-for-beginners': 'dishes',
  'korean-namul-vegetable-side-dishes': 'dishes',
  'how-to-cook-korean-rice': 'dishes',
  'korean-dishes-with-kimchi-rice-and-eggs': 'dishes',
  'baechu-vs-kkakdugi-kimchi-guide': 'dishes',
  // Street Food & Snacks — 분식 · 시장 · 편의점 · 간식
  'korean-mandu-dumplings-types-cooking-guide': 'street',
  'korean-goguma-guide': 'street',
  'kimbap-ingredients-ordering-guide-korea': 'street',
  'korean-winter-street-snacks-hotteok-bungeoppang': 'street',
  'korean-savory-pancakes-guide': 'street',
  'korean-instant-noodles-compared': 'street',
  'tteokbokki-tteok-vs-tteokguk-tteok-comparison': 'street',
  'korean-convenience-store-combo-meals': 'street',
  'sundae-differs-by-region': 'street',
  'gwangjang-market-guide': 'street',
  'what-is-tteokbokki-how-spicy': 'street',
  'instant-ramyeon-upgrade-guide': 'street',
  'hongdae-street-food-guide': 'street',
  'myeongdong-street-food-guide': 'street',
  // Dining Culture & Rules — 먹는 법 · 메뉴 읽기 · 술 · 지역 음식 · 재료 이해
  'gim-nori-miyeok-dasima-korean-seaweed': 'culture',
  'doenjang-vs-miso-substitute': 'culture',
  'gochugaru-vs-chili-flakes-substitute': 'culture',
  'what-is-perilla-leaf-substitute': 'culture',
  'how-long-do-korean-pantry-staples-last': 'culture',
  'cook-korean-food-without-korean-grocery-store': 'culture',
  'sesame-oil-vs-perilla-oil': 'culture',
  'how-to-buy-store-and-use-kimchi': 'culture',
  'korean-pantry-first-ingredients': 'culture',
  'korean-soy-sauce-types': 'culture',
  'gochujang-substitutes': 'culture',
  'gochujang-vs-gochugaru-vs-doenjang': 'culture',
  'guide-to-sikhye-and-sujeonggwa': 'culture',
  'soju-makgeolli-cheongju-korea-guide': 'culture',
  'korean-songpyeon-pine-needles-science': 'culture',
  'regional-korean-food-map': 'culture',
  'kimchi-differs-by-region': 'culture',
  'is-korean-food-vegetarian-friendly': 'culture',
  'what-is-banchan-korean-side-dishes': 'culture',
  'how-to-read-korean-restaurant-menu': 'culture',
  'is-korean-food-spicy': 'culture',
  'noryangjin-fish-market-guide-how-to-eat-hoe': 'culture',

  // ── Life in Korea ──────────────────────────────────────────────────
  // Getting Around — 지하철 · 버스 · 택시 · KTX · 지도 · 주소
  'jeju-island-without-a-car': 'getting-around',
  'korean-subway-etiquette-guide': 'getting-around',
  'how-to-ride-city-buses-in-seoul': 'getting-around',
  'seoul-taxi-cheapest-kakao-uber': 'getting-around',
  'how-to-book-ktx-tickets-foreigner': 'getting-around',
  'ktx-vs-express-bus-korea-day-trips': 'getting-around',
  'climate-card-vs-t-money-seoul': 'getting-around',
  'hands-free-seoul-subway-lockers-guide': 'getting-around',
  'seoul-subway-transfer-transit-card-guide': 'getting-around',
  'korea-taxi-survival-guide': 'getting-around',
  'incheon-airport-survival-guide': 'getting-around',
  'google-maps-alternatives-korea': 'getting-around',
  'korean-road-name-address-vs-lot-number-guide': 'getting-around',
  // Local Etiquette — 매너 · 카페 · 화장실 · 쓰레기 · 일상 문화
  'zero-tipping-split-bills-korea': 'etiquette',
  'public-restrooms-korea-guide': 'etiquette',
  'where-are-trash-cans-in-seoul': 'etiquette',
  'how-korean-apartment-recycling-works': 'etiquette',
  'korean-table-etiquette-spoon-chopsticks-guide': 'etiquette',
  'korean-gift-giving-etiquette-guide': 'etiquette',
  'korean-restaurant-ordering-guide': 'etiquette',
  'korean-cafe-kiosk-ordering-guide': 'etiquette',
  'korean-cafe-laptop-safety-rules': 'etiquette',
  'hidden-passwords-korean-cafes-guide': 'etiquette',
  'solo-dining-seoul-kbbq-break-time': 'etiquette',
  'samgyeopsal-hanwoo-chadolbaegi-korean-bbq': 'etiquette',
  'korean-convenience-store-dining-guide': 'etiquette',
  'nunchi-korean-reading-the-room': 'etiquette',
  'han-river-parks-seoul-guide': 'etiquette',
  'korean-templestay-booking-guide-for-foreigners': 'etiquette',
  'korean-bathhouse-jjimjilbang-guide': 'etiquette',
  'noraebang-korean-karaoke-guide': 'etiquette',
  'korean-internet-slang-guide': 'etiquette',
  'korean-new-year-seollal-explained': 'etiquette',
  'korean-age-system-explained': 'etiquette',
  'konglish-words-when-english-becomes-korean': 'etiquette',
  // Travel Essentials — SIM · 결제 · 환전 · 택스리펀 · 입국 · 의료 · 안전 · 행정
  'korean-fine-dust-apps-mask-guide': 'essentials',
  'korean-delivery-apps-tourists': 'essentials',
  'korea-tourist-sim-vs-esim-airport-guide': 'essentials',
  'korea-currency-exchange-cards-wowpass-guide': 'essentials',
  'foreign-credit-cards-global-atm-korea': 'essentials',
  'olive-young-instant-tax-refund-guide': 'essentials',
  'jeonse-vs-wolse-korean-rental-deposits-foreigners': 'essentials',
  'mobile-payment-apple-pay-korea-foreigners': 'essentials',
  'korea-arrival-card-keta-guide': 'essentials',
  'is-korea-safe-emergency-numbers-tourists': 'essentials',
  'late-night-medicine-korea-clinics-guide': 'essentials',
  'korean-national-health-insurance-foreigners': 'essentials',
  'how-to-get-arc-korea-student': 'essentials',
  'sending-packages-in-korea-post-office-convenience-store-lockers': 'essentials',
  'packing-guide-korea-by-season': 'essentials',
  'korea-coin-laundromat-guide': 'essentials',
}

/**
 * 대표 분류 밖의 추가 태그 (slug → 'group/sub'[]). 대표 그룹 안의 다른 칩일 수도, 다른 탭일 수도 있다.
 * 다른 탭 태그가 붙은 글은 그 탭 목록과 칩에도 나온다(주소 · 대표 분류 · 뱃지는 그대로).
 */
export const SECONDARY_TAGS: Record<string, readonly string[]> = {
  // 여행지(Explore Korea 대표) — 가는 법 · 즐기는 문화가 함께 있는 글
  'nami-island-day-trip-seoul-guide': ['life/getting-around'],
  'seoul-vs-busan-first-time-visitors': ['life/getting-around'],
  'seoul-itinerary-first-timers-3-4-5-days': ['life/getting-around'],
  'korea-cherry-blossom-autumn-foliage-guide': ['life/etiquette'],
  'seongsu-dong-pop-up-cafe-guide': ['life/etiquette'],
  'hiking-in-korea-guide': ['life/etiquette'],
  // 한옥 스테이 — 2026-11-05 Places 대표로 옮기고 Life 칩에도 남긴다
  'hanok-stay-korea-booking-etiquette': ['life/etiquette'],
  // Life 대표 — 목적지 성격도 강한 글
  'jeju-island-without-a-car': ['explore-korea/places'],
  'korean-templestay-booking-guide-for-foreigners': ['explore-korea/places'],
  'han-river-parks-seoul-guide': ['explore-korea/places', 'food/street'],
  // Food 대표 — 동네 · 시장 자체가 여행 코스인 글
  'myeongdong-street-food-guide': ['explore-korea/places'],
  'gwangjang-market-guide': ['explore-korea/places'],
  'hongdae-street-food-guide': ['explore-korea/places'],
  'noryangjin-fish-market-guide-how-to-eat-hoe': ['explore-korea/places'],
  'gyeongju-ssambap-what-is-it': ['explore-korea/places'],
  // 음식 ↔ 생활 매너
  'soju-makgeolli-cheongju-korea-guide': ['life/etiquette'],
  'korean-convenience-store-combo-meals': ['life/etiquette'],
  'korean-convenience-store-dining-guide': ['food/street'],
  'samgyeopsal-hanwoo-chadolbaegi-korean-bbq': ['food/dishes'],
  'korean-table-etiquette-spoon-chopsticks-guide': ['food/culture'],
  'solo-dining-seoul-kbbq-break-time': ['food/culture'],
  'korean-restaurant-ordering-guide': ['food/culture'],
  'korean-songpyeon-pine-needles-science': ['life/etiquette'],
  // 같은 그룹 안의 두 번째 칩
  'why-korean-marinades-use-asian-pear': ['food/culture'],
  'korean-anchovy-stock-guide': ['food/culture'],
  'tteokbokki-tteok-vs-tteokguk-tteok-comparison': ['food/culture'],
  'zero-tipping-split-bills-korea': ['life/essentials'],
  'korean-subway-etiquette-guide': ['life/etiquette'],
  'incheon-airport-survival-guide': ['life/essentials'],
}

type Rule = { sub: string; test: RegExp }

/**
 * 오버라이드에 없는 새 글용 규칙. 제목 + 슬러그를 소문자로 합쳐 위에서부터 처음 맞는 것을 쓴다.
 * 규칙이 없는 마지막 분류가 기본값이다.
 */
const RULES: Partial<Record<BlogGroupKey, readonly Rule[]>> = {
  phrases: [
    { sub: 'survival', test: /\b(hotel|check-?in|check-?out|luggage|shuttle|hostel|guesthouse|cafes?|coffee|americano|latte|taxi|bus|subway|train|ktx|directions?|airport|olive young|convenience store|shopping|store|market|clothes|checkout|bag|buy|pay|paying|restaurant|food|bbq|spicy|order|ordering|menu|delivery|side dishes|waiter|pharmacy|doctor|hospital|palace|museum)\b/ },
  ],
  basics: [
    { sub: 'hangul', test: /\b(hangul|pronunciation|pronounce|vowels?|consonants?|batchim|romanization|syllables?|alphabet|typing|keyboard|dialect|accent|numbers?|counters?|counting|prices?|money|won|dates?|days of the week|age|clock)\b/ },
  ],
  food: [
    { sub: 'culture', test: /\b(substitutes?|pantry|staples|shelf life|storage|ingredients? to buy|soy sauce|sesame oil|perilla oil|etiquette|menu|banchan|side dishes|refill|call bell|honbap|solo dining)\b/ },
    { sub: 'street', test: /\b(street|snacks?|tteokbokki|hotteok|bungeoppang|kimbap|mandu|dumplings?|odeng|ramyeon|ramen|convenience|pancakes?|sundae|market)\b/ },
    { sub: 'dishes', test: /\b(jjigae|tang|guk|gukbap|stew|soup|broth|kalguksu|ttukbaegi|bbq|barbecue|samgyeopsal|galbi|bulgogi|bossam|pork|beef|chicken|dak|ribs|grill|meat|steak|bibimbap|japchae|jajangmyeon|jjamppong|naengmyeon|milmyeon|noodles?|rice|egg|jorim|namul|recipe|dishes|at home|cook)\b/ },
  ],
  life: [
    { sub: 'getting-around', test: /\b(subway|bus|buses|taxi|ktx|train|airport|transit|t-money|climate card|jeju|getting around|transfer|nami|day trip|naver map|maps?|address)\b/ },
    { sub: 'etiquette', test: /\b(etiquette|manners|table|kiosk|restaurants?|cafes?|dining|honbap|restrooms?|toilets?|trash|recycling|tipping|culture|custom|customs|slang)\b/ },
  ],
}

/** 오버라이드를 제외한 순수 규칙 분류. 섹션의 마지막 분류가 기본값이다. */
export function classifyBySubcategoryRules(
  section: string,
  post: { slug: string; title: string },
): string | null {
  const subs = subcategoriesFor(section)
  if (!subs.length) return null
  const hay = `${post.title} ${post.slug.replace(/-/g, ' ')}`.toLowerCase()
  const hit = RULES[section as BlogGroupKey]?.find(r => r.test.test(hay))
  return hit?.sub ?? subs[subs.length - 1].key
}

/**
 * 글의 서브 카테고리 key. 서브 분류가 없는 그룹이면 null.
 * explore-korea 는 글의 category(= 세부 섹션: hotels · places)가 곧 서브 카테고리이고,
 * food / life 는 슬러그 오버라이드 → 제목 규칙 순서로 정한다.
 */
export function subcategoryOf(
  group: string | null,
  post: { slug: string; title: string; app?: string; category?: string | null },
): string | null {
  if (!group || !subcategoriesFor(group).length) return null
  if (group === 'explore-korea') {
    const section = topicSectionKey(post.app ?? 'k-patto', post.category ?? null)
    return section && isValidSubcategory(group, section) ? section : null
  }
  const fixed = SUBCATEGORY_OVERRIDES[post.slug]
  if (fixed && isValidSubcategory(group, fixed)) return fixed
  return classifyBySubcategoryRules(group, post)
}

/** SECONDARY_TAGS 중 해당 그룹에 걸린 서브 key 들 */
function secondaryIn(group: string, slug: string): string[] {
  return (SECONDARY_TAGS[slug] ?? [])
    .map(t => t.split('/'))
    .filter(([g, s]) => g === group && isValidSubcategory(group, s))
    .map(([, s]) => s)
}

/** 대표 그룹이 아닌데 SECONDARY_TAGS 로 이 그룹 목록에도 나와야 하는 글인지 */
export function isCrossListed(slug: string, group: string): boolean {
  return secondaryIn(group, slug).length > 0
}

/**
 * 글이 이 그룹 안에서 걸리는 서브 key 전부(대표 먼저). 목록 칩 필터는 이걸 includes 로 본다.
 * homeGroup 은 글의 대표 그룹 — 대표 분류는 대표 그룹 안에서만 센다.
 */
export function subcategoriesOf(
  group: string | null,
  homeGroup: string | null,
  post: { slug: string; title: string; app?: string; category?: string | null },
): string[] {
  if (!group) return []
  const primary = group === homeGroup ? subcategoryOf(group, post) : null
  return [...new Set([...(primary ? [primary] : []), ...secondaryIn(group, post.slug)])]
}

/** 레지스트리 · 보고용 — 대표 + 추가 태그를 'group/sub' 로 */
export function allTagsOf(
  homeGroup: string | null,
  post: { slug: string; title: string; app?: string; category?: string | null },
): string[] {
  const primary = homeGroup ? subcategoryOf(homeGroup, post) : null
  return [...new Set([
    ...(homeGroup ? [primary ? `${homeGroup}/${primary}` : homeGroup] : []),
    ...(SECONDARY_TAGS[post.slug] ?? []),
  ])]
}
