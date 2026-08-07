import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import {
  CATEGORIES,
  ID_TO_SLUG,
  SEO_EXPRESSION_IDS,
} from '@/lib/kpatto/expressions-config'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlaslabstudios.com'

export const metadata: Metadata = {
  title: 'Essential Korean Patterns — 325 Patterns with Audio | K-PATTO',
  description:
    '325 Korean patterns drawn from levels 1–3 of Korea\'s national Korean curriculum — ' +
    'from beginner phrases to early intermediate grammar. Each with audio and real webtoon scenes.',
  openGraph: {
    title: 'Essential Korean Patterns — 325 Patterns with Audio | K-PATTO',
    description:
      '325 Korean patterns across 7 topics — curriculum-aligned, audio-native, webtoon-illustrated.',
    url: `${BASE}/kpatto/expressions`,
    type: 'website',
  },
  alternates: { canonical: `${BASE}/kpatto/expressions` },
}

const T1     = '#111111'
const T2     = '#888888'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'
const BG     = '#FFFFFF'

type ExprRow = {
  id: number
  korean: string
  english: string
  first_episode: number | null
}

export default async function ExpressionsHubPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('id', SEO_EXPRESSION_IDS)

  const byId = Object.fromEntries((data ?? []).map((e: ExprRow) => [e.id, e]))

  // JSON-LD: ItemList (top-level)
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Essential Korean Patterns — K-PATTO',
    url: `${BASE}/kpatto/expressions`,
    numberOfItems: SEO_EXPRESSION_IDS.length,
    itemListElement: SEO_EXPRESSION_IDS.map((id, i) => {
      const e = byId[id]
      const slug = ID_TO_SLUG[id]
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: e ? `${e.korean} — ${e.english}` : String(id),
        url: slug ? `${BASE}/kpatto/expressions/${slug}` : undefined,
      }
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <div style={{ minHeight: '100vh', background: BG, paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0px))' }}>
        <KPattoHeader />

        {/* Hero */}
        <div style={{ padding: '28px 20px 20px', maxWidth: 480, margin: '0 auto' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: '-0.03em', margin: 0 }}>
            Essential Korean Patterns
          </h1>
          <p style={{ fontSize: 14, color: T2, marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
            325 patterns from Korea's national curriculum · tap any to learn with audio
          </p>
        </div>

        {/* Category chips */}
        <div style={{ padding: '0 20px 16px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                href={`/kpatto/expressions/topic/${cat.key}`}
                style={{
                  textDecoration: 'none', flexShrink: 0,
                  padding: '6px 14px',
                  fontSize: 12, fontWeight: 600, color: T2,
                  letterSpacing: '0.02em', whiteSpace: 'nowrap',
                }}
              >
                {cat.labelEn}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: DIV }} />

        {/* 7 Category sections */}
        {CATEGORIES.map((cat, catIdx) => {
          const catExprs = cat.ids
            .map(id => byId[id])
            .filter((e): e is ExprRow => e !== undefined)

          if (catExprs.length === 0) return null

          return (
            <div key={cat.key}>
              {catIdx > 0 && <div style={{ height: 8, background: DIV }} />}

              {/* Section header — links to topic page */}
              <Link
                href={`/kpatto/expressions/topic/${cat.key}`}
                style={{
                  textDecoration: 'none', display: 'block',
                  maxWidth: 480, margin: '0 auto',
                  padding: '16px 20px 8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: T2,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {cat.labelEn}
                  </span>
                  <span style={{ fontSize: 11, color: T2, opacity: 0.6 }}>{catExprs.length}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: ACCENT, fontWeight: 700 }}>
                    See all →
                  </span>
                </div>
              </Link>

              {/* Expression cards — first 6 visible, rest hidden behind "See all" */}
              {catExprs.slice(0, 6).map((expr, i) => {
                const slug = ID_TO_SLUG[expr.id]
                if (!slug) return null
                const isLast = i === Math.min(5, catExprs.length - 1)

                return (
                  <Link
                    key={expr.id}
                    href={`/kpatto/expressions/${slug}`}
                    style={{ textDecoration: 'none', display: 'block', maxWidth: 480, margin: '0 auto' }}
                  >
                    <div style={{
                      padding: '14px 20px',
                      borderBottom: isLast ? 'none' : `1px solid ${DIV}`,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em', marginBottom: 2 }}>
                          {expr.korean}
                        </div>
                        <div style={{ fontSize: 13, color: T1, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {expr.english}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        {expr.first_episode && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: T2, letterSpacing: '0.04em',
                          }}>
                            EP{String(expr.first_episode).padStart(2, '0')}
                          </span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* "See all" is in the section header — no duplicate footer link */}
            </div>
          )
        })}

        {/* Bottom CTA */}
        <div style={{ padding: '32px 20px 0', maxWidth: 480, margin: '0 auto' }}>
          <Link href="/kpatto/story" style={{
            display: 'block', textAlign: 'center', textDecoration: 'none',
            background: ACCENT, color: '#fff', borderRadius: 14,
            padding: '16px 20px', fontSize: 15, fontWeight: 800,
            letterSpacing: '-0.01em',
          }}>
            Learn with Webtoon Stories →
          </Link>
          <p style={{ textAlign: 'center', fontSize: 12, color: T2, marginTop: 10 }}>
            EP01–10 free · no account needed
          </p>
        </div>
      </div>
    </>
  )
}
