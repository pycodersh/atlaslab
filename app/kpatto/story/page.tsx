'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import { getRecord } from '@/lib/srs/storage'
import { getUI } from '@/lib/kpatto/ui-strings'

const T1   = '#111111'
const T2   = '#999999'
const DIV  = '#F2F2F2'

const COMING_SOON_EPISODES = [
  { episode: 2, title: '편의점에서' },
  { episode: 3, title: '지하철에서' },
  { episode: 4, title: '식당에서' },
]

export default function KPattoStoryListPage() {
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)

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

      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: '-0.03em' }}>
          Stories
        </div>
      </div>

      <div style={{ height: 1, background: DIV }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── 공개된 에피소드 ── */}
        {ALL_STORIES.map((story) => {
          const state = storyStates[story.id]
          const patterns = KPATTO_PATTERNS.filter(p => story.tags.includes(p.id))
          const isDone = state?.done ?? false
          const views  = state?.views ?? 0

          return (
            <Link
              key={story.id}
              href={`/kpatto/story/${story.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                margin: '16px 16px 0',
                borderRadius: 16,
                border: `1px solid ${DIV}`,
                overflow: 'hidden',
                background: '#FFFFFF',
              }}>
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '5/2', background: '#F7F7F7', overflow: 'hidden' }}>
                  <Image
                    src="/kpatto/ep-001/strip.png"
                    alt={story.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'left center' }}
                    sizes="(max-width: 480px) 100vw, 480px"
                  />
                  {/* Status badge */}
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: isDone ? '#111111' : 'rgba(17,17,17,0.7)',
                    color: '#FFFFFF',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    padding: '4px 8px', borderRadius: 6,
                  }}>
                    {isDone ? 'DONE' : 'IN PROGRESS'}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '14px 16px 16px' }}>
                  {/* EP label + title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                      color: T2, background: '#F2F2F2',
                      padding: '3px 7px', borderRadius: 5,
                    }}>
                      EP {String(story.episode).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: T1 }}>
                      {story.title}
                    </span>
                  </div>

                  {/* Pattern chips */}
                  {patterns.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {patterns.map(p => (
                        <span key={p.id} style={{
                          fontSize: 12, fontWeight: 600, color: T1,
                          background: '#F7F7F7',
                          padding: '4px 10px', borderRadius: 20,
                        }}>
                          {p.korean}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: T2 }}>
                      {ui.st_meta(story.tags.length, story.vocabulary_ids.length, story.panels.length)}
                    </span>
                    {views > 0 && (
                      <span style={{ fontSize: 12, color: T2, marginLeft: 'auto' }}>
                        👁 {views}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {/* ── 잠금 에피소드 ── */}
        {COMING_SOON_EPISODES.map((ep) => (
          <div
            key={ep.episode}
            style={{
              margin: '12px 16px 0',
              borderRadius: 16,
              border: `1px solid ${DIV}`,
              overflow: 'hidden',
              background: '#FAFAFA',
              opacity: 0.6,
            }}
          >
            {/* Placeholder thumbnail */}
            <div style={{
              width: '100%', aspectRatio: '5/2',
              background: '#F2F2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28 }}>🔒</span>
            </div>

            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                  color: T2, background: '#EBEBEB',
                  padding: '3px 7px', borderRadius: 5,
                }}>
                  EP {String(ep.episode).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: T2 }}>
                  {ep.title}
                </span>
              </div>
              <span style={{
                display: 'inline-block',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                color: T2, border: `1px solid ${DIV}`,
                padding: '3px 9px', borderRadius: 20,
              }}>
                Coming Soon
              </span>
            </div>
          </div>
        ))}

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
