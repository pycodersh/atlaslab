/**
 * 블로그 하위 분류(서브 카테고리) — Korean food / Life in Korea 목록의 칩 필터.
 *
 * 저장 위치: DB 컬럼이 아니라 이 파일이다.
 *  - blog_posts 에 컬럼을 추가하면 마이그레이션을 사람이 SQL 에디터에서 따로 돌려야 하고,
 *    돌리기 전에 배포되면 select 가 통째로 실패한다. 코드 쪽에 두면 푸시만으로 끝난다.
 *  - 기존 글은 SUBCATEGORY_OVERRIDES 에 슬러그별로 못 박아 둔다(제목만으로는 애매한 글이 있다).
 *  - 새로 자동 생성되는 글은 오버라이드에 없으므로 classifyBySubcategoryRules 가 제목·슬러그로 분류한다.
 *    규칙이 못 잡으면 섹션의 마지막 분류(문화·일상)로 떨어져 어떤 글도 필터에서 사라지지 않는다.
 *  - 재분류 검토는 scripts/classify-subcategories.ts 로 한다.
 *
 * 다중 태깅: 글의 대표 분류(위 오버라이드 · 규칙)는 하나지만, SECONDARY_TAGS 로 다른 칩 · 다른 탭에도 걸 수 있다.
 * 태그는 'group/sub' 형식이다(예: 남이섬 = 대표 Explore Korea/Places + 'life/transit').
 * 목록은 subcategoriesOf(배열)와 includes 로 거르고, 다른 탭 태그가 있으면 그 탭 목록에도 나온다.
 * 대표 분류는 검색 의도로 정한다: 무엇을 먹을까 → Food, 어떻게 움직이고 대처할까 → Life, 어디를 갈까 → Explore Korea.
 */
import { topicSectionKey, type BlogGroupKey } from './sections'

export type Subcategory = { key: string; label: string }

/** 섹션별 서브 카테고리. 배열 순서가 칩 순서다. 마지막 항목이 기본값(fallback)이다. */
export const SUBCATEGORIES: Partial<Record<BlogGroupKey, readonly Subcategory[]>> = {
  // 카테고리(section)가 곧 서브 분류인 그룹 — 글의 category 로 정해지며 규칙·오버라이드가 필요 없다
  'explore-korea': [
    { key: 'hotels', label: 'Hotels' },
    { key: 'places', label: 'Places' },
  ],
  food: [
    { key: 'bbq', label: 'BBQ & Meat' },
    { key: 'soups', label: 'Soups & Stews' },
    { key: 'street', label: 'Street Food & Snacks' },
    { key: 'meals', label: 'Classic Meals' },
    { key: 'pantry', label: 'Pantry & Substitutes' },
    { key: 'culture', label: 'Food Culture & Drinks' },
  ],
  life: [
    { key: 'transit', label: 'Transit' },
    { key: 'apps', label: 'Apps & Connectivity' },
    { key: 'money', label: 'Money & Shopping' },
    { key: 'essentials', label: 'Health, Safety & Admin' },
    { key: 'etiquette', label: 'Etiquette & Eating Out' },
    { key: 'daily', label: 'Daily Culture' },
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
  // ── Korean food ────────────────────────────────────────────
  // BBQ & Meat
  'how-to-eat-korean-bossam': 'bbq',
  'chimaek-korean-fried-chicken-beer-guide': 'bbq',
  'bulgogi-vs-galbi-korean-beef-guide': 'bbq',
  'why-korean-marinades-use-asian-pear': 'bbq',
  'korean-vs-american-fried-chicken': 'bbq',
  'galbijjim-vs-western-beef-stew': 'bbq',
  'korean-bbq-fried-rice-guide': 'bbq',
  'korean-ssambap-dining-guide': 'bbq',
  'chuncheon-dakgalbi-at-home': 'bbq',
  'jeju-black-pork-vs-samgyeopsal': 'bbq',
  'andong-jjimdak-why-soy-not-spicy': 'bbq',
  // Soups & Stews
  'kalguksu-knife-cut-noodle-soup-ordering-guide': 'soups',
  'korean-ttukbaegi-cooking-guide': 'soups',
  'seolleongtang-seasoning-guide-ox-bone-soup': 'soups',
  'haejangguk-korean-hangover-soups-guide': 'soups',
  'budae-jjigae-korean-army-stew-guide': 'soups',
  'sundubu-jjigae-ordering-guide': 'soups',
  'samgyetang-korean-ginseng-chicken-soup-guide': 'soups',
  'gukbap-and-juk-korean-comfort-food': 'soups',
  'korean-guk-tang-jjigae-jeongol-explained': 'soups',
  'kimchi-jjigae-vs-doenjang-jjigae': 'soups',
  'korean-anchovy-stock-guide': 'soups',
  // Street Food & Snacks
  'korean-mandu-dumplings-types-cooking-guide': 'street',
  'korean-goguma-guide': 'street',
  'kimbap-ingredients-ordering-guide-korea': 'street',
  'korean-winter-street-snacks-hotteok-bungeoppang': 'street',
  'korean-savory-pancakes-guide': 'street',
  'korean-instant-noodles-compared': 'street',
  'tteokbokki-tteok-vs-tteokguk-tteok-comparison': 'street',
  'korean-convenience-store-combo-meals': 'street',
  'sundae-differs-by-region': 'street',
  // 원래 Life 글이었으나 방문 목적이 분식·길거리 음식이라 category 를 Cooking Basics 로 옮겨 food 에 둔다
  'gwangjang-market-guide': 'street',
  'what-is-tteokbokki-how-spicy': 'street',
  'instant-ramyeon-upgrade-guide': 'street',
  'hongdae-street-food-guide': 'street',
  // Classic Meals
  'gyeran-jjim-korean-steamed-egg-guide': 'meals',
  'korean-japchae-guide': 'meals',
  'jajangmyeon-vs-jjamppong-korean-chinese-food': 'meals',
  'gyeongju-ssambap-what-is-it': 'meals',
  'mackerel-jorim-vs-galchi-jorim': 'meals',
  'busan-milmyeon-vs-naengmyeon': 'meals',
  'jeonju-bibimbap-vs-regular-bibimbap': 'meals',
  'easy-korean-dishes-for-beginners': 'meals',
  'korean-namul-vegetable-side-dishes': 'meals',
  'how-to-cook-korean-rice': 'meals',
  'korean-dishes-with-kimchi-rice-and-eggs': 'meals',
  'myeongdong-street-food-guide': 'street',
  // Pantry & Substitutes — 재료를 사고 · 바꾸고 · 보관하는 글
  'gim-nori-miyeok-dasima-korean-seaweed': 'pantry',
  'doenjang-vs-miso-substitute': 'pantry',
  'gochugaru-vs-chili-flakes-substitute': 'pantry',
  'what-is-perilla-leaf-substitute': 'pantry',
  'how-long-do-korean-pantry-staples-last': 'pantry',
  'cook-korean-food-without-korean-grocery-store': 'pantry',
  'sesame-oil-vs-perilla-oil': 'pantry',
  'how-to-buy-store-and-use-kimchi': 'pantry',
  'korean-pantry-first-ingredients': 'pantry',
  'korean-soy-sauce-types': 'pantry',
  'gochujang-substitutes': 'pantry',
  'gochujang-vs-gochugaru-vs-doenjang': 'pantry',
  // Food Culture & Drinks — 음식 문화 · 술 · 지역 · 식단 질문
  'guide-to-sikhye-and-sujeonggwa': 'culture',
  'baechu-vs-kkakdugi-kimchi-guide': 'culture',
  'soju-makgeolli-cheongju-korea-guide': 'culture',
  'korean-songpyeon-pine-needles-science': 'culture',
  'regional-korean-food-map': 'culture',
  'kimchi-differs-by-region': 'culture',
  'is-korean-food-vegetarian-friendly': 'culture',
  'what-is-banchan-korean-side-dishes': 'culture',
  'is-korean-food-spicy': 'culture',
  'noryangjin-fish-market-guide-how-to-eat-hoe': 'culture',

  // ── Life in Korea ──────────────────────────────────────────
  // Transit
  'jeju-island-without-a-car': 'transit',
  'korean-subway-etiquette-guide': 'transit',
  'how-to-ride-city-buses-in-seoul': 'transit',
  'seoul-taxi-cheapest-kakao-uber': 'transit',
  'how-to-book-ktx-tickets-foreigner': 'transit',
  'ktx-vs-express-bus-korea-day-trips': 'transit',
  'climate-card-vs-t-money-seoul': 'transit',
  'hands-free-seoul-subway-lockers-guide': 'transit',
  'seoul-subway-transfer-transit-card-guide': 'transit',
  'korea-taxi-survival-guide': 'transit',
  'incheon-airport-survival-guide': 'transit',
  // Apps & Connectivity
  'korean-fine-dust-apps-mask-guide': 'apps',
  'korean-delivery-apps-tourists': 'apps',
  'korea-tourist-sim-vs-esim-airport-guide': 'apps',
  'google-maps-alternatives-korea': 'apps',
  'korean-road-name-address-vs-lot-number-guide': 'apps',
  // Money & Shopping
  'foreign-credit-cards-global-atm-korea': 'money',
  'olive-young-instant-tax-refund-guide': 'money',
  'zero-tipping-split-bills-korea': 'money',
  'jeonse-vs-wolse-korean-rental-deposits-foreigners': 'money',
  'mobile-payment-apple-pay-korea-foreigners': 'money',
  // Health, Safety & Admin — 아프거나 · 위급하거나 · 서류 · 쓰레기 · 택배처럼 '처리해야 하는 일'
  'is-korea-safe-emergency-numbers-tourists': 'essentials',
  'late-night-medicine-korea-clinics-guide': 'essentials',
  'korean-national-health-insurance-foreigners': 'essentials',
  'how-to-get-arc-korea-student': 'essentials',
  'public-restrooms-korea-guide': 'essentials',
  'where-are-trash-cans-in-seoul': 'essentials',
  'how-korean-apartment-recycling-works': 'essentials',
  'sending-packages-in-korea-post-office-convenience-store-lockers': 'essentials',
  'packing-guide-korea-by-season': 'essentials',
  'korea-coin-laundromat-guide': 'essentials',
  // Etiquette & Eating Out — 식당 · 카페 · 편의점에서의 주문과 매너
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
  // Daily Culture — 규칙이 엉뚱하게 잡는 글이 있어(한강공원·찜질방 등) 기존 글은 전부 못 박는다
  'han-river-parks-seoul-guide': 'daily',
  'korean-templestay-booking-guide-for-foreigners': 'daily',
  'hanok-stay-korea-booking-etiquette': 'daily',
  'korean-bathhouse-jjimjilbang-guide': 'daily',
  'noraebang-korean-karaoke-guide': 'daily',
  'korean-internet-slang-guide': 'daily',
  'korean-new-year-seollal-explained': 'daily',
  'korean-age-system-explained': 'daily',
  'konglish-words-when-english-becomes-korean': 'daily',
}

/**
 * 대표 분류 밖의 추가 태그 (slug → 'group/sub'[]). 대표 그룹 안의 다른 칩일 수도, 다른 탭일 수도 있다.
 * 다른 탭 태그가 붙은 글은 그 탭 목록과 칩에도 나온다(주소 · 대표 분류 · 뱃지는 그대로).
 */
export const SECONDARY_TAGS: Record<string, readonly string[]> = {
  // 여행지(Explore Korea 대표) — 가는 법 · 즐기는 문화가 함께 있는 글
  'nami-island-day-trip-seoul-guide': ['life/transit'],
  'seoul-vs-busan-first-time-visitors': ['life/transit'],
  'korea-cherry-blossom-autumn-foliage-guide': ['life/daily'],
  'seongsu-dong-pop-up-cafe-guide': ['life/daily'],
  'hiking-in-korea-guide': ['life/daily'],
  // Life 대표 — 목적지 성격도 강한 글
  'jeju-island-without-a-car': ['explore-korea/places'],
  'korean-templestay-booking-guide-for-foreigners': ['explore-korea/places'],
  'hanok-stay-korea-booking-etiquette': ['explore-korea/hotels'],
  'han-river-parks-seoul-guide': ['explore-korea/places', 'food/street'],
  // Food 대표 — 동네 · 시장 자체가 여행 코스인 글
  'myeongdong-street-food-guide': ['explore-korea/places'],
  'gwangjang-market-guide': ['explore-korea/places'],
  'hongdae-street-food-guide': ['explore-korea/places'],
  'noryangjin-fish-market-guide-how-to-eat-hoe': ['explore-korea/places'],
  'gyeongju-ssambap-what-is-it': ['explore-korea/places'],
  // 음식 ↔ 생활 매너
  'soju-makgeolli-cheongju-korea-guide': ['life/etiquette'],
  'korean-convenience-store-combo-meals': ['life/daily'],
  'korean-convenience-store-dining-guide': ['food/street'],
  'samgyeopsal-hanwoo-chadolbaegi-korean-bbq': ['food/bbq'],
  'korean-table-etiquette-spoon-chopsticks-guide': ['food/culture'],
  'korean-songpyeon-pine-needles-science': ['life/daily'],
  'korean-cafe-kiosk-ordering-guide': ['life/apps'],
  // 같은 그룹 안의 두 번째 칩
  'why-korean-marinades-use-asian-pear': ['food/pantry'],
  'korean-anchovy-stock-guide': ['food/pantry'],
  'tteokbokki-tteok-vs-tteokguk-tteok-comparison': ['food/pantry'],
  'korean-subway-etiquette-guide': ['life/etiquette'],
  'zero-tipping-split-bills-korea': ['life/etiquette'],
  'incheon-airport-survival-guide': ['life/apps'],
  'korean-fine-dust-apps-mask-guide': ['life/essentials'],
  'korea-coin-laundromat-guide': ['life/money'],
}

type Rule = { sub: string; test: RegExp }

/**
 * 오버라이드에 없는 새 글용 규칙. 제목 + 슬러그를 소문자로 합쳐 위에서부터 처음 맞는 것을 쓴다.
 * 더 구체적인 분류(국물, 길거리)를 먼저, 넓은 분류(재료·문화)는 기본값으로 둔다.
 */
const RULES: Partial<Record<BlogGroupKey, readonly Rule[]>> = {
  food: [
    { sub: 'pantry', test: /\b(substitutes?|pantry|staples|shelf life|storage|ingredients? to buy|soy sauce|sesame oil|perilla oil)\b/ },
    { sub: 'soups', test: /\b(jjigae|tang|guk|gukbap|stew|soup|broth|kalguksu|ramyeon soup|ttukbaegi)\b/ },
    { sub: 'bbq', test: /\b(bbq|barbecue|samgyeopsal|galbi|bulgogi|bossam|pork|beef|chicken|dak|ribs|grill|meat|steak)\b/ },
    { sub: 'street', test: /\b(street|snack|tteokbokki|hotteok|bungeoppang|kimbap|mandu|dumpling|odeng|ramyeon|ramen|noodles?|convenience|pancake|jeon|sundae)\b/ },
    { sub: 'meals', test: /\b(bibimbap|japchae|jajangmyeon|jjamppong|naengmyeon|milmyeon|rice|egg|jorim|namul|recipe|dishes|at home|cook)\b/ },
  ],
  life: [
    { sub: 'transit', test: /\b(subway|bus|buses|taxi|ktx|train|airport|transit|t-money|climate card|jeju|getting around|transfer|nami|day trip)\b/ },
    { sub: 'apps', test: /\b(app|apps|naver|kakao|sim|esim|wi-?fi|internet|map|maps|delivery|connectivity|address|phone)\b/ },
    { sub: 'money', test: /\b(card|cards|atm|tax refund|tipping|tip|bill|bills|payment|pay|shopping|olive young|deposit|rent|jeonse|wolse|cash|cashless|discount)\b/ },
    { sub: 'essentials', test: /\b(hospital|clinic|clinics|pharmacy|medicine|sick|insurance|arc|visa|emergency|safe|safety|police|restrooms?|toilets?|trash|recycling|packages?|parcels?|laundry|laundromat|packing)\b/ },
    { sub: 'etiquette', test: /\b(etiquette|manners|table|ordering|order|kiosk|restaurants?|cafes?|dining|honbap)\b/ },
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
