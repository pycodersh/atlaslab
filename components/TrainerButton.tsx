'use client'

import { useContext, useRef, useState, useEffect, useCallback } from 'react'
import { TrainerContext, TrainerStateProvider } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'

// ── Provider ──────────────────────────────────────────────────────────────────

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  return (
    <TrainerStateProvider>
      {children}
      <TrainerOrb />
    </TrainerStateProvider>
  )
}

// ── Position persistence ──────────────────────────────────────────────────────

const POS_KEY = 'patto-trainer-orb-pos'
const ORB_SIZE = 52
const NAV_HEIGHT     = 72   // matches TAB_BAR_HEIGHT in MainTabBar
const DEFAULT_BOTTOM = NAV_HEIGHT + 16
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

const DRAG_BOTTOM_MARGIN = NAV_HEIGHT + 8

function snapToEdge(pos: OrbPos): OrbPos {
  const W = window.innerWidth
  const H = window.innerHeight
  const margin = 12
  const y = Math.max(margin, Math.min(H - ORB_SIZE - DRAG_BOTTOM_MARGIN, pos.y))
  const snapRight = W - ORB_SIZE - margin
  const x = pos.x + ORB_SIZE / 2 < W / 2 ? margin : snapRight
  return { x, y }
}

// ── Trainer Orb ───────────────────────────────────────────────────────────────

function TrainerOrb() {
  const ctx     = useContext(TrainerContext)
  const { theme } = useTheme()
  const isDark  = theme === 'dark'

  const message       = ctx?.message       ?? null
  const bubbleButtons = ctx?.bubbleButtons ?? null
  const isActive      = ctx?.isActive      ?? false
  const isPulsing     = ctx?.isPulsing     ?? false
  const page          = ctx?.page          ?? 'other'
  const orbState      = ctx?.orbState      ?? 'idle'
  const isMenuOpen    = ctx?.isMenuOpen    ?? false
  const sessionPhase  = ctx?.sessionPhase  ?? 'inactive'

  // ── Position state ──────────────────────────────────────────────────────
  const [pos, setPos]       = useState<OrbPos>(() => loadPos() ?? defaultPos())
  const [dragging, setDrag] = useState(false)
  const dragOrigin = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)
  const didDragRef = useRef(false)   // track whether pointer actually moved (to distinguish tap vs drag)
  const orbRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadPos()) setPos(defaultPos())
  }, [])

  // Bubble key increments on each new message so animation replays
  const prevMsgRef = useRef<string | null>(null)
  const bubbleKey  = useRef(0)
  if (message && message !== prevMsgRef.current) bubbleKey.current += 1
  prevMsgRef.current = message

  // ── Drag / tap handlers ─────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    orbRef.current?.setPointerCapture(e.pointerId)
    dragOrigin.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y }
    didDragRef.current = false
    setDrag(true)
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragOrigin.current) return
    const { px, py, ox, oy } = dragOrigin.current
    const dx = e.clientX - px
    const dy = e.clientY - py
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDragRef.current = true
    const W = window.innerWidth
    const H = window.innerHeight
    const margin = 12
    const nx = Math.max(margin, Math.min(W - ORB_SIZE - margin, ox + dx))
    const ny = Math.max(margin, Math.min(H - ORB_SIZE - DRAG_BOTTOM_MARGIN, oy + dy))
    setPos({ x: nx, y: ny })
  }, [dragging])

  const onPointerUp = useCallback(() => {
    if (!dragging) return
    setDrag(false)
    dragOrigin.current = null
    const wasTap = !didDragRef.current
    setPos(prev => {
      const snapped = snapToEdge(prev)
      savePos(snapped)
      return snapped
    })
    if (wasTap) ctx?.handleOrbTap()
  }, [dragging, ctx])

  // Library: show only when message is active (e.g. after remove/save)
  if (page === 'library' && !message) return null

  // ── Visual tokens based on OrbState ────────────────────────────────────
  const isWaiting = orbState === 'waiting'
  const isPaused  = orbState === 'paused'

  const orbShell = isDark
    ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22) 0%, rgba(200,215,255,0.14) 45%, rgba(170,190,255,0.08) 100%)'
    : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(240,243,255,0.70) 40%, rgba(210,220,255,0.40) 70%, rgba(190,205,255,0.20) 100%)'

  const orbBorder = isDark ? '0.5px solid rgba(255,255,255,0.25)' : '0.5px solid rgba(255,255,255,0.90)'

  const glowClass = (isActive && !dragging) ? 'trainer-orb-active-glow' : undefined
  const glowStyle = dragging
    ? { boxShadow: '0 0 30px 10px rgba(172,182,255,0.50), 0 0 55px 18px rgba(172,182,255,0.22)' }
    : isPaused
    ? { boxShadow: '0 0 14px 4px rgba(172,182,255,0.15)' }
    : !isActive
    ? { boxShadow: '0 0 20px 6px rgba(172,182,255,0.25), 0 0 40px 12px rgba(172,182,255,0.10)' }
    : {}

  const coreColor = isPaused
    ? 'radial-gradient(circle at 35% 28%, #D0D8FF 0%, #B0B8E8 40%, #8888CC 100%)'
    : isWaiting
    ? 'radial-gradient(circle at 35% 28%, #D8E4FF 0%, #B4C8FF 40%, #90A8F8 100%)'
    : 'radial-gradient(circle at 35% 28%, #C8D4FF 0%, #A6B8FF 40%, #8090F0 100%)'

  const coreOpacity = isActive || dragging ? 1.0 : isPaused ? 0.4 : 0.6
  const coreGlow    = isActive || dragging
    ? '0 0 14px rgba(142,167,255,0.8), 0 0 28px rgba(142,167,255,0.4)'
    : '0 0 10px rgba(142,167,255,0.5), 0 0 20px rgba(142,167,255,0.2)'

  const pulseAnim = isWaiting && !dragging ? 'trainer-orb-pulse 2.2s ease-in-out infinite' : undefined

  const bubbleBg   = isDark ? 'rgba(30,25,60,0.95)' : 'rgba(255,255,255,0.95)'
  const bubbleText = isDark ? '#e8e0f8' : '#1a1a2e'
  const tailBg     = isDark ? 'rgba(30,25,60,0.95)' : 'rgba(255,255,255,0.95)'

  const onRightEdge = pos.x > window.innerWidth / 2

  const inSession = sessionPhase !== 'inactive'

  return (
    <>
      {/* Help Menu Overlay */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: NAV_HEIGHT + 24,
          }}
          onClick={ctx?.closeMenu}
        >
          <div
            style={{
              background: isDark ? 'rgba(20,18,48,0.97)' : 'rgba(255,255,255,0.97)',
              borderRadius: 20,
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minWidth: 200,
              border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <MenuButton label="Repeat" icon="🔁" onClick={ctx?.handleMenuRepeat} isDark={isDark} />
            <MenuButton label="Skip"   icon="⏩" onClick={ctx?.handleMenuSkip}   isDark={isDark} />
            <MenuButton label="Pause"  icon="⏸"  onClick={ctx?.handleMenuPause}  isDark={isDark} />
            <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', margin: '2px 0' }} />
            <MenuButton label="Exit"   icon="✕"  onClick={ctx?.handleMenuExit}   isDark={isDark} danger />
          </div>
        </div>
      )}

      {/* Orb */}
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
          cursor: dragging ? 'grabbing' : inSession ? 'pointer' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Speech bubble */}
        {message && (
          <div
            key={bubbleKey.current}
            className="trainer-bubble-enter"
            style={{
              position: 'absolute',
              bottom: ORB_SIZE + 10,
              right: onRightEdge ? 0 : 'auto',
              left:  onRightEdge ? 'auto' : 0,
              background: bubbleBg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(200,210,240,0.5)',
              borderRadius: onRightEdge ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              padding: '7px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: bubbleText,
              whiteSpace: bubbleButtons ? 'normal' : 'nowrap',
              maxWidth: bubbleButtons ? 200 : undefined,
              pointerEvents: bubbleButtons ? 'auto' : 'none',
              letterSpacing: '0.01em',
            }}
          >
            {message}
            {/* Action buttons */}
            {bubbleButtons && bubbleButtons.length > 0 && (
              <div style={{
                display: 'flex', gap: 6, marginTop: 8,
                flexDirection: 'row', flexWrap: 'nowrap',
              }}>
                {bubbleButtons.map((btn, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); btn.onClick() }}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: 8,
                      border: btn.primary
                        ? 'none'
                        : `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}`,
                      background: btn.primary
                        ? 'rgba(166,184,255,0.85)'
                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                      color: btn.primary
                        ? '#fff'
                        : (isDark ? '#e8e0f8' : '#1a1a2e'),
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontFamily: 'inherit',
                      pointerEvents: 'auto',
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
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
            animation: pulseAnim,
            ...glowStyle,
          }}
        >
          {/* Core */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: coreColor,
            boxShadow: coreGlow,
            opacity: coreOpacity,
            transition: 'opacity 0.3s ease, box-shadow 0.3s ease, background 0.4s ease',
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

          {/* Pause indicator */}
          {isPaused && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              opacity: 0.7,
            }}>
              ⏸
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Menu Button ───────────────────────────────────────────────────────────────

function MenuButton({
  label, icon, onClick, isDark, danger = false,
}: {
  label: string
  icon: string
  onClick?: () => void
  isDark: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        border: 'none',
        background: danger
          ? (isDark ? 'rgba(255,80,80,0.12)' : 'rgba(255,60,60,0.07)')
          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
        color: danger ? '#ff6060' : (isDark ? '#e8e0f8' : '#1a1a2e'),
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <span style={{ width: 20, textAlign: 'center' }}>{icon}</span>
      {label}
    </button>
  )
}
