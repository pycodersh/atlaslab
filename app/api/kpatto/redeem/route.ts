import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyKPattoLicense } from '@/lib/kpatto/gumroad'

/**
 * Gumroad 라이선스 키로 K-PATTO 앱 평생 이용권을 연다.
 *
 * 1) 로그인한 사용자만 — 이용권은 계정에 묶여 어느 기기에서든 열린다
 * 2) 이미 이용권이 있으면 그대로 성공
 * 3) Gumroad 에 키 확인(WebApp Pass · Bundle 상품만, 환불·분쟁 건은 거절)
 * 4) kp_lifetime_access 에 서비스 롤로 기록 — license_key UNIQUE 라 한 키는 한 계정에만
 *
 * 응답 error 코드: sign_in · invalid_key · refunded · key_used · not_configured · unavailable · save_failed
 */
export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'sign_in' }, { status: 401 })

  let key = ''
  try {
    const body = await req.json()
    key = String(body?.licenseKey ?? '').trim()
  } catch { /* 아래에서 빈 키로 거절 */ }
  if (key.length < 8 || key.length > 100) {
    return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('kp_lifetime_access').select('product').eq('user_id', user.id).maybeSingle()
  if (existing) return NextResponse.json({ ok: true, already: true, product: existing.product })

  const check = await verifyKPattoLicense(key)
  if (!check.ok) {
    const status = check.reason === 'invalid' || check.reason === 'refunded' ? 400 : 503
    const error = check.reason === 'invalid' ? 'invalid_key' : check.reason
    return NextResponse.json({ ok: false, error }, { status })
  }

  const { error: insErr } = await admin.from('kp_lifetime_access').insert({
    user_id: user.id,
    product: check.product,
    license_key: key,
    gumroad_sale_id: check.saleId,
    purchase_email: check.email,
  })
  if (insErr) {
    // 23505 = 고유 제약 위반. user_id 는 위에서 걸렀으니 이 키를 다른 계정이 이미 썼다는 뜻이다.
    if (insErr.code === '23505') return NextResponse.json({ ok: false, error: 'key_used' }, { status: 409 })
    console.error('[redeem] insert failed:', insErr.message)
    return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, product: check.product })
}
