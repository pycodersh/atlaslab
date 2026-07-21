'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { WebtoonEpisodeData, WebtoonBubble, WebtoonGapSection, WebtoonPanelSection } from '@/data/kpatto/webtoon-types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleTailSvg } from './BubbleTail'

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

// ── Single speech bubble ─────────────────────────────────────────────────────
function WebtoonBubbleEl({
  bubble,
  showKo,
  showTrans,
  isActive,
}: {
  bubble: WebtoonBubble
  showKo: boolean
  showTrans: boolean
  isActive: boolean
}) {
  const meta = getBubbleMeta(bubble.bubbleKey)
  const sa = meta.safeArea
  const hasTail = !!bubble.tail && !!meta.ovalParams
  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2]
  const viewBoxH = vbParts[3]

  const lines = bubble.lines ?? 1
  const koFontSize  = lines === 1 ? 'clamp(12px,3.8vw,16px)' : lines === 2 ? 'clamp(11px,3.4vw,14px)' : 'clamp(10px,3.0vw,13px)'
  const trFontSize  = 'clamp(9px,2.4vw,11px)'

  return (
    <div
      style={{
        position: 'absolute',
        left: `${bubble.xPct}%`,
        top: `${bubble.yPct}%`,
        width: `${bubble.widthPct}%`,
        transform: bubble.rotation ? `rotate(${bubble.rotation}deg)` : undefined,
        overflow: 'visible',
        filter: isActive
          ? 'drop-shadow(0 0 6px #f59e0b) drop-shadow(0 0 12px rgba(245,158,11,0.5))'
          : undefined,
        transition: 'filter 0.2s ease',
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

      {/* Text overlay */}
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
          <div style={{ fontSize: trFontSize, color: '#555', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
            {bubble.translation}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gap section ──────────────────────────────────────────────────────────────
function GapSection({
  section,
  showKo,
  showTrans,
  playingId,
}: {
  section: WebtoonGapSection
  showKo: boolean
  showTrans: boolean
  playingId: string | null
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: `${section.heightRatio * 100}%`,
        background: '#fdfdf9',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {section.bubbles.map(b => (
          <WebtoonBubbleEl
            key={b.id}
            bubble={b}
            showKo={showKo}
            showTrans={showTrans}
            isActive={b.id === playingId}
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
        style={{ display: 'block', width: isWide ? '100%' : '78%', height: 'auto' }}
      />
    </div>
  )
}

// ── Main exported component ──────────────────────────────────────────────────
export function WebtoonEpisode({ episode }: { episode: WebtoonEpisodeData }) {
  const [showKo, setShowKo] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIdxRef = useRef(0)

  const allBubbles = useMemo(() => {
    const result: WebtoonBubble[] = []
    for (const s of episode.sections) {
      if (s.type === 'gap') result.push(...s.bubbles)
    }
    return result
  }, [episode])

  const handlePlayAll = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setPlayingId(null)
      return
    }
    setIsPlaying(true)
    playIdxRef.current = 0

    const next = () => {
      const i = playIdxRef.current
      if (i >= allBubbles.length) {
        setIsPlaying(false)
        setPlayingId(null)
        return
      }
      playIdxRef.current++
      const b = allBubbles[i]
      setPlayingId(b.id)
      const u = new SpeechSynthesisUtterance(b.korean)
      u.lang = 'ko-KR'
      u.rate = 0.85
      u.onend = next
      u.onerror = () => { setIsPlaying(false); setPlayingId(null) }
      window.speechSynthesis.speak(u)
    }

    next()
  }, [isPlaying, allBubbles])

  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

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
    <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: '#fff' }}>
      {/* Control bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'var(--pb, #fff)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          position: 'sticky',
          top: 52,
          zIndex: 9,
        }}
      >
        <button style={chipStyle(showKo, '#1a1a1a')} onClick={() => setShowKo(v => !v)}>
          한국어 {showKo ? '✓' : '—'}
        </button>
        <button style={chipStyle(showTrans, '#6366f1')} onClick={() => setShowTrans(v => !v)}>
          English {showTrans ? '✓' : '—'}
        </button>

        <div style={{ flex: 1 }} />

        {/* Global play button */}
        <button
          onClick={handlePlayAll}
          title={isPlaying ? '재생 중지' : '전체 대사 순서대로 듣기'}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            border: 'none',
            background: isPlaying ? '#ef4444' : '#6366f1',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontSize: isPlaying ? 11 : 13,
            boxShadow: isPlaying
              ? '0 0 0 3px rgba(239,68,68,0.25), 0 2px 8px rgba(239,68,68,0.3)'
              : '0 2px 8px rgba(99,102,241,0.35)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {isPlaying ? '■' : '▶'}
        </button>
      </div>

      {/* Sections */}
      {episode.sections.map(section => {
        if (section.type === 'gap') {
          return (
            <GapSection
              key={section.id}
              section={section}
              showKo={showKo}
              showTrans={showTrans}
              playingId={playingId}
            />
          )
        }
        return <PanelSection key={section.id} section={section} />
      })}
    </div>
  )
}
