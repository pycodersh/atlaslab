import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { SEO_EXPRESSION_IDS, ID_TO_SLUG } from '@/lib/kpatto/expressions-config'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Korean Expressions | K-PATTO',
  description: '30 essential Korean expressions to learn today — from basic requests to particles. Each with examples, usage tips, and real webtoon scenes.',
  openGraph: {
    title: 'Korean Expressions | K-PATTO',
    description: '30 essential Korean expressions with real examples and webtoon scenes.',
    url: 'https://k-patto.com/kpatto/expressions',
    type: 'website',
  },
  alternates: {
    canonical: 'https://k-patto.com/kpatto/expressions',
  },
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
  category: string | null
  first_episode: number | null
}

const CATEGORY_ORDER = ['요청', '질문', '감정', '가능', '희망', '경험', '확인', '자기소개', '기타']

function epBadge(n: number | null) {
  if (!n) return null
  return `EP${String(n).padStart(2, '0')}`
}

export default async function ExpressionsHubPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('kp_expressions')
    .select('id, korean, english, category, first_episode')
    .in('id', SEO_EXPRESSION_IDS)
    .order('first_episode', { ascending: true, nullsFirst: false })

  const exprs = (data ?? []) as ExprRow[]

  // Group: particles (no first_episode or category = '조사/어미') last
  const main    = exprs.filter(e => e.first_episode != null && e.first_episode <= 30)
  const grammar = exprs.filter(e => e.first_episode == null || e.first_episode > 30)

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
      <KPattoHeader />

      {/* Hero */}
      <div style={{ padding: '28px 20px 20px', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: '-0.03em', margin: 0 }}>
          Expressions
        </h1>
        <p style={{ fontSize: 14, color: T2, marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
          30 essential Korean patterns · click any to learn
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: DIV }} />

      {/* Section: Conversation expressions */}
      {main.length > 0 && (
        <>
          <SectionLabel label="Conversation" count={main.length} />
          {main.map((expr, i) => (
            <ExprCard key={expr.id} expr={expr} last={i === main.length - 1} />
          ))}
        </>
      )}

      {/* Section: Grammar & particles */}
      {grammar.length > 0 && (
        <>
          <div style={{ height: 8, background: DIV }} />
          <SectionLabel label="Grammar & Particles" count={grammar.length} />
          {grammar.map((expr, i) => (
            <ExprCard key={expr.id} expr={expr} last={i === grammar.length - 1} />
          ))}
        </>
      )}

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
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      padding: '14px 20px 8px',
      display: 'flex', alignItems: 'baseline', gap: 8,
      maxWidth: 480, margin: '0 auto',
    }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: T2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 11, color: T2, opacity: 0.6 }}>{count}</span>
    </div>
  )
}

function ExprCard({ expr, last }: { expr: ExprRow; last: boolean }) {
  const slug = ID_TO_SLUG[expr.id]
  if (!slug) return null

  return (
    <Link
      href={`/kpatto/expressions/${slug}`}
      style={{ textDecoration: 'none', display: 'block', maxWidth: 480, margin: '0 auto' }}
    >
      <div style={{
        padding: '15px 20px',
        borderBottom: last ? 'none' : `1px solid ${DIV}`,
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
          {expr.first_episode && expr.first_episode <= 30 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.04em',
              background: '#FFF4EA', borderRadius: 6, padding: '2px 7px',
            }}>
              {epBadge(expr.first_episode)}
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}
