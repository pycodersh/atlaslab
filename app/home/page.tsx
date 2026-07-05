'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Flame, X, Pencil, BookOpen, RotateCcw } from 'lucide-react'
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

type StoryLabel = 'Review' | 'Tomorrow' | 'Upcoming' | 'Done'

type ScheduledStory = {
  story: MagazineStory
  label: StoryLabel
  href: string
  done: boolean
}

// Chip gradient per status
const CHIP_GRADIENT: Record<StoryLabel | 'Done', string> = {
  Review:   'linear-gradient(135deg, rgba(192,139,48,0.72) 0%, rgba(210,160,60,0.55) 100%)',
  Tomorrow: 'linear-gradient(135deg, rgba(155,155,160,0.55) 0%, rgba(175,175,180,0.40) 100%)',
  Upcoming: 'linear-gradient(135deg, rgba(155,155,160,0.55) 0%, rgba(175,175,180,0.40) 100%)',
  Done:     'linear-gradient(135deg, rgba(61,173,106,0.72) 0%, rgba(80,195,120,0.55) 100%)',
}

export default function HomePage() {
  const router = useRouter()

  const [firstHref, setFirstHref]           = useState('/stories/1')
  const [streak, setStreak]                 = useState(0)
  const [todayStory, setTodayStory]         = useState<MagazineStory>(magazineStories[0])
  const [newStoryIds, setNewStoryIds]       = useState<number[]>([])
  const [reviewStoryIds, setReviewStoryIds] = useState<number[]>([])
  const [scheduledList, setScheduledList]   = useState<ScheduledStory[]>([])
  const [allDone, setAllDone]               = useState(false)
  const [tipOpen, setTipOpen]               = useState(false)

  const dailyTip = getDailyTip()

  useEffect(() => {
    const records  = getAllRecords()
    const today    = todayStr()
    const tomorrow = addDays(today, 1)

    try { setStreak(getStreak()) } catch { setStreak(0) }

    const missionItems = getMissionItems()
    const missionMap   = new Map(missionItems.map(i => [i.storyId, i]))

    // firstHref — first pending mission, or last position, or next unlearned
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

    // Hero story
    const heroMission = missionItems.find(i => i.type === 'new_story' || i.type === 'in_progress_story')
    const heroData    = heroMission
      ? magazineStories.find(s => s.id === heroMission.storyId) ?? magazineStories[0]
      : magazineStories[0]
    setTodayStory(heroData)

    setAllDone(missionItems.length > 0 && missionItems.every(i => i.done))

    // NEW / REVIEW story IDs for summary cards
    const newIds    = missionItems.filter(i => i.type === 'new_story' || i.type === 'in_progress_story').map(i => i.storyId)
    const reviewIds = missionItems.filter(i => i.type === 'review_pattern').map(i => i.storyId)
    setNewStoryIds(newIds)
    setReviewStoryIds(reviewIds)

    // Per-story earliest next review date
    const storyNextReview: Record<number, string> = {}
    for (const r of records) {
      if (r.itemType !== 'pattern' || !r.storyId || !r.nextReviewAt) continue
      const cur = storyNextReview[r.storyId]
      if (!cur || r.nextReviewAt < cur) storyNextReview[r.storyId] = r.nextReviewAt
    }

    const learnedIds = new Set(
      records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
    )

    // Stories list: Review + Upcoming only (no Today/Reading — those are the hero)
    const heroIds = new Set(newIds)
    const list: ScheduledStory[] = []

    // Review items (review_pattern from mission)
    for (const item of missionItems) {
      if (item.type !== 'review_pattern') continue
      const story = magazineStories.find(s => s.id === item.storyId)
      if (!story) continue
      list.push({ story, label: item.done ? 'Done' : 'Review', href: item.href, done: item.done })
    }

    // Tomorrow stories
    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (heroIds.has(s.id) || missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) {
        list.push({ story: s, label: 'Tomorrow', href: `/stories/${s.id}`, done: false })
      }
    }

    // Upcoming (not started, not in mission, not hero)
    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (heroIds.has(s.id) || missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) continue
      if (!learnedIds.has(s.id)) {
        list.push({ story: s, label: 'Upcoming', href: `/stories/${s.id}`, done: false })
      }
    }

    setScheduledList(list.slice(0, 8))
  }, [])

  const tipTitle    = dailyTip?.title?.ko    ?? dailyTip?.title?.en    ?? ''
  const tipBody     = dailyTip?.body?.ko     ?? dailyTip?.body?.en     ?? []
  const tipRemember = dailyTip?.oneThingToRemember?.ko ?? dailyTip?.oneThingToRemember?.en ?? ''

  const frostedCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.32)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.52)',
    boxShadow: '0 4px 20px rgba(30,40,60,0.06), inset 0 1px 0 rgba(255,255,255,0.75)',
  }

  const glassChip = {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 4,
    padding: '3px 8px',
    background: 'rgba(255,255,255,0.42)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.75)',
    borderRadius: 999,
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#555A61',
    textShadow: '0 1px 1px rgba(255,255,255,.55)',
  }

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        paddingTop: 'var(--pnav-h)',
        paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)`,
      }}>

        {/* ── Date ────────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            color: 'var(--pm)', textTransform: 'uppercase', margin: 0,
          }}>
            {getDateLabel()}
          </p>
        </div>

        {/* ── Hero Cover ──────────────────────────────────────────────── */}
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
            height: 340,
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
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.78) 100%)',
          }} />

          {/* Top-left: story number */}
          <div style={{ position: 'absolute', top: 14, left: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>
              STORY {String(todayStory.id).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom: title left / Continue right */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 18px 18px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
          }}>
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
              <p style={{
                fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              }}>
                {todayStory.subtitleKo}
              </p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); router.push(firstHref) }}
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.20)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.40)',
                borderRadius: 999, padding: '9px 16px',
                cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.35)',
                transition: 'all 0.15s', letterSpacing: '0.01em', whiteSpace: 'nowrap',
              }}
            >
              {allDone ? '완료 🎉' : 'Continue'}
              {!allDone && <ArrowRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* ── Summary Cards — NEW / REVIEW / STREAK ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '12px 20px 0' }}>

          {/* NEW STORY */}
          <div className="glass-card-sm" style={{ ...frostedCard, padding: '13px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 7 }}>
              <BookOpen style={{ width: 9, height: 9, color: 'var(--pm2)' }} strokeWidth={2} />
              <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>New Story</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {newStoryIds.length > 0
                ? newStoryIds.map(id => String(id).padStart(2, '0')).join(' · ')
                : <span style={{ fontSize: 15, color: 'var(--pm2)', fontWeight: 400 }}>—</span>
              }
            </p>
          </div>

          {/* REVIEW STORY */}
          <div className="glass-card-sm" style={{ ...frostedCard, padding: '13px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 7 }}>
              <RotateCcw style={{ width: 9, height: 9, color: 'var(--pm2)' }} strokeWidth={2} />
              <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>Review Story</p>
            </div>
            <p style={{ fontSize: reviewStoryIds.length > 1 ? 14 : 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {reviewStoryIds.length > 0
                ? reviewStoryIds.map(id => String(id).padStart(2, '0')).join(' · ')
                : <span style={{ fontSize: 15, color: 'var(--pm2)', fontWeight: 400 }}>—</span>
              }
            </p>
          </div>

          {/* STREAK */}
          <div className="glass-card-sm" style={{ ...frostedCard, padding: '13px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 7 }}>
              <Flame style={{ width: 9, height: 9, color: '#D0601A' }} strokeWidth={2} />
              <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>Streak</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {streak}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--pm)', marginLeft: 2 }}>Days</span>
            </p>
          </div>
        </div>

        {/* ── Editor Tip ───────────────────────────────────────────────── */}
        {dailyTip && (
          <div style={{ padding: '10px 20px 0' }}>
            <button
              type="button"
              onClick={() => setTipOpen(true)}
              className="glass-card-sm"
              style={{
                ...frostedCard,
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '12px 15px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <Pencil style={{ width: 14, height: 14, color: 'var(--pm2)', flexShrink: 0, marginRight: 4 }} strokeWidth={1.8} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm2)', margin: '0 0 2px', textTransform: 'uppercase' }}>
                  Editor Tip
                </p>
                <p style={{
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--pt2)',
                  margin: 0, lineHeight: 1.35,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                }}>
                  {tipTitle}
                </p>
              </div>
              <ChevronRight style={{ width: 12, height: 12, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* ── STORIES ─────────────────────────────────────────────────── */}
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{
              fontSize: 15, fontWeight: 800,
              color: '#3A3A3C',
              margin: 0, letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              textShadow: '0 1px 0 rgba(255,255,255,.8), 0 8px 18px rgba(60,70,90,.08)',
            }}>
              Stories
            </p>
            <button
              type="button"
              onClick={() => router.push('/stories/all')}
              style={{
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: 'var(--pm)',
                letterSpacing: '0.02em',
              }}
            >
              See All <ChevronRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {scheduledList.map(({ story, label, href, done }) => {
              const chipText = done ? 'Done' : label

              const chipGradient = done
                ? CHIP_GRADIENT['Done']
                : CHIP_GRADIENT[label] ?? CHIP_GRADIENT['Upcoming']

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
                        ...glassChip,
                        background: chipGradient,
                        border: '1px solid rgba(255,255,255,0.45)',
                        color: '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.18)',
                      }}>
                        {chipText}
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
            background: 'rgba(220,225,235,0.30)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 20px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setTipOpen(false) }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%', maxWidth: 480,
              maxHeight: '80dvh', overflowY: 'auto',
              borderRadius: 24,
            }}
          >
            <div style={{ padding: '24px 24px 40px' }}>
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
                    color: '#3A3A3C', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25,
                    textShadow: '0 1px 0 rgba(255,255,255,.6), 0 2px 12px rgba(60,70,90,0.08)',
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

              {/* Body */}
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
                  background: 'rgba(100,110,140,0.06)',
                  border: '1px solid rgba(100,110,140,0.12)',
                  borderRadius: 14,
                }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', margin: '0 0 5px', textTransform: 'uppercase' }}>
                    One thing to remember
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#8D234C', margin: 0, lineHeight: 1.5 }}>
                    {tipRemember}
                  </p>
                </div>
              )}

              {/* Research */}
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
