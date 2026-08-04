import type { MetadataRoute } from 'next'
import { FREE_EPISODES } from '@/lib/kpatto/config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-patto.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const freeEpisodes: MetadataRoute.Sitemap = Array.from(
    { length: FREE_EPISODES },
    (_, i) => {
      const num = i + 1
      return {
        url: `${BASE_URL}/kpatto/story/kp-ep-${String(num).padStart(3, '0')}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: num <= 3 ? 0.9 : 0.7,
      }
    },
  )

  return [
    { url: `${BASE_URL}/kpatto`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/kpatto/story`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...freeEpisodes,
  ]
}
