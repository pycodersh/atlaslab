'use client'

/**
 * StoryImageSlider
 *
 * 슬라이드 전환 우선순위:
 *   1. TTS 활성 중  → activeParagraphId 기준으로 자동 전환 (linkedParagraphIds 매핑)
 *   2. TTS 비활성   → interval초마다 자동 타이머 전환
 *   3. 수동 화살표/도트 → 언제든지 즉시 전환 (타이머 리셋)
 *
 * status: 'missing'/'generating' → 랜덤 이미지 fallback 없이 PlaceholderSlide 표시
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StorySlideImage } from '@/types/magazine'

type Props = {
  images: StorySlideImage[]
  interval?: number              // 자동 타이머 간격(초), 기본 8
  kenBurns?: boolean
  audioButton?: React.ReactNode
  activeParagraphId?: string | null   // TTS 현재 문단 ID
  isTTSActive?: boolean               // TTS 재생 중 여부
}

export function StoryImageSlider({
  images,
  interval = 8,
  kenBurns = true,
  audioButton,
  activeParagraphId,
  isTTSActive = false,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // TTS가 한 번이라도 재생되면 auto-timer를 다시 켜지 않는다 (마지막 Scene 유지)
  const ttsHasPlayedRef = useRef(false)

  // ── 자동 타이머 ─────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % images.length)
    }, interval * 1000)
  }, [stopTimer, interval, images.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // TTS 활성 → 타이머 중단 / 비활성 → TTS를 한 번도 안 썼을 때만 타이머 재시작
  useEffect(() => {
    if (isTTSActive) {
      ttsHasPlayedRef.current = true
      stopTimer()
    } else {
      if (!ttsHasPlayedRef.current && images.length > 1) startTimer()
    }
    return stopTimer
  }, [isTTSActive, startTimer, stopTimer, images.length])

  // ── TTS 문단 → 슬라이드 매핑 ────────────────────────────────────────────
  const ttsMappedIdx = useMemo(() => {
    if (!isTTSActive || !activeParagraphId) return -1
    for (let i = 0; i < images.length; i++) {
      if (images[i].linkedParagraphIds?.includes(activeParagraphId)) return i
    }
    return -1
  }, [activeParagraphId, isTTSActive, images])

  useEffect(() => {
    if (ttsMappedIdx >= 0 && ttsMappedIdx !== currentIdx) {
      setCurrentIdx(ttsMappedIdx)
    }
  }, [ttsMappedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 수동 이동 ─────────────────────────────────────────────────────────
  function go(nextIdx: number) {
    setCurrentIdx(nextIdx)
    // 수동 이동 후 TTS 비활성이면 타이머 리셋
    if (!isTTSActive && images.length > 1) startTimer()
  }

  const goNext = () => go((currentIdx + 1) % images.length)
  const goPrev = () => go((currentIdx - 1 + images.length) % images.length)

  if (!images.length) return null

  return (
    <div className="relative w-full rounded-xl overflow-hidden mb-7 shadow-sm" style={{ height: '13.8rem' }}>

      {/* 이미지 레이어 */}
      {images.map((img, i) => {
        const isActive = i === currentIdx
        const isMissing = img.status === 'missing' || img.status === 'generating'

        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
          >
            {isMissing ? (
              <PlaceholderSlide
                index={i}
                total={images.length}
                alt={img.alt}
                isGenerating={img.status === 'generating'}
              />
            ) : (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${img.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {isActive && kenBurns && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${img.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      animation: `pattoKenBurns ${interval + 3}s ease-out forwards`,
                    }}
                  />
                )}
              </>
            )}
          </div>
        )
      })}

      {/* 하단 그라데이션 */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
        style={{ zIndex: 2 }}
      />

      {/* TTS 활성 표시 — 좌상단 작은 인디케이터 */}
      {isTTSActive && (
        <div
          className="absolute top-2.5 left-3 flex items-center gap-1"
          style={{ zIndex: 3 }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-[var(--pa)] animate-pulse" />
          <span className="text-[8px] font-mono text-white/70 tracking-widest">TTS</span>
        </div>
      )}

      {/* 오디오 버튼 슬롯 */}
      {audioButton && (
        <div className="absolute bottom-3 right-3" style={{ zIndex: 3 }}>
          {audioButton}
        </div>
      )}

      {/* 인디케이터 도트 */}
      {images.length > 1 && (
        <div
          className="absolute bottom-3 flex items-center gap-1.5"
          style={{ zIndex: 3, left: '50%', transform: 'translateX(-50%)' }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`이미지 ${i + 1}`}
              onClick={() => go(i)}
              className={[
                'block rounded-full transition-all duration-300 cursor-pointer',
                i === currentIdx
                  ? 'bg-white h-1.5 w-3'
                  : 'bg-white/50 h-1.5 w-1.5 hover:bg-white/75',
              ].join(' ')}
            />
          ))}
        </div>
      )}

      {/* 좌우 화살표 */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 text-white/80 flex items-center justify-center cursor-pointer hover:bg-black/38 transition-colors"
            style={{ zIndex: 3 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 text-white/80 flex items-center justify-center cursor-pointer hover:bg-black/38 transition-colors"
            style={{ zIndex: 3 }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}

// ── Placeholder ─────────────────────────────────────────────────────────────

function PlaceholderSlide({
  index,
  total,
  alt,
  isGenerating,
}: {
  index: number
  total: number
  alt: string
  isGenerating: boolean
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-br from-[var(--pc)] via-[var(--pc2)] to-[var(--pd)]">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 23px,var(--pt) 24px),' +
            'repeating-linear-gradient(90deg,transparent,transparent 23px,var(--pt) 24px)',
        }}
      />
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <span className="text-[8px] font-mono tracking-[0.2em] text-[var(--pm2)]">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        {isGenerating && (
          <span className="text-[7px] font-mono text-[var(--pa)] tracking-wider animate-pulse">
            · GEN
          </span>
        )}
      </div>
      <div className="relative px-4 pb-4">
        <p className="text-[var(--pm)] text-[11px] leading-relaxed">{alt}</p>
      </div>
    </div>
  )
}
