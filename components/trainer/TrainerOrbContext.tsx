'use client'

import { createContext, useCallback, useRef, useState } from 'react'

export type OrbState = 'idle' | 'speaking' | 'waiting' | 'done'

export interface TrainerOrbContextValue {
  orbState: OrbState
  message: string | null
  showMessage: (text: string, duration?: number) => void
  setState: (state: OrbState) => void
  hide: () => void
}

export const TrainerOrbContext = createContext<TrainerOrbContextValue>({
  orbState: 'idle',
  message: null,
  showMessage: () => {},
  setState: () => {},
  hide: () => {},
})

export function TrainerOrbProvider({ children }: { children: React.ReactNode }) {
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(null)
  }, [])

  const showMessage = useCallback((text: string, duration = 2000) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(text)
    timerRef.current = setTimeout(() => setMessage(null), duration)
  }, [])

  const setState = useCallback((state: OrbState) => {
    setOrbState(state)
    if (state === 'done') {
      setTimeout(() => setOrbState('idle'), 2000)
    }
  }, [])

  return (
    <TrainerOrbContext.Provider value={{ orbState, message, showMessage, setState, hide }}>
      {children}
    </TrainerOrbContext.Provider>
  )
}
