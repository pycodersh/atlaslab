'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Volume2 } from 'lucide-react'
import type { WebtoonEpisodeData, WebtoonBubble, WebtoonGapSection, WebtoonPanelSection, WebtoonCropSection, WebtoonSection } from '@/data/kpatto/webtoon-types'
import type { KPattoExpression } from '@/data/kpatto/types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleSvg } from './BubbleSvg'
import { playWithFallback, stopAllAudio } from '@/lib/kpatto/audio'
import { fetchExpression } from '@/lib/kpatto/fetch-episode'
import { ExpressionPopup } from './ExpressionPopup'

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

// ── Highlight helper ─────────────────────────────────────────────────────────
const KOREAN_RE = /[가-힣]/

function renderKorean(text: string, highlight?: string): React.ReactNode {
  if (!highlight) return text
  const idx = text.indexOf(highlight)
  if (idx === -1) return text
  // Reject mid-word partial match: if highlight has no space and the preceding
  // character is a Korean syllable, it's embedded inside another word.
  if (!highlight.includes(' ') && idx > 0 && KOREAN_RE.test(text[idx - 1])) return text
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: '#D4873A' }}>{highlight}</span>
      {text.slice(idx + highlight.length)}
    </>
  )
}

// ── Single speech bubble ─────────────────────────────────────────────────────
function WebtoonBubbleEl({
  bubble,
  showKo,
  showTrans,
  isActive,
  onHighlightTap,
}: {
  bubble: WebtoonBubble
  showKo: boolean
  showTrans: boolean
  isActive: boolean
  onHighlightTap?: (expressionId: number) => void
}) {
  const meta = getBubbleMeta(bubble.bubbleKey)
  const sa = meta.safeArea
  const isBodyOnly = !!meta.bodyOnly && !!meta.ovalParams
  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2]
  const viewBoxH = vbParts[3]

  const lines = bubble.lines ?? 1
  const koFontSize = lines === 1 ? 'clamp(16px,5.0vw,22px)' : lines === 2 ? 'clamp(15px,4.6vw,20px)' : 'clamp(14px,4.2vw,18px)'
  const trFontSize = 'clamp(11px,2.9vw,13px)'

  const tappable = !!(bubble.expression_id && onHighlightTap)

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
          {renderKorean(bubble.korean, tappable ? bubble.highlight_text : undefined)}
        </div>
      )}
      {showTrans && (
        <div style={{ fontSize: trFontSize, color: '#555', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
          {bubble.translation}
        </div>
      )}
    </div>
  )

  const heightScale = (bubble as { heightScale?: number }).heightScale ?? 1

  return (
    <div
      onClick={tappable ? () => onHighlightTap!(bubble.expression_id!) : undefined}
      style={{
        position: 'absolute',
        left: `${bubble.xPct}%`,
        top: `${bubble.yPct}%`,
        width: `${bubble.widthPct}%`,
        transform: bubble.rotation ? `rotate(${bubble.rotation}deg)` : undefined,
        overflow: 'visible',
        cursor: tappable ? 'pointer' : undefined,
        filter: isActive
          ? 'drop-shadow(0 0 6px #f59e0b) drop-shadow(0 0 12px rgba(245,158,11,0.5))'
          : tappable && !isBodyOnly
          ? 'drop-shadow(0 0 5px rgba(212,135,58,0.85)) drop-shadow(0 0 10px rgba(212,135,58,0.4))'
          : undefined,
        transition: 'filter 0.2s ease',
      }}
    >
      {isBodyOnly && meta.ovalParams ? (
        /* ── Merged body+tail: single SVG path ── */
        <div style={{ position: 'relative', paddingBottom: `${(viewBoxH / viewBoxW) * heightScale * 100}%`, overflow: 'visible' }}>
          <BubbleSvg
            viewBoxW={viewBoxW}
            viewBoxH={viewBoxH}
            oval={meta.ovalParams}
            tail={bubble.tail}
            flip={bubble.flip}
            flipY={meta.flipY}
            highlighted={tappable}
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
  onHighlightTap,
}: {
  section: WebtoonGapSection
  showKo: boolean
  showTrans: boolean
  playingId: string | null
  onHighlightTap?: (expressionId: number) => void
}) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 20,
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
            onHighlightTap={onHighlightTap}
          />
        ))}
      </div>
    </div>
  )
}

// ── Split / stack group helpers ───────────────────────────────────────────────
type SectionGroup =
  | { kind: 'single'; section: WebtoonSection }
  | { kind: 'split'; panels: WebtoonPanelSection[] }
  | { kind: 'stack'; left: WebtoonPanelSection; rightTop: WebtoonPanelSection; rightBottom: WebtoonPanelSection }

function groupSections(sections: WebtoonSection[]): SectionGroup[] {
  const result: SectionGroup[] = []
  let i = 0
  while (i < sections.length) {
    const s = sections[i]
    if (s.type === 'panel' && s.layout.startsWith('split:')) {
      const next = sections[i + 1]
      if (next && next.type === 'panel' && next.layout.startsWith('stack-t:')) {
        const nn = sections[i + 2]
        if (nn && nn.type === 'panel' && nn.layout === 'stack-b') {
          result.push({ kind: 'stack', left: s, rightTop: next, rightBottom: nn })
          i += 3
          continue
        }
      }
      const splitPanels: WebtoonPanelSection[] = [s]
      i++
      while (i < sections.length) {
        const ns = sections[i]
        if (ns.type === 'panel' && ns.layout.startsWith('split:')) {
          splitPanels.push(ns)
          i++
        } else break
      }
      result.push({ kind: 'split', panels: splitPanels })
      continue
    }
    result.push({ kind: 'single', section: s })
    i++
  }
  return result
}

function SplitGroup({ group }: { group: Exclude<SectionGroup, { kind: 'single' }> }) {
  if (group.kind === 'stack') {
    const leftW  = parseFloat(group.left.layout.replace('split:', ''))
    const rightW = parseFloat(group.rightTop.layout.replace('stack-t:', ''))
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={group.left.imageUrl} alt="" style={{ width: `${leftW}%`, height: 'auto', display: 'block' }} />
        <div style={{ width: `${rightW}%`, display: 'flex', flexDirection: 'column' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={group.rightTop.imageUrl}    alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={group.rightBottom.imageUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {group.panels.map(panel => {
        const w = parseFloat(panel.layout.replace('split:', ''))
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={panel.id} src={panel.imageUrl} alt="" style={{ width: `${w}%`, height: 'auto', display: 'block' }} />
        )
      })}
    </div>
  )
}

// ── Panel section ────────────────────────────────────────────────────────────
function PanelSection({ section }: { section: WebtoonPanelSection }) {
  const isWide = section.layout === 'wide'
  const isMedRight = section.layout === 'medium-right'
  const isSmallCenter = section.layout === 'small-center'

  if (isSmallCenter) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '70%', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.imageUrl}
            alt={`컷 ${section.id}`}
            style={{ display: 'block', width: '106%', maxWidth: 'none', height: 'auto' }}
          />
        </div>
      </div>
    )
  }

  if (section.layout === 'small-center-l') {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '80%', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.imageUrl}
            alt={`컷 ${section.id}`}
            style={{ display: 'block', width: '106%', maxWidth: 'none', height: 'auto', marginLeft: '-6%' }}
          />
        </div>
      </div>
    )
  }

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
  const { imageUrl, srcW, cropX, cropY, cropW, cropH } = section
  // All values are % of containerWidth — aspect ratio works out regardless of imageAspect
  const pb       = (cropH / cropW) * 100
  const imgWidth = (srcW  / cropW) * 100
  const imgLeft  = -(cropX / cropW) * 100
  const imgTop   = -(cropY / cropW) * 100

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: `${pb}%`, overflow: 'hidden', background: '#fff' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: `${imgWidth}%`,
          maxWidth: 'none',
          height: 'auto',
          left: `${imgLeft}%`,
          top: `${imgTop}%`,
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// ── Override merge helper ────────────────────────────────────────────────────
type OverrideMap = Record<string, {
  bubbleKey?: string; xPct?: number; yPct?: number; widthPct?: number; heightScale?: number
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
            bubbleKey:   o.bubbleKey   ?? b.bubbleKey,
            xPct:        o.xPct        ?? b.xPct,
            yPct:        o.yPct        ?? b.yPct,
            widthPct:    o.widthPct    ?? b.widthPct,
            heightScale: o.heightScale ?? (b as { heightScale?: number }).heightScale,
            tail:        o.tail        ?? b.tail,
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
  const [bubblesReady, setBubblesReady] = useState(false)
  const [activeExpression, setActiveExpression] = useState<KPattoExpression | null>(null)

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
      .finally(() => setBubblesReady(true))
  }, [episode])

  const allBubbles = useMemo(() => {
    const result: WebtoonBubble[] = []
    for (const s of resolvedEpisode.sections) {
      if (s.type === 'gap') result.push(...s.bubbles)
    }
    return result
  }, [resolvedEpisode])

  const stopRef = useRef(false)

  const handlePlayAll = useCallback(async () => {
    if (isPlaying) {
      stopRef.current = true
      stopAllAudio()
      setIsPlaying(false)
      setPlayingId(null)
      return
    }
    stopRef.current = false
    setIsPlaying(true)


    for (let i = 0; i < allBubbles.length; i++) {
      if (stopRef.current) break
      const b = allBubbles[i]
      setPlayingId(b.id)
      await playWithFallback(b.audio_url ?? null, b.korean)
    }

    setIsPlaying(false)
    setPlayingId(null)
  }, [isPlaying, allBubbles, episode.id])

  useEffect(() => () => { stopAllAudio() }, [])

  const handleHighlightTap = useCallback(async (expressionId: number) => {
    const expr = await fetchExpression(expressionId)
    if (expr) setActiveExpression(expr)
  }, [])

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
      <div style={{ opacity: bubblesReady ? 1 : 0, transition: bubblesReady ? 'opacity 0.3s' : 'none', visibility: bubblesReady ? 'visible' : 'hidden' }}>
      {groupSections(resolvedEpisode.sections).map((group, gi) => {
        if (group.kind !== 'single') {
          return <SplitGroup key={`sg-${gi}`} group={group} />
        }
        const section = group.section
        if (section.type === 'gap') {
          return (
            <GapSection
              key={section.id}
              section={section}
              showKo={showKo}
              showTrans={showTrans}
              playingId={playingId}
              onHighlightTap={handleHighlightTap}
            />
          )
        }
        if (section.type === 'crop-panel') {
          return <CropPanelSection key={section.id} section={section} />
        }
        return <PanelSection key={section.id} section={section} />
      })}
      </div>

      {activeExpression && (
        <ExpressionPopup
          expression={activeExpression}
          onClose={() => setActiveExpression(null)}
        />
      )}
    </div>
  )
}
