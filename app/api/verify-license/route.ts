import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizePurchaseRef, verifyKPantryPurchase, verifyKPattoLicense } from '@/lib/kpatto/gumroad'
import {
  createPass,
  KPANTRY_PASS_COOKIE,
  PASS_COOKIE,
  PASS_TTL_SECONDS,
  readKPantryPass,
  readPass,
} from '@/lib/kpatto/licensePass'

/**
 * 앱별 설정 — 기본은 K-PATTO, ?app=kpantry(또는 body.app)면 K-Pantry Pro.
 * 앱마다 Gumroad 상품·쿠키·패스 판정이 따로라 한 앱의 키로 다른 앱이 열리지 않는다.
 * kp_lifetime_access 는 행이 있기만 하면 K-PATTO 를 여는 표라(lib/kpatto/entitlement.ts) K-PATTO 만 기록한다.
 */
type App = 'kpatto' | 'kpantry'

const APPS = {
  kpatto: {
    cookie: PASS_COOKIE, read: readPass, verify: verifyKPattoLicense, recordLifetime: true,
    normalize: (v: string) => v, minLength: 8,
    invalid: 'Invalid license key. Please check your Gumroad receipt.',
    refunded: 'This purchase was refunded or disputed, so the key no longer unlocks the app.',
  },
  // K-Pantry 는 라이선스 키가 없다 — 영수증의 주문 번호·Sale ID 또는 결제 이메일로 판매 내역을 찾는다
  kpantry: {
    cookie: KPANTRY_PASS_COOKIE, read: readKPantryPass, verify: (ref: string) => verifyKPantryPurchase(ref), recordLifetime: false,
    normalize: normalizePurchaseRef, minLength: 5,
    invalid: "We couldn't find a K-Pantry purchase with that order number or email. Please check your Gumroad receipt.",
    refunded: 'This purchase was refunded or disputed, so it no longer unlocks K-Pantry.',
  },
} as const

const appFrom = (value: unknown): App => (value === 'kpantry' ? 'kpantry' : 'kpatto')

/**
 * GET /api/verify-license[?app=kpantry] — 이 브라우저의 패스 상태(httpOnly 라 화면 코드가 직접 못 읽는다).
 * 응답: { active, product?, exp? }  — 키 원문은 서버도 갖고 있지 않다(쿠키엔 지문만 있다).
 */
export async function GET(req: Request) {
  const cfg = APPS[appFrom(new URL(req.url).searchParams.get('app'))]
  const raw = req.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${cfg.cookie}=([^;]+)`))?.[1]
  const pass = cfg.read(raw ? decodeURIComponent(raw) : null)
  return NextResponse.json(
    pass ? { active: true, product: pass.p, exp: pass.exp } : { active: false },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}

/** DELETE /api/verify-license[?app=kpantry] — 이 브라우저에서 Pro 해제(다른 기기로 옮길 때). Gumroad 쪽 키는 그대로 유효하다. */
export async function DELETE(req: Request) {
  const cfg = APPS[appFrom(new URL(req.url).searchParams.get('app'))]
  const res = NextResponse.json({ ok: true })
  res.cookies.set(cfg.cookie, '', { path: '/', maxAge: 0 })
  return res
}

/**
 * POST /api/verify-license  { license_key, renew?, app? }
 *
 * 로그인 없이 Gumroad 구매로 앱을 연다(app: 'kpatto' 기본 = 라이선스 키 | 'kpantry' = 주문 번호·Sale ID·결제 이메일).
 *  - Gumroad licenses/verify 로 확인(그 앱의 상품만). 환불·분쟁·차지백은 거절.
 *    처음 입력은 사용 횟수를 늘리고(기기 등록 추적), renew=true(30일 재확인)는 늘리지 않는다.
 *  - 성공하면 서버 서명 패스를 httpOnly 쿠키로 준다 — 서버 게이트는 이것만 믿는다.
 *  - K-PATTO 는 로그인해 있으면 계정에도 기록(kp_lifetime_access)해서 다른 기기에서 로그인해도 열린다.
 *    테이블이 없거나 같은 키가 다른 계정에 묶여 있어도 이 브라우저의 잠금 해제는 그대로 성공한다.
 *
 * 응답: { valid: true, product, exp } | { valid: false, error }
 */
export async function POST(req: Request) {
  let key = ''
  let renew = false
  let app: App = 'kpatto'
  try {
    const body = await req.json()
    key = String(body?.license_key ?? '').trim()
    renew = body?.renew === true
    app = appFrom(body?.app)
  } catch { /* 빈 키로 거절 */ }
  const cfg = APPS[app]
  key = cfg.normalize(key)
  if (key.length < cfg.minLength || key.length > 100) {
    return NextResponse.json({ valid: false, reason: 'invalid', error: cfg.invalid }, { status: 400 })
  }

  const check = await cfg.verify(key, { incrementUses: !renew })
  if (!check.ok) {
    const res = NextResponse.json(
      {
        valid: false,
        reason: check.reason,
        error: check.reason === 'refunded'
          ? cfg.refunded
          : check.reason === 'invalid'
            ? cfg.invalid
            : "We couldn't verify your purchase right now. Please try again in a minute.",
      },
      { status: check.reason === 'invalid' || check.reason === 'refunded' ? 400 : 503 },
    )
    // 확실히 무효(환불·없는 키)일 때만 기존 패스를 지운다 — Gumroad 장애로 사용자를 잠그지 않는다
    if (check.reason === 'invalid' || check.reason === 'refunded') res.cookies.set(cfg.cookie, '', { path: '/', maxAge: 0 })
    return res
  }

  // 로그인 사용자면 계정에도 남긴다(실패해도 무시)
  if (cfg.recordLifetime) {
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await createAdminClient().from('kp_lifetime_access').upsert({
          user_id: user.id,
          product: check.product,
          license_key: key,
          gumroad_sale_id: check.saleId,
          purchase_email: check.email,
        }, { onConflict: 'user_id', ignoreDuplicates: true })
      }
    } catch { /* 계정 기록은 부가 기능 */ }
  }

  const pass = createPass(check.product, key)
  const res = NextResponse.json({ valid: true, product: check.product, exp: pass.exp })
  res.cookies.set(cfg.cookie, pass.value, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PASS_TTL_SECONDS,
  })
  return res
}
