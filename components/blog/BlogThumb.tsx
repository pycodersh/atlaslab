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
 * portrait(쇼츠)일 때 중앙 크롭을 하는 이유:
 * 유튜브는 9:16 쇼츠의 썸네일도 1280x720(16:9)으로 만들면서 좌우를 흐린 확대본으로
 * 채운다. 실측 결과 실제 영상은 x=438..842, 폭 405px(=31.6%) 중앙에만 있다.
 * 원본도 16:9, 카드도 16:9 라서 object-fit:cover 로는 아무것도 잘리지 않는다.
 * 그래서 1280/405 ≈ 3.16배로 키워 중앙만 보이게 한다(.bthumb--portrait).
 *
 * next/image 를 쓰지 않는 이유: 블로그 본문이 이미 일반 <img> 로 렌더링하고 있고,
 * img.youtube.com 을 next.config 의 remotePatterns 에 추가하는 설정 변경을 피한다.
 */
export function BlogThumb({
  videoId,
  alt,
  portrait = true,
}: {
  videoId: string
  alt: string
  /** 쇼츠(9:16)면 true — 중앙 크롭한다. 가로 영상이면 false 로 두어 그대로 채운다. */
  portrait?: boolean
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0)

  if (step === 2) return null

  const src =
    step === 0
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="bthumb-wrap">
      <img
        className={portrait ? 'bthumb bthumb--portrait' : 'bthumb'}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setStep(s => (s === 0 ? 1 : 2))}
      />
    </div>
  )
}
