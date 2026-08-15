'use client'

/**
 * K-PATTO 표현 발음 재생 카드 (공용 클라이언트 컴포넌트)
 *
 * - lib/kpatto/audio.ts 의 tryPlayAudio / stopAllAudio 사용
 * - 재생 중 클릭 → 정지, 정지 중 클릭 → 재생
 * - 외부(팝업 열기, 대사 시작 등)에서 stopAllAudio() 호출 시 버튼 자동 복귀
 * - audio_urls.pattern(EP01~05) 또는 audio_url(EP06+) 중 resolvePatternUrl() 로 결정
 */

import { useState, useRef, useCallback } from 'react'
import { tryPlayAudio, stopAllAudio } from '@/lib/kpatto/audio'

const ACCENT = '#D4873A'

export function KPattoAudioPlayer({
  src,
  label,
}: {
  src: string | null
  label: string
}) {
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)

  const handleClick = useCallback(async () => {
    if (playingRef.current) {
      playingRef.current = false
      setPlaying(false)
      stopAllAudio()
      return
    }
    if (!src) return
    playingRef.current = true
    setPlaying(true)
    stopAllAudio()  // 대사 루프 등 다른 음성 정지
    await tryPlayAudio(src)
    // 자연 완료 또는 외부 stopAllAudio() 로 resolve 된 경우
    playingRef.current = false
    setPlaying(false)
  }, [src])

  if (!src) return null

  return (
    <div
      role="button"
      aria-label={playing ? 'Stop audio' : 'Play pronunciation'}
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', background: '#FFF4EA',
        borderRadius: 14, border: '1px solid #F5D9B4',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* 재생/일시정지 원형 버튼 */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: playing ? '#ef4444' : ACCENT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}>
        {playing ? (
          /* 일시정지 아이콘 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          /* 재생 아이콘 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: ACCENT,
          marginBottom: 2, letterSpacing: '0.04em',
        }}>
          PRONUNCIATION
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>
          {label}
        </div>
      </div>
    </div>
  )
}
