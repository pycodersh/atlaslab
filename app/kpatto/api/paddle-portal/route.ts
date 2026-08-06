import { NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * GET /kpatto/api/paddle-portal
 *
 * 현재 로그인 유저의 Paddle 구독 ID로 Customer Portal 세션 URL을 발급하고 반환.
 * PADDLE_API_KEY 미설정 시 → { fallback: true } 반환 (클라이언트가 일반 포털로 이동)
 */
export async function GET() {
  // ── 1. 로그인 유저 확인 ────────────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. 구독 ID + customer ID 조회 ─────────────────────────────────────────
  const sb = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  )
  const { data: profile } = await sb
    .from('user_profiles')
    .select('kpatto_subscription_id, kpatto_customer_id')
    .eq('id', user.id)
    .single()

  const subId        = (profile as Record<string, unknown> | null)?.kpatto_subscription_id as string | null
  let   customerId   = (profile as Record<string, unknown> | null)?.kpatto_customer_id   as string | null

  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) {
    // API Key 미설정 → 클라이언트에게 fallback 신호
    return NextResponse.json({ fallback: true })
  }

  const paddleBase = process.env.NEXT_PUBLIC_PADDLE_SANDBOX === 'true'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com'

  // ── 3. customer_id가 없고 sub_id가 있으면 Paddle에서 조회 ──────────────────
  if (!customerId && subId) {
    try {
      const subRes = await fetch(`${paddleBase}/subscriptions/${subId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (subRes.ok) {
        const subData = await subRes.json() as { data?: { customer_id?: string } }
        customerId = subData.data?.customer_id ?? null

        // 이후 조회 생략을 위해 DB에 저장
        if (customerId) {
          await sb.from('user_profiles')
            .update({ kpatto_customer_id: customerId } as Record<string, unknown>)
            .eq('id', user.id)
        }
      }
    } catch { /* 조회 실패 시 fallback */ }
  }

  if (!customerId) {
    return NextResponse.json({ fallback: true })
  }

  // ── 4. Customer Portal Session 발급 ───────────────────────────────────────
  try {
    const body: Record<string, unknown> = {}
    if (subId) body.subscription_ids = [subId]

    const res = await fetch(`${paddleBase}/customers/${customerId}/portal-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[paddle-portal] session error:', err)
      return NextResponse.json({ fallback: true })
    }

    const json = await res.json() as { data?: { urls?: { general?: { overview?: string } } } }
    const url  = json.data?.urls?.general?.overview

    if (!url) return NextResponse.json({ fallback: true })

    return NextResponse.json({ url })
  } catch (e) {
    console.error('[paddle-portal] fetch error:', e)
    return NextResponse.json({ fallback: true })
  }
}
