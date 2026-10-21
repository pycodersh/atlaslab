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
 */
import type { BlogSectionKey } from './sections'

export type Subcategory = { key: string; label: string }

/** 섹션별 서브 카테고리. 배열 순서가 칩 순서다. 마지막 항목이 기본값(fallback)이다. */
export const SUBCATEGORIES: Partial<Record<BlogSectionKey, readonly Subcategory[]>> = {
  food: [
    { key: 'bbq', label: 'BBQ & Meat' },
    { key: 'soups', label: 'Soups & Stews' },
    { key: 'street', label: 'Street Food & Snacks' },
    { key: 'meals', label: 'Classic Meals' },
    { key: 'culture', label: 'Food Culture & Ingredients' },
  ],
  life: [
    { key: 'transit', label: 'Transit' },
    { key: 'apps', label: 'Apps & Connectivity' },
    { key: 'money', label: 'Money & Shopping' },
    { key: 'daily', label: 'Daily Culture' },
  ],
}

export function subcategoriesFor(section: string): readonly Subcategory[] {
  return SUBCATEGORIES[section as BlogSectionKey] ?? []
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
  'what-is-tteokbokki-how-spicy': 'street',
  'instant-ramyeon-upgrade-guide': 'street',
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
  // Food Culture & Ingredients
  'guide-to-sikhye-and-sujeonggwa': 'culture',
  'gim-nori-miyeok-dasima-korean-seaweed': 'culture',
  'doenjang-vs-miso-substitute': 'culture',
  'baechu-vs-kkakdugi-kimchi-guide': 'culture',
  'soju-makgeolli-cheongju-korea-guide': 'culture',
  'gochugaru-vs-chili-flakes-substitute': 'culture',
  'korean-songpyeon-pine-needles-science': 'culture',
  'regional-korean-food-map': 'culture',
  'kimchi-differs-by-region': 'culture',
  'what-is-perilla-leaf-substitute': 'culture',
  'how-long-do-korean-pantry-staples-last': 'culture',
  'is-korean-food-vegetarian-friendly': 'culture',
  'what-is-banchan-korean-side-dishes': 'culture',
  'cook-korean-food-without-korean-grocery-store': 'culture',
  'is-korean-food-spicy': 'culture',
  'sesame-oil-vs-perilla-oil': 'culture',
  'how-to-buy-store-and-use-kimchi': 'culture',
  'korean-pantry-first-ingredients': 'culture',
  'korean-soy-sauce-types': 'culture',
  'gochujang-substitutes': 'culture',
  'gochujang-vs-gochugaru-vs-doenjang': 'culture',

  // ── Life in Korea ──────────────────────────────────────────
  // Transit
  'nami-island-day-trip-seoul-guide': 'transit',
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
  // Daily Culture — 규칙이 엉뚱하게 잡는 글이 있어(한강공원·ARC·찜질방 등) 기존 글은 전부 못 박는다
  'sending-packages-in-korea-post-office-convenience-store-lockers': 'daily',
  'korea-cherry-blossom-autumn-foliage-guide': 'daily',
  'korean-gift-giving-etiquette-guide': 'daily',
  'packing-guide-korea-by-season': 'daily',
  'gwangjang-market-guide': 'daily',
  'hiking-in-korea-guide': 'daily',
  'han-river-parks-seoul-guide': 'daily',
  'korean-templestay-booking-guide-for-foreigners': 'daily',
  'hanok-stay-korea-booking-etiquette': 'daily',
  'seoul-vs-busan-first-time-visitors': 'daily',
  'samgyeopsal-hanwoo-chadolbaegi-korean-bbq': 'daily',
  'korean-national-health-insurance-foreigners': 'daily',
  'korean-table-etiquette-spoon-chopsticks-guide': 'daily',
  'how-to-get-arc-korea-student': 'daily',
  'public-restrooms-korea-guide': 'daily',
  'korean-bathhouse-jjimjilbang-guide': 'daily',
  'how-korean-apartment-recycling-works': 'daily',
  'where-are-trash-cans-in-seoul': 'daily',
  'solo-dining-seoul-kbbq-break-time': 'daily',
  'hidden-passwords-korean-cafes-guide': 'daily',
  'late-night-medicine-korea-clinics-guide': 'daily',
  'korean-convenience-store-dining-guide': 'daily',
  'korean-restaurant-ordering-guide': 'daily',
  'korean-cafe-laptop-safety-rules': 'daily',
  'korean-internet-slang-guide': 'daily',
  'korean-new-year-seollal-explained': 'daily',
  'nunchi-korean-reading-the-room': 'daily',
  'korean-age-system-explained': 'daily',
  'konglish-words-when-english-becomes-korean': 'daily',
}

type Rule = { sub: string; test: RegExp }

/**
 * 오버라이드에 없는 새 글용 규칙. 제목 + 슬러그를 소문자로 합쳐 위에서부터 처음 맞는 것을 쓴다.
 * 더 구체적인 분류(국물, 길거리)를 먼저, 넓은 분류(재료·문화)는 기본값으로 둔다.
 */
const RULES: Partial<Record<BlogSectionKey, readonly Rule[]>> = {
  food: [
    { sub: 'soups', test: /\b(jjigae|tang|guk|gukbap|stew|soup|broth|kalguksu|ramyeon soup|ttukbaegi)\b/ },
    { sub: 'bbq', test: /\b(bbq|barbecue|samgyeopsal|galbi|bulgogi|bossam|pork|beef|chicken|dak|ribs|grill|meat|steak)\b/ },
    { sub: 'street', test: /\b(street|snack|tteokbokki|hotteok|bungeoppang|kimbap|mandu|dumpling|odeng|ramyeon|ramen|noodles?|convenience|pancake|jeon|sundae)\b/ },
    { sub: 'meals', test: /\b(bibimbap|japchae|jajangmyeon|jjamppong|naengmyeon|milmyeon|rice|egg|jorim|namul|recipe|dishes|at home|cook)\b/ },
  ],
  life: [
    { sub: 'transit', test: /\b(subway|bus|buses|taxi|ktx|train|airport|transit|t-money|climate card|jeju|getting around|transfer|nami|day trip)\b/ },
    { sub: 'apps', test: /\b(app|apps|naver|kakao|sim|esim|wi-?fi|internet|map|maps|delivery|connectivity|address|phone)\b/ },
    { sub: 'money', test: /\b(card|cards|atm|tax refund|tipping|tip|bill|bills|payment|pay|price|prices|shopping|olive young|deposit|rent|jeonse|wolse|cash|cashless|discount)\b/ },
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
  const hit = RULES[section as BlogSectionKey]?.find(r => r.test.test(hay))
  return hit?.sub ?? subs[subs.length - 1].key
}

/** 글의 서브 카테고리 key. 서브 분류가 없는 섹션이면 null. */
export function subcategoryOf(
  section: string | null,
  post: { slug: string; title: string },
): string | null {
  if (!section || !subcategoriesFor(section).length) return null
  const fixed = SUBCATEGORY_OVERRIDES[post.slug]
  if (fixed && isValidSubcategory(section, fixed)) return fixed
  return classifyBySubcategoryRules(section, post)
}
