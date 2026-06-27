'use client'

import { useEffect, useRef, useState } from 'react'
import { MagazineEngine } from '@/components/MagazineEngine'
import { IntroVideoScreen } from '@/components/IntroVideoScreen'
import type { MagazineStory } from '@/types/magazine'

type Props = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
}

type Phase = 'gate' | 'show' | 'done'

const GATE_TIMEOUT_MS  = 3000   // 영상 준비 최대 대기 시간
const MIN_DURATION_SEC = 4      // 이 미만이면 Intro 생략

/**
 * Story 진입 흐름 관리.
 *
 * MagazineEngine은 항상 베이스로 렌더링.
 * IntroVideoScreen은 영상이 실제로 재생 가능할 때만 오버레이.
 *
 * 핵심: gateRef가 가리키는 <video>를 DOM에 숨겨서 렌더링해야
 * 브라우저(특히 모바일)에서 canplay 이벤트가 정상적으로 발생한다.
 * document.createElement로 만든 off-DOM video는 신뢰할 수 없음.
 */
export function StoryPageClient({ story, allStories, initialView = 'story' }: Props) {
  const intro    = story.introVideo
  const eligible = intro?.enabled === true && !!intro.url

  const [phase, setPhase] = useState<Phase>(eligible ? 'gate' : 'done')
  const gateRef    = useRef<HTMLVideoElement>(null)
  const settledRef = useRef(false)

  useEffect(() => {
    if (!eligible || !intro?.url) return

    const el = gateRef.current
    if (!el) return

    settledRef.current = false

    const settle = (show: boolean) => {
      if (settledRef.current) return
      settledRef.current = true
      clearTimeout(timer)
      el.pause()
      setPhase(show ? 'show' : 'done')
    }

    const timer = setTimeout(() => settle(false), GATE_TIMEOUT_MS)

    const onError   = () => settle(false)
    const tryPlay   = () => {
      const dur = el.duration
      if (!isNaN(dur) && dur < MIN_DURATION_SEC) { settle(false); return }
      el.play()
        .then(() => settle(true))
        .catch(() => settle(false))
    }
    const onCanPlay = () => tryPlay()

    el.addEventListener('error',   onError)
    el.addEventListener('canplay', onCanPlay)

    // 이미 canplay 상태라면 이벤트가 다시 오지 않으므로 즉시 처리
    // readyState 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
    if (el.readyState >= 3) {
      tryPlay()
    } else {
      el.load()
    }

    return () => {
      settledRef.current = true
      clearTimeout(timer)
      el.removeEventListener('error',   onError)
      el.removeEventListener('canplay', onCanPlay)
      el.pause()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, intro?.url])

  return (
    <>
      {/* MagazineEngine은 항상 베이스 */}
      <MagazineEngine
        story={story}
        allStories={allStories}
        initialView={initialView}
      />

      {/* 게이트 video: display:none이면 브라우저가 미디어를 로드 안 함 → visibility:hidden 사용 */}
      {eligible && intro?.url && (
        <video
          ref={gateRef}
          src={intro.url}
          muted
          playsInline
          preload="auto"
          style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
        />
      )}

      {/* 게이트 통과 후에만 오버레이 */}
      {phase === 'show' && intro && (
        <IntroVideoScreen
          story={story}
          intro={intro}
          onComplete={() => setPhase('done')}
        />
      )}
    </>
  )
}
