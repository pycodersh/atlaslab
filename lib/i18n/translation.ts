import type { TranslationLang } from '@/lib/settings/preferences'

/**
 * Resolve a translation string based on the user's Translation Language setting.
 *
 * Priority:
 *   1. If lang === 'none'         → null (hide translation)
 *   2. If lang === 'ko'           → koText (primary data source)
 *   3. If extras[lang] exists     → extras[lang] (future multilingual data)
 *   4. Fallback                   → koText (ko fallback — current data is ko-only)
 *
 * To show nothing instead of ko fallback for missing languages,
 * change the last line from `return koText` to `return null`.
 */
export function resolveTranslation(
  koText: string | null | undefined,
  lang: TranslationLang,
  extras?: Partial<Record<string, string>>,
): string | null {
  if (!koText || lang === 'none') return null
  if (lang === 'ko') return koText
  const extra = extras?.[lang]
  if (extra) return extra
  // No translation for this language yet → hide (return null)
  return null
}
