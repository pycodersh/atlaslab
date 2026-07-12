'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

export type TrainerPage = 'home' | 'story' | 'pattern' | 'essay' | 'progress' | 'library' | 'other'

export interface TrainerCtx {
  message: string | null
  isActive: boolean
  isPulsing: boolean
  page: TrainerPage
  showMessage: (msg: string, autoDismissMs?: number) => void
  clearMessage: () => void
  setSilent: (v: boolean) => void
  triggerPulse: () => void
  setPage: (p: TrainerPage) => void
}

export const TrainerContext = createContext<TrainerCtx | null>(null)

export function useTrainer(): TrainerCtx {
  const ctx = useContext(TrainerContext)
  if (!ctx) throw new Error('useTrainer must be used within TrainerProvider')
  return ctx
}

// Safe version — returns null if not in provider (for optional usage)
export function useTrainerSafe(): TrainerCtx | null {
  return useContext(TrainerContext)
}

export function useTrainerState() {
  const [message, setMessage] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const [page, setPageState] = useState<TrainerPage>('other')
  const silentRef = useRef(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearMessage = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    setMessage(null)
    setIsActive(false)
  }, [])

  const showMessage = useCallback((msg: string, autoDismissMs = 2500) => {
    if (silentRef.current) return
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    setMessage(msg)
    setIsActive(true)
    dismissTimerRef.current = setTimeout(() => {
      setMessage(null)
      setIsActive(false)
    }, autoDismissMs)
  }, [])

  const setSilent = useCallback((v: boolean) => {
    silentRef.current = v
    if (v) {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      setMessage(null)
      setIsActive(false)
    }
  }, [])

  const triggerPulse = useCallback(() => {
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current)
    setIsPulsing(true)
    pulseTimerRef.current = setTimeout(() => setIsPulsing(false), 500)
  }, [])

  const setPage = useCallback((p: TrainerPage) => {
    setPageState(p)
    clearMessage()
    silentRef.current = false
  }, [clearMessage])

  return { message, isActive, isPulsing, page, showMessage, clearMessage, setSilent, triggerPulse, setPage }
}
