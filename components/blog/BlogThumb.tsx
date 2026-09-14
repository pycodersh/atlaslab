'use client'

import { useState } from 'react'

/**
 * 홈 블로그 카드용 유튜브 썸네일.
 *
 * maxresdefault → hqdefault → 숨김 순으로 폴백한다.
 * maxresdefault 는 모든 영상에 있는 게 아니라서(특히 오래된 영상) 폴백이 필요하고,
 * hqdefault 는 사실상 항상 존재하지만 그마저 실패하면 이미지 영역을 통째로 지운다
 * (자리표시자 박스를 남기지 않는다).
 *
 * next/image 를 쓰지 않는 이유: 블로그 본문이 이미 일반 <img> 로 렌더링하고 있고,
 * img.youtube.com 을 next.config 의 remotePatterns 에 추가하는 설정 변경을 피한다.
 */
export function BlogThumb({ videoId, alt }: { videoId: string; alt: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0)

  if (step === 2) return null

  const src =
    step === 0
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <img
      className="bthumb"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setStep(s => (s === 0 ? 1 : 2))}
    />
  )
}
