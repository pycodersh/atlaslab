'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Lock } from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { getRecord } from '@/lib/srs/storage'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'

const T1    = '#111111'
const T2    = '#999999'
const DIV   = '#F2F2F2'
const ACCENT = '#D4873A'
const MAX_VIEWS = 10
const FREE_EPISODES = 5

function EpisodeStatus({ views, done }: { views: number; done: boolean }) {
  if (views >= MAX_VIEWS) {
    return (
      <span style={{ fontSize: 12, color: ACCENT, fontWeight: 700 }}>
        Mastered! 🏆
      </span>
    )
  }
  if (views > 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: MAX_VIEWS }, (_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < views ? ACCENT : '#E0E0E0',
              flexShrink: 0,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>{views}/{MAX_VIEWS}</span>
      </div>
    )
  }
  if (done) {
    return <span style={{ fontSize: 12, color: ACCENT }}>In progress...</span>
  }
  return <span style={{ fontSize: 12, color: T2 }}>Not started yet</span>
}

export default function KPattoStoryListPage() {
  const { prefs } = usePreferences()
  const { isPro } = useKPattoSubscription()

  const [storyStates, setStoryStates] = useState<Record<string, { views: number; done: boolean }>>({})

  useEffect(() => {
    const next: Record<string, { views: number; done: boolean }> = {}
    for (const s of ALL_STORIES) {
      const rec = getRecord('story', String(s.episode))
      next[s.id] = {
        views: rec?.repeatCount ?? 0,
        done: !!(rec?.lastPracticedAt),
      }
    }
    setStoryStates(next)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 0' }}>

        {/* ── 공개 에피소드 ── */}
        {ALL_STORIES.map((story) => {
          const state = storyStates[story.id]
          const views = state?.views ?? 0
          const locked = story.episode > FREE_EPISODES && !isPro

          return (
            <div
              key={story.id}
              style={{
                display: 'flex', alignItems: 'stretch',
                borderRadius: 16,
                border: '1px solid #E0E0E0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                background: locked ? '#FAFAFA' : '#FFFFFF',
                overflow: 'hidden',
                minHeight: 100,
                opacity: locked ? 0.75 : 1,
              }}
            >
              {/* Thumbnail */}
              <div style={{ padding: '10px 0 10px 10px', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 12, overflow: 'hidden', background: '#F7F7F7' }}>
                  <Image
                    src={story.thumbnail_url ?? '/kpatto/banners/ep1.png'}
                    alt={story.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center center', filter: locked ? 'grayscale(0.4)' : 'none' }}
                    sizes="120px"
                  />
                  {locked && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Lock size={20} color="#FFFFFF" strokeWidth={2} />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, padding: '12px 8px 12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: locked ? T2 : ACCENT }}>EP {String(story.episode).padStart(2, '0')}</span>
                  <span style={{ color: T2, fontWeight: 400 }}> · </span>
                  {story.title}
                </div>
                {locked
                  ? <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>Pro 전용</span>
                  : <EpisodeStatus views={views} done={state?.done ?? false} />
                }
              </div>

              {/* Chevron or Lock */}
              <Link
                href={`/kpatto/story/${story.id}`}
                style={{ display: 'flex', alignItems: 'center', padding: '0 12px', textDecoration: 'none', flexShrink: 0 }}
              >
                <ChevronRight size={20} color="#999999" />
              </Link>
            </div>
          )
        })}


        {/* Coming soon notice */}
        <div style={{
          margin: '4px 0 0',
          padding: '14px 16px',
          background: '#FFFBF2',
          border: '1px solid #F0D9A8',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📅</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8B6914' }}>EP 11+ Coming July 31</div>
            <div style={{ fontSize: 12, color: '#B38A30', marginTop: 2 }}>New episodes drop every week. Stay tuned!</div>
          </div>
        </div>

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
