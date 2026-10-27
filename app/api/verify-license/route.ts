import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyKPattoLicense } from '@/lib/kpatto/gumroad'
import { createPass, PASS_COOKIE, PASS_TTL_SECONDS, readPass } from '@/lib/kpatto/licensePass'

/**
 * GET /api/verify-license — 이 브라우저의 패스 상태(httpOnly 라 화면 코드가 직접 못 읽는다).
 * 응답: { active, product?, exp? }  — 키 원문은 서버도 갖고 있지 않다(쿠키엔 지문만 있다).
 */
export async function GET(req: Request) {
  const raw = req.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${PASS_COOKIE}=([^;]+)`))?.[1]
  const pass = readPass(raw ? decodeURIComponent(raw) : null)
  return NextResponse.json(
    pass ? { active: true, product: pass.p, exp: pass.exp } : { active: false },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}

/** DELETE /api/verify-license — 이 브라우저에서 Pro 해제(다른 기기로 옮길 때). Gumroad 쪽 키는 그대로 유효하다. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(PASS_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}

/**
 * POST /api/verify-license  { license_key, renew? }
 *
 * 로그인 없이 Gumroad 라이선스 키로 K-PATTO 앱을 연다.
 *  - Gumroad licenses/verify 로 확인(WebApp Pass · Bundle 상품만). 환불·분쟁·차지백은 거절.
 *    처음 입력은 사용 횟수를 늘리고(기기 등록 추적), renew=true(30일 재확인)는 늘리지 않는다.
 *  - 성공하면 서버 서명 패스를 httpOnly 쿠키로 준다 — 서버 게이트는 이것만 믿는다.
 *  - 로그인해 있으면 계정에도 기록(kp_lifetime_access)해서 다른 기기에서 로그인해도 열린다.
 *    테이블이 없거나 같은 키가 다른 계정에 묶여 있어도 이 브라우저의 잠금 해제는 그대로 성공한다.
 *
 * 응답: { valid: true, product, exp } | { valid: false, error }
 */
const INVALID = 'Invalid license key. Please check your Gumroad receipt.'

export async function POST(req: Request) {
  let key = ''
  let renew = false
  try {
    const body = await req.json()
    key = String(body?.license_key ?? '').trim()
    renew = body?.renew === true
  } catch { /* 빈 키로 거절 */ }
  if (key.length < 8 || key.length > 100) {
    return NextResponse.json({ valid: false, error: INVALID }, { status: 400 })
  }

  const check = await verifyKPattoLicense(key, { incrementUses: !renew })
  if (!check.ok) {
    const res = NextResponse.json(
      {
        valid: false,
        reason: check.reason,
        error: check.reason === 'refunded'
          ? 'This purchase was refunded or disputed, so the key no longer unlocks the app.'
          : check.reason === 'invalid'
            ? INVALID
            : "We couldn't verify your key right now. Please try again in a minute.",
      },
      { status: check.reason === 'invalid' || check.reason === 'refunded' ? 400 : 503 },
    )
    // 확실히 무효(환불·없는 키)일 때만 기존 패스를 지운다 — Gumroad 장애로 사용자를 잠그지 않는다
    if (check.reason === 'invalid' || check.reason === 'refunded') res.cookies.set(PASS_COOKIE, '', { path: '/', maxAge: 0 })
    return res
  }

  // 로그인 사용자면 계정에도 남긴다(실패해도 무시)
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

  const pass = createPass(check.product, key)
  const res = NextResponse.json({ valid: true, product: check.product, exp: pass.exp })
  res.cookies.set(PASS_COOKIE, pass.value, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PASS_TTL_SECONDS,
  })
  return res
}
