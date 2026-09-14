'use client'

import { useState } from 'react'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

/**
 * 블로그 카드 썸네일 — 홈 섹션과 /blog 목록이 같이 쓴다.
 *
 * 스타일을 전부 인라인으로 두는 이유: 두 페이지가 각자 <style> 블록을 갖고 있어
 * 클래스 기반으로 두면 한쪽에만 규칙이 생기는 사고가 난다. 컴포넌트가 자기 모양을
 * 들고 다니면 어디에 놓아도 같게 보인다.
 *
 * 유튜브 썸네일 중앙 크롭:
 * 유튜브는 9:16 쇼츠의 썸네일도 1280x720(16:9)으로 만들면서 좌우를 흐린 확대본으로
 * 채운다. 실측하면 실제 영상은 x=438..842, 폭 405px(31.6%) 중앙에만 있다.
 * 원본도 카드도 16:9 라 object-fit:cover 로는 아무것도 잘리지 않으므로,
 * 1280/405 ≈ 3.16배(여유 포함 318%)로 키워 중앙만 보이게 한다.
 * 전역 img{max-width:100%} 가 확대를 되돌리므로 maxWidth:'none' 이 필요하다.
 *
 * next/image 를 쓰지 않는 이유: 블로그 본문이 이미 일반 <img> 로 렌더링하고 있고,
 * 외부 호스트를 next.config 의 remotePatterns 에 추가하는 설정 변경을 피한다.
 */
export function BlogThumb({ thumb, alt }: { thumb: BlogThumbnail | null; alt: string }) {
  // 0=1차 소스, 1=폴백(유튜브만), 2=숨김
  const [step, setStep] = useState<0 | 1 | 2>(0)

  if (!thumb || step === 2) return null

  const isYouTube = thumb.kind === 'youtube'
  const portraitCrop = isYouTube && thumb.portrait

  const src = isYouTube
    ? `https://img.youtube.com/vi/${thumb.videoId}/${step === 0 ? 'maxresdefault' : 'hqdefault'}.jpg`
    : thumb.src

  // 유튜브는 maxres → hq → 숨김, 본문 이미지는 실패하면 바로 숨김
  const handleError = () => setStep(s => (isYouTube && s === 0 ? 1 : 2))

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#E5E3E0',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleError}
        style={
          portraitCrop
            ? {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '318%',
                height: 'auto',
                maxWidth: 'none',
              }
            : {
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }
        }
      />
    </div>
  )
}
