import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )
}

// Paddle-Signature: ts=<timestamp>;h1=<hex_hmac_sha256>
async function verifyPaddleSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    signature.split(';').map(p => p.split('=') as [string, string]),
  )
  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${ts}:${body}`),
  )
  const computed = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === h1
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

  // Signature verification (skipped if PADDLE_WEBHOOK_SECRET is not set)
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (secret) {
    const signature = request.headers.get('paddle-signature') ?? ''
    const valid = await verifyPaddleSignature(body, signature, secret)
    if (!valid) {
      console.error('[kpatto webhook] invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
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

  if (KPATTO_PRICE_ID && priceId !== KPATTO_PRICE_ID) {
    return NextResponse.json({ received: true })
  }

  const userId = data.custom_data?.user_id
  if (!userId) {
    console.error('[kpatto webhook] missing user_id in custom_data')
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

    if (error) console.error('[kpatto webhook] cancel error:', error)
  }

  return NextResponse.json({ received: true })
}
