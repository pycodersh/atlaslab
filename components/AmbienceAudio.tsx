'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Music2 } from 'lucide-react'
import type { StoryAmbience, AmbienceId } from '@/types/magazine'
import { useAmbience } from '@/hooks/useAmbience'

type Props = {
  ambience: StoryAmbience
  ambienceId?: AmbienceId  // Web Audio 합성 폴백용
}

export function AmbienceAudio({ ambience, ambienceId }: Props) {
  const [on, setOn] = useState(false)

  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const audioReadyRef = useRef(false)   // loadeddata 이벤트 수신 여부
  const useUrlRef     = useRef(true)    // HTML audio 사용 가능 여부

  const { play: playWebAudio, stop: stopWebAudio } = useAmbience()

  // HTML audio 초기화 — preload auto로 미리 로드
  useEffect(() => {
    if (!ambience.enabled || !ambience.url) return

    const audio = new Audio(ambience.url)
    audio.loop    = true
    audio.volume  = ambience.volume ?? 0.25
    audio.preload = 'auto'
    audioRef.current = audio

    function onLoaded() { audioReadyRef.current = true }
    function onError(_e: Event) {
      useUrlRef.current   = false
      audioReadyRef.current = false
    }

    audio.addEventListener('loadeddata', onLoaded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('loadeddata', onLoaded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
      audioRef.current = null
      audioReadyRef.current = false
    }
  }, [ambience.url, ambience.volume, ambience.enabled])

  // 언마운트(Story Reader 이탈) 시 정리
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      stopWebAudio()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 동기(non-async) 핸들러 — 사용자 제스처 컨텍스트 유지
  const handleToggle = useCallback(() => {
    if (!ambience.enabled) return

    if (on) {
      audioRef.current?.pause()
      stopWebAudio()
      setOn(false)
      return
    }

    // HTML audio: 파일이 로드 완료된 경우에만 사용
    if (useUrlRef.current && audioReadyRef.current && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        useUrlRef.current = false
      })
      setOn(true)
      return
    }

    // Web Audio 합성 폴백 — 사용자 제스처 내 동기 호출 (iOS/Chrome 정책 준수)
    if (ambienceId) {
      playWebAudio(ambienceId)
      setOn(true)
    }
  }, [on, ambience.enabled, ambienceId, playWebAudio, stopWebAudio])

  if (!ambience.enabled) return null

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={on ? 'Ambience 끄기' : 'Ambience 켜기'}
      className={[
        'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.1em] transition-all cursor-pointer select-none',
        on
          ? 'bg-[var(--pa)] text-white'
          : 'bg-[var(--pd)] text-[var(--pm)] hover:bg-[var(--pa)] hover:text-white',
      ].join(' ')}
    >
      <Music2 className="w-3 h-3 shrink-0" />
      {on ? 'AMBIENCE ON' : 'AMBIENCE'}
    </button>
  )
}
