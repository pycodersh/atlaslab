import { createPublicSupabase } from '@/lib/kpantry/publicSupabase'

/**
 * K-Pantry "Where to Buy" — pantry_ingredients 의 구매 정보 컬럼(2026-11-17 추가)을 읽는다.
 * 원문은 scripts/data/kpantry-buy-info.source.mjs → scripts/sql/kpantry-where-to-buy-02-data.sql.
 *
 * 서버(SSG) 조회는 쿠키 없는 publishable 키 클라이언트를 쓴다 — service_role 을 공개 페이지에 들이지 않는다.
 * 세 테이블 모두 공개 읽기 정책이 있다(앱 화면이 같은 키로 읽는다).
 */

export type StoreLevel = 'common' | 'regular' | 'korean_asian'
export type PriceTier = '$' | '$$' | '$$$'

export interface BuyInfo {
  id: string
  slug: string
  name: string
  name_ko: string | null
  romanized: string | null
  image_url: string | null
  category: string | null
  store_level: StoreLevel | null
  price_tier: PriceTier | null
  what_it_is: string | null
  shopping_tip: string | null
  label_hint: string | null
  substitute: string | null
  shelf_life: string | null
  buy_query: string | null
  /** Weee! 전용 짧은 검색어 — 비면 buy_query */
  weee_query: string | null
  buy_info_updated: string | null
}

export const BUY_INFO_COLUMNS =
  'id, slug, name, name_ko, romanized, image_url, category, store_level, price_tier, what_it_is, shopping_tip, label_hint, substitute, shelf_life, buy_query, weee_query, buy_info_updated'

/** 레시피 상세 재료 조인에 덧붙이는 열 — 팝오버·구매 섹션이 쓴다 */
export const RECIPE_BUY_COLUMNS = 'slug, store_level, price_tier, shopping_tip, substitute, buy_query, weee_query'

export const STORE_LEVEL_LABEL: Record<StoreLevel, string> = {
  common: 'Any grocery store',
  regular: 'Regular US grocery',
  korean_asian: 'Korean or Asian market',
}

/** 레시피 구매 섹션 묶음 제목 — korean_asian 을 맨 위에 둔다 */
export const STORE_GROUPS: { level: StoreLevel; title: string }[] = [
  { level: 'korean_asian', title: 'Korean or Asian market' },
  { level: 'regular', title: 'Regular US grocery' },
  { level: 'common', title: 'At any grocery store' },
]

export const PRICE_AS_OF = '2026'

export const GUIDE_BASE = '/kpantry/en/ingredient-guide'
export const guideHref = (slug: string) => `${GUIDE_BASE}/${slug}`

/** 온라인 구매 버튼을 띄울지 — common 이거나 검색어가 없으면 띄우지 않는다 */
export function hasBuyLinks(info: Pick<BuyInfo, 'store_level' | 'buy_query'>): info is Pick<BuyInfo, 'store_level'> & { buy_query: string } {
  return info.store_level !== 'common' && !!info.buy_query
}

/**
 * 메타 description·팝오버 한 줄 — 첫 문장, max 자 이내.
 * 첫 문장이 너무 짧으면("Ganjang is Korean soy sauce.") 다음 문장을 max 안에서 이어 붙인다.
 */
export function firstSentence(text: string | null, max = 150): string {
  if (!text) return ''
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [text]
  let s = sentences[0].trim()
  for (const next of sentences.slice(1)) {
    if (s.length >= 80) break
    const joined = `${s} ${next.trim()}`
    // 이어 붙이면 넘치더라도 첫 문장이 아주 짧으면 붙이고 아래에서 단어 단위로 자른다
    if (joined.length > max && s.length >= 60) break
    s = joined
    if (s.length > max) break
  }
  return s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

const publicClient = createPublicSupabase

/** 가이드에 싣는 재료 — slug 가 있는 행(= 레시피에 연결된 85개) */
export async function getGuideIngredients(): Promise<BuyInfo[]> {
  const { data, error } = await publicClient()
    .from('pantry_ingredients')
    .select(BUY_INFO_COLUMNS)
    .not('slug', 'is', null)
    .order('name')
  if (error) throw error
  return (data ?? []) as BuyInfo[]
}

export interface GuideRecipe {
  slug: string
  name_en: string
  name_ko: string | null
  hero_image_url: string | null
  cooking_time_min: number | null
  type: 'essential' | 'recommended' | 'optional'
}

export async function getGuideIngredient(slug: string): Promise<{ info: BuyInfo; recipes: GuideRecipe[] } | null> {
  const supabase = publicClient()
  const { data: info, error } = await supabase
    .from('pantry_ingredients')
    .select(BUY_INFO_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!info) return null

  const { data: links, error: linkError } = await supabase
    .from('pantry_recipe_ingredients')
    .select('type, pantry_recipes(slug, name_en, name_ko, hero_image_url, cooking_time_min)')
    .eq('ingredient_id', (info as BuyInfo).id)
  if (linkError) throw linkError

  const rank = { essential: 0, recommended: 1, optional: 2 } as const
  const seen = new Set<string>()
  const recipes: GuideRecipe[] = []
  for (const row of (links ?? []) as any[]) {
    const r = Array.isArray(row.pantry_recipes) ? row.pantry_recipes[0] : row.pantry_recipes
    if (!r?.slug || seen.has(r.slug)) continue
    seen.add(r.slug)
    recipes.push({ ...r, type: row.type })
  }
  recipes.sort((a, b) => (rank[a.type] ?? 3) - (rank[b.type] ?? 3) || a.name_en.localeCompare(b.name_en))
  return { info: info as BuyInfo, recipes }
}
