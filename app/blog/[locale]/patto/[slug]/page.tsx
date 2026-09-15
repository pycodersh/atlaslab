import { createClient } from '@supabase/supabase-js'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { blogMdxComponents } from '@/components/blog/mdxComponents'
import type { Metadata } from 'next'
import { proseCss } from '@/lib/blog/proseCss'
import { ArticleAppBanner } from '@/components/blog/ArticleAppBanner'
import { BlogThumb } from '@/components/blog/BlogThumb'
import { thumbnailForPost } from '@/lib/blog/thumbnail'

export const revalidate = 3600
export const dynamicParams = true

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", "Inter", system-ui, sans-serif'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, description')
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('is_paused', false)
    .single()

  if (!post) return {}

  const otherLocale = locale === 'ko' ? 'en' : 'ko'

  const { data: crossPost } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('locale', otherLocale)
    .eq('app', 'patto')
    .eq('slug', slug)
    .eq('is_paused', false)
    .limit(1)
  const hasCross = (crossPost?.length ?? 0) > 0

  return {
    title: `${post.title} — Patto Articles`,
    description: post.description,
    openGraph: { title: post.title, description: post.description },
    alternates: {
      canonical: `${BASE}/blog/${locale}/patto/${slug}`,
      ...(hasCross && {
        languages: {
          [locale]: `${BASE}/blog/${locale}/patto/${slug}`,
          [otherLocale]: `${BASE}/blog/${otherLocale}/patto/${slug}`,
        },
      }),
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('is_paused', false)
    .single()

  if (!post) notFound()

  // k-patto posts redirect to their canonical route
  if (post.app === 'k-patto') {
    redirect(`/blog/${locale}/k-patto/${slug}`)
  }

  const { data: related } = await supabase
    .from('blog_posts')
    .select('slug, title, description, published_at')
    .eq('locale', locale)
    .eq('app', 'patto')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(5)

  const bodyFont = locale === 'ko'
    ? '"맑은 고딕", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
    : BODY

  // 카드와 같은 함수 — 없으면 히어로에 영역 자체를 만들지 않는다
  const thumb = thumbnailForPost(post.slug, post.content)

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100dvh' }}>
      <style>{`
        html, body { overflow-x: hidden; scrollbar-gutter: stable; }

        /* ── Layout ──────────────────────────────────────────── */
        .art-wrap {
          max-width: 720px; margin: 0 auto;
          padding-left: 24px; padding-right: 24px;
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
          font-size: clamp(24px, 4vw, 40px);
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

          <p className="art-meta">
            Patto Team ·{' '}
            {new Date(post.published_at).toLocaleDateString(
              locale === 'ko' ? 'ko-KR' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>

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
          {/* 앱 연계 CTA — 본문 결론 바로 다음, 관련 글 위 */}
          <ArticleAppBanner app={post.app} category={post.category} locale={locale} />

          {/* Related posts */}
          {related && related.length > 0 && (
            <div className="art-related">
              <p className="art-related-label">More from Patto Articles</p>
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/blog/${locale}/patto/${r.slug}`}
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
    </div>
  )
}
