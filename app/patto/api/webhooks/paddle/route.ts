import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase service role client — bypasses RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )
}

// Paddle webhook event types we handle
type PaddleEvent = {
  event_type: string
  data: {
    id: string                        // paddle subscription id
    customer_id: string
    status: string                    // active | canceled | past_due | trialing
    items: Array<{ price: { id: string; billing_cycle?: { interval: string } } }>
    current_billing_period?: { ends_at: string }
    cancel_at_period_end?: boolean
    custom_data?: { user_id?: string }
  }
}

export async function POST(request: Request) {
  const body = await request.text()

  // Signature verification — enable after adding PADDLE_WEBHOOK_SECRET to env
  // const secret = process.env.PADDLE_WEBHOOK_SECRET
  // if (secret) {
  //   const signature = request.headers.get('paddle-signature') ?? ''
  //   const valid = await verifyPaddleSignature(body, signature, secret)
  //   if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  // }

  let event: PaddleEvent
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { event_type, data } = event

  if (
    event_type === 'subscription.created' ||
    event_type === 'subscription.updated' ||
    event_type === 'subscription.activated'
  ) {
    const userId = data.custom_data?.user_id
    if (!userId) {
      console.error('[paddle webhook] Missing user_id in custom_data')
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
      console.error('[paddle webhook] upsert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  if (event_type === 'subscription.canceled') {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('paddle_subscription_id', data.id)

    if (error) console.error('[paddle webhook] cancel update error:', error)
  }

  if (event_type === 'subscription.past_due') {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('paddle_subscription_id', data.id)

    if (error) console.error('[paddle webhook] past_due update error:', error)
  }

  return NextResponse.json({ received: true })
}
