'use client'

import { useReducer, useRef, useMemo, useEffect, useState, useCallback } from 'react'
import type {
  WebtoonEpisodeData,
  WebtoonBubble,
  WebtoonGapSection,
  WebtoonPanelSection,
  BubbleTailData,
} from '@/data/kpatto/webtoon-types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleSvg } from './BubbleSvg'

// ── Bubble metadata ──────────────────────────────────────────────────────────
type BubbleMetaKey = keyof typeof bubblesData
function bmeta(key: string) {
  return bubblesData[key as BubbleMetaKey] as {
    src: string; viewBox: string; flipY?: boolean; bodyOnly?: boolean
    ovalParams?: { cx: number; cy: number; rx: number; ry: number }
    safeArea: { left: number; top: number; right: number; bottom: number }
  }
}
function bubbleHeightPct(widthPct: number, key: string, heightRatio: number): number {
  const vb = bmeta(key).viewBox.split(' ').map(Number)
  return (widthPct / (vb[2] / vb[3])) / heightRatio
}

// ── State ────────────────────────────────────────────────────────────────────
type Override = { bubbleKey?: string; xPct?: number; yPct?: number; widthPct?: number; tail?: BubbleTailData }
type Overrides = Record<string, Override>
type S = { overrides: Overrides; history: Overrides[]; idx: number; selected: string | null }
type A =
  | { type: 'SELECT'; id: string | null }
  | { type: 'MOVE'; id: string; xPct: number; yPct: number }
  | { type: 'RESIZE'; id: string; widthPct: number }
  | { type: 'SET_KEY'; id: string; key: string }
  | { type: 'SET_TAIL'; id: string; tail: BubbleTailData }
  | { type: 'COMMIT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET_ONE'; id: string }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD'; overrides: Overrides }

function reducer(s: S, a: A): S {
  switch (a.type) {
    case 'SELECT': return { ...s, selected: a.id }
    case 'MOVE': {
      const o = { ...(s.overrides[a.id] ?? {}), xPct: a.xPct, yPct: a.yPct }
      return { ...s, overrides: { ...s.overrides, [a.id]: o } }
    }
    case 'RESIZE': {
      const o = { ...(s.overrides[a.id] ?? {}), widthPct: a.widthPct }
      return { ...s, overrides: { ...s.overrides, [a.id]: o } }
    }
    case 'SET_KEY': {
      const o = { ...(s.overrides[a.id] ?? {}), bubbleKey: a.key }
      const ov = { ...s.overrides, [a.id]: o }
      return { ...s, overrides: ov, history: [...s.history.slice(0, s.idx + 1), ov], idx: s.idx + 1 }
    }
    case 'SET_TAIL': {
      const o = { ...(s.overrides[a.id] ?? {}), tail: a.tail }
      return { ...s, overrides: { ...s.overrides, [a.id]: o } }
    }
    case 'COMMIT': {
      const h = [...s.history.slice(0, s.idx + 1), { ...s.overrides }]
      return { ...s, history: h, idx: s.idx + 1 }
    }
    case 'UNDO':
      if (s.idx <= 0) return s
      return { ...s, overrides: s.history[s.idx - 1], idx: s.idx - 1 }
    case 'REDO':
      if (s.idx >= s.history.length - 1) return s
      return { ...s, overrides: s.history[s.idx + 1], idx: s.idx + 1 }
    case 'RESET_ONE': {
      const ov = { ...s.overrides }; delete ov[a.id]
      return { ...s, overrides: ov, history: [...s.history.slice(0, s.idx + 1), ov], idx: s.idx + 1 }
    }
    case 'RESET_ALL': {
      return { overrides: {}, history: [...s.history.slice(0, s.idx + 1), {}], idx: s.idx + 1, selected: null }
    }
    case 'LOAD':
      return { overrides: a.overrides, history: [a.overrides], idx: 0, selected: null }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const BUBBLE_TYPES = [
  { key: 'bubble-oval',  label: '타원 (동적 꼬리)' },
  { key: 'bubble-wide',  label: '가로형 (동적 꼬리)' },
  { key: 'bubble-tall',  label: '세로형 (동적 꼬리)' },
  { key: 'bubble-short', label: '짧은형 (동적 꼬리)' },
  { key: 'bubble-01-oval-bottom-left',   label: '레거시: 아래 왼쪽' },
  { key: 'bubble-02-oval-bottom-center', label: '레거시: 아래 중앙' },
  { key: 'bubble-03-oval-bottom-right',  label: '레거시: 아래 오른쪽' },
  { key: 'bubble-04-oval-top-left',      label: '레거시: 위 왼쪽' },
  { key: 'bubble-05-oval-top-center',    label: '레거시: 위 중앙' },
  { key: 'bubble-06-oval-top-right',     label: '레거시: 위 오른쪽' },
  { key: 'bubble-10-shout',              label: '레거시: 외침형' },
  { key: 'bubble-11-narration',          label: '나레이션 박스' },
]
function eff(base: WebtoonBubble, o?: Override): WebtoonBubble {
  if (!o) return base
  return {
    ...base,
    bubbleKey: o.bubbleKey ?? base.bubbleKey,
    xPct:     o.xPct     ?? base.xPct,
    yPct:     o.yPct     ?? base.yPct,
    widthPct: o.widthPct ?? base.widthPct,
    tail:     o.tail     ?? base.tail,
  }
}

// ── Editor toolbar ───────────────────────────────────────────────────────────
function Toolbar({
  editMode, onToggle, canUndo, canRedo, onUndo, onRedo,
  onResetSelected, onResetAll, onSave, saveStatus, selectedId,
}: {
  editMode: boolean; onToggle: () => void
  canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void
  onResetSelected: () => void; onResetAll: () => void
  onSave: () => void; saveStatus: string; selectedId: string | null
}) {
  const btn = (label: string, onClick: () => void, disabled = false, accent = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1.5px solid ${accent ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
        background: accent ? '#6366f1' : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.12s',
      }}
    >{label}</button>
  )
  return (
    <div style={{
      position: 'sticky', top: 52, zIndex: 20,
      background: '#1e1b4b', color: '#fff',
      padding: '8px 12px', display: 'flex', alignItems: 'center',
      gap: 6, flexWrap: 'wrap',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginRight: 4 }}>✏️ 말풍선 편집</span>
      {btn(editMode ? '편집 끄기' : '편집 켜기', onToggle, false, editMode)}
      {editMode && <>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
        {btn('↩ 실행취소', onUndo, !canUndo)}
        {btn('↪ 다시실행', onRedo, !canRedo)}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
        {btn('선택 초기화', onResetSelected, !selectedId)}
        {btn('전체 초기화', onResetAll)}
        <div style={{ flex: 1 }} />
        {btn(
          saveStatus === 'saving' ? '저장 중…' : saveStatus === 'saved' ? '✓ 저장됨' : saveStatus === 'error' ? '⚠ 오류' : '💾 저장',
          onSave, saveStatus === 'saving', true
        )}
      </>}
    </div>
  )
}

// ── Editable bubble ──────────────────────────────────────────────────────────
function EditableBubble({
  base, override, gapSection, isSelected, editMode,
  showKo, showTrans,
  onSelect, onMove, onResize, onCommit, onTypeChange, onTailChange,
  gapRef,
}: {
  base: WebtoonBubble
  override?: Override
  gapSection: WebtoonGapSection
  isSelected: boolean
  editMode: boolean
  showKo: boolean
  showTrans: boolean
  onSelect: (id: string) => void
  onMove: (id: string, xPct: number, yPct: number) => void
  onResize: (id: string, widthPct: number) => void
  onCommit: () => void
  onTypeChange: (id: string, key: string) => void
  onTailChange: (id: string, tail: BubbleTailData) => void
  gapRef: React.RefObject<HTMLDivElement | null>
}) {
  const b = eff(base, override)
  const meta = bmeta(b.bubbleKey)
  const sa = meta.safeArea
  const lines = b.lines ?? 1
  const koSize = lines === 1 ? 'clamp(16px,5.0vw,22px)' : lines === 2 ? 'clamp(15px,4.6vw,20px)' : 'clamp(14px,4.2vw,18px)'
  const trSize = 'clamp(11px,2.9vw,13px)'

  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2], viewBoxH = vbParts[3]

  // Drag state (refs to avoid re-renders during drag)
  const dragRef = useRef<{ startPX: number; startPY: number; startXPct: number; startYPct: number } | null>(null)
  const resizeRef = useRef<{ startPX: number; startW: number; startX: number } | null>(null)
  const tipDragRef = useRef<{ startPX: number; startPY: number; startTipX: number; startTipY: number } | null>(null)
  const anchorDragRef = useRef<true | null>(null)

  const getGapRect = () => gapRef.current?.getBoundingClientRect()

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editMode) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    onSelect(b.id)
    dragRef.current = { startPX: e.clientX, startPY: e.clientY, startXPct: b.xPct, startYPct: b.yPct }
  }, [editMode, b.id, b.xPct, b.yPct, onSelect])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const rect = getGapRect()
    if (!rect) return
    const dx = (e.clientX - dragRef.current.startPX) / rect.width * 100
    const dy = (e.clientY - dragRef.current.startPY) / rect.height * 100
    const newX = Math.max(-40, Math.min(100, dragRef.current.startXPct + dx))
    const newY = dragRef.current.startYPct + dy
    onMove(b.id, newX, newY)
  }, [b.id, onMove])

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    onCommit()
  }, [onCommit])

  const handleResizeDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeRef.current = { startPX: e.clientX, startW: b.widthPct, startX: b.xPct }
  }, [b.widthPct, b.xPct])

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return
    const rect = getGapRect()
    if (!rect) return
    const dx = (e.clientX - resizeRef.current.startPX) / rect.width * 100
    const newW = Math.max(10, Math.min(98 - resizeRef.current.startX, resizeRef.current.startW + dx))
    onResize(b.id, newW)
  }, [b.id, onResize])

  const handleResizeUp = useCallback(() => {
    if (!resizeRef.current) return
    resizeRef.current = null
    onCommit()
  }, [onCommit])

  // ── Tail tip drag ─────────────────────────────────────────────────────────
  const handleTipDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    tipDragRef.current = {
      startPX: e.clientX, startPY: e.clientY,
      startTipX: b.tail?.tipX ?? 0.5,
      startTipY: b.tail?.tipY ?? 1.0,
    }
  }, [b.tail])

  const handleTipMove = useCallback((e: React.PointerEvent) => {
    if (!tipDragRef.current || !b.tail) return
    const rect = getGapRect()
    if (!rect) return
    const bubbleW = rect.width * b.widthPct / 100
    const bubbleH = bubbleW * viewBoxH / viewBoxW
    const dx = (e.clientX - tipDragRef.current.startPX) / bubbleW
    const dy = (e.clientY - tipDragRef.current.startPY) / bubbleH
    onTailChange(b.id, { ...b.tail, tipX: tipDragRef.current.startTipX + dx, tipY: tipDragRef.current.startTipY + dy })
  }, [b.id, b.tail, b.widthPct, viewBoxW, viewBoxH, onTailChange])

  const handleTipUp = useCallback(() => {
    if (!tipDragRef.current) return
    tipDragRef.current = null
    onCommit()
  }, [onCommit])

  // ── Tail anchor drag (projects mouse onto oval perimeter) ─────────────────
  const handleAnchorDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    anchorDragRef.current = true
  }, [])

  const handleAnchorMove = useCallback((e: React.PointerEvent) => {
    if (!anchorDragRef.current || !b.tail || !meta.ovalParams) return
    const rect = getGapRect()
    if (!rect) return
    const { cx, cy, rx, ry } = meta.ovalParams
    const bubbleW = rect.width * b.widthPct / 100
    const bubbleH = bubbleW * viewBoxH / viewBoxW
    // Bubble top-left in viewport px
    const bubbleLeft = rect.left + rect.width * b.xPct / 100
    const bubbleTop  = rect.top  + rect.height * b.yPct / 100
    // Mouse relative to oval center
    const mx = e.clientX - (bubbleLeft + cx * bubbleW)
    const my = e.clientY - (bubbleTop  + cy * bubbleH)
    // Project angle: normalize by oval radii
    let θ = Math.atan2(my / (ry * bubbleH), mx / (rx * bubbleW))
    let anchor = θ / (2 * Math.PI)
    if (anchor < 0) anchor += 1
    onTailChange(b.id, { ...b.tail, anchor })
  }, [b.id, b.tail, b.xPct, b.yPct, b.widthPct, meta.ovalParams, viewBoxW, viewBoxH, onTailChange])

  const handleAnchorUp = useCallback(() => {
    if (!anchorDragRef.current) return
    anchorDragRef.current = null
    onCommit()
  }, [onCommit])

  const isBodyOnly = !!meta.bodyOnly && !!meta.ovalParams
  const HANDLE = 10  // resize handle px

  // Anchor handle position (% of bubble dimensions, for edit-mode overlay)
  const ovalP = meta.ovalParams
  const anchorθ = (b.tail?.anchor ?? 0) * 2 * Math.PI
  const anchorHandleX = ovalP ? (ovalP.cx + ovalP.rx * Math.cos(anchorθ)) * 100 : 50
  const anchorHandleY = ovalP ? (ovalP.cy + ovalP.ry * Math.sin(anchorθ)) * 100 : 50

  // Text overlay (shared between bodyOnly and legacy rendering)
  const textOverlay = (
    <div style={{
      position: 'absolute',
      left: `${sa.left * 100}%`, top: `${sa.top * 100}%`,
      right: `${sa.right * 100}%`, bottom: `${sa.bottom * 100}%`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: '0.3em', overflow: 'hidden', padding: '0 2px',
      pointerEvents: 'none',
    }}>
      {showKo && (
        <div style={{ fontSize: koSize, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.35, whiteSpace: 'pre-line', letterSpacing: '-0.01em' }}>
          {b.korean}
        </div>
      )}
      {showTrans && (
        <div style={{ fontSize: trSize, color: '#555', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
          {b.translation}
        </div>
      )}
    </div>
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: `${b.xPct}%`, top: `${b.yPct}%`, width: `${b.widthPct}%`,
        cursor: editMode ? (dragRef.current ? 'grabbing' : 'grab') : 'default',
        outline: isSelected && editMode ? '2px solid #6366f1' : 'none',
        outlineOffset: 2,
        userSelect: 'none',
        touchAction: editMode ? 'none' : 'auto',
        overflow: 'visible',
      }}
      onPointerDown={editMode ? handlePointerDown : undefined}
      onPointerMove={editMode ? handlePointerMove : undefined}
      onPointerUp={editMode ? handlePointerUp : undefined}
      onClick={editMode ? (e) => { e.stopPropagation(); onSelect(b.id) } : undefined}
    >
      {isBodyOnly && meta.ovalParams ? (
        /* ── Merged body+tail: single SVG path ── */
        <div style={{ position: 'relative', paddingBottom: `${(viewBoxH / viewBoxW) * 100}%`, overflow: 'visible' }}>
          <BubbleSvg
            viewBoxW={viewBoxW} viewBoxH={viewBoxH}
            oval={meta.ovalParams}
            tail={b.tail}
            flipY={meta.flipY}
          />
          {textOverlay}
        </div>
      ) : (
        /* ── Legacy: SVG image file (tail baked in) ── */
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.src} alt="" aria-hidden
            style={{
              display: 'block', width: '100%', height: 'auto',
              transform: meta.flipY ? 'scaleY(-1)' : undefined,
              pointerEvents: 'none', userSelect: 'none',
            }}
            draggable={false}
          />
          {textOverlay}
        </>
      )}

      {/* ── Edit-mode overlays (all relative to bubble wrapper) ── */}
      {isSelected && editMode && (
        <>
          {/* Type dropdown */}
          <div
            style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 30,
              background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: 8,
              padding: 4, marginTop: 4, minWidth: 130,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
            onPointerDown={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 10, color: '#a5b4fc', padding: '2px 6px 4px', fontWeight: 700 }}>꼬리 방향</div>
            {BUBBLE_TYPES.map(opt => (
              <button
                key={opt.key}
                onClick={(e) => { e.stopPropagation(); onTypeChange(b.id, opt.key) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '4px 8px', fontSize: 11, color: opt.key === b.bubbleKey ? '#fff' : '#94a3b8',
                  background: opt.key === b.bubbleKey ? 'rgba(99,102,241,0.3)' : 'transparent',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: opt.key === b.bubbleKey ? 700 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Resize handle — bottom-right */}
          <div
            style={{
              position: 'absolute', bottom: -HANDLE / 2, right: -HANDLE / 2,
              width: HANDLE, height: HANDLE, borderRadius: 3,
              background: '#6366f1', border: '1.5px solid #fff',
              cursor: 'ew-resize', zIndex: 10,
            }}
            onPointerDown={e => { e.stopPropagation(); handleResizeDown(e) }}
            onPointerMove={e => { e.stopPropagation(); handleResizeMove(e) }}
            onPointerUp={e => { e.stopPropagation(); handleResizeUp() }}
          />

          {/* Tail handles — only for bodyOnly bubbles with tail data */}
          {isBodyOnly && b.tail && (
            <>
              {/* Anchor handle — blue, on oval perimeter */}
              <div
                style={{
                  position: 'absolute',
                  left: `${anchorHandleX}%`, top: `${anchorHandleY}%`,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#3b82f6', border: '2px solid #fff',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'grab', zIndex: 40,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                  touchAction: 'none',
                }}
                title="꼬리 시작점"
                onPointerDown={e => { e.stopPropagation(); handleAnchorDown(e) }}
                onPointerMove={e => { e.stopPropagation(); handleAnchorMove(e) }}
                onPointerUp={e => { e.stopPropagation(); handleAnchorUp() }}
              />

              {/* Tip handle — red, at tail tip */}
              <div
                style={{
                  position: 'absolute',
                  left: `${b.tail.tipX * 100}%`, top: `${b.tail.tipY * 100}%`,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#ef4444', border: '2px solid #fff',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'crosshair', zIndex: 40,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                  touchAction: 'none',
                }}
                title="꼬리 끝점"
                onPointerDown={e => { e.stopPropagation(); handleTipDown(e) }}
                onPointerMove={e => { e.stopPropagation(); handleTipMove(e) }}
                onPointerUp={e => { e.stopPropagation(); handleTipUp() }}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Panel image ───────────────────────────────────────────────────────────────
function PanelSection({ section }: { section: WebtoonPanelSection }) {
  const isWide = section.layout === 'wide'
  const isMedRight = section.layout === 'medium-right'
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: isWide ? 'center' : isMedRight ? 'flex-end' : 'flex-start' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={section.imageUrl} alt={section.id} style={{ display: 'block', width: isWide ? '100%' : '78%', height: 'auto' }} />
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
export function WebtoonEditor({ episode, initialEditMode = false }: {
  episode: WebtoonEpisodeData
  initialEditMode?: boolean
}) {
  const [editMode, setEditMode] = useState(initialEditMode)
  const [showKo, setShowKo] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showBubbleList, setShowBubbleList] = useState(false)
  const [state, dispatch] = useReducer(reducer, { overrides: {}, history: [{}], idx: 0, selected: null })

  // Gap container refs (for coordinate conversion)
  const gapRefs = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map())
  const getGapRef = (id: string) => {
    if (!gapRefs.current.has(id)) gapRefs.current.set(id, { current: null })
    return gapRefs.current.get(id)!
  }

  // Build bubble→gap lookup
  const bubbleToGap = useMemo(() => {
    const m = new Map<string, WebtoonGapSection>()
    for (const s of episode.sections) {
      if (s.type === 'gap') for (const b of s.bubbles) m.set(b.id, s)
    }
    return m
  }, [episode])

  // Load saved overrides on mount
  useEffect(() => {
    fetch(`/api/admin/episode-layout?id=${episode.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.overrides && Object.keys(data.overrides).length > 0) {
          dispatch({ type: 'LOAD', overrides: data.overrides })
        }
      })
      .catch(() => {})
  }, [episode.id])

  // Keyboard nudge
  useEffect(() => {
    if (!editMode || !state.selected) return
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1
      const gap = bubbleToGap.get(state.selected!)
      if (!gap) return
      const gapEl = gapRefs.current.get(gap.id)?.current
      const rect = gapEl?.getBoundingClientRect()
      if (!rect) return
      const dxPct = (step / rect.width) * 100
      const dyPct = (step / rect.height) * 100
      const section = episode.sections.find(s => s.type === 'gap' && s.id === gap.id) as WebtoonGapSection | undefined
      const base = section?.bubbles.find(b => b.id === state.selected)
      if (!base) return
      const cur = eff(base, state.overrides[state.selected!])
      let nx = cur.xPct, ny = cur.yPct
      if (e.key === 'ArrowLeft')  { e.preventDefault(); nx = Math.max(0, nx - dxPct) }
      if (e.key === 'ArrowRight') { e.preventDefault(); nx = Math.min(100 - cur.widthPct, nx + dxPct) }
      if (e.key === 'ArrowUp')    { e.preventDefault(); ny = Math.max(0, ny - dyPct) }
      if (e.key === 'ArrowDown')  { e.preventDefault(); ny = Math.min(100, ny + dyPct) }
      else if (!['ArrowLeft','ArrowRight'].includes(e.key)) return
      dispatch({ type: 'MOVE', id: state.selected!, xPct: nx, yPct: ny })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editMode, state.selected, state.overrides, bubbleToGap, episode])

  // Deselect when clicking background
  const handleGapClick = useCallback(() => {
    if (editMode) dispatch({ type: 'SELECT', id: null })
  }, [editMode])

  // Save
  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      // Build full bubble list for output
      const bubbles: Record<string, { bubbleKey: string; xPct: number; yPct: number; widthPct: number }> = {}
      for (const s of episode.sections) {
        if (s.type !== 'gap') continue
        for (const b of s.bubbles) {
          const e2 = eff(b, state.overrides[b.id])
          bubbles[b.id] = { bubbleKey: e2.bubbleKey, xPct: e2.xPct, yPct: e2.yPct, widthPct: e2.widthPct }
        }
      }
      const r = await fetch('/api/admin/episode-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId: episode.id, overrides: state.overrides, bubbles }),
      })
      if (!r.ok) throw new Error('save failed')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Control chips
  const chipStyle = (active: boolean, color: string) => ({
    padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${active ? color : 'rgba(0,0,0,0.12)'}`,
    background: active ? color : 'transparent',
    color: active ? '#fff' : 'var(--pm, #888)',
    cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  } as React.CSSProperties)

  return (
    <div style={{ width: '100%' }}>
      {/* Viewer control bar */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', background: '#fffdf8', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 52, zIndex: editMode ? 8 : 9 }}>
        <button style={chipStyle(showKo, '#1a1a1a')} onClick={() => setShowKo(v => !v)}>한국어 {showKo ? '✓' : '—'}</button>
        <button style={chipStyle(showTrans, '#6366f1')} onClick={() => setShowTrans(v => !v)}>English {showTrans ? '✓' : '—'}</button>
      </div>

      {/* Editor toolbar */}
      <Toolbar
        editMode={editMode}
        onToggle={() => setEditMode(v => !v)}
        canUndo={state.idx > 0}
        canRedo={state.idx < state.history.length - 1}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        onResetSelected={() => state.selected && dispatch({ type: 'RESET_ONE', id: state.selected })}
        onResetAll={() => dispatch({ type: 'RESET_ALL' })}
        onSave={handleSave}
        saveStatus={saveStatus}
        selectedId={state.selected}
      />

      {/* Bubble list panel */}
      {editMode && (
        <div style={{ background: '#1e1b4b', borderBottom: '1px solid #4338ca' }}>
          <button
            onClick={() => setShowBubbleList(v => !v)}
            style={{ width: '100%', padding: '6px 16px', textAlign: 'left', fontSize: 11, color: '#a5b4fc', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            📋 말풍선 목록 {showBubbleList ? '▲' : '▼'} ({episode.sections.filter(s => s.type === 'gap').flatMap(s => (s as WebtoonGapSection).bubbles).length}개)
          </button>
          {showBubbleList && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 12px 10px' }}>
              {episode.sections.filter(s => s.type === 'gap').flatMap(s => (s as WebtoonGapSection).bubbles).map(b => {
                const ov = state.overrides[b.id]
                const yPct = ov?.yPct ?? b.yPct ?? 0
                const isSelected = state.selected === b.id
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      dispatch({ type: 'SELECT', id: b.id })
                      const gap = bubbleToGap.get(b.id)
                      if (gap) gapRefs.current.get(gap.id)?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: 12, fontSize: 11, cursor: 'pointer', fontWeight: isSelected ? 700 : 400,
                      background: isSelected ? '#6366f1' : 'rgba(99,102,241,0.2)',
                      border: `1.5px solid ${isSelected ? '#818cf8' : '#4338ca'}`,
                      color: isSelected ? '#fff' : '#c7d2fe',
                      maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                    title={`${b.korean} (y:${Math.round(yPct)}%)`}
                  >
                    {b.korean.replace(/\n/g, ' ')}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Webtoon content */}
      {episode.sections.map(section => {
        if (section.type === 'panel') return <PanelSection key={section.id} section={section} />
        if (section.type === 'crop-panel') {
          const cs = section as import('@/data/kpatto/webtoon-types').WebtoonCropSection
          const pb = (cs.cropH / cs.cropW) * 100
          const imgWidth = (cs.srcW / cs.cropW) * 100
          const imgLeft = -(cs.cropX / cs.cropW) * 100
          const imgTop = -(cs.cropY / cs.cropW) * 100
          return (
            <div key={cs.id} style={{ position: 'relative', zIndex: 0, width: '100%', paddingBottom: `${pb}%`, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cs.imageUrl} alt={cs.id} style={{ position: 'absolute', top: `${imgTop}%`, left: `${imgLeft}%`, width: `${imgWidth}%`, maxWidth: 'none' }} />
            </div>
          )
        }

        const gap = section as WebtoonGapSection
        const gapRef = getGapRef(gap.id)
        return (
          // 뷰어와 동일한 구조. z-index:20으로 overflow 말풍선이 이후 패널 위에 표시됨
          <div
            key={gap.id}
            ref={el => { gapRef.current = el }}
            onClick={handleGapClick}
            style={{
              position: 'relative', zIndex: 20, width: '100%',
              paddingBottom: `${gap.heightRatio * 100}%`,
              overflow: 'visible',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              {gap.bubbles.map(base => (
                <EditableBubble
                  key={base.id}
                  base={base}
                  override={state.overrides[base.id]}
                  gapSection={gap}
                  isSelected={state.selected === base.id}
                  editMode={editMode}
                  showKo={showKo}
                  showTrans={showTrans}
                  onSelect={id => dispatch({ type: 'SELECT', id })}
                  onMove={(id, x, y) => dispatch({ type: 'MOVE', id, xPct: x, yPct: y })}
                  onResize={(id, w) => dispatch({ type: 'RESIZE', id, widthPct: w })}
                  onCommit={() => dispatch({ type: 'COMMIT' })}
                  onTypeChange={(id, key) => dispatch({ type: 'SET_KEY', id, key })}
                  onTailChange={(id, tail) => dispatch({ type: 'SET_TAIL', id, tail })}
                  gapRef={gapRef}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
