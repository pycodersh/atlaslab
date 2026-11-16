'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * StayMap 의 확대 · 이동 레이어. 지도 이미지 · 경로 · 핀 · 말풍선을 한 덩어리로 CSS transform 해서
 * 서로 어긋나지 않는다(말풍선 글자 크기도 cqw 라 같이 커진다).
 *
 * - 마우스 휠로는 확대하지 않는다 — 글을 읽으며 스크롤하다 지도에 걸리지 않게.
 * - 확대는 오른쪽 아래 + / − / Reset 버튼, 폰은 두 손가락 핀치. 확대된 상태에서만 끌어서 이동한다.
 * - 확대 전에는 한 손가락 세로 스크롤이 그대로 페이지를 내린다(touch-action: pan-y).
 * - 바탕은 고정 래스터라 확대는 '돋보기'다 — 3배까지만(그 이상은 흐려진다).
 * - 축척 막대는 확대 배율만큼 길어져 늘 맞는 거리를 가리킨다.
 */
const MAX = 3
const STEP = 1.5

type View = { s: number; x: number; y: number }

export function StayMapZoom({ children, badge, scale }: {
  children: ReactNode
  badge?: string
  scale: { label: string; frac: number }   // frac = 막대 길이 / 지도 폭
}) {
  const box = useRef<HTMLDivElement>(null)
  const [v, setV] = useState<View>({ s: 1, x: 0, y: 0 })
  const [anim, setAnim] = useState(false)
  const vRef = useRef(v)
  vRef.current = v

  // 지도 틀 밖으로 나가지 않게 이동 범위를 묶는다(원점 0,0 기준 scale)
  const clamp = useCallback((n: View): View => {
    const el = box.current
    if (!el) return n
    const w = el.clientWidth, h = el.clientHeight
    const s = Math.min(MAX, Math.max(1, n.s))
    return { s, x: Math.min(0, Math.max(w - w * s, n.x)), y: Math.min(0, Math.max(h - h * s, n.y)) }
  }, [])

  // (cx, cy) 지점을 고정한 채 배율을 바꾼다
  const zoomAt = useCallback((s: number, cx: number, cy: number, smooth: boolean) => {
    const cur = vRef.current
    const px = (cx - cur.x) / cur.s, py = (cy - cur.y) / cur.s
    const ns = Math.min(MAX, Math.max(1, s))
    setAnim(smooth)
    setV(clamp({ s: ns, x: cx - px * ns, y: cy - py * ns }))
  }, [clamp])

  const zoomBy = (f: number) => {
    const el = box.current
    if (!el) return
    zoomAt(vRef.current.s * f, el.clientWidth / 2, el.clientHeight / 2, true)
  }
  const reset = () => { setAnim(true); setV({ s: 1, x: 0, y: 0 }) }

  // 마우스 · 펜: 확대된 상태에서 끌어 이동
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || vRef.current.s <= 1 || e.button !== 0) return
    if ((e.target as HTMLElement).closest('.sm2-ctrl')) return
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: vRef.current.x, oy: vRef.current.y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setAnim(false)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    setV(clamp({ s: vRef.current.s, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null
  }

  // 터치: 두 손가락 핀치 + 확대 중 한 손가락 이동. 페이지 스크롤을 막아야 해서 passive:false 로 직접 단다.
  useEffect(() => {
    const el = box.current
    if (!el) return
    type T = { d: number; s: number; mx: number; my: number; x: number; y: number } | null
    let pinch: T = null
    let pan: { tx: number; ty: number; ox: number; oy: number } | null = null
    const rel = (t: Touch) => { const r = el.getBoundingClientRect(); return { x: t.clientX - r.left, y: t.clientY - r.top } }
    const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

    const start = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const a = rel(e.touches[0]), b = rel(e.touches[1])
        const c = vRef.current
        pinch = { d: dist(e.touches[0], e.touches[1]), s: c.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x: c.x, y: c.y }
        pan = null
        setAnim(false)
      } else if (e.touches.length === 1 && vRef.current.s > 1) {
        pan = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, ox: vRef.current.x, oy: vRef.current.y }
        setAnim(false)
      }
    }
    const move = (e: TouchEvent) => {
      if (pinch && e.touches.length === 2) {
        e.preventDefault()
        const a = rel(e.touches[0]), b = rel(e.touches[1])
        const ns = Math.min(MAX, Math.max(1, pinch.s * dist(e.touches[0], e.touches[1]) / pinch.d))
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
        // 핀치 시작 때 손가락 사이에 있던 지도 지점이 지금 손가락 사이에 오도록
        const px = (pinch.mx - pinch.x) / pinch.s, py = (pinch.my - pinch.y) / pinch.s
        setV(clamp({ s: ns, x: mx - px * ns, y: my - py * ns }))
      } else if (pan && e.touches.length === 1) {
        e.preventDefault()
        setV(clamp({ s: vRef.current.s, x: pan.ox + e.touches[0].clientX - pan.tx, y: pan.oy + e.touches[0].clientY - pan.ty }))
      }
    }
    const end = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null
      if (e.touches.length === 1 && vRef.current.s > 1) {
        pan = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, ox: vRef.current.x, oy: vRef.current.y }
      } else if (e.touches.length === 0) pan = null
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
    }
  }, [clamp])

  // 창 폭이 바뀌면(회전 등) 범위를 다시 묶는다
  useEffect(() => {
    const onResize = () => setV(cur => clamp(cur))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  const zoomed = v.s > 1.001
  return (
    <div
      ref={box}
      className={`sm2-zoom${zoomed ? ' is-zoomed' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="sm2-layer" style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.s})`, transition: anim ? 'transform .28s ease' : 'none' }}>
        {children}
      </div>
      {badge && <div className="sm2-badge">{badge}</div>}
      <div className="sm2-scale">{scale.label}<i style={{ width: `${scale.frac * v.s * 100}cqw` }} /></div>
      <div className="sm2-ctrl" role="group" aria-label="Map zoom">
        <button type="button" onClick={() => zoomBy(STEP)} disabled={v.s >= MAX - 0.001} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoomBy(1 / STEP)} disabled={!zoomed} aria-label="Zoom out">−</button>
        <button type="button" className="sm2-reset" onClick={reset} disabled={!zoomed && v.x === 0 && v.y === 0}>Reset</button>
      </div>
    </div>
  )
}
