'use client'

import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TrainerOrbContext, type OrbState } from './TrainerOrbContext'
import { TrainerContext, type CardSpec } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'

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

  // Smoothly interpolate config on state change
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

      // Clip to circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(R, R, R, 0, Math.PI * 2)
      ctx.clip()

      const t = tRef.current

      // Draw 3 wave layers
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

      // Center glow
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

// ── Conversation Card ─────────────────────────────────────────────────────────
function ConvCard({
  card,
  exitCard,
  corner,
  isDark,
  onClear,
}: {
  card: CardSpec | null
  exitCard: CardSpec | null
  corner: Corner
  isDark: boolean
  onClear: () => void
}) {
  const isRight  = corner.endsWith('r')
  const isBottom = corner.startsWith('b')

  const active  = card ?? exitCard
  const isExit  = !card && !!exitCard
  const inClass  = isRight ? 'dock-card-in-br'  : 'dock-card-in-bl'
  const outClass = isRight ? 'dock-card-out-br' : 'dock-card-out-bl'

  if (!active) return null

  const cardBg     = isDark ? 'rgba(30,25,60,0.92)'         : 'rgba(255,255,255,0.93)'
  const cardBorder = isDark ? '0.5px solid rgba(142,167,255,0.2)' : '0.5px solid rgba(210,220,245,0.7)'
  const textMain   = isDark ? '#e8e0f8'                      : '#1a1a2e'
  const textSub    = isDark ? 'rgba(232,224,248,0.55)'       : 'rgba(40,40,80,0.52)'
  const textPri    = isDark ? '#A6B8FF'                      : '#6B8FFF'
  const textSec    = isDark ? 'rgba(255,255,255,0.40)'       : '#aaa'

  const borderRadius = active.size === 'small'  ? (isRight ? '14px 14px 4px 14px' : '14px 14px 14px 4px')
                     : active.size === 'medium' ? (isRight ? '16px 16px 4px 16px' : '16px 16px 16px 4px')
                     :                            (isRight ? '18px 18px 4px 18px' : '18px 18px 18px 4px')
  const padding = active.size === 'small' ? '9px 13px' : active.size === 'medium' ? '13px 14px' : '16px'
  const cardWidth = active.size === 'large' ? 240 : 200

  return (
    <div
      key={active.id}
      className={isExit ? outClass : inClass}
      style={{
        position: 'absolute',
        [isBottom ? 'bottom' : 'top']: ORB_SIZE + 10,
        [isRight ? 'right' : 'left']: 0,
        width: cardWidth,
        borderRadius,
        padding,
        background: cardBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: cardBorder,
        boxShadow: '0 4px 20px rgba(107,143,255,0.12)',
        pointerEvents: isExit ? 'none' : 'auto',
        zIndex: 1,
      }}
    >
      {/* Message */}
      <p style={{ fontSize: 13, fontWeight: 500, color: textMain, margin: 0, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
        {active.message}
      </p>

      {/* Subtext (large only) */}
      {active.subtext && (
        <p style={{ fontSize: 11, color: textSub, margin: '5px 0 0', lineHeight: 1.4 }}>
          {active.subtext}
        </p>
      )}

      {/* Buttons */}
      {active.buttons && active.buttons.length > 0 && (
        active.size === 'large' ? (
          /* Large: full-width button */
          <button
            type="button"
            onClick={() => { onClear(); active.buttons![0].onClick() }}
            style={{
              marginTop: 12, width: '100%', padding: '9px 0',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isDark ? 'rgba(166,184,255,0.15)' : 'rgba(107,143,255,0.10)',
              fontSize: 13, fontWeight: 600, color: textPri, fontFamily: 'inherit',
            }}
          >
            {active.buttons[0].label}
          </button>
        ) : (
          /* Medium: inline text buttons */
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 10 }}>
            {active.buttons.map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onClear(); btn.onClick() }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                  fontSize: 13, fontWeight: btn.primary ? 600 : 400,
                  color: btn.primary ? textPri : textSec,
                  fontFamily: 'inherit',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )
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
      exitTimerRef.current = setTimeout(() => setExitCard(null), 180)
    }
    prevCardRef.current = card
  }, [card])

  // ── Position state ──────────────────────────────────────────────────────
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  // Derive corner from current position for ConvCard placement
  const corner: Corner = typeof window !== 'undefined'
    ? ((pos.x + ORB_SIZE / 2 > window.innerWidth / 2 ? 'r' : 'l') as 'r' | 'l') === 'r'
      ? (pos.y + ORB_SIZE / 2 > window.innerHeight / 2 ? 'br' : 'tr')
      : (pos.y + ORB_SIZE / 2 > window.innerHeight / 2 ? 'bl' : 'tl')
    : 'br'
  const [isDragging, setIsDragging] = useState(false)
  const [dragScale, setDragScale] = useState(1)

  // Init position from localStorage or default
  useLayoutEffect(() => {
    const saved = loadSavedPos()
    if (saved) {
      setPos({ x: saved.x, y: saved.y })
    } else {
      setPos(defaultPos())
    }
    setMounted(true)
  }, [])

  // ── Drag ──────────────────────────────────────────────────────────────────
  const hasDraggedRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const orbRef = useRef<HTMLDivElement>(null)

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

    const W = window.innerWidth
    const H = window.innerHeight
    const navH = TAB_BAR_HEIGHT + 16
    setPos({
      x: Math.max(0, Math.min(W - ORB_SIZE, e.clientX - ORB_SIZE / 2)),
      y: Math.max(0, Math.min(H - ORB_SIZE - navH, e.clientY - ORB_SIZE / 2)),
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (hasDraggedRef.current) {
      const W = window.innerWidth
      const H = window.innerHeight
      const navH = TAB_BAR_HEIGHT + 16
      const finalX = Math.max(0, Math.min(W - ORB_SIZE, e.clientX - ORB_SIZE / 2))
      const finalY = Math.max(0, Math.min(H - ORB_SIZE - navH, e.clientY - ORB_SIZE / 2))
      setPos({ x: finalX, y: finalY })
      savePos(finalX, finalY)
    }
    setIsDragging(false)
    setDragScale(1)
    pointerStartRef.current = null
    hasDraggedRef.current = false
  }, [])

  // ── Glow based on state ──────────────────────────────────────────────────
  const lightBoxShadow = isDragging
    ? '0 4px 20px rgba(107,143,255,0.4), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 20px rgba(142,167,255,0.9), 0 0 40px rgba(142,167,255,0.5)'
    : '0 4px 16px rgba(107,143,255,0.25), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 14px rgba(142,167,255,0.8), 0 0 28px rgba(142,167,255,0.4)'

  const darkBoxShadow = isDragging
    ? '0 4px 20px rgba(142,167,255,0.4), 0 0 20px rgba(142,167,255,0.3)'
    : '0 2px 12px rgba(142,167,255,0.25)'

  if (!mounted) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: ORB_SIZE,
        height: ORB_SIZE,
        zIndex: 200,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* Conversation Card */}
      {!isDragging && (
        <ConvCard
          card={card}
          exitCard={exitCard}
          corner={corner}
          isDark={isDark}
          onClear={() => trainerCtx?.clearMessage()}
        />
      )}

      {/* Orb itself */}
      <div
        ref={orbRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: ORB_SIZE,
          height: ORB_SIZE,
          borderRadius: '50%',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'pointer',
          boxShadow: isDark ? darkBoxShadow : lightBoxShadow,
          transform: `scale(${dragScale})`,
          transition: isDragging
            ? 'box-shadow 0.2s ease, transform 0.15s ease'
            : 'box-shadow 0.4s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          background: isDark
            ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12) 0%, rgba(180,190,255,0.08) 50%, rgba(100,120,220,0.05) 100%)'
            : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(240,243,255,0.7) 40%, rgba(210,220,255,0.35) 70%, rgba(190,205,255,0.15) 100%)',
          border: isDark
            ? '0.5px solid rgba(255,255,255,0.15)'
            : '0.5px solid rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          overflow: 'hidden',
        }}
      >
        {/* Canvas wave layer */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
          }}
        />

        {/* Specular highlight */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 10,
            width: 14,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)',
            transform: 'rotate(-25deg)',
            filter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
