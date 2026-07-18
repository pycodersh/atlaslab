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
      <GuideDock />
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
  const [pos,    setPos]    = useState<Pos>({ x: 0, y: 0 })
  const [corner, setCorner] = useState<Corner>('br')

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
            width:           activeCard.size === 'large' ? CARD_W_LG : CARD_W,
            background:      cardBg,
            backdropFilter:  'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border:          cardBorder,
            boxShadow:       cardShadow,
            borderRadius:    activeCard.size === 'small' ? 14
                           : activeCard.size === 'medium' ? 16 : 18,
            padding:         activeCard.size === 'small' ? '9px 13px'
                           : activeCard.size === 'medium' ? '13px 14px' : '16px',
            pointerEvents:   'auto',
          }}
        >
          {activeCard.isHelp
            ? <HelpMenu ctx={ctx} dark={dark} textMain={textMain} textSub={textSub} textPri={textPri} />
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
          marginTop: card.size === 'small' ? 0 : 8,
          display:   'flex',
          gap:       card.size === 'large' ? 0 : 12,
          flexDirection: card.size === 'large' ? 'column' : 'row',
          justifyContent: card.size === 'large' ? undefined : 'flex-end',
        }}>
          {card.buttons!.map((btn, i) => (
            <button
              key={i}
              onClick={() => { onClose(); btn.onClick() }}
              style={{
                background: card.size === 'large'
                  ? (dark ? 'rgba(107,143,255,0.12)' : 'rgba(107,143,255,0.08)')
                  : 'none',
                border: card.size === 'large'
                  ? (dark ? '0.5px solid rgba(107,143,255,0.25)' : '0.5px solid rgba(107,143,255,0.22)')
                  : 'none',
                borderRadius: card.size === 'large' ? 10 : 0,
                padding: card.size === 'large' ? '10px 14px' : 0,
                color:   btn.primary ? textPri : textSec,
                fontSize: card.size === 'large' ? 13 : 13,
                fontWeight: btn.primary ? 600 : 500,
                cursor:    'pointer',
                fontFamily: 'inherit',
                width:      card.size === 'large' ? '100%' : undefined,
                textAlign:  card.size === 'large' ? 'center' : undefined,
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

const HELP_ITEMS: Array<{ label: string; icon: string; action: string; dim?: boolean }> = [
  { label: 'Repeat', icon: '↩', action: 'repeat' },
  { label: 'Skip',   icon: '⏩', action: 'skip'   },
  { label: 'Pause',  icon: '⏸', action: 'pause'  },
  { label: 'Exit',   icon: '✕', action: 'exit', dim: true },
]

import type { TrainerCtx } from '@/contexts/TrainerContext'

function HelpMenu({ ctx, dark, textMain, textSub, textPri }: {
  ctx: TrainerCtx | null
  dark: boolean; textMain: string; textSub: string; textPri: string
}) {
  const divider = dark ? 'rgba(142,167,255,0.08)' : 'rgba(142,167,255,0.10)'
  return (
    <div>
      <p style={{
        margin: '0 0 8px', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: textPri,
      }}>
        Need help?
      </p>
      {HELP_ITEMS.map((item, i) => (
        <div key={item.action}>
          {i > 0 && <div style={{ height: 0, borderTop: `0.5px solid ${divider}`, margin: '2px 0' }} />}
          <button
            onClick={() => {
              if      (item.action === 'repeat') ctx?.handleMenuRepeat()
              else if (item.action === 'skip')   ctx?.handleMenuSkip()
              else if (item.action === 'pause')  ctx?.handleMenuPause()
              else if (item.action === 'exit')   ctx?.handleMenuExit()
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', padding: '7px 2px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: item.dim ? (dark ? 'rgba(255,255,255,0.35)' : '#bbb') : textMain,
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            <span style={{ width: 16, textAlign: 'center', fontSize: 11, flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        </div>
      ))}
    </div>
  )
}
