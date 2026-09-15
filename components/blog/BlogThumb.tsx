'use client'

import { useState } from 'react'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

/**
 * 블로그 카드 썸네일 — 홈 섹션과 /blog 목록이 같이 쓴다.
 *
 * 스타일은 app/globals.css 의 .blog-thumb* 에 있다. 두 페이지가 각자 <style>
 * 블록을 갖고 있어 거기에 두면 한쪽에만 규칙이 생기고, 호버 확대는 인라인
 * 스타일로 쓸 수 없어서 전역 CSS 한 곳으로 모았다.
 *
 * 유튜브 썸네일은 maxres → hq → 숨김 순으로 폴백한다.
 * 본문/대표 이미지는 실패하면 바로 숨긴다(자리표시자를 남기지 않는다).
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

  // 대표 이미지에 alt 가 지정돼 있으면 그것을, 없으면 글 제목을 쓴다
  const altText = !isYouTube && thumb.alt ? thumb.alt : alt

  // 유튜브는 maxres → hq → 숨김, 그 외는 실패하면 바로 숨김
  const handleError = () => setStep(s => (isYouTube && s === 0 ? 1 : 2))

  return (
    <div className={isYouTube ? 'blog-thumb blog-thumb--youtube' : 'blog-thumb'}>
      <img
        className={portraitCrop ? 'blog-thumb-img blog-thumb-img--portrait' : 'blog-thumb-img'}
        src={src}
        alt={altText}
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
    </div>
  )
}
