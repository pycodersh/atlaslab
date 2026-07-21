'use client'

import { useReducer, useRef, useMemo, useEffect, useState, useCallback } from 'react'
import type {
  WebtoonEpisodeData,
  WebtoonBubble,
  WebtoonGapSection,
  WebtoonPanelSection,
} from '@/data/kpatto/webtoon-types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'

// ── Bubble metadata ──────────────────────────────────────────────────────────
type BubbleMetaKey = keyof typeof bubblesData
function bmeta(key: string) {
  return bubblesData[key as BubbleMetaKey] as {
    src: string; viewBox: string; flipY?: boolean
    safeArea: { left: number; top: number; right: number; bottom: number }
  }
}
function bubbleHeightPct(widthPct: number, key: string, heightRatio: number): number {
  const vb = bmeta(key).viewBox.split(' ').map(Number)
  return (widthPct / (vb[2] / vb[3])) / heightRatio
}

// ── State ────────────────────────────────────────────────────────────────────
type Override = { bubbleKey?: string; xPct?: number; yPct?: number; widthPct?: number }
type Overrides = Record<string, Override>
type S = { overrides: Overrides; history: Overrides[]; idx: number; selected: string | null }
type A =
  | { type: 'SELECT'; id: string | null }
  | { type: 'MOVE'; id: string; xPct: number; yPct: number }
  | { type: 'RESIZE'; id: string; widthPct: number }
  | { type: 'SET_KEY'; id: string; key: string }
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
  { key: 'bubble-01-oval-bottom-left',   label: '아래 왼쪽' },
  { key: 'bubble-02-oval-bottom-center', label: '아래 중앙' },
  { key: 'bubble-03-oval-bottom-right',  label: '아래 오른쪽' },
  { key: 'bubble-04-oval-top-left',      label: '위 왼쪽' },
  { key: 'bubble-05-oval-top-center',    label: '위 중앙' },
  { key: 'bubble-06-oval-top-right',     label: '위 오른쪽' },
  { key: 'bubble-07-wide',               label: '가로형' },
  { key: 'bubble-08-tall',               label: '세로형' },
  { key: 'bubble-09-short',              label: '짧은형' },
  { key: 'bubble-10-shout',              label: '외침형' },
  { key: 'bubble-11-narration',          label: '나레이션' },
]
const SPEAKER_COLORS: Record<string, string> = { emma: '#E85D6E', jisoo: '#3B82F6' }
const SPEAKER_AVATAR: Record<string, string> = { emma: '🙋‍♀️', jisoo: '👩‍💼' }

function eff(base: WebtoonBubble, o?: Override): WebtoonBubble {
  if (!o) return base
  return {
    ...base,
    bubbleKey: o.bubbleKey ?? base.bubbleKey,
    xPct:     o.xPct     ?? base.xPct,
    yPct:     o.yPct     ?? base.yPct,
    widthPct: o.widthPct ?? base.widthPct,
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
  onSelect, onMove, onResize, onCommit, onTypeChange,
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
  gapRef: React.RefObject<HTMLDivElement | null>
}) {
  const b = eff(base, override)
  const meta = bmeta(b.bubbleKey)
  const sa = meta.safeArea
  const speakerColor = SPEAKER_COLORS[b.speaker] ?? '#444'
  const [speaking, setSpeaking] = useState(false)

  const lines = b.lines ?? 1
  const koSize = lines === 1 ? 'clamp(12px,3.8vw,16px)' : lines === 2 ? 'clamp(11px,3.4vw,14px)' : 'clamp(10px,3.0vw,13px)'
  const trSize = 'clamp(9px,2.4vw,11px)'

  // Drag state (refs to avoid re-renders during drag)
  const dragRef = useRef<{ startPX: number; startPY: number; startXPct: number; startYPct: number } | null>(null)
  const resizeRef = useRef<{ startPX: number; startW: number; startX: number } | null>(null)

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
    const hPct = bubbleHeightPct(b.widthPct, b.bubbleKey, gapSection.heightRatio)
    const newX = Math.max(0, Math.min(100 - b.widthPct, dragRef.current.startXPct + dx))
    const newY = Math.max(0, Math.min(100 - hPct, dragRef.current.startYPct + dy))
    onMove(b.id, newX, newY)
  }, [b.id, b.widthPct, b.bubbleKey, gapSection.heightRatio, onMove])

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

  const handleSpeak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(b.korean)
    u.lang = 'ko-KR'; u.rate = 0.85
    setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [b.korean])

  const imgTransform = [meta.flipY && 'scaleY(-1)'].filter(Boolean).join(' ') || undefined
  const HANDLE = 10  // resize handle px

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
      }}
      onPointerDown={editMode ? handlePointerDown : undefined}
      onPointerMove={editMode ? handlePointerMove : undefined}
      onPointerUp={editMode ? handlePointerUp : undefined}
      onClick={editMode ? (e) => { e.stopPropagation(); onSelect(b.id) } : undefined}
    >
      {/* SVG background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.src} alt="" aria-hidden
        style={{ display: 'block', width: '100%', height: 'auto', transform: imgTransform, pointerEvents: 'none', userSelect: 'none' }}
        draggable={false}
      />

      {/* Text overlay */}
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

      {/* Speaker button */}
      <button
        onClick={(e) => { e.stopPropagation(); if (!editMode) handleSpeak() }}
        aria-label={`${b.speaker} 발음 듣기`}
        style={{
          position: 'absolute',
          bottom: `${sa.bottom * 100 * 0.25}%`, right: `${sa.right * 100 * 0.25}%`,
          width: '5.5vw', height: '5.5vw', maxWidth: 26, maxHeight: 26, minWidth: 18, minHeight: 18,
          borderRadius: '50%',
          background: speaking ? speakerColor : 'rgba(255,255,255,0.92)',
          border: `1.5px solid ${speakerColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: editMode ? 'default' : 'pointer',
          fontSize: '2.8vw', padding: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'all 0.15s',
          pointerEvents: editMode ? 'none' : 'auto',
        }}
      >
        {SPEAKER_AVATAR[b.speaker] ?? '🔊'}
      </button>

      {/* ── Edit-mode overlays ── */}
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
            onPointerUp={e => { e.stopPropagation(); handleResizeUp(e) }}
          />
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
    <div style={{ width: '100%', display: 'flex', justifyContent: isWide ? 'center' : isMedRight ? 'flex-end' : 'flex-start', background: '#fff' }}>
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
    <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: '#fff' }}>
      {/* Viewer control bar */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', background: 'var(--pb,#fff)', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 52, zIndex: editMode ? 8 : 9 }}>
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

      {/* Webtoon content */}
      {episode.sections.map(section => {
        if (section.type === 'panel') return <PanelSection key={section.id} section={section} />

        const gap = section as WebtoonGapSection
        const gapRef = getGapRef(gap.id)
        return (
          <div
            key={gap.id}
            ref={el => { gapRef.current = el }}
            onClick={handleGapClick}
            style={{
              position: 'relative', width: '100%',
              paddingBottom: `${gap.heightRatio * 100}%`,
              background: '#fdfdf9',
            }}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
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
