'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * StayMap 의 확대 · 줌 아웃 레이어.
 *
 * 단계 0 — 동네 상세: 지도 이미지 · 경로 · 핀 · 말풍선을 한 덩어리로 CSS transform(1~3배 돋보기, 서로 어긋나지 않는다).
 * 단계 1 — 도시 전체, 단계 2 — 대한민국 전도: scripts/make-stay-overviews.mjs 가 낮은 줌의 실제 OSM 타일로
 *   미리 구운 바탕(상세 지도와 같은 비율)에 호텔 ★ 와 이름표만 얹는다 — 상세 말풍선 · 경로는 숨긴다.
 *
 * - − 는 상세에서 배율을 먼저 1배로 줄이고, 그다음 도시 → 한국으로 물러난다. + 는 그 반대.
 * - City · Korea 버튼은 한 번에 그 단계로, Reset 은 처음의 동네 상세 1배로 돌아간다.
 * - 마우스 휠로는 확대하지 않는다(글 스크롤이 지도에 걸리지 않게). 폰은 두 손가락 핀치(1배에서 더 오므리면 도시로),
 *   확대된 상세에서만 끌어서 이동한다. 1배에서는 한 손가락 세로 스크롤이 그대로 페이지를 내린다.
 * - 축척 막대는 단계 · 배율에 맞춰 바뀐다.
 */
const MAX = 3
const STEP = 1.5

type View = { s: number; x: number; y: number }
type Scale = { label: string; frac: number }   // frac = 막대 길이 / 지도 폭
type Overview = { img: string; scale: Scale; at: [number, number] }   // at = 호텔 위치(%)
export type StayOverviews = { city: Overview & { name: string }; korea: Overview; hotel: string }

const LEVELS = ['detail', 'city', 'korea'] as const

export function StayMapZoom({ children, badge, scale, overviews }: {
  children: ReactNode
  badge?: string
  scale: Scale
  overviews?: StayOverviews
}) {
  const box = useRef<HTMLDivElement>(null)
  const [v, setV] = useState<View>({ s: 1, x: 0, y: 0 })
  const [level, setLevel] = useState(0)
  const [primed, setPrimed] = useState(false)   // 바탕 이미지는 처음 지도를 만질 때부터 받는다
  const [anim, setAnim] = useState(false)
  const vRef = useRef(v)
  vRef.current = v
  const levelRef = useRef(level)
  levelRef.current = level
  const maxLevel = overviews ? 2 : 0

  const clamp = useCallback((n: View): View => {
    const el = box.current
    if (!el) return n
    const w = el.clientWidth, h = el.clientHeight
    const s = Math.min(MAX, Math.max(1, n.s))
    return { s, x: Math.min(0, Math.max(w - w * s, n.x)), y: Math.min(0, Math.max(h - h * s, n.y)) }
  }, [])

  const zoomAt = useCallback((s: number, cx: number, cy: number, smooth: boolean) => {
    const cur = vRef.current
    const px = (cx - cur.x) / cur.s, py = (cy - cur.y) / cur.s
    const ns = Math.min(MAX, Math.max(1, s))
    setAnim(smooth)
    setV(clamp({ s: ns, x: cx - px * ns, y: cy - py * ns }))
  }, [clamp])

  const goLevel = useCallback((n: number) => {
    setPrimed(true)
    setAnim(true)
    if (n > 0) setV({ s: 1, x: 0, y: 0 })
    setLevel(Math.max(0, Math.min(maxLevel, n)))
  }, [maxLevel])

  const zoomIn = () => {
    if (levelRef.current > 0) return goLevel(levelRef.current - 1)
    const el = box.current
    if (el) zoomAt(vRef.current.s * STEP, el.clientWidth / 2, el.clientHeight / 2, true)
  }
  const zoomOut = () => {
    if (levelRef.current === 0 && vRef.current.s > 1.001) {
      const el = box.current
      if (el) zoomAt(vRef.current.s / STEP, el.clientWidth / 2, el.clientHeight / 2, true)
      return
    }
    goLevel(levelRef.current + 1)
  }
  const reset = () => { setAnim(true); setV({ s: 1, x: 0, y: 0 }); setLevel(0) }

  // 마우스 · 펜: 확대된 상세에서 끌어 이동
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || levelRef.current > 0 || vRef.current.s <= 1 || e.button !== 0) return
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
    type T = { d: number; s: number; mx: number; my: number; x: number; y: number; stepped: boolean } | null
    let pinch: T = null
    let pan: { tx: number; ty: number; ox: number; oy: number } | null = null
    const rel = (t: Touch) => { const r = el.getBoundingClientRect(); return { x: t.clientX - r.left, y: t.clientY - r.top } }
    const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

    const start = (e: TouchEvent) => {
      setPrimed(true)
      if (e.touches.length === 2) {
        const a = rel(e.touches[0]), b = rel(e.touches[1])
        const c = vRef.current
        pinch = { d: dist(e.touches[0], e.touches[1]), s: c.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x: c.x, y: c.y, stepped: false }
        pan = null
        setAnim(false)
      } else if (e.touches.length === 1 && levelRef.current === 0 && vRef.current.s > 1) {
        pan = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, ox: vRef.current.x, oy: vRef.current.y }
        setAnim(false)
      }
    }
    const move = (e: TouchEvent) => {
      if (pinch && e.touches.length === 2) {
        e.preventDefault()
        const ratio = dist(e.touches[0], e.touches[1]) / pinch.d
        // 도시 · 한국 단계: 핀치 한 번에 한 단계씩
        if (levelRef.current > 0 || (pinch.s <= 1.001 && ratio < 0.8)) {
          if (pinch.stepped) return
          if (ratio < 0.8) { pinch.stepped = true; goLevel(levelRef.current + 1) }
          else if (ratio > 1.25) { pinch.stepped = true; goLevel(levelRef.current - 1) }
          return
        }
        const a = rel(e.touches[0]), b = rel(e.touches[1])
        const ns = Math.min(MAX, Math.max(1, pinch.s * ratio))
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
        const px = (pinch.mx - pinch.x) / pinch.s, py = (pinch.my - pinch.y) / pinch.s
        setV(clamp({ s: ns, x: mx - px * ns, y: my - py * ns }))
      } else if (pan && e.touches.length === 1) {
        e.preventDefault()
        setV(clamp({ s: vRef.current.s, x: pan.ox + e.touches[0].clientX - pan.tx, y: pan.oy + e.touches[0].clientY - pan.ty }))
      }
    }
    const end = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null
      if (e.touches.length === 1 && levelRef.current === 0 && vRef.current.s > 1) {
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
  }, [clamp, goLevel])

  useEffect(() => {
    const onResize = () => setV(cur => clamp(cur))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  const zoomed = level === 0 && v.s > 1.001
  const ov = level === 1 ? overviews?.city : level === 2 ? overviews?.korea : null
  const bar = ov ? ov.scale : scale
  const barWidth = bar.frac * (level === 0 ? v.s : 1) * 100
  const isHome = level === 0 && !zoomed && v.x === 0 && v.y === 0

  return (
    <div
      ref={box}
      className={`sm2-zoom sm2-lv-${LEVELS[level]}${zoomed ? ' is-zoomed' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => setPrimed(true)}
    >
      <div className="sm2-layer" aria-hidden={level > 0 || undefined}
        style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.s})`, transition: anim ? 'transform .28s ease, opacity .35s ease' : 'opacity .35s ease' }}>
        {children}
      </div>
      {overviews && primed && (['city', 'korea'] as const).map((k, i) => {
        const o = overviews[k]
        const right = o.at[0] > 66
        return (
          <div key={k} className={`sm2-ov${level === i + 1 ? ' is-on' : ''}`} aria-hidden={level !== i + 1}>
            <img src={o.img} alt="" draggable={false} />
            <span className="sm2-pin sm2-hotel" style={{ left: `${o.at[0]}%`, top: `${o.at[1]}%` }}>★</span>
            <span className={`sm2-ov-name${right ? ' is-left' : ''}`} style={{ left: `${o.at[0]}%`, top: `${o.at[1]}%` }}>{overviews.hotel}</span>
          </div>
        )
      })}
      {badge && <div className="sm2-badge">{badge}</div>}
      <div className="sm2-scale">{bar.label}<i style={{ width: `${barWidth}cqw` }} /></div>
      <div className="sm2-ctrl" role="group" aria-label="Map zoom">
        <button type="button" onClick={zoomIn} disabled={level === 0 && v.s >= MAX - 0.001} aria-label="Zoom in">+</button>
        <button type="button" onClick={zoomOut} disabled={level >= maxLevel && !zoomed} aria-label="Zoom out">−</button>
        {overviews && <>
          <button type="button" className="sm2-txt" onClick={() => goLevel(1)} aria-pressed={level === 1} title={`Show all of ${overviews.city.name}`}>City</button>
          <button type="button" className="sm2-txt" onClick={() => goLevel(2)} aria-pressed={level === 2} title="Show where this is in Korea">Korea</button>
        </>}
        <button type="button" className="sm2-txt" onClick={reset} disabled={isHome}>Reset</button>
      </div>
    </div>
  )
}
