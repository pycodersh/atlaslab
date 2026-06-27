'use client'

/**
 * StoryImageSlider
 *
 * Story Viewer 상단 이미지 슬라이더.
 * - status: 'ready'   → 이미지 + Ken Burns + Cross Fade
 * - status: 'missing' → 랜덤 fallback 없이 branded placeholder
 * - 자동 재생 (durationSec 또는 interval 기준)
 * - 좌우 화살표 + 인디케이터 도트
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StorySlideImage } from '@/types/magazine'

type Props = {
  images: StorySlideImage[]
  interval?: number             // 기본 슬라이드 간격(초)
  kenBurns?: boolean
  audioButton?: React.ReactNode
}

export function StoryImageSlider({
  images,
  interval = 8,
  kenBurns = true,
  audioButton,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    const current = images[0]  // re-calculated inside interval via closure on idx
    timerRef.current = setInterval(() => {
      setCurrentIdx(prev => {
        const next = (prev + 1) % images.length
        return next
      })
    }, interval * 1000)
  }, [stopTimer, interval, images.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (images.length > 1) startTimer()
    return stopTimer
  }, [startTimer, stopTimer, images.length])

  function go(nextIdx: number) {
    setCurrentIdx(nextIdx)
    if (images.length > 1) startTimer()
  }

  const goNext = () => go((currentIdx + 1) % images.length)
  const goPrev = () => go((currentIdx - 1 + images.length) % images.length)

  if (!images.length) return null

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-7 shadow-sm">

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
              /* Placeholder — Story와 무관한 랜덤 이미지 절대 사용 안 함 */
              <PlaceholderSlide
                index={i}
                total={images.length}
                alt={img.alt}
                isGenerating={img.status === 'generating'}
              />
            ) : (
              <>
                {/* 정적 배경 */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${img.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Ken Burns — 활성 시마다 새로 마운트 → 애니메이션 재시작 */}
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

// ── Placeholder — status: 'missing' or 'generating' ───────────────────────────

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
      {/* 미묘한 격자 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 23px,var(--pt) 24px),' +
            'repeating-linear-gradient(90deg,transparent,transparent 23px,var(--pt) 24px)',
        }}
      />
      {/* 씬 번호 (우상단) */}
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
      {/* 장면 설명 (좌하단) */}
      <div className="relative px-4 pb-4">
        <p className="text-[var(--pm)] text-[11px] leading-relaxed">
          {alt}
        </p>
      </div>
    </div>
  )
}
