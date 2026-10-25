import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { BookmarksList } from './BookmarksList'

export const metadata: Metadata = {
  title: 'My Bookmarks — Atlas Lab',
  description: 'Guides and Korean patterns you saved on this device.',
  // 방문자마다 내용이 다른(로컬 저장) 페이지라 색인하지 않는다
  robots: { index: false, follow: true },
}

export default function BookmarksPage() {
  return (
    <div style={{ background: 'var(--paper, #fff)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1, width: '100%', maxWidth: 760, margin: '0 auto', padding: '48px 20px 72px', boxSizing: 'border-box' }}>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-.015em', color: 'var(--ink, #111)', margin: '0 0 8px' }}>
          My Bookmarks
        </h1>
        <p style={{ fontFamily: '"DM Sans", Inter, system-ui, sans-serif', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-muted, #6B6B6B)', margin: '0 0 36px' }}>
          Saved on this device only — no account needed. Clearing your browser data removes them.
        </p>
        <BookmarksList />
      </main>
      <SiteFooter />
    </div>
  )
}
