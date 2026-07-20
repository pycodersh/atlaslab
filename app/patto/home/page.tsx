'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X, Pencil, Check, Target } from 'lucide-react'
import Link from 'next/link'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import type { MagazineStory } from '@/types/magazine'
import { getAllRecords, todayStr, addDays } from '@/lib/srs/storage'
import { getStoryRound } from '@/lib/srs/story-round'
import { getMissionItems } from '@/lib/srs/engine'
import { getLastPosition } from '@/lib/last-position'
import { EDITOR_NOTES, type EditorNote } from '@/data/editor-notes'
import { editorTipTranslations, type TipLang } from '@/data/editor-tips-translations'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useT } from '@/hooks/useT'
import { useTheme } from '@/components/ThemeProvider'

// ── All Stories panel (desktop right column) ──────────────────────────────────
type AllStoryLabel = 'Today' | 'Reading' | 'Review' | 'Done' | 'New'
const ALL_DOT: Record<AllStoryLabel, string> = {
  Today: '#6B90D9', Reading: '#6B90D9', Review: '#C08B30', Done: '#3DAD6A', New: '#9B9BA0',
}
function AllStoriesPanel({ labelMap }: { labelMap: Record<number, AllStoryLabel> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
          All Stories
        </p>
        <span style={{ fontSize: 11, color: 'var(--pm)', fontWeight: 500 }}>{magazineStories.length} stories</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {magazineStories.map(story => {
          const label = labelMap[story.id] ?? 'New'
          const dotColor = ALL_DOT[label]
          const href = label === 'Review' || label === 'Today' || label === 'Reading'
            ? `/patto/stories/${story.id}?v=p`
            : `/patto/stories/${story.id}`
          return (
            <Link
              key={story.id}
              href={href}
              className="glass-card-sm"
              style={{ overflow: 'hidden', borderRadius: 16, display: 'block', textDecoration: 'none' }}
            >
              <div style={{ position: 'relative', paddingTop: '60%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={story.imageUrl} alt={story.imageAlt}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 40%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 6, left: 6 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 7px',
                    background: 'rgba(255,255,255,0.40)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.70)',
                    borderRadius: 999, fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
                    color: '#555A61',
                  }}>
                    <span style={{ width: 4.5, height: 4.5, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
                    {label}
                  </span>
                </div>
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pm2)', margin: '0 0 2px', textTransform: 'uppercase' }}>
                  Story {String(story.id).padStart(2, '0')}
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', margin: 0, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {story.title}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Map app Language → TipLang
function toTipLang(lang: string): TipLang {
  const m: Record<string, TipLang> = { 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW' }
  return (m[lang] ?? lang) as TipLang
}

function getTipEntry(noteId: number, lang: string) {
  if (lang === 'ko') return null
  const tip = editorTipTranslations.find(t => t.noteId === noteId)
  if (!tip) return null
  const l = toTipLang(lang)
  return tip.translations[l] ?? tip.translations['en']
}

// ── Carousel helpers ──────────────────────────────────────────────────────────
const TOTAL_TIPS = EDITOR_NOTES.length

function shuffleIndices(total: number, avoidFirst?: number): number[] {
  const arr = [...Array(total).keys()]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  if (avoidFirst !== undefined && arr[0] === avoidFirst && arr.length > 1) {
    ;[arr[0], arr[1]] = [arr[1], arr[0]]
  }
  return arr
}

function DotIndicator({ total, pos }: { total: number; pos: number }) {
  const current = pos % total
  const MAX = 7
  const half = Math.floor(MAX / 2)
  const count = Math.min(total, MAX)
  const start = total <= MAX ? 0 : Math.max(0, Math.min(current - half, total - MAX))
  const dots = Array.from({ length: count }, (_, i) => start + i)

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', paddingTop: 14 }}>
      {dots.map(di => {
        const dist = Math.abs(di - current)
        const active = di === current
        const size = active ? 7 : dist <= 1 ? 4.5 : 3.5
        const alpha = active ? 1 : dist <= 1 ? 0.35 : 0.18
        return (
          <span key={di} style={{
            display: 'block', width: size, height: size, borderRadius: '50%',
            background: `rgba(60,60,70,${alpha})`,
            transition: 'all 0.22s',
          }} />
        )
      })}
    </div>
  )
}

function TipContent({ tip, isDark }: { tip: EditorNote; isDark?: boolean }) {
  const { prefs } = usePreferences()
  const entry = getTipEntry(tip.id, prefs.language)
  const title    = entry?.title ?? (tip.title as Record<string, string>)?.ko ?? ''
  const body     = entry?.body ?? (tip.body as Record<string, string[]>)?.ko ?? []
  const remember = entry?.oneThingToRemember ?? (tip.oneThingToRemember as Record<string, string>)?.ko ?? ''
  const researchBriefs = entry?.researchBriefs ?? []
  const inModal = isDark !== undefined
  return (
    <>
      <p style={{
        fontSize: inModal ? 20 : 'clamp(1.05rem, 4.5vw, 1.25rem)',
        fontWeight: inModal ? 600 : 800,
        color: inModal ? (isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.88)') : '#3A3A3C',
        margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.25,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
        {body.map((para, i) => (
          <p key={i} style={{
            fontSize: inModal ? 15 : 14, lineHeight: 1.65,
            color: inModal ? (isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)') : 'var(--pt2)',
            margin: 0, fontWeight: i === 0 ? 500 : 400,
          }}>
            {para}
          </p>
        ))}
      </div>
      {remember && (
        <div style={inModal ? {
          padding: '12px',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          borderLeft: `3px solid ${isDark ? 'rgba(255,100,100,0.7)' : 'rgba(200,80,80,0.6)'}`,
          borderRadius: '0 8px 8px 0',
        } : {
          padding: '13px 16px',
          background: 'rgba(100,110,140,0.06)',
          border: '1px solid rgba(100,110,140,0.12)',
          borderRadius: 14,
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: inModal ? (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') : 'var(--pm2)', margin: '0 0 5px', textTransform: 'uppercase' }}>
            One thing to remember
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: inModal ? (isDark ? 'rgba(255,180,180,0.9)' : '#8D234C') : '#8D234C', margin: 0, lineHeight: 1.5 }}>
            {remember}
          </p>
        </div>
      )}
      {researchBriefs.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {researchBriefs.map((brief, i) => (
            <p key={i} style={{ fontSize: 10, color: inModal ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)') : 'var(--pm2)', margin: '0 0 3px', lineHeight: 1.4 }}>
              {brief}
            </p>
          ))}
        </div>
      )}
    </>
  )
}

// iOS-style carousel modal
function TipCarousel({ onClose, initialIndex = 0 }: { onClose: () => void; initialIndex?: number }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [deck, setDeck] = useState<number[]>(() => {
    const rest = shuffleIndices(TOTAL_TIPS, initialIndex).filter(i => i !== initialIndex)
    return [initialIndex, ...rest]
  })
  const [pos, setPos] = useState(0)

  useEffect(() => {
    if (pos >= deck.length - 2) {
      const last = deck[deck.length - 1]
      setDeck(d => [...d, ...shuffleIndices(TOTAL_TIPS, last)])
    }
  }, [pos, deck])

  const [dragX, setDragX]     = useState(0)
  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)
  const touchStartX   = useRef(0)
  const containerRef  = useRef<HTMLDivElement>(null)
  const isTransiting  = useRef(false)

  const prevIdx = deck[Math.max(0, pos - 1)]
  const currIdx = deck[pos]
  const nextIdx = deck[pos + 1] ?? deck[0]

  function slide(dir: -1 | 1) {
    if (isTransiting.current) return
    if (dir === 1 && pos === 0) return
    isTransiting.current = true
    setTransit(true)
    setTOffset(dir)
    setDragX(0)
    setTimeout(() => {
      setPos(p => p + (dir === -1 ? 1 : -1))
      setTransit(false)
      setTOffset(0)
      isTransiting.current = false
    }, 330)
  }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchMove(e: React.TouchEvent) {
    if (isTransiting.current) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }
  function onTouchEnd() {
    if (isTransiting.current) return
    const W = containerRef.current?.offsetWidth ?? 340
    if (dragX < -W * 0.22)       slide(-1)
    else if (dragX > W * 0.22)   slide(1)
    else setDragX(0)
  }

  const W = containerRef.current?.offsetWidth ?? 340
  const dragPct = dragX / W * 100
  const basePct = -100 + (transit ? tOffset * 100 : dragPct)

  return (
    <div
      role="dialog" aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 480, borderRadius: 20, overflow: 'hidden',
        background: isDark ? 'rgba(20,18,35,0.92)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 18px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', margin: 0, textTransform: 'uppercase' }}>
            Editor Tip · {EDITOR_NOTES[currIdx]?.partTitle ?? ''}
          </p>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X style={{ width: 14, height: 14, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
        </div>
        <div ref={containerRef} style={{ overflow: 'hidden' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div style={{ display: 'flex', width: '300%', transform: `translateX(${basePct / 3}%)`, transition: transit ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none', willChange: 'transform' }}>
            <div style={{ width: '33.333%', padding: '0 24px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[prevIdx]} isDark={isDark} /></div>
            <div style={{ width: '33.333%', padding: '0 24px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[currIdx]} isDark={isDark} /></div>
            <div style={{ width: '33.333%', padding: '0 24px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[nextIdx]} isDark={isDark} /></div>
          </div>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <DotIndicator total={TOTAL_TIPS} pos={pos % TOTAL_TIPS} />
        </div>
      </div>
    </div>
  )
}

function DesktopTipInline({ onClose, initialIndex = 0 }: { onClose: () => void; initialIndex?: number }) {
  const [deck, setDeck] = useState<number[]>(() => {
    const rest = shuffleIndices(TOTAL_TIPS, initialIndex).filter(i => i !== initialIndex)
    return [initialIndex, ...rest]
  })
  const [pos, setPos] = useState(0)

  useEffect(() => {
    if (pos >= deck.length - 2) {
      const last = deck[deck.length - 1]
      setDeck(d => [...d, ...shuffleIndices(TOTAL_TIPS, last)])
    }
  }, [pos, deck])

  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)
  const isTransiting = useRef(false)

  const prevIdx = deck[Math.max(0, pos - 1)]
  const currIdx = deck[pos]
  const nextIdx = deck[pos + 1] ?? deck[0]

  function slide(dir: -1 | 1) {
    if (isTransiting.current) return
    if (dir === 1 && pos === 0) return
    isTransiting.current = true
    setTransit(true)
    setTOffset(dir)
    setTimeout(() => {
      setPos(p => p + (dir === -1 ? 1 : -1))
      setTransit(false)
      setTOffset(0)
      isTransiting.current = false
    }, 330)
  }

  const basePct = -100 + (transit ? tOffset * 100 : 0)

  return (
    <div style={{ marginTop: 14, padding: '0 20px' }}>
      <div className="glass-card" style={{ borderRadius: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
            Editor Tip · {EDITOR_NOTES[currIdx]?.partTitle ?? ''}
          </p>
          <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pc)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: '300%', transform: `translateX(${basePct / 3}%)`, transition: transit ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none', willChange: 'transform' }}>
            <div style={{ width: '33.333%', padding: '0 22px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[prevIdx]} /></div>
            <div style={{ width: '33.333%', padding: '0 22px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[currIdx]} /></div>
            <div style={{ width: '33.333%', padding: '0 22px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[nextIdx]} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 22px' }}>
          <button type="button" onClick={() => slide(1)} disabled={pos === 0} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pc)', border: '1px solid var(--pglass-border)', cursor: pos === 0 ? 'default' : 'pointer', opacity: pos === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s', flexShrink: 0 }}>
            <ChevronLeft style={{ width: 16, height: 16, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
          <DotIndicator total={TOTAL_TIPS} pos={pos % TOTAL_TIPS} />
          <button type="button" onClick={() => slide(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pc)', border: '1px solid var(--pglass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDateLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getDailyTipIndex() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % EDITOR_NOTES.length
}

type UnifiedMission = {
  id: number
  title: string
  type: 'learn' | 'review'
  done: boolean
  href: string
  reviewCount?: number
}

type StoryLabel = 'Review' | 'Tomorrow' | 'Upcoming' | 'Done'
type ScheduledStory = { story: MagazineStory; label: StoryLabel; href: string; done: boolean }

const CHIP_GRADIENT: Record<StoryLabel | 'Done', string> = {
  Review:   'linear-gradient(135deg, rgba(192,139,48,0.72) 0%, rgba(210,160,60,0.55) 100%)',
  Tomorrow: 'linear-gradient(135deg, rgba(155,155,160,0.55) 0%, rgba(175,175,180,0.40) 100%)',
  Upcoming: 'linear-gradient(135deg, rgba(155,155,160,0.55) 0%, rgba(175,175,180,0.40) 100%)',
  Done:     'linear-gradient(135deg, rgba(61,173,106,0.72) 0%, rgba(80,195,120,0.55) 100%)',
}

export default function HomePage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const isDesktop = useIsDesktop()
  const t = useT()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [firstHref, setFirstHref]     = useState('/patto/stories/1')
  const [todayStory, setTodayStory]   = useState<MagazineStory>(magazineStories[0])
  const [allDone, setAllDone]         = useState(false)
  const [tipOpen, setTipOpen]         = useState(false)
  const [missions, setMissions]       = useState<UnifiedMission[]>([])
  const [scheduledList, setScheduledList] = useState<ScheduledStory[]>([])
  const [allStoriesLabelMap, setAllStoriesLabelMap] = useState<Record<number, AllStoryLabel>>({})

  const dailyTip = EDITOR_NOTES[getDailyTipIndex()]

  const loadMissions = useCallback(() => {
    const records  = getAllRecords()
    const today    = todayStr()
    const tomorrow = addDays(today, 1)

    const missionItems = getMissionItems()
    const missionMap   = new Map(missionItems.map(i => [i.storyId, i]))

    const firstPending = missionItems.find(i => !i.done)
    if (firstPending) {
      setFirstHref(firstPending.href)
    } else {
      const lastPos = getLastPosition()
      if (lastPos) {
        setFirstHref(`/patto/stories/${lastPos.storyId}${lastPos.view === 'patterns' ? '?v=p' : ''}`)
      } else {
        const learnedSet = new Set(
          records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
        )
        const next = magazineStories.find(s => !learnedSet.has(s.id)) ?? magazineStories[0]
        setFirstHref(`/patto/stories/${next.id}`)
      }
    }

    const heroMission = missionItems.find(i => i.type === 'new_story' || i.type === 'in_progress_story')
    setTodayStory(heroMission ? magazineStories.find(s => s.id === heroMission.storyId) ?? magazineStories[0] : magazineStories[0])
    setAllDone(missionItems.length > 0 && missionItems.every(i => i.done))

    // Build unified mission list
    const newMissions    = missionItems.filter(i => i.type === 'new_story' || i.type === 'in_progress_story')
    const newIds         = new Set(newMissions.map(i => i.storyId))
    const reviewMissions = missionItems.filter(i => i.type === 'review_pattern' && !newIds.has(i.storyId))

    const patByStory = new Map<number, number[]>()
    for (const r of records) {
      if (r.itemType !== 'pattern' || !r.storyId || r.repeatCount === 0) continue
      const list = patByStory.get(r.storyId) ?? []
      list.push(r.reviewCount)
      patByStory.set(r.storyId, list)
    }

    const unified: UnifiedMission[] = [
      ...newMissions.map(i => {
        const s = magazineStories.find(ms => ms.id === i.storyId)
        return { id: i.storyId, title: s?.title ?? '', type: 'learn' as const, done: i.done, href: i.href }
      }),
      ...reviewMissions.map(i => {
        const s      = magazineStories.find(ms => ms.id === i.storyId)
        const counts = patByStory.get(i.storyId) ?? []
        const rc     = counts.length > 0 ? Math.min(...counts) : 0
        return { id: i.storyId, title: s?.title ?? i.storyTitle ?? '', type: 'review' as const, done: i.done, href: i.href, reviewCount: rc }
      }),
    ]
    setMissions(unified)

    // Scheduled list (for mobile stories grid)
    const heroIds = new Set(newMissions.map(i => i.storyId))
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
      if (item.type !== 'review_pattern') continue
      if (heroIds.has(item.storyId)) continue
      const story = magazineStories.find(s => s.id === item.storyId)
      if (!story) continue
      list.push({ story, label: item.done ? 'Done' : 'Review', href: item.href, done: item.done })
    }
    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (heroIds.has(s.id) || missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow)
        list.push({ story: s, label: 'Tomorrow', href: `/patto/stories/${s.id}`, done: false })
    }
    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (heroIds.has(s.id) || missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) continue
      if (!learnedIds.has(s.id))
        list.push({ story: s, label: 'Upcoming', href: `/patto/stories/${s.id}`, done: false })
    }
    setScheduledList(list.slice(0, 8))

    // All Stories label map — Done only when completeStoryRound() was called (L+R+C all done)
    const allMap: Record<number, AllStoryLabel> = {}
    for (const s of magazineStories) {
      const mi = missionMap.get(s.id)
      if (mi) allMap[s.id] = mi.type === 'review_pattern' ? 'Review' : mi.type === 'in_progress_story' ? 'Reading' : 'Today'
      else if (getStoryRound(s.id).round > 0) allMap[s.id] = 'Done'
      else allMap[s.id] = 'New'
    }
    setAllStoriesLabelMap(allMap)

  }, [])

  useEffect(() => {
    loadMissions()
    const onVisible = () => { if (document.visibilityState === 'visible') loadMissions() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [loadMissions])

  const frostedCard: React.CSSProperties = {
    background: 'var(--pglass)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid var(--pglass-border)',
    boxShadow: '0 4px 20px rgba(30,40,60,0.06)',
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

      <div className="desktop-max">
      <div className="desktop-two-col" style={{ paddingTop: 0 }}>

      {/* ── Left column ── */}
      <div style={{ paddingTop: 0, paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)` }}>

        {/* ── Date ── */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm)', textTransform: 'uppercase', margin: 0 }}>
            {getDateLabel()}
          </p>
        </div>

        {/* ── Hero Cover ── */}
        <div
          role="button" tabIndex={0}
          onClick={() => router.push(`/patto/stories/${todayStory.id}`)}
          onKeyDown={e => e.key === 'Enter' && router.push(`/patto/stories/${todayStory.id}`)}
          style={{ position: 'relative', margin: '12px 20px 0', borderRadius: 20, overflow: 'hidden', height: 340, cursor: 'pointer' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={todayStory.imageUrl} alt={todayStory.imageAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.78) 100%)' }} />
          <div style={{ position: 'absolute', top: 14, left: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>
              STORY {String(todayStory.id).padStart(2, '0')}
            </span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#fff', margin: '0 0 4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {todayStory.title}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.3 }}>
                {todayStory.subtitleTranslations?.[prefs.language]
                  ?? (prefs.language !== 'ko' ? (todayStory.subtitleTranslations?.en ?? todayStory.subtitleKo) : todayStory.subtitleKo)}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={e => { e.stopPropagation(); router.push(`/patto/stories/${todayStory.id}`) }}
              style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.45)', borderRadius: 999, padding: '9px 16px',
                cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)', letterSpacing: '0.01em', whiteSpace: 'nowrap',
              }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {allDone ? 'Done' : 'Start'}
              {allDone ? <Check style={{ width: 12, height: 12 }} strokeWidth={2.5} /> : <ArrowRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />}
            </motion.button>
          </div>
        </div>


        {/* ── Card 1: TODAY'S MISSION ── */}
        {missions.length > 0 && (
          <div style={{ margin: '12px 20px 0' }}>
            {/* 소제목 칩 */}
            <div style={{ background: '#1E293B', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target style={{ width: 14, height: 14, color: '#818CF8', flexShrink: 0 }} strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today&apos;s Mission</span>
            </div>
            {/* 내용 */}
            {missions.map((m) => (
              <motion.div
                key={`${m.type}-${m.id}`}
                role="button" tabIndex={0}
                onClick={() => router.push(`/patto/stories/${m.id}`)}
                onKeyDown={e => e.key === 'Enter' && router.push(`/patto/stories/${m.id}`)}
                style={{ padding: '12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', opacity: m.done ? 0.6 : 1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <p style={{ fontSize: 14, color: 'var(--pt)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                  Story {String(m.id).padStart(2, '0')} · {m.title}
                </p>
                {m.done && (
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#16A34A', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 999, padding: '3px 10px', flexShrink: 0, marginLeft: 8 }}>Done</span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Card 2: Editor Tip ── */}
        {dailyTip && (
          <div style={{ margin: `${missions.length > 0 ? '16px' : '12px'} 20px 0` }}>
            {/* 소제목 칩 */}
            <div style={{ background: '#1E293B', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pencil style={{ width: 14, height: 14, color: '#818CF8', flexShrink: 0 }} strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Editor Tip</span>
            </div>
            {/* 내용 */}
            <button
              type="button"
              onClick={() => setTipOpen(true)}
              style={{ padding: '12px 4px', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
            >
              <p style={{ fontSize: 14, color: 'var(--pt)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                {getTipEntry(dailyTip.id, prefs.language)?.title ?? (dailyTip.title as Record<string,string>)?.ko ?? ''}
              </p>
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--pm)', flexShrink: 0 }} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* ── Desktop Editor Tip inline panel ── */}
        {isDesktop && tipOpen && (
          <DesktopTipInline onClose={() => setTipOpen(false)} initialIndex={getDailyTipIndex()} />
        )}

        {/* ── STORIES (mobile only) ── */}
        <div className="mobile-only" style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', textShadow: '0 1px 0 rgba(255,255,255,.8), 0 8px 18px rgba(60,70,90,.08)' }}>
              Stories
            </p>
            <button type="button" onClick={() => router.push('/patto/stories/all')} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.02em' }}>
              See All <ChevronRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {scheduledList.map(({ story, label, href, done }) => {
              const chipText = label
              const chipGradient = CHIP_GRADIENT[label] ?? CHIP_GRADIENT['Upcoming']
              const cardBorder = label === 'Review' && !done ? '1.5px solid rgba(192,139,48,0.55)' : undefined
              return (
                <div
                  key={story.id}
                  role="button" tabIndex={0}
                  onClick={() => router.push(href)}
                  onKeyDown={e => e.key === 'Enter' && router.push(href)}
                  className="glass-card-sm"
                  style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: 18, ...(cardBorder ? { border: cardBorder } : {}) }}
                >
                  <div style={{ position: 'relative', paddingTop: '64%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={story.imageUrl} alt={story.imageAlt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%)', pointerEvents: 'none' }} />
                    {!done && (
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <span style={{ ...glassChip, background: chipGradient, border: '1px solid rgba(255,255,255,0.45)', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.18)' }}>
                          {chipText}
                        </span>
                      </div>
                    )}
                    {done && (
                      <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          background: 'rgba(34,197,94,0.15)',
                          color: '#16A34A',
                          border: '1px solid rgba(34,197,94,0.3)',
                          borderRadius: 999,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                        }}>
                          Done
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm2)', margin: '0 0 3px', textTransform: 'uppercase' }}>
                      Story {String(story.id).padStart(2, '0')}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: 0, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {story.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>{/* end left column */}

      {/* ── Right column: All Stories (desktop only) ── */}
      <div className="desktop-show desktop-right-col" style={{ paddingTop: 20, paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)` }}>
        <AllStoriesPanel labelMap={allStoriesLabelMap} />
      </div>

      </div>{/* end desktop-two-col */}
      </div>{/* end desktop-max */}

      {/* ── Editor Tip Carousel Modal (mobile only) ── */}
      {!isDesktop && tipOpen && <TipCarousel onClose={() => setTipOpen(false)} initialIndex={getDailyTipIndex()} />}
    </div>
  )
}
