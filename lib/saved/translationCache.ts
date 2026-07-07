/**
 * Global Translation Cache (localStorage)
 *
 * Stores translated meanings for words / phrases / patterns.
 * Keyed by  `${type}:${normalizedText}` so the same text is only
 * ever translated once per language regardless of which user saved it
 * or whether they deleted and re-saved the item.
 *
 * Shape mirrors the future Supabase `translation_cache` table — swap
 * readCache / writeCache to Supabase calls to migrate.
 */

export type ItemType = 'word' | 'phrase' | 'pattern'

export type CacheEntry = {
  type: ItemType
  originalText: string
  normalizedText: string
  /** lang → meaning in that language, e.g. { ko: '…', ja: '…' } */
  translations: Partial<Record<string, string>>
  createdAt: string
  updatedAt: string
}

const CACHE_KEY = 'patto-translation-cache'

function readCache(): Record<string, CacheEntry> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') } catch { return {} }
}
function writeCache(c: Record<string, CacheEntry>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CACHE_KEY, JSON.stringify(c))
}

export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

function entryKey(type: ItemType, normalized: string): string {
  return `${type}:${normalized}`
}

/** Read a cache entry (or null if absent). */
export function getCacheEntry(type: ItemType, text: string): CacheEntry | null {
  return readCache()[entryKey(type, normalizeText(text))] ?? null
}

/** Create or update a cache entry, merging new translations on top. */
export function upsertCacheEntry(
  type: ItemType,
  originalText: string,
  translations: Partial<Record<string, string>>,
): CacheEntry {
  const cache = readCache()
  const normalized = normalizeText(originalText)
  const key = entryKey(type, normalized)
  const existing = cache[key]
  const now = new Date().toISOString()
  const entry: CacheEntry = existing
    ? { ...existing, translations: { ...existing.translations, ...translations }, updatedAt: now }
    : { type, originalText, normalizedText: normalized, translations, createdAt: now, updatedAt: now }
  cache[key] = entry
  writeCache(cache)
  return entry
}

/** Quick lookup: translation for a given language, or null. */
export function getTranslation(type: ItemType, text: string, lang: string): string | null {
  return getCacheEntry(type, text)?.translations[lang] ?? null
}

/**
 * Fetch a translation from the API, cache it, and return it.
 * No-op (returns null) if already cached for that language or if lang === 'en'.
 */
export async function fetchAndCacheTranslation(
  type: ItemType,
  text: string,
  lang: string,
): Promise<string | null> {
  if (lang === 'en') return null
  const existing = getTranslation(type, text, lang)
  if (existing) return existing

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, text, targetLang: lang }),
    })
    if (!res.ok) return null
    const { translation } = await res.json() as { translation: string }
    if (translation) {
      upsertCacheEntry(type, text, { [lang]: translation })
      return translation
    }
  } catch { /* network error — ignore */ }
  return null
}
