import { createClient } from '@supabase/supabase-js'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600
export const dynamicParams = true

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

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
    title: `${post.title} — Patto Blog`,
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

  // k-patto 글은 canonical 경로인 /k-patto/로 308 redirect
  // patto 앱 글은 이 라우트에서 정상 서빙
  if (post.app === 'k-patto') {
    redirect(`/blog/${locale}/k-patto/${slug}`)
  }

  // Related posts (same locale + patto app, excluding current)
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

  const fontFamily = locale === 'ko'
    ? '"맑은 고딕", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
    : '"DM Sans", "Inter", system-ui, sans-serif'

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100dvh', color: 'white', fontFamily }}>
      <style>{`
        .blog-prose h2 {
          font-size: 22px; font-weight: 800; color: #fff;
          margin: 40px 0 14px; letter-spacing: -0.01em; line-height: 1.3;
        }
        .blog-prose h3 {
          font-size: 17px; font-weight: 700; color: #fff; margin: 28px 0 10px;
        }
        .blog-prose p {
          font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.7); margin: 0 0 18px;
        }
        .blog-prose strong { font-weight: 700; color: #fff; }
        .blog-prose em { font-style: italic; color: rgba(255,255,255,0.8); }
        .blog-prose ul, .blog-prose ol { padding-left: 24px; margin: 0 0 18px; }
        .blog-prose li {
          font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.7); margin-bottom: 6px;
        }
        .blog-prose blockquote {
          border-left: 3px solid #7c6fff; margin: 28px 0; padding: 14px 20px;
          background: rgba(124,111,255,0.08); border-radius: 0 12px 12px 0;
        }
        .blog-prose blockquote p { margin: 0; font-style: italic; color: rgba(255,255,255,0.6); }
        .blog-prose code {
          font-size: 13px; background: rgba(124,111,255,0.15); color: #a89fff;
          border-radius: 4px; padding: 2px 6px; font-family: 'Courier New', monospace;
        }
        .blog-prose pre {
          background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 20px; overflow-x: auto; margin: 0 0 24px;
        }
        .blog-prose pre code { background: none; padding: 0; color: rgba(255,255,255,0.85); }
        .blog-prose a { color: #7c6fff; text-decoration: underline; text-underline-offset: 3px; }
        .blog-prose a:hover { color: #a89fff; }
        .blog-prose hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0; }
        .blog-prose table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; display: block; overflow-x: auto; }
        .blog-prose th, .blog-prose td { padding: 10px 16px; text-align: left; border: 1px solid rgba(255,255,255,0.12); }
        .blog-prose th { background: rgba(255,255,255,0.07); font-weight: 600; font-size: 13px; letter-spacing: 0.02em; }
        .blog-prose tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
        .blog-prose * { font-family: inherit; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Atlas Lab</Link>
          <span>/</span>
          <Link href={`/blog/${locale}`} style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <Link href={`/blog/${locale}/patto`} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Patto Blog</Link>
        </div>
      </div>

      <header style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 32px' }}>
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {post.tags.map((tag: string) => (
              <span key={tag} style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                color: '#a89fff', background: 'rgba(124,111,255,0.2)',
                borderRadius: 6, padding: '2px 8px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff',
          margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          {post.title}
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.6 }}>
          {post.description}
        </p>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Patto Team · {new Date(post.published_at).toLocaleDateString(
            locale === 'ko' ? 'ko-KR' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </p>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginTop: 28 }} />
      </header>

      <article
        className="blog-prose"
        style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}
      >
        <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 16px' }}>

        {/* Related posts */}
        {related && related.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
              {locale === 'ko' ? '관련 글' : 'More from Patto Blog'}
            </p>
            <div>
              {related.map(r => (
                <div key={r.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <Link
                    href={`/blog/${locale}/patto/${r.slug}`}
                    style={{ textDecoration: 'none', display: 'block', padding: '12px 0' }}
                  >
                    <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                      {r.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
                      {r.description}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patto CTA */}
        <div style={{
          padding: '32px', textAlign: 'center',
          background: 'rgba(124,111,255,0.1)',
          border: '1px solid rgba(124,111,255,0.3)',
          borderRadius: 20,
          marginBottom: 64,
        }}>
          <p style={{ marginBottom: 8, fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            PATTO
          </p>
          <p style={{ marginBottom: 20, fontWeight: 600, fontSize: 16, color: '#fff' }}>
            {locale === 'ko' ? 'Patto로 영어 패턴을 자동화하세요' : 'Start learning English patterns with Patto'}
          </p>
          <Link href="/patto/home" style={{
            background: '#7c6fff', color: 'white',
            padding: '12px 32px', borderRadius: 999,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
            display: 'inline-block',
          }}>
            {locale === 'ko' ? '무료로 시작하기 →' : 'Start for free →'}
          </Link>
        </div>
      </div>
    </div>
  )
}
