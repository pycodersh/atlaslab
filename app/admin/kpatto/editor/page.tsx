'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type TailDir     = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type BubbleShape = 'round' | 'square' | 'thought' | 'shout'

interface Bubble {
  id: string
  scene: number
  x: number
  y: number
  width: number
  tailDir: TailDir
  shape: BubbleShape
  ko: string
  en: string
}

interface PanelRect { top: number; left: number; width: number; height: number }

const TAIL_OPTS: { v: TailDir; l: string }[] = [
  { v: 'bottom-right', l: '↘ 아래오른쪽' },
  { v: 'bottom-left',  l: '↙ 아래왼쪽'  },
  { v: 'top-right',    l: '↗ 위오른쪽'   },
  { v: 'top-left',     l: '↖ 위왼쪽'    },
]

const SHAPE_OPTS: { v: BubbleShape; icon: string; label: string; desc: string }[] = [
  { v: 'round',   icon: '◯', label: '둥근',   desc: 'border-radius: 20px' },
  { v: 'square',  icon: '▢', label: '각진',   desc: 'border-radius: 4px' },
  { v: 'thought', icon: '☁', label: '생각',   desc: '원형 + 작은 원 꼬리' },
  { v: 'shout',   icon: '✦', label: '외침',   desc: '뾰족한 테두리' },
]

let _nextId = 0
function newId() { return `b${++_nextId}` }
function r1(n: number) { return Math.round(n * 10) / 10 }

// ── Star polygon points for shout bubble ─────────────────────────────────────
function starPoints(cx: number, cy: number, outerR: number, innerR: number, spikes: number): string {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const r     = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
  }).join(' ')
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function KPattoEditorPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const rafRef    = useRef<number | undefined>(undefined)

  const [panelRects, setPanelRects] = useState<PanelRect[]>([])
  const [bubbles,    setBubbles]    = useState<Bubble[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [status,     setStatus]     = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const dragRef = useRef<{
    id: string; startMX: number; startMY: number
    startBX: number; startBY: number; pw: number; ph: number
  } | null>(null)

  const resizeRef = useRef<{
    id: string; startMX: number; startBW: number; pw: number
  } | null>(null)

  const selected = bubbles.find(b => b.id === selectedId) ?? null

  // ── Panel rect tracking ────────────────────────────────────────────────────

  const updatePanelRects = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const iframe = iframeRef.current
      if (!iframe?.contentDocument) return
      const els   = iframe.contentDocument.querySelectorAll<HTMLElement>('[data-panel-idx]')
      const rects = Array.from(els).map(el => {
        const r = el.getBoundingClientRect()
        return { top: r.top, left: r.left, width: r.width, height: r.height }
      })
      if (rects.length > 0) setPanelRects(rects)
    })
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const el = iframe
    function handleLoad() {
      updatePanelRects()
      try { el.contentWindow?.addEventListener('scroll', updatePanelRects, { passive: true }) } catch { /* noop */ }
    }
    if (el.contentDocument?.readyState === 'complete') handleLoad()
    el.addEventListener('load', handleLoad)
    return () => el.removeEventListener('load', handleLoad)
  }, [updatePanelRects])

  // ── Bubble CRUD ────────────────────────────────────────────────────────────

  function addBubble(scene: number) {
    const b: Bubble = { id: newId(), scene, x: 8, y: 8, width: 38, tailDir: 'bottom-right', shape: 'round', ko: '대사 입력', en: '' }
    setBubbles(prev => [...prev, b])
    setSelectedId(b.id)
    setEditingId(null)
  }

  function updateBubble(id: string, patch: Partial<Bubble>) {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  function deleteBubble(id: string) {
    setBubbles(prev => prev.filter(b => b.id !== id))
    if (selectedId === id) { setSelectedId(null); setEditingId(null) }
  }

  // ── Drag / resize ──────────────────────────────────────────────────────────

  function startDrag(e: React.MouseEvent, bubble: Bubble) {
    e.preventDefault(); e.stopPropagation()
    const rect = panelRects[bubble.scene - 1]
    if (!rect) return
    setSelectedId(bubble.id); setEditingId(null)
    dragRef.current = { id: bubble.id, startMX: e.clientX, startMY: e.clientY, startBX: bubble.x, startBY: bubble.y, pw: rect.width, ph: rect.height }
  }

  function startResize(e: React.MouseEvent, bubble: Bubble) {
    e.preventDefault(); e.stopPropagation()
    const rect = panelRects[bubble.scene - 1]
    if (!rect) return
    resizeRef.current = { id: bubble.id, startMX: e.clientX, startBW: bubble.width, pw: rect.width }
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (dragRef.current) {
        const d  = dragRef.current
        const dx = (e.clientX - d.startMX) / d.pw * 100
        const dy = (e.clientY - d.startMY) / d.ph * 100
        setBubbles(prev => prev.map(b => b.id !== d.id ? b : {
          ...b, x: Math.max(0, Math.min(100 - b.width, d.startBX + dx)), y: Math.max(0, Math.min(80, d.startBY + dy)),
        }))
      }
      if (resizeRef.current) {
        const r  = resizeRef.current
        const dw = (e.clientX - r.startMX) / r.pw * 100
        setBubbles(prev => prev.map(b => b.id !== r.id ? b : { ...b, width: Math.max(10, Math.min(90, r.startBW + dw)) }))
      }
    }
    function onUp() { dragRef.current = null; resizeRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/save-bubbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode: 'kp-ep-001',
          bubbles: bubbles.map(b => ({
            scene: b.scene, x: r1(b.x), y: r1(b.y), width: r1(b.width),
            tailDir: b.tailDir, shape: b.shape, ko: b.ko, en: b.en,
          })),
        }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch { setStatus('error') }
    setTimeout(() => setStatus('idle'), 2500)
  }

  // ── Bubble screen position ─────────────────────────────────────────────────

  function screenPos(b: Bubble) {
    const rect = panelRects[b.scene - 1]
    if (!rect) return null
    return { left: rect.left + (b.x / 100) * rect.width, top: rect.top + (b.y / 100) * rect.height, width: (b.width / 100) * rect.width }
  }

  // ── JSON preview string ───────────────────────────────────────────────────

  const jsonStr = JSON.stringify({
    episode: 'kp-ep-001',
    bubbles: bubbles.map(b => ({ scene: b.scene, x: r1(b.x), y: r1(b.y), width: r1(b.width), tailDir: b.tailDir, shape: b.shape, ko: b.ko, en: b.en })),
  }, null, 2)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d1117', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 13 }}>

      {/* ── Left: iframe + overlay ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #21262d' }}>

        {/* Toolbar */}
        <div style={{ height: 46, flexShrink: 0, background: '#161b22', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
          <span style={{ color: '#e94560', fontWeight: 800, fontSize: 13, marginRight: 4 }}>K-PATTO</span>
          <span style={{ color: '#484f58', fontSize: 12 }}>말풍선 에디터 · EP 001</span>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
            <span style={{ color: '#484f58', fontSize: 11 }}>+ 추가:</span>
            {[1, 2, 3, 4, 5].map(s => {
              const ok = !!panelRects[s - 1]
              return (
                <button key={s} onClick={() => addBubble(s)} disabled={!ok}
                  title={`CUT ${s}에 말풍선 추가`}
                  style={{ padding: '4px 9px', borderRadius: 5, border: '1px solid #30363d', background: ok ? '#21262d' : '#161b22', color: ok ? '#c9d1d9' : '#484f58', fontSize: 11, fontWeight: 700, cursor: ok ? 'pointer' : 'default' }}>
                  C{s}
                </button>
              )
            })}
            <button onClick={save}
              style={{ marginLeft: 8, padding: '5px 14px', borderRadius: 6, border: 'none', background: status === 'saved' ? '#238636' : status === 'error' ? '#da3633' : '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', minWidth: 60 }}>
              {status === 'saving' ? '…' : status === 'saved' ? '✓ 저장' : status === 'error' ? '오류' : '저장'}
            </button>
            <a href="/kpatto/story/kp-ep-001" target="_blank" rel="noopener"
              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#8b949e', fontSize: 11, textDecoration: 'none' }}>
              미리보기 ↗
            </a>
          </div>
        </div>

        {/* iframe + overlay */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <iframe ref={iframeRef} src="/kpatto/story/kp-ep-001"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            onClick={() => { setSelectedId(null); setEditingId(null) }}>
            {bubbles.map(b => {
              const pos = screenPos(b)
              if (!pos) return null
              return (
                <BubbleEl key={b.id} bubble={b} pos={pos}
                  isSelected={selectedId === b.id} isEditing={editingId === b.id}
                  onMouseDown={e => startDrag(e, b)}
                  onResizeMouseDown={e => startResize(e, b)}
                  onClick={() => { setSelectedId(b.id); setEditingId(null) }}
                  onDoubleClick={() => { setSelectedId(b.id); setEditingId(b.id) }}
                  onTextSave={ko => { updateBubble(b.id, { ko }); setEditingId(null) }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Right: sidebar ── */}
      <div style={{ width: 260, background: '#161b22', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {selected ? (
          <PropsPanel key={selected.id} bubble={selected}
            onChange={p => updateBubble(selected.id, p)}
            onDelete={() => deleteBubble(selected.id)} />
        ) : (
          <div style={{ padding: 16, color: '#484f58', fontSize: 11, lineHeight: 1.8 }}>
            C1~C5 버튼으로 말풍선을 추가하세요.<br />
            • 드래그 → 이동<br />
            • 우하단 핸들 → 너비 조절<br />
            • 더블클릭 → 텍스트 편집
          </div>
        )}

        {/* Bubble list */}
        <div style={{ flex: 1, overflow: 'auto', borderTop: '1px solid #21262d' }}>
          <div style={{ padding: '8px 12px 4px', color: '#6e7681', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
            목록 ({bubbles.length})
          </div>
          {bubbles.map(b => {
            const shapeIcon = SHAPE_OPTS.find(s => s.v === b.shape)?.icon ?? '◯'
            return (
              <div key={b.id} onClick={() => { setSelectedId(b.id); setEditingId(null) }}
                style={{ padding: '5px 12px', cursor: 'pointer', background: selectedId === b.id ? '#1c2128' : 'transparent', borderLeft: selectedId === b.id ? '2px solid #6366f1' : '2px solid transparent', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: '#e94560', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>C{b.scene}</span>
                <span style={{ color: '#484f58', fontSize: 10 }}>{shapeIcon}</span>
                <span style={{ color: '#c9d1d9', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {b.ko || <em style={{ color: '#484f58' }}>(빈)</em>}
                </span>
              </div>
            )
          })}
        </div>

        {/* JSON */}
        <div style={{ borderTop: '1px solid #21262d', background: '#0d1117', padding: 10 }}>
          <div style={{ color: '#6e7681', fontSize: 10, fontWeight: 700, marginBottom: 5, letterSpacing: '0.06em' }}>JSON</div>
          <pre style={{ margin: 0, color: '#7dd3fc', fontSize: 9, lineHeight: 1.45, overflow: 'auto', maxHeight: 130, fontFamily: 'monospace' }}>
            {jsonStr}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ── BubbleEl ──────────────────────────────────────────────────────────────────

interface BubbleElProps {
  bubble: Bubble
  pos: { left: number; top: number; width: number }
  isSelected: boolean
  isEditing: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onResizeMouseDown: (e: React.MouseEvent) => void
  onClick: () => void
  onDoubleClick: () => void
  onTextSave: (ko: string) => void
}

function BubbleEl({ bubble, pos, isSelected, isEditing, onMouseDown, onResizeMouseDown, onClick, onDoubleClick, onTextSave }: BubbleElProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])

  const shape    = bubble.shape ?? 'round'
  const isThought = shape === 'thought'
  const isShout   = shape === 'shout'

  const textNode = isEditing ? (
    <input ref={inputRef} defaultValue={bubble.ko}
      onMouseDown={e => e.stopPropagation()}
      onBlur={e => onTextSave(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: 12, background: 'transparent', fontFamily: '"Noto Sans KR","Malgun Gothic",sans-serif' }}
    />
  ) : (
    <span style={{ fontSize: bubble.ko ? 12 : 10, color: bubble.ko ? '#111' : '#aaa', fontStyle: bubble.ko ? 'normal' : 'italic' }}>
      {bubble.ko || '더블클릭 편집'}
    </span>
  )

  const selBorder = isSelected ? '2px solid #6366f1' : undefined

  return (
    <div
      style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, pointerEvents: 'all', cursor: 'move', userSelect: 'none', zIndex: isSelected ? 20 : 10 }}
      onMouseDown={onMouseDown}
      onClick={e => { e.stopPropagation(); onClick() }}
      onDoubleClick={e => { e.stopPropagation(); onDoubleClick() }}
    >
      {/* Tail or thought-dots */}
      {!isThought && !isShout && <Tail dir={bubble.tailDir} />}
      {isThought && <ThoughtDots dir={bubble.tailDir} />}

      {/* Bubble body */}
      {isShout ? (
        <ShoutBox isSelected={isSelected}>{textNode}</ShoutBox>
      ) : (
        <div style={{
          background: isThought ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.96)',
          borderRadius: shape === 'square' ? 4 : shape === 'thought' ? '50%' : '16px 18px 14px 16px',
          padding: isThought ? '8px 14px' : '5px 10px',
          border: selBorder ?? '1.5px solid rgba(0,0,0,0.12)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          fontSize: 12,
          fontFamily: '"Noto Sans KR","Malgun Gothic",sans-serif',
          textAlign: 'center',
          wordBreak: 'keep-all',
          lineHeight: 1.4,
          color: '#111',
          minHeight: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {textNode}
        </div>
      )}

      {/* Resize handle */}
      {isSelected && (
        <div
          style={{ position: 'absolute', bottom: -5, right: -5, width: 11, height: 11, background: '#6366f1', border: '2px solid #fff', borderRadius: 3, cursor: 'se-resize', zIndex: 30 }}
          onMouseDown={e => { e.stopPropagation(); onResizeMouseDown(e) }}
        />
      )}
    </div>
  )
}

// ── Tail triangle (round / square) ────────────────────────────────────────────

function Tail({ dir }: { dir: TailDir }) {
  const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0 }
  const s: React.CSSProperties = (() => {
    switch (dir) {
      case 'bottom-right': return { ...base, bottom: -8, right: 12, borderLeft: '7px solid transparent', borderTop: '9px solid rgba(255,255,255,0.96)' }
      case 'bottom-left':  return { ...base, bottom: -8, left: 12,  borderRight: '7px solid transparent', borderTop: '9px solid rgba(255,255,255,0.96)' }
      case 'top-right':    return { ...base, top: -8,    right: 12, borderLeft: '7px solid transparent', borderBottom: '9px solid rgba(255,255,255,0.96)' }
      case 'top-left':     return { ...base, top: -8,    left: 12,  borderRight: '7px solid transparent', borderBottom: '9px solid rgba(255,255,255,0.96)' }
    }
  })()
  return <div style={s} />
}

// ── Thought-bubble dot chain ───────────────────────────────────────────────────

function ThoughtDots({ dir }: { dir: TailDir }) {
  const isBottom = dir.startsWith('bottom')
  const isRight  = dir.endsWith('right')
  const dotBase: React.CSSProperties = { position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.96)', border: '1.5px solid rgba(0,0,0,0.12)' }

  // Three shrinking circles stepping away from the bubble corner
  const dots: React.CSSProperties[] = isBottom
    ? [
        { ...dotBase, [isRight ? 'right' : 'left']: '28%', bottom: -9,  width: 7, height: 7 },
        { ...dotBase, [isRight ? 'right' : 'left']: '20%', bottom: -16, width: 5, height: 5 },
        { ...dotBase, [isRight ? 'right' : 'left']: '14%', bottom: -22, width: 3.5, height: 3.5 },
      ]
    : [
        { ...dotBase, [isRight ? 'right' : 'left']: '28%', top: -9,  width: 7, height: 7 },
        { ...dotBase, [isRight ? 'right' : 'left']: '20%', top: -16, width: 5, height: 5 },
        { ...dotBase, [isRight ? 'right' : 'left']: '14%', top: -22, width: 3.5, height: 3.5 },
      ]

  return <>{dots.map((s, i) => <div key={i} style={s} />)}</>
}

// ── Shout bubble (SVG star background) ────────────────────────────────────────

function ShoutBox({ children, isSelected }: { children: React.ReactNode; isSelected: boolean }) {
  const pts = starPoints(50, 50, 50, 37, 12)
  return (
    <div style={{ position: 'relative', minHeight: 30 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points={pts}
          fill="rgba(255,222,30,0.97)"
          stroke={isSelected ? '#6366f1' : 'rgba(180,140,0,0.45)'}
          strokeWidth={isSelected ? '3' : '1.5'}
        />
      </svg>
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '8px 14px',
        fontSize: 12, fontWeight: 700,
        fontFamily: '"Noto Sans KR","Malgun Gothic",sans-serif',
        textAlign: 'center', wordBreak: 'keep-all', lineHeight: 1.4, color: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 30,
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Properties panel ──────────────────────────────────────────────────────────

function PropsPanel({ bubble, onChange, onDelete }: { bubble: Bubble; onChange: (p: Partial<Bubble>) => void; onDelete: () => void }) {
  return (
    <div style={{ padding: 14, borderBottom: '1px solid #21262d', overflow: 'auto', maxHeight: '70vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#8b949e', fontSize: 11, fontWeight: 700 }}>CUT {bubble.scene} · {bubble.id}</span>
        <button onClick={onDelete}
          style={{ background: 'transparent', border: '1px solid #da3633', color: '#f85149', borderRadius: 5, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>
          삭제
        </button>
      </div>

      {/* Shape picker */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#6e7681', fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: '0.06em' }}>모양</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {SHAPE_OPTS.map(o => {
            const active = bubble.shape === o.v
            return (
              <div key={o.v} onClick={() => onChange({ shape: o.v })} title={o.desc}
                style={{
                  padding: '7px 6px',
                  borderRadius: 7,
                  border: active ? '1.5px solid #6366f1' : '1px solid #30363d',
                  background: active ? '#1a1d3b' : '#0d1117',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{o.icon}</span>
                <div>
                  <div style={{ color: active ? '#818cf8' : '#8b949e', fontSize: 11, fontWeight: 600 }}>{o.label}</div>
                  <div style={{ color: '#484f58', fontSize: 9, marginTop: 1 }}>{o.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* KO */}
      <label style={{ display: 'block', marginBottom: 8 }}>
        <span style={{ color: '#6e7681', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 3 }}>KO</span>
        <input value={bubble.ko} onChange={e => onChange({ ko: e.target.value })} placeholder="한국어 대사" style={inputStyle} />
      </label>

      {/* EN */}
      <label style={{ display: 'block', marginBottom: 8 }}>
        <span style={{ color: '#6e7681', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 3 }}>EN</span>
        <input value={bubble.en} onChange={e => onChange({ en: e.target.value })} placeholder="English translation" style={inputStyle} />
      </label>

      {/* Tail — hidden for shout (no tail needed) */}
      {bubble.shape !== 'shout' && (
        <label style={{ display: 'block', marginBottom: 10 }}>
          <span style={{ color: '#6e7681', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 3 }}>꼬리 방향</span>
          <select value={bubble.tailDir} onChange={e => onChange({ tailDir: e.target.value as TailDir })}
            style={{ ...inputStyle, padding: '5px 8px' }}>
            {TAIL_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </label>
      )}

      {/* X / Y / W */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {([{ k: 'x', label: 'X%' }, { k: 'y', label: 'Y%' }, { k: 'width', label: 'W%' }] as { k: 'x' | 'y' | 'width'; label: string }[]).map(({ k, label }) => (
          <label key={k}>
            <span style={{ color: '#6e7681', fontSize: 10, display: 'block', marginBottom: 3 }}>{label}</span>
            <input type="number" value={r1(bubble[k])}
              onChange={e => {
                const v = parseFloat(e.target.value) || 0
                onChange(k === 'x' ? { x: v } : k === 'y' ? { y: v } : { width: v })
              }}
              style={{ ...inputStyle, textAlign: 'center', padding: '4px 4px' }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 5,
  color: '#c9d1d9', padding: '5px 8px', fontSize: 12, boxSizing: 'border-box',
  fontFamily: '"Noto Sans KR",system-ui,sans-serif', outline: 'none',
}
