import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cleanEnvLoud } from '@/lib/paddle/env'
import { verifyPaddleSignature } from '@/lib/paddle/verify'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )
}

type PaddleEvent = {
  event_type: string
  data: {
    id: string
    customer_id: string
    status: string
    items: Array<{ price: { id: string; billing_cycle?: { interval: string } } }>
    current_billing_period?: { ends_at: string }
    cancel_at_period_end?: boolean
    custom_data?: { user_id?: string }
  }
}

const KPATTO_PRICE_ID = cleanEnvLoud(
  process.env.NEXT_PUBLIC_PADDLE_KPATTO_PRICE_ID,
  'NEXT_PUBLIC_PADDLE_KPATTO_PRICE_ID',
)

export async function POST(request: Request) {
  const body = await request.text()

  // ★ 이 라우트는 서명을 **검증하지 않고** kpatto_pro를 켜 주고 있었다.
  //   URL·가격 ID·남의 user_id만 알면 누구나 JSON을 POST해 Pro를 공짜로
  //   가져갈 수 있었다. 형제 라우트(app/kpatto/api/webhooks/paddle)는 처음부터
  //   fail-closed였다 — 검증 구현이 그 파일 안에만 있어서 이쪽이 빠뜨렸다.
  //   이제 둘 다 lib/paddle/verify.ts를 부른다.
  const secret = cleanEnvLoud(process.env.PADDLE_WEBHOOK_SECRET, 'PADDLE_WEBHOOK_SECRET')
  if (!secret) {
    console.error('[paddle webhook] PADDLE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 401 })
  }

  const signature = request.headers.get('paddle-signature') ?? ''
  if (!(await verifyPaddleSignature(body, signature, secret))) {
    console.error('[paddle webhook] invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: PaddleEvent
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { event_type, data } = event
  const priceId = data.items?.[0]?.price?.id

  // ── K-PATTO Pro subscription ──────────────────────────────────────────
  if (KPATTO_PRICE_ID && priceId === KPATTO_PRICE_ID) {
    const userId = data.custom_data?.user_id
    if (!userId) {
      console.error('[paddle webhook] kpatto: missing user_id in custom_data')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    if (
      event_type === 'subscription.created' ||
      event_type === 'subscription.updated' ||
      event_type === 'subscription.activated'
    ) {
      const isActive = data.status === 'active' || data.status === 'trialing'
      const { error } = await supabase
        .from('user_profiles')
        .update({
          kpatto_pro: isActive,
          kpatto_subscription_id: data.id,
          kpatto_subscription_status: data.status,
        })
        .eq('id', userId)
      if (error) console.error('[paddle webhook] kpatto update error:', error)
    }

    if (
      event_type === 'subscription.canceled' ||
      event_type === 'subscription.past_due'
    ) {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          kpatto_pro: false,
          kpatto_subscription_status: data.status,
        })
        .eq('kpatto_subscription_id', data.id)
      if (error) console.error('[paddle webhook] kpatto cancel error:', error)
    }

    return NextResponse.json({ received: true })
  }

  // ── Patto subscription ────────────────────────────────────────────────
  if (
    event_type === 'subscription.created' ||
    event_type === 'subscription.updated' ||
    event_type === 'subscription.activated'
  ) {
    const userId = data.custom_data?.user_id
    if (!userId) {
      console.error('[paddle webhook] patto: missing user_id in custom_data')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const interval = data.items?.[0]?.price?.billing_cycle?.interval
    const plan = interval === 'year' ? 'annual' : 'monthly'

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        paddle_subscription_id: data.id,
        paddle_customer_id: data.customer_id,
        status: data.status === 'active' || data.status === 'trialing' ? 'active' : data.status,
        plan,
        current_period_end: data.current_billing_period?.ends_at ?? null,
        cancel_at_period_end: data.cancel_at_period_end ?? false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('[paddle webhook] patto upsert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  if (event_type === 'subscription.canceled') {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('paddle_subscription_id', data.id)
    if (error) console.error('[paddle webhook] patto cancel error:', error)
  }

  if (event_type === 'subscription.past_due') {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('paddle_subscription_id', data.id)
    if (error) console.error('[paddle webhook] patto past_due error:', error)
  }

  return NextResponse.json({ received: true })
}
