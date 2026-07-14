import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const revalidate = 3600

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const fontFamily = locale === 'ko'
    ? '"맑은 고딕", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
    : '"DM Sans", "Inter", system-ui, sans-serif'

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, tags, published_at')
    .eq('locale', locale)
    .order('published_at', { ascending: false })

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100dvh', color: 'white', fontFamily }}>
      <style>{`
        .blog-card { transition: transform 0.15s, background 0.15s; }
        .blog-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.08) !important; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 32px' }}>
        <Link href="/" style={{
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
          textDecoration: 'none', letterSpacing: '0.04em',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 40,
        }}>
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
          {locale === 'ko' ? '영어 패턴 마스터를 위한 팁과 가이드' : 'Tips and guides on mastering English patterns.'}
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        {(!posts || posts.length === 0) ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${locale}/patto/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="blog-card" style={{
                  padding: '24px 28px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                }}>
                  {post.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
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
                      Patto Team · {new Date(post.published_at).toLocaleDateString(
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
