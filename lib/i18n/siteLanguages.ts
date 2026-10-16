/**
 * 마케팅 사이트(헤더 언어 선택)용 언어 목록과 브라우저 언어 → 지원 언어 매칭.
 * 번역은 Google Translate Element(무료, 클라이언트)가 맡고, 여기서는 목록·감지·쿠키 해석만 다룬다.
 * (같은 폴더의 strings.ts / translation.ts 는 앱 안의 UI 문자열용이라 별개다.)
 */
export const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ko', label: '한국어', short: 'KO' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'zh-CN', label: '简体中文', short: 'ZH-CN' },
  { code: 'zh-TW', label: '繁體中文', short: 'ZH-TW' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
] as const

export type LangCode = (typeof LANGS)[number]['code']

export const DEFAULT_LANG: LangCode = 'en'
export const STORAGE_KEY = 'atlas_selected_lang'

export function isLangCode(v: unknown): v is LangCode {
  return typeof v === 'string' && LANGS.some(l => l.code === v)
}

/** navigator.language(예: "ko-KR", "zh-Hant-TW", "es-MX") → 지원 언어. 맞는 게 없으면 en. */
export function detectLang(navLang: string | undefined | null): LangCode {
  const tag = (navLang ?? '').trim()
  if (!tag) return DEFAULT_LANG
  const lower = tag.toLowerCase()
  if (lower.startsWith('zh')) {
    // 번체: 대만·홍콩·마카오 또는 Hant 스크립트. 그 외 중국어는 간체.
    return /hant|-tw|-hk|-mo/.test(lower) ? 'zh-TW' : 'zh-CN'
  }
  const base = lower.split('-')[0]
  const hit = LANGS.find(l => l.code.toLowerCase() === base)
  return hit ? hit.code : DEFAULT_LANG
}

/** Google Translate 가 읽는 googtrans 쿠키에서 대상 언어를 꺼낸다("/en/ja" → "ja"). */
export function readTranslateCookie(cookie: string): LangCode {
  const m = cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/)
  const v = m?.[1] ? decodeURIComponent(m[1]) : ''
  return isLangCode(v) ? v : DEFAULT_LANG
}
