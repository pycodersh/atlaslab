'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WebtoonEditor } from '@/components/kpatto/WebtoonEditor'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import type { WebtoonEpisodeData } from '@/data/kpatto/webtoon-types'

interface PageProps {
  params: Promise<{ episodeId: string }>
}

/** Normalize numeric shorthand (11 → kp-ep-011) so /kpatto/editor/11 works. */
function normalizeEpId(raw: string): string {
  if (/^\d+$/.test(raw)) return `kp-ep-${raw.padStart(3, '0')}`
  return raw
}

export default function KPattoEditorPage({ params }: PageProps) {
  const { episodeId: rawId } = use(params)
  const episodeId = normalizeEpId(rawId)
  const [episode, setEpisode] = useState<WebtoonEpisodeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use admin API (service_role) so all episodes including EP11+ are accessible.
    // The endpoint is blocked by middleware in production; local dev passes freely.
    fetch(`/api/admin/episode-content?id=${episodeId}`)
      .then(r => r.ok ? r.json() as Promise<WebtoonEpisodeData> : null)
      .then(ep => {
        setEpisode(ep)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [episodeId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #1e1b4b', borderTop: '3px solid #a5b4fc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

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

      <div style={{ maxWidth: 430, margin: '0 auto', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
        <WebtoonEditor episode={episode} initialEditMode />
      </div>
    </div>
  )
}
