import type { MetadataRoute } from 'next'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { SLUG_TO_ID, CATEGORIES } from '@/lib/kpatto/expressions-config'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Blog posts — is_paused=false 조건 필수 (감춰진 글 제외)
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('locale, app, slug, published_at')
      .eq('is_paused', false)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (data) {
      blogPages = data.map((post: { locale: string; app: string; slug: string; published_at: string }) => ({
        url: `${BASE_URL}/blog/${post.locale}/${post.app}/${post.slug}`,
        lastModified: new Date(post.published_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch {
    console.warn('[sitemap] blog_posts query failed; blog pages omitted')
  }

  return [
    { url: `${BASE_URL}/kpatto`,             lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/kpatto/story`,        lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/kpatto/expressions`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...categoryPages,
    ...freeEpisodes,
    ...expressionPages,
    ...blogPages,
  ]
}
