'use client'

/**
 * 브라우저 쪽 라이선스 상태 — 화면을 바로 열어 주기 위한 "힌트"다.
 *
 *   kpatto_license_key   Gumroad 라이선스 키(30일마다 재확인에 쓴다)
 *   kpatto_is_pro        'true' 면 잠금 아이콘을 숨긴다
 *   kpatto_pass_exp      서버 패스(쿠키) 만료 시각(초)
 *
 * 실제 유료 콘텐츠는 서버가 서명한 httpOnly 쿠키(kpatto_pass)가 있어야 열린다(lib/kpatto/licensePass).
 * 그래서 여기 값을 콘솔에서 바꿔도 화면 표시만 달라질 뿐 에피소드는 열리지 않는다.
 */

const KEY = 'kpatto_license_key'
const PRO = 'kpatto_is_pro'
const EXP = 'kpatto_pass_exp'
export const LICENSE_EVENT = 'kpatto-license-change'
/** 만료 3일 전부터 조용히 재확인한다 */
const RENEW_BEFORE_SECONDS = 3 * 24 * 60 * 60

export type VerifyResult = { valid: true; product: string } | { valid: false; error: string; reason?: string }

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }

export function getLicenseState() {
  if (typeof window === 'undefined') return { isPro: false, key: null as string | null }
  return { isPro: read(PRO) === 'true' && !!read(KEY), key: read(KEY) }
}

/** announce: 사람이 키를 넣었을 때만 true — 축하 토스트(LicenseToast)를 띄운다 */
function save(key: string, exp: number, announce: boolean) {
  try {
    localStorage.setItem(KEY, key)
    localStorage.setItem(PRO, 'true')
    localStorage.setItem(EXP, String(exp))
  } catch { /* 저장 못 해도 이번 방문은 쿠키로 열린다 */ }
  window.dispatchEvent(new CustomEvent(LICENSE_EVENT, { detail: { unlocked: true, announce } }))
}

export function clearLicense() {
  try { [KEY, PRO, EXP].forEach(k => localStorage.removeItem(k)) } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent(LICENSE_EVENT, { detail: { unlocked: false } }))
}

async function callVerify(licenseKey: string, renew: boolean): Promise<VerifyResult & { exp?: number }> {
  try {
    const res = await fetch('/api/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ license_key: licenseKey, renew }),
    })
    return await res.json()
  } catch {
    return { valid: false, error: "We couldn't verify your key right now. Please try again in a minute.", reason: 'unavailable' }
  }
}

/** 키 입력 → 서버 확인 → 성공하면 저장하고 모든 화면에 알린다 */
export async function unlockWithKey(licenseKey: string): Promise<VerifyResult> {
  const key = licenseKey.trim()
  const r = await callVerify(key, false)
  if (r.valid) { save(key, r.exp ?? 0, true); return { valid: true, product: r.product } }
  return r
}

/**
 * 앱을 열 때 한 번: 키가 있는데 패스가 곧 만료되거나 없으면 재확인한다.
 * 환불·무효로 확실히 거절되면 상태를 지우고, Gumroad 장애면 그대로 둔다.
 */
export async function renewLicenseIfNeeded() {
  const key = read(KEY)
  if (!key) return
  const exp = Number(read(EXP) ?? 0)
  if (exp * 1000 - Date.now() > RENEW_BEFORE_SECONDS * 1000) return
  const r = await callVerify(key, true)
  if (r.valid) save(key, r.exp ?? 0, false)
  else if (r.reason === 'invalid' || r.reason === 'refunded') clearLicense()
}
