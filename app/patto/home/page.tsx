'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X, Pencil, BookOpen, RotateCcw, Check, PartyPopper, Clock, EyeOff, PenLine, Dumbbell, AlertCircle, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import type { MagazineStory } from '@/types/magazine'
import { getAllRecords, todayStr, addDays } from '@/lib/srs/storage'
import { getMissionItems } from '@/lib/srs/engine'
import { getLastPosition } from '@/lib/last-position'
import { getStoryStatus, getTodayRecommendedStoryId, getStoryRound } from '@/lib/srs/story-round'
import { EDITOR_NOTES, type EditorNote } from '@/data/editor-notes'
import { editorTipTranslations, type TipLang } from '@/data/editor-tips-translations'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useT } from '@/hooks/useT'
import { useTheme } from '@/components/ThemeProvider'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import { useVisitCount } from '@/hooks/useVisitCount'
import {
  getTimeOfDay,
  getFirstVisitButtons,
  getVeteranHomeButton,
} from '@/lib/scenario/scenario-engine'
import {
  getLearnerLevel,
  loadStats,
  getAdaptiveHomeMessage,
  getSpecialSituation,
} from '@/lib/adaptive/adaptive-engine'
import { loadStatsFromSupabase } from '@/lib/adaptive/supabase-sync'

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

// Map app Language → TipLang (handle zh-cn/zh-tw case difference)
function toTipLang(lang: string): TipLang {
  const m: Record<string, TipLang> = { 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW' }
  return (m[lang] ?? lang) as TipLang
}

function getTipEntry(noteId: number, lang: string) {
  if (lang === 'ko') return null  // ko → EDITOR_NOTES Korean data
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

// Windowed dot indicator for carousel
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

// Tip content renderer
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

// ── PATTO GUIDE carousel ──────────────────────────────────────────────────────
const GUIDE_STEPS = [
  { step: 'STEP 01', title: 'Read the Story',         icon: BookOpen,  color: 'rgba(142,167,255,0.85)' },
  { step: 'STEP 02', title: 'Hide & Recall',          icon: EyeOff,   color: 'rgba(220,80,80,0.8)' },
  { step: 'STEP 03', title: 'Repeat 5 Times',         icon: RotateCcw, color: 'rgba(60,170,90,0.85)' },
  { step: 'STEP 04', title: 'Write & Get Reviewed',   icon: PenLine,  color: 'rgba(200,140,60,0.9)' },
] as const

function GuideCarousel({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const t = useT()
  const TOTAL = GUIDE_STEPS.length

  const [pos, setPos]       = useState(0)
  const [dragX, setDragX]   = useState(0)
  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTransiting = useRef(false)
  const touchStartX  = useRef(0)

  const bodyKeys = ['guide_step1_body', 'guide_step2_body', 'guide_step3_body', 'guide_step4_body'] as const

  function slide(dir: 1 | -1) {
    if (isTransiting.current) return
    const next = pos + dir
    if (next < 0 || next >= TOTAL) return
    isTransiting.current = true
    setTransit(true)
    setTOffset(-dir)
    setTimeout(() => {
      setPos(next)
      setTransit(false)
      setTOffset(0)
      isTransiting.current = false
    }, 300)
  }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchMove(e: React.TouchEvent) {
    if (isTransiting.current) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }
  function onTouchEnd() {
    if (isTransiting.current) return
    const W = containerRef.current?.offsetWidth ?? 340
    if (dragX < -W * 0.22)      slide(1)
    else if (dragX > W * 0.22)  slide(-1)
    else setDragX(0)
  }

  const W = containerRef.current?.offsetWidth ?? 340
  const dragPct = dragX / W * 100
  const railPct = -(pos * 100) + (transit ? tOffset * 100 : dragPct)

  const overlayBg   = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)'
  const popupBg     = isDark ? 'rgba(28,20,48,0.96)' : 'rgba(255,255,255,0.94)'
  const popupBorder = isDark ? '1px solid rgba(255,255,255,0.13)' : 'none'
  const slideBg     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(248,246,255,0.8)'
  const slideBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,240,0.3)'

  return (
    <div
      role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 480, borderRadius: 20, overflow: 'hidden', background: popupBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: popupBorder, position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 22px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', margin: 0, textTransform: 'uppercase' }}>
            PATTO GUIDE
          </p>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X style={{ width: 14, height: 14, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
        </div>

        {/* Slide rail — no padding here; slides carry their own horizontal padding */}
        <div ref={containerRef} style={{ overflow: 'hidden' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div style={{ display: 'flex', width: `${TOTAL * 100}%`, transform: `translateX(${railPct / TOTAL}%)`, transition: transit ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none', willChange: 'transform' }}>
            {GUIDE_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} style={{ width: `${100 / TOTAL}%`, boxSizing: 'border-box', padding: `0 22px`, paddingRight: i < TOTAL - 1 ? 11 : 22 }}>
                  <div style={{ background: slideBg, border: slideBorder, borderRadius: 16, padding: '22px 20px 20px' }}>
                    <Icon style={{ width: 28, height: 28, color: step.color, marginBottom: 14 }} strokeWidth={1.8} />
                    <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(80,90,130,0.55)', margin: '0 0 6px', textTransform: 'uppercase' }}>
                      {step.step}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.92)' : '#1A1A2E', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(60,65,100,0.8)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
                      {t(bodyKeys[i])}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PC nav (md breakpoint 이상에서만) + dot indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px 22px' }}>
          <button
            type="button" onClick={() => slide(-1)} disabled={pos === 0}
            style={{ width: 36, height: 36, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: pos === 0 ? 'default' : 'pointer', opacity: pos === 0 ? 0.3 : 1, display: 'none', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s' } as React.CSSProperties}
            className="guide-nav-btn"
          >
            <ChevronLeft style={{ width: 16, height: 16, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>

          {/* Dot indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div key={i} style={{ borderRadius: pos === i ? 3 : '50%', transition: 'all 0.28s ease', width: pos === i ? 18 : 5, height: 5, background: pos === i ? (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(142,167,255,0.75)') : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(142,167,255,0.18)') }} />
            ))}
          </div>

          <button
            type="button" onClick={() => slide(1)} disabled={pos === TOTAL - 1}
            style={{ width: 36, height: 36, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: pos === TOTAL - 1 ? 'default' : 'pointer', opacity: pos === TOTAL - 1 ? 0.3 : 1, display: 'none', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s' } as React.CSSProperties}
            className="guide-nav-btn"
          >
            <ChevronRight style={{ width: 16, height: 16, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

// iOS-style carousel modal
function TipCarousel({ onClose, initialIndex = 0 }: { onClose: () => void; initialIndex?: number }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  // Deck: ever-growing queue — starts with initialIndex, then shuffled rest
  const [deck, setDeck] = useState<number[]>(() => {
    const rest = shuffleIndices(TOTAL_TIPS, initialIndex).filter(i => i !== initialIndex)
    return [initialIndex, ...rest]
  })
  const [pos, setPos] = useState(0)

  // Extend deck when near the end
  useEffect(() => {
    if (pos >= deck.length - 2) {
      const last = deck[deck.length - 1]
      setDeck(d => [...d, ...shuffleIndices(TOTAL_TIPS, last)])
    }
  }, [pos, deck])

  // 3-panel carousel (prev | current | next) with a 300%-wide rail
  const [dragX, setDragX]     = useState(0)
  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)  // -1 (go next) or +1 (go prev) during transition
  const touchStartX   = useRef(0)
  const containerRef  = useRef<HTMLDivElement>(null)
  const isTransiting  = useRef(false)

  const prevIdx = deck[Math.max(0, pos - 1)]
  const currIdx = deck[pos]
  const nextIdx = deck[pos + 1] ?? deck[0]

  function slide(dir: -1 | 1) {
    if (isTransiting.current) return
    if (dir === 1 && pos === 0) return  // can't go back before start
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

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchMove(e: React.TouchEvent) {
    if (isTransiting.current) return
    const dx = e.touches[0].clientX - touchStartX.current
    setDragX(dx)
  }
  function onTouchEnd() {
    if (isTransiting.current) return
    const W = containerRef.current?.offsetWidth ?? 340
    if (dragX < -W * 0.22)       slide(-1)
    else if (dragX > W * 0.22)   slide(1)
    else setDragX(0)
  }

  // Rail: sits at -100% (center panel visible). Drag & transition shift from there.
  const W = containerRef.current?.offsetWidth ?? 340
  const dragPct = dragX / W * 100
  const basePct = -100 + (transit ? tOffset * 100 : dragPct)

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 480, borderRadius: 20, overflow: 'hidden',
          background: isDark ? 'rgba(20,18,35,0.92)' : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 18px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', margin: 0, textTransform: 'uppercase' }}>
            Editor Tip · {EDITOR_NOTES[currIdx]?.partTitle ?? ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X style={{ width: 14, height: 14, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
        </div>

        {/* 3-panel swipe area */}
        <div
          ref={containerRef}
          style={{ overflow: 'hidden' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={{
            display: 'flex', width: '300%',
            transform: `translateX(${basePct / 3}%)`,
            transition: transit ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
            willChange: 'transform',
          }}>
            {/* prev */}
            <div style={{ width: '33.333%', padding: '0 24px 24px', boxSizing: 'border-box' }}>
              <TipContent tip={EDITOR_NOTES[prevIdx]} isDark={isDark} />
            </div>
            {/* current */}
            <div style={{ width: '33.333%', padding: '0 24px 24px', boxSizing: 'border-box' }}>
              <TipContent tip={EDITOR_NOTES[currIdx]} isDark={isDark} />
            </div>
            {/* next */}
            <div style={{ width: '33.333%', padding: '0 24px 24px', boxSizing: 'border-box' }}>
              <TipContent tip={EDITOR_NOTES[nextIdx]} isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Dot indicator */}
        <div style={{ padding: '0 24px 24px' }}>
          <DotIndicator total={TOTAL_TIPS} pos={pos % TOTAL_TIPS} />
        </div>
      </div>
    </div>
  )
}

// Desktop-only inline tip panel (no modal overlay)
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
            Editor Tip · {EDITOR_NOTES[currIdx]?.partTitle ?? ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pc)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>

        {/* 3-panel swipe area */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', width: '300%',
            transform: `translateX(${basePct / 3}%)`,
            transition: transit ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
            willChange: 'transform',
          }}>
            <div style={{ width: '33.333%', padding: '0 22px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[prevIdx]} /></div>
            <div style={{ width: '33.333%', padding: '0 22px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[currIdx]} /></div>
            <div style={{ width: '33.333%', padding: '0 22px 24px', boxSizing: 'border-box' }}><TipContent tip={EDITOR_NOTES[nextIdx]} /></div>
          </div>
        </div>

        {/* Nav buttons + dot indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 22px' }}>
          <button
            type="button"
            onClick={() => slide(1)}
            disabled={pos === 0}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pc)', border: '1px solid var(--pglass-border)', cursor: pos === 0 ? 'default' : 'pointer', opacity: pos === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s', flexShrink: 0 }}
          >
            <ChevronLeft style={{ width: 16, height: 16, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
          <DotIndicator total={TOTAL_TIPS} pos={pos % TOTAL_TIPS} />
          <button
            type="button"
            onClick={() => slide(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pc)', border: '1px solid var(--pglass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── First-Visit Onboarding Overlay ───────────────────────────────────────────
const INTRO_ORB_SIZE = 52
const INTRO_CARD_W   = 300

function IntroOnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [idx, setIdx]         = useState(0)
  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)
  const [dragX, setDragX]     = useState(0)
  const containerRef          = useRef<HTMLDivElement>(null)
  const isTransiting          = useRef(false)
  const touchStartX           = useRef(0)
  const TOTAL = 3

  function slide(dir: 1 | -1) {
    if (isTransiting.current) return
    const next = idx + dir
    if (next < 0 || next >= TOTAL) return
    isTransiting.current = true
    setTransit(true)
    setTOffset(-dir)
    setTimeout(() => {
      setIdx(next)
      setTransit(false)
      setTOffset(0)
      isTransiting.current = false
    }, 300)
  }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchMove(e: React.TouchEvent) {
    if (isTransiting.current) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }
  function onTouchEnd() {
    if (isTransiting.current) return
    const W = containerRef.current?.offsetWidth ?? INTRO_CARD_W
    if (dragX < -W * 0.22)     slide(1)
    else if (dragX > W * 0.22) slide(-1)
    else setDragX(0)
  }

  const W = containerRef.current?.offsetWidth ?? INTRO_CARD_W
  const dragPct = dragX / W * 100
  const railPct = -(idx * 100) + (transit ? tOffset * 100 : dragPct)

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textMain = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const textSub  = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const tagColor = isDark ? '#8FABFF' : '#8090F0'

  const btnBase: React.CSSProperties = {
    height: 44, borderRadius: 10, fontSize: 14, fontWeight: 600,
    flex: 1, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', border: 'none',
  }
  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: isDark ? 'rgba(142,167,255,0.22)' : 'rgba(142,167,255,0.18)',
    border: isDark ? '1px solid rgba(142,167,255,0.40)' : '1px solid rgba(142,167,255,0.35)',
    color: isDark ? '#A6B8FF' : '#4B6FD0',
  }
  const btnSecondary: React.CSSProperties = {
    ...btnBase,
    background: isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
    border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(142,167,255,0.20)',
    color: isDark ? 'rgba(255,255,255,0.65)' : '#8a8aaa',
  }
  const btnStart: React.CSSProperties = {
    ...btnBase,
    background: 'linear-gradient(135deg, #A6B8FF, #8090F0)',
    color: '#fff',
  }

  const dots = (
    <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
      {Array.from({ length: TOTAL }, (_, j) => (
        <div key={j} style={{
          borderRadius: idx === j ? 3 : '50%',
          width: idx === j ? 20 : 6, height: 6,
          background: isDark ? (idx === j ? '#8FABFF' : 'rgba(255,255,255,0.20)') : (idx === j ? '#6B8FFF' : 'rgba(142,167,255,0.22)'),
          transition: 'all 0.25s ease',
        }} />
      ))}
    </div>
  )

  const CARDS = [
    {
      iconBg: 'rgba(239,130,107,0.15)', iconColor: '#E8624A', Icon: AlertCircle,
      tag: '왜 말이 안 나올까?',
      body: (
        <p style={{ fontSize: 14, lineHeight: 1.7, color: textMain, margin: '0 0 20px', whiteSpace: 'pre-line' }}>
          {'영어 단어는 알지만 문장이 안 만들어지는 건\n단어를 어떻게 조합하는지 모르기 때문이에요.\n그 조합 방식이 바로 패턴이에요.'}
        </p>
      ),
      buttons: (
        <div style={{ display: 'flex' }}>
          <button type="button" onClick={() => slide(1)} style={{ ...btnPrimary, flex: 1 }}>Next</button>
        </div>
      ),
    },
    {
      iconBg: 'rgba(128,144,240,0.15)', iconColor: '#5C6BC0', Icon: Lightbulb,
      tag: '핵심 패턴 500개',
      body: (
        <>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: textMain, margin: '0 0 12px', whiteSpace: 'pre-line' }}>
            {'원어민이 매일 쓰는 단어는 2,000~3,000개.\n그런데 그 단어들을 담는 틀,\n즉 패턴은 500개면 충분해요.'}
          </p>
          <div style={{ background: 'rgba(128,144,240,0.1)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#4050B0', margin: '0 0 4px', fontFamily: 'monospace' }}>I ended up ~ing</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#4050B0', margin: 0, fontFamily: 'monospace' }}>I was about to ~</p>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: textMain, margin: '0 0 20px' }}>
            이런 패턴들이 자연스럽게 입에 배면 영어로 말할 수 있어요.
          </p>
        </>
      ),
      buttons: (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => slide(-1)} style={btnSecondary}>Back</button>
          <button type="button" onClick={() => slide(1)} style={btnPrimary}>Next</button>
        </div>
      ),
    },
    {
      iconBg: 'rgba(76,175,144,0.15)', iconColor: '#4CAF90', Icon: RotateCcw,
      tag: '학습 방법',
      body: (
        <>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: textMain, margin: '0 0 6px', whiteSpace: 'pre-line' }}>
            {'사람은 배운 것을 잊어요.\nPatto는 망각 이론을 기반으로\n각 패턴을 딱 맞는 타이밍에 다시 보여줘요.\n각 패턴을 트레이너와 함께'}
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, color: '#5C6BC0', margin: '0 0 4px', lineHeight: 1.1 }}>총 10회</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: textMain, margin: '0 0 20px' }}>반복하면 자연스럽게 쌓입니다.</p>
        </>
      ),
      buttons: (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => slide(-1)} style={btnSecondary}>Back</button>
          <button type="button" onClick={onComplete} style={btnStart}>Start</button>
        </div>
      ),
    },
  ]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: TAB_BAR_HEIGHT + 16 + INTRO_ORB_SIZE + 10,
        right: 0,
        width: INTRO_CARD_W,
        zIndex: 199,
        borderRadius: 20,
        background: isDark ? 'rgba(30,28,48,0.85)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(142,167,255,0.25)',
        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.40)' : '0 -3px 16px rgba(142,167,255,0.12), 0 8px 24px rgba(142,167,255,0.10)',
        minHeight: 320,
        overflow: 'hidden',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide rail */}
      <div style={{
        display: 'flex', width: `${TOTAL * 100}%`,
        transform: `translateX(${railPct / TOTAL}%)`,
        transition: transit ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
        willChange: 'transform',
      }}>
        {CARDS.map((card, i) => {
          const Icon = card.Icon
          return (
            <div key={i} style={{ width: `${100 / TOTAL}%`, boxSizing: 'border-box', padding: '24px 20px' }}>
              {dots}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <Icon style={{ width: 22, height: 22, color: card.iconColor }} strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', color: tagColor, margin: '0 0 10px' }}>
                {card.tag}
              </p>
              {card.body}
              {card.buttons}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
function getDateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function getDailyTipIndex() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % EDITOR_NOTES.length
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

  const [firstHref, setFirstHref]           = useState('/patto/stories/1')
  const [todayStory, setTodayStory]         = useState<MagazineStory>(magazineStories[0])
  const [newDone, setNewDone]               = useState(false)
  const [reviewDone, setReviewDone]         = useState(false)
  const [newStoriesData,    setNewStoriesData]    = useState<Array<{ id: number; title: string; done: boolean }>>([])
  const [reviewStoriesData, setReviewStoriesData] = useState<Array<{ id: number; title: string; reviewCount: number; done: boolean }>>([])
  const [scheduledList, setScheduledList]   = useState<ScheduledStory[]>([])
  const [allDone, setAllDone]               = useState(false)
  const [tipOpen, setTipOpen]               = useState(false)
  const [guideOpen, setGuideOpen]           = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [allStoriesLabelMap, setAllStoriesLabelMap] = useState<Record<number, AllStoryLabel>>({})
  const [srsTodayId, setSrsTodayId] = useState<number | null>(null)
  const [srsReviewIds, setSrsReviewIds] = useState<Set<number>>(new Set())
  const [hasStudied, setHasStudied] = useState(false)
  const [nextIncompleteStoryId, setNextIncompleteStoryId] = useState<number>(1)
  const trainer = useTrainerSafe()
  const trainerRef = useRef(trainer)
  trainerRef.current = trainer
  const { user } = useAuth()
  const { visitorType } = useVisitCount(user?.id)

  // Load adaptive stats from Supabase once on login
  useEffect(() => {
    if (user?.id) loadStatsFromSupabase(user.id)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
      setNextIncompleteStoryId(firstPending.storyId)
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
    const heroData    = heroMission
      ? magazineStories.find(s => s.id === heroMission.storyId) ?? magazineStories[0]
      : magazineStories[0]
    setTodayStory(heroData)

    setAllDone(missionItems.length > 0 && missionItems.every(i => i.done))

    const newMissions    = missionItems.filter(i => i.type === 'new_story' || i.type === 'in_progress_story')
    const newIds         = new Set(newMissions.map(i => i.storyId))
    const reviewMissions = missionItems.filter(i => i.type === 'review_pattern' && !newIds.has(i.storyId))
    setNewDone(newMissions.length > 0 && newMissions.every(i => i.done))
    setReviewDone(reviewMissions.length > 0 && reviewMissions.every(i => i.done))

    setNewStoriesData(newMissions.map(i => {
      const s = magazineStories.find(ms => ms.id === i.storyId)
      return { id: i.storyId, title: s?.title ?? '', done: i.done }
    }))
    const patByStory = new Map<number, number[]>()
    for (const r of records) {
      if (r.itemType !== 'pattern' || !r.storyId || r.repeatCount === 0) continue
      const list = patByStory.get(r.storyId) ?? []
      list.push(r.reviewCount)
      patByStory.set(r.storyId, list)
    }
    setReviewStoriesData(reviewMissions.map(i => {
      const s      = magazineStories.find(ms => ms.id === i.storyId)
      const counts = patByStory.get(i.storyId) ?? []
      const rc     = counts.length > 0 ? Math.min(...counts) : 0
      return { id: i.storyId, title: s?.title ?? i.storyTitle ?? '', reviewCount: rc, done: i.done }
    }))

    const storyNextReview: Record<number, string> = {}
    for (const r of records) {
      if (r.itemType !== 'pattern' || !r.storyId || !r.nextReviewAt) continue
      const cur = storyNextReview[r.storyId]
      if (!cur || r.nextReviewAt < cur) storyNextReview[r.storyId] = r.nextReviewAt
    }

    const learnedIds = new Set(
      records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
    )

    const heroIds = new Set(newMissions.map(i => i.storyId))
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
      if (storyNextReview[s.id] === tomorrow) {
        list.push({ story: s, label: 'Tomorrow', href: `/patto/stories/${s.id}`, done: false })
      }
    }

    for (const s of magazineStories) {
      if (list.length >= 8) break
      if (heroIds.has(s.id) || missionMap.has(s.id)) continue
      if (storyNextReview[s.id] === tomorrow) continue
      if (!learnedIds.has(s.id)) {
        list.push({ story: s, label: 'Upcoming', href: `/patto/stories/${s.id}`, done: false })
      }
    }

    setScheduledList(list.slice(0, 8))

    // Build All Stories label map for desktop right panel
    const learnedSet = new Set(
      records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0).map(r => r.storyId).filter(Boolean)
    )
    const allMap: Record<number, AllStoryLabel> = {}
    for (const s of magazineStories) {
      const mi = missionMap.get(s.id)
      if (mi) {
        allMap[s.id] = mi.type === 'review_pattern' ? 'Review' : mi.type === 'in_progress_story' ? 'Reading' : 'Today'
      } else if (learnedSet.has(s.id)) {
        allMap[s.id] = 'Done'
      } else {
        allMap[s.id] = 'New'
      }
    }
    setAllStoriesLabelMap(allMap)

    // SRS story-round badges
    const ids = magazineStories.map(s => s.id)
    setSrsTodayId(getTodayRecommendedStoryId(ids))
    setSrsReviewIds(new Set(ids.filter(id => getStoryStatus(id) === 'review_due')))

    // Trainer: has user studied today?
    const todayDate = new Date().toISOString().slice(0, 10)
    setHasStudied(magazineStories.some(s => getStoryRound(s.id).lastCompletedAt === todayDate))
  }, [])

  useEffect(() => {
    loadMissions()
    const onVisible = () => { if (document.visibilityState === 'visible') loadMissions() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [loadMissions])

  // Scenario Engine: home entry message 1.5s after mount
  useEffect(() => {
    const t = trainerRef.current
    if (!t) return

    t.setPage('home')

    // "Welcome back." on first re-login (runs before scenario message)
    let welcomeEndMs = 0
    if (user) {
      const justLoggedIn = localStorage.getItem('patto_just_logged_in')
      if (justLoggedIn) {
        localStorage.removeItem('patto_just_logged_in')
        const createdAt  = user.created_at ? new Date(user.created_at).getTime() : 0
        const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0
        const isFirstLogin = Math.abs(createdAt - lastSignIn) < 2000
        if (!isFirstLogin) {
          welcomeEndMs = 500 + 2000 + 300
          setTimeout(() => trainerRef.current?.showMessage('Welcome back.', 2000), 500)
        }
      }
    }

    // 세션 완료 후 재진입 시 완료 메시지 (visitorType이 확정될 때까지 잠깐 대기)
    if (hasStudied) {
      const timer = setTimeout(() => {
        if (allDone) {
          const todayDate = todayStr()
          const completedToday = new Set(magazineStories.filter(s => getStoryRound(s.id).lastCompletedAt === todayDate).map(s => s.id))
          const completedCount = completedToday.size
          const nextNew = magazineStories.find(s => !completedToday.has(s.id) && getStoryStatus(s.id) === 'new')
          const nextHref = nextNew ? `/patto/session/${nextNew.id}` : '/patto/stories/all'
          trainerRef.current?.ask(`오늘 ${completedCount}개 완료했어요. 잘했어요!`, [
            { label: 'Keep going!', primary: true, onClick: () => { trainerRef.current?.clearMessage(); router.push(nextHref) } },
            { label: 'Done for today', onClick: () => trainerRef.current?.clearMessage() },
          ])
        } else {
          trainerRef.current?.ask("오늘 세션 시작할까요?", [
            {
              label: 'Start',
              primary: true,
              onClick: () => {
                trainerRef.current?.clearMessage()
                router.push(`/patto/session/${nextIncompleteStoryId}`)
              },
            },
            {
              label: 'Later',
              onClick: () => trainerRef.current?.clearMessage(),
            },
          ])
        }
      }, welcomeEndMs > 0 ? welcomeEndMs : 1500)
      return () => clearTimeout(timer)
    }

    // Scenario-based home entry message
    const delay = welcomeEndMs > 0 ? welcomeEndMs : 1500

    const adaptStats = loadStats()
    const level = getLearnerLevel(adaptStats)
    const adaptMsg = getAdaptiveHomeMessage(level, visitorType, getTimeOfDay(), adaptStats)
    const situation = getSpecialSituation(adaptStats)

    let timer: ReturnType<typeof setTimeout>

    // Long absence: special buttons regardless of visitorType
    if (situation?.type === 'long_absence') {
      timer = setTimeout(() => {
        trainerRef.current?.ask(adaptMsg, [
          {
            label: 'Review',
            onClick: () => {
              trainerRef.current?.say("이어서 시작해봐요.", 2000)
              router.push(`/patto/session/${todayStory.id}`)
            },
          },
          {
            label: 'New story',
            primary: true,
            onClick: () => {
              trainerRef.current?.clearMessage()
              router.push('/patto/stories/all')
            },
          },
        ])
      }, delay)
    } else if (visitorType === 'first_visit') {
      // Skip if already shown (e.g. page refresh within same visit session)
      const alreadyShown = (() => { try { return localStorage.getItem('patto_onboarding_shown') === '1' } catch { return false } })()
      if (alreadyShown) {
        // Fall through to a simple welcome
        timer = setTimeout(() => {
          trainerRef.current?.say("다시 오셨군요! 도움이 필요하면 불러주세요.", 3000)
        }, delay)
      } else {
        const markShown = () => { try { localStorage.setItem('patto_onboarding_shown', '1') } catch {} }

        // "소개해드릴까요?" — registered as idleOrbCallback after "둘러볼게요"
        function showIntroAsk() {
          trainerRef.current?.ask("소개해드릴까요?", [
            {
              label: 'Skip',
              onClick: () => {
                trainerRef.current?.say("필요하시면 언제든 불러주세요!", 2500)
                // Re-register so next orb tap shows it again
                setTimeout(() => trainerRef.current?.setIdleOrbCallback(showIntroAsk), 2600)
              },
            },
            {
              label: 'Yes!',
              primary: true,
              onClick: () => {
                trainerRef.current?.clearMessage()
                setShowOnboarding(true)
              },
            },
          ])
        }

        timer = setTimeout(() => {
          // Step 1: welcome whisper
          trainerRef.current?.say("PATTO에 오신 것을 환영해요! 저는 학습을 도와주는 트레이너입니다.", 2000)
          // Step 2: intro offer card after whisper ends
          setTimeout(() => {
            trainerRef.current?.ask("PATTO 소개를 받아볼까요?", [
              {
                label: 'Browse',
                onClick: () => {
                  markShown()
                  trainerRef.current?.say("천천히 구경하세요! 필요하면 불러주세요.", 3000)
                  trainerRef.current?.setIdleOrbCallback(showIntroAsk)
                },
              },
              {
                label: 'Intro',
                primary: true,
                onClick: () => {
                  markShown()
                  trainerRef.current?.clearMessage()
                  setShowOnboarding(true)
                },
              },
            ])
          }, 2300)
        }, delay)
      }
    } else {
      // veteran / returning / regular: "오늘 세션 시작할까요?" + Later + Start
      timer = setTimeout(() => {
        trainerRef.current?.ask('오늘 세션 시작할까요?', [
          {
            label: 'Later',
            onClick: () => {
              trainerRef.current?.clearMessage()
            },
          },
          {
            label: 'Start',
            primary: true,
            onClick: () => {
              trainerRef.current?.clearMessage()
              router.push(`/patto/session/${todayStory.id}`)
            },
          },
        ])
      }, delay)
    }

    return () => {
      clearTimeout(timer)
      trainerRef.current?.setIdleOrbCallback(null)
    }
  }, [user?.id, visitorType, hasStudied, allDone, nextIncompleteStoryId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Chip common height — match summary chips
  const chipPad = '13px 12px 14px'

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      {/* ── Desktop shell ── */}
      <div className="desktop-max">
      <div className="desktop-two-col" style={{ paddingTop: 0 }}>

      {/* ── Left column (always) ── */}
      <div style={{
        paddingTop: 0,
        paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)`,
      }}>

        {/* ── Date ── */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            color: 'var(--pm)', textTransform: 'uppercase', margin: 0,
          }}>
            {getDateLabel()}
          </p>
        </div>

        {/* ── Hero Cover ── */}
        <div
          className={!hasStudied ? 'patto-card-pulse' : undefined}
          style={{ position: 'relative', margin: '12px 20px 0', borderRadius: 20, overflow: 'hidden', height: 340 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={todayStory.imageUrl} alt={todayStory.imageAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.78) 100%)',
          }} />
          <div style={{ position: 'absolute', top: 14, left: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>
              STORY {String(todayStory.id).padStart(2, '0')}
            </span>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 18px 18px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2,
                color: '#fff', margin: '0 0 4px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {todayStory.title}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.3 }}>
                {todayStory.subtitleTranslations?.[prefs.language]
                  ?? (prefs.language !== 'ko' ? (todayStory.subtitleTranslations?.en ?? todayStory.subtitleKo) : todayStory.subtitleKo)}
              </p>
            </div>
            {/* Continue — more transparent */}
            {(() => {
              const heroStoryDone = newStoriesData.find(s => s.id === todayStory.id)?.done ?? false
              if (heroStoryDone) {
                return (
                  <div style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(80,200,120,0.25)',
                    border: '1px solid rgba(80,200,120,0.5)',
                    borderRadius: 999, padding: '9px 16px',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    letterSpacing: '0.01em', whiteSpace: 'nowrap',
                    cursor: 'default',
                  }}>
                    완료 ✓
                  </div>
                )
              }
              return (
                <motion.button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    trainerRef.current?.say("시작해볼게요.", 1200)
                    setTimeout(() => router.push(`/patto/session/${todayStory.id}`), 400)
                  }}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(16px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                    border: '1px solid rgba(255,255,255,0.45)',
                    borderRadius: 999, padding: '9px 16px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    letterSpacing: '0.01em', whiteSpace: 'nowrap',
                  }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  Start
                  <ArrowRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />
                </motion.button>
              )
            })()}
          </div>
        </div>


        {/* ── TODAY card ── */}
        {allDone ? (
          <div style={{
            margin: '12px 20px 0',
            padding: '16px 18px',
            borderRadius: 18,
            background: isDark ? 'rgba(90,184,106,0.12)' : 'rgba(110,201,122,0.15)',
            border: `1px solid ${isDark ? 'rgba(90,184,106,0.25)' : 'rgba(110,201,122,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <PartyPopper style={{ width: 20, height: 20, flexShrink: 0, color: isDark ? 'rgba(100,210,130,0.9)' : 'rgba(35,130,60,0.9)' }} strokeWidth={1.8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: isDark ? 'rgba(100,210,130,0.9)' : 'rgba(35,130,60,0.9)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                {t('home_done_title')}
              </p>
              <p style={{ fontSize: 11, fontWeight: 400, color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(60,90,70,0.75)', margin: 0, lineHeight: 1.4 }}>
                {t('home_done_next', { n: String(Math.min(todayStory.id + 1, 100)).padStart(2, '0') })}
              </p>
            </div>
          </div>
        ) : (newStoriesData.length > 0 || reviewStoriesData.length > 0) && (
          <div style={{ margin: '12px 20px 0' }}>
            <div style={{ ...frostedCard, borderRadius: 18, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '11px 14px 8px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: isDark ? 'rgba(255,255,255,0.75)' : '#5C6BC0', margin: 0, textTransform: 'uppercase' }}>
                  TODAY
                </p>
              </div>
              {/* Items: new stories first, review stories after */}
              {[
                ...newStoriesData.map(s => ({ id: s.id, title: s.title, done: s.done, isReview: false, href: `/patto/stories/${s.id}` })),
                ...reviewStoriesData.map(s => ({ id: s.id, title: s.title, done: s.done, isReview: true, href: `/patto/stories/${s.id}?v=p` })),
              ].map((item, idx, arr) => (
                <button
                  key={`${item.isReview ? 'r' : 'n'}-${item.id}`}
                  type="button"
                  onClick={() => router.push(item.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px',
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: 'transparent', fontFamily: 'inherit',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--pd)' : 'none',
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.done ? 'rgba(107,143,255,0.12)' : 'transparent',
                    border: item.done ? 'none' : `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(100,110,150,0.25)'}`,
                  }}>
                    {item.done && <Check style={{ width: 9, height: 9, color: '#6B8FFF' }} strokeWidth={2.5} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--pm2)', margin: '0 0 1px', textTransform: 'uppercase' }}>
                      Story {String(item.id).padStart(2, '0')}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: item.done ? '#6B8FFF' : (isDark ? 'rgba(255,255,255,0.9)' : 'var(--pt)'), margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: item.done ? 0.5 : 1 }}>
                      {item.title}
                    </p>
                  </div>
                  {item.isReview && (
                    <span style={{
                      flexShrink: 0,
                      fontSize: 9, fontWeight: 700,
                      color: isDark ? 'rgba(192,139,48,0.9)' : 'rgba(150,105,25,0.9)',
                      background: isDark ? 'rgba(192,139,48,0.12)' : 'rgba(192,139,48,0.10)',
                      border: `1px solid ${isDark ? 'rgba(192,139,48,0.25)' : 'rgba(192,139,48,0.22)'}`,
                      borderRadius: 6, padding: '2px 7px',
                    }}>
                      Review
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STORIES (mobile only — desktop shows All Stories panel on right) ── */}
        <div className="mobile-only" style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{
              fontSize: 15, fontWeight: 800, color: 'var(--pt)',
              margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              textShadow: '0 1px 0 rgba(255,255,255,.8), 0 8px 18px rgba(60,70,90,.08)',
            }}>
              Stories
            </p>
            <button
              type="button"
              onClick={() => router.push('/patto/stories/all')}
              style={{
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: 'var(--pm)', letterSpacing: '0.02em',
              }}
            >
              See All <ChevronRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {scheduledList.map(({ story, label, href, done }) => {
              const isToday    = story.id === srsTodayId
              const isReview   = srsReviewIds.has(story.id)
              const chipText   = done ? 'Done' : isToday ? 'Today' : isReview ? 'Review' : label
              const chipGradient = done ? 'rgba(80,200,120,0.85)'
                : isToday  ? '#6B8FFF'
                : isReview ? 'rgba(215,181,109,0.85)'
                : 'rgba(255,255,255,0.3)'
              const cardBorder = isReview && !done
                ? '1.5px solid rgba(192,139,48,0.55)'
                : undefined
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
                    <img src={story.imageUrl} alt={story.imageAlt}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm2)', margin: '0 0 3px', textTransform: 'uppercase' }}>
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

      </div>{/* end left column */}

      {/* ── Right column: All Stories (desktop only) ── */}
      <div className="desktop-show desktop-right-col" style={{ paddingTop: 20, paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)` }}>
        <AllStoriesPanel labelMap={allStoriesLabelMap} />
      </div>

      </div>{/* end desktop-two-col */}
      </div>{/* end desktop-max */}

      {/* Editor Tip / Guide modals moved to Settings → About PATTO */}
      {false && tipOpen && <TipCarousel onClose={() => setTipOpen(false)} initialIndex={getDailyTipIndex()} />}
      {false && guideOpen && <GuideCarousel onClose={() => setGuideOpen(false)} />}

      {/* First-visit onboarding overlay */}
      {showOnboarding && (
        <IntroOnboardingOverlay
          onComplete={() => {
            setShowOnboarding(false)
            trainerRef.current?.say("같이 시작해봐요!", 1500)
            setTimeout(() => {
              try { localStorage.setItem('is_guided_session', 'true') } catch {}
              router.push('/patto/session/1?guided=true')
            }, 600)
          }}
        />
      )}

    </div>
  )
}
