export const SUPPORTED_LANGUAGES = ['en', 'ko', 'ja', 'es'] as const
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]
