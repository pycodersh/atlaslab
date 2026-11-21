'use client'

/**
 * Basics 글 상단 쇼트 — 본문 맨 위에서 <KoreanBasicVideo slug="..." /> 로 부른다('너 vs 당신' 글은 <DangerPronounsVideo />).
 *
 * 영상은 remotion/KoreanBasic/TemplateVideo 에 videos.json 의 해당 slug 문구를 넣어 브라우저에서 그대로 재생한다(MP4 를 따로 올리지 않는다).
 *
 * 2026-11-21: 소리 켜짐이 기본이다. 자동 재생은 하지 않는다(브라우저는 소리 있는 자동 재생을 막는다) —
 * 재생 전에는 목록 썸네일 + 가운데 재생 버튼을 포스터로 보이고, 누르는 순간 소리와 함께 처음부터 재생한다.
 * 그래서 음소거 자동 재생을 풀어 주던 Sound 안내 알약은 뺐다.
 * 첫 재생에서 대사 첫 음절이 잘리던 문제는 컴포지션 쪽(TemplateVideoV2: 오디오 premountFor + 대사 앞 0.2초 무음)에서 막는다.
 * 없는 slug 면 아무것도 그리지 않는다 — 본문이 영상 하나 때문에 깨지지 않게.
 */
import { useCallback } from 'react'
import { Player, type RenderPoster } from '@remotion/player'
import { TemplateVideo, BASICS_VIDEO, videoLayout } from '@/remotion/KoreanBasic/TemplateVideo'
import { BASICS_VIDEOS } from '@/remotion/KoreanBasic/videos'

export function KoreanBasicPlayer({ slug }: { slug: string }) {
  const data = BASICS_VIDEOS[slug]
  const poster: RenderPoster = useCallback(
    () => (
      <div style={{ position: 'absolute', inset: 0, background: '#F7F5F2', cursor: 'pointer' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/blog/basics/${slug}--thumb.webp`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', left: '50%', top: '50%', width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: 999,
            background: 'rgba(17,17,17,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(17,17,17,0.18)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="#fff" /></svg>
        </div>
      </div>
    ),
    [slug],
  )
  if (!data) return null
  return (
    <div
      translate="no"
      style={{ position: 'relative', margin: '0 0 2rem', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E1DC', background: '#F7F5F2' }}
    >
      <Player
        component={TemplateVideo}
        inputProps={{ data }}
        compositionWidth={BASICS_VIDEO.width}
        compositionHeight={BASICS_VIDEO.height}
        durationInFrames={videoLayout(data).total}
        fps={BASICS_VIDEO.fps}
        style={{ width: '100%', aspectRatio: '16 / 9' }}
        controls
        clickToPlay
        loop
        renderPoster={poster}
        showPosterWhenUnplayed
        posterFillMode="player-size"
      />
    </div>
  )
}

/** 이미 DB 본문에 들어간 <DangerPronounsVideo /> 태그용 */
export function DangerPronounsPlayer() {
  return <KoreanBasicPlayer slug="korean-never-say-dangsin-neo" />
}
