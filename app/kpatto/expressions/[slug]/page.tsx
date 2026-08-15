import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import {
  SLUG_TO_ID,
  ID_TO_SLUG,
  ID_TO_CATEGORY,
  CATEGORY_BY_KEY,
  SEO_EXPRESSION_IDS,
} from '@/lib/kpatto/expressions-config'
import { ExpressionBackButton } from '@/components/kpatto/ExpressionBackButton'
import { KPattoAudioPlayer } from '@/components/kpatto/KPattoAudioPlayer'

export const dynamicParams = false

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const T1     = '#111111'
const T2     = '#888888'
const T3     = '#CCCCCC'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'

interface PageProps {
  params: Promise<{ slug: string }>
}

type ExpressionRow = {
  id: number
  korean: string
  english: string
  description: string | null
  structure: string | null
  category: string | null
  examples: Array<{ ko: string; en: string }> | null
  tip: string | null
  first_episode: number | null
  audio_url: string | null
  audio_urls: { pattern?: string | null; ex1?: string | null; ex2?: string | null; ex3?: string | null } | null
  romaja: string | null
  heading_en: string | null
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_ID).map(slug => ({ slug }))
}

// ── metadata helpers ──────────────────────────────────────────────────────────

/** 앞뒤 `~` 제거. e.g. "~주세요" → "주세요" */
function cleanKorean(raw: string): string {
  return raw.replace(/^~+|~+$/g, '').trim()
}

/** 전체 `~` 제거 후 공백·구두점 정리.
 *  e.g. "I'm from ~." → "I'm from"
 *       "Give me ~, please." → "Give me, please" */
function cleanEnglish(raw: string): string {
  return raw
    .replace(/~/g, '')           // 전체 물결 제거
    .replace(/[ \t]+/g, ' ')    // 연속 공백 → 한 칸
    .replace(/ ([,?.])/g, '$1') // 구두점 앞 공백 제거
    .trim()
    .replace(/\.+$/, '')        // 문말 마침표 제거
    .trim()
}

/** 문말 마침표만 제거 (examples 경로용 — 물결 제거 로직 미적용) */
function stripPeriod(s: string): string {
  return s.replace(/\.+$/, '').trim()
}

/** Truncate at a word boundary (last space ≤ maxLen), appending "...". */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '...'
}

/** title 조합: 80자 초과 시 — {korean} suffix 제거 */
function buildTitle(clean: string, kor: string): string {
  if (!clean) return `${kor} in Korean`
  const isQuestion = clean.endsWith('?')
  const full = isQuestion
    ? `How to Ask "${clean}" in Korean — ${kor}`
    : `How to Say "${clean}" in Korean — ${kor}`
  if (full.length <= 80) return full
  return isQuestion
    ? `How to Ask "${clean}" in Korean`
    : `How to Say "${clean}" in Korean`
}

// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const id = SLUG_TO_ID[slug]
  if (!id) return {}

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('kp_expressions')
    .select('korean, english, romaja, description, examples')
    .eq('id', id)
    .single()

  if (!data) return {}

  // english 또는 korean에 ~ 포함 시 examples[0] 사용
  const hasTilde = (data.english ?? '').includes('~') || data.korean.includes('~')
  const ex0 = (data.examples as Array<{ ko: string; en: string }> | null)?.[0]

  let clean: string
  let kor: string
  if (hasTilde && ex0) {
    clean = stripPeriod(ex0.en)
    kor   = stripPeriod(ex0.ko)
  } else {
    clean = data.english ? cleanEnglish(data.english) : ''
    kor   = cleanKorean(data.korean)
  }

  const title = buildTitle(clean, kor)

  const desc = data.description
    ? `${data.english}. ${truncateAtWord(data.description, 120)}`
    : `Learn ${data.korean} — ${data.english}. With examples and real Korean webtoon scenes.`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${BASE}/kpatto/expressions/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
    alternates: { canonical: `${BASE}/kpatto/expressions/${slug}` },
  }
}

export default async function ExpressionPage({ params }: PageProps) {
  const { slug } = await params
  const id = SLUG_TO_ID[slug]
  if (!id) notFound()

  const supabase = createAdminClient()

  const { data: expr } = await supabase
    .from('kp_expressions')
    .select('id, korean, english, description, structure, category, examples, tip, first_episode, audio_url, audio_urls, romaja, heading_en')
    .eq('id', id)
    .single()

  if (!expr) notFound()
  const e = expr as ExpressionRow

  // Webtoon panel image from first_episode
  let panelImageUrl: string | null = null
  let episodeTitle: string | null = null
  const episodeNum: number | null = e.first_episode

  if (e.first_episode) {
    const { data: ep } = await supabase
      .from('kp_episodes')
      .select('id, title, title_en')
      .eq('episode_num', e.first_episode)
      .single()

    if (ep) {
      episodeTitle = ep.title_en ?? ep.title ?? null
      const { data: panel } = await supabase
        .from('kp_panels')
        .select('image_url')
        .eq('episode_id', ep.id)
        .not('image_url', 'is', null)
        .order('order_num')
        .limit(1)
        .maybeSingle()
      panelImageUrl = panel?.image_url ?? null
    }
  }

  // Related expressions: same DB category, within SEO set, excluding self
  let related: Array<{ id: number; korean: string; english: string }> = []
  if (e.category) {
    const { data: relRows } = await supabase
      .from('kp_expressions')
      .select('id, korean, english')
      .eq('category', e.category)
      .in('id', SEO_EXPRESSION_IDS)
      .neq('id', id)
      .limit(4)
    related = (relRows ?? []) as typeof related
  }

  const episodeHref = episodeNum
    ? `/kpatto/story/kp-ep-${String(episodeNum).padStart(3, '0')}`
    : null
  const epLabel = episodeNum ? `EP${String(episodeNum).padStart(2, '0')}` : null

  // Category topic page link
  const catKey = ID_TO_CATEGORY[id]
  const catConfig = catKey ? CATEGORY_BY_KEY[catKey] : null

  // JSON-LD: Article schema
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${e.korean} — ${e.english}`,
    description: e.description ?? `Learn ${e.korean} in Korean with examples.`,
    url: `${BASE}/kpatto/expressions/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'K-PATTO',
      url: BASE,
    },
    inLanguage: 'en',
  }

  // JSON-LD: FAQPage schema
  const faqItems: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = []

  faqItems.push({
    '@type': 'Question',
    name: e.heading_en ?? `What does ${e.korean} mean in Korean?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: e.english,
    },
  })

  if (e.description) {
    faqItems.push({
      '@type': 'Question',
      name: `How do you use ${e.korean} in Korean?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.description,
      },
    })
  }

  if (e.examples && e.examples.length > 0) {
    faqItems.push({
      '@type': 'Question',
      name: `Can you give an example of ${e.korean}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${e.examples[0].ko} — ${e.examples[0].en}`,
      },
    })
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 32}px + env(safe-area-inset-bottom, 0px))` }}>

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
            <ExpressionBackButton />
            <span style={{ fontSize: 13, fontWeight: 700, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {catConfig ? catConfig.labelEn : 'Expressions'}
            </span>
            {catConfig && (
              <Link href={`/kpatto/expressions/topic/${catConfig.key}`} style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: T2,
                background: DIV, borderRadius: 6, padding: '3px 8px',
                letterSpacing: '0.04em', textDecoration: 'none',
              }}>
                {catConfig.labelEn} →
              </Link>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

          {/* ── Hero: pattern + meaning (compact) ── */}
          <div style={{ padding: '20px 0 16px' }}>
            {epLabel && (
              <div style={{ marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: '0.06em',
                  background: '#FFF4EA', borderRadius: 6, padding: '3px 9px',
                }}>
                  {epLabel}
                </span>
              </div>
            )}
            <h1 style={{
              fontSize: 38, fontWeight: 800, color: ACCENT,
              letterSpacing: '-0.03em', margin: '0 0 4px',
              fontFamily: 'var(--font-baloo, sans-serif)',
            }}>
              {e.korean}
            </h1>
            {e.romaja && (
              <p style={{ fontSize: 13, color: T2, fontWeight: 500, margin: '0 0 8px', letterSpacing: '0.01em' }}>
                {e.romaja}
              </p>
            )}
            <p style={{ fontSize: 18, color: T1, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
              {e.english}
            </p>
          </div>

          {/* ── Webtoon panel + audio — FIRST SCROLL ── */}
          {(panelImageUrl || (e.audio_urls?.pattern ?? e.audio_url) || episodeHref) && (
            <div style={{ paddingBottom: 20 }}>

              {/* Webtoon image */}
              {panelImageUrl && (
                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
                  <Image
                    src={panelImageUrl}
                    alt={`${e.korean} in K-PATTO webtoon`}
                    width={440}
                    height={220}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    unoptimized
                    priority
                  />
                </div>
              )}

              {/* Audio player — audio_urls.pattern 우선, 없으면 audio_url 폴백 (EP06+) */}
              <KPattoAudioPlayer
                src={e.audio_urls?.pattern ?? e.audio_url ?? null}
                label={e.korean}
              />

              {/* Episode link */}
              {episodeHref && episodeTitle && (
                <Link href={episodeHref} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', padding: '14px 16px', marginTop: 10,
                  background: DIV, borderRadius: 12, color: T1,
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
                      {epLabel} · K-PATTO Story
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>
                      {episodeTitle}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              )}
            </div>
          )}

          <div style={{ height: 1, background: DIV, margin: '0 -20px' }} />

          {/* ── heading_en (SEO H2) ── */}
          {e.heading_en && (
            <h2 style={{
              fontSize: 16, fontWeight: 700, color: T1,
              margin: '20px 0 0', lineHeight: 1.4,
              letterSpacing: '-0.01em',
            }}>
              {e.heading_en}
            </h2>
          )}

          {/* ── How to Use ── */}
          {e.description && (
            <Section label="How to Use">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {e.description.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontSize: 14, color: T1, lineHeight: 1.7, margin: 0 }}>
                    {para}
                  </p>
                ))}
              </div>
              {e.tip && (
                <div style={{
                  marginTop: 12, padding: '12px 14px',
                  background: '#FFF4EA', borderRadius: 10, borderLeft: `3px solid ${ACCENT}`,
                }}>
                  <p style={{ fontSize: 13, color: ACCENT, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                    💡 {e.tip}
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* ── Examples ── */}
          {e.examples && e.examples.length > 0 && (
            <Section label="Examples">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {e.examples.map((ex, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', background: '#F8F8F8', borderRadius: 12,
                  }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: T1, margin: '0 0 4px', lineHeight: 1.5 }}>
                      {ex.ko}
                    </p>
                    <p style={{ fontSize: 13, color: T2, margin: 0, lineHeight: 1.5 }}>
                      {ex.en}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Related Expressions ── */}
          {related.length > 0 && (
            <Section label="Related Expressions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {related.map(rel => {
                  const relSlug = ID_TO_SLUG[rel.id]
                  if (!relSlug) return null
                  return (
                    <Link key={rel.id} href={`/kpatto/expressions/${relSlug}`} style={{
                      display: 'flex', alignItems: 'center', textDecoration: 'none',
                      padding: '12px 0', borderBottom: `1px solid ${DIV}`, gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{rel.korean}</span>
                        <span style={{ fontSize: 13, color: T2, marginLeft: 10 }}>{rel.english}</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </Section>
          )}

          {/* ── CTA ── */}
          <div style={{ padding: '28px 0 8px' }}>
            <Link href="/kpatto/story" style={{
              display: 'block', textAlign: 'center', textDecoration: 'none',
              background: ACCENT, color: '#fff', borderRadius: 14,
              padding: '16px 20px', fontSize: 15, fontWeight: 800,
              letterSpacing: '-0.01em',
            }}>
              Start Learning with K-PATTO →
            </Link>
            <p style={{ textAlign: 'center', fontSize: 12, color: T2, marginTop: 10 }}>
              First 10 episodes free · no account needed
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 0 0' }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: T2, letterSpacing: '0.10em',
        textTransform: 'uppercase', marginBottom: 12,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

