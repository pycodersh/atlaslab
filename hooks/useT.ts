'use client'

import React from 'react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { getStrings, type TKey } from '@/lib/i18n/strings'
import { QA_HIGHLIGHT } from '@/lib/qa'

export function useT() {
  const { prefs } = usePreferences()
  const strings = getStrings(prefs.appLang)

  function t(key: TKey, vars?: Record<string, string | number>): string {
    let str = strings[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  function tEl(key: TKey, vars?: Record<string, string | number>): React.ReactElement {
    const str = t(key, vars)
    if (!QA_HIGHLIGHT) return React.createElement(React.Fragment, null, str)
    return React.createElement('mark', {
      style: { background: '#FFEB3B', color: 'inherit', borderRadius: 2, padding: '0 2px' },
    }, str)
  }

  // Non-breaking: existing `const t = useT()` calls still work as `t('key')`
  return Object.assign(t, { tEl })
}
