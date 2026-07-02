'use client'

import { usePreferences } from '@/contexts/PreferencesContext'
import { getStrings, type TKey } from '@/lib/i18n/strings'

export function useT() {
  const { prefs } = usePreferences()
  const strings = getStrings(prefs.language)

  return function t(key: TKey, vars?: Record<string, string | number>): string {
    let str = strings[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }
}
