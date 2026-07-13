'use client'

import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { TrainerOrbContext, type OrbState } from './TrainerOrbContext'
import { TrainerContext, type CardSpec, type TrainerCtx } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { getOrbTapMessage, classifyVisitor, getLocalVisitCount, pageToContext } from '@/lib/scenario/scenario-engine'

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
type Corner = 'br' | 'bl' | 'tr' | 'tl'

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

// ── 1. Whisper Card ───────────────────────────────────────────────────────────
function WhisperCard({ card, dark, textMain }: {
  card: CardSpec; dark: boolean; textMain: string
}) {
  const hasMs = typeof card.ms === 'number' && card.ms > 0
  return (
    <>
      <p style={{
        margin: 0, fontSize: 14, fontWeight: 500,
        color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em',
        whiteSpace: 'pre-wrap',
      }}>
        {card.message}
      </p>
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
function ActionCard({ card, dark, textMain, textSub, textPri, textSec, onClear, cardIsPlaying }: {
  card: CardSpec; dark: boolean
  textMain: string; textSub: string; textPri: string; textSec: string
  onClear: () => void; cardIsPlaying: boolean
}) {
  const [pressedIdx, setPressedIdx] = useState<number | null>(null)
  const hasButtons = card.buttons && card.buttons.length > 0

  return (
    <>
      <p style={{
        margin: 0, fontSize: 14, fontWeight: 500,
        color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em',
        marginBottom: (card.subtext || hasButtons) ? 4 : 0,
        whiteSpace: 'pre-wrap',
      }}>
        {card.message}
      </p>
      {card.subtext && (
        <p style={{
          margin: 0, marginBottom: hasButtons ? 10 : 0,
          fontSize: 12, color: textSub, lineHeight: 1.5,
        }}>
          {card.subtext}
        </p>
      )}
      {hasButtons && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {card.buttons!.map((btn, i) => {
            // play variant
            if (btn.btnVariant === 'play') {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => btn.onClick()}
                  disabled={cardIsPlaying}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 8,
                    cursor: cardIsPlaying ? 'default' : 'pointer',
                    border: cardIsPlaying
                      ? `0.5px solid ${dark ? 'rgba(142,167,255,0.08)' : 'rgba(107,143,255,0.12)'}`
                      : `0.5px solid rgba(107,143,255,0.25)`,
                    background: cardIsPlaying
                      ? 'rgba(107,143,255,0.06)'
                      : dark ? 'rgba(142,167,255,0.15)' : 'rgba(107,143,255,0.10)',
                    color: cardIsPlaying ? '#aaa' : dark ? '#A6B8FF' : '#6B8FFF',
                    fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                    transition: 'all 0.15s', willChange: 'transform, opacity',
                  }}
                >
                  {cardIsPlaying ? <span style={{ fontSize: 9, lineHeight: 1 }}>■</span> : <PlaySvg />}
                  {cardIsPlaying ? 'Playing...' : btn.label}
                </button>
              )
            }
            // done variant
            if (btn.btnVariant === 'done') {
              return (
                <button
                  key={i}
                  type="button"
                  onPointerDown={() => setPressedIdx(i)}
                  onPointerUp={() => setPressedIdx(null)}
                  onPointerCancel={() => setPressedIdx(null)}
                  onClick={() => { onClear(); btn.onClick() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    border: 'none',
                    background: dark ? '#7c6fd4' : '#6B8FFF',
                    color: '#fff', fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                    transform: pressedIdx === i ? 'scale(0.97)' : 'scale(1)',
                    transition: 'transform 0.12s ease', willChange: 'transform',
                  }}
                >
                  <CheckSvg />
                  {btn.label}
                </button>
              )
            }
            // default: primary or secondary text button
            return (
              <button
                key={i}
                type="button"
                onPointerDown={() => setPressedIdx(i)}
                onPointerUp={() => setPressedIdx(null)}
                onPointerCancel={() => setPressedIdx(null)}
                onClick={() => { onClear(); btn.onClick() }}
                style={{
                  background:   btn.primary
                    ? (dark ? 'rgba(107,143,255,0.15)' : 'rgba(107,143,255,0.08)')
                    : 'none',
                  border:       btn.primary
                    ? (dark ? '0.5px solid rgba(107,143,255,0.35)' : '0.5px solid rgba(107,143,255,0.20)')
                    : 'none',
                  borderRadius: btn.primary ? 10 : 0,
                  padding:      btn.primary ? '8px 16px' : '8px 4px',
                  color:        btn.primary ? textPri : textSec,
                  fontSize:     13, fontWeight: btn.primary ? 600 : 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transform:    pressedIdx === i
                    ? (btn.primary ? 'scale(0.97)' : 'scale(1)')
                    : 'scale(1)',
                  opacity:      pressedIdx === i && !btn.primary ? 0.6 : 1,
                  transition:   'transform 0.12s ease, opacity 0.12s ease',
                  willChange:   'transform, opacity',
                }}
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

// ── 3. Session Card ───────────────────────────────────────────────────────────
function SessionCard({ card, dark, textMain, textSub, textPri, textSec, onClear }: {
  card: CardSpec; dark: boolean
  textMain: string; textSub: string; textPri: string; textSec: string
  onClear: () => void
}) {
  const primaryBtns = card.buttons?.filter(b => b.primary) ?? []
  const ghostBtns   = card.buttons?.filter(b => !b.primary) ?? []
  const hasButtons  = (card.buttons?.length ?? 0) > 0

  function stagger(i: number): React.CSSProperties {
    return {
      animationName: 'sessionCardItem',
      animationDuration: '0.30s',
      animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
      animationDelay: `${i * 40}ms`,
      animationFillMode: 'both',
    }
  }

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
      {primaryBtns.map((btn, i) => (
        <button
          key={`p${i}`}
          type="button"
          onClick={() => { onClear(); btn.onClick() }}
          style={{
            ...stagger((card.subtext ? 4 : 3) + i),
            display: 'block', width: '100%',
            background: '#6B8FFF', border: 'none', borderRadius: 12,
            padding: '11px', marginBottom: ghostBtns.length ? 4 : 0,
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
            boxShadow: '0 4px 12px rgba(107,143,255,0.30)',
          }}
        >
          {btn.label}
        </button>
      ))}
      {ghostBtns.map((btn, i) => (
        <button
          key={`g${i}`}
          type="button"
          onClick={() => { onClear(); btn.onClick() }}
          style={{
            ...stagger((card.subtext ? 4 : 3) + primaryBtns.length + i),
            display: 'block', width: '100%',
            background: 'none', border: 'none', padding: '8px',
            color: textSec, fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
          }}
        >
          {btn.label}
        </button>
      ))}
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
  const cardBg     = isDark ? 'rgba(28,22,58,0.94)'  : 'rgba(255,255,255,0.92)'
  const cardBorder = isDark
    ? '0.5px solid rgba(142,167,255,0.22)'
    : '0.5px solid rgba(200,215,245,0.60)'
  const cardShadow = '0 4px 24px rgba(107,143,255,0.10), 0 1px 4px rgba(107,143,255,0.06)'

  // Shared text colors
  const textMain = isDark ? '#e8e0f8' : '#1a1a2e'
  const textSub  = isDark ? 'rgba(232,224,248,0.55)' : '#7a7a9a'
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
    borderRadius = radius(14); padding = '10px 14px'; minWidth = 120; maxWidth = 220
  } else if (active.size === 'medium') {
    borderRadius = radius(16); padding = '14px 16px'; minWidth = 200; maxWidth = 260
  } else {
    borderRadius = radius(18); padding = '18px 18px 16px'; minWidth = 240; maxWidth = 280
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
        backdropFilter:      'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
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

  const inStudyPage = pathname?.includes('/patto/stories/') ?? false

  const trainerCtxRef = useRef(trainerCtx)
  trainerCtxRef.current = trainerCtx
  const inStudyPageRef = useRef(inStudyPage)
  inStudyPageRef.current = inStudyPage

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
      if (ctx?.sessionPhase === 'paused') {
        ctx.resumeFromPause()
      } else if (inStudyPageRef.current) {
        ctx?.showHelpMenu()
      } else if (ctx?.sessionPhase === 'inactive') {
        const vt = classifyVisitor(getLocalVisitCount())
        const ctxKey = pageToContext(ctx.page ?? 'home')
        ctx.say(getOrbTapMessage(ctxKey, vt), 2500)
      } else {
        ctx?.handleOrbTap()
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
        style={{ willChange: 'transform, opacity' }}
      >
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
