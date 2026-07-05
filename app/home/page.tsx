'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Flame, BookOpen } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import type { MagazineStory } from '@/types/magazine'
import { getAllRecords, getStreak, todayStr, addDays } from '@/lib/srs/storage'
import { getMissionItems } from '@/lib/srs/engine'
import { getLastPosition } from '@/lib/last-position'

function getDateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

type StoryLabel = 'Today' | 'Reading' | 'Review' | 'Tomorrow' | 'Upcoming' | 'Done'

type ScheduledStory = {
  story: MagazineStory
  label: StoryLabel
  href: string
  done: boolean
}

const LABEL_STYLE: Record<StoryLabel, { bg: string; color: string }> = {
  Today:    { bg: 'var(--pa)',               color: '#fff' },
  Reading:  { bg: 'rgba(109,141,255,0.72)',  color: '#fff' },
  Review:   { bg: 'rgba(255,165,50,0.85)',   color: '#fff' },
  Tomorrow: { bg: 'rgba(130,130,150,0.75)',  color: '#fff' },
  Upcoming: { bg: 'rgba(160,160,180,0.55)',  color: '#fff' },
  Done:     { bg: 'rgba(39,174,96,0.88)',    color: '#fff' },
}

export default function HomePage() {
  const router = useRouter()

  const [firstHref, setFirstHref]     = useState('/stories/1')
  const [streak, setStreak]           = useState(0)
  const [todayStory, setTodayStory]   = useState<MagazineStory>(magazineStories[0])
  const [scheduledList, setScheduledList] = useState<ScheduledStory[]>([])
  const [allDone, setAllDone]         = useState(false)

  useEffect(() => {
    const records = getAllRecords()
    const today   = todayStr()
    const tomorrow = addDays(today, 1)

    // Streak
    try { setStreak(getStreak()) } catch { setStreak(0) }

    // Mission items
    const missionItems = getMissionItems()
    const missionMap = new Map(missionItems.map(i => [i.storyId, i]))

    // firstHref
    const firstPending = missionItems.find(i => !i.done)
    if (firstPending) {
      setFirstHref(firstPending.href)
    } else {
      const lastPos = getLastPosition()
      if (lastPos) {
        setFirstHref(`/stories/${lastPos.storyId}${lastPos.view === 'patterns' ? '?v=p' : ''}`)
      } else {
        const learnedSet = new Set(
          records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
        )
        const next = magazineStories.find(s => !learnedSet.has(s.id)) ?? magazineStories[0]
        setFirstHref(`/stories/${next.id}`)
      }
    }

    // Today's hero story = new_story or in_progress_story from mission
    const heroMission = missionItems.find(i => i.type === 'new_story' || i.type === 'in_progress_story')
    const heroData = heroMission
      ? magazineStories.find(s => s.id === heroMission.storyId) ?? magazineStories[0]
      : magazineStories[0]
    setTodayStory(heroData)

    // All done?
    setAllDone(missionItems.length > 0 && missionItems.every(i => i.done))

    // Per-story earliest next review date
    const storyNextReview: Record<number, string> = {}
    for (const r of records) {
      if (r.itemType !== 'pattern' || !r.storyId || !r.nextReviewAt) continue
      const cur = storyNextReview[r.storyId]
      if (!cur || r.nextReviewAt < cur) storyNextReview[r.storyId] = r.nextReviewAt
    }

    // Learned story IDs
    const learnedIds = new Set(
      records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
    )

    const list: ScheduledStory[] = []

    // 1. Mission items
    for (const item of missionItems) {
      const story = magazineStories.find(s => s.id === item.storyId)
      if (!story) continue
      const label: StoryLabel =
        item.type === 'review_pattern'    ? 'Review' :
        item.type === 'in_progress_story' ? 'Reading' : 'Today'
      list.push({ story, label, href: item.href, done: item.done })
    }

    // 2. Tomorrow stories (review scheduled for tomorrow)
    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) {
        list.push({ story: s, label: 'Tomorrow', href: `/stories/${s.id}`, done: false })
      }
    }

    // 3. Upcoming (not started)
    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) continue
      if (!learnedIds.has(s.id)) {
        list.push({ story: s, label: 'Upcoming', href: `/stories/${s.id}`, done: false })
      }
    }

    setScheduledList(list.slice(0, 8))
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        paddingTop: 'var(--pnav-h)',
        paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)`,
      }}>

        {/* ── Date header ─────────────────────────────────────────────── */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            color: 'var(--pm)', textTransform: 'uppercase', margin: 0,
          }}>
            {getDateLabel()}
          </p>
        </div>

        {/* ── Hero Card ───────────────────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/stories/${todayStory.id}`)}
          onKeyDown={e => e.key === 'Enter' && router.push(`/stories/${todayStory.id}`)}
          style={{
            position: 'relative',
            margin: '12px 20px 0',
            borderRadius: 20,
            overflow: 'hidden',
            height: 380,
            cursor: 'pointer',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={todayStory.imageUrl}
            alt={todayStory.imageAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.72) 100%)',
          }} />

          {/* Top-left: Today badge */}
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <span style={{
              display: 'inline-block', padding: '5px 12px',
              background: 'var(--pa)', borderRadius: 20,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: '#fff', textTransform: 'uppercase',
            }}>
              Today
            </span>
          </div>

          {/* Top-right: story number */}
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.6)' }}>
              STORY {String(todayStory.id).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom content */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
            <p style={{
              fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em',
              lineHeight: 1.15, color: '#fff', margin: '0 0 6px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}>
              {todayStory.title}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '0 0 16px', lineHeight: 1.4 }}>
              {todayStory.subtitleKo}
            </p>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); router.push(firstHref) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.28)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1.5px solid rgba(255,255,255,0.55)',
                borderRadius: 999, padding: '11px 22px',
                cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.45)',
                transition: 'all 0.15s', letterSpacing: '0.01em',
              }}
            >
              {allDone ? 'All done today! 🎉' : 'Continue Learning'}
              {!allDone && <ArrowRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* ── Quick Stats — 2 cards ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 20px 0' }}>
          {/* Streak */}
          <div className="glass-card-sm" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Flame style={{ width: 14, height: 14, color: '#E06030' }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.04em' }}>Streak</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
              {streak}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)', marginLeft: 2 }}>d</span>
            </p>
          </div>

          {/* Today Story */}
          <div className="glass-card-sm" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <BookOpen style={{ width: 14, height: 14, color: 'var(--pa)' }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.04em' }}>Today Story</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)', marginRight: 1 }}>#</span>
              {String(todayStory.id).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* ── Scheduled Stories ─────────────────────────────────────────── */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{
              fontSize: 18, fontWeight: 800, color: 'var(--pt)',
              margin: 0, letterSpacing: '-0.01em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}>
              Stories
            </p>
            <button
              type="button"
              onClick={() => router.push('/stories/all')}
              style={{
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: 'var(--pm)',
              }}
            >
              See All <ChevronRight style={{ width: 13, height: 13 }} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {scheduledList.map(({ story, label, href, done }) => {
              const ls = LABEL_STYLE[done ? 'Done' : label]
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
                  {/* Image */}
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
                        {done ? 'Done' : label}
                      </span>
                    </div>
                  </div>

                  {/* Text */}
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
    </div>
  )
}
