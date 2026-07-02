import type { Language } from '@/lib/settings/preferences'

/**
 * Resolve a translation string based on the user's Language setting.
 *
 * Priority:
 *   1. If lang === 'ko'        → koText (primary data source)
 *   2. If extras[lang] exists  → extras[lang]
 *   3. Otherwise               → null (no data for this language yet)
 */
export function resolveTranslation(
  koText: string | null | undefined,
  lang: Language,
  extras?: Partial<Record<string, string>>,
): string | null {
  if (!koText) return null
  if (lang === 'ko') return koText
  const extra = extras?.[lang]
  if (extra) return extra
  return null
}
