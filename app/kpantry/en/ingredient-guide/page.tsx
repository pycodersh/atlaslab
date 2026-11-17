import type { Metadata } from 'next'
import Link from 'next/link'
import HomeLink from '@/components/kpantry/layout/HomeLink'
import StoreBadge from '@/components/kpantry/buy/StoreBadge'
import MarketFinder from '@/components/kpantry/buy/MarketFinder'
import { BuyStyles } from '@/components/kpantry/buy/BuyStyles'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { GUIDE_BASE, getGuideIngredients, guideHref, type BuyInfo, type StoreLevel } from '@/lib/kpantry/buyInfo'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

const TITLE = 'Korean Ingredient Guide: What to Buy & Where | K-Pantry'
const DESCRIPTION =
  'What every Korean pantry ingredient is, how to pick it at the store, where to buy it in the US, and what to use if there is no Korean market nearby.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}${GUIDE_BASE}` },
  // layout 의 noindex 기본값을 이 서버 렌더링 콘텐츠 페이지에서 해제한다
  robots: { index: true, follow: true },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: `${BASE_URL}${GUIDE_BASE}` },
}

export const dynamic = 'force-static'
export const revalidate = 86400

const CATEGORY_ORDER: { key: string; title: string }[] = [
  { key: 'pantry', title: 'Sauces, pastes & pantry staples' },
  { key: 'vegetables', title: 'Vegetables & herbs' },
  { key: 'mushrooms', title: 'Vegetables & herbs' },
  { key: 'meat_seafood', title: 'Meat & seafood' },
  { key: 'etc', title: 'Tofu, eggs & more' },
]

const LEVEL_RANK: Record<StoreLevel, number> = { korean_asian: 0, regular: 1, common: 2 }

export default async function IngredientGuidePage() {
  const all = await getGuideIngredients()

  const sections = new Map<string, BuyInfo[]>()
  for (const c of CATEGORY_ORDER) if (!sections.has(c.title)) sections.set(c.title, [])
  for (const ing of all) {
    const title = CATEGORY_ORDER.find(c => c.key === ing.category)?.title ?? 'Tofu, eggs & more'
    sections.get(title)!.push(ing)
  }
  for (const list of sections.values()) {
    list.sort((a, b) => (LEVEL_RANK[a.store_level ?? 'common'] - LEVEL_RANK[b.store_level ?? 'common']) || a.name.localeCompare(b.name))
  }

  const koreanCount = all.filter(i => i.store_level === 'korean_asian').length

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <BuyStyles />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 16px 0' }}>
        <HomeLink />
        <header style={{ padding: '16px 4px 20px' }}>
          <h1 className="kpb-h" style={{ fontSize: 30, lineHeight: 1.2 }}>Korean Ingredient Guide</h1>
          <p className="kpb-p" style={{ marginTop: 8 }}>
            {all.length} ingredients used in K-Pantry recipes — what each one is, how to pick it at the store, and what to use
            if you can&apos;t find it. {koreanCount} of them usually need a Korean or Asian market (or an online order); the rest
            are at any US supermarket.
          </p>
        </header>

        {[...sections].filter(([, list]) => list.length > 0).map(([title, list]) => (
          <section key={title} style={{ marginBottom: 28 }}>
            <h2 className="kpb-h" style={{ fontSize: 20, margin: '0 4px 12px' }}>{title}</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 10 }}>
              {list.map(ing => (
                <li key={ing.id}>
                  <Link href={guideHref(ing.slug)} className="kpb-card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, textDecoration: 'none' }}>
                    {ing.image_url ? (
                      <img src={ing.image_url} alt="" width={52} height={52} loading="lazy" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    ) : <span style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--kp-surface-muted)', flexShrink: 0 }} />}
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#1C1917' }}>
                        {ing.name}
                        {ing.name_ko && <span lang="ko" className="kpb-small" style={{ marginLeft: 6, fontWeight: 400 }}>{ing.name_ko}</span>}
                      </span>
                      {ing.store_level && <span style={{ display: 'block', marginTop: 4 }}><StoreBadge level={ing.store_level} price={ing.price_tier} /></span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <MarketFinder placement="ingredient_page" />
      </div>
    </div>
  )
}
