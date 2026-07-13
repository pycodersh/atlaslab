'use client'

/**
 * GuideDock — Orb + Conversation Card
 *
 * The single, unified feedback interface for PATTO.
 * Replaces all alerts, toasts, dialogs, and popups.
 *
 * Orb:  40px glass sphere, fixed near bottom-right.
 *        Long-press (500ms) → drag to any corner.
 * Card: Unfolds above/beside the Orb.
 *        3 sizes: small (auto-dismiss), medium (buttons), large (with subtext).
 */

import { useContext, useRef, useState, useEffect, useCallback } from 'react'
import { TrainerContext, type CardSpec, type DockButton, TrainerStateProvider } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'

// ── Constants ─────────────────────────────────────────────────────────────────

const ORB   = 40                  // Orb diameter px
const NAV   = 72                  // tab bar height
const SNAP_MARGIN = 20            // px from screen edge
const CARD_W      = 220           // small/medium card width
const CARD_W_LG   = 260           // large card width
const LONG_PRESS_MS = 480         // ms to activate drag

// ── Corner snap ───────────────────────────────────────────────────────────────

type Corner = 'tl' | 'tr' | 'bl' | 'br'
type Pos    = { x: number; y: number }

function snapToCorner(pos: Pos): { pos: Pos; corner: Corner } {
  const W  = window.innerWidth
  const H  = window.innerHeight
  const cx = pos.x + ORB / 2
  const cy = pos.y + ORB / 2
  const isRight  = cx > W / 2
  const isBottom = cy > H / 2
  const corner: Corner = isBottom ? (isRight ? 'br' : 'bl') : (isRight ? 'tr' : 'tl')
  const x = isRight  ? W - ORB - SNAP_MARGIN : SNAP_MARGIN
  const y = isBottom ? H - ORB - NAV - SNAP_MARGIN : SNAP_MARGIN + 44   // 44 = safe top
  return { pos: { x, y }, corner }
}

function defaultPos(): Pos {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  return { x: window.innerWidth - ORB - SNAP_MARGIN, y: window.innerHeight - ORB - NAV - SNAP_MARGIN }
}

const POS_KEY    = 'patto-dock-pos'
const CORNER_KEY = 'patto-dock-corner'

function loadSavedPos(): { pos: Pos; corner: Corner } | null {
  if (typeof window === 'undefined') return null
  try {
    const p = localStorage.getItem(POS_KEY)
    const c = localStorage.getItem(CORNER_KEY)
    if (!p || !c) return null
    return { pos: JSON.parse(p), corner: c as Corner }
  } catch { return null }
}
function saveCornerPos(pos: Pos, corner: Corner) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(pos))
    localStorage.setItem(CORNER_KEY, corner)
  } catch {}
}

// ── Provider export (for layout.tsx compatibility) ────────────────────────────

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  return (
    <TrainerStateProvider>
      {children}
    </TrainerStateProvider>
  )
}

// ── GuideDock ─────────────────────────────────────────────────────────────────

function GuideDock() {
  const ctx    = useContext(TrainerContext)
  const { theme } = useTheme()
  const dark   = theme === 'dark'

  const card       = ctx?.card       ?? null
  const orbState   = ctx?.orbState   ?? 'idle'
  const isPulsing  = ctx?.isPulsing  ?? false
  const page       = ctx?.page       ?? 'other'
  const tapMode    = ctx?.tapMode    ?? 'menu'
  const sessionPhase = ctx?.sessionPhase ?? 'inactive'
  const inSession  = sessionPhase !== 'inactive'

  // ── Position ──────────────────────────────────────────────────────────────
  const saved = typeof window !== 'undefined' ? loadSavedPos() : null
  const [pos,    setPos]    = useState<Pos>(saved?.pos ?? defaultPos())
  const [corner, setCorner] = useState<Corner>(saved?.corner ?? 'br')

  useEffect(() => {
    const s = loadSavedPos()
    if (s) { setPos(s.pos); setCorner(s.corner) }
    else    { setPos(defaultPos()); setCorner('br') }
  }, [])

  // ── Drag state ────────────────────────────────────────────────────────────
  const [dragging,    setDragging]    = useState(false)
  const [dragActive,  setDragActive]  = useState(false)   // long-press activated
  const longPressRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragOriginRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)
  const orbRef        = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    orbRef.current?.setPointerCapture(e.pointerId)
    dragOriginRef.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y }

    // Long-press timer
    longPressRef.current = setTimeout(() => {
      setDragActive(true)
      setDragging(true)
    }, LONG_PRESS_MS)
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // Cancel long-press if moved significantly before threshold
    if (!dragging && dragOriginRef.current) {
      const { px, py } = dragOriginRef.current
      if (Math.abs(e.clientX - px) > 6 || Math.abs(e.clientY - py) > 6) {
        if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null }
      }
    }
    if (!dragging || !dragOriginRef.current) return
    const { px, py, ox, oy } = dragOriginRef.current
    const W = window.innerWidth; const H = window.innerHeight
    const nx = Math.max(0, Math.min(W - ORB, ox + (e.clientX - px)))
    const ny = Math.max(44, Math.min(H - ORB - NAV, oy + (e.clientY - py)))
    setPos({ x: nx, y: ny })
  }, [dragging])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null }
    if (dragging) {
      const { pos: snapped, corner: c } = snapToCorner(pos)
      setPos(snapped); setCorner(c)
      saveCornerPos(snapped, c)
      setDragging(false); setDragActive(false)
      return
    }
    // Short tap: fire handleOrbTap
    if (!dragActive) ctx?.handleOrbTap()
    setDragActive(false)
  }, [dragging, dragActive, pos, ctx])

  // ── Card animation key & exit class ──────────────────────────────────────
  const prevCardRef  = useRef<CardSpec | null>(null)
  const [exitCard, setExitCard] = useState<CardSpec | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const prev = prevCardRef.current
    if (prev && !card) {
      // Card just dismissed — play exit animation
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
      setExitCard(prev)
      exitTimerRef.current = setTimeout(() => setExitCard(null), 180)
    }
    prevCardRef.current = card
  }, [card])

  // Library page: hidden unless card is active
  if (page === 'library' && !card && !exitCard) return null

  // ── Derived orb classes ───────────────────────────────────────────────────
  const isWaiting  = orbState === 'waiting'
  const isSpeaking = orbState === 'guiding'
  const isPaused   = orbState === 'paused'

  let orbShellClass = ''
  if (!dragging && !isPaused) {
    if      (isSpeaking) orbShellClass = 'dock-orb-speaking'
    else if (isPulsing)  orbShellClass = 'dock-orb-complete'
    else                 orbShellClass = 'dock-orb-breathe'
  }

  // ── Card position (relative to Orb) ──────────────────────────────────────
  const isOnRight  = corner === 'br' || corner === 'tr'
  const isOnBottom = corner === 'br' || corner === 'bl'
  const cardInClass  = isOnRight ? 'dock-card-in-br'  : 'dock-card-in-bl'
  const cardOutClass = isOnRight ? 'dock-card-out-br' : 'dock-card-out-bl'

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    ...(isOnBottom ? { bottom: ORB + 10 } : { top: ORB + 10 }),
    ...(isOnRight  ? { right: 0 }         : { left: 0 }),
  }

  // ── Colors ────────────────────────────────────────────────────────────────
  const orbShell = dark
    ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(200,215,255,0.10) 45%, rgba(170,190,255,0.06) 100%)'
    : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(240,243,255,0.7) 40%, rgba(210,220,255,0.35) 70%, rgba(190,205,255,0.15) 100%)'
  const orbBorder = dark
    ? '0.5px solid rgba(255,255,255,0.20)'
    : '0.5px solid rgba(255,255,255,0.9)'
  const orbShadow = dark
    ? '0 2px 12px rgba(142,167,255,0.25)'
    : '0 2px 12px rgba(107,143,255,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'

  const coreWaiting = isWaiting
  const coreColor = isPaused
    ? (dark ? 'radial-gradient(circle at 35% 28%, #9090B8 0%, #7070A0 40%, #505088 100%)' : 'radial-gradient(circle at 35% 28%, #C0C0D8 0%, #9090B8 40%, #7070A0 100%)')
    : 'radial-gradient(circle at 35% 28%, #C8D4FF 0%, #A6B8FF 45%, #8090F0 100%)'

  const cardBg     = dark ? 'rgba(28,22,58,0.94)' : 'rgba(255,255,255,0.93)'
  const cardBorder = dark ? '0.5px solid rgba(142,167,255,0.22)' : '0.5px solid rgba(210,220,245,0.75)'
  const cardShadow = '0 4px 24px rgba(107,143,255,0.12), 0 1px 4px rgba(107,143,255,0.08)'
  const textMain   = dark ? '#e8e0f8' : '#1a1a2e'
  const textSub    = dark ? 'rgba(232,224,248,0.55)' : 'rgba(40,40,80,0.52)'
  const textPri    = dark ? '#A6B8FF' : '#6B8FFF'
  const textSec    = dark ? 'rgba(255,255,255,0.38)' : '#aaa'

  const activeCard = card ?? exitCard
  const isExit     = !card && !!exitCard

  return (
    <div
      ref={orbRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position:    'fixed',
        left:        pos.x,
        top:         pos.y,
        width:       ORB,
        height:      ORB,
        zIndex:      50,
        touchAction: 'none',
        userSelect:  'none',
        cursor:      dragging ? 'grabbing' : inSession ? 'pointer' : 'default',
      }}
    >
      {/* ── Conversation Card ── */}
      {activeCard && (
        <div
          key={activeCard.id}
          className={isExit ? cardOutClass : cardInClass}
          style={{
            ...cardStyle,
            width:           activeCard.isHelp ? undefined : activeCard.size === 'large' ? CARD_W_LG : CARD_W,
            background:      cardBg,
            backdropFilter:  'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border:          cardBorder,
            boxShadow:       cardShadow,
            borderRadius:    activeCard.isHelp
                               ? (isOnRight ? '10px 10px 4px 10px' : '10px 10px 10px 4px')
                               : 10,
            padding:         activeCard.isHelp ? '12px 13px'
                           : activeCard.size === 'small' ? '9px 13px'
                           : activeCard.size === 'medium' ? '13px 14px' : '16px',
            pointerEvents:   'auto',
          }}
        >
          {activeCard.isHelp
            ? <HelpMenu ctx={ctx} dark={dark} />
            : <CardContent
                card={activeCard}
                dark={dark}
                textMain={textMain} textSub={textSub} textPri={textPri} textSec={textSec}
                onClose={() => ctx?.clearMessage()}
              />
          }
        </div>
      )}

      {/* ── Orb Shell ── */}
      <div
        className={orbShellClass}
        style={{
          width:            ORB,
          height:           ORB,
          borderRadius:     '50%',
          background:       orbShell,
          border:           orbBorder,
          backdropFilter:   'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow:        orbShadow,
          transform:        dragging ? 'scale(1.06)' : 'scale(1)',
          transition:       'transform 0.18s ease, box-shadow 0.18s ease',
          position:         'relative',
          overflow:         'hidden',
        }}
      >
        {/* Periwinkle core */}
        <div style={{
          position:     'absolute',
          top:          '50%', left: '50%',
          transform:    'translate(-50%,-50%)',
          width:        14, height: 14,
          borderRadius: '50%',
          background:   coreColor,
          boxShadow:    isSpeaking
            ? '0 0 10px rgba(142,167,255,0.9), 0 0 20px rgba(142,167,255,0.5)'
            : '0 0 6px rgba(142,167,255,0.55)',
          opacity:      isPaused ? 0.4 : 1,
          transition:   'box-shadow 0.3s ease, opacity 0.3s ease',
          animation:    coreWaiting ? 'dock-orb-waiting 1.8s ease-in-out infinite' : undefined,
        }} />

        {/* Specular highlight */}
        <div style={{
          position:     'absolute',
          top:          7, left: 8,
          width:        9, height: 6,
          borderRadius: '50%',
          background:   'rgba(255,255,255,0.70)',
          transform:    'rotate(-25deg)',
          filter:       'blur(1.5px)',
          pointerEvents:'none',
        }} />

        {/* Pause icon */}
        {isPaused && (
          <div style={{
            position:'absolute', inset:0, display:'flex',
            alignItems:'center', justifyContent:'center',
            fontSize:12, opacity:0.6,
          }}>⏸</div>
        )}

        {/* tapMode='done' indicator: thin ring */}
        {tapMode === 'done' && !isPaused && (
          <div style={{
            position:'absolute', inset:2,
            borderRadius:'50%',
            border:'1.5px solid rgba(142,167,255,0.50)',
            pointerEvents:'none',
          }} />
        )}
      </div>
    </div>
  )
}

// ── Card content ──────────────────────────────────────────────────────────────

function CardContent({
  card, dark, textMain, textSub, textPri, textSec, onClose,
}: {
  card: CardSpec
  dark: boolean
  textMain: string; textSub: string; textPri: string; textSec: string
  onClose: () => void
}) {
  const hasButtons = card.buttons && card.buttons.length > 0

  return (
    <>
      {/* Message */}
      <p style={{
        margin: 0,
        fontSize: card.size === 'small' ? 13 : card.size === 'medium' ? 14 : 15,
        fontWeight: card.size === 'large' ? 700 : 600,
        color: textMain,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
        marginBottom: (card.subtext || hasButtons) ? (card.size === 'large' ? 6 : 5) : 0,
      }}>
        {card.message}
      </p>

      {/* Subtext (large) */}
      {card.subtext && (
        <p style={{
          margin: 0, marginBottom: hasButtons ? 12 : 0,
          fontSize: 12, color: textSub, lineHeight: 1.5, fontWeight: 400,
        }}>
          {card.subtext}
        </p>
      )}

      {/* Buttons */}
      {hasButtons && (
        <div style={{
          marginTop: 10,
          display: 'flex',
          gap: 8,
          flexDirection: card.size === 'large' ? 'column' : 'row',
        }}>
          {card.buttons!.map((btn, i) => (
            <button
              key={i}
              onClick={() => { onClose(); btn.onClick() }}
              style={{
                flex: card.size !== 'large' ? 1 : undefined,
                height: 40,
                background: btn.primary
                  ? (dark ? 'rgba(160,176,255,0.25)' : 'rgba(128,144,240,0.20)')
                  : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.07)'),
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: btn.primary
                  ? (dark ? '1px solid rgba(160,176,255,0.50)' : '1px solid rgba(128,144,240,0.40)')
                  : (dark ? '1px solid rgba(255,255,255,0.20)' : '1px solid rgba(255,255,255,0.15)'),
                borderRadius: 10,
                padding: '0 14px',
                color: btn.primary
                  ? (dark ? '#ffffff' : '#4050B0')
                  : (dark ? '#ffffff' : '#5C6BC0'),
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                width: card.size === 'large' ? '100%' : undefined,
                textAlign: 'center',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ── Help Menu card content ────────────────────────────────────────────────────

import { IconRefresh, IconPlayerPause, IconX } from '@tabler/icons-react'
import type { TrainerCtx } from '@/contexts/TrainerContext'

type HelpAction = 'repeat' | 'pause' | 'exit'
const HELP_ITEMS: Array<{
  label: string
  Icon:  React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  action: HelpAction
  exit?:  boolean
}> = [
  { label: 'Repeat', Icon: IconRefresh,    action: 'repeat' },
  { label: 'Pause',  Icon: IconPlayerPause, action: 'pause'  },
  { label: 'Exit',   Icon: IconX,           action: 'exit', exit: true },
]

function HelpMenu({ ctx, dark }: {
  ctx:  TrainerCtx | null
  dark: boolean
}) {
  const iconColor   = dark ? '#A6B8FF' : '#8EA7FF'
  const iconExit    = dark ? 'rgba(255,255,255,0.40)' : '#ccc'
  const textColor   = dark ? '#e8e0f8' : '#1a1a2e'
  const textExit    = dark ? 'rgba(255,255,255,0.38)' : '#aaa'
  const headerColor = '#8EA7FF'
  const divider     = dark ? 'rgba(142,167,255,0.12)' : 'rgba(142,167,255,0.08)'

  return (
    <div style={{ minWidth: 140 }}>
      <p style={{
        margin: '0 0 6px', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: headerColor,
      }}>
        Need help?
      </p>
      {HELP_ITEMS.map((item, i) => (
        <div key={item.action}>
          {i > 0 && <div style={{ height: 0, borderTop: `0.5px solid ${divider}`, margin: '1px 0' }} />}
          <button
            onClick={() => {
              if      (item.action === 'repeat') ctx?.handleMenuRepeat()
              else if (item.action === 'pause')  ctx?.handleMenuPause()
              else if (item.action === 'exit')   ctx?.handleMenuExit()
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '6px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <item.Icon
              size={14}
              strokeWidth={1.8}
              style={{ color: item.exit ? iconExit : iconColor, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: item.exit ? textExit : textColor }}>
              {item.label}
            </span>
          </button>
        </div>
      ))}
    </div>
  )
}
