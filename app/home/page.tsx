'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Flame, BookOpen, Zap } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import { getAllRecords, getStreak } from '@/lib/srs/storage'
import { getMissionItems } from '@/lib/srs/engine'
import { getLastPosition } from '@/lib/last-position'
import { usePreferences } from '@/contexts/PreferencesContext'

function getDateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function getCategoryLabel(storyId: number) {
  const cats = ['Lifestyle', 'Daily Life', 'Reading', 'Study', 'Food & Café', 'People', 'Morning', 'Travel']
  return cats[(storyId - 1) % cats.length]
}

export default function HomePage() {
  const router = useRouter()
  const { prefs } = usePreferences()

  const [firstHref, setFirstHref]     = useState('/stories/1')
  const [missionDone, setMissionDone] = useState(0)
  const [missionTotal, setMissionTotal] = useState(0)
  const [streak, setStreak]           = useState(0)
  const [learnedIds, setLearnedIds]   = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    const records = getAllRecords()
    const learned = new Set(
      records.filter(r => r.itemType === 'story').map(r => r.itemId)
    )
    setLearnedIds(learned)

    const items = getMissionItems()
    setMissionDone(items.filter(i => i.done).length)
    setMissionTotal(items.length)

    try { setStreak(getStreak()) } catch { setStreak(0) }

    const missionItems = items
    const firstPending = missionItems.find(i => !i.done)
    if (firstPending) {
      setFirstHref(firstPending.href)
    } else {
      const lastPos = getLastPosition()
      if (lastPos) {
        setFirstHref(`/stories/${lastPos.storyId}${lastPos.view === 'patterns' ? '?v=p' : ''}`)
      } else {
        const next = magazineStories.find(s => !learned.has(String(s.id))) ?? magazineStories[0]
        setFirstHref(`/stories/${next.id}`)
      }
    }
  }, [])

  const featuredStory = magazineStories[0]
  const otherStories  = magazineStories.slice(1, 9)

  const FILTERS = ['All', 'New', 'In Progress', 'Completed']
  const filtered = otherStories.filter(s => {
    if (activeFilter === 'Completed') return learnedIds.has(String(s.id))
    if (activeFilter === 'New')       return !learnedIds.has(String(s.id))
    if (activeFilter === 'In Progress') return learnedIds.has(String(s.id))
    return true
  })

  const missionPct = missionTotal > 0 ? Math.round((missionDone / missionTotal) * 100) : 0
  const allDone    = missionTotal > 0 && missionDone === missionTotal

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        paddingTop: 'var(--pnav-h)',
        paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)`,
      }}>

        {/* ── Date header ────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--pm)',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            {getDateLabel()}
          </p>
        </div>

        {/* ── Hero Card ──────────────────────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/stories/${featuredStory.id}`)}
          onKeyDown={e => e.key === 'Enter' && router.push(`/stories/${featuredStory.id}`)}
          style={{
            position: 'relative',
            margin: '12px 20px 0',
            borderRadius: 20,
            overflow: 'hidden',
            height: 380,
            cursor: 'pointer',
          }}
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featuredStory.imageUrl}
            alt={featuredStory.imageAlt}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 30%',
              display: 'block',
            }}
          />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.72) 100%)',
          }} />

          {/* Top: Category chip */}
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <span style={{
              display: 'inline-block',
              padding: '5px 12px',
              background: 'var(--pa)',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#fff',
              textTransform: 'uppercase',
            }}>
              {getCategoryLabel(featuredStory.id)}
            </span>
          </div>

          {/* Top right: story number */}
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: 'rgba(255,255,255,0.6)',
            }}>
              STORY {String(featuredStory.id).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom content */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
            <p
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: '#fff',
                margin: '0 0 6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {featuredStory.title}
            </p>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
              margin: '0 0 16px',
              lineHeight: 1.4,
            }}>
              {featuredStory.subtitleKo}
            </p>

            {/* CTA button */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); router.push(firstHref) }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.28)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1.5px solid rgba(255,255,255,0.55)',
                borderRadius: 999,
                padding: '11px 22px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {allDone ? 'All done today! 🎉' : 'Continue Learning'}
              {!allDone && <ArrowRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* ── Quick Stats Row ─────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          margin: '14px 20px 0',
        }}>
          {/* Streak */}
          <div className="glass-card-sm" style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Flame style={{ width: 14, height: 14, color: '#E06030' }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.04em' }}>
                Streak
              </span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
              {streak}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)', marginLeft: 2 }}>d</span>
            </p>
          </div>

          {/* Mission progress */}
          <div className="glass-card-sm" style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap style={{ width: 14, height: 14, color: 'var(--pa)' }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.04em' }}>
                Today
              </span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: allDone ? '#27AE60' : 'var(--pt)', margin: 0, lineHeight: 1 }}>
              {missionPct}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)', marginLeft: 1 }}>%</span>
            </p>
          </div>

          {/* Stories */}
          <div className="glass-card-sm" style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <BookOpen style={{ width: 14, height: 14, color: '#4A90E2' }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.04em' }}>
                Stories
              </span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
              {learnedIds.size}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)', marginLeft: 1 }}>/{magazineStories.length}</span>
            </p>
          </div>
        </div>

        {/* ── Filter chips ────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '20px 20px 0',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  padding: '8px 18px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'var(--pa)' : 'var(--pc)',
                  color: isActive ? '#fff' : 'var(--pm)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* ── Story Grid ──────────────────────────────────────────────────── */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{
              fontSize: 18, fontWeight: 800,
              color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}>
              Stories
            </p>
            <button
              type="button"
              onClick={() => router.push('/stories/1')}
              style={{
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: 'var(--pa)',
              }}
            >
              See All <ChevronRight style={{ width: 13, height: 13 }} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            {(filtered.length > 0 ? filtered : otherStories).map(story => {
              const done = learnedIds.has(String(story.id))
              return (
                <div
                  key={story.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/stories/${story.id}`)}
                  onKeyDown={e => e.key === 'Enter' && router.push(`/stories/${story.id}`)}
                  className="glass-card-sm"
                  style={{
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: 18,
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', paddingTop: '64%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.imageUrl}
                      alt={story.imageAlt}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Category badge */}
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: done ? 'rgba(39,174,96,0.9)' : 'rgba(139,34,70,0.88)',
                        borderRadius: 8,
                        fontSize: 8.5,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                      }}>
                        {done ? 'DONE' : getCategoryLabel(story.id)}
                      </span>
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ padding: '10px 12px 12px' }}>
                    <p style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: 'var(--pm2)',
                      margin: '0 0 3px',
                      textTransform: 'uppercase',
                    }}>
                      Story {String(story.id).padStart(2, '0')}
                    </p>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--pt)',
                      margin: '0 0 2px',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {story.title}
                    </p>
                    <p style={{
                      fontSize: 11,
                      color: 'var(--pm)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}>
                      {story.patterns.length} patterns
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
