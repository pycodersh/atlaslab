'use client'

import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TrainerOrbContext, type OrbState } from './TrainerOrbContext'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'

// ── Constants ─────────────────────────────────────────────────────────────────
const ORB_SIZE = 52
const MARGIN = 20
const LONG_PRESS_MS = 500
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

// ── Corner snap helpers ───────────────────────────────────────────────────────
type Corner = 'br' | 'bl' | 'tr' | 'tl'

function snapPosition(x: number, y: number): { x: number; y: number; corner: Corner } {
  const W = window.innerWidth
  const H = window.innerHeight
  const navH = TAB_BAR_HEIGHT + 16
  const right = W - SNAP_OFFSET
  const left = SNAP_OFFSET - ORB_SIZE
  const bottom = H - navH - SNAP_OFFSET
  const top = SNAP_OFFSET + 44 // below status bar

  const toRight = Math.abs(x - right)
  const toLeft = Math.abs(x - left)
  const toBottom = Math.abs(y - bottom)
  const toTop = Math.abs(y - top)

  const isRight = toRight < toLeft
  const isBottom = toBottom < toTop

  return {
    x: isRight ? right : left,
    y: isBottom ? bottom : top,
    corner: (isBottom ? 'b' : 't') + (isRight ? 'r' : 'l') as Corner,
  }
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
  message,
  corner,
  isDark,
}: {
  message: string | null
  corner: Corner
  isDark: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState(message)

  useEffect(() => {
    if (message) {
      setText(message)
      // tiny delay so opacity transition fires
      const t = setTimeout(() => setVisible(true), 16)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      const t = setTimeout(() => setText(null), 220)
      return () => clearTimeout(t)
    }
  }, [message])

  if (!text) return null

  const isRight = corner.endsWith('r')
  const isBottom = corner.startsWith('b')

  // Tail pointing toward Orb
  const borderRadius = isRight
    ? '14px 14px 4px 14px'
    : '14px 14px 14px 4px'

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    [isBottom ? 'bottom' : 'top']: ORB_SIZE + 10,
    [isRight ? 'right' : 'left']: 0,
    minWidth: 120,
    maxWidth: 220,
    whiteSpace: 'pre-wrap',
    borderRadius,
    padding: '9px 13px',
    background: isDark
      ? 'rgba(30,25,60,0.92)'
      : 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '0.5px solid rgba(210,220,245,0.7)',
    boxShadow: '0 4px 20px rgba(107,143,255,0.12)',
    fontSize: 13,
    fontWeight: 500,
    color: isDark ? '#e8e0f8' : '#1a1a2e',
    lineHeight: 1.45,
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${isBottom ? '4px' : '-4px'})`,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  }

  return <div style={cardStyle}>{text}</div>
}

// ── Main Orb component ────────────────────────────────────────────────────────
export function TrainerOrb() {
  const { orbState, message } = useContext(TrainerOrbContext)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWaveCanvas(canvasRef, orbState)

  // ── Position state ──────────────────────────────────────────────────────
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [corner, setCorner] = useState<Corner>('br')
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragScale, setDragScale] = useState(1)

  // Init position from localStorage or default
  useLayoutEffect(() => {
    const saved = loadSavedPos()
    if (saved) {
      const snapped = snapPosition(saved.x, saved.y)
      setPos({ x: snapped.x, y: snapped.y })
      setCorner(snapped.corner)
    } else {
      const dp = defaultPos()
      setPos(dp)
      setCorner('br')
    }
    setMounted(true)
  }, [])

  // ── Long-press drag ──────────────────────────────────────────────────────
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const orbRef = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    longPressTimerRef.current = setTimeout(() => {
      setIsDragging(true)
      setDragScale(1.08)
      orbRef.current?.setPointerCapture(e.pointerId)
    }, LONG_PRESS_MS)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartRef.current) return

    // Cancel long press if moved too much before it fires
    if (!isDragging && longPressTimerRef.current) {
      const dx = e.clientX - pointerStartRef.current.x
      const dy = e.clientY - pointerStartRef.current.y
      if (Math.sqrt(dx * dx + dy * dy) > 6) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    if (!isDragging) return

    const W = window.innerWidth
    const H = window.innerHeight
    const navH = TAB_BAR_HEIGHT + 16
    const minX = SNAP_OFFSET - ORB_SIZE
    const maxX = W - SNAP_OFFSET
    const minY = 44
    const maxY = H - navH - SNAP_OFFSET

    setPos({
      x: Math.max(minX, Math.min(maxX, e.clientX - ORB_SIZE / 2)),
      y: Math.max(minY, Math.min(maxY, e.clientY - ORB_SIZE / 2)),
    })
  }, [isDragging])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (!isDragging) return

    setIsDragging(false)
    setDragScale(1)

    const snapped = snapPosition(
      e.clientX - ORB_SIZE / 2,
      e.clientY - ORB_SIZE / 2,
    )
    setPos({ x: snapped.x, y: snapped.y })
    setCorner(snapped.corner)
    savePos(snapped.x, snapped.y)
  }, [isDragging])

  // ── Glow based on state ──────────────────────────────────────────────────
  const glowOpacity = orbState === 'idle' ? 0.2
    : orbState === 'speaking' ? 0.55
    : orbState === 'waiting' ? 0.45
    : 0.75 // done

  const outerGlow = isDragging
    ? `0 0 28px 10px rgba(172,182,255,0.45), 0 0 56px 20px rgba(172,182,255,0.2)`
    : `0 0 20px 6px rgba(172,182,255,${glowOpacity}), 0 0 40px 12px rgba(172,182,255,${glowOpacity * 0.4})`

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
        <ConvCard message={message} corner={corner} isDark={isDark} />
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
          boxShadow: outerGlow,
          transform: `scale(${dragScale})`,
          transition: isDragging
            ? 'box-shadow 0.2s ease, transform 0.15s ease'
            : 'box-shadow 0.4s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          background: isDark
            ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(180,190,255,0.10) 50%, rgba(100,120,220,0.08) 100%)'
            : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(240,243,255,0.7) 40%, rgba(210,220,255,0.35) 70%, rgba(190,205,255,0.15) 100%)',
          border: isDark
            ? '0.5px solid rgba(255,255,255,0.18)'
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
