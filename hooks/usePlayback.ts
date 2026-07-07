'use client'

import { useEffect, useState } from 'react'
import { playbackController, type PlaybackState } from '@/lib/tts/playback-controller'

export function usePlayback(id: string) {
  const [state, setState]         = useState<PlaybackState>(() => playbackController.state)
  const [currentId, setCurrentId] = useState<string | null>(() => playbackController.currentId)

  useEffect(() => {
    return playbackController.subscribe((s, cid) => {
      setState(s)
      setCurrentId(cid)
    })
  }, [])

  const isPlaying = currentId === id && state === 'playing'
  const isLoading = currentId === id && state === 'loading'
  const hasError  = currentId === id && state === 'error'

  function toggle(url: string | null | undefined) {
    if (!url) return
    playbackController.toggle(id, url)
  }

  return { isPlaying, isLoading, hasError, toggle }
}
