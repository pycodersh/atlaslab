import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Patto',
  description: 'Tips, guides, and insights on English pattern learning.',
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const posts = getAllPosts(locale, 'patto')

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a1a', color: '#fff' }}>
      <style>{`
        .blog-card { transition: transform 0.15s, background 0.15s; }
        .blog-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '48px 24px 40px', maxWidth: 720, margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            fontSize: 12, fontWeight: 600, color: '#7c6fff',
            textDecoration: 'none', letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 40,
          }}
        >
          ← Atlas Lab
        </Link>

        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: '0 0 10px',
        }}>
          Blog
        </p>
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff',
          margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Learning Insights
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
          Tips and guides on mastering English patterns.
        </p>
      </div>

      {/* Post list */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        {posts.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${locale}/patto/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="blog-card" style={{
                  padding: '24px 28px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                }}>
                  {post.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {post.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                          color: '#a89fff',
                          background: 'rgba(124,111,255,0.2)',
                          borderRadius: 6, padding: '2px 8px',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 style={{
                    fontSize: 18, fontWeight: 700, color: '#fff',
                    margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h2>

                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 18px', lineHeight: 1.6 }}>
                    {post.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {post.author} · {new Date(post.date).toLocaleDateString(
                        locale === 'ko' ? 'ko-KR' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#7c6fff' }}>Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
