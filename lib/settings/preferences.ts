export type SpeechRate      = 'slow' | 'normal' | 'fast'
export type VoiceKey        = 'us-male' | 'us-female' | 'uk-male' | 'uk-female'
export type AppLang         = 'ko' | 'en' | 'es' | 'ja' | 'zh-cn' | 'zh-tw' | 'fr' | 'de'
export type TranslationLang = 'none' | 'ko' | 'en' | 'es' | 'ja' | 'zh-cn' | 'zh-tw' | 'fr' | 'de'
export type AmbienceDefault = 'off' | 'on'

export interface UserPreferences {
  speechRate:      SpeechRate
  voice:           VoiceKey
  appLang:         AppLang
  translationLang: TranslationLang
  ambienceDefault: AmbienceDefault
}

export const DEFAULTS: UserPreferences = {
  speechRate:      'normal',
  voice:           'us-female',
  appLang:         'ko',
  translationLang: 'ko',
  ambienceDefault: 'off',
}

const KEY = 'patto-user-preferences'

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function savePreferences(patch: Partial<UserPreferences>): UserPreferences {
  const next = { ...getPreferences(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

// ── TTS helpers ─────────────────────────────────────────────────────────────

export const RATE_MAP: Record<SpeechRate, number> = {
  slow:   0.70,
  normal: 0.88,
  fast:   1.10,
}

const FEMALE_PATTERN = /samantha|karen|moira|fiona|victoria|allison|ava|susan|zira|female|woman|kate|siri/i

export function findVoice(key: VoiceKey): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const langPrefix = key.startsWith('us') ? 'en-US' : 'en-GB'
  const pool = voices.filter(v => v.lang.startsWith(langPrefix.slice(0, 5)))
  if (!pool.length) return voices.find(v => v.lang.startsWith('en')) ?? null

  const isFemale = key.endsWith('female')
  return pool.find(v => isFemale ? FEMALE_PATTERN.test(v.name) : !FEMALE_PATTERN.test(v.name))
    ?? pool[isFemale ? 0 : 1]
    ?? pool[0]
}

// ── Label maps ───────────────────────────────────────────────────────────────

export const SPEECH_RATE_LABELS: Record<SpeechRate, string> = {
  slow: 'Slow', normal: 'Normal', fast: 'Fast',
}

export const VOICE_LABELS: Record<VoiceKey, string> = {
  'us-male':   '🇺🇸 Male',
  'us-female': '🇺🇸 Female',
  'uk-male':   '🇬🇧 Male',
  'uk-female': '🇬🇧 Female',
}

export const APP_LANG_LABELS: Record<AppLang, string> = {
  ko:    '한국어',
  en:    'English',
  es:    'Español',
  ja:    '日本語',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  fr:    'Français',
  de:    'Deutsch',
}

export const TRANSLATION_LANG_LABELS: Record<TranslationLang, string> = {
  none:    'None',
  ko:      '한국어',
  en:      'English',
  es:      'Español',
  ja:      '日本語',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  fr:      'Français',
  de:      'Deutsch',
}
