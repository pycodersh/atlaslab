'use client'

/**
 * 펜화 지도 — 한지 아이보리 바탕에 먹선(홈 파노라마와 같은 화풍). Explore Korea 지도와 Hotspot Finder 가 같이 쓴다.
 *
 * 그림(해안 · 도 경계 · 강 · 산 · 물결)은 scripts/make-penmap.mts 가 구운 public/maps/penmap-v1.svg 를 한 번 받아 끼운다.
 * 핀 · 영문 지명은 여기서 같은 투영(lib/maps/penmap)으로 얹고, 확대해도 화면 크기가 같다.
 * 넓게 보면 전국 그림(.pm-lod-n), 좁게 보면 지역 상세 그림(.pm-lod-c)이 보인다.
 * 조작: + / − , 끌어서 이동, 두 손가락 확대. view 가 바뀌면 그 범위로 부드럽게 옮겨 간다.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DETAIL_BELOW, INK, NATIONAL, PAPER, PLACE_LABELS, project, type Box, type LL } from '@/lib/maps/penmap'
import peakLabels from '@/lib/maps/penmap-labels.generated.json'

export type PenPin = {
  id: string
  ll: LL
  kind: 'hotel' | 'place' | 'spot'
  /** 핀 안 숫자(Hotspot Finder 명소) */
  num?: number
  /** 핀 옆 영문 이름 */
  label?: string
  active?: boolean
}
export type PenArea = { id: string; name: string; ll: LL; active?: boolean }

const ART_URL = '/maps/penmap-v2.svg'
let artPromise: Promise<string> | null = null
const loadArt = () =>
  (artPromise ??= fetch(ART_URL).then(r => r.text()).then(t => t.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')))

type Cam = { cx: number; cy: number; upp: number } // 중심(지도 단위) · 화면 1px 당 지도 단위

const MIN_UPP = 0.05
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

const CSS = `
.pm { position: relative; overflow: hidden; background: ${PAPER}; user-select: none; -webkit-user-select: none; }
.pm svg.pm-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.pm.is-drag svg.pm-svg { cursor: grabbing; }
.pm.is-pan svg.pm-svg { cursor: grab; touch-action: none; }
.pm-art path, .pm-art line { fill: none; stroke: ${INK}; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; }
/* 바다 = 종이(#F7F5EE), 땅 = 웜 스톤 틴트 #EFECE2 + 먹선 하나 */
.pm-art .pm-land { fill: #EFECE2; stroke-width: 1.1; }
.pm-art .pm-land-c { fill: #EFECE2; stroke: none; }
.pm-art .pm-coast { stroke-width: 1.2; }
.pm-art .pm-nk { fill: #F3F1EA; stroke-width: .7; opacity: .7; }
.pm-art .pm-river-n { stroke: #8A9BA6; stroke-width: 1.4; opacity: .9; }
.pm-art .pm-river { stroke-width: .9; opacity: .7; }
.pm-art .pm-water { fill: ${PAPER}; stroke-width: .8; }
.pm-art .pm-dist { stroke-width: .5; stroke-dasharray: 1 3; opacity: .4; }
.pm-art .pm-ripple path { stroke-width: .8; }.pm-art .pm-mtn path { stroke-width: .85; }
.pm-art .pm-mtn .pm-hatch { stroke-width: .5; opacity: .7; }
.pm .pm-lod-c { display: none; }
.pm.is-detail .pm-lod-c { display: inline; }
.pm.is-detail .pm-lod-n { display: none; }
.pm-lbl { font-family: "DM Sans", Inter, system-ui, sans-serif; fill: ${INK}; paint-order: stroke; stroke: ${PAPER}; stroke-width: 3.5px; stroke-linejoin: round; pointer-events: none; }
.pm-lbl-city { font-size: 11.5px; font-weight: 700; letter-spacing: .14em; stroke-width: 4px; }
.pm-lbl-sea { font-family: "Playfair Display", Georgia, serif; font-style: italic; font-size: 12px; letter-spacing: .32em; fill: #8A847B; }
.pm-lbl-island { font-size: 9px; font-weight: 600; letter-spacing: .14em; fill: #6B655D; }
.pm-lbl-peak { font-family: "Playfair Display", Georgia, serif; font-style: italic; font-size: 10px; letter-spacing: .12em; fill: #5A544C; }
.pm-lbl-spot { font-size: 11px; font-weight: 600; letter-spacing: .01em; }
.pm-dot-city { fill: ${PAPER}; stroke: ${INK}; stroke-width: 1.4; }
.pm-city { cursor: pointer; }
.pm-city .pm-lbl { pointer-events: auto; }
.pm-city:hover .pm-lbl-city { fill: #9E2B25; }
.pm-city:focus { outline: none; }
.pm-city:focus-visible .pm-lbl-city { fill: #9E2B25; text-decoration: underline; }
.pm-area { cursor: pointer; }
.pm-area.is-static { cursor: inherit; pointer-events: none; }
.pm-area text { font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; fill: ${INK}; paint-order: stroke; stroke: ${PAPER}; stroke-width: 4px; }
.pm-area rect { fill: ${PAPER}; stroke: ${INK}; stroke-width: 1; }
.pm-area.is-active rect { fill: ${INK}; }
.pm-area.is-active text { fill: ${PAPER}; stroke: ${INK}; }
.pm-area:focus-visible rect { stroke: #9E2B25; stroke-width: 2.5; }
.pm-area:focus { outline: none; }
.pm-pin { cursor: pointer; }
.pm-pin:focus { outline: none; }
.pm-pin:focus-visible .pm-pin-dot { stroke: #9E2B25; stroke-width: 3; }
.pm-pin-num { font: 700 10px "DM Sans", Inter, system-ui, sans-serif; fill: ${PAPER}; pointer-events: none; }
.pm-halo { fill: none; stroke: #9E2B25; stroke-width: 2; opacity: .45; }
.pm-ctrl { position: absolute; left: 12px; top: 12px; z-index: 3; display: flex; flex-direction: column; border: 1px solid ${INK}; border-radius: 8px; overflow: hidden; background: ${PAPER}; }
.pm-ctrl button { width: 34px; height: 34px; padding: 0; border: 0; background: transparent; color: ${INK}; font: 500 19px/1 "DM Sans", system-ui, sans-serif; cursor: pointer; }
.pm-ctrl button + button { border-top: 1px solid ${INK}; }
.pm-ctrl button:hover:not(:disabled) { background: #EDE9DE; }
.pm-ctrl button:disabled { opacity: .35; cursor: default; }
.pm-ctrl button:focus-visible { outline: 2px solid #9E2B25; outline-offset: -2px; }
.pm-credit { position: absolute; right: 6px; bottom: 4px; z-index: 3; max-width: calc(100% - 12px); font: 400 9px/1.3 "DM Sans", system-ui, sans-serif; color: #7A746B; background: rgba(247,245,238,.85); padding: 1px 5px; border-radius: 3px; }
.pm-credit a { color: inherit; }
.pm-pop { position: absolute; z-index: 4; transform: translate(-50%, calc(-100% - 16px)); width: max-content; max-width: min(260px, calc(100% - 24px));
  padding: 10px 12px 11px; background: #FFFDF8; border: 1px solid ${INK}; border-radius: 10px; box-shadow: 0 6px 18px rgba(38,36,34,.18); font: 400 12.5px/1.45 "DM Sans", system-ui, sans-serif; color: #3F3A36; }
.pm-pop::after { content: ''; position: absolute; left: 50%; bottom: -7px; width: 12px; height: 12px; background: #FFFDF8; border-right: 1px solid ${INK}; border-bottom: 1px solid ${INK}; transform: translateX(-50%) rotate(45deg); }
.pm-pop-x { position: absolute; top: 2px; right: 4px; width: 26px; height: 26px; border: 0; background: none; color: #7A746B; font-size: 17px; line-height: 1; cursor: pointer; }
`

export function PenMap({
  view, pins = [], areas = [], onPin, onArea, interactive = true, popup, topRight, className = '', ariaLabel, focus, cities = [], onCity,
}: {
  /** 전국 지도에서 누를 수 있는 도시 이름표(지역 id = 영문 이름 소문자) */
  cities?: string[]
  onCity?: (id: string) => void
  /** 보여 줄 범위(지도 단위). 바뀌면 부드럽게 옮겨 간다 */
  view: Box
  pins?: PenPin[]
  /** 서울 권역 같은 누를 수 있는 이름표 */
  areas?: PenArea[]
  onPin?: (id: string) => void
  onArea?: (id: string) => void
  /** + / − · 끌기 · 두 손가락 확대 */
  interactive?: boolean
  /** 핀 위 말풍선 — pinId 자리에 내용을 띄운다 */
  popup?: { pinId: string; content: ReactNode; onClose: () => void } | null
  topRight?: ReactNode
  className?: string
  ariaLabel: string
  /** 이 핀으로 날아가 가까이 본다(목록에서 고를 때) — key 가 바뀔 때마다 */
  focus?: { pinId: string; key: number } | null
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [cam, setCam] = useState<Cam | null>(null)
  const [art, setArt] = useState<string | null>(null)
  const anim = useRef<number | null>(null)
  const camRef = useRef<Cam | null>(null)
  camRef.current = cam

  useEffect(() => { let dead = false; loadArt().then(t => { if (!dead) setArt(t) }).catch(() => {}); return () => { dead = true } }, [])

  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fit = useCallback((b: Box, w: number, h: number): Cam => ({ cx: b.x + b.w / 2, cy: b.y + b.h / 2, upp: Math.max(b.w / w, b.h / h) * 1.06 }), [])
  const maxUpp = size.w ? fit(NATIONAL, size.w, size.h).upp * 1.25 : 100

  const flyTo = useCallback((to: Cam, ms = 650) => {
    if (anim.current) cancelAnimationFrame(anim.current)
    const from = camRef.current
    if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) { setCam(to); return }
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms), k = ease(t)
      setCam({ cx: from.cx + (to.cx - from.cx) * k, cy: from.cy + (to.cy - from.cy) * k, upp: Math.exp(Math.log(from.upp) + (Math.log(to.upp) - Math.log(from.upp)) * k) })
      if (t < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
  }, [])

  // 범위가 바뀌면(지역 칩 · 탭) 그쪽으로. 처음엔 바로 맞춘다
  const viewKey = `${Math.round(view.x)},${Math.round(view.y)},${Math.round(view.w)},${Math.round(view.h)}`
  useEffect(() => {
    if (!size.w || !size.h) return
    const to = fit(view, size.w, size.h)
    if (!camRef.current) setCam(to); else flyTo(to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey, size.w, size.h])

  // 목록에서 고른 핀으로
  useEffect(() => {
    if (!focus || !size.w) return
    const p = pins.find(x => x.id === focus.pinId); if (!p) return
    const [x, y] = project(...p.ll)
    const cur = camRef.current
    flyTo({ cx: x, cy: y, upp: Math.min(cur?.upp ?? 1, 0.55) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key])

  const zoom = (f: number) => { const c = camRef.current; if (c) flyTo({ ...c, upp: Math.min(maxUpp, Math.max(MIN_UPP, c.upp * f)) }, 280) }

  // 끌기 · 두 손가락 확대
  const ptrs = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ cam: Cam; dist?: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const onDown = (e: React.PointerEvent) => {
    if (!interactive || !camRef.current) return
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...ptrs.current.values()]
    gesture.current = { cam: camRef.current, dist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : undefined, moved: false }
    if (anim.current) cancelAnimationFrame(anim.current)
  }
  const start = useRef<{ x: number; y: number } | null>(null)
  const onMove = (e: React.PointerEvent) => {
    const g = gesture.current; if (!g || !ptrs.current.has(e.pointerId)) return
    const prev = ptrs.current.get(e.pointerId)!
    if (!start.current) start.current = prev
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...ptrs.current.values()]
    if (pts.length === 2 && g.dist) {
      const dd = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      setCam(c => c && { ...c, upp: Math.min(maxUpp, Math.max(MIN_UPP, g.cam.upp * (g.dist! / dd))) })
      g.moved = true
      return
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y
    if (!g.moved && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) < 4) return
    if (!g.moved) { g.moved = true; setDragging(true); (e.currentTarget as Element).setPointerCapture(e.pointerId) }
    setCam(c => c && { ...c, cx: c.cx - dx * c.upp, cy: c.cy - dy * c.upp })
  }
  const onUp = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId)
    if (!ptrs.current.size) { gesture.current = null; start.current = null; setTimeout(() => setDragging(false), 0) }
  }

  const vb = cam && size.w ? { x: cam.cx - (size.w * cam.upp) / 2, y: cam.cy - (size.h * cam.upp) / 2, w: size.w * cam.upp, h: size.h * cam.upp } : null
  const detail = !!vb && vb.w < DETAIL_BELOW
  const s = cam?.upp ?? 1
  const at = (ll: LL) => project(...ll)
  const toScreen = (ll: LL) => { const [x, y] = at(ll); return vb ? { left: (x - vb.x) / s, top: (y - vb.y) / s } : null }

  const placeLabels = useMemo(() => PLACE_LABELS, [])
  const peaks = (peakLabels.peaks as { name: string; ll: LL; lod: 'n' | 'c' }[]).filter(p => p.lod === (detail ? 'c' : 'n'))
  const tap = (fn: () => void) => () => { if (!dragging) fn() }
  const popPin = popup ? pins.find(p => p.id === popup.pinId) : null
  const popPos = popPin ? toScreen(popPin.ll) : null

  return (
    <div ref={wrap} translate="no" className={`pm notranslate ${detail ? 'is-detail' : ''} ${interactive ? 'is-pan' : ''} ${dragging ? 'is-drag' : ''} ${className}`}>
      <style>{CSS}</style>
      {vb && (
        <svg className="pm-svg notranslate" viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} role="group" aria-label={ariaLabel}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <defs>
            <pattern id="pm-water-hatch" width="1.4" height="1.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
              <line x1="0" y1="0.7" x2="1.4" y2="0.7" stroke={INK} strokeWidth="0.22" opacity=".55" />
            </pattern>
          </defs>
          {art && <g className="pm-art" dangerouslySetInnerHTML={{ __html: art }} />}

          {/* 누를 수 있는 권역 이름표(서울) */}
          {areas.map(a => {
            const [x, y] = at(a.ll)
            const w = a.name.length * 7.6 + 18
            return (
              <g key={a.id} className={`pm-area${a.active ? ' is-active' : ''}${onArea ? '' : ' is-static'}`} transform={`translate(${x} ${y}) scale(${s})`}
                {...(onArea ? {
                  role: 'button', tabIndex: 0, 'aria-pressed': !!a.active, 'aria-label': `Show ${a.name}`,
                  onClick: tap(() => onArea(a.id)),
                  onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onArea(a.id) } },
                } : {})}>
                <rect x={-w / 2} y={(a.active ? -34 : 0) - 11} width={w} height={22} rx={11} />
                <text y={(a.active ? -34 : 0) + 4} textAnchor="middle">{a.name.toUpperCase()}</text>
              </g>
            )
          })}

          {/* 핀 — 고른 핀이 맨 위 */}
          {(() => {
            // 숫자 핀끼리 화면에서 겹치면 둘레로 벌려 놓고, 제자리엔 작은 점 + 가는 선을 남긴다
            const placed: { x: number; y: number }[] = []
            const off = new Map<string, [number, number]>()
            for (const p of pins) {
              if (p.num == null) continue
              const [x, y] = at(p.ll); const sx = x / s, sy = y / s
              let k = 0, ox = 0, oy = 0
              while (placed.some(q => Math.hypot(q.x - (sx + ox), q.y - (sy + oy)) < 19) && k < 12) {
                k++; const ang = (k * 60 * Math.PI) / 180 - Math.PI / 2, rad = 20 * Math.ceil(k / 6)
                ox = Math.cos(ang) * rad; oy = Math.sin(ang) * rad
              }
              placed.push({ x: sx + ox, y: sy + oy }); off.set(p.id, [ox, oy])
            }
            return [...pins].sort((a, b) => Number(!!a.active) - Number(!!b.active)).map(p => {
            const [x, y] = at(p.ll)
            const [ox, oy] = off.get(p.id) ?? [0, 0]
            const r = p.num ? 9 : p.kind === 'spot' ? 4.5 : p.kind === 'hotel' ? 6.5 : 6
            const fill = p.kind === 'hotel' ? '#9E2B25' : p.kind === 'place' || p.num ? INK : PAPER
            return (
              <g key={p.id} className="pm-pin" transform={`translate(${x} ${y}) scale(${s})`} role={onPin ? 'button' : undefined} tabIndex={onPin ? 0 : undefined}
                aria-label={p.label} onClick={onPin ? tap(() => onPin(p.id)) : undefined}
                onKeyDown={onPin ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPin(p.id) } } : undefined}>
                {(ox || oy) ? <><line x1="0" y1="0" x2={ox} y2={oy} stroke={INK} strokeWidth="1" /><circle r="2.2" fill={INK} /></> : null}
                <g transform={`translate(${ox} ${oy})`}>
                {onPin && <circle r={r + 8} fill="transparent" />}
                {p.active && <circle className="pm-halo" r={r + 5} />}
                <circle className="pm-pin-dot" r={r} fill={fill} stroke={p.kind === 'spot' && !p.num ? INK : PAPER} strokeWidth={p.kind === 'spot' && !p.num ? 2.2 : 2} />
                {p.num != null && <text className="pm-pin-num" y="3.5" textAnchor="middle">{p.num}</text>}
                </g>
              </g>
            )
          })
          })()}
          {/* 영문 지명 · 봉우리 — 화면 크기 고정, 핀보다 위(종이색 테두리로 핀 위에서도 읽힌다) */}
          {placeLabels.map(l => {
            if (detail) return null   // 확대하면 지역 그림 · 핀 · 권역 이름표가 말한다
            const [x, y] = at(l.ll)
            const a = l.anchor ?? 'start'
            const dx = a === 'start' ? 11 : a === 'end' ? -11 : 0
            const id = l.name.toLowerCase()
            const go = l.kind === 'city' && onCity && cities.includes(id) ? () => onCity(id) : null
            return (
              <g key={l.name} transform={`translate(${x} ${y}) scale(${s})`} className={go ? 'pm-city' : undefined}
                {...(go ? {
                  role: 'button', tabIndex: 0, 'aria-label': `Zoom to ${l.name.charAt(0) + l.name.slice(1).toLowerCase()}`,
                  onClick: tap(go),
                  onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } },
                } : {})}>
                {go && <rect x={a === 'end' ? -l.name.length * 7.6 - 16 : a === 'middle' ? -l.name.length * 3.8 - 6 : -6} y={-12} width={l.name.length * 7.6 + 22} height={22} fill="transparent" />}
                {l.kind === 'city' && !detail && <circle className="pm-dot-city" r="2.4" />}
                <text className={`pm-lbl pm-lbl-${l.kind}`} x={dx} y={l.kind === 'city' && a === 'middle' ? -9 : 3.5} textAnchor={a}>{l.name}</text>
              </g>
            )
          })}
          {peaks.map(p => { const [x, y] = at(p.ll); return <g key={p.name + p.ll.join()} transform={`translate(${x} ${y}) scale(${s})`}><text className="pm-lbl pm-lbl-peak" y="14" textAnchor="middle">{p.name}</text></g> })}

        </svg>
      )}

      {interactive && (
        <div className="pm-ctrl">
          <button type="button" aria-label="Zoom in" disabled={!cam || cam.upp <= MIN_UPP * 1.01} onClick={() => zoom(1 / 1.7)}>+</button>
          <button type="button" aria-label="Zoom out" disabled={!cam || cam.upp >= maxUpp * 0.99} onClick={() => zoom(1.7)}>−</button>
        </div>
      )}
      {topRight}
      {popup && popPos && (
        <div className="pm-pop" style={{ left: Math.min(Math.max(popPos.left, 136), size.w - 136), top: Math.max(popPos.top, 120) }} role="dialog">
          <button type="button" className="pm-pop-x" aria-label="Close" onClick={popup.onClose}>×</button>
          {popup.content}
        </div>
      )}
      <div className="pm-credit">Natural Earth · geoBoundaries · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></div>
    </div>
  )
}
