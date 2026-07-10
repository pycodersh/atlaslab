'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getStoryProgressList, type StoryProgressItem } from '@/lib/srs/engine'
import { getStoryActivity } from '@/lib/srs/engine'
import { magazineStories } from '@/data/magazine-stories'

const STATUS_COLOR: Record<string, string> = {
  new: 'var(--pm2)', learning: '#E67E22', review: 'var(--pa)', mastered: '#27AE60',
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function StoryActivityDetail({ storyId, storyTitle }: { storyId: number; storyTitle: string }) {
  const story = magazineStories.find(s => s.id === storyId)
  const patternIds = story?.patterns.map(p => p.id) ?? []
  const activity = getStoryActivity(storyId, storyTitle, patternIds)

  return (
    <div style={{
      margin: '4px 0 10px', padding: '12px 14px',
      background: 'var(--pc)', borderRadius: 10,
    }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--pm2)' }}>
          Viewed <strong style={{ color: 'var(--pt)' }}>{activity.viewCount}×</strong>
        </span>
        <span style={{ fontSize: 11, color: 'var(--pm2)' }}>
          Reviews <strong style={{ color: 'var(--pt)' }}>{activity.reviewsCompleted}/{activity.stages.length}</strong>
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
          color: STATUS_COLOR[activity.status] ?? 'var(--pm2)',
        }}>
          {activity.status}
        </span>
      </div>
      {activity.nextReviewAt && (
        <p style={{ fontSize: 10, color: 'var(--pm)', margin: '0 0 8px' }}>
          Next review: <strong style={{ color: 'var(--pt)' }}>{fmtDate(activity.nextReviewAt.slice(0, 10))}</strong>
        </p>
      )}
      {activity.stages.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {activity.stages.map((stage, i) => (
            <div key={i} style={{
              padding: '3px 7px', borderRadius: 5,
              background: stage.status === 'new' ? 'var(--pd)' : `${STATUS_COLOR[stage.status]}22`,
              border: `1px solid ${STATUS_COLOR[stage.status] ?? 'var(--pd)'}33`,
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                color: STATUS_COLOR[stage.status] ?? 'var(--pm2)',
              }}>
                P{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AllStoriesProgressPage() {
  const router = useRouter()
  const [list, setList] = useState<StoryProgressItem[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'mastered'>('all')

  useEffect(() => { setList(getStoryProgressList()) }, [])

  const filtered = list.filter(item => {
    if (filter === 'active')  return item.status !== 'mastered'
    if (filter === 'mastered') return item.status === 'mastered'
    return true
  })

  const activeCount  = list.filter(i => i.status !== 'mastered').length
  const masteredCount = list.filter(i => i.status === 'mastered').length

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'transparent' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: `calc(${NAV_HEIGHT}px + 28px)`,
        paddingLeft: 24, paddingRight: 24, paddingBottom: 80,
        boxSizing: 'border-box',
      }}>
        {/* Back + Title */}
        <div style={{ marginBottom: 32 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 12, fontWeight: 600, color: 'var(--pm2)',
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={2} />
            Progress
          </button>

          <p className="font-playfair" style={{
            fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--pt)', margin: '0 0 10px',
          }}>
            All Stories
          </p>
          <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.6 }}>
            {list.length} stories started · {masteredCount} mastered
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 12, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* Filter tabs */}
        {list.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {([
              ['all',      `All (${list.length})`],
              ['active',   `Active (${activeCount})`],
              ['mastered', `Mastered (${masteredCount})`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: 'none',
                  background: filter === key ? 'var(--pa)' : 'var(--pc)',
                  color: filter === key ? '#fff' : 'var(--pm2)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Story list */}
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--pm2)', paddingTop: 16 }}>
            No stories here yet.
          </p>
        ) : (
          <div>
            {filtered.map((item) => {
              const isExpanded = expanded === item.storyId
              const isMastered = item.status === 'mastered'

              return (
                <div key={item.storyId}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : item.storyId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '13px 0', borderBottom: '1px solid var(--pd)',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                      color: 'var(--pm2)', width: 22, flexShrink: 0,
                    }}>
                      {String(item.storyId).padStart(2, '0')}
                    </span>

                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.storyTitle}
                    </span>

                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} style={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                          background: n <= item.dots
                            ? (STATUS_COLOR[item.status] ?? 'var(--pa)')
                            : 'var(--pd)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>

                    {isMastered ? (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#27AE60',
                        letterSpacing: '0.1em', width: 54, textAlign: 'right', flexShrink: 0,
                      }}>
                        MASTERED
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--pm2)',
                        fontVariantNumeric: 'tabular-nums', width: 22, textAlign: 'right', flexShrink: 0,
                      }}>
                        {item.dots}/5
                      </span>
                    )}

                    <ChevronRight style={{
                      width: 12, height: 12, color: 'var(--pm2)', flexShrink: 0,
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s',
                    }} strokeWidth={2} />
                  </button>

                  {isExpanded && (
                    <StoryActivityDetail storyId={item.storyId} storyTitle={item.storyTitle} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
