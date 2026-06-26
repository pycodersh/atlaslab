'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  type UserPreferences,
  DEFAULTS,
  getPreferences,
  savePreferences,
} from '@/lib/settings/preferences'

interface PreferencesContextType {
  prefs:  UserPreferences
  update: (patch: Partial<UserPreferences>) => void
}

const Ctx = createContext<PreferencesContextType | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS)

  useEffect(() => {
    setPrefs(getPreferences())
  }, [])

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = savePreferences({ ...prev, ...patch })
      return next
    })
  }, [])

  return <Ctx.Provider value={{ prefs, update }}>{children}</Ctx.Provider>
}

export function usePreferences() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
