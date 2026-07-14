'use client'

import { useCallback, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { TrainerOrbContext, type OrbState } from './TrainerOrbContext'
import { TrainerContext, type CardSpec, type TrainerCtx } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { getOrbTapMessage, classifyVisitor, getLocalVisitCount, pageToContext } from '@/lib/scenario/scenario-engine'
import { useRouter } from 'next/navigation'
import { getMissionItems } from '@/lib/srs/engine'
import { getTodayRecommendedStoryId } from '@/lib/srs/story-round'
import { magazineStories } from '@/data/magazine-stories'

// ── Constants ─────────────────────────────────────────────────────────────────
const ORB_SIZE = 52
const MARGIN = 20
const DRAG_THRESHOLD = 10
const SNAP_OFFSET = ORB_SIZE / 2 + MARGIN
const STORAGE_KEY = 'orb-position'

// ── State configs ─────────────────────────────────────────────────────────────
interface WaveConfig {
  colors: [string, string, string]
  waveAmp: number
  waveSpeed: number
  pulseAmp: number
  pulseSpeed: number
  glowSize: number
}

const STATE_CONFIGS: Record<OrbState, WaveConfig> = {
  idle: {
    colors: ['#C8D4FF', '#A6B8FF', '#8090F0'],
    waveAmp: 0.5, waveSpeed: 0.3,
    pulseAmp: 0.015, pulseSpeed: 0.008,
    glowSize: 0.3,
  },
  speaking: {
    colors: ['#B8CCFF', '#6B8FFF', '#4060E0'],
    waveAmp: 3.0, waveSpeed: 1.2,
    pulseAmp: 0.04, pulseSpeed: 0.025,
    glowSize: 0.7,
  },
  waiting: {
    colors: ['#C0D8FF', '#88A8FF', '#5070E8'],
    waveAmp: 1.8, waveSpeed: 0.7,
    pulseAmp: 0.035, pulseSpeed: 0.012,
    glowSize: 0.6,
  },
  done: {
    colors: ['#E0EAFF', '#D7B56D', '#B8903A'],
    waveAmp: 4.0, waveSpeed: 2.0,
    pulseAmp: 0.06, pulseSpeed: 0.04,
    glowSize: 1.0,
  },
}

// ── Position helpers ──────────────────────────────────────────────────────────
export type Corner = 'br' | 'bl' | 'tr' | 'tl'

// ── Intro card slot (module-level, no context needed) ─────────────────────────
type IntroNodeFactory = (corner: Corner, isDark: boolean) => React.ReactNode
let _introFactory: IntroNodeFactory | null = null
let _introForceRerender: (() => void) | null = null
export function setOrbIntroCard(fn: IntroNodeFactory | null) {
  _introFactory = fn
  _introForceRerender?.()
}

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
  return {
    x: W - SNAP_OFFSET,
    y: H - (TAB_BAR_HEIGHT + 16) - SNAP_OFFSET,
  }
}

// ── Canvas wave renderer ───────────────────────────────────────────────────────
function useWaveCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  orbState: OrbState,
) {
  const frameRef = useRef<number>(0)
  const tRef = useRef(0)
  const cfgRef = useRef<WaveConfig>(STATE_CONFIGS[orbState])

  useEffect(() => {
    cfgRef.current = STATE_CONFIGS[orbState]
  }, [orbState])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const R = ORB_SIZE / 2
    const dpr = window.devicePixelRatio || 1
    canvas.width = ORB_SIZE * dpr
    canvas.height = ORB_SIZE * dpr
    ctx.scale(dpr, dpr)

    function draw() {
      if (!ctx || !canvas) return
      const cfg = cfgRef.current
      tRef.current += 1

      ctx.clearRect(0, 0, ORB_SIZE, ORB_SIZE)

      ctx.save()
      ctx.beginPath()
      ctx.arc(R, R, R, 0, Math.PI * 2)
      ctx.clip()

      const t = tRef.current

      cfg.colors.forEach((color, i) => {
        const phase = (i / 3) * Math.PI * 2
        const pulse = 1 + Math.sin(t * cfg.pulseSpeed + phase) * cfg.pulseAmp

        ctx.beginPath()
        const yBase = R + R * 0.15 * (i - 1)

        ctx.moveTo(0, yBase)
        for (let x = 0; x <= ORB_SIZE; x += 2) {
          const wave1 = Math.sin((x / ORB_SIZE) * Math.PI * 2 + t * cfg.waveSpeed + phase) * cfg.waveAmp
          const wave2 = Math.sin((x / ORB_SIZE) * Math.PI * 3.5 + t * cfg.waveSpeed * 0.7 + phase) * cfg.waveAmp * 0.4
          ctx.lineTo(x, (yBase + wave1 + wave2) * pulse)
        }
        ctx.lineTo(ORB_SIZE, ORB_SIZE + 20)
        ctx.lineTo(0, ORB_SIZE + 20)
        ctx.closePath()

        const alpha = 0.55 - i * 0.1
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      const glowAlpha = cfg.glowSize * (0.35 + Math.sin(t * cfg.pulseSpeed * 2) * 0.08)
      const grd = ctx.createRadialGradient(R, R, 0, R, R, R * 0.7)
      grd.addColorStop(0, `rgba(107,143,255,${glowAlpha})`)
      grd.addColorStop(1, 'rgba(107,143,255,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, ORB_SIZE, ORB_SIZE)

      ctx.restore()

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [canvasRef])
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
      <p style={{
        margin: '0 0 10px', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8EA7FF',
      }}>
        도움이 필요하세요?
      </p>
      {HELP_ITEMS.map((item, i) => (
        <div key={item.action}>
          {i > 0 && (
            <div style={{ height: 0, borderTop: `0.5px solid ${divider}`, margin: '0' }} />
          )}
          <button
            onClick={() => {
              if      (item.action === 'repeat') ctx?.handleMenuRepeat()
              else if (item.action === 'pause')  ctx?.handleMenuPause()
              else if (item.action === 'exit')   ctx?.handleMenuExit()
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: item.exit ? iconBgExit : iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.action === 'repeat' && <RepeatIcon />}
              {item.action === 'pause'  && <PauseIcon />}
              {item.action === 'exit'   && <ExitIcon />}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 500,
              color: item.exit ? textExit : textColor,
            }}>
              {item.label}
            </span>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Card button variants (SVG icons) ──────────────────────────────────────────
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
    el.style.whiteSpace = 'nowrap'
    el.style.overflow = 'hidden'
    el.style.wordBreak = 'normal'
    if (el.scrollWidth > el.clientWidth + 1) {
      el.style.whiteSpace = 'normal'
      el.style.wordBreak = 'keep-all'
      el.style.overflow = ''
    }
  })

  return (
    <p ref={ref} style={{ whiteSpace: 'nowrap', overflow: 'hidden', wordBreak: 'normal', ...style }}>
      {text}
    </p>
  )
}

// ── 1. Whisper Card ───────────────────────────────────────────────────────────
function WhisperCard({ card, dark, textMain }: {
  card: CardSpec; dark: boolean; textMain: string
}) {
  const hasMs = typeof card.ms === 'number' && card.ms > 0
  return (
    <>
      <AutoWrapText text={card.message} style={{
        margin: 0, fontSize: 14, fontWeight: 500,
        color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em',
      }} />
      {hasMs && (
        <div style={{
          marginTop: 8, height: 2,
          background: dark ? 'rgba(142,167,255,0.12)' : 'rgba(142,167,255,0.15)',
          borderRadius: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6B8FFF, #A6B8FF)',
            transformOrigin: 'left center',
            animationName: 'whisperProgress',
            animationDuration: `${card.ms}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            willChange: 'transform',
          }} />
        </div>
      )}
    </>
  )
}

// ── 2. Action Card ────────────────────────────────────────────────────────────
const BTN_P = 'trainer-btn trainer-btn-primary'
const BTN_S = 'trainer-btn trainer-btn-secondary'

function ActionCard({ card, dark, textMain, textSub, onClear, cardIsPlaying }: {
  card: CardSpec; dark: boolean
  textMain: string; textSub: string; textPri?: string; textSec?: string
  onClear: () => void; cardIsPlaying: boolean
}) {
  const [pressedIdx, setPressedIdx] = useState<number | null>(null)
  const buttons = card.buttons ?? []
  const count = buttons.length

  // Sort: secondary left, primary right when 2 buttons
  const sorted = count === 2
    ? [...buttons].sort((a, b) => {
        const aP = !!(a.primary || a.btnVariant === 'done' || a.btnVariant === 'play')
        const bP = !!(b.primary || b.btnVariant === 'done' || b.btnVariant === 'play')
        return Number(aP) - Number(bP)
      })
    : buttons

  return (
    <>
      <AutoWrapText text={card.message} style={{
        margin: 0, fontSize: 14, fontWeight: 500,
        color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em',
        textAlign: 'center',
        marginBottom: (card.subtext || count > 0) ? 4 : 0,
      }} />
      {card.subtext && (
        <p style={{
          margin: 0, marginBottom: count > 0 ? 10 : 0,
          fontSize: 12, color: textSub, lineHeight: 1.5,
        }}>
          {card.subtext}
        </p>
      )}
      {count > 0 && (
        <div style={{
          display: 'flex', gap: 8, marginTop: 10,
          justifyContent: count === 1 ? 'center' : 'space-between',
        }}>
          {sorted.map((btn, i) => {
            if (btn.btnVariant === 'play') {
              return (
                <button key={i} type="button"
                  className={BTN_P}
                  onClick={() => btn.onClick()}
                  disabled={cardIsPlaying}
                >
                  {cardIsPlaying ? <span style={{ fontSize: 10, lineHeight: 1 }}></span> : <PlaySvg />}
                  {cardIsPlaying ? 'Playing...' : btn.label}
                </button>
              )
            }
            const isPrimary = !!(btn.primary || btn.btnVariant === 'done')
            return (
              <button key={i} type="button"
                className={isPrimary ? BTN_P : BTN_S}
                onPointerDown={() => setPressedIdx(i)}
                onPointerUp={() => setPressedIdx(null)}
                onPointerCancel={() => setPressedIdx(null)}
                onClick={() => { onClear(); btn.onClick() }}
              >
                {btn.btnVariant === 'done' && <CheckSvg />}
                {btn.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── 3. Session Card ───────────────────────────────────────────────────────────
function SessionCard({ card, dark, textMain, textSub, onClear }: {
  card: CardSpec; dark: boolean
  textMain: string; textSub: string; textPri?: string; textSec?: string
  onClear: () => void
}) {
  const buttons = card.buttons ?? []
  const count = buttons.length
  const hasButtons = count > 0

  function stagger(i: number): React.CSSProperties {
    return {
      animationName: 'sessionCardItem',
      animationDuration: '0.30s',
      animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
      animationDelay: `${i * 40}ms`,
      animationFillMode: 'both',
    }
  }

  // Sort: secondary left, primary right when 2 buttons; otherwise primary first stacked
  const sorted = count === 2
    ? [...buttons].sort((a, b) => Number(!!a.primary) - Number(!!b.primary))
    : buttons

  return (
    <>
      <p style={{
        ...stagger(0),
        margin: '0 0 4px', fontSize: 10, fontWeight: 700,
        color: '#8EA7FF', textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        Session
      </p>
      <p style={{
        ...stagger(1),
        margin: 0, fontSize: 16, fontWeight: 600,
        color: textMain, lineHeight: 1.35, letterSpacing: '-0.01em',
        marginBottom: card.subtext ? 4 : 0,
        fontFamily: 'var(--font-playfair, serif)',
      }}>
        {card.message}
      </p>
      {card.subtext && (
        <p style={{
          ...stagger(2),
          margin: '0 0 0', fontSize: 12, color: textSub, lineHeight: 1.5,
        }}>
          {card.subtext}
        </p>
      )}
      {hasButtons && (
        <div style={{
          ...stagger(card.subtext ? 3 : 2),
          height: 0,
          borderTop: `0.5px solid ${dark ? 'rgba(142,167,255,0.15)' : 'rgba(142,167,255,0.12)'}`,
          margin: '12px 0',
        }} />
      )}
      {hasButtons && (
        <div style={{
          ...stagger(card.subtext ? 4 : 3),
          display: 'flex',
          gap: 8,
          justifyContent: count === 1 ? 'center' : 'space-between',
        }}>
          {sorted.map((btn, i) => {
            const isPrimary = !!btn.primary
            return (
              <button key={i} type="button"
                className={isPrimary ? BTN_P : BTN_S}
                onClick={() => { onClear(); btn.onClick() }}
              >
                {btn.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Conversation Card ─────────────────────────────────────────────────────────
function ConvCard({
  card,
  exitCard,
  corner,
  isDark,
  onClear,
  trainerCtx,
  cardIsPlaying,
}: {
  card: CardSpec | null
  exitCard: CardSpec | null
  corner: Corner
  isDark: boolean
  onClear: () => void
  trainerCtx: TrainerCtx | null
  cardIsPlaying: boolean
}) {
  const isRight  = corner.endsWith('r')
  const isBottom = corner.startsWith('b')

  const active  = card ?? exitCard
  const isExit  = !card && !!exitCard
  const inClass  = isRight ? 'dock-card-in-br'  : 'dock-card-in-bl'
  const outClass = isRight ? 'dock-card-out-br' : 'dock-card-out-bl'

  if (!active) return null

  // Card shell colors
  const cardBg     = isDark ? 'rgba(30,28,48,0.85)'  : 'rgba(255,255,255,0.75)'
  const cardBorder = isDark
    ? '1px solid rgba(255,255,255,0.08)'
    : '0.5px solid rgba(142,167,255,0.25)'
  const cardShadow = isDark
    ? '0 16px 40px rgba(0,0,0,0.40)'
    : '0 -3px 16px rgba(142,167,255,0.12), 0 8px 24px rgba(142,167,255,0.10)'

  // Shared text colors
  const textMain = isDark ? 'rgba(255,255,255,0.97)' : '#1a1a2e'
  const textSub  = isDark ? 'rgba(255,255,255,0.75)' : '#5a5a7a'
  const textPri  = isDark ? '#A6B8FF' : '#6B8FFF'
  const textSec  = isDark ? 'rgba(255,255,255,0.38)' : '#9a9ab8'

  // Border-radius: near-Orb corner = 4px
  const n = 4
  function radius(base: number) {
    return isRight
      ? `${base}px ${base}px ${n}px ${base}px`
      : `${base}px ${base}px ${base}px ${n}px`
  }

  // Per-type shell props
  const isHelp = active.isHelp
  let borderRadius: string
  let padding: string
  let minWidth: number
  let maxWidth: number | undefined

  if (isHelp) {
    borderRadius = radius(16); padding = '14px 14px 10px'; minWidth = 150; maxWidth = 220
  } else if (active.size === 'small') {
    borderRadius = radius(16); padding = '10px 14px'; minWidth = 120; maxWidth = 260
  } else if (active.size === 'medium') {
    borderRadius = radius(16); padding = '14px 16px'; minWidth = 200; maxWidth = 260
  } else {
    borderRadius = radius(16); padding = '14px 16px'; minWidth = 240; maxWidth = 280
  }

  return (
    <div
      key={active.id}
      className={isExit ? outClass : inClass}
      style={{
        position:            'absolute',
        [isBottom ? 'bottom' : 'top']: ORB_SIZE + 10,
        [isRight  ? 'right'  : 'left']: 0,
        minWidth,
        maxWidth,
        borderRadius,
        padding,
        background:          cardBg,
        backdropFilter:      'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        border:              cardBorder,
        boxShadow:           cardShadow,
        pointerEvents:       isExit ? 'none' : 'auto',
        zIndex:              1,
        willChange:          'transform, opacity',
      }}
    >
      {isHelp ? (
        <HelpMenu ctx={trainerCtx} dark={isDark} />
      ) : active.size === 'small' ? (
        <WhisperCard card={active} dark={isDark} textMain={textMain} />
      ) : active.size === 'medium' ? (
        <ActionCard
          card={active} dark={isDark}
          textMain={textMain} textSub={textSub} textPri={textPri} textSec={textSec}
          onClear={onClear} cardIsPlaying={cardIsPlaying}
        />
      ) : (
        <SessionCard
          card={active} dark={isDark}
          textMain={textMain} textSub={textSub} textPri={textPri} textSec={textSec}
          onClear={onClear}
        />
      )}
    </div>
  )
}

// ── Main Orb component ────────────────────────────────────────────────────────
export function TrainerOrb() {
  const { orbState } = useContext(TrainerOrbContext)
  const trainerCtx  = useContext(TrainerContext)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pathname = usePathname()
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router

  const inStudyPage = pathname?.includes('/patto/stories/') ?? false

  const trainerCtxRef = useRef(trainerCtx)
  trainerCtxRef.current = trainerCtx
  const inStudyPageRef = useRef(inStudyPage)
  inStudyPageRef.current = inStudyPage

  const [, introTick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    _introForceRerender = introTick
    return () => { _introForceRerender = null }
  }, [introTick])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWaveCanvas(canvasRef, orbState)

  // ── Card exit animation ───────────────────────────────────────────────────
  const card = trainerCtx?.card ?? null
  const prevCardRef  = useRef<CardSpec | null>(null)
  const [exitCard, setExitCard] = useState<CardSpec | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const prev = prevCardRef.current
    if (prev && !card) {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
      setExitCard(prev)
      exitTimerRef.current = setTimeout(() => setExitCard(null), 200)
      setOrbCardScale(1)       // card dismissed → scale back to 1
    } else if (!prev && card) {
      setOrbCardScale(1.05)    // card appeared → scale up
    }
    prevCardRef.current = card
  }, [card])

  // ── Position state ────────────────────────────────────────────────────────
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  const corner: Corner = typeof window !== 'undefined'
    ? ((pos.x + ORB_SIZE / 2 > window.innerWidth / 2 ? 'r' : 'l') as 'r' | 'l') === 'r'
      ? (pos.y + ORB_SIZE / 2 > window.innerHeight / 2 ? 'br' : 'tr')
      : (pos.y + ORB_SIZE / 2 > window.innerHeight / 2 ? 'bl' : 'tl')
    : 'br'
  const [isDragging, setIsDragging] = useState(false)
  const [dragScale, setDragScale] = useState(1)
  // Card-active scale: 1.05 while card visible, returns to 1 after dismiss
  const [orbCardScale, setOrbCardScale] = useState(1)

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
    }
    if (!hasDraggedRef.current) return
    const W = window.innerWidth; const H = window.innerHeight
    const navH = TAB_BAR_HEIGHT + 16
    setPos({
      x: Math.max(0, Math.min(W - ORB_SIZE, e.clientX - ORB_SIZE / 2)),
      y: Math.max(0, Math.min(H - ORB_SIZE - navH, e.clientY - ORB_SIZE / 2)),
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (hasDraggedRef.current) {
      const W = window.innerWidth; const H = window.innerHeight
      const navH = TAB_BAR_HEIGHT + 16
      const finalX = Math.max(0, Math.min(W - ORB_SIZE, e.clientX - ORB_SIZE / 2))
      const finalY = Math.max(0, Math.min(H - ORB_SIZE - navH, e.clientY - ORB_SIZE / 2))
      setPos({ x: finalX, y: finalY })
      savePos(finalX, finalY)
    } else {
      const ctx = trainerCtxRef.current
      // Dismiss open card on first tap (also clears pending ask so next tap shows session card)
      if (ctx?.card) {
        ctx.dismissCard()
      } else if (ctx?.cardIsPlaying) {
        // Audio playing → pause + show replay/continue card
        ctx.handleOrbTapAudio()
      } else if (ctx?.page === 'session' || (ctx?.sessionPhase !== 'inactive' && ctx?.sessionPhase !== 'browsing')) {
        // Focus mode session → exit prompt
        ctx?.handleMenuExit()
      } else {
        // Restore pending ask (e.g. home entry card user dismissed) — or show unified session card
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
    setIsDragging(false)
    setDragScale(1)
    pointerStartRef.current = null
    hasDraggedRef.current = false
  }, [])

  const isPaused = trainerCtx?.sessionPhase === 'paused'

  // ── Glow based on state ───────────────────────────────────────────────────
  const cardActive = card !== null
  const lightBoxShadow = isDragging
    ? '0 4px 20px rgba(107,143,255,0.4), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 20px rgba(142,167,255,0.9), 0 0 40px rgba(142,167,255,0.5)'
    : cardActive
      ? '0 4px 20px rgba(107,143,255,0.38), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 18px rgba(142,167,255,0.9), 0 0 36px rgba(142,167,255,0.45)'
      : '0 4px 16px rgba(107,143,255,0.25), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 14px rgba(142,167,255,0.8), 0 0 28px rgba(142,167,255,0.4)'
  const darkBoxShadow = isDragging
    ? '0 4px 20px rgba(142,167,255,0.4), 0 0 20px rgba(142,167,255,0.3)'
    : cardActive
      ? '0 4px 18px rgba(142,167,255,0.45), 0 0 18px rgba(142,167,255,0.35)'
      : '0 2px 12px rgba(142,167,255,0.25)'

  if (!mounted) return null

  return (
    <div
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: ORB_SIZE, height: ORB_SIZE,
        zIndex: 200, touchAction: 'none', userSelect: 'none',
        opacity: isPaused ? 0.45 : 1, transition: 'opacity 0.3s ease',
      }}
    >
      {/* Intro onboarding card (orb-relative) */}
      {!isDragging && _introFactory && _introFactory(corner, isDark)}

      {/* Conversation Card */}
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

      {/* Breathing wrapper — animates scale/opacity when idle; drag scale applied inside */}
      <div
        className={!isDragging ? 'dock-orb-breathe' : ''}
        style={{ willChange: 'transform, opacity', position: 'relative' }}
      >
        {/* Spinner ring */}
        {!isDragging && (() => {
          const ringBase: React.CSSProperties = {
            position: 'absolute',
            top: -4, left: -4,
            width: ORB_SIZE + 8, height: ORB_SIZE + 8,
            borderRadius: '50%',
            border: '2px solid transparent',
            pointerEvents: 'none',
          }
          if (orbState === 'idle') return (
            <div style={{
              ...ringBase,
              borderTopColor: isDark ? 'rgba(160,176,255,0.25)' : 'rgba(160,176,255,0.4)',
              borderRightColor: isDark ? 'rgba(160,176,255,0.05)' : 'rgba(160,176,255,0.15)',
              animation: 'orb-spin 4s linear infinite',
            }} />
          )
          if (orbState === 'speaking') return (
            <div style={{
              ...ringBase,
              borderTopColor: isDark ? 'rgba(107,143,255,0.55)' : 'rgba(107,143,255,0.7)',
              borderRightColor: isDark ? 'rgba(107,143,255,0.15)' : 'rgba(107,143,255,0.3)',
              borderBottomColor: isDark ? 'rgba(107,143,255,0.0)' : 'rgba(107,143,255,0.1)',
              animation: 'orb-spin 1.2s linear infinite',
            }} />
          )
          if (orbState === 'waiting') return (
            <div style={{
              ...ringBase,
              borderTopColor: isDark ? 'rgba(80,112,232,0.35)' : 'rgba(80,112,232,0.5)',
              borderRightColor: isDark ? 'rgba(80,112,232,0.05)' : 'rgba(80,112,232,0.2)',
              animation: 'orb-spin 3s linear infinite',
            }} />
          )
          if (orbState === 'done') return (
            <div style={{
              ...ringBase,
              borderTopColor: isDark ? 'rgba(184,144,58,0.35)' : 'rgba(184,144,58,0.5)',
              borderRightColor: isDark ? 'rgba(184,144,58,0.05)' : 'rgba(184,144,58,0.2)',
              animation: 'orb-spin 6s linear infinite',
            }} />
          )
          return null
        })()}

        {/* Orb shell */}
        <div
          ref={orbRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: ORB_SIZE, height: ORB_SIZE,
            borderRadius: '50%', position: 'relative',
            cursor: isDragging ? 'grabbing' : 'pointer',
            boxShadow: isDark ? darkBoxShadow : lightBoxShadow,
            transform: `scale(${dragScale * orbCardScale})`,
            transition: isDragging
              ? 'box-shadow 0.2s ease, transform 0.15s ease'
              : 'box-shadow 0.20s ease, transform 0.20s ease',
            animation: !isDragging && orbState === 'speaking'
              ? 'orb-pulse 1s ease-in-out infinite'
              : !isDragging && orbState === 'waiting'
              ? 'orb-blink 2s ease-in-out infinite'
              : !isDragging && orbState === 'done'
              ? (isDark ? 'orb-glow-dark 2s ease-in-out infinite' : 'orb-glow 2s ease-in-out infinite')
              : undefined,
            background: isDark
              ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12) 0%, rgba(180,190,255,0.08) 50%, rgba(100,120,220,0.05) 100%)'
              : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(240,243,255,0.7) 40%, rgba(210,220,255,0.35) 70%, rgba(190,205,255,0.15) 100%)',
            border: isDark
              ? '0.5px solid rgba(255,255,255,0.15)'
              : '0.5px solid rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            overflow: 'hidden',
            willChange: 'transform',
          }}
        >
          {/* Canvas wave layer */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              borderRadius: '50%',
            }}
          />
          {/* Specular highlight */}
          <div style={{
            position: 'absolute', top: 8, left: 10,
            width: 14, height: 10, borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)',
            transform: 'rotate(-25deg)', filter: 'blur(2px)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  )
}
