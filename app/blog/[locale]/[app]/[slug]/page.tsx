import { createClient } from '@supabase/supabase-js'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogMdxComponents } from '@/components/blog/mdxComponents'
import type { Metadata } from 'next'
import { proseCss, PROSE_FONT } from '@/lib/blog/proseCss'
import { ArticleAppBanner } from '@/components/blog/ArticleAppBanner'
import { groupKeyOf } from '@/lib/blog/sections'
import { KlookBanner } from '@/components/blog/KlookBanner'
import { ItalkiBanner } from '@/components/blog/ItalkiBanner'
import { SaveActions } from '@/components/SaveActions'
import { BlogThumb } from '@/components/blog/BlogThumb'
import { thumbnailForPost } from '@/lib/blog/thumbnail'
import { readMinutes } from '@/lib/blog/readTime'
import { ArticleJsonLd } from '@/components/blog/ArticleJsonLd'
import { ArticleStickyCta } from '@/components/blog/ArticleStickyCta'

/** Klook 배너를 붙이는 주제 그룹(lib/blog/sections) — 여행 Explore Korea · 음식 Food · 생활 Life */
const KLOOK_GROUPS = new Set<string>(['explore-korea', 'food', 'life'])
/** italki 배너를 붙이는 주제 그룹 — 한국어 학습 Phrases · Basics + 생활 Life (여행 · 음식 큐레이션에는 넣지 않는다).
 *  DB category 는 'Real-Life Korean' · 'Korean Culture' 같은 값이라 문자열로 맞추지 않고 그룹 key 로 거른다 */
const ITALKI_GROUPS = new Set<string>(['phrases', 'basics', 'life'])

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", "Inter", system-ui, sans-serif'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

// ── App display info ──────────────────────────────────────────────────────────
const APP_INFO: Record<string, {
  label: string
  blogLabel: string
  href: string | null
  cta: (locale: string) => string
  ctaDesc: (locale: string) => string
}> = {
  'k-patto': {
    label: 'K-Patto',
    blogLabel: 'K-Patto Articles',
    href: '/kpatto',
    cta: () => 'Try K-Patto →',
    ctaDesc: (locale) => locale === 'ko'
      ? 'K-Patto로 한국어 패턴을 자연스럽게 마스터하세요.'
      : 'Learn Korean patterns naturally with K-Patto.',
  },
  patto: {
    label: 'Patto',
    blogLabel: 'Patto Articles',
    href: '/patto/home',
    cta: (locale) => locale === 'ko' ? '무료로 시작하기 →' : 'Start for free →',
    ctaDesc: (locale) => locale === 'ko'
      ? 'Patto로 영어 패턴을 자동화하세요.'
      : 'Master English patterns with Patto.',
  },
  kpantry: {
    label: 'K-Pantry',
    blogLabel: 'K-Pantry Articles',
    href: '/kpantry/en',
    cta: () => 'Explore recipes →',
    ctaDesc: (locale) => locale === 'ko'
      ? 'K-Pantry로 냉장고 속 재료로 한국 요리를 만들어보세요.'
      : "Cook Korean food with what's already in your fridge.",
  },
  'k-pantry': {
    label: 'K-Pantry',
    blogLabel: 'K-Pantry Articles',
    href: '/kpantry/en',
    cta: () => 'Explore recipes →',
    ctaDesc: (locale) => locale === 'ko'
      ? 'K-Pantry로 냉장고 속 재료로 한국 요리를 만들어보세요.'
      : "Cook Korean food with what's already in your fridge.",
  },
  careernavi: {
    label: 'Career Navi',
    blogLabel: 'Career Navi Articles',
    href: null,
    cta: () => 'Coming soon',
    ctaDesc: (locale) => locale === 'ko'
      ? 'AI 기반 한국 직장인을 위한 경력 내비게이터 — 출시 예정'
      : 'AI career navigation for Korean professionals — coming soon.',
  },
}

function getAppInfo(app: string) {
  return APP_INFO[app] ?? {
    label: app,
    blogLabel: `${app} Articles`,
    href: null,
    cta: () => '→',
    ctaDesc: () => '',
  }
}

function getFilterUrl(app: string): string {
  if (app === 'kpantry') return '/blog?app=k-pantry'
  return `/blog?app=${app}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; app: string; slug: string }>
}): Promise<Metadata> {
  const { locale, app, slug } = await params
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, description')
    .eq('locale', locale)
    .eq('app', app)
    .eq('slug', slug)
    .eq('is_paused', false)
    .single()

  if (!post) return {}

  const info = getAppInfo(app)
  const otherLocale = locale === 'ko' ? 'en' : 'ko'

  const { data: crossPost } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', otherLocale)
    .eq('app', app)
    .eq('slug', slug)
    .eq('is_paused', false)
    .limit(1)

  const hasCross = (crossPost?.length ?? 0) > 0

  return {
    title: `${post.title} — ${info.blogLabel}`,
    description: post.description,
    openGraph: { title: post.title, description: post.description },
    alternates: {
      canonical: `${BASE}/blog/${locale}/${app}/${slug}`,
      ...(hasCross && {
        languages: {
          [locale]: `${BASE}/blog/${locale}/${app}/${slug}`,
          [otherLocale]: `${BASE}/blog/${otherLocale}/${app}/${slug}`,
        },
      }),
    },
  }
}

export default async function AppBlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; app: string; slug: string }>
}) {
  const { locale, app, slug } = await params

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('locale', locale)
    .eq('app', app)
    .eq('slug', slug)
    .eq('is_paused', false)
    .single()

  if (!post) notFound()

  const { data: related } = await supabase
    .from('blog_posts')
    .select('slug, title, description, published_at')
    .eq('locale', locale)
    .eq('app', app)
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(5)

  // 본문 글꼴은 locale 과 무관하게 Pretendard 하나로 간다 — 한 문단 안에
  // 영문과 한글이 섞여도 글꼴이 갈리지 않는다(예전엔 ko/en 이 달랐다).
  const bodyFont = PROSE_FONT

  const info = getAppInfo(app)

  // 카드와 같은 함수를 쓴다 — 대표 이미지가 있으면 그것을, 없으면 본문에서 뽑는다.
  // null 이면 히어로에 영역 자체를 만들지 않는다.
  const thumb = thumbnailForPost(post.slug, post.content, post.thumbnail)

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100dvh' }}>
      <ArticleJsonLd
        headline={post.title}
        description={post.description}
        datePublished={post.published_at}
        url={`${BASE}/blog/${locale}/${app}/${slug}`}
        content={post.content}
      />
      <style>{`
        html, body { overflow-x: hidden; scrollbar-gutter: stable; }

        /* ── Layout ──────────────────────────────────────────── */
        /* 블로그 INSIGHTS 와 같은 폭: 바깥 760px + 좌우 40px = 본문 680px
           (blog.atlaslabstudios.com 상세에서 실측한 값) */
        .art-wrap {
          max-width: 760px; margin: 0 auto;
          padding-left: 40px; padding-right: 40px;
          box-sizing: border-box;
        }
        @media (max-width: 600px) {
          .art-wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Hero elements ──────────────────────────────────── */
        .art-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: ${BODY};
          font-size: 13px; color: rgba(255,255,255,0.4);
          text-decoration: none; margin-bottom: 28px;
          transition: color 0.15s;
        }
        .art-back:hover { color: rgba(255,255,255,0.75); }

        .art-kicker {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #C8102E; margin: 0 0 14px;
        }

        .art-h1 {
          font-family: ${SERIF};
          /* 모바일 32px → PC 42px. 본문 h2(30px)보다 확실히 한 단 위. */
          font-size: clamp(32px, 4vw, 40px);
          font-weight: 700; color: #fff;
          line-height: 1.15; letter-spacing: -0.02em;
          margin: 0 0 14px;
        }

        .art-desc {
          font-family: ${BODY};
          font-size: 16px; color: rgba(255,255,255,0.55);
          line-height: 1.65; margin: 0 0 18px;
        }

        .art-meta {
          font-family: ${BODY};
          font-size: 12px; color: rgba(255,255,255,0.35); margin: 0;
        }

        /* ── Prose — light mode ──────────────────────────────── */
        ${proseCss(bodyFont)}

        /* ── Related posts ───────────────────────────────────── */
        .art-related { border-top: 1px solid #E5E1DC; padding: 28px 0 0; margin-bottom: 36px; }
        .art-related-label {
          font-family: ${BODY}; font-size: 10px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #C8102E; margin: 0 0 16px;
        }
        .art-related-item {
          display: block; border-bottom: 1px solid #E5E1DC;
          padding: 12px 0; text-decoration: none;
        }
        .art-related-title {
          font-family: ${SERIF}; font-size: 15px; font-weight: 700;
          color: #111; line-height: 1.3; display: block; margin-bottom: 3px;
        }
        .art-related-desc {
          font-family: ${BODY}; font-size: 12px; color: #888;
          line-height: 1.5; display: block;
        }
        .art-related-item:hover .art-related-title { color: #C8102E; }

      `}</style>

      {/* ── Hero ── */}
      <section style={{ background: '#121212', paddingBottom: 32 }}>
        <div className="art-wrap" style={{ paddingTop: 32 }}>
          <Link href="/blog" className="art-back">← Articles</Link>

          {post.category ? (
            <p className="art-kicker">{post.category}</p>
          ) : post.tags?.length > 0 ? (
            <p className="art-kicker">{post.tags[0]}</p>
          ) : null}

          <h1 className="art-h1">{post.title}</h1>

          {post.description && (
            <p className="art-desc">{post.description}</p>
          )}

          {/* 메타 줄 오른쪽 끝에 북마크·좋아요 — 버튼 여백만큼 위아래를 당겨 줄 높이를 지킨다 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '-8px 0' }}>
            <p className="art-meta">
              {info.label} Team · {readMinutes(post.content)} min read
            </p>
            <SaveActions
              tone="dark"
              item={{
                id: `guide:${locale}/${app}/${slug}`,
                kind: 'guide',
                title: post.title,
                href: `/blog/${locale}/${app}/${slug}`,
                desc: post.description ?? undefined,
              }}
            />
          </div>

          {thumb && (
            <div className="art-thumb">
              <BlogThumb thumb={thumb} alt={post.title} />
            </div>
          )}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginTop: 28 }} />
      </section>

      {/* ── Body ── */}
      <div style={{ background: '#F9F8F6' }}>
        <article className="blog-prose art-wrap">
          <MDXRemote
            source={post.content}
            components={blogMdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>

        <div className="art-wrap" style={{ paddingBottom: 8 }}>
          {/* italki 제휴 배너 — 본문 바로 아래, 앱 CTA · Klook · 관련 글 위. Phrases · Basics · Life 글에만 */}
          {ITALKI_GROUPS.has(groupKeyOf(app, post.category) ?? '') && <ItalkiBanner />}

          {/*
            ── (추후) 글 전용 예약 버튼 자리 — 본문 Summary 바로 아래 ──────────────────────
            INSPIRE 처럼 특정 리조트·액티비티 글에 Trip.com / Klook 제휴 예약 링크를 받으면 여기에 둔다.
            Summary 리스트는 글 본문(DB content)이라 템플릿에서 그 안에 끼울 수 없어, 본문이 끝나는 이 자리가 바로 아래다.
            slug 별로 링크를 매핑해 해당 글에서만 보이게 한다. 예:

            const BOOKING_LINKS: Record<string, { label: string; href: string }> = {
              'mohegan-inspire-resort-guide': { label: 'Book INSPIRE Resort on Trip.com →', href: 'https://…(제휴 링크)' },
            }
            {BOOKING_LINKS[slug] && (
              <a href={BOOKING_LINKS[slug].href} target="_blank" rel="noopener noreferrer sponsored" className="promo-btn"
                 style={{ display: 'block', textAlign: 'center', margin: '24px 0 0' }}>
                {BOOKING_LINKS[slug].label}
              </a>
            )}
          */}

          {/* 앱 연계 CTA — 본문 결론 바로 다음, 관련 글 위.
              Korean phrases / basics 글은 앱·PDF 버튼 대신 /kpatto 랜딩으로 가는 단일 CTA(lib/blog/appCta).
              개편 글(본문에 <KpattoCta /> 가 있는 Food·Life 글)은 본문 CTA 와 겹쳐서 내지 않는다 */}
          {!post.content.includes('<KpattoCta') && (
            <ArticleAppBanner app={app} category={post.category} locale={locale} />
          )}

          {/* Klook 배너 — 앱 CTA 바로 아래. 여행·음식·생활 글에만(학습 글 phrases·basics 에는 넣지 않는다) */}
          {KLOOK_GROUPS.has(groupKeyOf(app, post.category) ?? '') && <KlookBanner />}

          {/* Related posts */}
          {related && related.length > 0 && (
            <div className="art-related">
              <p className="art-related-label">More from {info.blogLabel}</p>
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/blog/${locale}/${app}/${r.slug}`}
                  className="art-related-item"
                >
                  <span className="art-related-title">{r.title}</span>
                  {r.description && (
                    <span className="art-related-desc">{r.description}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 모바일 하단 고정 CTA — 20% 이상 읽으면 올라온다(넓은 화면은 숨김) */}
      <ArticleStickyCta />
    </div>
  )
}
