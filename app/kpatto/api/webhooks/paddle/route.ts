import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

const KPATTO_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_KPATTO_PRICE_ID

export async function POST(request: Request) {
  const body = await request.text()

  let event: PaddleEvent
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { event_type, data } = event
  const priceId = data.items?.[0]?.price?.id

  // K-PATTO Pro webhook
  if (KPATTO_PRICE_ID && priceId === KPATTO_PRICE_ID) {
    const userId = data.custom_data?.user_id
    if (!userId) {
      console.error('[kpatto webhook] Missing user_id in custom_data')
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

      if (error) {
        console.error('[kpatto webhook] update error:', error)
        return NextResponse.json({ error: 'DB error' }, { status: 500 })
      }
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

      if (error) console.error('[kpatto webhook] cancel update error:', error)
    }

    return NextResponse.json({ received: true })
  }

  // Unrecognized price — ignore
  return NextResponse.json({ received: true })
}
