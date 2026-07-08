'use client'

import { initializePaddle, type Paddle } from '@paddle/paddle-js'

let paddleInstance: Paddle | null = null

export async function getPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  if (!token) {
    console.error('[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set')
    return null
  }

  const isSandbox = process.env.NEXT_PUBLIC_PADDLE_SANDBOX === 'true'

  const instance = await initializePaddle({
    token,
    environment: isSandbox ? 'sandbox' : 'production',
  })

  paddleInstance = instance ?? null
  return paddleInstance
}
