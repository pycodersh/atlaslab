'use client'

import { useContext, useRef } from 'react'
import { TrainerContext, useTrainerState } from '@/contexts/TrainerContext'
import { useTheme } from '@/components/ThemeProvider'

// ── Provider ─────────────────────────────────────────────────────────────────
// Wraps children with TrainerContext and renders the floating button inside it.

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  const state = useTrainerState()
  return (
    <TrainerContext.Provider value={state}>
      {children}
      <TrainerFloatingButton />
    </TrainerContext.Provider>
  )
}

// ── Floating Glass Button ─────────────────────────────────────────────────────
// Reads from TrainerContext (which is provided by TrainerProvider above).

function TrainerFloatingButton() {
  const ctx = useContext(TrainerContext)
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const message   = ctx?.message   ?? null
  const isActive  = ctx?.isActive  ?? false
  const isPulsing = ctx?.isPulsing ?? false
  const page      = ctx?.page      ?? 'other'

  // Increment key each time a new message arrives so CSS animation replays
  const prevMsgRef = useRef<string | null>(null)
  const keyRef     = useRef(0)
  if (message && message !== prevMsgRef.current) {
    keyRef.current += 1
  }
  prevMsgRef.current = message

  // Library page = no button
  if (page === 'library') return null

  const btnSize  = isActive ? 44 : 40
  const btnBg    = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)'
  const dotColor = isDark ? '#A6B8FF' : '#8EA7FF'
  const btnShadow = isActive
    ? '0 4px 20px rgba(107,143,255,0.30), inset 0 1px 0 rgba(255,255,255,0.9)'
    : '0 2px 12px rgba(107,143,255,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'

  const bubbleBg   = isDark ? 'rgba(30,25,60,0.92)' : 'rgba(255,255,255,0.92)'
  const bubbleText = isDark ? '#e8e0f8' : '#1a1a2e'
  const tailBg     = isDark ? 'rgba(30,25,60,0.92)' : 'rgba(255,255,255,0.92)'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {/* Speech bubble */}
      {message && (
        <div
          key={keyRef.current}
          className="trainer-bubble-enter"
          style={{
            marginBottom: 8,
            position: 'relative',
            background: bubbleBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255,255,255,0.8)',
            borderRadius: '12px 12px 4px 12px',
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 500,
            color: bubbleText,
            boxShadow: '0 4px 16px rgba(107,143,255,0.15)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}
        >
          {message}
          {/* Tail — bottom-right of bubble, pointing at button */}
          <span
            style={{
              position: 'absolute',
              bottom: -4,
              right: 10,
              width: 8,
              height: 8,
              background: tailBg,
              borderRight: '0.5px solid rgba(255,255,255,0.8)',
              borderBottom: '0.5px solid rgba(255,255,255,0.8)',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* Glass button */}
      <div
        className={isPulsing ? 'trainer-pulse-once' : undefined}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: '50%',
          background: btnBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.7)',
          boxShadow: btnShadow,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dotColor,
            opacity: isActive ? 1.0 : 0.7,
            transition: 'opacity 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
