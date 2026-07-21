'use client'

import { useState, useCallback } from 'react'
import type { WebtoonEpisodeData, WebtoonBubble, WebtoonGapSection, WebtoonPanelSection } from '@/data/kpatto/webtoon-types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleTailSvg } from './BubbleTail'

// ── Character colours ────────────────────────────────────────────────────────
const SPEAKER_COLORS: Record<string, string> = {
  emma:  '#E85D6E',
  jisoo: '#3B82F6',
}

// ── bubbles.json helpers ─────────────────────────────────────────────────────
type BubbleKey = keyof typeof bubblesData

function getBubbleMeta(key: string) {
  return bubblesData[key as BubbleKey] as {
    src: string
    viewBox: string
    label: string
    flipY?: boolean
    bodyOnly?: boolean
    ovalParams?: { cx: number; cy: number; rx: number; ry: number }
    safeArea: { left: number; top: number; right: number; bottom: number }
  }
}

// ── Speaker avatar ───────────────────────────────────────────────────────────
const SPEAKER_AVATAR: Record<string, string> = { emma: '🙋‍♀️', jisoo: '👩‍💼' }

// ── Single speech bubble ─────────────────────────────────────────────────────
function WebtoonBubbleEl({
  bubble,
  showKo,
  showTrans,
}: {
  bubble: WebtoonBubble
  showKo: boolean
  showTrans: boolean
}) {
  const [speaking, setSpeaking] = useState(false)
  const meta = getBubbleMeta(bubble.bubbleKey)
  const sa = meta.safeArea
  const speakerColor = SPEAKER_COLORS[bubble.speaker] ?? '#444'

  const handleSpeak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(bubble.korean)
    utter.lang = 'ko-KR'
    utter.rate = 0.85
    setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [bubble.korean])

  const lines = bubble.lines ?? 1
  // clamp prevents vw from becoming too large on desktop while still scaling on mobile
  const koFontSize  = lines === 1 ? 'clamp(12px,3.8vw,16px)' : lines === 2 ? 'clamp(11px,3.4vw,14px)' : 'clamp(10px,3.0vw,13px)'
  const trFontSize  = lines === 1 ? 'clamp(9px,2.4vw,11px)' : 'clamp(9px,2.2vw,10px)'

  const hasTail = !!bubble.tail && !!meta.ovalParams
  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2]
  const viewBoxH = vbParts[3]

  return (
    <div
      style={{
        position: 'absolute',
        left: `${bubble.xPct}%`,
        top: `${bubble.yPct}%`,
        width: `${bubble.widthPct}%`,
        transform: bubble.rotation ? `rotate(${bubble.rotation}deg)` : undefined,
        overflow: 'visible',
      }}
    >
      {/* Dynamic tail (behind body) */}
      {hasTail && bubble.tail && meta.ovalParams && (
        <BubbleTailSvg
          tail={bubble.tail}
          viewBoxW={viewBoxW}
          viewBoxH={viewBoxH}
          oval={meta.ovalParams}
        />
      )}

      {/* SVG bubble body */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.src}
        alt=""
        aria-hidden="true"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          position: hasTail ? 'relative' : undefined,
          zIndex: hasTail ? 1 : undefined,
          transform: [meta.flipY && 'scaleY(-1)', bubble.flip && 'scaleX(-1)'].filter(Boolean).join(' ') || undefined,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Text overlay — positioned within safe area */}
      <div
        style={{
          position: 'absolute',
          zIndex: hasTail ? 2 : undefined,
          left:   `${sa.left   * 100}%`,
          top:    `${sa.top    * 100}%`,
          right:  `${sa.right  * 100}%`,
          bottom: `${sa.bottom * 100}%`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.3em',
          overflow: 'hidden',
          padding: '0 2px',
        }}
      >
        {showKo && (
          <div
            style={{
              fontSize: koFontSize,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.35,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.01em',
            }}
          >
            {bubble.korean}
          </div>
        )}
        {showTrans && (
          <div
            style={{
              fontSize: trFontSize,
              color: '#555',
              lineHeight: 1.3,
              whiteSpace: 'pre-line',
            }}
          >
            {bubble.translation}
          </div>
        )}
      </div>

      {/* Speaker button — bottom-right of bubble box */}
      <button
        onClick={handleSpeak}
        aria-label={`${bubble.speaker} 발음 듣기`}
        style={{
          position: 'absolute',
          zIndex: hasTail ? 2 : undefined,
          bottom: `${(sa.bottom * 100 * 0.25)}%`,
          right: `${(sa.right * 100 * 0.25)}%`,
          width: '5.5vw',
          height: '5.5vw',
          maxWidth: 26,
          maxHeight: 26,
          minWidth: 18,
          minHeight: 18,
          borderRadius: '50%',
          background: speaking ? speakerColor : 'rgba(255,255,255,0.92)',
          border: `1.5px solid ${speakerColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '2.8vw',
          padding: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'all 0.15s',
        }}
      >
        {speaking ? '🔊' : SPEAKER_AVATAR[bubble.speaker] ?? '🔊'}
      </button>
    </div>
  )
}

// ── Gap section ──────────────────────────────────────────────────────────────
function GapSection({
  section,
  showKo,
  showTrans,
}: {
  section: WebtoonGapSection
  showKo: boolean
  showTrans: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        // padding-bottom % is relative to parent width — creates proportional height
        paddingBottom: `${section.heightRatio * 100}%`,
        background: '#fdfdf9',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        {section.bubbles.map(b => (
          <WebtoonBubbleEl
            key={b.id}
            bubble={b}
            showKo={showKo}
            showTrans={showTrans}
          />
        ))}
      </div>
    </div>
  )
}

// ── Panel section ────────────────────────────────────────────────────────────
function PanelSection({ section }: { section: WebtoonPanelSection }) {
  const isWide = section.layout === 'wide'
  const isMedRight = section.layout === 'medium-right'

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: isWide ? 'center' : isMedRight ? 'flex-end' : 'flex-start',
        background: '#fff',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.imageUrl}
        alt={`컷 ${section.id}`}
        style={{
          display: 'block',
          width: isWide ? '100%' : '78%',
          height: 'auto',
        }}
      />
    </div>
  )
}

// ── Controls bar ─────────────────────────────────────────────────────────────
function ControlBar({
  showKo,
  showTrans,
  onToggleKo,
  onToggleTrans,
}: {
  showKo: boolean
  showTrans: boolean
  onToggleKo: () => void
  onToggleTrans: () => void
}) {
  const chipStyle = (active: boolean, color: string) => ({
    padding: '5px 12px',
    borderRadius: 20,
    border: `1.5px solid ${active ? color : 'rgba(0,0,0,0.12)'}`,
    background: active ? color : 'transparent',
    color: active ? '#fff' : 'var(--pm, #888)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '8px 16px',
        background: 'var(--pb, #fff)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        position: 'sticky',
        top: 52, // below the nav bar
        zIndex: 9,
      }}
    >
      <button style={chipStyle(showKo, '#1a1a1a')} onClick={onToggleKo}>
        한국어 {showKo ? '✓' : '—'}
      </button>
      <button style={chipStyle(showTrans, '#6366f1')} onClick={onToggleTrans}>
        English {showTrans ? '✓' : '—'}
      </button>
    </div>
  )
}

// ── Main exported component ──────────────────────────────────────────────────
export function WebtoonEpisode({ episode }: { episode: WebtoonEpisodeData }) {
  const [showKo, setShowKo] = useState(true)
  const [showTrans, setShowTrans] = useState(true)

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 430,
        margin: '0 auto',
        background: '#fff',
      }}
    >
      <ControlBar
        showKo={showKo}
        showTrans={showTrans}
        onToggleKo={() => setShowKo(v => !v)}
        onToggleTrans={() => setShowTrans(v => !v)}
      />

      {episode.sections.map(section => {
        if (section.type === 'gap') {
          return (
            <GapSection
              key={section.id}
              section={section}
              showKo={showKo}
              showTrans={showTrans}
            />
          )
        }
        return <PanelSection key={section.id} section={section} />
      })}
    </div>
  )
}
