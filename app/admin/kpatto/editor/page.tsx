'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

// ── Constants ───────────────────────────────────────────────────────────────
const CW = 430  // fixed content width in px (ratio denominator for both x & y)

// ── Types ───────────────────────────────────────────────────────────────────
interface Pt { x: number; y: number }  // ratio of CW

interface Tail {
  anchorIndex: number  // edge from points[i] → points[(i+1)%n]
  anchorT: number      // 0–1 along that edge
  tip: Pt
}

interface TextBox {
  x: number; y: number; width: number; height: number
  fontSize: number; lineHeight: number
  fontWeight: 400 | 600 | 700
  textAlign: 'left' | 'center' | 'right'
  padding: number; ko: string; en: string
}

interface Bubble {
  id: string
  points: Pt[]
  cornerRadius: number
  fill: string; stroke: string; strokeWidth: number
  tail: Tail | null
  textBox: TextBox
}

// ── Undo / redo ─────────────────────────────────────────────────────────────
function useHistory(initial: Bubble[]) {
  const [bubbles, setBubbles] = useState<Bubble[]>(initial)
  const [undoStack, setUndoStack] = useState<Bubble[][]>([])
  const [redoStack, setRedoStack] = useState<Bubble[][]>([])

  const commit = useCallback((next: Bubble[]) => {
    setUndoStack(prev => [...prev, bubbles])
    setRedoStack([])
    setBubbles(next)
  }, [bubbles])

  const beginDrag = useCallback(() => {
    setUndoStack(prev => [...prev, bubbles])
    setRedoStack([])
  }, [bubbles])

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (!prev.length) return prev
      setRedoStack(r => [...r, bubbles])
      setBubbles(prev[prev.length - 1])
      return prev.slice(0, -1)
    })
  }, [bubbles])

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (!prev.length) return prev
      setUndoStack(u => [...u, bubbles])
      setBubbles(prev[prev.length - 1])
      return prev.slice(0, -1)
    })
  }, [bubbles])

  return { bubbles, setBubbles, commit, beginDrag, undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 }
}

// ── Utilities ────────────────────────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 8) }

function buildPath(pts: Pt[], tail: Tail | null, cr: number): string {
  const n = pts.length
  if (n < 3) return ''
  const px = pts.map(p => [p.x * CW, p.y * CW] as [number, number])
  const dist = (a: [number, number], b: [number, number]) => Math.hypot(b[0] - a[0], b[1] - a[1])
  const lerp = (a: [number, number], b: [number, number], t: number): [number, number] =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  const f = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`

  const corners = px.map((v, i) => {
    const prev = px[(i - 1 + n) % n], next = px[(i + 1) % n]
    const dIn = dist(prev, v), dOut = dist(v, next)
    const r = Math.min(cr, dIn * 0.45, dOut * 0.45)
    return {
      entry: r > 0 ? lerp(v, prev, r / Math.max(dIn, 0.001)) : v,
      exit:  r > 0 ? lerp(v, next, r / Math.max(dOut, 0.001)) : v,
      v,
    }
  })

  let d = `M ${f(corners[0].exit)}`
  for (let i = 0; i < n; i++) {
    const ni = (i + 1) % n
    const c = corners[ni]
    if (tail && tail.anchorIndex === i) {
      const a = px[i], b = px[ni]
      const tl = lerp(a, b, Math.max(0.05, tail.anchorT - 0.1))
      const tr = lerp(a, b, Math.min(0.95, tail.anchorT + 0.1))
      const tp: [number, number] = [tail.tip.x * CW, tail.tip.y * CW]
      d += ` L ${f(tl)} L ${f(tp)} L ${f(tr)}`
    }
    d += ` L ${f(c.entry)}`
    if (cr > 0 && (c.entry[0] !== c.v[0] || c.entry[1] !== c.v[1]))
      d += ` Q ${f(c.v)} ${f(c.exit)}`
  }
  return d + ' Z'
}

function makeBubble(pts: Pt[]): Bubble {
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
  return {
    id: genId(), points: pts,
    cornerRadius: 0,
    fill: 'rgba(255,255,255,0.97)', stroke: '#222', strokeWidth: 2,
    tail: null,
    textBox: { x: cx - 0.12, y: cy - 0.05, width: 0.24, height: 0.10, fontSize: 18, lineHeight: 1.4, fontWeight: 600, textAlign: 'center', padding: 6, ko: '', en: '' },
  }
}

// ── Props panel ──────────────────────────────────────────────────────────────
function PropsPanel({ b, onChange, onChangeTB, onDelete, onDuplicate }: {
  b: Bubble | null
  onChange: (patch: Partial<Bubble>) => void
  onChangeTB: (patch: Partial<TextBox>) => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const S: React.CSSProperties = {
    width: '100%', background: '#13131f', border: '1px solid #2a2a44',
    borderRadius: 6, color: '#e0e0ff', padding: '5px 8px', fontSize: 12,
    boxSizing: 'border-box',
  }
  const section = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  )
  const row = (label: string, node: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: '#888', flexShrink: 0, width: 56 }}>{label}</span>
      <div style={{ flex: 1 }}>{node}</div>
    </div>
  )

  if (!b) return (
    <div style={{ color: '#444', fontSize: 12, padding: '12px 0', lineHeight: 1.8 }}>
      <div style={{ marginBottom: 8, color: '#666', fontSize: 11 }}>단축키</div>
      <div>G · 그리기 모드</div>
      <div>V · 선택 모드</div>
      <div>ESC · 취소</div>
      <div>⌘Z · 실행 취소</div>
      <div>Del · 삭제</div>
    </div>
  )

  const addTail = () => {
    const cx = b.points.reduce((s, p) => s + p.x, 0) / b.points.length
    const cy = b.points.reduce((s, p) => s + p.y, 0) / b.points.length
    onChange({ tail: { anchorIndex: 0, anchorT: 0.5, tip: { x: cx + 0.05, y: cy + 0.35 } } })
  }

  return (
    <div style={{ fontSize: 12 }}>
      {section('외곽선', <>
        {row('채우기', <input type="color" value={b.fill.startsWith('rgba') ? '#ffffff' : b.fill}
          onChange={e => onChange({ fill: e.target.value })} style={{ ...S, padding: 2, height: 26, cursor: 'pointer' }} />)}
        {row('테두리', <input type="color" value={b.stroke}
          onChange={e => onChange({ stroke: e.target.value })} style={{ ...S, padding: 2, height: 26, cursor: 'pointer' }} />)}
        {row('두께', <input type="range" min={0} max={6} step={0.5} value={b.strokeWidth}
          onChange={e => onChange({ strokeWidth: Number(e.target.value) })} style={{ width: '100%' }} />)}
        {row('둥글기', <input type="range" min={0} max={30} value={b.cornerRadius}
          onChange={e => onChange({ cornerRadius: Number(e.target.value) })} style={{ width: '100%' }} />)}
      </>)}

      {section('꼬리', b.tail ? (<>
        {row('앵커 엣지', <select value={b.tail.anchorIndex}
          onChange={e => onChange({ tail: { ...b.tail!, anchorIndex: Number(e.target.value) } })} style={S}>
          {b.points.map((_, i) => <option key={i} value={i}>엣지 {i + 1}→{(i + 1) % b.points.length + 1}</option>)}
        </select>)}
        {row('위치', <input type="range" min={0} max={1} step={0.01} value={b.tail.anchorT}
          onChange={e => onChange({ tail: { ...b.tail!, anchorT: Number(e.target.value) } })} style={{ width: '100%' }} />)}
        <button onClick={() => onChange({ tail: null })} style={{ ...S, marginTop: 4, cursor: 'pointer', color: '#f87171', textAlign: 'center' }}>꼬리 제거</button>
      </>) : (
        <button onClick={addTail} style={{ ...S, cursor: 'pointer', textAlign: 'center', color: '#a5b4fc', padding: '6px 8px' }}>+ 꼬리 추가</button>
      ))}

      {section('텍스트', <>
        <div style={{ marginBottom: 4, fontSize: 10, color: '#555' }}>KO</div>
        <textarea value={b.textBox.ko} rows={2}
          onChange={e => onChangeTB({ ko: e.target.value })}
          placeholder="한국어 대사" style={{ ...S, resize: 'vertical', marginBottom: 6 }} />
        <div style={{ marginBottom: 4, fontSize: 10, color: '#555' }}>EN</div>
        <textarea value={b.textBox.en} rows={2}
          onChange={e => onChangeTB({ en: e.target.value })}
          placeholder="English" style={{ ...S, resize: 'vertical', marginBottom: 8 }} />

        {row('크기', <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="range" min={12} max={40} value={b.textBox.fontSize}
            onChange={e => onChangeTB({ fontSize: Number(e.target.value) })} style={{ flex: 1 }} />
          <span style={{ color: '#a0a0c0', width: 30, textAlign: 'right' }}>{b.textBox.fontSize}px</span>
        </div>)}
        {row('줄간격', <input type="number" step={0.05} min={1} max={3} value={b.textBox.lineHeight}
          onChange={e => onChangeTB({ lineHeight: Number(e.target.value) })} style={{ ...S, width: '100%' }} />)}
        {row('굵기', <div style={{ display: 'flex', gap: 3 }}>
          {([400, 600, 700] as const).map(w => (
            <button key={w} onClick={() => onChangeTB({ fontWeight: w })} style={{
              flex: 1, padding: '4px 0', borderRadius: 4, border: '1px solid',
              borderColor: b.textBox.fontWeight === w ? '#6366f1' : '#2a2a44',
              background: b.textBox.fontWeight === w ? '#6366f1' : '#13131f',
              color: '#e0e0ff', cursor: 'pointer', fontSize: 11, fontWeight: w,
            }}>{w === 400 ? '보통' : w === 600 ? '중간' : '굵게'}</button>
          ))}
        </div>)}
        {row('정렬', <div style={{ display: 'flex', gap: 3 }}>
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onClick={() => onChangeTB({ textAlign: a })} style={{
              flex: 1, padding: '4px 0', borderRadius: 4, border: '1px solid',
              borderColor: b.textBox.textAlign === a ? '#6366f1' : '#2a2a44',
              background: b.textBox.textAlign === a ? '#6366f1' : '#13131f',
              color: '#e0e0ff', cursor: 'pointer', fontSize: 13,
            }}>{a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}</button>
          ))}
        </div>)}
        {row('여백', <input type="number" min={0} max={30} value={b.textBox.padding}
          onChange={e => onChangeTB({ padding: Number(e.target.value) })} style={{ ...S, width: '100%' }} />)}
      </>)}

      {section('텍스트 박스 위치/크기', <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {(['x', 'y', 'width', 'height'] as const).map(k => (
            <div key={k}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{k.toUpperCase()}</div>
              <input type="number" step={0.01} value={Number(b.textBox[k]).toFixed(2)}
                onChange={e => onChangeTB({ [k]: Number(e.target.value) })}
                style={{ ...S, width: '100%' }} />
            </div>
          ))}
        </div>
      </>)}

      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button onClick={onDuplicate} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid #2a2a44', background: '#13131f', color: '#a5b4fc', cursor: 'pointer', fontSize: 12 }}>복제</button>
        <button onClick={onDelete} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>삭제</button>
      </div>
    </div>
  )
}

// ── Main editor ──────────────────────────────────────────────────────────────
export default function KPattoEditorPage() {
  const { bubbles, setBubbles, commit, beginDrag, undo, redo, canUndo, canRedo } = useHistory([])
  const [mode, setMode] = useState<'select' | 'drawing'>('select')
  const [drawingPts, setDrawingPts] = useState<Pt[]>([])
  const [mousePos, setMousePos] = useState<Pt | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [iframeH, setIframeH] = useState(800)
  const [saveMsg, setSaveMsg] = useState('')

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const svgRef    = useRef<SVGSVGElement>(null)

  const dragRef = useRef<{
    kind: 'bubble' | 'vertex' | 'tail' | 'textbox' | 'textresize'
    id: string
    vIdx?: number
    startMouse: Pt
    snapPts: Pt[]
    snapTailTip: Pt | null
    snapTB: { x: number; y: number; width: number; height: number }
  } | null>(null)

  // Fit iframe height
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const fit = () => {
      const h = iframe.contentDocument?.documentElement?.scrollHeight ?? 0
      if (h > 100) setIframeH(h)
    }
    if (iframe.contentDocument?.readyState === 'complete') fit()
    else iframe.addEventListener('load', fit)
    return () => iframe.removeEventListener('load', fit)
  }, [])

  // SVG coordinate helper
  const svgPt = useCallback((e: { clientX: number; clientY: number }): Pt => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return { x: (e.clientX - r.left) / CW, y: (e.clientY - r.top) / CW }
  }, [])

  // Global mouse move / up
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const pt = svgPt(e)
      if (mode === 'drawing') { setMousePos(pt); return }
      const drag = dragRef.current
      if (!drag) return
      const dx = pt.x - drag.startMouse.x
      const dy = pt.y - drag.startMouse.y
      setBubbles(prev => prev.map(b => {
        if (b.id !== drag.id) return b
        switch (drag.kind) {
          case 'bubble': return {
            ...b,
            points: drag.snapPts.map(p => ({ x: p.x + dx, y: p.y + dy })),
            tail: b.tail && drag.snapTailTip ? { ...b.tail, tip: { x: drag.snapTailTip.x + dx, y: drag.snapTailTip.y + dy } } : b.tail,
            textBox: { ...b.textBox, x: drag.snapTB.x + dx, y: drag.snapTB.y + dy },
          }
          case 'vertex': {
            const pts = [...drag.snapPts]
            pts[drag.vIdx!] = { x: pts[drag.vIdx!].x + dx, y: pts[drag.vIdx!].y + dy }
            return { ...b, points: pts }
          }
          case 'tail': return drag.snapTailTip ? { ...b, tail: { ...b.tail!, tip: { x: drag.snapTailTip.x + dx, y: drag.snapTailTip.y + dy } } } : b
          case 'textbox': return { ...b, textBox: { ...b.textBox, x: drag.snapTB.x + dx, y: drag.snapTB.y + dy } }
          case 'textresize': return { ...b, textBox: { ...b.textBox, width: Math.max(0.05, drag.snapTB.width + dx), height: Math.max(0.02, drag.snapTB.height + dy) } }
        }
      }))
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [mode, svgPt, setBubbles])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
        if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
        return
      }
      if (e.key === 'Escape') {
        if (mode === 'drawing') { setMode('select'); setDrawingPts([]); setMousePos(null) }
        else setSelected(null)
      }
      if (e.key === 'g' || e.key === 'G') setMode('drawing')
      if (e.key === 'v' || e.key === 'V') { setMode('select'); setDrawingPts([]); setMousePos(null) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        commit(bubbles.filter(b => b.id !== selected)); setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, selected, bubbles, commit, undo, redo])

  // SVG click handler (drawing mode)
  const onSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'drawing') return
    e.stopPropagation()
    const pt = svgPt(e)
    if (drawingPts.length >= 3) {
      const first = drawingPts[0]
      const dx = (pt.x - first.x) * CW, dy = (pt.y - first.y) * CW
      if (Math.hypot(dx, dy) < 14) {
        // Close polygon
        const nb = makeBubble(drawingPts)
        commit([...bubbles, nb])
        setSelected(nb.id)
        setDrawingPts([])
        setMousePos(null)
        setMode('select')
        return
      }
    }
    setDrawingPts(prev => [...prev, pt])
  }, [mode, drawingPts, bubbles, commit, svgPt])

  // Drag starters
  const startDrag = useCallback((e: React.MouseEvent, kind: typeof dragRef.current extends null ? never : NonNullable<typeof dragRef.current>['kind'], b: Bubble, vIdx?: number) => {
    e.stopPropagation()
    e.preventDefault()
    setSelected(b.id)
    beginDrag()
    dragRef.current = {
      kind, id: b.id, vIdx,
      startMouse: svgPt(e),
      snapPts: b.points.map(p => ({ ...p })),
      snapTailTip: b.tail ? { ...b.tail.tip } : null,
      snapTB: { x: b.textBox.x, y: b.textBox.y, width: b.textBox.width, height: b.textBox.height },
    }
  }, [beginDrag, svgPt])

  const selectedBubble = bubbles.find(b => b.id === selected) ?? null

  const updateSelected = useCallback((patch: Partial<Bubble>) => {
    if (!selected) return
    commit(bubbles.map(b => b.id === selected ? { ...b, ...patch } : b))
  }, [selected, bubbles, commit])

  const updateTextBox = useCallback((patch: Partial<TextBox>) => {
    if (!selected) return
    commit(bubbles.map(b => b.id === selected ? { ...b, textBox: { ...b.textBox, ...patch } } : b))
  }, [selected, bubbles, commit])

  const deleteSelected = useCallback(() => {
    if (!selected) return
    commit(bubbles.filter(b => b.id !== selected))
    setSelected(null)
  }, [selected, bubbles, commit])

  const duplicateSelected = useCallback(() => {
    const b = selectedBubble
    if (!b) return
    const offset = 0.04
    const nb: Bubble = {
      ...b, id: genId(),
      points: b.points.map(p => ({ x: p.x + offset, y: p.y + offset })),
      tail: b.tail ? { ...b.tail, tip: { x: b.tail.tip.x + offset, y: b.tail.tip.y + offset } } : null,
      textBox: { ...b.textBox, x: b.textBox.x + offset, y: b.textBox.y + offset },
    }
    commit([...bubbles, nb])
    setSelected(nb.id)
  }, [selectedBubble, bubbles, commit])

  const save = useCallback(async () => {
    const payload = {
      episode: 'kp-ep-001',
      bubbles: bubbles.map(({ id, ...b }) => b),
    }
    try {
      const res = await fetch('/api/admin/save-bubbles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json()
      setSaveMsg(j.ok ? '✓ 저장됨' : '✗ 실패')
    } catch { setSaveMsg('✗ 오류') }
    setTimeout(() => setSaveMsg(''), 2000)
  }, [bubbles])

  // Drawing preview polyline points
  const previewPts = mousePos ? [...drawingPts, mousePos] : drawingPts
  const previewPolyline = previewPts.length >= 2
    ? previewPts.map(p => `${(p.x * CW).toFixed(1)},${(p.y * CW).toFixed(1)}`).join(' ')
    : ''

  const handleRadius = 5.5
  const tailRadius   = 7

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0b0b18', color: '#e0e0ff', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: '#0f0f1e', borderBottom: '1px solid #1e1e36', flexShrink: 0, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#a5b4fc', marginRight: 4 }}>K-PATTO 편집기 · EP 001</span>

          {/* Mode */}
          {(['select', 'drawing'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m === 'select') { setDrawingPts([]); setMousePos(null) } }}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                borderColor: mode === m ? '#6366f1' : '#2a2a44',
                background: mode === m ? '#6366f1' : '#13131f',
                color: mode === m ? '#fff' : '#888',
              }}>
              {m === 'select' ? 'V · 선택' : 'G · 그리기'}
            </button>
          ))}

          {mode === 'drawing' && drawingPts.length > 0 && (
            <span style={{ fontSize: 11, color: '#f59e0b' }}>
              점 {drawingPts.length}개 · {drawingPts.length >= 3 ? '첫 점 클릭으로 완성' : '계속 클릭'}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {/* Undo / Redo */}
          <button onClick={undo} disabled={!canUndo} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #2a2a44', background: '#13131f', color: canUndo ? '#a0a0c0' : '#333', cursor: canUndo ? 'pointer' : 'default', fontSize: 13 }}>↩</button>
          <button onClick={redo} disabled={!canRedo} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #2a2a44', background: '#13131f', color: canRedo ? '#a0a0c0' : '#333', cursor: canRedo ? 'pointer' : 'default', fontSize: 13 }}>↪</button>
          <button onClick={save} style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>저장</button>
          {saveMsg && <span style={{ fontSize: 12, color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{saveMsg}</span>}
        </div>

        {/* Scrollable canvas area */}
        <div style={{ flex: 1, overflow: 'auto', background: '#cecece', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px 0' }}>
          {/* Content box – fixed 430px */}
          <div style={{ position: 'relative', width: CW, flexShrink: 0, boxShadow: '0 4px 32px rgba(0,0,0,0.35)', borderRadius: 2 }}>

            {/* iframe */}
            <iframe
              ref={iframeRef}
              src="/kpatto/ep-001/episode.html"
              style={{ width: CW, height: iframeH, border: 'none', display: 'block' }}
              scrolling="no"
            />

            {/* SVG overlay – bubble paths + handles + drawing UI */}
            <svg
              ref={svgRef}
              width={CW} height={iframeH}
              style={{ position: 'absolute', top: 0, left: 0, cursor: mode === 'drawing' ? 'crosshair' : 'default', userSelect: 'none' }}
              onClick={onSvgClick}
              onMouseMove={mode === 'drawing' ? e => setMousePos(svgPt(e)) : undefined}
            >
              {/* ── Bubble paths ── */}
              {bubbles.map(b => {
                const isSel = selected === b.id
                const d = buildPath(b.points, b.tail, b.cornerRadius)
                return (
                  <g key={b.id}>
                    {/* Path fill + stroke */}
                    <path
                      d={d} fill={b.fill} stroke={isSel ? '#6366f1' : b.stroke}
                      strokeWidth={isSel ? Math.max(b.strokeWidth, 2) : b.strokeWidth}
                      style={{ cursor: mode === 'select' ? 'move' : 'default' }}
                      onMouseDown={e => { if (mode === 'select') startDrag(e, 'bubble', b) }}
                      onClick={e => { if (mode === 'select') { e.stopPropagation(); setSelected(b.id) } }}
                    />

                    {/* Vertex handles (only when selected) */}
                    {isSel && b.points.map((p, i) => (
                      <circle key={i}
                        cx={p.x * CW} cy={p.y * CW} r={handleRadius}
                        fill="#6366f1" stroke="#fff" strokeWidth={1.5}
                        style={{ cursor: 'grab' }}
                        onMouseDown={e => startDrag(e, 'vertex', b, i)}
                        onClick={e => e.stopPropagation()}
                      />
                    ))}

                    {/* Tail tip handle */}
                    {isSel && b.tail && (
                      <circle
                        cx={b.tail.tip.x * CW} cy={b.tail.tip.y * CW} r={tailRadius}
                        fill="#f59e0b" stroke="#fff" strokeWidth={2}
                        style={{ cursor: 'grab' }}
                        onMouseDown={e => startDrag(e, 'tail', b)}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </g>
                )
              })}

              {/* ── Drawing preview ── */}
              {mode === 'drawing' && previewPts.length > 0 && <>
                {previewPolyline && <polyline points={previewPolyline} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" />}
                {/* Close-polygon hint circle around first point */}
                {drawingPts.length >= 3 && (
                  <circle cx={drawingPts[0].x * CW} cy={drawingPts[0].y * CW} r={12}
                    fill="none" stroke="#6366f1" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                )}
                {/* Point dots */}
                {drawingPts.map((p, i) => (
                  <circle key={i} cx={p.x * CW} cy={p.y * CW} r={4}
                    fill={i === 0 ? '#6366f1' : '#a5b4fc'} stroke="#fff" strokeWidth={1.5} />
                ))}
                {/* Live mouse dot */}
                {mousePos && <circle cx={mousePos.x * CW} cy={mousePos.y * CW} r={3} fill="#6366f1" opacity={0.6} />}
              </>}
            </svg>

            {/* ── Text boxes (HTML, positioned over SVG) ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: CW, height: iframeH, pointerEvents: 'none' }}>
              {bubbles.map(b => {
                const isSel = selected === b.id
                const tb = b.textBox
                return (
                  <div key={b.id} style={{ position: 'absolute', left: tb.x * CW, top: tb.y * CW, width: tb.width * CW, height: tb.height * CW, pointerEvents: 'auto', boxSizing: 'border-box' }}>
                    {/* Text content */}
                    <div
                      style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent:
                          tb.textAlign === 'left' ? 'flex-start' : tb.textAlign === 'right' ? 'flex-end' : 'center',
                        padding: tb.padding, fontSize: tb.fontSize, lineHeight: tb.lineHeight,
                        fontWeight: tb.fontWeight, textAlign: tb.textAlign, color: '#111',
                        wordBreak: 'break-word', whiteSpace: 'pre-wrap', boxSizing: 'border-box',
                        cursor: 'move', border: isSel ? '1px dashed rgba(99,102,241,0.5)' : '1px dashed transparent',
                      }}
                      onMouseDown={e => { if (mode === 'select') startDrag(e as unknown as React.MouseEvent, 'textbox', b) }}
                      onClick={e => { if (mode === 'select') { e.stopPropagation(); setSelected(b.id) } }}
                    >
                      {tb.ko || (isSel ? <span style={{ color: 'rgba(0,0,0,0.25)', fontWeight: 400, fontSize: 12 }}>대사 입력</span> : null)}
                    </div>

                    {/* Resize handle (bottom-right) */}
                    {isSel && (
                      <div
                        style={{ position: 'absolute', right: -4, bottom: -4, width: 10, height: 10, background: '#6366f1', borderRadius: 2, cursor: 'se-resize' }}
                        onMouseDown={e => startDrag(e as unknown as React.MouseEvent, 'textresize', b)}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div style={{ width: 216, borderLeft: '1px solid #1e1e36', background: '#0d0d1c', overflowY: 'auto', padding: 14, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          {selectedBubble ? `선택됨` : '속성'}
        </div>
        <PropsPanel
          b={selectedBubble}
          onChange={updateSelected}
          onChangeTB={updateTextBox}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
        />

        {/* Bubble list */}
        {bubbles.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>목록 ({bubbles.length})</div>
            {bubbles.map((b, i) => (
              <div key={b.id} onClick={() => setSelected(b.id)} style={{
                padding: '5px 9px', borderRadius: 5, marginBottom: 3, cursor: 'pointer',
                background: selected === b.id ? '#1a1a36' : 'transparent',
                border: `1px solid ${selected === b.id ? '#6366f1' : '#1e1e36'}`,
                fontSize: 11, color: '#a0a0c0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: '#6366f1', marginRight: 6 }}>b{i + 1}</span>
                {b.textBox.ko || '대사 없음'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
