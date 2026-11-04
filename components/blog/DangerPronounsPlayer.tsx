'use client'

/**
 * '너 vs 당신' 12초 쇼트 — Basics 글 korean-never-say-dangsin-neo 본문 맨 위에서 <DangerPronounsVideo /> 로 부른다.
 *
 * 영상 자체는 remotion/KoreanBasic/DangerPronounsVideo 이고, 여기서는 브라우저에서 그대로 재생만 한다(MP4 를 따로 올리지 않는다).
 * 보이스오버가 있어 브라우저 자동 재생 정책상 음소거로 시작하고, 오른쪽 위 캡슐 버튼으로 소리를 켠다.
 * 소리를 켜면 나레이션을 처음부터 듣도록 0프레임으로 되돌린다. 컨트롤 바의 음량 버튼으로 바꿔도 캡슐이 따라간다.
 */
import { useEffect, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { DangerPronounsVideo, DANGER_PRONOUNS } from '@/remotion/KoreanBasic/DangerPronounsVideo'

export function DangerPronounsPlayer() {
  const ref = useRef<PlayerRef>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const p = ref.current
    if (!p) return
    const onMute = (e: { detail: { isMuted: boolean } }) => setMuted(e.detail.isMuted)
    p.addEventListener('mutechange', onMute)
    return () => p.removeEventListener('mutechange', onMute)
  }, [])

  const toggle = () => {
    const p = ref.current
    if (!p) return
    if (p.isMuted()) {
      p.unmute()
      p.seekTo(0)
      p.play()
    } else {
      p.mute()
    }
  }

  return (
    <div
      translate="no"
      style={{ position: 'relative', margin: '0 0 2rem', borderRadius: 16, overflow: 'hidden', border: '1px solid #E7E5E4', background: '#FAF8F5' }}
    >
      <Player
        ref={ref}
        component={DangerPronounsVideo}
        compositionWidth={DANGER_PRONOUNS.width}
        compositionHeight={DANGER_PRONOUNS.height}
        durationInFrames={DANGER_PRONOUNS.durationInFrames}
        fps={DANGER_PRONOUNS.fps}
        style={{ width: '100%', aspectRatio: '16 / 9' }}
        initiallyMuted
        autoPlay
        loop
        controls
        clickToPlay
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!muted}
        aria-label={muted ? 'Unmute narration' : 'Mute narration'}
        className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75"
      >
        {/* 폰 폭에서는 캡슐이 경고 자막을 가려 아이콘만 남긴다 */}
        {muted ? '🔇' : '🔊'}
        <span className="hidden sm:inline">{muted ? ' Tap to unmute' : ' Playing'}</span>
      </button>
    </div>
  )
}
