import { createClient } from '@supabase/supabase-js'
import { postMatchesTab } from '@/lib/blog/sections'
import { isCrossListed } from '@/lib/blog/subcategories'
import { cardThumbnailForPost, type BlogThumbnail } from '@/lib/blog/thumbnail'
import { readMinutes } from '@/lib/blog/readTime'
import { exploreGeoOf, stayMapIdOf, type ExploreGeo } from '@/lib/blog/exploreRegions'

/** Hotspot Finder 아래 '이 지역 호텔 · 코스 가이드' 카드용 — Explore Korea 탭(영어) 글 중 지역이 잡힌 것만 */
export type ExplorePost = {
  slug: string
  title: string
  hotel: boolean
  thumb: BlogThumbnail | null
  readMin: number
  geo: ExploreGeo
}

export async function fetchExplorePosts(): Promise<ExplorePost[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at, content, thumbnail')
    .eq('is_paused', false)
    .eq('locale', 'en')
    .order('published_at', { ascending: false })
  // 카드는 덤이다 — 못 받아도 도구는 그대로 돌아야 한다
  if (error || !data) return []
  const now = new Date().toISOString()
  return data
    .filter(p => p.published_at <= now && (postMatchesTab(p, 'explore-korea') || isCrossListed(p.slug, 'explore-korea')))
    .map(p => ({
      slug: p.slug,
      title: p.title,
      hotel: p.category === 'Hotels',
      thumb: cardThumbnailForPost(p.slug, p.content, p.thumbnail),
      readMin: readMinutes(p.content),
      geo: exploreGeoOf({ ...p, stayMapId: stayMapIdOf(p.content) }),
    }))
    .filter(p => p.geo.regions.length > 0)
}
