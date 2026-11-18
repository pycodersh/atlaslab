'use client'
import { X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BuyStyles } from './BuyStyles'

const SIDE_MIN_WIDTH = 1024
const SWIPE_CLOSE_PX = 80
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

interface Props {
  title: string
  onClose: () => void
  /** 닫힌 뒤 포커스를 돌려줄 요소(시트를 연 버튼) */
  returnFocusTo?: HTMLElement | null
  children: ReactNode
}

/**
 * 구매 시트 — 1024px 미만은 바텀 시트, 이상은 우측 패널.
 * 닫기: 바깥 탭 · ESC · 닫기 버튼 · (바텀 시트) 머리를 아래로 끌기.
 * 열린 동안 배경 스크롤을 잠그고 Tab 포커스를 시트 안에 가둔다. 닫히면 연 버튼으로 포커스를 돌려준다.
 */
export default function BuySheet({ title, onClose, returnFocusTo, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [mode, setMode] = useState<'bottom' | 'side'>('bottom')
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)

  useEffect(() => {
    const sync = () => setMode(window.innerWidth >= SIDE_MIN_WIDTH ? 'side' : 'bottom')
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  // 배경 스크롤 잠금 · 포커스 이동/복귀 · ESC · Tab 가두기
  useEffect(() => {
    const { body, documentElement } = document
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    const scrollbar = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    closeRef.current?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => !el.closest('[hidden]'))
      if (items.length === 0) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
      returnFocusTo?.focus({ preventScroll: true })
    }
  }, [onClose, returnFocusTo])

  // 바텀 시트 머리를 아래로 끌면 닫는다
  const onTouchStart = (e: React.TouchEvent) => { if (mode === 'bottom') dragStart.current = e.touches[0].clientY }
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return
    setDragY(Math.max(0, e.touches[0].clientY - dragStart.current))
  }
  const onTouchEnd = () => {
    if (dragStart.current == null) return
    dragStart.current = null
    if (dragY > SWIPE_CLOSE_PX) onClose()
    else setDragY(0)
  }

  return (
    <>
      <BuyStyles />
      <div className="kpb-backdrop" data-dim="true" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kpb-sheet-title"
        className="kpb-sheet"
        data-mode={mode}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div className="kpb-sheet-head" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={mode === 'side' ? { paddingTop: 20 } : undefined}>
          <div style={{ flex: 1 }}>
            {mode === 'bottom' && <div className="kpb-grab" aria-hidden="true" />}
            <h2 id="kpb-sheet-title" className="kpb-h" style={{ fontSize: 22 }}>{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="kpb-close" onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="kpb-sheet-body">{children}</div>
      </div>
    </>
  )
}
