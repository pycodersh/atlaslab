'use client'
import { useState } from 'react'
import bubblesData from '@/public/assets/bubbles/bubbles.json'

type BubbleKey = keyof typeof bubblesData
const KEYS = Object.keys(bubblesData) as BubbleKey[]

const SAMPLE_TEXT = {
  1: '여기 카페예요?',
  2: '어서 오세요.\n잠깐만요!',
  3: '이거 뭐예요?\n정말 맛있어요.\n카페라떼 주세요.',
}

const SIZES = [
  { label: 'S', width: 180 },
  { label: 'M', width: 260 },
  { label: 'L', width: 340 },
]

function parseSafeArea(key: BubbleKey) {
  return (bubblesData[key] as { safeArea: Record<string,number> }).safeArea
}

function parseViewBox(key: BubbleKey): [number, number] {
  const vb = (bubblesData[key] as { viewBox: string }).viewBox
  const [, , w, h] = vb.split(' ').map(Number)
  return [w, h]
}

interface CardProps {
  bKey: BubbleKey
  width: number
  lines: 1 | 2 | 3
  showSafe: boolean
  flipped: boolean
}

function BubbleCard({ bKey, width, lines, showSafe, flipped }: CardProps) {
  const meta = bubblesData[bKey] as { src: string; viewBox: string; flipY?: boolean; safeArea: Record<string, number> }
  const [vbW, vbH] = parseViewBox(bKey)
  const height = (width / vbW) * vbH
  const sa = meta.safeArea

  const safeLeft   = sa.left   * width
  const safeTop    = sa.top    * height
  const safeRight  = sa.right  * width
  const safeBottom = sa.bottom * height

  return (
    <div style={{ position: 'relative', width, height, flexShrink: 0 }}>
      {/* SVG image */}
      <img
        src={meta.src}
        alt={bKey}
        style={{
          display: 'block', width, height,
          transform: [meta.flipY && 'scaleY(-1)', flipped && 'scaleX(-1)'].filter(Boolean).join(' ') || undefined,
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      {/* Text content layer (no flip) */}
      <div style={{
        position: 'absolute',
        left: safeLeft, top: safeTop,
        right: safeRight, bottom: safeBottom,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        fontSize: width < 220 ? 11 : width < 300 ? 13 : 15,
        fontWeight: 600, lineHeight: 1.5, color: '#111',
        whiteSpace: 'pre-line',
        pointerEvents: 'none',
      }}>
        {SAMPLE_TEXT[lines]}
      </div>

      {/* Safe area overlay */}
      {showSafe && (
        <div style={{
          position: 'absolute',
          left: safeLeft, top: safeTop,
          right: safeRight, bottom: safeBottom,
          border: '1.5px dashed rgba(99,102,241,0.7)',
          background: 'rgba(99,102,241,0.07)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}

export default function BubblesPreviewPage() {
  const [lines,    setLines]    = useState<1|2|3>(2)
  const [showSafe, setShowSafe] = useState(false)
  const [flipped,  setFlipped]  = useState(false)
  const [mobile,   setMobile]   = useState(false)

  const toggle = (cb: () => void) => () => cb()

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{
      padding: '5px 13px', borderRadius: 20, border: '1px solid',
      borderColor: active ? '#6366f1' : '#333',
      background: active ? '#6366f1' : '#1a1a2e',
      color: active ? '#fff' : '#888',
      cursor: 'pointer', fontSize: 12, fontWeight: 600,
    }}>{label}</button>
  )

  return (
    <div style={{ background: '#0b0b18', minHeight: '100vh', color: '#e0e0ff', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f0f22', borderBottom: '1px solid #1e1e36', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#a5b4fc', marginRight: 8 }}>K-PATTO 말풍선 자산 미리보기</span>

        <Chip label="1줄" active={lines===1} onClick={() => setLines(1)} />
        <Chip label="2줄" active={lines===2} onClick={() => setLines(2)} />
        <Chip label="3줄" active={lines===3} onClick={() => setLines(3)} />

        <div style={{ width: 1, height: 20, background: '#2a2a44', margin: '0 4px' }} />

        <Chip label="Safe Area" active={showSafe} onClick={toggle(() => setShowSafe(v => !v))} />
        <Chip label="좌우 반전" active={flipped} onClick={toggle(() => setFlipped(v => !v))} />
        <Chip label="모바일 375px" active={mobile} onClick={toggle(() => setMobile(v => !v))} />

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#444' }}>10종 · S/M/L 3가지 크기</span>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: mobile ? 375 : undefined, margin: mobile ? '0 auto' : undefined, padding: '24px 20px' }}>
        {KEYS.map(key => {
          const meta = bubblesData[key] as { label: string; category: string; flipY?: boolean }
          return (
            <div key={key} style={{ marginBottom: 48 }}>
              {/* Row label */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#a5b4fc' }}>{key}</span>
                <span style={{ fontSize: 11, color: '#555', background: '#1a1a2e', padding: '2px 8px', borderRadius: 10 }}>{meta.label}</span>
                {meta.category === 'shout' && <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 10 }}>외침형</span>}
                {meta.category === 'narration' && <span style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 10 }}>나레이션</span>}
                {meta.flipY && <span style={{ fontSize: 10, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 10 }}>flipY</span>}
              </div>

              {/* 3 sizes side by side */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {SIZES.map(({ label, width }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>{label} · {width}px</span>
                    <BubbleCard
                      bKey={key}
                      width={mobile ? Math.min(width, 375 - 40) : width}
                      lines={lines}
                      showSafe={showSafe}
                      flipped={flipped}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, fontSize: 10, color: '#333', fontFamily: 'monospace' }}>
                safeArea: {JSON.stringify((bubblesData[key] as {safeArea: Record<string,number>}).safeArea)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
