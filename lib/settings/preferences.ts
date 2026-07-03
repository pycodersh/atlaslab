export type SpeechRate      = 'slow' | 'normal' | 'fast'
export type VoiceKey        = 'us-male' | 'us-female' | 'uk-male' | 'uk-female'
export type Language        = 'ko' | 'en' | 'es' | 'ja' | 'zh-cn' | 'zh-tw' | 'fr' | 'de'
export type AmbienceDefault = 'off' | 'on'
export type AmbienceVolume  = 'low' | 'medium' | 'high'

export interface UserPreferences {
  speechRate:      SpeechRate
  voice:           VoiceKey
  language:        Language
  ambienceDefault: AmbienceDefault
  ambienceVolume:  AmbienceVolume
}

export const DEFAULTS: UserPreferences = {
  speechRate:      'normal',
  voice:           'us-female',
  language:        'ko',
  ambienceDefault: 'off',
  ambienceVolume:  'medium',
}

const KEY = 'patto-user-preferences'

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const stored = JSON.parse(raw) as Record<string, unknown>
    // Migration: appLang / translationLang → language
    const language = (stored.language ?? stored.appLang ?? DEFAULTS.language) as Language
    return { ...DEFAULTS, ...stored, language }
  } catch {
    return DEFAULTS
  }
}

export function savePreferences(patch: Partial<UserPreferences>): UserPreferences {
  const next = { ...getPreferences(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

// ── TTS helpers ──────────────────────────────────────────────────────────────

export const RATE_MAP: Record<SpeechRate, number> = {
  slow:   0.85,
  normal: 0.95,
  fast:   1.10,
}

// ── Ambience volume ───────────────────────────────────────────────────────────

/** User-facing volume levels → master gain value */
export const AMBIENCE_VOLUME_MAP: Record<AmbienceVolume, number> = {
  low:    0.12,
  medium: 0.22,
  high:   0.38,
}

// ── Label maps ───────────────────────────────────────────────────────────────

export const SPEECH_RATE_LABELS: Record<SpeechRate, string> = {
  slow: 'Slow', normal: 'Normal', fast: 'Fast',
}

export const AMBIENCE_VOLUME_LABELS: Record<AmbienceVolume, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
}

export const VOICE_LABELS: Record<VoiceKey, string> = {
  'us-male':   '🇺🇸 Male',
  'us-female': '🇺🇸 Female',
  'uk-male':   '🇬🇧 Male',
  'uk-female': '🇬🇧 Female',
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  ko:      '한국어',
  en:      'English',
  es:      'Español',
  ja:      '日本語',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  fr:      'Français',
  de:      'Deutsch',
}
