'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type TailDir     = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type BubbleShape = 'round' | 'square' | 'thought' | 'shout'

interface Bubble {
  id: string
  x: number      // % of iframe content width
  y: number      // % of iframe content height
  width: number  // % of iframe content width
  tailDir: TailDir
  shape: BubbleShape
  ko: string
  en: string
}

const TAIL_OPTS: { v: TailDir; l: string }[] = [
  { v: 'bottom-right', l: '↘ 아래오른쪽' },
  { v: 'bottom-left',  l: '↙ 아래왼쪽'  },
  { v: 'top-right',    l: '↗ 위오른쪽'   },
  { v: 'top-left',     l: '↖ 위왼쪽'    },
]

const SHAPE_OPTS: { v: BubbleShape; icon: string; label: string; desc: string }[] = [
  { v: 'round',   icon: '◯', label: '둥근',   desc: 'border-radius: 20px' },
  { v: 'square',  icon: '▢', label: '각진',   desc: 'border-radius: 4px'  },
  { v: 'thought', icon: '☁', label: '생각',   desc: '원형 + 작은 원 꼬리'  },
  { v: 'shout',   icon: '✦', label: '외침',   desc: '뾰족한 테두리'        },
]

function genId() { return Math.random().toString(36).slice(2, 8) }

// ── SVG star for shout bubble ──────────────────────────────────────────────
function starPoints(cx: number, cy: number, outerR: number, innerR: number, spikes: number): string {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
  }).join(' ')
}

// ── Thought-bubble dots ────────────────────────────────────────────────────
function ThoughtDots({ dir }: { dir: TailDir }) {
  const isBottom = dir.startsWith('bottom')
  const isRight  = dir.endsWith('right')
  const base: React.CSSProperties = {
    position: 'absolute', borderRadius: '50%',
    background: 'rgba(255,255,255,0.96)', border: '1.5px solid rgba(0,0,0,0.12)',
  }
  const side = isRight ? 'right' : 'left'
  const dots: React.CSSProperties[] = isBottom
    ? [
        { ...base, [side]: '28%', bottom: -9,  width: 7,   height: 7   },
        { ...base, [side]: '20%', bottom: -16, width: 5,   height: 5   },
        { ...base, [side]: '14%', bottom: -22, width: 3.5, height: 3.5 },
      ]
    : [
        { ...base, [side]: '28%', top: -9,  width: 7,   height: 7   },
        { ...base, [side]: '20%', top: -16, width: 5,   height: 5   },
        { ...base, [side]: '14%', top: -22, width: 3.5, height: 3.5 },
      ]
  return <>{dots.map((s, i) => <div key={i} style={s} />)}</>
}

// ── Shout bubble (SVG star) ───────────────────────────────────────────────
function ShoutBox({ children, isSelected }: { children: React.ReactNode; isSelected: boolean }) {
  const pts = starPoints(50, 50, 50, 37, 12)
  return (
    <div style={{ position: 'relative', minHeight: 30 }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100" preserveAspectRatio="none"
      >
        <polygon
          points={pts}
          fill="rgba(255,222,30,0.97)"
          stroke={isSelected ? '#6366f1' : 'rgba(180,140,0,0.45)'}
          strokeWidth={isSelected ? '3' : '1.5'}
        />
      </svg>
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '8px 14px', fontSize: 12, fontWeight: 700,
        textAlign: 'center', color: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 30,
      }}>
        {children}
      </div>
    </div>
  )
}

// ── CSS tail triangle ─────────────────────────────────────────────────────
function Tail({ dir }: { dir: TailDir }) {
  const isBottom = dir.startsWith('bottom')
  const isRight  = dir.endsWith('right')
  const base: React.CSSProperties = {
    position: 'absolute', width: 0, height: 0,
    border: '7px solid transparent',
  }
  if (isBottom) {
    return <div style={{
      ...base,
      borderTopColor: 'rgba(255,255,255,0.97)',
      bottom: -13,
      [isRight ? 'right' : 'left']: '22%',
    }} />
  }
  return <div style={{
    ...base,
    borderBottomColor: 'rgba(255,255,255,0.97)',
    top: -13,
    [isRight ? 'right' : 'left']: '22%',
  }} />
}

// ── Single bubble element on overlay ─────────────────────────────────────
function BubbleEl({
  b, isSelected, containerW, containerH,
  onSelect, onDragStart,
}: {
  b: Bubble
  isSelected: boolean
  containerW: number
  containerH: number
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
}) {
  const px = (b.x / 100) * containerW
  const py = (b.y / 100) * containerH
  const pw = (b.width / 100) * containerW

  const boxStyle: React.CSSProperties = {
    position: 'absolute',
    left: px, top: py, width: pw,
    cursor: 'grab',
    userSelect: 'none',
    outline: isSelected ? '2px solid #6366f1' : 'none',
    outlineOffset: 2,
    borderRadius: b.shape === 'thought' ? '50%'
                : b.shape === 'round'   ? '16px 18px 14px 16px'
                : 4,
    background: b.shape === 'shout' ? 'transparent'
              : 'rgba(255,255,255,0.97)',
    border: b.shape === 'shout' ? 'none'
          : isSelected ? '1.5px solid #6366f1'
          : '1.5px solid rgba(0,0,0,0.12)',
    padding: b.shape === 'shout' ? 0 : '6px 10px',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#111',
    minHeight: 28,
    boxSizing: 'border-box' as const,
    zIndex: isSelected ? 20 : 10,
    overflow: 'visible',
  }

  const text = b.ko || b.en || '대사 입력'

  return (
    <div
      style={boxStyle}
      onMouseDown={e => { onSelect(); onDragStart(e) }}
    >
      {b.shape === 'shout' ? (
        <ShoutBox isSelected={isSelected}>{text}</ShoutBox>
      ) : (
        <>
          {text}
          {b.shape !== 'thought' && <Tail dir={b.tailDir} />}
          {b.shape === 'thought' && <ThoughtDots dir={b.tailDir} />}
        </>
      )}
      {/* resize handle */}
      <div
        style={{
          position: 'absolute', right: -5, bottom: -5,
          width: 12, height: 12,
          background: isSelected ? '#6366f1' : '#aaa',
          borderRadius: 3, cursor: 'se-resize', zIndex: 30,
        }}
        onMouseDown={e => {
          e.stopPropagation()
          onSelect()
          // resize handled in parent via data attr
          const el = e.currentTarget.closest('[data-bubble-id]') as HTMLElement | null
          if (el) el.dataset.resizing = '1'
        }}
      />
    </div>
  )
}

// ── Right-side props panel ────────────────────────────────────────────────
function PropsPanel({
  bubble, onChange, onDelete,
}: {
  bubble: Bubble | null
  onChange: (id: string, patch: Partial<Bubble>) => void
  onDelete: (id: string) => void
}) {
  if (!bubble) return (
    <div style={{ color: '#666', fontSize: 13, padding: '20px 0' }}>
      말풍선을 클릭하면 속성이 표시됩니다.
    </div>
  )

  const field = (label: string, node: React.ReactNode) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</div>
      {node}
    </div>
  )
  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1a1a2e', border: '1px solid #333',
    borderRadius: 6, color: '#e0e0ff', padding: '6px 8px', fontSize: 13,
    boxSizing: 'border-box',
  }
  const numStyle: React.CSSProperties = { ...inputStyle, width: '100%' }

  return (
    <div>
      {field('모양',
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {SHAPE_OPTS.map(opt => (
            <button key={opt.v}
              onClick={() => onChange(bubble.id, { shape: opt.v })}
              style={{
                background: bubble.shape === opt.v ? '#6366f1' : '#1a1a2e',
                border: `1px solid ${bubble.shape === opt.v ? '#6366f1' : '#333'}`,
                borderRadius: 8, color: '#e0e0ff', cursor: 'pointer',
                padding: '8px 6px', fontSize: 11, textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 18 }}>{opt.icon}</div>
              <div style={{ fontWeight: 600 }}>{opt.label}</div>
              <div style={{ color: '#888', fontSize: 10, marginTop: 2 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      )}

      {field('KO',
        <textarea
          value={bubble.ko} rows={2}
          onChange={e => onChange(bubble.id, { ko: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="한국어 대사"
        />
      )}

      {field('EN',
        <textarea
          value={bubble.en} rows={2}
          onChange={e => onChange(bubble.id, { en: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="English translation"
        />
      )}

      {bubble.shape !== 'shout' && field('꼬리 방향',
        <select
          value={bubble.tailDir}
          onChange={e => onChange(bubble.id, { tailDir: e.target.value as TailDir })}
          style={inputStyle}
        >
          {TAIL_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      )}

      {field('위치 / 크기',
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {(['x','y','width'] as const).map(k => (
            <div key={k}>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>{k.toUpperCase()}%</div>
              <input
                type="number" value={Math.round(bubble[k])}
                onChange={e => onChange(bubble.id, { [k]: Number(e.target.value) })}
                style={numStyle}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onDelete(bubble.id)}
        style={{
          width: '100%', marginTop: 8, padding: '8px 0',
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 13,
        }}
      >
        삭 제
      </button>
    </div>
  )
}

// ── Main editor ───────────────────────────────────────────────────────────
export default function KPattoEditorPage() {
  const [bubbles, setBubbles]     = useState<Bubble[]>([])
  const [selected, setSelected]   = useState<string | null>(null)
  const [iframeH, setIframeH]     = useState(600)
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 })
  const [saveMsg, setSaveMsg]     = useState('')

  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const dragRef    = useRef<{
    id: string; startX: number; startY: number
    origX: number; origY: number; resizing?: boolean; origW?: number
  } | null>(null)

  // Fit iframe height to content
  const fitIframe = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const h = iframe.contentDocument.documentElement.scrollHeight
    if (h > 100) setIframeH(h)
    const overlay = overlayRef.current
    if (overlay) {
      setOverlaySize({ w: overlay.offsetWidth, h: overlay.offsetHeight })
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const onLoad = () => { setTimeout(fitIframe, 100) }
    if (iframe.contentDocument?.readyState === 'complete') onLoad()
    iframe.addEventListener('load', onLoad)
    return () => iframe.removeEventListener('load', onLoad)
  }, [fitIframe])

  // Track overlay size on resize
  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const overlay = overlayRef.current
      if (overlay) setOverlaySize({ w: overlay.offsetWidth, h: overlay.offsetHeight })
    })
    if (overlayRef.current) obs.observe(overlayRef.current)
    return () => obs.disconnect()
  }, [])

  const addBubble = useCallback(() => {
    const nb: Bubble = {
      id: genId(), x: 10, y: 5, width: 35,
      tailDir: 'bottom-right', shape: 'round', ko: '', en: '',
    }
    setBubbles(prev => [...prev, nb])
    setSelected(nb.id)
  }, [])

  const updateBubble = useCallback((id: string, patch: Partial<Bubble>) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }, [])

  const deleteBubble = useCallback((id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id))
    setSelected(null)
  }, [])

  // Drag / resize
  const onDragStart = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const b = bubbles.find(x => x.id === id)
    if (!b) return
    dragRef.current = {
      id, startX: e.clientX, startY: e.clientY,
      origX: b.x, origY: b.y, origW: b.width,
    }
  }, [bubbles])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag || overlaySize.w === 0) return
      const dx = ((e.clientX - drag.startX) / overlaySize.w) * 100
      const dy = ((e.clientY - drag.startY) / overlaySize.h) * 100

      // Check if resize handle triggered (we use a simpler check via ref)
      const overlay = overlayRef.current
      const handle = overlay?.querySelector(`[data-bubble-id="${drag.id}"] [data-resizing]`)
      if (handle || (dragRef.current as any).resizing) {
        (dragRef.current as any).resizing = true
        updateBubble(drag.id, { width: Math.max(10, drag.origW! + dx) })
      } else {
        updateBubble(drag.id, {
          x: Math.max(0, Math.min(90, drag.origX + dx)),
          y: Math.max(0, drag.origY + dy),
        })
      }
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [overlaySize, updateBubble])

  const save = useCallback(async () => {
    const payload = {
      episode: 'kp-ep-001',
      bubbles: bubbles.map(({ id, ...rest }) => rest),
    }
    try {
      const res = await fetch('/api/admin/save-bubbles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setSaveMsg(json.ok ? '✓ 저장됨' : '✗ 실패')
    } catch {
      setSaveMsg('✗ 오류')
    }
    setTimeout(() => setSaveMsg(''), 2000)
  }, [bubbles])

  const selectedBubble = bubbles.find(b => b.id === selected) ?? null

  // ── Layout ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', height: '100vh', background: '#0d0d1a', color: '#e0e0ff',
      fontFamily: 'system-ui, sans-serif', overflow: 'hidden',
    }}>

      {/* ── Left: iframe + overlay ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#0d0d1a', borderBottom: '1px solid #1e1e3a',
          padding: '10px 16px',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#a5b4fc' }}>K-PATTO · 말풍선 에디터 · EP 001</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={addBubble}
            style={{
              background: '#6366f1', border: 'none', borderRadius: 8,
              color: '#fff', padding: '7px 16px', fontSize: 13, cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + 말풍선 추가
          </button>
          <button
            onClick={save}
            style={{
              background: '#22c55e', border: 'none', borderRadius: 8,
              color: '#fff', padding: '7px 16px', fontSize: 13, cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            저장
          </button>
          {saveMsg && <span style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{saveMsg}</span>}
        </div>

        {/* iframe + overlay wrapper */}
        <div style={{ position: 'relative', width: '100%' }}>
          <iframe
            ref={iframeRef}
            src="/kpatto/ep-001/episode.html"
            style={{
              width: '100%', height: iframeH,
              border: 'none', display: 'block',
            }}
            scrolling="no"
          />
          {/* Transparent overlay */}
          <div
            ref={overlayRef}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: iframeH,
              pointerEvents: 'none',   // default passthrough
            }}
            onClick={e => {
              if (e.target === overlayRef.current) setSelected(null)
            }}
          >
            {bubbles.map(b => (
              <div
                key={b.id}
                data-bubble-id={b.id}
                style={{ pointerEvents: 'auto' }}
              >
                <BubbleEl
                  b={b}
                  isSelected={selected === b.id}
                  containerW={overlaySize.w}
                  containerH={overlaySize.h || iframeH}
                  onSelect={() => setSelected(b.id)}
                  onDragStart={e => onDragStart(e, b.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: props panel ─────────────────────────────────────────── */}
      <div style={{
        width: 220, borderLeft: '1px solid #1e1e3a',
        overflowY: 'auto', padding: 16, flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          {selectedBubble ? `선택됨` : '속성'}
        </div>
        <PropsPanel
          bubble={selectedBubble}
          onChange={updateBubble}
          onDelete={deleteBubble}
        />

        {/* Bubble list */}
        {bubbles.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              목록 ({bubbles.length})
            </div>
            {bubbles.map((b, i) => (
              <div
                key={b.id}
                onClick={() => setSelected(b.id)}
                style={{
                  padding: '6px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  background: selected === b.id ? '#1e1e4a' : 'transparent',
                  border: `1px solid ${selected === b.id ? '#6366f1' : '#1e1e3a'}`,
                  fontSize: 12, color: '#c0c0e0',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                <span style={{ color: '#6366f1', marginRight: 6 }}>b{i + 1}</span>
                {b.ko || b.en || '대사 입력'}
              </div>
            ))}
          </div>
        )}

        {/* JSON preview */}
        {bubbles.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>JSON</div>
            <pre style={{
              fontSize: 9, color: '#6a6a9a', background: '#0a0a18',
              borderRadius: 6, padding: 8, overflow: 'auto', maxHeight: 200,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {JSON.stringify({ episode: 'kp-ep-001', bubbles: bubbles.map(({ id, ...r }) => r) }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
