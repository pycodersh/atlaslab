'use client'

/**
 * SwipeDeleteRow
 *
 * Touch: swipe left to reveal iOS-style Delete button. One row open at a time.
 *        Tap Delete → animate out → call onDeleteRequest.
 * PC (pointer:fine): hover reveals a small trash icon.
 */

import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

const REVEAL = 80

// Singleton: only one row open at a time
let _globalClose: (() => void) | null = null

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
  const contentRef   = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startX       = useRef(0)
  const isDragging   = useRef(false)
  const isOpen       = useRef(false)
  const [isPointerFine, setIsPointerFine] = useState(false)
  const [isHovered,    setIsHovered]      = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setIsPointerFine(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsPointerFine(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function closeThis() {
    moveTo(0, true)
  }

  function moveTo(x: number, animate: boolean) {
    const el = contentRef.current
    if (!el) return
    el.style.transition = animate ? 'transform 0.22s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
    el.style.transform  = `translateX(${x}px)`
    isOpen.current = x <= -(REVEAL - 2)
    if (isOpen.current) {
      _globalClose = closeThis
    } else if (_globalClose === closeThis) {
      _globalClose = null
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') return
    isDragging.current = true
    startX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    // Close other row as soon as we start dragging left
    if (dx < -6 && _globalClose && _globalClose !== closeThis) {
      _globalClose()
    }
    const base = isOpen.current ? -REVEAL : 0
    const next = Math.max(-REVEAL, Math.min(0, base + dx))
    moveTo(next, false)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDragging.current) return
    isDragging.current = false
    const base   = isOpen.current ? -REVEAL : 0
    const dx     = e.clientX - startX.current
    const finalX = base + dx
    if (isOpen.current) {
      moveTo(finalX > -(REVEAL * 0.5) ? 0 : -REVEAL, true)
    } else {
      moveTo(finalX < -(REVEAL * 0.4) ? -REVEAL : 0, true)
    }
  }

  function handleContentClick(e: React.MouseEvent) {
    if (isOpen.current) {
      e.preventDefault()
      e.stopPropagation()
      moveTo(0, true)
    }
  }

  function animateDelete() {
    const content   = contentRef.current
    const container = containerRef.current
    if (!content || !container) { onDeleteRequest(); return }

    // Step 1: slide content out
    content.style.transition = 'transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s'
    content.style.transform  = 'translateX(-100%)'
    content.style.opacity    = '0'

    // Step 2: collapse height
    const h = container.offsetHeight
    container.style.height   = `${h}px`
    container.style.overflow = 'hidden'
    setTimeout(() => {
      container.style.transition = 'height 0.2s cubic-bezier(0.4,0,0.2,1)'
      container.style.height     = '0'
      setTimeout(() => onDeleteRequest(), 200)
    }, 200)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden', ...containerStyle }}>
      {/* iOS-style Delete panel behind */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: REVEAL,
        background: '#FF3B30',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <button
          type="button"
          onClick={animateDelete}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: '#fff', padding: '8px 14px',
          }}
          aria-label="Delete"
        >
          <Trash2 style={{ width: 16, height: 16 }} strokeWidth={1.8} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}>Delete</span>
        </button>
      </div>

      {/* Sliding content */}
      <div
        ref={contentRef}
        style={{ background: contentBg, touchAction: 'pan-y', position: 'relative' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { isDragging.current = false; moveTo(0, true) }}
        onClick={handleContentClick}
        onMouseEnter={() => isPointerFine && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}

        {/* PC hover trash */}
        {isPointerFine && (
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            display: 'flex', alignItems: 'center',
            paddingRight: 12,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); animateDelete() }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 6, display: 'flex', alignItems: 'center',
                borderRadius: 8,
              }}
              aria-label="Delete"
            >
              <Trash2 style={{ width: 14, height: 14, color: '#C0C0C8' }} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
