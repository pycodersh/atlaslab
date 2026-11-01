'use client'

/**
 * K-Pantry Pro 라이선스(Gumroad 평생 이용권) — 브라우저 쪽.
 *
 * 판정 기준은 서버가 서명한 httpOnly 쿠키 kpantry_pass(GET /api/verify-license?app=kpantry)다.
 * localStorage 의 kpantry_license_key 는 쿠키가 만료(30일)되거나 지워졌을 때 조용히 다시 받는 데만 쓴다.
 * 쿠키·키 모두 K-PATTO 와 따로다(lib/kpatto/license.ts) — 한 앱 키로 다른 앱이 열리지 않는다.
 */

const KEY = 'kpantry_license_key'
const API = '/api/verify-license'
const UNAVAILABLE = "We couldn't verify your key right now. Please try again in a minute."

export type VerifyResult = { valid: true } | { valid: false; error: string; reason?: string }

const readKey = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const writeKey = (k: string | null) => {
  try { if (k) localStorage.setItem(KEY, k); else localStorage.removeItem(KEY) } catch { /* 이번 방문은 쿠키로 열린다 */ }
}

async function callVerify(licenseKey: string, renew: boolean): Promise<VerifyResult> {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ license_key: licenseKey, renew, app: 'kpantry' }),
    })
    return await res.json()
  } catch {
    return { valid: false, error: UNAVAILABLE, reason: 'unavailable' }
  }
}

// 한 화면에서 여러 컴포넌트가 물어도 서버 확인은 한 번만 한다
let statusPromise: Promise<boolean> | null = null

/** 이 브라우저에 K-Pantry Pro 패스가 있나 — 없는데 저장된 키가 있으면 한 번 재확인한다 */
export function hasLicensePass(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  statusPromise ??= (async () => {
    try {
      const r = await fetch(`${API}?app=kpantry`, { credentials: 'same-origin', cache: 'no-store' })
      if ((await r.json())?.active === true) return true
    } catch { /* 아래 재확인으로 */ }
    const key = readKey()
    if (!key) return false
    const renewed = await callVerify(key, true)
    if (!renewed.valid && (renewed.reason === 'invalid' || renewed.reason === 'refunded')) writeKey(null)
    return renewed.valid
  })()
  return statusPromise
}

/** 키 입력 → 서버 확인 → 성공하면 키를 저장한다(쿠키는 서버가 심는다) */
export async function unlockWithKey(licenseKey: string): Promise<VerifyResult> {
  const key = licenseKey.trim()
  const r = await callVerify(key, false)
  if (r.valid) {
    writeKey(key)
    statusPromise = Promise.resolve(true)
  }
  return r
}

/** 이 브라우저에서 Pro 해제 — 다른 기기로 옮길 때. Gumroad 쪽 키는 그대로 유효하다 */
export async function deactivateLicense() {
  try { await fetch(`${API}?app=kpantry`, { method: 'DELETE', credentials: 'same-origin' }) } catch { /* 로컬 정리는 한다 */ }
  writeKey(null)
  statusPromise = Promise.resolve(false)
}
