'use client'

/**
 * SwipeDeleteRow
 *
 * Mobile (touch): Swipe left to reveal a red delete button behind the content.
 *   - Drag left ≥ 40% of REVEAL_WIDTH to snap open.
 *   - Tap anywhere on open content (not the red button) to snap closed.
 *   - onDeleteRequest is called when the red button is tapped.
 *
 * PC (mouse): swipe logic is fully skipped; a .pc-trash button in children
 *   is shown via CSS (see globals.css: @media (hover: hover) and (pointer: fine)).
 */

import { useRef } from 'react'
import { Trash2 } from 'lucide-react'

const REVEAL = 72

export function SwipeDeleteRow({
  children,
  onDeleteRequest,
  containerStyle,
  contentBg = 'var(--pw)',
}: {
  children: React.ReactNode
  onDeleteRequest: () => void
  containerStyle?: React.CSSProperties
  contentBg?: string
}) {
  const contentRef  = useRef<HTMLDivElement>(null)
  const startX      = useRef(0)
  const isDragging  = useRef(false)
  const isOpen      = useRef(false)

  function moveTo(x: number, animate: boolean) {
    const el = contentRef.current
    if (!el) return
    el.style.transition = animate ? 'transform 0.22s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
    el.style.transform  = `translateX(${x}px)`
    isOpen.current = x <= -(REVEAL - 2)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') return
    isDragging.current = true
    startX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return
    const base = isOpen.current ? -REVEAL : 0
    const dx   = e.clientX - startX.current
    const next = Math.max(-REVEAL, Math.min(0, base + dx))
    moveTo(next, false)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDragging.current) return
    isDragging.current = false
    const base = isOpen.current ? -REVEAL : 0
    const dx   = e.clientX - startX.current
    const finalX = base + dx
    if (isOpen.current) {
      moveTo(finalX > -(REVEAL * 0.5) ? 0 : -REVEAL, true)
    } else {
      moveTo(finalX < -(REVEAL * 0.4) ? -REVEAL : 0, true)
    }
  }

  function handleContentClick(e: React.MouseEvent) {
    // When row is open: close on any tap, block child click
    if (isOpen.current) {
      e.preventDefault()
      e.stopPropagation()
      moveTo(0, true)
    }
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...containerStyle }}>
      {/* Red delete panel behind — only visible when content slides */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: REVEAL,
        background: '#E84040',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <button
          type="button"
          onClick={onDeleteRequest}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10 }}
          aria-label="삭제"
        >
          <Trash2 style={{ width: 20, height: 20, color: '#fff' }} strokeWidth={1.8} />
        </button>
      </div>

      {/* Sliding content */}
      <div
        ref={contentRef}
        style={{ background: contentBg, touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { isDragging.current = false; moveTo(0, true) }}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  )
}
