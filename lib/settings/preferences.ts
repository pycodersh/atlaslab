export type SpeechRate      = 'slow' | 'normal' | 'fast'
export type VoiceKey        = 'us-male' | 'us-female' | 'uk-male' | 'uk-female'
export type Language        = 'ko' | 'en' | 'es' | 'ja' | 'zh-cn' | 'zh-tw' | 'fr' | 'de'
export type AmbienceDefault = 'off' | 'on'

export interface UserPreferences {
  speechRate:      SpeechRate
  voice:           VoiceKey
  language:        Language
  ambienceDefault: AmbienceDefault
  /** 0–100 integer (slider value). Final gain = (value / 100) × 0.5 × AMBIENCE_BASE_VOLUME[id] */
  ambienceVolume:  number
}

export const DEFAULTS: UserPreferences = {
  speechRate:      'normal',
  voice:           'us-female',
  language:        'ko',
  ambienceDefault: 'off',
  ambienceVolume:  50,
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
    // Migration: ambienceVolume 'low'/'medium'/'high' → number
    const legacyVolMap: Record<string, number> = { low: 25, medium: 50, high: 75 }
    const rawVol = stored.ambienceVolume
    const ambienceVolume = typeof rawVol === 'string'
      ? (legacyVolMap[rawVol] ?? 50)
      : typeof rawVol === 'number' ? rawVol : DEFAULTS.ambienceVolume
    return { ...DEFAULTS, ...stored, language, ambienceVolume }
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
  slow:   0.9,
  normal: 1.0,
  fast:   1.1,
}

/** Converts slider value (0–100) to Web Audio master gain */
export function ambienceGain(sliderValue: number): number {
  return (sliderValue / 100) * 0.5
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
