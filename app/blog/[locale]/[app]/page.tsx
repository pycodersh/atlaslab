import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const POSTS_PER_PAGE = 10

const APP_LABELS: Record<string, { en: string; ko: string; desc: string }> = {
  'k-patto': {
    en: 'K-Patto Blog',
    ko: 'K-Patto 블로그',
    desc: 'Tips and guides on mastering Korean patterns.',
  },
  patto: {
    en: 'Patto Blog',
    ko: 'Patto 블로그',
    desc: 'Tips and guides on mastering English patterns.',
  },
}

export default async function AppBlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; app: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale, app } = await params
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1'))
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const label = APP_LABELS[app] ?? { en: `${app} Blog`, ko: `${app} 블로그`, desc: '' }

  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('locale', locale)
    .eq('app', app)
    .lte('published_at', new Date().toISOString())

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, tags, published_at')
    .eq('locale', locale)
    .eq('app', app)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, to)

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', padding: '2rem 1.5rem', color: 'white' }}>
      <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Atlas Lab
      </Link>

      <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          BLOG
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {locale === 'ko' ? label.ko : label.en}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{label.desc}</p>
      </div>

      {(!posts || posts.length === 0) && (
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>No posts yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(posts || []).map(post => (
          <Link key={post.slug} href={`/blog/${locale}/${app}/${post.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {post.tags?.map((tag: string) => (
                  <span key={tag} style={{
                    background: 'rgba(124,111,255,0.2)',
                    color: '#a89fff',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                  }}>{tag}</span>
                ))}
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                {post.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {post.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  K-Patto Team · {new Date(post.published_at).toLocaleDateString(
                    locale === 'ko' ? 'ko-KR' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
                <span style={{ color: '#7c6fff', fontSize: '0.9rem' }}>Read →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          {currentPage > 1 && (
            <Link href={`/blog/${locale}/${app}?page=${currentPage - 1}`} style={{
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem',
            }}>← 이전</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, idx, arr) => (
              <>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span key={`dots-${p}`} style={{ color: 'rgba(255,255,255,0.3)', padding: '0.5rem' }}>...</span>
                )}
                <Link key={p} href={`/blog/${locale}/${app}?page=${p}`} style={{
                  padding: '0.5rem 0.875rem', borderRadius: '8px',
                  background: p === currentPage ? '#7c6fff' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${p === currentPage ? '#7c6fff' : 'rgba(255,255,255,0.1)'}`,
                  color: p === currentPage ? 'white' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', fontSize: '0.9rem',
                  fontWeight: p === currentPage ? 600 : 400,
                }}>{p}</Link>
              </>
            ))
          }
          {currentPage < totalPages && (
            <Link href={`/blog/${locale}/${app}?page=${currentPage + 1}`} style={{
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem',
            }}>다음 →</Link>
          )}
        </div>
      )}
      {totalPages > 1 && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem' }}>
          {currentPage} / {totalPages} 페이지 · 총 {count}개 글
        </p>
      )}
    </div>
  )
}
