/**
 * 블로그 주제 분류 — 홈 섹션과 /blog 목록 탭의 단일 출처.
 *
 * 두 곳에 따로 하드코딩하면 반드시 어긋나므로 분류 기준은 여기에만 둔다.
 * category 값은 DB 에 이미 있는 것만 쓴다(새로 만들지 않는다).
 *
 * 구조는 두 층이다.
 *   섹션(BLOG_SECTIONS)  글의 category 로 정해지는 세부 분류 — phrases / basics / hotels / places / life / food
 *   그룹(BLOG_GROUPS)    상단 메뉴·홈·목록 탭에 보이는 묶음 — Korean(phrases+basics) / Explore Korea(hotels+places) / Food / Life
 * 글 분류는 섹션으로, 메뉴와 탭은 그룹으로 한다. 그룹 안의 세부 분류는 칩(서브 카테고리)으로 보여 준다.
 *
 * app 기준이 하나 더 있다는 점이 중요하다:
 * patto 는 한국인 대상 영어 학습 글이라 위 주제 어디에도 들어가지 않는다.
 * 그래서 주제 섹션·탭은 k-patto / k-pantry 만 대상으로 하고,
 * patto 는 app 값으로 거르는 별도 탭이 된다.
 */

/** 주제 섹션·탭의 대상이 되는 app. kpantry 는 k-pantry 의 옛 표기. */
export const TOPIC_APPS = ['k-patto', 'k-pantry', 'kpantry'] as const

export type BlogSectionKey = 'phrases' | 'basics' | 'hotels' | 'places' | 'life' | 'food'
export type BlogGroupKey = 'korean' | 'explore-korea' | 'food' | 'life'

/** 카드 격자('grid') 또는 한 줄짜리 가로 리스트('list').
 *  홈 섹션과 /blog 목록이 같은 값을 보고 그린다. */
export type BlogLayout = 'grid' | 'list'

export const BLOG_SECTIONS = [
  {
    key: 'phrases',
    title: 'Korean phrases',
    desc: 'What to actually say in cafes, restaurants and shops.',
    categories: ['Real-Life Korean'],
    layout: 'grid',
  },
  {
    // Explore Korea 의 하위 — 숙소. 예전 이름 'Stay in Korea' 도 같은 섹션으로 받는다(옛 글·옛 스크립트 호환).
    key: 'hotels',
    title: 'Hotels',
    desc: "Curated guides to Korea's best hotels, luxury resorts, and unique stay experiences.",
    categories: ['Hotels', 'Stay in Korea'],
    layout: 'grid',
  },
  {
    // Explore Korea 의 하위 — 여행지·핫플레이스. 새 글은 category 'Places' 로 넣는다.
    key: 'places',
    title: 'Places',
    desc: "Destinations, day trips and hot spots worth the trip across Korea.",
    categories: ['Places'],
    layout: 'grid',
  },
  {
    key: 'life',
    title: 'Life in Korea',
    desc: 'How things work here, and why they work that way.',
    categories: ['Korean Culture'],
    layout: 'grid',
  },
  {
    key: 'food',
    title: 'Korean food',
    desc: 'Ingredients, substitutes and regional dishes.',
    categories: ['Cooking Basics', 'Ingredients & Pantry'],
    layout: 'grid',
  },
  {
    key: 'basics',
    title: 'Korean basics',
    desc: 'Hangul, pronunciation and the grammar that trips people up.',
    // 표지 이미지보다 제목·설명을 훑는 쪽이 쓸모 있는 주제라 세로 리스트로 둔다
    layout: 'list',
    categories: [
      'Hangul & Pronunciation',
      'Korean Grammar',
      'Grammar',
      'Getting Started',
    ],
  },
] as const satisfies ReadonlyArray<{
  key: BlogSectionKey
  title: string
  desc: string
  categories: readonly string[]
  layout: BlogLayout
  /** 홈에 섹션을 띄우는 최소 글 수. 없으면 MIN_POSTS_TO_SHOW_SECTION */
  minToShow?: number
}>

/** 위 목록에 없는 category(및 null)는 여기로 모인다. */
export const FALLBACK_SECTION: BlogSectionKey = 'basics'

/** 홈에서 섹션당 보여줄 글 수. 넓은 화면이 3열이라 한 행을 채우도록 3편. */
export const POSTS_PER_SECTION = 3

/** 홈에 섹션을 띄우는 최소 글 수. 카드가 하나뿐이면 비어 보이므로 감춘다. */
export const MIN_POSTS_TO_SHOW_SECTION = 2

/** Patto 탭 — category 가 아니라 app 으로 거른다 */
export const PATTO_TAB = { key: 'patto', label: 'Patto', app: 'patto' } as const

// ── 그룹: 상단 메뉴·홈·목록 탭 ─────────────────────────────────────────────────
export const BLOG_GROUPS = [
  {
    key: 'korean',
    title: 'Korean',
    desc: 'Real-life phrases and the grammar behind them — what to say, and why it works.',
    sections: ['phrases', 'basics'],
    // 홈 섹션을 띄우는 최소 글 수(없으면 기본값)
    minToShow: undefined,
  },
  {
    key: 'explore-korea',
    title: 'Explore Korea',
    desc: "Hotels, destinations and hot spots — curated guides to the best of Korea.",
    sections: ['hotels', 'places'],
    // 아직 글이 적은 새 그룹이라 한 편부터 홈에 보여 준다
    minToShow: 1,
  },
  {
    key: 'food',
    title: 'Food',
    desc: 'Ingredients, substitutes and regional dishes.',
    sections: ['food'],
    minToShow: undefined,
  },
  {
    key: 'life',
    title: 'Life',
    desc: 'How things work here, and why they work that way.',
    sections: ['life'],
    minToShow: undefined,
  },
] as const satisfies ReadonlyArray<{
  key: BlogGroupKey
  title: string
  desc: string
  sections: readonly BlogSectionKey[]
  minToShow?: number
}>

/** 섹션별 홈 노출 최소 글 수(섹션 옵션) — 그룹은 minPostsToShow 가 본다 */
const GROUP_OF_SECTION = new Map<BlogSectionKey, BlogGroupKey>(
  BLOG_GROUPS.flatMap(g => g.sections.map(s => [s, g.key] as [BlogSectionKey, BlogGroupKey])),
)

/** 그룹(= 홈 섹션·탭)별 홈 노출 최소 글 수 */
export function minPostsToShow(key: string): number {
  const g = BLOG_GROUPS.find(x => x.key === key) as { minToShow?: number } | undefined
  return g?.minToShow ?? MIN_POSTS_TO_SHOW_SECTION
}

/** 목록 탭 순서: All + 그룹 4개(Korean · Explore Korea · Food · Life) + Patto */
export const BLOG_TABS = [
  { key: 'all', label: 'All Articles' },
  ...BLOG_GROUPS.map(g => ({ key: g.key as string, label: g.title as string })),
  { key: PATTO_TAB.key as string, label: PATTO_TAB.label as string },
]

/**
 * 예전 탭 주소 → 새 구조. 색인·북마크된 /blog?tab=phrases 등이 깨지지 않게
 * 목록 페이지가 새 주소로 308 이동시킨다.
 */
export const LEGACY_TABS: Record<string, { tab: BlogGroupKey; sub?: string }> = {
  phrases: { tab: 'korean', sub: 'phrases' },
  basics: { tab: 'korean', sub: 'basics' },
  'stay-in-korea': { tab: 'explore-korea', sub: 'hotels' },
}

const SECTION_OF_CATEGORY = new Map<string, BlogSectionKey>(
  BLOG_SECTIONS.flatMap(s =>
    s.categories.map(c => [c, s.key] as [string, BlogSectionKey]),
  ),
)

export function isTopicApp(app: string): boolean {
  return (TOPIC_APPS as readonly string[]).includes(app)
}

/**
 * 글이 속한 세부 섹션(phrases · basics · hotels · places · life · food). 주제 대상이 아닌 app(patto 등)이면 null.
 * 매핑에 없는 category 와 null 은 FALLBACK_SECTION 으로 간다.
 */
export function topicSectionKey(
  app: string,
  category: string | null,
): BlogSectionKey | null {
  if (!isTopicApp(app)) return null
  return (category && SECTION_OF_CATEGORY.get(category)) || FALLBACK_SECTION
}

/** 글이 속한 그룹(Korean · Explore Korea · Food · Life). 주제 대상이 아니면 null. */
export function groupKeyOf(app: string, category: string | null): BlogGroupKey | null {
  const section = topicSectionKey(app, category)
  return section ? GROUP_OF_SECTION.get(section) ?? null : null
}

/** 목록 탭 필터. 'all' 은 전부 통과. */
export function postMatchesTab(
  post: { app: string; category: string | null },
  tabKey: string,
): boolean {
  if (tabKey === 'all') return true
  if (tabKey === PATTO_TAB.key) return post.app === PATTO_TAB.app
  return groupKeyOf(post.app, post.category) === tabKey
}

/** 유효한 탭 key 인지 */
export function isValidTab(tabKey: string): boolean {
  return BLOG_TABS.some(t => t.key === tabKey)
}

/** 탭 라벨 (목록 제목·메타에 쓴다) */
export function tabLabel(tabKey: string): string {
  return BLOG_TABS.find(t => t.key === tabKey)?.label ?? 'All Articles'
}

/**
 * /blog 히어로 한 줄 설명 — 탭마다 다르게 보여준다.
 *
 * 홈 섹션의 desc(한 줄 요약)와 쓰임이 달라 따로 둔다. 홈은 카드 묶음 위에
 * 붙는 짧은 안내고, 이쪽은 페이지 전체를 소개하는 문장이다.
 * 'all' 과 'patto' 는 주제 그룹이 아니라서 BLOG_GROUPS 에 자리가 없다.
 */
const TAB_DESCRIPTION: Record<string, string> = {
  all: 'Curated stories, real-life Korean guides, and language insights by Atlas Lab.',
  korean: 'Real-life phrases for cafes, shops and daily life — plus Hangul and the grammar that trips people up.',
  'explore-korea': "Hotels, destinations and hot spots — curated guides to the best of Korea.",
  food: 'Authentic culinary culture, seasonal dishes, and dining etiquette in Korea.',
  life: 'Cultural nuances, social codes, and practical guides for navigating life in Korea.',
  patto: 'Interactive language experiments and smart tools.',
}

/** 탭 설명. 모르는 값이면 'all' 문구로 떨어진다. */
export function tabDescription(tabKey: string): string {
  return TAB_DESCRIPTION[tabKey] ?? TAB_DESCRIPTION.all
}

/**
 * 탭·섹션을 어떤 모양으로 그릴지. 그룹은 기본이 격자이고,
 * Korean 안의 Basics 칩만 제목·설명을 훑는 세로 리스트로 보여 준다(예전 Korean basics 와 같은 모양).
 * 홈과 /blog 가 같은 함수를 봐야 한쪽만 리스트로 남는 일이 없다.
 */
export function layoutForKey(key: string, sub?: string | null): BlogLayout {
  if (key === 'korean' && sub === 'basics') return 'list'
  return 'grid'
}
