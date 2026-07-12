'use client'

import { useContext, useRef, useState, useEffect, useCallback } from 'react'
import { TrainerContext, useTrainerState } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'

// ── Provider ──────────────────────────────────────────────────────────────────

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  const state = useTrainerState()
  return (
    <TrainerContext.Provider value={state}>
      {children}
      <TrainerOrb />
    </TrainerContext.Provider>
  )
}

// ── Position persistence ──────────────────────────────────────────────────────

const POS_KEY = 'patto-trainer-orb-pos'
const ORB_SIZE = 52
const DEFAULT_BOTTOM = 80
const DEFAULT_RIGHT  = 20

type OrbPos = { x: number; y: number }

function loadPos(): OrbPos | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(POS_KEY)
    return v ? JSON.parse(v) : null
  } catch { return null }
}

function savePos(pos: OrbPos) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(pos)) } catch {}
}

function defaultPos(): OrbPos {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  return {
    x: window.innerWidth  - ORB_SIZE - DEFAULT_RIGHT,
    y: window.innerHeight - ORB_SIZE - DEFAULT_BOTTOM,
  }
}

function snapToEdge(pos: OrbPos): OrbPos {
  const W = window.innerWidth
  const H = window.innerHeight
  const margin = 12
  // Clamp vertical
  const y = Math.max(margin, Math.min(H - ORB_SIZE - margin, pos.y))
  // Snap to nearest horizontal edge
  const snapLeft  = margin
  const snapRight = W - ORB_SIZE - margin
  const x = pos.x + ORB_SIZE / 2 < W / 2 ? snapLeft : snapRight
  return { x, y }
}

// ── Trainer Orb ───────────────────────────────────────────────────────────────

function TrainerOrb() {
  const ctx     = useContext(TrainerContext)
  const { theme } = useTheme()
  const isDark  = theme === 'dark'

  const message   = ctx?.message   ?? null
  const isActive  = ctx?.isActive  ?? false
  const isPulsing = ctx?.isPulsing ?? false
  const page      = ctx?.page      ?? 'other'

  // ── Position state ──────────────────────────────────────────────────────
  const [pos, setPos]         = useState<OrbPos>(() => loadPos() ?? defaultPos())
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)
  const orbRef     = useRef<HTMLDivElement>(null)

  // Recalculate default pos after mount (window is available)
  useEffect(() => {
    if (!loadPos()) setPos(defaultPos())
  }, [])

  // Bubble key increments on each new message so animation replays
  const prevMsgRef = useRef<string | null>(null)
  const bubbleKey  = useRef(0)
  if (message && message !== prevMsgRef.current) bubbleKey.current += 1
  prevMsgRef.current = message

  // ── Drag handlers ───────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    orbRef.current?.setPointerCapture(e.pointerId)
    dragOrigin.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y }
    setDragging(true)
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragOrigin.current) return
    const { px, py, ox, oy } = dragOrigin.current
    const W = window.innerWidth
    const H = window.innerHeight
    const margin = 12
    const nx = Math.max(margin, Math.min(W - ORB_SIZE - margin, ox + (e.clientX - px)))
    const ny = Math.max(margin, Math.min(H - ORB_SIZE - margin, oy + (e.clientY - py)))
    setPos({ x: nx, y: ny })
  }, [dragging])

  const onPointerUp = useCallback(() => {
    if (!dragging) return
    setDragging(false)
    dragOrigin.current = null
    setPos(prev => {
      const snapped = snapToEdge(prev)
      savePos(snapped)
      return snapped
    })
  }, [dragging])

  // Library page = hidden
  if (page === 'library') return null

  // ── Visual tokens ───────────────────────────────────────────────────────
  const orbShell = isDark
    ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22) 0%, rgba(200,215,255,0.14) 45%, rgba(170,190,255,0.08) 100%)'
    : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(240,243,255,0.70) 40%, rgba(210,220,255,0.40) 70%, rgba(190,205,255,0.20) 100%)'

  const orbBorder = isDark ? '0.5px solid rgba(255,255,255,0.25)' : '0.5px solid rgba(255,255,255,0.90)'

  const glowClass = isActive && !dragging ? 'trainer-orb-active-glow' : undefined
  const glowStyle = dragging
    ? { boxShadow: '0 0 30px 10px rgba(172,182,255,0.50), 0 0 55px 18px rgba(172,182,255,0.22)' }
    : !isActive
    ? { boxShadow: '0 0 20px 6px rgba(172,182,255,0.25), 0 0 40px 12px rgba(172,182,255,0.10)' }
    : {}

  const coreOpacity  = isActive || dragging ? 1.0 : 0.6
  const coreGlow     = isActive || dragging
    ? '0 0 14px rgba(142,167,255,0.8), 0 0 28px rgba(142,167,255,0.4)'
    : '0 0 10px rgba(142,167,255,0.5), 0 0 20px rgba(142,167,255,0.2)'

  const bubbleBg   = isDark ? 'rgba(30,25,60,0.95)' : 'rgba(255,255,255,0.95)'
  const bubbleText = isDark ? '#e8e0f8' : '#1a1a2e'
  const tailBg     = isDark ? 'rgba(30,25,60,0.95)' : 'rgba(255,255,255,0.95)'

  // Determine bubble position: sits above-left of orb
  // Bubble is absolutely positioned relative to orb container
  const onRightEdge = pos.x > window.innerWidth / 2

  return (
    <div
      ref={orbRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: ORB_SIZE,
        height: ORB_SIZE,
        zIndex: 50,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Speech bubble — appears above, anchored to right edge of orb */}
      {message && (
        <div
          key={bubbleKey.current}
          className="trainer-bubble-enter"
          style={{
            position: 'absolute',
            bottom: ORB_SIZE + 10,
            right: onRightEdge ? 0 : 'auto',
            left: onRightEdge ? 'auto' : 0,
            background: bubbleBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '0.5px solid rgba(200,210,240,0.5)',
            borderRadius: onRightEdge ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
            padding: '7px 12px',
            fontSize: 13,
            fontWeight: 500,
            color: bubbleText,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            letterSpacing: '0.01em',
          }}
        >
          {message}
          {/* Tail triangle */}
          <span style={{
            position: 'absolute',
            bottom: -5,
            [onRightEdge ? 'right' : 'left']: 14,
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${tailBg}`,
          }} />
        </div>
      )}

      {/* Orb shell */}
      <div
        className={[
          glowClass,
          isPulsing ? 'trainer-pulse-once' : undefined,
        ].filter(Boolean).join(' ') || undefined}
        style={{
          width: ORB_SIZE,
          height: ORB_SIZE,
          borderRadius: '50%',
          background: orbShell,
          border: orbBorder,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'transform 0.2s ease',
          transform: dragging ? 'scale(1.05)' : 'scale(1)',
          position: 'relative',
          ...glowStyle,
        }}
      >
        {/* Periwinkle core */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 28%, #C8D4FF 0%, #A6B8FF 40%, #8090F0 100%)',
          boxShadow: coreGlow,
          opacity: coreOpacity,
          transition: 'opacity 0.3s ease, box-shadow 0.3s ease',
        }} />

        {/* Specular highlight */}
        <div style={{
          position: 'absolute',
          top: 8,
          left: 10,
          width: 14,
          height: 10,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.70)',
          transform: 'rotate(-25deg)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
