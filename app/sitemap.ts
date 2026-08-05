import type { MetadataRoute } from 'next'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { SLUG_TO_ID, CATEGORIES } from '@/lib/kpatto/expressions-config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlaslabstudios.com'

export default function sitemap(): MetadataRoute.Sitemap {
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

  // 100 individual expression pages
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

  return [
    { url: `${BASE_URL}/kpatto`,             lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/kpatto/story`,        lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/kpatto/expressions`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...categoryPages,
    ...freeEpisodes,
    ...expressionPages,
  ]
}
