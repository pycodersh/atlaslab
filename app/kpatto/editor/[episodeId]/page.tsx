'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WebtoonEditor } from '@/components/kpatto/WebtoonEditor'
import { WEBTOON_EPISODES } from '@/data/kpatto/episode-001-webtoon'

interface PageProps {
  params: Promise<{ episodeId: string }>
}

export default function KPattoEditorPage({ params }: PageProps) {
  const { episodeId } = use(params)
  const episode = WEBTOON_EPISODES[episodeId]
  if (!episode) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f22' }}>
      {/* Back bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1e1b4b', borderBottom: '1px solid #4338ca',
        padding: '0 16px', height: 52,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Link
          href={`/kpatto/story/${episodeId}`}
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#a5b4fc', flexShrink: 0 }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#a5b4fc' }}>
          EP {String(episode.episode).padStart(2, '0')} · {episode.title} — 말풍선 에디터
        </span>
      </div>

      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <WebtoonEditor episode={episode} initialEditMode />
      </div>
    </div>
  )
}
