'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ensureGuestSession } from '@/lib/guest-auth'
import {
  getPatternFavorites,
  recordPatternView,
  recordStoryProgress,
  togglePatternFavorite,
} from '@/queries/progress'

export function useProgress() {
  const userIdRef = useRef<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureGuestSession().then(async (uid) => {
      if (!uid) return
      userIdRef.current = uid
      const favs = await getPatternFavorites(uid)
      setFavorites(favs)
      setReady(true)
    })
  }, [])

  const onPatternView = useCallback(async (patternId: string) => {
    const uid = userIdRef.current
    if (!uid) return
    await recordPatternView(uid, patternId)
  }, [])

  const onToggleFavorite = useCallback(async (patternId: string) => {
    const uid = userIdRef.current
    if (!uid) return false
    const next = await togglePatternFavorite(uid, patternId)
    setFavorites((prev) => {
      const s = new Set(prev)
      if (next) s.add(patternId)
      else s.delete(patternId)
      return s
    })
    return next
  }, [])

  const onStoryProgress = useCallback(async (storyId: string, readCount: number) => {
    const uid = userIdRef.current
    if (!uid) return
    await recordStoryProgress(uid, storyId, readCount)
  }, [])

  return { ready, favorites, onPatternView, onToggleFavorite, onStoryProgress }
}
