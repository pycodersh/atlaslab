import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const locales = ['ko', 'en']
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    const posts = getAllPosts(locale, 'patto')
    for (const post of posts) {
      params.push({ locale, slug: post.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPostBySlug(locale, 'patto', slug)
  if (!post) return {}
  return {
    title: `${post.frontmatter.title} — Patto Blog`,
    description: post.frontmatter.description,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const post = getPostBySlug(locale, 'patto', slug)
  if (!post) notFound()

  const { frontmatter, content } = post

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a1a', color: '#fff' }}>
      <style>{`
        .blog-prose h2 {
          font-size: 22px; font-weight: 800; color: #fff;
          margin: 40px 0 14px; letter-spacing: -0.01em; line-height: 1.3;
        }
        .blog-prose h3 {
          font-size: 17px; font-weight: 700; color: #fff;
          margin: 28px 0 10px;
        }
        .blog-prose p {
          font-size: 15px; line-height: 1.75;
          color: rgba(255,255,255,0.7); margin: 0 0 18px;
        }
        .blog-prose strong { font-weight: 700; color: #fff; }
        .blog-prose ul, .blog-prose ol {
          padding-left: 24px; margin: 0 0 18px;
        }
        .blog-prose li {
          font-size: 15px; line-height: 1.75;
          color: rgba(255,255,255,0.7); margin-bottom: 6px;
        }
        .blog-prose blockquote {
          border-left: 3px solid #7c6fff;
          margin: 28px 0; padding: 14px 20px;
          background: rgba(124,111,255,0.08);
          border-radius: 0 12px 12px 0;
        }
        .blog-prose blockquote p {
          margin: 0; font-style: italic; color: rgba(255,255,255,0.6);
        }
        .blog-prose code {
          font-size: 13px; background: rgba(124,111,255,0.15);
          color: #a89fff; border-radius: 4px; padding: 2px 6px;
          font-family: 'Courier New', monospace;
        }
        .blog-prose pre {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 20px;
          overflow-x: auto; margin: 0 0 24px;
        }
        .blog-prose pre code { background: none; padding: 0; color: rgba(255,255,255,0.85); }
        .blog-prose a { color: #7c6fff; text-decoration: underline; text-underline-offset: 3px; }
        .blog-prose a:hover { color: #a89fff; }
      `}</style>

      {/* Back nav */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 0' }}>
        <Link
          href={`/blog/${locale}/patto`}
          style={{
            fontSize: 12, fontWeight: 600, color: '#7c6fff',
            textDecoration: 'none', letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Atlas Lab
        </Link>
      </div>

      {/* Header */}
      <header style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 40px' }}>
        {frontmatter.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {frontmatter.tags.map(tag => (
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
          {frontmatter.title}
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.6 }}>
          {frontmatter.description}
        </p>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          {frontmatter.author} · {new Date(frontmatter.date).toLocaleDateString(
            locale === 'ko' ? 'ko-KR' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginTop: 32 }} />
      </header>

      {/* MDX content */}
      <article
        className="blog-prose"
        style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 100px' }}
      >
        <MDXRemote source={content} />
      </article>
    </div>
  )
}
