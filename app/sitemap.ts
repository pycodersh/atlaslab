import type { MetadataRoute } from 'next'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { SLUG_TO_ID, CATEGORIES } from '@/lib/kpatto/expressions-config'
// import { createAdminClient } from '@/lib/supabase/admin'  // blog 임시 제외 중 — 품질 정리 완료 후 복원

// Blog sitemap temporarily disabled — re-enable by uncommenting the import above
// and the blogPages block below, then uncommenting ...blogPages in the return array.
const BLOG_IN_SITEMAP = false

// Strip leading BOM (U+FEFF) that PowerShell stdin piping can inject into env vars
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // EP01~10 (free episodes only — EP11+ are gated, excluded from sitemap)
  const freeEpisodes: MetadataRoute.Sitemap = Array.from(
    { length: FREE_EPISODES },
    (_, i) => {
      const num = i + 1
      return {
        url: `${BASE_URL}/kpatto/story/kp-ep-${String(num).padStart(3, '0')}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: num <= 3 ? 0.9 : 0.7,
      }
    },
  )

  // 325 individual expression pages (100 original + 225 new slugs)
  const expressionPages: MetadataRoute.Sitemap = Object.keys(SLUG_TO_ID).map(slug => ({
    url: `${BASE_URL}/kpatto/expressions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // 7 category topic pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${BASE_URL}/kpatto/expressions/topic/${cat.key}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  // [DISABLED] Blog posts — uncomment when blog content quality is resolved
  // const blogPages: MetadataRoute.Sitemap = []
  // if (BLOG_IN_SITEMAP) {
  //   try {
  //     const supabase = createAdminClient()
  //     const { data } = await supabase
  //       .from('blog_posts')
  //       .select('locale, app, slug, published_at')
  //       .lte('published_at', new Date().toISOString())
  //       .order('published_at', { ascending: false })
  //     if (data) {
  //       blogPages = data.map((post: { locale: string; app: string; slug: string; published_at: string }) => ({
  //         url: `${BASE_URL}/blog/${post.locale}/${post.app}/${post.slug}`,
  //         lastModified: new Date(post.published_at),
  //         changeFrequency: 'monthly' as const,
  //         priority: 0.6,
  //       }))
  //     }
  //   } catch {
  //     console.warn('[sitemap] blog_posts query failed; blog pages omitted')
  //   }
  // }
  void BLOG_IN_SITEMAP  // suppress unused-var warning while disabled

  return [
    { url: `${BASE_URL}/kpatto`,             lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/kpatto/story`,        lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/kpatto/expressions`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...categoryPages,
    ...freeEpisodes,
    ...expressionPages,
    // ...blogPages,  // re-enable with the block above
  ]
}
