import ko from './ko'
import en from './en'

export type Locale = 'ko' | 'en'

const locales = { ko, en } as const

// Default locale — change this or pass via composition inputProps to switch languages
let _locale: Locale = 'ko'

export function setLocale(locale: Locale) {
  _locale = locale
}

export function getLocale(): Locale {
  return _locale
}

/**
 * Translate a dot-notation key to the current locale string.
 * Returns the raw value (string | string[]) — caller casts as needed.
 *
 * Examples:
 *   t('scene1.question1')        → "왜 영어는 배웠는데"
 *   t('scene3.cards') as string[] → [...]
 */
export function t(key: string): string {
  const parts = key.split('.')
  let node: unknown = locales[_locale]
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return key
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node === 'string') return node
  return key
}

/**
 * Translate a key that resolves to a string array.
 * Falls back to an empty array when the key is missing.
 */
export function ta(key: string): string[] {
  const parts = key.split('.')
  let node: unknown = locales[_locale]
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return []
    node = (node as Record<string, unknown>)[part]
  }
  return Array.isArray(node) ? (node as string[]) : []
}
