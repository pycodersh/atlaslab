import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'crypto'

/**
 * 로그인 없는 K-PATTO 잠금 해제 — Gumroad 라이선스 키가 확인되면 서버가 서명한 "패스"를
 * httpOnly 쿠키(kpatto_pass)로 준다. 서버 게이트(에피소드 API · 스토리 페이지)는 이 서명만 확인한다.
 *
 * 왜 localStorage 가 아니라 서명 쿠키인가: localStorage 의 kpatto_is_pro 는 누구나 콘솔에서 켤 수 있다.
 * 클라이언트 값은 화면 표시용 힌트로만 쓰고, 유료 콘텐츠는 이 서명이 있어야 내준다.
 *
 * 30일 뒤 만료 — 클라이언트가 저장해 둔 키로 Gumroad 에 다시 확인해 새 패스를 받는다.
 * 그 사이 환불·분쟁이 생기면 재확인이 실패해 이용권이 사라진다(DB 없이 회수).
 * 서명 키: KPATTO_LICENSE_SECRET (없으면 서비스 롤 키에서 파생)
 */

export const PASS_COOKIE = 'kpatto_pass'
export const PASS_TTL_SECONDS = 30 * 24 * 60 * 60

type PassPayload = { p: 'webapp' | 'bundle'; k: string; exp: number }

const clean = (v?: string) => (v ?? '').replace(/^﻿/, '').trim()

function secret(): string {
  const s = clean(process.env.KPATTO_LICENSE_SECRET)
    || clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    || clean(process.env.SUPABASE_SECRET_KEY)
  if (!s) throw new Error('No signing secret for K-PATTO license pass')
  // 서비스 롤 키를 그대로 쓰지 않고 용도별 키로 파생한다
  return createHash('sha256').update(`kpatto-license-pass:${s}`).digest('hex')
}

const b64 = (s: string) => Buffer.from(s).toString('base64url')
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url')

/** 키 원문 대신 해시 앞부분만 넣는다 — 쿠키가 새도 키는 드러나지 않는다 */
export const keyFingerprint = (licenseKey: string) =>
  createHash('sha256').update(licenseKey.trim().toUpperCase()).digest('base64url').slice(0, 16)

export function createPass(product: PassPayload['p'], licenseKey: string): { value: string; exp: number } {
  const exp = Math.floor(Date.now() / 1000) + PASS_TTL_SECONDS
  const body = b64(JSON.stringify({ p: product, k: keyFingerprint(licenseKey), exp } satisfies PassPayload))
  return { value: `${body}.${sign(body)}`, exp }
}

/** 서명·만료가 맞으면 payload, 아니면 null */
export function readPass(value: string | undefined | null): PassPayload | null {
  if (!value) return null
  const [body, sig] = value.split('.')
  if (!body || !sig) return null
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as PassPayload
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null
    if (payload.p !== 'webapp' && payload.p !== 'bundle') return null
    return payload
  } catch {
    return null
  }
}
