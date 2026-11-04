'use client'

/**
 * '너 vs 당신' 12초 쇼트 — Basics 글 korean-never-say-dangsin-neo 본문 맨 위에서 <DangerPronounsVideo /> 로 부른다.
 *
 * 영상 자체는 remotion/KoreanBasic/DangerPronounsVideo 이고, 여기서는 브라우저에서 그대로 재생만 한다(MP4 를 따로 올리지 않는다).
 * 소리가 없어 자동 재생 · 반복이 막히지 않는다.
 */
import { Player } from '@remotion/player'
import { DangerPronounsVideo, DANGER_PRONOUNS } from '@/remotion/KoreanBasic/DangerPronounsVideo'

export function DangerPronounsPlayer() {
  return (
    <div
      translate="no"
      style={{ margin: '0 0 2rem', borderRadius: 16, overflow: 'hidden', border: '1px solid #E7E5E4', background: '#FAF8F5' }}
    >
      <Player
        component={DangerPronounsVideo}
        compositionWidth={DANGER_PRONOUNS.width}
        compositionHeight={DANGER_PRONOUNS.height}
        durationInFrames={DANGER_PRONOUNS.durationInFrames}
        fps={DANGER_PRONOUNS.fps}
        style={{ width: '100%', aspectRatio: '16 / 9' }}
        autoPlay
        loop
        controls
        clickToPlay
      />
    </div>
  )
}
