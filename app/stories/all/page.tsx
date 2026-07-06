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

const DOT_COLOR: Record<StoryLabel, string> = {
  Today:   '#6B90D9',
  Reading: '#6B90D9',
  Review:  '#C08B30',
  Done:    '#3DAD6A',
  New:     '#9B9BA0',
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
        paddingTop: 8,
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
            const dotColor = DOT_COLOR[label]
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
                  {/* Top gradient overlay for chip readability */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px',
                      background: 'rgba(255,255,255,0.42)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.75)',
                      borderRadius: 999,
                      fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em',
                      color: '#555A61',
                      textShadow: '0 1px 1px rgba(255,255,255,.55)',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
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
