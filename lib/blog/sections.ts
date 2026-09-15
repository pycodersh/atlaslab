/**
 * 블로그 주제 분류 — 홈 섹션과 /blog 목록 탭의 단일 출처.
 *
 * 두 곳에 따로 하드코딩하면 반드시 어긋나므로 분류 기준은 여기에만 둔다.
 * category 값은 DB 에 이미 있는 것만 쓴다(새로 만들지 않는다).
 *
 * app 기준이 하나 더 있다는 점이 중요하다:
 * patto 는 한국인 대상 영어 학습 글이라 위 주제 어디에도 들어가지 않는다.
 * 그래서 주제 섹션·탭은 k-patto / k-pantry 만 대상으로 하고,
 * patto 는 app 값으로 거르는 별도 탭이 된다.
 */

/** 주제 섹션·탭의 대상이 되는 app. kpantry 는 k-pantry 의 옛 표기. */
export const TOPIC_APPS = ['k-patto', 'k-pantry', 'kpantry'] as const

export type BlogSectionKey = 'phrases' | 'life' | 'food' | 'basics'

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
}>

/** 위 목록에 없는 category(및 null)는 여기로 모인다. */
export const FALLBACK_SECTION: BlogSectionKey = 'basics'

/** 홈에서 섹션당 보여줄 글 수. 넓은 화면이 3열이라 한 행을 채우도록 3편. */
export const POSTS_PER_SECTION = 3

/** 홈에 섹션을 띄우는 최소 글 수. 카드가 하나뿐이면 비어 보이므로 감춘다. */
export const MIN_POSTS_TO_SHOW_SECTION = 2

/** Patto 탭 — category 가 아니라 app 으로 거른다 */
export const PATTO_TAB = { key: 'patto', label: 'Patto', app: 'patto' } as const

/** 목록 탭 순서: All + 주제 4개 + Patto */
export const BLOG_TABS = [
  { key: 'all', label: 'All Articles' },
  ...BLOG_SECTIONS.map(s => ({ key: s.key as string, label: s.title as string })),
  { key: PATTO_TAB.key as string, label: PATTO_TAB.label as string },
]

const SECTION_OF_CATEGORY = new Map<string, BlogSectionKey>(
  BLOG_SECTIONS.flatMap(s =>
    s.categories.map(c => [c, s.key] as [string, BlogSectionKey]),
  ),
)

export function isTopicApp(app: string): boolean {
  return (TOPIC_APPS as readonly string[]).includes(app)
}

/**
 * 글이 속한 주제 섹션. 주제 대상이 아닌 app(patto 등)이면 null.
 * 매핑에 없는 category 와 null 은 FALLBACK_SECTION 으로 간다.
 */
export function topicSectionKey(
  app: string,
  category: string | null,
): BlogSectionKey | null {
  if (!isTopicApp(app)) return null
  return (category && SECTION_OF_CATEGORY.get(category)) || FALLBACK_SECTION
}

/** 목록 탭 필터. 'all' 은 전부 통과. */
export function postMatchesTab(
  post: { app: string; category: string | null },
  tabKey: string,
): boolean {
  if (tabKey === 'all') return true
  if (tabKey === PATTO_TAB.key) return post.app === PATTO_TAB.app
  return topicSectionKey(post.app, post.category) === tabKey
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
 * 'all' 과 'patto' 는 주제 섹션이 아니라서 BLOG_SECTIONS 에 자리가 없다.
 */
const TAB_DESCRIPTION: Record<string, string> = {
  all: 'Curated stories, real-life Korean guides, and language insights by Atlas Lab.',
  phrases: 'Essential real-life expressions used by locals in cafes, convenience stores, and daily life.',
  basics: 'From Hangul syllable blocks to core grammar — foundational rules explained simply.',
  life: 'Cultural nuances, social codes, and practical guides for navigating life in Korea.',
  food: 'Authentic culinary culture, seasonal dishes, and dining etiquette in Korea.',
  patto: 'Interactive language experiments and smart tools.',
}

/** 탭 설명. 모르는 값이면 'all' 문구로 떨어진다. */
export function tabDescription(tabKey: string): string {
  return TAB_DESCRIPTION[tabKey] ?? TAB_DESCRIPTION.all
}

/**
 * 탭·섹션을 어떤 모양으로 그릴지. 주제 섹션에만 지정이 있고,
 * All / Patto 처럼 주제가 섞이는 목록은 격자를 쓴다.
 * 홈과 /blog 가 같은 함수를 봐야 한쪽만 리스트로 남는 일이 없다.
 */
export function layoutForKey(key: string): BlogLayout {
  return BLOG_SECTIONS.find(s => s.key === key)?.layout ?? 'grid'
}
