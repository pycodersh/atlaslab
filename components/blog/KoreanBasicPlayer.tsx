'use client'

/**
 * Basics 글 상단 12초 쇼트 — 본문 맨 위에서 <KoreanBasicVideo slug="..." /> 로 부른다('너 vs 당신' 글은 <DangerPronounsVideo />).
 *
 * 영상은 remotion/KoreanBasic/TemplateVideo 에 videos.json 의 해당 slug 문구를 넣어 브라우저에서 그대로 재생한다(MP4 를 따로 올리지 않는다).
 * 보이스오버가 있어 브라우저 자동 재생 정책상 음소거로 시작하고, 소리는 컨트롤 바의 스피커 버튼으로 켠다.
 * 없는 slug 면 아무것도 그리지 않는다 — 본문이 영상 하나 때문에 깨지지 않게.
 */
import { Player } from '@remotion/player'
import { TemplateVideo, BASICS_VIDEO } from '@/remotion/KoreanBasic/TemplateVideo'
import { BASICS_VIDEOS } from '@/remotion/KoreanBasic/videos'

export function KoreanBasicPlayer({ slug }: { slug: string }) {
  const data = BASICS_VIDEOS[slug]
  if (!data) return null
  return (
    <div
      translate="no"
      style={{ margin: '0 0 2rem', borderRadius: 16, overflow: 'hidden', border: '1px solid #E7E5E4', background: '#FAF8F5' }}
    >
      <Player
        component={TemplateVideo}
        inputProps={{ data }}
        compositionWidth={BASICS_VIDEO.width}
        compositionHeight={BASICS_VIDEO.height}
        durationInFrames={BASICS_VIDEO.durationInFrames}
        fps={BASICS_VIDEO.fps}
        style={{ width: '100%', aspectRatio: '16 / 9' }}
        initiallyMuted
        autoPlay
        loop
        controls
        clickToPlay
      />
    </div>
  )
}

/** 이미 DB 본문에 들어간 <DangerPronounsVideo /> 태그용 */
export function DangerPronounsPlayer() {
  return <KoreanBasicPlayer slug="korean-never-say-dangsin-neo" />
}
