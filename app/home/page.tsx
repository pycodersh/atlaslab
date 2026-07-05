'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Flame, X, BookOpen, RotateCcw, Pencil } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import type { MagazineStory } from '@/types/magazine'
import { getAllRecords, getStreak, todayStr, addDays } from '@/lib/srs/storage'
import { getMissionItems } from '@/lib/srs/engine'
import { getLastPosition } from '@/lib/last-position'
import { EDITOR_NOTES } from '@/data/editor-notes'

function getDateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function getDailyTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return EDITOR_NOTES[dayOfYear % EDITOR_NOTES.length]
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

  const [firstHref, setFirstHref]         = useState('/stories/1')
  const [streak, setStreak]               = useState(0)
  const [todayStory, setTodayStory]       = useState<MagazineStory>(magazineStories[0])
  const [newStoryIds, setNewStoryIds]     = useState<number[]>([])
  const [reviewStoryIds, setReviewStoryIds] = useState<number[]>([])
  const [scheduledList, setScheduledList] = useState<ScheduledStory[]>([])
  const [allDone, setAllDone]             = useState(false)
  const [tipOpen, setTipOpen]             = useState(false)

  const dailyTip = getDailyTip()

  useEffect(() => {
    const records = getAllRecords()
    const today   = todayStr()
    const tomorrow = addDays(today, 1)

    try { setStreak(getStreak()) } catch { setStreak(0) }

    const missionItems = getMissionItems()
    const missionMap = new Map(missionItems.map(i => [i.storyId, i]))

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

    const heroMission = missionItems.find(i => i.type === 'new_story' || i.type === 'in_progress_story')
    const heroData = heroMission
      ? magazineStories.find(s => s.id === heroMission.storyId) ?? magazineStories[0]
      : magazineStories[0]
    setTodayStory(heroData)

    setAllDone(missionItems.length > 0 && missionItems.every(i => i.done))

    // New vs Review story IDs
    const newIds = missionItems
      .filter(i => i.type === 'new_story' || i.type === 'in_progress_story')
      .map(i => i.storyId)
    const reviewIds = missionItems
      .filter(i => i.type === 'review_pattern')
      .map(i => i.storyId)
    setNewStoryIds(newIds)
    setReviewStoryIds(reviewIds)

    const storyNextReview: Record<number, string> = {}
    for (const r of records) {
      if (r.itemType !== 'pattern' || !r.storyId || !r.nextReviewAt) continue
      const cur = storyNextReview[r.storyId]
      if (!cur || r.nextReviewAt < cur) storyNextReview[r.storyId] = r.nextReviewAt
    }

    const learnedIds = new Set(
      records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
    )

    const list: ScheduledStory[] = []

    for (const item of missionItems) {
      const story = magazineStories.find(s => s.id === item.storyId)
      if (!story) continue
      const label: StoryLabel =
        item.type === 'review_pattern'    ? 'Review' :
        item.type === 'in_progress_story' ? 'Reading' : 'Today'
      list.push({ story, label, href: item.href, done: item.done })
    }

    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) {
        list.push({ story: s, label: 'Tomorrow', href: `/stories/${s.id}`, done: false })
      }
    }

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

  const tipTitle = dailyTip?.title?.ko ?? dailyTip?.title?.en ?? ''
  const tipBody  = dailyTip?.body?.ko ?? dailyTip?.body?.en ?? []
  const tipRemember = dailyTip?.oneThingToRemember?.ko ?? dailyTip?.oneThingToRemember?.en ?? ''

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
            height: 360,
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
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.76) 100%)',
          }} />

          {/* Top-left: story number */}
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.6)' }}>
              STORY {String(todayStory.id).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom content — title left, Continue right */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 18px 18px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
          }}>
            {/* Left: title + subtitle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em',
                lineHeight: 1.2, color: '#fff', margin: '0 0 4px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {todayStory.title}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              }}>
                {todayStory.subtitleKo}
              </p>
            </div>

            {/* Right: Continue button */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); router.push(firstHref) }}
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.45)',
                borderRadius: 999, padding: '9px 16px',
                cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.4)',
                transition: 'all 0.15s', letterSpacing: '0.01em', whiteSpace: 'nowrap',
              }}
            >
              {allDone ? '완료 🎉' : 'Continue'}
              {!allDone && <ArrowRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* ── Stats — [Today Story] [Streak] ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '12px 20px 0' }}>

          {/* Today Story card — New / Review */}
          <div className="glass-card-sm" style={{ padding: '13px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              <BookOpen style={{ width: 12, height: 12, color: 'var(--pm2)' }} strokeWidth={2} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pm2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today Story</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {/* New */}
              <div>
                <p style={{ fontSize: 8, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 3px' }}>New</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.01em' }}>
                  {newStoryIds.length > 0
                    ? newStoryIds.map(id => String(id).padStart(2, '0')).join(' · ')
                    : <span style={{ fontSize: 13, color: 'var(--pm2)', fontWeight: 500 }}>—</span>
                  }
                </p>
              </div>
              {/* Review */}
              {reviewStoryIds.length > 0 && (
                <div>
                  <p style={{ fontSize: 8, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 3px' }}>
                    Review
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {reviewStoryIds.map(id => String(id).padStart(2, '0')).join(' · ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Streak card */}
          <div className="glass-card-sm" style={{ padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Flame style={{ width: 12, height: 12, color: '#E06030' }} strokeWidth={2} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pm2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Streak</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {streak}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)', marginLeft: 2 }}>d</span>
            </p>
          </div>
        </div>

        {/* ── Editor Tip ───────────────────────────────────────────────── */}
        {dailyTip && (
          <div style={{ padding: '14px 20px 0' }}>
            <button
              type="button"
              onClick={() => setTipOpen(true)}
              className="glass-card-sm"
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '13px 16px', border: 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <Pencil style={{ width: 15, height: 15, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.8} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm2)', margin: '0 0 3px', textTransform: 'uppercase' }}>
                  Editor Tip
                </p>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--pt2)', margin: 0, lineHeight: 1.35,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                }}>
                  {tipTitle}
                </p>
              </div>
              <ChevronRight style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* ── Scheduled Stories ─────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{
              fontSize: 17, fontWeight: 800, color: 'var(--pt)',
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

      {/* ── Editor Tip Modal ─────────────────────────────────────────────── */}
      {tipOpen && dailyTip && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(20,22,30,0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 env(safe-area-inset-bottom, 0px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setTipOpen(false) }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%', maxWidth: 560,
              maxHeight: '82dvh', overflowY: 'auto',
              borderRadius: '24px 24px 0 0',
              padding: '6px 0 0',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--pd)' }} />
            </div>

            <div style={{ padding: '8px 24px 32px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <p style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                    color: 'var(--pm2)', margin: '0 0 6px', textTransform: 'uppercase',
                  }}>
                    Editor Tip · {dailyTip.partTitle}
                  </p>
                  <p style={{
                    fontSize: 'clamp(1.1rem, 4.5vw, 1.3rem)', fontWeight: 800,
                    color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}>
                    {tipTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTipOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--pc)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={2} />
                </button>
              </div>

              {/* Body paragraphs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {tipBody.map((para, i) => (
                  <p key={i} style={{
                    fontSize: 14, lineHeight: 1.65, color: 'var(--pt2)',
                    margin: 0, fontWeight: i === 0 ? 500 : 400,
                  }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* One thing to remember */}
              {tipRemember && (
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(109,141,255,0.06)',
                  border: '1px solid rgba(109,141,255,0.14)',
                  borderRadius: 14,
                }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', margin: '0 0 5px', textTransform: 'uppercase' }}>
                    One thing to remember
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: 0, lineHeight: 1.5 }}>
                    {tipRemember}
                  </p>
                </div>
              )}

              {/* Research refs */}
              {(dailyTip.research ?? []).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {dailyTip.research.map((ref, i) => (
                    <p key={i} style={{ fontSize: 10, color: 'var(--pm2)', margin: '0 0 4px', lineHeight: 1.4 }}>
                      {ref.author} ({ref.year}) — {ref.brief?.ko ?? ref.brief?.en ?? ''}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
