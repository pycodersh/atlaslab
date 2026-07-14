'use client'

import { useCallback, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrainerOrbContext, type OrbState } from './TrainerOrbContext'
import { TrainerContext, type CardSpec, type TrainerCtx } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'
import { getOrbTapMessage, classifyVisitor, getLocalVisitCount, pageToContext } from '@/lib/scenario/scenario-engine'
import { getMissionItems } from '@/lib/srs/engine'
import { getTodayRecommendedStoryId } from '@/lib/srs/story-round'
import { magazineStories } from '@/data/magazine-stories'
import { getLastPosition } from '@/lib/last-position'

// ── Constants ─────────────────────────────────────────────────────────────────
const ORB_SIZE    = 52
const MARGIN      = 20
const DRAG_THRESHOLD = 10
const SNAP_OFFSET = ORB_SIZE / 2 + MARGIN
const STORAGE_KEY = 'orb-position'
const BOTTOM_PAD  = 24          // bottom spacing without tab bar
const SAT_W       = 22          // satellite diameter
const SAT_DIST    = ORB_SIZE / 2 + 28   // orb-center → satellite-center
const MENU_ITEM_W = 44
const MENU_DIST   = 75
const MENU_SPREAD = Math.PI / 5

// ── Orb visuals by state ──────────────────────────────────────────────────────
const ORB_GRADIENT: Record<OrbState, string> = {
  idle:    'radial-gradient(circle at 35% 28%, #E8F0FF, #C8D4FF 40%, #A6B8FF 65%, #8090F0)',
  speaking:'radial-gradient(circle at 35% 28%, #D0E0FF, #8AABFF 35%, #6B8FFF 60%, #4060E0)',
  waiting: 'radial-gradient(circle at 35% 28%, #DCE8FF, #9ABCFF 40%, #88A8FF 65%, #5070E8)',
  done:    'radial-gradient(circle at 35% 28%, #F5F0E8, #E8D8A0 35%, #D7B56D 60%, #B8903A)',
}
const ORB_SHADOW: Record<OrbState, string> = {
  idle:    '0 0 0 1px rgba(255,255,255,0.5) inset, 0 4px 20px rgba(107,143,255,0.4), 0 0 40px rgba(107,143,255,0.15)',
  speaking:'0 0 0 1px rgba(255,255,255,0.5) inset, 0 4px 24px rgba(70,100,220,0.5), 0 0 50px rgba(70,100,220,0.2)',
  waiting: '0 0 0 1px rgba(255,255,255,0.5) inset, 0 4px 20px rgba(80,112,232,0.4), 0 0 40px rgba(80,112,232,0.15)',
  done:    '0 0 0 1px rgba(255,255,255,0.5) inset, 0 4px 20px rgba(184,144,58,0.4), 0 0 50px rgba(184,144,58,0.15)',
}
const EYE_COLOR: Record<OrbState, string> = {
  idle: '#3040A0', speaking: '#3040A0', waiting: '#3040A0', done: '#6B4A10',
}
// Base eye offset per mode (idle look is added on top)
function eyeBase(mode: OrbState): { x: number; y: number } {
  if (mode === 'speaking') return { x: 0,  y: -3 }
  if (mode === 'waiting')  return { x: 0,  y: 3  }
  if (mode === 'done')     return { x: 2,  y: -2 }
  return { x: 0, y: 0 }
}
// Blink intervals per mode [min, max] ms
const BLINK_RANGE: Record<OrbState, [number, number]> = {
  idle:    [5000, 9000],
  speaking:[2000, 3500],
  waiting: [8000, 12000],
  done:    [7000, 11000],
}

// ── Satellite & menu position helpers ─────────────────────────────────────────
function computeSatPos(pos: { x: number; y: number }): { x: number; y: number; angle: number } {
  const W = window.innerWidth
  const H = window.innerHeight
  const cx = pos.x + ORB_SIZE / 2
  const cy = pos.y + ORB_SIZE / 2
  const angle = Math.atan2(cy - H / 2, cx - W / 2) + Math.PI
  const sx = cx + Math.cos(angle) * SAT_DIST - SAT_W / 2
  const sy = cy + Math.sin(angle) * SAT_DIST - SAT_W / 2
  return {
    x: Math.max(0, Math.min(W - SAT_W, sx)),
    y: Math.max(0, Math.min(H - SAT_W, sy)),
    angle,
  }
}

function computeMenuPositions(sat: { x: number; y: number; angle: number }, storyHref: string) {
  const W = window.innerWidth
  const H = window.innerHeight
  const scx = sat.x + SAT_W / 2
  const scy = sat.y + SAT_W / 2
  const items = [
    { label: 'HOME',     href: '/patto/home',   Icon: HomeIcon     },
    { label: 'STORY',    href: storyHref,        Icon: BookIcon     },
    { label: 'PROGRESS', href: '/patto/records', Icon: ChartIcon    },
    { label: 'LIBRARY',  href: '/patto/library', Icon: BookmarkIcon },
  ]
  const half = MENU_SPREAD * 1.5
  return items.map((item, i) => {
    const a = sat.angle - half + MENU_SPREAD * i
    const mx = scx + Math.cos(a) * MENU_DIST - MENU_ITEM_W / 2
    const my = scy + Math.sin(a) * MENU_DIST - MENU_ITEM_W / 2
    return {
      ...item,
      x: Math.max(4, Math.min(W - MENU_ITEM_W - 4, mx)),
      y: Math.max(4, Math.min(H - MENU_ITEM_W - 4, my)),
    }
  })
}

// ── Corner type (for card positioning) ───────────────────────────────────────
export type Corner = 'br' | 'bl' | 'tr' | 'tl'

// ── Intro card slot (module-level, no context needed) ─────────────────────────
type IntroNodeFactory = (corner: Corner, isDark: boolean) => React.ReactNode
let _introFactory: IntroNodeFactory | null = null
let _introForceRerender: (() => void) | null = null
export function setOrbIntroCard(fn: IntroNodeFactory | null) {
  _introFactory = fn
  _introForceRerender?.()
}

// ── Position helpers ──────────────────────────────────────────────────────────
function loadSavedPos(): { x: number; y: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function savePos(x: number, y: number) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y })) } catch {}
}
function defaultPos(): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  const W = window.innerWidth
  const H = window.innerHeight
  return { x: W - SNAP_OFFSET, y: H - BOTTOM_PAD - SNAP_OFFSET }
}

// ── Nav icons ─────────────────────────────────────────────────────────────────
function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function BookIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  )
}
function ChartIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}
function BookmarkIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
  )
}

// ── Help Menu SVG icons ───────────────────────────────────────────────────────
function RepeatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B8FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-3.57"/>
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B8FFF" strokeWidth="2.5" strokeLinecap="round">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  )
}
function ExitIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// ── Help Menu ─────────────────────────────────────────────────────────────────
type HelpAction = 'repeat' | 'pause' | 'exit'
const HELP_ITEMS: Array<{ label: string; action: HelpAction; exit?: boolean }> = [
  { label: 'Repeat', action: 'repeat' },
  { label: 'Pause',  action: 'pause'  },
  { label: 'Exit',   action: 'exit', exit: true },
]

function HelpMenu({ ctx, dark }: { ctx: TrainerCtx | null; dark: boolean }) {
  const textColor  = dark ? '#e8e0f8' : '#1a1a2e'
  const textExit   = dark ? 'rgba(255,255,255,0.38)' : '#aaa'
  const iconBg     = dark ? 'rgba(142,167,255,0.14)' : 'rgba(142,167,255,0.10)'
  const iconBgExit = 'rgba(200,200,220,0.08)'
  const divider    = dark ? 'rgba(142,167,255,0.10)' : 'rgba(142,167,255,0.08)'
  return (
    <div style={{ minWidth: 150 }}>
      <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8EA7FF' }}>
        도움이 필요하세요?
      </p>
      {HELP_ITEMS.map((item, i) => (
        <div key={item.action}>
          {i > 0 && <div style={{ height: 0, borderTop: `0.5px solid ${divider}`, margin: '0' }} />}
          <button
            onClick={() => {
              if      (item.action === 'repeat') ctx?.handleMenuRepeat()
              else if (item.action === 'pause')  ctx?.handleMenuPause()
              else if (item.action === 'exit')   ctx?.handleMenuExit()
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: item.exit ? iconBgExit : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.action === 'repeat' && <RepeatIcon />}
              {item.action === 'pause'  && <PauseIcon />}
              {item.action === 'exit'   && <ExitIcon />}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: item.exit ? textExit : textColor }}>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Card button SVG icons ─────────────────────────────────────────────────────
function PlaySvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
}
function CheckSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

// ── Auto-wrap text ────────────────────────────────────────────────────────────
function AutoWrapText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.whiteSpace = 'nowrap'; el.style.overflow = 'hidden'; el.style.wordBreak = 'normal'
    if (el.scrollWidth > el.clientWidth + 1) {
      el.style.whiteSpace = 'normal'; el.style.wordBreak = 'keep-all'; el.style.overflow = ''
    }
  })
  return (
    <p ref={ref} style={{ whiteSpace: 'nowrap', overflow: 'hidden', wordBreak: 'normal', ...style }}>{text}</p>
  )
}

// ── Card components ───────────────────────────────────────────────────────────
function WhisperCard({ card, dark, textMain }: { card: CardSpec; dark: boolean; textMain: string }) {
  const hasMs = typeof card.ms === 'number' && card.ms > 0
  return (
    <>
      <AutoWrapText text={card.message} style={{ margin: 0, fontSize: 14, fontWeight: 500, color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em' }} />
      {hasMs && (
        <div style={{ marginTop: 8, height: 2, background: dark ? 'rgba(142,167,255,0.12)' : 'rgba(142,167,255,0.15)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #6B8FFF, #A6B8FF)', transformOrigin: 'left center', animationName: 'whisperProgress', animationDuration: `${card.ms}ms`, animationTimingFunction: 'linear', animationFillMode: 'forwards', willChange: 'transform' }} />
        </div>
      )}
    </>
  )
}

const BTN_P = 'trainer-btn trainer-btn-primary'
const BTN_S = 'trainer-btn trainer-btn-secondary'

function ActionCard({ card, dark, textMain, textSub, onClear, cardIsPlaying }: {
  card: CardSpec; dark: boolean; textMain: string; textSub: string; textPri?: string; textSec?: string; onClear: () => void; cardIsPlaying: boolean
}) {
  const [, setPressedIdx] = useState<number | null>(null)
  const buttons = card.buttons ?? []
  const count = buttons.length
  const sorted = count === 2
    ? [...buttons].sort((a, b) => {
        const aP = !!(a.primary || a.btnVariant === 'done' || a.btnVariant === 'play')
        const bP = !!(b.primary || b.btnVariant === 'done' || b.btnVariant === 'play')
        return Number(aP) - Number(bP)
      })
    : buttons
  return (
    <>
      <AutoWrapText text={card.message} style={{ margin: 0, fontSize: 14, fontWeight: 500, color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em', textAlign: 'center', marginBottom: (card.subtext || count > 0) ? 4 : 0 }} />
      {card.subtext && <p style={{ margin: 0, marginBottom: count > 0 ? 10 : 0, fontSize: 12, color: textSub, lineHeight: 1.5 }}>{card.subtext}</p>}
      {count > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: count === 1 ? 'center' : 'space-between' }}>
          {sorted.map((btn, i) => {
            if (btn.btnVariant === 'play') {
              return (
                <button key={i} type="button" className={BTN_P} onClick={() => btn.onClick()} disabled={cardIsPlaying}>
                  {cardIsPlaying ? <span style={{ fontSize: 10, lineHeight: 1 }}>▶</span> : <PlaySvg />}
                  {cardIsPlaying ? 'Playing...' : btn.label}
                </button>
              )
            }
            const isPrimary = !!(btn.primary || btn.btnVariant === 'done')
            return (
              <button key={i} type="button" className={isPrimary ? BTN_P : BTN_S}
                onPointerDown={() => setPressedIdx(i)} onPointerUp={() => setPressedIdx(null)} onPointerCancel={() => setPressedIdx(null)}
                onClick={() => { onClear(); btn.onClick() }}>
                {btn.btnVariant === 'done' && <CheckSvg />}{btn.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

function SessionCard({ card, dark, textMain, textSub, onClear }: {
  card: CardSpec; dark: boolean; textMain: string; textSub: string; textPri?: string; textSec?: string; onClear: () => void
}) {
  const buttons = card.buttons ?? []
  const count = buttons.length
  const hasButtons = count > 0
  function stagger(i: number): React.CSSProperties {
    return { animationName: 'sessionCardItem', animationDuration: '0.30s', animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)', animationDelay: `${i * 40}ms`, animationFillMode: 'both' }
  }
  const sorted = count === 2 ? [...buttons].sort((a, b) => Number(!!a.primary) - Number(!!b.primary)) : buttons
  return (
    <>
      <p style={{ ...stagger(0), margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#8EA7FF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Session</p>
      <p style={{ ...stagger(1), margin: 0, fontSize: 16, fontWeight: 600, color: textMain, lineHeight: 1.35, letterSpacing: '-0.01em', marginBottom: card.subtext ? 4 : 0, fontFamily: 'var(--font-playfair, serif)' }}>{card.message}</p>
      {card.subtext && <p style={{ ...stagger(2), margin: '0 0 0', fontSize: 12, color: textSub, lineHeight: 1.5 }}>{card.subtext}</p>}
      {hasButtons && <div style={{ ...stagger(card.subtext ? 3 : 2), height: 0, borderTop: `0.5px solid ${dark ? 'rgba(142,167,255,0.15)' : 'rgba(142,167,255,0.12)'}`, margin: '12px 0' }} />}
      {hasButtons && (
        <div style={{ ...stagger(card.subtext ? 4 : 3), display: 'flex', gap: 8, justifyContent: count === 1 ? 'center' : 'space-between' }}>
          {sorted.map((btn, i) => (
            <button key={i} type="button" className={!!btn.primary ? BTN_P : BTN_S} onClick={() => { onClear(); btn.onClick() }}>{btn.label}</button>
          ))}
        </div>
      )}
    </>
  )
}

function ConvCard({ card, exitCard, corner, isDark, onClear, trainerCtx, cardIsPlaying }: {
  card: CardSpec | null; exitCard: CardSpec | null; corner: Corner; isDark: boolean; onClear: () => void; trainerCtx: TrainerCtx | null; cardIsPlaying: boolean
}) {
  const isRight  = corner.endsWith('r')
  const isBottom = corner.startsWith('b')
  const active   = card ?? exitCard
  const isExit   = !card && !!exitCard
  const inClass  = isRight ? 'dock-card-in-br'  : 'dock-card-in-bl'
  const outClass = isRight ? 'dock-card-out-br' : 'dock-card-out-bl'
  if (!active) return null
  const cardBg     = isDark ? 'rgba(30,28,48,0.85)'  : 'rgba(255,255,255,0.75)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(142,167,255,0.25)'
  const cardShadow = isDark ? '0 16px 40px rgba(0,0,0,0.40)' : '0 -3px 16px rgba(142,167,255,0.12), 0 8px 24px rgba(142,167,255,0.10)'
  const textMain   = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const textSub    = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const textPri    = isDark ? '#A6B8FF' : '#6B8FFF'
  const textSec    = isDark ? 'rgba(255,255,255,0.38)' : '#9a9ab8'
  const n = 4
  function radius(base: number) { return isRight ? `${base}px ${base}px ${n}px ${base}px` : `${base}px ${base}px ${base}px ${n}px` }
  const isHelp = active.isHelp
  let borderRadius: string, padding: string, minWidth: number, maxWidth: number | undefined
  if (isHelp)                   { borderRadius = radius(16); padding = '14px 14px 10px'; minWidth = 150; maxWidth = 220 }
  else if (active.size === 'small')  { borderRadius = radius(16); padding = '10px 14px'; minWidth = 120; maxWidth = 260 }
  else if (active.size === 'medium') { borderRadius = radius(16); padding = '14px 16px'; minWidth = 200; maxWidth = 260 }
  else                          { borderRadius = radius(16); padding = '14px 16px'; minWidth = 240; maxWidth = 280 }
  return (
    <div key={active.id} className={isExit ? outClass : inClass} style={{
      position: 'absolute',
      [isBottom ? 'bottom' : 'top']: ORB_SIZE + 10,
      [isRight  ? 'right'  : 'left']: 0,
      minWidth, maxWidth, borderRadius, padding,
      background: cardBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: cardBorder, boxShadow: cardShadow,
      pointerEvents: isExit ? 'none' : 'auto', zIndex: 1, willChange: 'transform, opacity',
    }}>
      {isHelp ? (
        <HelpMenu ctx={trainerCtx} dark={isDark} />
      ) : active.size === 'small' ? (
        <WhisperCard card={active} dark={isDark} textMain={textMain} />
      ) : active.size === 'medium' ? (
        <ActionCard card={active} dark={isDark} textMain={textMain} textSub={textSub} textPri={textPri} textSec={textSec} onClear={onClear} cardIsPlaying={cardIsPlaying} />
      ) : (
        <SessionCard card={active} dark={isDark} textMain={textMain} textSub={textSub} textPri={textPri} textSec={textSec} onClear={onClear} />
      )}
    </div>
  )
}

// ── Main Orb component ────────────────────────────────────────────────────────
export function TrainerOrb() {
  const { orbState }   = useContext(TrainerOrbContext)
  const trainerCtx     = useContext(TrainerContext)
  const { theme }      = useTheme()
  const isDark         = theme === 'dark'
  const pathname       = usePathname()
  const router         = useRouter()
  const routerRef      = useRef(router)
  routerRef.current    = router

  const trainerCtxRef  = useRef(trainerCtx)
  trainerCtxRef.current = trainerCtx

  const orbStateRef    = useRef(orbState)
  orbStateRef.current  = orbState

  // ── Menu state ────────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen]   = useState(false)
  const menuOpenRef               = useRef(menuOpen)
  menuOpenRef.current             = menuOpen

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // ── Intro card ────────────────────────────────────────────────────────────
  const [, introTick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    _introForceRerender = introTick
    return () => { _introForceRerender = null }
  }, [introTick])

  // ── Eye animation ─────────────────────────────────────────────────────────
  const [eyeBlink,  setEyeBlink]  = useState(false)
  const [eyeLookX,  setEyeLookX]  = useState(0)
  const blinkTimerRef             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lookTimerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function scheduleBlink() {
      const [min, max] = BLINK_RANGE[orbStateRef.current]
      blinkTimerRef.current = setTimeout(() => {
        setEyeBlink(true)
        setTimeout(() => { setEyeBlink(false); scheduleBlink() }, 110)
      }, min + Math.random() * (max - min))
    }
    function scheduleLook() {
      if (orbStateRef.current !== 'idle') return
      lookTimerRef.current = setTimeout(() => {
        const dir = Math.random() > 0.5 ? 3 : -3
        setEyeLookX(dir)
        setTimeout(() => { setEyeLookX(0); scheduleLook() }, 1500)
      }, 5000 + Math.random() * 4000)
    }
    scheduleBlink()
    scheduleLook()
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
      if (lookTimerRef.current)  clearTimeout(lookTimerRef.current)
    }
  }, [orbState])

  // Reset look when mode changes away from idle
  useEffect(() => {
    if (orbState !== 'idle') setEyeLookX(0)
  }, [orbState])

  // ── Card exit animation ───────────────────────────────────────────────────
  const card         = trainerCtx?.card ?? null
  const prevCardRef  = useRef<CardSpec | null>(null)
  const [exitCard, setExitCard] = useState<CardSpec | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [orbCardScale, setOrbCardScale] = useState(1)

  useEffect(() => {
    const prev = prevCardRef.current
    if (prev && !card) {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
      setExitCard(prev)
      exitTimerRef.current = setTimeout(() => setExitCard(null), 200)
      setOrbCardScale(1)
    } else if (!prev && card) {
      setOrbCardScale(1.05)
    }
    prevCardRef.current = card
  }, [card])

  // ── Position state ────────────────────────────────────────────────────────
  const [pos, setPos]       = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  const corner: Corner = typeof window !== 'undefined'
    ? ((pos.x + ORB_SIZE / 2 > window.innerWidth / 2 ? 'r' : 'l') as 'r' | 'l') === 'r'
      ? (pos.y + ORB_SIZE / 2 > window.innerHeight / 2 ? 'br' : 'tr')
      : (pos.y + ORB_SIZE / 2 > window.innerHeight / 2 ? 'bl' : 'tl')
    : 'br'

  const [isDragging, setIsDragging] = useState(false)
  const [dragScale,  setDragScale]  = useState(1)

  useLayoutEffect(() => {
    const saved = loadSavedPos()
    if (saved) setPos({ x: saved.x, y: saved.y })
    else       setPos(defaultPos())
    setMounted(true)
  }, [])

  // ── Drag & tap ────────────────────────────────────────────────────────────
  const hasDraggedRef   = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const orbRef          = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    hasDraggedRef.current = false
    orbRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartRef.current) return
    const dx = e.clientX - pointerStartRef.current.x
    const dy = e.clientY - pointerStartRef.current.y
    if (!hasDraggedRef.current && Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
      hasDraggedRef.current = true
      setIsDragging(true)
      setDragScale(1.08)
      if (menuOpenRef.current) setMenuOpen(false)
    }
    if (!hasDraggedRef.current) return
    const W = window.innerWidth; const H = window.innerHeight
    setPos({
      x: Math.max(0, Math.min(W - ORB_SIZE, e.clientX - ORB_SIZE / 2)),
      y: Math.max(0, Math.min(H - ORB_SIZE - BOTTOM_PAD, e.clientY - ORB_SIZE / 2)),
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (hasDraggedRef.current) {
      const W = window.innerWidth; const H = window.innerHeight
      const finalX = Math.max(0, Math.min(W - ORB_SIZE, e.clientX - ORB_SIZE / 2))
      const finalY = Math.max(0, Math.min(H - ORB_SIZE - BOTTOM_PAD, e.clientY - ORB_SIZE / 2))
      setPos({ x: finalX, y: finalY })
      savePos(finalX, finalY)
    } else {
      // Menu open → just close menu
      if (menuOpenRef.current) {
        setMenuOpen(false)
      } else {
        const ctx = trainerCtxRef.current
        if (ctx?.card) {
          ctx.dismissCard()
        } else if (ctx?.cardIsPlaying) {
          ctx.handleOrbTapAudio()
        } else if (ctx?.page === 'library') {
          const wsRem = Number(sessionStorage.getItem('ws-remaining') ?? '-1')
          if (wsRem > 0) {
            ctx?.showAction('문장 써볼까요?', [
              { label: 'Later', onClick: () => ctx?.clearMessage() },
              { label: 'Start', primary: true, onClick: () => ctx?.clearMessage() },
            ])
          } else if (wsRem === 0) {
            ctx?.say('오늘은 여기까지예요. 내일 또 해요!', 3000)
          } else {
            ctx?.say('오늘 배운 패턴으로 문장 써봐요!', 2500)
          }
        } else if (ctx?.page === 'session' || (ctx?.sessionPhase !== 'inactive' && ctx?.sessionPhase !== 'browsing')) {
          ctx?.handleMenuExit()
        } else {
          const hasAsk = ctx?.restorePendingAsk?.()
          if (!hasAsk) {
            const items = getMissionItems()
            const nextIncomplete = items.find(i => !i.done)
            if (nextIncomplete) {
              ctx?.showAction('세션을 시작할까요?', [
                { label: 'Later', onClick: () => ctx?.clearMessage() },
                { label: 'Start', primary: true, onClick: () => {
                  ctx?.clearMessage()
                  routerRef.current.push(`/patto/session/${nextIncomplete.storyId}`)
                }},
              ])
            } else {
              const allStoryIds = magazineStories.map(s => s.id)
              const nextId = getTodayRecommendedStoryId(allStoryIds)
              if (nextId) {
                ctx?.showAction('추가 세션을 진행할까요?', [
                  { label: 'Later', onClick: () => ctx?.clearMessage() },
                  { label: 'Start', primary: true, onClick: () => {
                    ctx?.clearMessage()
                    routerRef.current.push(`/patto/session/${nextId}`)
                  }},
                ])
              } else {
                ctx?.say('오늘 학습 완료! 잘했어요.', 2500)
              }
            }
          }
        }
      }
    }
    setIsDragging(false)
    setDragScale(1)
    pointerStartRef.current = null
    hasDraggedRef.current = false
  }, [])

  const isPaused = trainerCtx?.sessionPhase === 'paused'

  // ── Derived values ────────────────────────────────────────────────────────
  const lastPos    = getLastPosition()
  const storyHref  = lastPos ? `/patto/stories/${lastPos.storyId}` : '/patto/stories/1'
  const satPos     = mounted ? computeSatPos(pos) : { x: 0, y: 0, angle: 0 }
  const menuItems  = mounted ? computeMenuPositions(satPos, storyHref) : []

  const base       = eyeBase(orbState)
  const eyeX       = orbState === 'idle' ? eyeLookX : base.x
  const eyeY       = base.y
  const eyeColor   = EYE_COLOR[orbState]

  // Dark-mode satellite / menu colors
  const satBg      = isDark
    ? 'radial-gradient(circle at 35% 28%, #2A3860, #1E2A50 50%, #3A4870)'
    : 'radial-gradient(circle at 35% 28%, #E8F0FF, #C8D4FF 50%, #8090F0)'
  const satShadow  = menuOpen
    ? `0 2px 8px rgba(107,143,255,0.35), 0 0 0 3px rgba(200,212,255,0.5)`
    : '0 2px 8px rgba(107,143,255,0.35)'
  const menuBg     = isDark ? 'rgba(30,40,80,0.9)'  : 'rgba(255,255,255,0.9)'
  const menuBorder = isDark ? '0.5px solid rgba(100,120,200,0.4)' : '0.5px solid rgba(200,212,255,0.7)'
  const iconColor  = isDark ? '#A6B8FF' : '#5C6BC0'

  if (!mounted) return null

  return (
    <>
      {/* ── Satellite ───────────────────────────────────────────────────── */}
      <div
        onClick={() => setMenuOpen(v => !v)}
        style={{
          position:     'fixed',
          left:         satPos.x,
          top:          satPos.y,
          width:        SAT_W,
          height:       SAT_W,
          borderRadius: '50%',
          background:   satBg,
          boxShadow:    satShadow,
          zIndex:       205,
          cursor:       'pointer',
          touchAction:  'none',
          userSelect:   'none',
          transition:   isDragging
            ? 'none'
            : 'left 0.35s cubic-bezier(0.34,1.2,0.64,1), top 0.35s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      />

      {/* ── Menu overlay (click-outside to close) ───────────────────────── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 195 }}
        />
      )}

      {/* ── Nav menu items ──────────────────────────────────────────────── */}
      {menuItems.map((item, i) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={() => setMenuOpen(false)}
          style={{
            position:     'fixed',
            left:         item.x,
            top:          item.y,
            width:        MENU_ITEM_W,
            height:       MENU_ITEM_W,
            borderRadius: '50%',
            background:   menuBg,
            border:       menuBorder,
            boxShadow:    '0 2px 10px rgba(107,143,255,0.15)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            zIndex:       206,
            opacity:      menuOpen ? 1 : 0,
            transform:    menuOpen ? 'scale(1)' : 'scale(0.5)',
            transition:   `opacity 0.15s ease ${i * 40}ms, transform 0.15s cubic-bezier(0.34,1.2,0.64,1) ${i * 40}ms`,
            pointerEvents: menuOpen ? 'auto' : 'none',
            textDecoration: 'none',
          }}
        >
          <item.Icon color={iconColor} />
        </Link>
      ))}

      {/* ── Main orb ────────────────────────────────────────────────────── */}
      <div
        style={{
          position:   'fixed',
          left:       pos.x,
          top:        pos.y,
          width:      ORB_SIZE,
          height:     ORB_SIZE,
          zIndex:     200,
          touchAction:'none',
          userSelect: 'none',
          opacity:    isPaused ? 0.45 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Intro onboarding card */}
        {!isDragging && _introFactory && _introFactory(corner, isDark)}

        {/* Conversation card */}
        {!isDragging && (
          <ConvCard
            card={card}
            exitCard={exitCard}
            corner={corner}
            isDark={isDark}
            onClear={() => trainerCtxRef.current?.clearMessage()}
            trainerCtx={trainerCtx}
            cardIsPlaying={trainerCtx?.cardIsPlaying ?? false}
          />
        )}

        {/* Breathing wrapper */}
        <div
          className={!isDragging ? 'dock-orb-breathe' : ''}
          style={{ willChange: 'transform, opacity', position: 'relative' }}
        >
          {/* Orb shell */}
          <div
            ref={orbRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              width:        ORB_SIZE,
              height:       ORB_SIZE,
              borderRadius: '50%',
              position:     'relative',
              cursor:       isDragging ? 'grabbing' : 'pointer',
              background:   ORB_GRADIENT[orbState],
              boxShadow:    ORB_SHADOW[orbState],
              transform:    `scale(${dragScale * orbCardScale})`,
              transition:   isDragging
                ? 'box-shadow 0.2s ease, transform 0.15s ease'
                : 'box-shadow 0.3s ease, transform 0.2s ease, background 0.4s ease',
              overflow: 'hidden',
              willChange: 'transform',
            }}
          >
            {/* Eyes */}
            <div
              style={{
                position:  'absolute',
                top:       '44%',
                left:      '50%',
                transform: `translate(-50%, -50%) translate(${eyeX}px, ${eyeY}px)`,
                display:   'flex',
                gap:       9,
                transition: isDragging ? 'none' : 'transform 0.4s ease',
                pointerEvents: 'none',
              }}
            >
              {[0, 1].map(j => (
                <div
                  key={j}
                  style={{
                    width:        5,
                    height:       eyeBlink ? 1 : 5,
                    borderRadius: '50%',
                    background:   eyeColor,
                    transition:   eyeBlink ? 'height 0.03s ease' : 'height 0.08s ease',
                    flexShrink:   0,
                  }}
                />
              ))}
            </div>

            {/* Specular highlight */}
            <div
              style={{
                position:   'absolute',
                top: 7, left: 9,
                width: 12, height: 8,
                borderRadius: '50%',
                background:   'rgba(255,255,255,0.55)',
                transform:    'rotate(-25deg)',
                filter:       'blur(1.5px)',
                pointerEvents:'none',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
