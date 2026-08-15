'use client'

/**
 * WebtoonEpisodeExport — export-mode webtoon viewer
 *
 * Differences from WebtoonEpisode:
 *  - No header (back, KO/EN toggles, volume)
 *  - No challenge section, no paywall, no ExpressionPopup
 *  - Background: #f5f0eb (matches canvas aesthetic)
 *  - English translation appears BELOW each bubble (not inside)
 *  - data-gap="true" on every gap container (for Playwright cut-point detection)
 *  - data-bubble="true" on every bubble wrapper (for overlap detection)
 *  - Static — no state, just renders immediately
 *  - Last panel: expression summary + CTA
 */

import React, { useMemo } from 'react'
import type {
  WebtoonEpisodeData,
  WebtoonBubble,
  WebtoonGapSection,
  WebtoonPanelSection,
  WebtoonCropSection,
  WebtoonSection,
} from '@/data/kpatto/webtoon-types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleSvg } from './BubbleSvg'

// ── Bubble meta helper ────────────────────────────────────────────────────────
type BubbleKey = keyof typeof bubblesData

function getBubbleMeta(key: string) {
  return bubblesData[key as BubbleKey] as {
    src: string
    viewBox: string
    label: string
    flipY?: boolean
    bodyOnly?: boolean
    thought?: boolean
    ovalParams?: { cx: number; cy: number; rx: number; ry: number }
    safeArea: { left: number; top: number; right: number; bottom: number }
  }
}

// Compute where the English text should sit (% of gap container height)
function enTextTopPct(
  bubble: WebtoonBubble,
  section: WebtoonGapSection,
): number {
  const meta = getBubbleMeta(bubble.bubbleKey)
  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2]
  const viewBoxH = vbParts[3]
  const aspectRatio = viewBoxH / viewBoxW
  const heightScale = (bubble as { heightScale?: number }).heightScale ?? 1

  const containerW = 430  // viewport width (CSS px)

  if (section.fixedHeightPx != null) {
    // singleColumn / fixed-height gap: percentage of fixedHeightPx
    const bubbleHeightPx = (bubble.widthPct / 100) * containerW * aspectRatio * heightScale
    return bubble.yPct + (bubbleHeightPx / section.fixedHeightPx) * 100 + 2
  }

  // Legacy / ratio gap: heightRatio-based
  const bubbleHeightAsFrac = (bubble.widthPct / 100) * aspectRatio * heightScale / section.heightRatio
  return bubble.yPct + bubbleHeightAsFrac * 100 + 2
}

// ── Highlight helper ──────────────────────────────────────────────────────────
// Export용: 클릭 없음 — expressionId는 무시하고 text만 사용
function renderKorean(text: string, highlights?: Array<{ text: string; expressionId: number }>): React.ReactNode {
  if (!highlights?.length) return text

  const candidates: { start: number; end: number }[] = []
  for (const hl of highlights) {
    if (!hl?.text) continue
    const idx = text.indexOf(hl.text)
    if (idx !== -1) candidates.push({ start: idx, end: idx + hl.text.length })
  }
  if (!candidates.length) return text

  candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start))
  const kept: { start: number; end: number }[] = []
  for (const c of candidates) {
    if (!kept.some(k => c.start < k.end && c.end > k.start)) kept.push(c)
  }
  kept.sort((a, b) => a.start - b.start)

  const nodes: React.ReactNode[] = []
  let cursor = 0
  for (const { start, end } of kept) {
    if (cursor < start) nodes.push(text.slice(cursor, start))
    nodes.push(
      <span key={start} style={{
        color: '#D4873A', fontWeight: 800,
        textDecorationLine: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px',
      }}>
        {text.slice(start, end)}
      </span>
    )
    cursor = end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))

  return <>{nodes}</>
}

// ── Single bubble (export mode) ───────────────────────────────────────────────
function ExportBubble({ bubble, section }: {
  bubble: WebtoonBubble
  section: WebtoonGapSection
}) {
  const meta = getBubbleMeta(bubble.bubbleKey)
  const sa = meta.safeArea
  const isBodyOnly = !!meta.bodyOnly && !!meta.ovalParams
  const vbParts = meta.viewBox.split(' ').map(Number)
  const viewBoxW = vbParts[2]
  const viewBoxH = vbParts[3]
  const heightScale = (bubble as { heightScale?: number }).heightScale ?? 1

  const lines = bubble.lines ?? 1
  const koFontSize = lines === 1 ? 'clamp(16px,5.0vw,22px)' : lines === 2 ? 'clamp(15px,4.6vw,20px)' : 'clamp(14px,4.2vw,18px)'

  const enTop = enTextTopPct(bubble, section)

  const isFocus = !!bubble.expression_id

  const textOverlay = (
    <div style={{
      position: 'absolute',
      left:   `${sa.left   * 100}%`,
      top:    `${sa.top    * 100}%`,
      right:  `${sa.right  * 100}%`,
      bottom: `${sa.bottom * 100}%`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: '0.3em',
      overflow: 'hidden', padding: '0 2px',
    }}>
      <div style={{
        fontSize: koFontSize, fontWeight: 700, color: '#1a1a1a',
        lineHeight: 1.35, whiteSpace: 'pre-line', letterSpacing: '-0.01em',
      }}>
        {renderKorean(bubble.korean, isFocus ? bubble.highlight_text : undefined)}
      </div>
    </div>
  )

  return (
    <>
      {/* Bubble shape + Korean text */}
      <div
        data-bubble="true"
        style={{
          position: 'absolute',
          left: `${bubble.xPct}%`,
          top: `${bubble.yPct}%`,
          width: `${bubble.widthPct}%`,
          transform: bubble.rotation ? `rotate(${bubble.rotation}deg)` : undefined,
          overflow: 'visible',
          filter: isFocus
            ? 'drop-shadow(0 0 5px rgba(212,135,58,0.85)) drop-shadow(0 0 10px rgba(212,135,58,0.4))'
            : undefined,
        }}
      >
        {isBodyOnly && meta.ovalParams ? (
          <div style={{
            position: 'relative',
            paddingBottom: `${(viewBoxH / viewBoxW) * heightScale * 100}%`,
            overflow: 'visible',
          }}>
            <BubbleSvg
              viewBoxW={viewBoxW}
              viewBoxH={viewBoxH}
              oval={meta.ovalParams}
              tail={bubble.tail}
              flip={bubble.flip}
              flipY={meta.flipY}
              highlighted={isFocus}
              thought={meta.thought}
            />
            {textOverlay}
          </div>
        ) : (
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

      {/* English translation — below the bubble */}
      {bubble.translation && (
        <div style={{
          position: 'absolute',
          left: `${bubble.xPct}%`,
          top: `${enTop}%`,
          width: `${bubble.widthPct}%`,
          textAlign: 'center',
          fontSize: 'clamp(10px, 2.6vw, 12px)',
          color: '#6b6560',
          lineHeight: 1.35,
          fontWeight: 400,
          pointerEvents: 'none',
        }}>
          {bubble.translation}
        </div>
      )}
    </>
  )
}

// ── Gap section ───────────────────────────────────────────────────────────────
function ExportGap({ section }: { section: WebtoonGapSection }) {
  const style: React.CSSProperties =
    section.fixedHeightPx != null
      ? { height: section.fixedHeightPx }
      : { paddingBottom: `${section.heightRatio * 100}%` }

  return (
    <div
      data-gap="true"
      data-gap-ratio={section.heightRatio}
      data-gap-fixed={section.fixedHeightPx ?? undefined}
      style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        overflow: 'visible',
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {section.bubbles.map(b => (
          <ExportBubble key={b.id} bubble={b} section={section} />
        ))}
      </div>
    </div>
  )
}

// ── Panel section (export — identical to normal) ──────────────────────────────
function ExportPanel({ section }: { section: WebtoonPanelSection }) {
  const isWide = section.layout === 'wide'

  if (section.align != null || section.overlapPx != null || section.zIndex != null) {
    const justify = section.align === 'right' ? 'flex-end' : section.align === 'center' ? 'center' : 'flex-start'
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: justify, position: 'relative', zIndex: section.zIndex, marginTop: section.overlapPx }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.imageUrl} alt="" style={{ display: 'block', width: '73%', height: 'auto', ...(section.zIndex != null && section.zIndex >= 2 ? { boxShadow: '0 0 0 5px #f5f0eb' } : {}) }} />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: isWide ? 'center' : 'flex-start' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={section.imageUrl} alt={`컷 ${section.id}`} style={{ display: 'block', width: isWide ? '100%' : '78%', height: 'auto' }} />
    </div>
  )
}

// ── Crop panel ────────────────────────────────────────────────────────────────
function ExportCropPanel({ section }: { section: WebtoonCropSection }) {
  const { imageUrl, srcW, cropX, cropY, cropW, cropH } = section
  const pb       = (cropH / cropW) * 100
  const imgWidth = (srcW  / cropW) * 100
  const imgLeft  = -(cropX / cropW) * 100
  const imgTop   = -(cropY / cropW) * 100
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: `${pb}%`, overflow: 'hidden', background: '#f5f0eb' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" aria-hidden="true" style={{ position: 'absolute', width: `${imgWidth}%`, maxWidth: 'none', height: 'auto', left: `${imgLeft}%`, top: `${imgTop}%`, display: 'block', pointerEvents: 'none' }} />
    </div>
  )
}

// ── Section group helpers (same as WebtoonEpisode) ────────────────────────────
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
          i += 3; continue
        }
      }
      const splitPanels: WebtoonPanelSection[] = [s]
      i++
      while (i < sections.length) {
        const ns = sections[i]
        if (ns.type === 'panel' && ns.layout.startsWith('split:')) { splitPanels.push(ns); i++ }
        else break
      }
      result.push({ kind: 'split', panels: splitPanels })
      continue
    }
    result.push({ kind: 'single', section: s })
    i++
  }
  return result
}

// ── Summary panel (last) ──────────────────────────────────────────────────────
function SummaryPanel({ exprs, siteUrl, epLabel }: {
  exprs: { korean: string; english: string }[]
  siteUrl: string
  epLabel: string
}) {
  const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div style={{
      background: '#f5f0eb',
      padding: '80px 24px 100px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      minHeight: 800,
    }}>
      {/* Eyebrow */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9e9590', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>
        {epLabel} · Today&apos;s Expressions
      </div>

      {/* Expression cards */}
      {exprs.length > 0 && (
        <div style={{
          background: '#FFF8F0',
          borderRadius: 16,
          padding: '24px 28px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 48,
        }}>
          {exprs.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', flexShrink: 0 }}>
                {e.korean}
              </span>
              <span style={{ fontSize: 14, color: '#7a7068', fontWeight: 400 }}>
                {e.english}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 22, color: '#6b5c4e' }}>🔊</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#7a7068', letterSpacing: '0.01em' }}>
          Hear how they sound
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 13, fontWeight: 700, color: '#D4873A',
          letterSpacing: '0.03em', textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}>
          {domain}
        </div>
      </div>
    </div>
  )
}

// ── Main exported component ───────────────────────────────────────────────────
export function WebtoonEpisodeExport({
  episode,
  focusExprs,
  siteUrl,
  epLabel,
}: {
  episode: WebtoonEpisodeData
  focusExprs: { korean: string; english: string }[]
  siteUrl: string
  epLabel: string
}) {
  const groups = useMemo(() => groupSections(episode.sections), [episode.sections])

  return (
    <>
      {/* Disable all animations/transitions for clean capture */}
      <style>{`
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
          animation-delay: 0s !important;
        }
      `}</style>

      <div
        data-export-mode="true"
        style={{
          width: '100%',
          maxWidth: 430,
          margin: '0 auto',
          background: '#f5f0eb',
        }}
      >
        {/* Top gap (gap-top: 100px) */}
        <div style={{ height: 100, background: '#f5f0eb' }} />

        {/* Episode sections */}
        {groups.map((group, gi) => {
          if (group.kind === 'split') {
            return (
              <div key={`sg-${gi}`} style={{ display: 'flex', width: '100%' }}>
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

          if (group.kind === 'stack') {
            const leftW  = parseFloat(group.left.layout.replace('split:', ''))
            const rightW = parseFloat(group.rightTop.layout.replace('stack-t:', ''))
            return (
              <div key={`sk-${gi}`} style={{ display: 'flex', width: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={group.left.imageUrl}         alt="" style={{ width: `${leftW}%`,  height: 'auto', display: 'block' }} />
                <div style={{ width: `${rightW}%`, display: 'flex', flexDirection: 'column' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={group.rightTop.imageUrl}    alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={group.rightBottom.imageUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </div>
            )
          }

          const section = group.section
          if (section.type === 'gap')        return <ExportGap     key={section.id} section={section} />
          if (section.type === 'panel')      return <ExportPanel   key={section.id} section={section} />
          if (section.type === 'crop-panel') return <ExportCropPanel key={section.id} section={section} />
          return null
        })}

        {/* Bottom gap */}
        <div style={{ height: 100, background: '#f5f0eb' }} />

        {/* Summary / CTA panel */}
        <SummaryPanel exprs={focusExprs} siteUrl={siteUrl} epLabel={epLabel} />
      </div>
    </>
  )
}
