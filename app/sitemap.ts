import type { MetadataRoute } from 'next'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { createAdminClient } from '@/lib/supabase/admin'

// 블로그 신규 포스트가 재배포 없이 즉시 사이트맵에 반영되도록
export const dynamic = 'force-dynamic'

// Strip leading BOM (U+FEFF) that PowerShell stdin piping can inject into env vars
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

// TEMP(AdSense review): 무료 에피소드 kp-ep-001~010 은 심사 기간 동안 사이트맵에서 뺀다
// (해당 라우트도 layout 에서 noindex, follow). 승인 후 SSR 본문 보강과 함께 true 로 복원.
const INDEX_FREE_EPISODES = false

// TEMP(AdSense review): /kpatto 랜딩도 서버 HTML 이 얇아 심사 기간에는 사이트맵에서 뺀다
// (app/kpatto/page.tsx 의 metadata 에서도 noindex, follow). 승인 후 SSR 본문 보강과 함께 true 로 복원.
const INDEX_KPATTO_LANDING = false

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

  // NOTE: /kpatto/expressions/{slug} (325) 과 /kpatto/expressions/topic/{key} (7) 은
  // 앱 내부 자동 생성 페이지이므로 사이트맵에서 제외한다(각 페이지는 noindex, follow).
  // 페이지 자체는 살아 있고 /kpatto/expressions 허브에서 계속 링크된다.

  // Blog posts + listing pages — is_paused=false 조건 필수 (감춰진 글 제외)
  let blogPages: MetadataRoute.Sitemap = []
  let blogListingPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('locale, app, slug, published_at')
      .eq('is_paused', false)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (data) {
      // Individual post pages (unchanged URLs)
      blogPages = data.map((post: { locale: string; app: string; slug: string; published_at: string }) => ({
        url: `${BASE_URL}/blog/${post.locale}/${post.app}/${post.slug}`,
        lastModified: new Date(post.published_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))

      // Blog listing pages: /blog, /blog/{locale}, /blog/{locale}/{app}
      // Derive distinct (locale, app) combos from published posts
      const seen = new Set<string>()
      const combos: Array<{ locale: string; app: string; lastMod: string }> = []
      for (const post of data) {
        const key = `${post.locale}:${post.app}`
        if (!seen.has(key)) {
          seen.add(key)
          combos.push({ locale: post.locale, app: post.app, lastMod: post.published_at })
        }
      }

      // /blog and /blog/{locale} — only when there are EN posts
      const hasEn = data.some((p: { locale: string }) => p.locale === 'en')
      const hasKo = data.some((p: { locale: string }) => p.locale === 'ko')
      if (hasEn) {
        blogListingPages.push({
          url: `${BASE_URL}/blog`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        })
        blogListingPages.push({
          url: `${BASE_URL}/blog/en`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.65,
        })
      }
      if (hasKo) {
        blogListingPages.push({
          url: `${BASE_URL}/blog/ko`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.65,
        })
      }

      // /blog/{locale}/{app} category pages
      for (const c of combos) {
        blogListingPages.push({
          url: `${BASE_URL}/blog/${c.locale}/${c.app}`,
          lastModified: new Date(c.lastMod),
          changeFrequency: 'weekly' as const,
          priority: 0.65,
        })
      }
    }
  } catch {
    console.warn('[sitemap] blog_posts query failed; blog pages omitted')
  }

  return [
    { url: `${BASE_URL}/`,        lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
    ...(INDEX_KPATTO_LANDING
      ? [{ url: `${BASE_URL}/kpatto`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 }]
      : []),
    { url: `${BASE_URL}/kpatto/story`,        lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/kpatto/expressions`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...(INDEX_FREE_EPISODES ? freeEpisodes : []),
    ...blogListingPages,
    ...blogPages,
  ]
}
