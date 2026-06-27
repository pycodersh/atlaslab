'use client'

/**
 * StoryImageSlider
 *
 * Story Viewer 상단 이미지 슬라이더.
 * - Cross Fade 전환 (CSS opacity transition)
 * - Ken Burns 효과 (CSS animation, 각 슬라이드 활성화 시 재시작)
 * - 자동 재생 (interval초마다)
 * - 좌우 화살표 + 인디케이터 도트
 * - audioButton prop: TTS 버튼 등 우하단 오버레이 슬롯
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StorySlideImage } from '@/types/magazine'

type Props = {
  images: StorySlideImage[]
  interval?: number             // 슬라이드 간격(초), 기본값 6
  audioButton?: React.ReactNode // 우하단 오버레이 슬롯 (TTS 버튼)
}

export function StoryImageSlider({ images, interval = 6, audioButton }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % images.length)
    }, interval * 1000)
  }, [stopTimer, interval, images.length])

  useEffect(() => {
    startTimer()
    return stopTimer
  }, [startTimer, stopTimer])

  function go(nextIdx: number) {
    setCurrentIdx(nextIdx)
    startTimer()
  }

  const goNext = () => go((currentIdx + 1) % images.length)
  const goPrev = () => go((currentIdx - 1 + images.length) % images.length)

  if (!images.length) return null

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-7 shadow-sm">

      {/* 이미지 레이어: 전체 렌더 + opacity 전환으로 Cross Fade 구현 */}
      {images.map((img, i) => {
        const isActive = i === currentIdx
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            {/* 정적 배경 (항상 렌더) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${img.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Ken Burns 오버레이 — 활성화될 때마다 새로 마운트되어 애니메이션 재시작 */}
            {isActive && (
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
          </div>
        )
      })}

      {/* 하단 그라데이션 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"
        style={{ zIndex: 2 }}
      />

      {/* 오디오 버튼 슬롯 (우하단) */}
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
