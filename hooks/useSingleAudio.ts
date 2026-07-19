'use client'

import { useEffect, useState } from 'react'
import {
  coordinatorGetState,
  coordinatorReset,
  coordinatorSubscribe,
} from '@/lib/audio/coordinator'

export interface SingleAudioState {
  currentId: string | null
  isActive: boolean
  /** Call on page unmount or storyId change to stop all audio */
  reset: () => void
}

/**
 * Subscribe to global audio ownership state.
 * Components read currentId/isActive to decide their icon state.
 * Actual play/pause logic stays inside each component.
 */
export function useSingleAudio(): SingleAudioState {
  const [state, setState] = useState(coordinatorGetState)

  useEffect(() => {
    return coordinatorSubscribe(() => setState(coordinatorGetState()))
  }, [])

  return { ...state, reset: coordinatorReset }
}
