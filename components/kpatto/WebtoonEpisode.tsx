'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Volume2, Pause, Play } from 'lucide-react'
import type { WebtoonEpisodeData, WebtoonBubble, WebtoonGapSection, WebtoonPanelSection, WebtoonCropSection, WebtoonSection } from '@/data/kpatto/webtoon-types'
import type { KPattoExpression } from '@/data/kpatto/types'
import bubblesData from '@/public/assets/bubbles/bubbles.json'
import { BubbleSvg } from './BubbleSvg'
import { tryPlayAudio, stopAllAudio, setAudioStopListener, getAudioGeneration, pauseAudio, resumeAudio, getPlaybackRate, setPlaybackRate, PLAYBACK_RATES, type PlaybackRate } from '@/lib/kpatto/audio'
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

function renderKorean(
  text: string,
  highlights?: Array<{ text: string; expressionId: number }>,
  onSpanTap?: (expressionId: number) => void,
): React.ReactNode {
  // 하이라이트 없거나 빈 배열 — 원문 그대로 반환 (문자열 변형 없음)
  if (!highlights?.length) return text

  // 각 하이라이트의 첫 번째 일치 위치 수집 (expressionId 보존)
  type HlCandidate = { start: number; end: number; expressionId: number }
  const candidates: HlCandidate[] = []
  for (const hl of highlights) {
    if (!hl?.text) continue
    const idx = text.indexOf(hl.text)
    if (idx !== -1) candidates.push({ start: idx, end: idx + hl.text.length, expressionId: hl.expressionId })
  }
  if (!candidates.length) return text

  // 긴 것 우선 탐욕적 선택: 겹치는 짧은 것 제거
  candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start))
  const kept: HlCandidate[] = []
  for (const c of candidates) {
    if (!kept.some(k => c.start < k.end && c.end > k.start)) kept.push(c)
  }
  kept.sort((a, b) => a.start - b.start)

  // 원문 slice 기반 렌더링 — 자르고 이어 붙이지 않음, 공백 추가 없음
  const nodes: React.ReactNode[] = []
  let cursor = 0
  for (const { start, end, expressionId } of kept) {
    if (cursor < start) nodes.push(text.slice(cursor, start))
    nodes.push(
      <span
        key={start}
        onClick={onSpanTap ? (e) => { e.stopPropagation(); onSpanTap(expressionId) } : undefined}
        style={{
          color: '#FF5A36',
          fontWeight: 800,
          textDecorationLine: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
          // inline(기본)이므로 padding-top/bottom은 line-height에 영향 없음(시각적 확장만)
          // → 줄바꿈 위치 불변 보장; 터치 영역 확보
          padding: '3px 4px',
          cursor: onSpanTap ? 'pointer' : undefined,
        }}
      >
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
  onBubbleTap,
}: {
  bubble: WebtoonBubble
  showKo: boolean
  showTrans: boolean
  isActive: boolean
  onHighlightTap?: (expressionId: number) => void
  onBubbleTap?: (bubble: WebtoonBubble) => void
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
  // 말풍선 자체를 탭하면 그 대사만 재생(반복 탭 = 처음부터 다시). 하이라이트 표현은 자기 onClick 으로 팝업을 연다.
  const playable = !!(bubble.audio_url && onBubbleTap)
  const handleClick = playable
    ? () => onBubbleTap!(bubble)
    : tappable ? () => onHighlightTap!(bubble.expression_id!) : undefined

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
            tappable ? onHighlightTap : undefined,
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
      onClick={handleClick}
      role={playable ? 'button' : undefined}
      aria-label={playable ? `Play: ${bubble.korean}` : undefined}
      style={{
        position: 'absolute',
        left: `${bubble.xPct}%`,
        top: `${bubble.yPct}%`,
        width: `${bubble.widthPct}%`,
        transform: bubble.rotation ? `rotate(${bubble.rotation}deg)` : undefined,
        overflow: 'visible',
        cursor: handleClick ? 'pointer' : undefined,
        pointerEvents: handleClick ? 'auto' : 'none',
        WebkitTapHighlightColor: 'transparent',  // 회색 탭 상자 대신 재생 중 강조(아래 isActive)가 피드백
        filter: isActive
          ? 'drop-shadow(0 0 6px #f59e0b) drop-shadow(0 0 12px rgba(245,158,11,0.5))'
          : tappable && !isBodyOnly
          ? 'drop-shadow(0 0 5px rgba(255,90,54,0.85)) drop-shadow(0 0 10px rgba(255,90,54,0.4))'
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
  onBubbleTap,
  fixedHeight,
}: {
  section: WebtoonGapSection
  showKo: boolean
  showTrans: boolean
  playingId: string | null
  onHighlightTap?: (expressionId: number) => void
  onBubbleTap?: (bubble: WebtoonBubble) => void
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
            onBubbleTap={onBubbleTap}
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
  const [isPaused, setIsPaused] = useState(false)
  // 저장된 배속은 마운트 후 읽는다(서버 렌더와 첫 화면을 맞추려고 1.0x 로 시작)
  const [rate, setRate] = useState<PlaybackRate>(1)
  useEffect(() => { setRate(getPlaybackRate()) }, [])
  const cycleRate = useCallback(() => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate) + 1) % PLAYBACK_RATES.length]
    setPlaybackRate(next)
    setRate(next)
  }, [rate])
  const playIdxRef = useRef(0)
  const isPlayingRef = useRef(false)  // 연타 가드: state보다 먼저 갱신되는 동기 플래그
  const isPausedRef = useRef(false)   // 일시정지 중 — 재생 루프는 현재 대사에서 기다린다
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
  /** 말풍선 단독 재생 중인 bubbleId — 끊긴 전체 재생 루프가 뒤늦게 강조를 지우지 않게 한다 */
  const soloRef = useRef<string | null>(null)

  // ── 외부 정지 신호 수신 (챌린지 상호작용·팝업 음성 → 루프 중단) ─────────────
  useEffect(() => {
    setAudioStopListener(() => {
      stopRef.current = true
      isPlayingRef.current = false
      isPausedRef.current = false
      setIsPaused(false)
      // 단독 재생이 멈췄으면 강조도 끈다(새 단독 재생은 바로 다시 켠다)
      if (soloRef.current) {
        soloRef.current = null
        setPlayingId(null)
      }
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

  // ── 전체 재생 · 일시정지 · 이어듣기 ─────────────────────────────────────────
  // 재생 중 탭 → 그 자리에서 일시정지, 다시 탭 → 멈춘 지점부터 이어서.
  // 에피소드 이동 · 페이지 이탈은 stopAllAudio() 로 완전히 멈추고 첫 대사 0초로 돌린다.
  const handlePlayAll = useCallback(async () => {
    if (isPlayingRef.current) {
      if (isPausedRef.current) {
        isPausedRef.current = false
        setIsPaused(false)
        resumeAudio()  // 대사 사이에서 멈췄다면 재생 중인 음성이 없다 — 루프가 다음 대사로 이어간다
      } else {
        isPausedRef.current = true
        setIsPaused(true)
        pauseAudio()
      }
      return
    }
    // 연타 가드: ref를 동기적으로 먼저 세운 뒤 시작
    isPlayingRef.current = true
    isPausedRef.current = false
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
      // 대사 사이에서 일시정지됐다면 이어듣기를 누를 때까지 다음 대사를 시작하지 않는다
      while (isPausedRef.current && getAudioGeneration() === myGen && !stopRef.current) {
        await new Promise(r => setTimeout(r, 100))
      }
      if (getAudioGeneration() !== myGen || stopRef.current) break
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
    isPausedRef.current = false
    setIsPlaying(false)
    setIsPaused(false)
    if (!soloRef.current) setPlayingId(null)  // 말풍선 탭으로 끊긴 경우 그 말풍선 강조는 남긴다
  }, [allBubbles])  // isPlaying 제거 — isPlayingRef로 동기 가드

  // ── 말풍선 탭 → 그 대사만 단독 재생 ─────────────────────────────────────────
  // 전체 재생·다른 말풍선은 즉시 멈추고, 이 대사 하나만 현재 배속으로 재생한 뒤 끝난다.
  // 같은 말풍선을 다시 탭하면 처음부터 다시(쉐도잉). 전체 재생은 끊긴 대사부터 다시 이어 들을 수 있다.
  const handleBubbleTap = useCallback(async (b: WebtoonBubble) => {
    if (!b.audio_url) return
    stopAllAudio()  // 전체 재생 루프·이전 단독 재생 모두 종료(generation 증가)
    const myGen = getAudioGeneration()
    soloRef.current = b.id
    setPlayingId(b.id)
    onBubblePlay?.(b.id)
    await tryPlayAudio(b.audio_url)
    // 끝까지 들었거나 로드 실패 — 그 사이 다른 탭·정지가 없었을 때만 강조를 끈다
    if (getAudioGeneration() === myGen && soloRef.current === b.id) {
      soloRef.current = null
      setPlayingId(null)
    }
  }, [onBubblePlay])

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

        {/* Volume — only shown when episode has audio. 재생 중엔 일시정지, 일시정지 중엔 이어듣기 아이콘 */}
        {/* Playback speed — 1.0x → 0.85x → 0.75x 순환, 느린 배속일 때 강조 */}
        {hasAudio && (
          <button
            onClick={cycleRate}
            aria-label={`재생 속도 ${rate === 1 ? '1.0' : rate}배 — 눌러서 바꾸기`}
            title="Playback speed"
            style={{
              ...langBtnStyle(rate !== 1),
              background: rate !== 1 ? '#EF4444' : '#F2F2F2',
              color: rate !== 1 ? '#FFFFFF' : '#666666',
              borderRadius: 999,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {rate === 1 ? '1.0x' : rate === 0.75 ? '0.75x Slow' : `${rate}x`}
          </button>
        )}

        {hasAudio && (
          <button
            onClick={handlePlayAll}
            aria-label={!isPlaying ? '대사 듣기' : isPaused ? '이어 듣기' : '일시정지'}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', color: isPlaying ? '#ef4444' : '#999999', flexShrink: 0 }}
          >
            {!isPlaying ? <Volume2 size={18} /> : isPaused ? <Play size={18} /> : <Pause size={18} />}
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
                onBubbleTap={handleBubbleTap}
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
