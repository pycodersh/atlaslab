'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Music2 } from 'lucide-react'
import type { StoryAmbience, AmbienceId } from '@/types/magazine'
import { useAmbience } from '@/hooks/useAmbience'

type Props = {
  ambience: StoryAmbience
  ambienceId?: AmbienceId   // HTML audio 실패 시 Web Audio 합성 폴백
}

export function AmbienceAudio({ ambience, ambienceId }: Props) {
  const [on, setOn] = useState(false)
  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const useUrlRef     = useRef(true)   // URL 사용 가능 여부
  const { play: playWebAudio, stop: stopWebAudio } = useAmbience()

  // HTML audio 초기화
  useEffect(() => {
    if (!ambience.enabled || !ambience.url) return

    const audio = new Audio(ambience.url)
    audio.loop   = true
    audio.volume = ambience.volume ?? 0.25
    audio.preload = 'none'
    audioRef.current = audio

    audio.addEventListener('error', (e) => {
      console.log('[Ambience] load error', e)
      useUrlRef.current = false
    })

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
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

  const handleToggle = useCallback(async () => {
    if (!ambience.enabled) return

    if (on) {
      audioRef.current?.pause()
      stopWebAudio()
      setOn(false)
    } else {
      // HTML audio 먼저 시도
      if (useUrlRef.current && audioRef.current) {
        try {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
          setOn(true)
          return
        } catch (e) {
          console.log('[Ambience] play rejected', e)
          useUrlRef.current = false
        }
      }
      // Web Audio 합성 폴백
      if (ambienceId) {
        playWebAudio(ambienceId)
        setOn(true)
      }
    }
  }, [on, ambience.enabled, ambienceId, playWebAudio, stopWebAudio])

  if (!ambience.enabled) return null

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={on ? `${ambience.label ?? 'Ambience'} 끄기` : `${ambience.label ?? 'Ambience'} 켜기`}
      title={on ? 'Ambience Off' : 'Ambience On'}
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
