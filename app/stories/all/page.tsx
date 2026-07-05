'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import { getAllRecords } from '@/lib/srs/storage'
import { getMissionItems } from '@/lib/srs/engine'

type StoryLabel = 'Today' | 'Reading' | 'Review' | 'Done' | 'New'

const LABEL_STYLE: Record<StoryLabel, { bg: string; color: string }> = {
  Today:   { bg: 'var(--pa)',              color: '#fff' },
  Reading: { bg: 'rgba(109,141,255,0.72)', color: '#fff' },
  Review:  { bg: 'rgba(255,165,50,0.85)',  color: '#fff' },
  Done:    { bg: 'rgba(39,174,96,0.88)',   color: '#fff' },
  New:     { bg: 'rgba(160,160,180,0.50)', color: '#fff' },
}

export default function AllStoriesPage() {
  const router = useRouter()
  const [labelMap, setLabelMap] = useState<Record<number, StoryLabel>>({})

  useEffect(() => {
    const records = getAllRecords()
    const missionItems = getMissionItems()
    const missionMap = new Map(missionItems.map(i => [i.storyId, i]))

    const learnedIds = new Set(
      records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
    )

    const map: Record<number, StoryLabel> = {}
    for (const s of magazineStories) {
      const mi = missionMap.get(s.id)
      if (mi) {
        map[s.id] =
          mi.type === 'review_pattern'    ? 'Review' :
          mi.type === 'in_progress_story' ? 'Reading' : 'Today'
      } else if (learnedIds.has(s.id)) {
        map[s.id] = 'Done'
      } else {
        map[s.id] = 'New'
      }
    }
    setLabelMap(map)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 560,
        margin: '0 auto',
        paddingTop: 'var(--pnav-h)',
        paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)`,
        paddingLeft: 20,
        paddingRight: 20,
        boxSizing: 'border-box',
      }}>

        {/* Back + Header */}
        <div style={{ paddingTop: 20, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--pm)', padding: 0, marginBottom: 16,
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} />
            <span style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase' }}>Back</span>
          </button>

          <p style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.2rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--pt)',
            margin: '0 0 6px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            All Stories
          </p>
          <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0 }}>
            {magazineStories.length} stories total
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {magazineStories.map(story => {
            const label = labelMap[story.id] ?? 'New'
            const ls = LABEL_STYLE[label]
            const href = label === 'Review' || label === 'Today' || label === 'Reading'
              ? `/stories/${story.id}?v=p`
              : `/stories/${story.id}`

            return (
              <div
                key={story.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(href)}
                onKeyDown={e => e.key === 'Enter' && router.push(href)}
                className="glass-card-sm"
                style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: 18 }}
              >
                <div style={{ position: 'relative', paddingTop: '64%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.imageUrl}
                    alt={story.imageAlt}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px',
                      background: ls.bg, color: ls.color,
                      borderRadius: 8, fontSize: 8.5, fontWeight: 700,
                      letterSpacing: '0.06em', backdropFilter: 'blur(4px)',
                    }}>
                      {label}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <p style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                    color: 'var(--pm2)', margin: '0 0 3px', textTransform: 'uppercase',
                  }}>
                    Story {String(story.id).padStart(2, '0')}
                  </p>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: 'var(--pt)',
                    margin: 0, lineHeight: 1.3,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {story.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
