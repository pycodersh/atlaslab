'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Volume2 } from 'lucide-react'
import type { WebtoonEpisodeData, WebtoonBubble, WebtoonGapSection, WebtoonPanelSection, WebtoonCropSection, WebtoonSection } from '@/data/kpatto/webtoon-types'
import type { KPattoExpression } from '@/data/kpatto/types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleSvg } from './BubbleSvg'
import { tryPlayAudio, stopAllAudio, setAudioStopListener, getAudioGeneration } from '@/lib/kpatto/audio'
import { gapContainerStyle, panelImageWidth, panelJustify } from '@/lib/kpatto/webtoon-layout'
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
    thought?: boolean
    ovalParams?: { cx: number; cy: number; rx: number; ry: number }
    safeArea: { left: number; top: number; right: number; bottom: number }
  }
}

// ── Highlight helper ─────────────────────────────────────────────────────────

// ── Line-break helper (display only — never mutates kp_bubbles.korean) ────────
function applyLineBreaks(text: string, lineBreaks: number[]): string {
  if (!lineBreaks.length) return text
  const words = text.split(/\s+/)
  const breakSet = new Set(lineBreaks)
  let result = ''
  for (let i = 0; i < words.length; i++) {
    result += words[i]
    if (i < words.length - 1) result += breakSet.has(i + 1) ? '\n' : ' '
  }
  return result
}

function renderKorean(text: string, highlights?: string[]): React.ReactNode {
  // 하이라이트 없거나 빈 배열 — 원문 그대로 반환 (문자열 변형 없음)
  if (!highlights?.length) return text

  // 각 하이라이트의 첫 번째 일치 위치 수집
  const candidates: { start: number; end: number }[] = []
  for (const hl of highlights) {
    if (!hl) continue
    const idx = text.indexOf(hl)
    if (idx !== -1) candidates.push({ start: idx, end: idx + hl.length })
  }
  if (!candidates.length) return text

  // 긴 것 우선 탐욕적 선택: 겹치는 짧은 것 제거
  candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start))
  const kept: { start: number; end: number }[] = []
  for (const c of candidates) {
    if (!kept.some(k => c.start < k.end && c.end > k.start)) kept.push(c)
  }
  kept.sort((a, b) => a.start - b.start)

  // 원문 slice 기반 렌더링 — 자르고 이어 붙이지 않음, 공백 추가 없음
  const nodes: React.ReactNode[] = []
  let cursor = 0
  for (const { start, end } of kept) {
    if (cursor < start) nodes.push(text.slice(cursor, start))
    nodes.push(
      <span key={start} style={{ color: '#D4873A', fontWeight: 800, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>
        {text.slice(start, end)}
      </span>
    )
    cursor = end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))

  return <>{nodes}</>
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
          {renderKorean(
            bubble.lineBreaks?.length ? applyLineBreaks(bubble.korean, bubble.lineBreaks) : bubble.korean,
            tappable ? bubble.highlight_text : undefined,
          )}
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
        pointerEvents: tappable ? 'auto' : 'none',
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
            thought={meta.thought}
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
  fixedHeight,
}: {
  section: WebtoonGapSection
  showKo: boolean
  showTrans: boolean
  playingId: string | null
  onHighlightTap?: (expressionId: number) => void
  fixedHeight?: number
}) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        ...(fixedHeight != null
          ? { height: fixedHeight }
          : { paddingBottom: `${section.heightRatio * 100}%` }),
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
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

  if (section.align != null || section.overlapPx != null || section.zIndex != null) {
    const justify = section.align === 'right' ? 'flex-end' : section.align === 'center' ? 'center' : 'flex-start'
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: justify,
          position: 'relative',
          zIndex: section.zIndex,
          marginTop: section.overlapPx,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={section.imageUrl}
          alt={`컷 ${section.id}`}
          style={{
            display: 'block',
            width: '73%',
            height: 'auto',
            ...(section.zIndex != null && section.zIndex >= 2 ? { boxShadow: '0 0 0 5px #f5f0eb' } : {}),
          }}
        />
      </div>
    )
  }

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
  lineBreaks?: number[]
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
            lineBreaks:  o.lineBreaks  ?? b.lineBreaks,
          }
        }),
      }
    }),
  }
}

// ── Main exported component ──────────────────────────────────────────────────
export function WebtoonEpisode({ episode, episodeLabel, storyTitle, singleColumn, onBubblePlay, onExpressionAudioPlay }: {
  episode: WebtoonEpisodeData
  episodeLabel?: string
  storyTitle?: string
  singleColumn?: boolean
  /** 말풍선 음성 재생을 시작할 때 bubbleId를 전달 — Listening 판정에 사용 */
  onBubblePlay?: (bubbleId: string) => void
  /** 표현 팝업 음성 재생을 시작할 때 expressionId를 전달 — Listening 판정에 사용 */
  onExpressionAudioPlay?: (expressionId: number) => void
}) {
  const [showKo, setShowKo] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIdxRef = useRef(0)
  const isPlayingRef = useRef(false)  // 연타 가드: state보다 먼저 갱신되는 동기 플래그
  const [resolvedEpisode, setResolvedEpisode] = useState(episode)
  const [bubblesReady, setBubblesReady] = useState(false)
  const [activeExpression, setActiveExpression] = useState<KPattoExpression | null>(null)
  const [landscapeIds, setLandscapeIds] = useState<Set<string>>(new Set())
  const onPanelLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>, id: string) => {
    const img = e.currentTarget
    if (img.naturalWidth > img.naturalHeight) {
      setLandscapeIds(prev => {
        if (prev.has(id)) return prev
        const next = new Set(prev); next.add(id); return next
      })
    }
  }, [])

  // Load saved layout overrides and merge with base episode data
  useEffect(() => {
    fetch(`/api/kpatto/episode-layout?id=${episode.id}`)
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

  const hasAudio = useMemo(() => allBubbles.some(b => b.audio_url), [allBubbles])

  const stopRef = useRef(false)

  // ── 외부 정지 신호 수신 (챌린지 상호작용·팝업 음성 → 루프 중단) ─────────────
  useEffect(() => {
    setAudioStopListener(() => {
      stopRef.current = true
      isPlayingRef.current = false
      // setIsPlaying/setPlayingId 는 루프 종료 시 일괄 처리
    })
    return () => setAudioStopListener(null)
  }, [])

  // ── 에피소드 변경 → 정지 + 위치 리셋 ──────────────────────────────────────
  useEffect(() => {
    stopAllAudio()
    setIsPlaying(false)
    setPlayingId(null)
    playIdxRef.current = 0
  }, [episode.id])

  // ── visibilitychange + 언마운트 정리 ────────────────────────────────────────
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') {
        stopAllAudio()  // listener가 stopRef·isPlayingRef 처리
      }
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      stopAllAudio()          // 언마운트(페이지 이탈) 시 정지
      playIdxRef.current = 0  // 페이지 재진입 후 항상 첫 대사부터
    }
  }, [])

  // ── 전체 재생 / 이어듣기 ────────────────────────────────────────────────────
  const handlePlayAll = useCallback(async () => {
    if (isPlayingRef.current) {
      // 정지: 현재 인덱스는 playIdxRef에 보존 → 다음 재생 시 이어듣기
      isPlayingRef.current = false
      stopRef.current = true
      stopAllAudio()
      setIsPlaying(false)
      setPlayingId(null)
      return
    }
    // 연타 가드: ref를 동기적으로 먼저 세운 뒤 시작
    isPlayingRef.current = true
    stopRef.current = false
    setIsPlaying(true)
    // generation 캡처: stopAllAudio() 호출 시마다 증가 → 불일치 = 외부 정지
    // listener 등록 여부·cleanup 순서와 무관하게 확실히 루프 종료
    const myGen = getAudioGeneration()

    for (let i = playIdxRef.current; i < allBubbles.length; i++) {
      // 주 정지 판정: generation 불일치 (unmount·visibilitychange·팝업·챌린지)
      // 부 정지 판정: stopRef (스피커 버튼 재클릭)
      if (getAudioGeneration() !== myGen || stopRef.current) break
      const b = allBubbles[i]
      playIdxRef.current = i  // 현재 위치 기록 (정지 시 이 값부터 재개)
      setPlayingId(b.id)
      if (!b.audio_url) {
        console.log(`[kpatto] skip (no audio_url): ${b.id}`)
        continue
      }
      onBubblePlay?.(b.id)  // 재생 시작 알림 (Listening 판정)
      const ok = await tryPlayAudio(b.audio_url)
      // await 직후 재검사: await 중 stopAllAudio()가 호출됐을 수 있음
      if (getAudioGeneration() !== myGen) break
      if (!ok && !stopRef.current) {
        // 로드 실패 → 건너뛰고 다음 대사로 (UI 표시 없음)
        console.log(`[kpatto] skip (load error): ${b.id}`)
      }
    }

    // 자연 완료 조건: 외부 정지 없고 generation도 그대로
    if (!stopRef.current && getAudioGeneration() === myGen) {
      playIdxRef.current = 0  // 다음 재생은 처음부터
    }
    isPlayingRef.current = false
    setIsPlaying(false)
    setPlayingId(null)
  }, [allBubbles])  // isPlaying 제거 — isPlayingRef로 동기 가드

  // ── 하이라이트 팝업 ──────────────────────────────────────────────────────────
  const handleHighlightTap = useCallback(async (expressionId: number) => {
    // 팝업 열림 → 대사 재생 즉시 정지 (닫아도 자동 재개 안 함)
    stopAllAudio()
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

  // EP31+ (singleColumn): count trailing gap sections for outer-padding bottom calc
  let trailingGapPx = 0
  if (singleColumn) {
    const secs = resolvedEpisode.sections
    for (let i = secs.length - 1; i >= 0; i--) {
      if (secs[i].type === 'gap') trailingGapPx += 100
      else break
    }
  }

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
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {episodeLabel && storyTitle ? `${episodeLabel} · ${storyTitle}` : ''}
          </div>
          {episode.title_en && (
            <div style={{ fontSize: 11, color: '#999999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {episode.title_en}
            </div>
          )}
        </div>

        {/* KO / EN toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button style={langBtnStyle(showKo)} onClick={() => setShowKo(v => !v)}>KO</button>
          <button style={langBtnStyle(showTrans)} onClick={() => setShowTrans(v => !v)}>EN</button>
        </div>

        {/* Volume — only shown when episode has audio */}
        {hasAudio && (
          <button
            onClick={handlePlayAll}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', color: isPlaying ? '#ef4444' : '#999999', flexShrink: 0 }}
          >
            <Volume2 size={18} />
          </button>
        )}
      </div>

      {/* Sections */}
      {/* EP31+ (singleColumn): outer paddingTop/paddingBottom supplement the 100px gap-0 and trailing gaps  */}
      {/* to reach 88% total (≈378px @430px), matching EP01~30 visual standard.                            */}
      {/* EP01~30: paddingBottom mirrors first gap height so last bubble clears challenge card              */}
      <div style={{
        opacity: bubblesReady ? 1 : 0,
        transition: bubblesReady ? 'opacity 0.3s' : 'none',
        visibility: bubblesReady ? 'visible' : 'hidden',
        paddingTop: singleColumn ? 'calc(88% - 100px)' : undefined,
        paddingBottom: singleColumn
          ? ('calc(88% - ' + trailingGapPx + 'px)')
          : (() => {
              const firstGap = resolvedEpisode.sections.find(s => s.type === 'gap') as WebtoonGapSection | undefined
              return firstGap ? `${firstGap.heightRatio * 100}%` : 80
            })(),
      }}>
        {groupSections(resolvedEpisode.sections).map((group, gi) => {
          if (group.kind !== 'single') {
            if (singleColumn) {
              // EP31+: each panel → 73% wide, aligned by original position in group
              // 2-panel: first=left, last=right
              // 3-panel (split×3 or stack): first=left, middle=center, last=right
              const panels = group.kind === 'split'
                ? group.panels
                : [group.left, group.rightTop, group.rightBottom]
              return (
                <React.Fragment key={`sc-${gi}`}>
                  {panels.map((p, idx) => {
                    const isLandscape = landscapeIds.has(p.id)
                    const justify = isLandscape ? 'flex-start'
                      : idx === 0 ? 'flex-start'
                      : idx === panels.length - 1 ? 'flex-end'
                      : 'center'
                    return (
                      <React.Fragment key={p.id}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: justify }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imageUrl} alt="" style={{ width: isLandscape ? '100%' : '73%', height: 'auto', display: 'block' }} onLoad={(e) => onPanelLoad(e, p.id)} />
                        </div>
                        {idx < panels.length - 1 && (
                          <div style={{ height: 200 }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </React.Fragment>
              )
            }
            return <SplitGroup key={`sg-${gi}`} group={group} />
          }
          const section = group.section
          if (section.type === 'gap') {
            const gapSt = gapContainerStyle(section.heightRatio, section.bubbles.length > 0, singleColumn ?? false, section.fixedHeightPx)
            const fixedHeight = 'height' in gapSt ? (gapSt.height as number) : undefined
            return (
              <GapSection
                key={section.id}
                section={section}
                showKo={showKo}
                showTrans={showTrans}
                playingId={playingId}
                onHighlightTap={handleHighlightTap}
                fixedHeight={fixedHeight}
              />
            )
          }
          if (section.type === 'crop-panel') {
            return <CropPanelSection key={section.id} section={section} />
          }
          if (singleColumn && section.type === 'panel') {
            const isLandscape = landscapeIds.has(section.id)
            return (
              <div key={section.id} style={{ width: '100%', display: 'flex', justifyContent: isLandscape ? 'flex-start' : panelJustify(section.layout, true) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={section.imageUrl} alt="" style={{ width: isLandscape ? '100%' : panelImageWidth(section.layout, true), height: 'auto', display: 'block' }} onLoad={(e) => onPanelLoad(e, section.id)} />
              </div>
            )
          }
          return <PanelSection key={section.id} section={section} />
        })}
      </div>

      {activeExpression && (
        <ExpressionPopup
          expression={activeExpression}
          onClose={() => setActiveExpression(null)}
          onAudioPlay={onExpressionAudioPlay}
        />
      )}
    </div>
  )
}
