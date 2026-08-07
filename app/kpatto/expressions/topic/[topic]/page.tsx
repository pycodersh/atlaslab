import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  CATEGORIES,
  CATEGORY_BY_KEY,
  ID_TO_SLUG,
  type CategoryKey,
} from '@/lib/kpatto/expressions-config'

export const dynamicParams = false

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlaslabstudios.com'

const T1     = '#111111'
const T2     = '#888888'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'

interface PageProps {
  params: Promise<{ topic: string }>
}

type ExprRow = {
  id: number
  korean: string
  english: string
  first_episode: number | null
}

export function generateStaticParams() {
  return CATEGORIES.map(c => ({ topic: c.key }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params
  const cat = CATEGORY_BY_KEY[topic as CategoryKey]
  if (!cat) return {}

  return {
    title: cat.titleEn,
    description: cat.descriptionEn,
    openGraph: {
      title: cat.titleEn,
      description: cat.descriptionEn,
      url: `${BASE}/kpatto/expressions/topic/${cat.key}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: cat.titleEn,
      description: cat.descriptionEn,
    },
    alternates: { canonical: `${BASE}/kpatto/expressions/topic/${cat.key}` },
  }
}

export default async function TopicPage({ params }: PageProps) {
  const { topic } = await params
  const cat = CATEGORY_BY_KEY[topic as CategoryKey]
  if (!cat) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('id', cat.ids)
    .order('first_episode', { ascending: true, nullsFirst: false })

  const exprs = (data ?? []) as ExprRow[]

  // Preserve category order (DB sort is secondary)
  const ordered = cat.ids
    .map(id => exprs.find(e => e.id === id))
    .filter((e): e is ExprRow => e !== undefined)

  // JSON-LD: ItemList
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: cat.h1En,
    description: cat.descriptionEn,
    url: `${BASE}/kpatto/expressions/topic/${cat.key}`,
    numberOfItems: ordered.length,
    itemListElement: ordered.map((e, i) => {
      const slug = ID_TO_SLUG[e.id]
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: `${e.korean} — ${e.english}`,
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

      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0px))' }}>

        {/* Top nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${DIV}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 16px', height: 52, maxWidth: 480, margin: '0 auto',
          }}>
            <Link href="/kpatto/expressions" style={{
              display: 'flex', alignItems: 'center', textDecoration: 'none',
              color: T2, padding: '8px 4px 8px 0',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </Link>
            <span style={{ fontSize: 13, fontWeight: 700, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Expressions
            </span>
            <span style={{ fontSize: 13, color: T2 }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1, letterSpacing: '0.02em' }}>
              {cat.labelEn}
            </span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: '28px 20px 20px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: '0.06em',
              background: '#FFF4EA', borderRadius: 6, padding: '3px 9px',
            }}>
              {cat.labelEn}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T1, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            {cat.h1En}
          </h1>
          <p style={{ fontSize: 14, color: T2, margin: 0, lineHeight: 1.6 }}>
            {cat.descriptionEn}
          </p>
          <p style={{ fontSize: 12, color: T2, marginTop: 8 }}>
            {ordered.length} expressions · audio · webtoon scenes
          </p>
        </div>

        <div style={{ height: 1, background: DIV }} />

        {/* Expression list */}
        {ordered.map((expr, i) => {
          const slug = ID_TO_SLUG[expr.id]
          if (!slug) return null
          const isLast = i === ordered.length - 1
          const ep = expr.first_episode

          return (
            <Link
              key={expr.id}
              href={`/kpatto/expressions/${slug}`}
              style={{ textDecoration: 'none', display: 'block', maxWidth: 480, margin: '0 auto' }}
            >
              <div style={{
                padding: '15px 20px',
                borderBottom: isLast ? 'none' : `1px solid ${DIV}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em', marginBottom: 3 }}>
                    {expr.korean}
                  </div>
                  <div style={{ fontSize: 13, color: T1, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {expr.english}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  {ep && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: T2, letterSpacing: '0.04em',
                    }}>
                      EP{String(ep).padStart(2, '0')}
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

        {/* Category nav */}
        <div style={{ padding: '32px 20px 0', maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: T2,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Other Topics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.filter(c => c.key !== cat.key).map(c => (
              <Link
                key={c.key}
                href={`/kpatto/expressions/topic/${c.key}`}
                style={{
                  textDecoration: 'none',
                  padding: '8px 14px', background: DIV,
                  borderRadius: 20, fontSize: 13, fontWeight: 600, color: T1,
                }}
              >
                {c.labelEn} <span style={{ color: T2, fontWeight: 400 }}>{c.ids.length}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '28px 20px 0', maxWidth: 480, margin: '0 auto' }}>
          <Link href="/kpatto/story" style={{
            display: 'block', textAlign: 'center', textDecoration: 'none',
            background: ACCENT, color: '#fff', borderRadius: 14,
            padding: '16px 20px', fontSize: 15, fontWeight: 800,
            letterSpacing: '-0.01em',
          }}>
            Learn with K-PATTO Stories →
          </Link>
          <p style={{ textAlign: 'center', fontSize: 12, color: T2, marginTop: 10 }}>
            First 10 episodes free · no account needed
          </p>
        </div>

      </div>
    </>
  )
}
