'use client'

import { useEffect, useState } from 'react'
import { usePreferences } from '@/contexts/PreferencesContext'
import {
  type ItemType,
  getTranslation,
  fetchAndCacheTranslation,
} from '@/lib/saved/translationCache'

/**
 * Returns the best available translation for an item in the current language.
 *
 * Priority:
 *   1. `storedTranslations[currentLang]`  — already cached on this device
 *   2. Kicks off a background API fetch if missing (updates state when done)
 *   3. Falls back to `legacyMeaning` (Korean meaning from dictionary/old data)
 *
 * When `lang === 'en'` translation is irrelevant — returns null immediately.
 */
export function useItemTranslation(
  type: ItemType,
  text: string,
  storedTranslations?: Partial<Record<string, string>>,
  legacyMeaning?: string,
): string | null {
  const { prefs } = usePreferences()
  const lang = prefs.language

  const initial = (): string | null => {
    if (lang === 'en') return null
    return storedTranslations?.[lang]
      ?? getTranslation(type, text, lang)
      ?? (lang === 'ko' ? legacyMeaning ?? null : null)
  }

  const [translation, setTranslation] = useState<string | null>(initial)

  useEffect(() => {
    if (lang === 'en') { setTranslation(null); return }

    // Check cache synchronously first
    const cached = storedTranslations?.[lang] ?? getTranslation(type, text, lang)
    if (cached) { setTranslation(cached); return }

    // Korean falls back to legacy meaning without an API call
    if (lang === 'ko') {
      setTranslation(legacyMeaning ?? null)
      return
    }

    // Missing — fetch in background, update when ready
    fetchAndCacheTranslation(type, text, lang).then(result => {
      if (result) setTranslation(result)
    })
  }, [type, text, lang])  // eslint-disable-line react-hooks/exhaustive-deps

  return translation
}
