'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Volume2 } from 'lucide-react'
import type { WebtoonEpisodeData, WebtoonBubble, WebtoonGapSection, WebtoonPanelSection, WebtoonCropSection } from '@/data/kpatto/webtoon-types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleSvg } from './BubbleSvg'

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
  const isBodyOnly = !!meta.bodyOnly && !!meta.ovalParams
  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2]
  const viewBoxH = vbParts[3]

  const lines = bubble.lines ?? 1
  const koFontSize = lines === 1 ? 'clamp(12px,3.8vw,16px)' : lines === 2 ? 'clamp(11px,3.4vw,14px)' : 'clamp(10px,3.0vw,13px)'
  const trFontSize = 'clamp(9px,2.4vw,11px)'

  const textOverlay = (
    <div
      style={{
        position: 'absolute',
        left:   `${sa.left   * 100}%`,
        top:    `${sa.top    * 100}%`,
        right:  `${sa.right  * 100}%`,
        bottom: `${sa.bottom * 100}%`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gap: '0.3em',
        overflow: 'hidden', padding: '0 2px',
      }}
    >
      {showKo && (
        <div style={{ fontSize: koFontSize, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.35, whiteSpace: 'pre-line', letterSpacing: '-0.01em' }}>
          {bubble.korean}
        </div>
      )}
      {showTrans && (
        <div style={{ fontSize: trFontSize, color: '#555', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
          {bubble.translation}
        </div>
      )}
    </div>
  )

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
      {isBodyOnly && meta.ovalParams ? (
        /* ── Merged body+tail: single SVG path ── */
        <div style={{ position: 'relative', paddingBottom: `${(viewBoxH / viewBoxW) * 100}%`, overflow: 'visible' }}>
          <BubbleSvg
            viewBoxW={viewBoxW}
            viewBoxH={viewBoxH}
            oval={meta.ovalParams}
            tail={bubble.tail}
            flip={bubble.flip}
            flipY={meta.flipY}
          />
          {textOverlay}
        </div>
      ) : (
        /* ── Legacy: img body (tail baked into SVG file) ── */
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.src}
            alt=""
            aria-hidden="true"
            style={{
              display: 'block', width: '100%', height: 'auto',
              transform: [meta.flipY && 'scaleY(-1)', bubble.flip && 'scaleX(-1)'].filter(Boolean).join(' ') || undefined,
              userSelect: 'none', pointerEvents: 'none',
            }}
          />
          {textOverlay}
        </>
      )}
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

// ── Crop panel section ───────────────────────────────────────────────────────
function CropPanelSection({ section }: { section: WebtoonCropSection }) {
  const { imageUrl, imageAspect, cropLeftPct, cropTopPct, cropWidthPct, cropHeightPct } = section
  const containerPb = (cropHeightPct / cropWidthPct) * imageAspect * 100
  const imgWidth  = `${(100 / cropWidthPct) * 100}%`
  const imgLeft   = `${-(cropLeftPct / cropWidthPct) * 100}%`
  const imgTop    = `${-(cropTopPct / cropWidthPct) * imageAspect * 100}%`

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: `${containerPb}%`, overflow: 'hidden', background: '#fff' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', width: imgWidth, height: 'auto', left: imgLeft, top: imgTop, display: 'block', userSelect: 'none', pointerEvents: 'none' }}
      />
    </div>
  )
}

// ── Override merge helper ────────────────────────────────────────────────────
type OverrideMap = Record<string, {
  bubbleKey?: string; xPct?: number; yPct?: number; widthPct?: number
  tail?: import('@/data/kpatto/webtoon-types').BubbleTailData
}>

function applyOverrides(base: WebtoonEpisodeData, overrides: OverrideMap): WebtoonEpisodeData {
  if (!Object.keys(overrides).length) return base
  return {
    ...base,
    sections: base.sections.map(s => {
      if (s.type !== 'gap') return s
      return {
        ...s,
        bubbles: s.bubbles.map(b => {
          const o = overrides[b.id]
          if (!o) return b
          return {
            ...b,
            bubbleKey: o.bubbleKey ?? b.bubbleKey,
            xPct:      o.xPct      ?? b.xPct,
            yPct:      o.yPct      ?? b.yPct,
            widthPct:  o.widthPct  ?? b.widthPct,
            tail:      o.tail      ?? b.tail,
          }
        }),
      }
    }),
  }
}

// ── Main exported component ──────────────────────────────────────────────────
export function WebtoonEpisode({ episode, episodeLabel, storyTitle }: { episode: WebtoonEpisodeData; episodeLabel?: string; storyTitle?: string }) {
  const [showKo, setShowKo] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIdxRef = useRef(0)
  const [resolvedEpisode, setResolvedEpisode] = useState(episode)

  // Load saved layout overrides and merge with base episode data
  useEffect(() => {
    fetch(`/api/admin/episode-layout?id=${episode.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.overrides && Object.keys(data.overrides).length > 0) {
          setResolvedEpisode(applyOverrides(episode, data.overrides))
        }
      })
      .catch(() => {})
  }, [episode])

  const allBubbles = useMemo(() => {
    const result: WebtoonBubble[] = []
    for (const s of resolvedEpisode.sections) {
      if (s.type === 'gap') result.push(...s.bubbles)
    }
    return result
  }, [resolvedEpisode])

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

  const langBtnStyle = (active: boolean) => ({
    background: active ? '#1A1A1A' : 'none',
    border: 'none',
    borderRadius: 4,
    padding: '3px 7px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    color: active ? '#FFFFFF' : '#999999',
    lineHeight: 1.4,
    transition: 'background 0.15s, color 0.15s',
  } as React.CSSProperties)

  return (
    <div style={{ width: '100%' }}>
      {/* Unified header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px 0 8px',
          background: '#FFFFFF',
          borderBottom: '1px solid #F2F2F2',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          height: 52,
        }}
      >
        {/* Back */}
        <Link href="/kpatto/story" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#111111', flexShrink: 0 }}>
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {episodeLabel && storyTitle ? `${episodeLabel} · ${storyTitle}` : ''}
        </div>

        {/* KO / EN toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button style={langBtnStyle(showKo)} onClick={() => setShowKo(v => !v)}>KO</button>
          <button style={langBtnStyle(showTrans)} onClick={() => setShowTrans(v => !v)}>EN</button>
        </div>

        {/* Volume */}
        <button
          onClick={handlePlayAll}
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', color: isPlaying ? '#ef4444' : '#999999', flexShrink: 0 }}
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Sections */}
      {resolvedEpisode.sections.map(section => {
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
        if (section.type === 'crop-panel') {
          return <CropPanelSection key={section.id} section={section} />
        }
        return <PanelSection key={section.id} section={section} />
      })}
    </div>
  )
}
