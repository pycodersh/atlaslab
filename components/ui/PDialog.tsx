'use client'

/**
 * PDialog — PATTO unified dialog / modal component.
 *
 * All in-app dialogs, confirms, alerts, and install sheets must use this
 * component so the design stays consistent across the app.
 *
 * Usage:
 *   <PDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     title="Delete Essay"
 *     description="This action cannot be undone."
 *     actions={[
 *       { label: 'Cancel', onClick: () => setOpen(false), variant: 'secondary' },
 *       { label: 'Delete', onClick: handleDelete, variant: 'danger' },
 *     ]}
 *   />
 *
 * For custom body content, use the `children` prop instead of `description`.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type PDialogActionVariant =
  | 'primary'   // Accent fill — Install, Confirm
  | 'secondary' // Glass/transparent — Cancel, Not now
  | 'danger'    // Burgundy text — Delete, Remove
  | 'text'      // Plain text accent — Got it, OK

export interface PDialogAction {
  label: string
  onClick: () => void
  variant?: PDialogActionVariant
  disabled?: boolean
}

export interface PDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  /** Replaces description when you need custom content below the title. */
  children?: React.ReactNode
  /** Optional hint/info row above the step list (e.g. "Open in Safari") */
  hint?: React.ReactNode
  actions?: PDialogAction[]
  /** Max width. Default 360. */
  maxWidth?: number
  /** Whether clicking the backdrop closes the dialog. Default true. */
  closeOnBackdrop?: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DANGER   = '#B44A5A'
const ANIM_MS  = 220

// ── Button renderer ───────────────────────────────────────────────────────────

function ActionButton({ action, isOnly }: { action: PDialogAction; isOnly: boolean }) {
  const v = action.variant ?? 'primary'

  const style: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      flex: 1,
      padding: '13px 0',
      borderRadius: 14,
      border: 'none',
      cursor: action.disabled ? 'not-allowed' : 'pointer',
      fontSize: 14,
      fontWeight: v === 'secondary' ? 500 : 700,
      fontFamily: 'inherit',
      opacity: action.disabled ? 0.45 : 1,
      transition: 'opacity 0.15s',
      minWidth: 0,
    }

    if (v === 'primary') return { ...base, background: 'var(--pt)', color: 'var(--pb)' }
    if (v === 'danger')  return { ...base, background: 'none', color: DANGER, border: '1px solid rgba(180,74,90,0.20)' }
    if (v === 'text')    return { ...base, background: 'none', color: 'var(--pa)' }
    // secondary
    return {
      ...base,
      background: 'var(--pglass)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--pglass-border)',
      color: 'var(--pm)',
    }
  })()

  return (
    <button
      type="button"
      onClick={action.disabled ? undefined : action.onClick}
      style={style}
    >
      {action.label}
    </button>
  )
}

// ── PDialog ───────────────────────────────────────────────────────────────────

export function PDialog({
  open,
  onClose,
  title,
  description,
  children,
  hint,
  actions = [],
  maxWidth = 360,
  closeOnBackdrop = true,
}: PDialogProps) {
  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)

  // Mount into DOM
  useEffect(() => { setMounted(true) }, [])

  // Animate in/out
  useEffect(() => {
    if (!mounted) return
    if (open) {
      const id = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(id)
    } else {
      setVisible(false)
    }
  }, [open, mounted])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, ANIM_MS)
  }

  if (!mounted) return null

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: visible ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'none',
        WebkitBackdropFilter: visible ? 'blur(6px)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
        pointerEvents: open ? 'auto' : 'none',
        transition: `background ${ANIM_MS}ms ease`,
      }}
      onClick={e => { if (closeOnBackdrop && e.target === e.currentTarget) handleClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth,
          maxHeight: 'calc(100dvh - 60px)',
          overflowX: 'hidden',
          overflowY: 'auto',
          background: 'var(--pglass)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid var(--pglass-border)',
          borderRadius: 28,
          boxShadow: '0 8px 48px rgba(0,0,0,0.16)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(4px)',
          opacity: visible ? 1 : 0,
          transition: `transform ${ANIM_MS}ms cubic-bezier(0.34,1.56,0.64,1), opacity ${ANIM_MS}ms ease`,
        }}
      >
        {/* Header row: title + X */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '22px 20px 0' }}>
          {title ? (
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              {title}
            </p>
          ) : <div />}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              background: 'rgba(120,120,128,0.10)', border: 'none', borderRadius: 999,
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0, flexShrink: 0, marginLeft: 8,
            }}
          >
            <X style={{ width: 12, height: 12, color: 'var(--pm)' }} strokeWidth={2.2} />
          </button>
        </div>

        {/* Description */}
        {description && (
          <p style={{ fontSize: 13.5, color: 'var(--pm)', margin: '10px 20px 0', lineHeight: 1.6 }}>
            {description}
          </p>
        )}

        {/* Hint row */}
        {hint && (
          <div style={{ margin: '14px 20px 0', padding: '10px 13px', borderRadius: 12, background: 'rgba(88,86,214,0.08)', border: '1px solid rgba(88,86,214,0.15)' }}>
            {hint}
          </div>
        )}

        {/* Custom children */}
        {children && (
          <div style={{ padding: '0 20px' }}>
            {children}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: actions.length === 2 ? 'row' : 'column',
            gap: actions.length === 2 ? 8 : 10,
            padding: '20px 20px 22px',
          }}>
            {actions.map((a, i) => (
              <ActionButton key={i} action={a} isOnly={actions.length === 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
