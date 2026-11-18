import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import StoreLine from '@/components/kpantry/buy/StoreBadge'
import BuyLinks, { AffiliateDisclosure } from '@/components/kpantry/buy/BuyButtons'
import MarketFinder from '@/components/kpantry/buy/MarketFinder'
import { BuyStyles } from '@/components/kpantry/buy/BuyStyles'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import {
  FRESH_TEXT, GUIDE_BASE, firstSentence, getGuideIngredient, getGuideIngredients, guideHref,
} from '@/lib/kpantry/buyInfo'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

interface PageProps {
  params: Promise<{ slug: string }>
}

// 재료 85개는 빌드 때 굽는다. 빌드 뒤 slug 가 생긴 재료는 첫 방문 때 렌더링해 캐시한다
export const dynamic = 'force-static'
export const revalidate = 86400

export async function generateStaticParams() {
  const all = await getGuideIngredients()
  return all.map(i => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getGuideIngredient(slug)
  if (!data) return { robots: { index: false, follow: true } }
  const { info } = data
  const title = `${info.name}${info.name_ko ? ` (${info.name_ko})` : ''}: What It Is, Where to Buy & Substitutes | K-Pantry`
  const description = firstSentence(info.what_it_is, 150)
  const url = `${BASE_URL}${guideHref(info.slug)}`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url },
  }
}

const SECTION_H = { fontSize: 20, margin: '0 0 10px' } as const
/** 섹션 사이 — 위 구분선 + 위아래 24px */
const SECTION = { borderTop: '1px solid var(--kp-buy-rule)', padding: '24px 0' } as const

export default async function IngredientGuideDetailPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getGuideIngredient(slug)
  if (!data) notFound()
  const { info, recipes } = data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: info.name,
    alternateName: [info.name_ko, info.romanized].filter(Boolean),
    description: info.what_it_is,
    url: `${BASE_URL}${guideHref(info.slug)}`,
    ...(info.image_url ? { image: info.image_url } : {}),
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'K-Pantry Korean Ingredient Guide',
      url: `${BASE_URL}${GUIDE_BASE}`,
    },
  }

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <BuyStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <article style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px 0' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={GUIDE_BASE} aria-label="Back to ingredient guide" style={{
            width: 36, height: 36, borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--kp-rule)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ChevronLeft size={18} strokeWidth={1.75} color="#1A1A1A" aria-hidden="true" />
          </Link>
          <Link href={GUIDE_BASE} className="kpb-small" style={{ textDecoration: 'none' }}>Ingredient guide</Link>
        </nav>

        {/* 1. 이미지 + 이름 */}
        <header style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '20px 0 16px' }}>
          {info.image_url && (
            <img src={info.image_url} alt={info.name} width={96} height={96} style={{ width: 96, height: 96, borderRadius: 20, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--kp-rule)' }} />
          )}
          <div style={{ minWidth: 0 }}>
            <h1 className="kpb-h" style={{ fontSize: 30, lineHeight: 1.15 }}>{info.name}</h1>
            {(info.name_ko || info.romanized) && (
              <p className="kpb-p" style={{ marginTop: 4, color: 'var(--kp-buy-muted)' }}>
                {info.name_ko && <span lang="ko" style={{ fontWeight: 600, color: '#44403C' }}>{info.name_ko}</span>}
                {info.name_ko && info.romanized && ' · '}
                {info.romanized && <em>{info.romanized}</em>}
              </p>
            )}
          </div>
        </header>

        {/* 섹션마다 카드 대신 소제목 + 구분선(2026-11-18 2차) — 레시피 "Ingredients" 와 같은 문법 */}
        <div>
          {/* 2. What it is */}
          {info.what_it_is && (
            <section style={SECTION}>
              <h2 className="kpb-h" style={SECTION_H}>What it is</h2>
              <p className="kpb-p">{info.what_it_is}</p>
            </section>
          )}

          {/* 3·4. Where to buy + How to pick */}
          <section style={SECTION}>
            <h2 className="kpb-h" style={SECTION_H}>Where to buy</h2>
            {info.store_level && <StoreLine level={info.store_level} price={info.price_tier} />}
            {(info.shopping_tip || info.label_hint) && (
              <>
                <h3 className="kpb-sub" style={{ fontSize: 15, margin: '18px 0 6px' }}>How to pick it at the store</h3>
                {info.shopping_tip && <p className="kpb-p">{info.shopping_tip}</p>}
                {info.label_hint && (
                  <p className="kpb-p" style={{ marginTop: 8, fontSize: 13 }}>
                    <strong style={{ color: 'var(--kp-buy-ink)' }}>On the label:</strong> {info.label_hint}
                  </p>
                )}
              </>
            )}
            {/* 7. 온라인 구매 — 텍스트 링크. common 은 링크 없이 한 줄 */}
            {info.store_level === 'common' ? (
              <p className="kpb-small" style={{ marginTop: 14 }}>Available at any grocery store.</p>
            ) : (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                <span className="kpb-small">Buy online:</span>
                <BuyLinks
                  buyQuery={info.buy_query}
                  weeeQuery={info.weee_query}
                  ingredientSlug={info.slug}
                  ingredientName={info.name}
                  placement="ingredient_page"
                  emptyText={info.store_level === 'korean_asian' ? FRESH_TEXT : 'Most US supermarkets carry it.'}
                />
              </div>
            )}
            <AffiliateDisclosure />
          </section>

          {/* 5. 대체재 */}
          {info.substitute && (
            <section style={SECTION}>
              <h2 className="kpb-h" style={SECTION_H}>No Korean market nearby?</h2>
              <p className="kpb-p">{info.substitute}</p>
            </section>
          )}

          {/* 6. 보관 */}
          {info.shelf_life && (
            <section style={SECTION}>
              <h2 className="kpb-h" style={SECTION_H}>Storage</h2>
              <p className="kpb-p">{info.shelf_life}</p>
            </section>
          )}

          {/* 8. 마트 찾기 */}
          {info.store_level !== 'common' && (
            <div style={SECTION}>
              <MarketFinder placement="ingredient_page" />
            </div>
          )}

          {/* 9. 이 재료를 쓰는 레시피 */}
          {recipes.length > 0 && (
            <section style={SECTION}>
              <h2 className="kpb-h" style={{ ...SECTION_H, marginBottom: 14 }}>
                Recipes using {info.name} <span className="kpb-count" style={{ fontFamily: 'Inter, sans-serif' }}>{recipes.length}</span>
              </h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {recipes.map(r => (
                  <li key={r.slug}>
                    <Link href={`/kpantry/en/recipes/${r.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                      {r.hero_image_url ? (
                        <img src={r.hero_image_url} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', borderRadius: 12 }} />
                      ) : <span style={{ display: 'block', aspectRatio: '4 / 3', background: 'var(--kp-surface-muted)', borderRadius: 12 }} />}
                      <span style={{ display: 'block', paddingTop: 8 }}>
                        <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1917', lineHeight: 1.3 }}>{r.name_en}</span>
                        <span className="kpb-small" style={{ display: 'block', marginTop: 2 }}>
                          {r.type === 'essential' ? 'Essential' : r.type === 'recommended' ? 'Recommended' : 'Optional'}
                          {r.cooking_time_min ? ` · ${r.cooking_time_min} min` : ''}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="kpb-small" style={{ padding: '20px 0 0', borderTop: '1px solid var(--kp-buy-rule)' }}>
            Shopping info updated {info.buy_info_updated ?? '2026'}. Prices are relative US tiers (as of 2026), not exact prices.
          </p>
        </div>
      </article>
    </div>
  )
}
