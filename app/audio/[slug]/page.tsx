import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  BOOK_PATTERNS,
  bookExampleAudio,
  parsePatternSlug,
  patternSlug,
} from '@/lib/kpatto/book-patterns'
import { PatternPlayer } from './PatternPlayer'

// 책의 300패턴만 — 그 밖의 주소는 404
export const dynamicParams = false

export function generateStaticParams() {
  return BOOK_PATTERNS.map(p => ({ slug: patternSlug(p.no) }))
}

export async function generateMetadata({ params }: PageProps<'/audio/[slug]'>): Promise<Metadata> {
  const n = parsePatternSlug((await params).slug)
  if (!n) return {}
  const p = BOOK_PATTERNS[n - 1]
  return {
    title: `#${String(n).padStart(3, '0')} ${p.pattern} — K-PATTO Audio`,
    description: `${p.english} Listen to three example sentences with native Korean audio.`,
    // 책 부록 페이지 — 색인 제외
    robots: { index: false, follow: true },
  }
}

export default async function AudioPatternPage({ params }: PageProps<'/audio/[slug]'>) {
  const n = parsePatternSlug((await params).slug)
  if (!n) notFound()
  const p = BOOK_PATTERNS[n - 1]

  return (
    <PatternPlayer
      no={n}
      total={BOOK_PATTERNS.length}
      pattern={p.pattern}
      english={p.english}
      examples={p.examples.map((e, i) => ({ ...e, src: bookExampleAudio(p.slug, i) }))}
      prevHref={n > 1 ? `/audio/${patternSlug(n - 1)}` : null}
      nextHref={n < BOOK_PATTERNS.length ? `/audio/${patternSlug(n + 1)}` : null}
    />
  )
}
