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

export const dynamicParams = false

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-patto.com'

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
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_ID).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const id = SLUG_TO_ID[slug]
  if (!id) return {}

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('kp_expressions')
    .select('korean, english, description')
    .eq('id', id)
    .single()

  if (!data) return {}

  const title = `${data.korean} in Korean | K-PATTO`
  const desc = data.description
    ? `${data.english}. ${data.description.slice(0, 120)}...`
    : `Learn ${data.korean} — ${data.english}. With examples and real Korean webtoon scenes.`

  return {
    title,
    description: desc,
    openGraph: {
      title: `${data.korean} — ${data.english}`,
      description: desc,
      url: `${BASE}/kpatto/expressions/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${data.korean} — ${data.english}`,
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
    .select('id, korean, english, description, structure, category, examples, tip, first_episode, audio_url')
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
    name: `What does ${e.korean} mean in Korean?`,
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

      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>

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
              {catConfig ? catConfig.labelEn : 'Expressions'}
            </span>
            {catConfig && (
              <Link href={`/kpatto/expressions/topic/${catConfig.key}`} style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: T2,
                background: DIV, borderRadius: 6, padding: '3px 8px',
                letterSpacing: '0.04em', textDecoration: 'none',
              }}>
                {catConfig.labelKo} →
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
              letterSpacing: '-0.03em', margin: '0 0 8px',
              fontFamily: 'var(--font-baloo, sans-serif)',
            }}>
              {e.korean}
            </h1>
            <p style={{ fontSize: 18, color: T1, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
              {e.english}
            </p>
          </div>

          {/* ── Webtoon panel + audio — FIRST SCROLL ── */}
          {(panelImageUrl || e.audio_url || episodeHref) && (
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

              {/* Audio player */}
              {e.audio_url && (
                <AudioPlayer src={e.audio_url} label={e.korean} />
              )}

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

          {/* ── How to Use ── */}
          {e.description && (
            <Section label="How to Use">
              <p style={{ fontSize: 14, color: T1, lineHeight: 1.7, margin: 0 }}>
                {e.description}
              </p>
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

function AudioPlayer({ src, label }: { src: string; label: string }) {
  // Server-rendered wrapper; audio element is interactive in the browser
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px', background: '#FFF4EA',
      borderRadius: 14, border: `1px solid #F5D9B4`,
    }}>
      {/* Play icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 2, letterSpacing: '0.04em' }}>
          PRONUNCIATION
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>
          {label}
        </div>
      </div>
      {/* Native audio element — clicking the play div above triggers it via JS not needed for SSR */}
      {/* Browser renders its own controls as fallback; we rely on the styled button above */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        src={src}
        preload="none"
        style={{ display: 'none' }}
        id={`audio-${label}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var btn=document.currentScript.previousElementSibling;
  var audio=btn;
  // find the audio element and the button container
  var container=document.currentScript.parentElement;
  if(!container)return;
  var aud=container.querySelector('audio');
  var playBtn=container.querySelector('div[style*="border-radius: 50%"]');
  if(!aud||!playBtn)return;
  playBtn.style.cursor='pointer';
  var playing=false;
  playBtn.addEventListener('click',function(){
    if(playing){aud.pause();playing=false;}
    else{aud.play();playing=true;}
    aud.onended=function(){playing=false;};
  });
})();`,
        }}
      />
    </div>
  )
}
