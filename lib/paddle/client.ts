'use client'

import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { cleanEnvLoud } from './env'

let paddleInstance: Paddle | null = null

export async function getPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance

  // ★ `process.env.NEXT_PUBLIC_…`를 글자 그대로 둔 채 값만 넘긴다 —
  //   이름을 넘기면 Next가 빌드 때 값을 못 끼워 넣어 브라우저에서 undefined가 된다.
  //   BOM이 한 글자라도 붙으면 Authorization 헤더를 만들다 throw한다(lib/paddle/env.ts).
  const token = cleanEnvLoud(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN, 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN')
  if (!token) {
    console.error('[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set')
    return null
  }

  console.log('[paddle] initializing with environment: production, token prefix:', token.slice(0, 8))

  const instance = await initializePaddle({ token, environment: 'production' })

  paddleInstance = instance ?? null
  return paddleInstance
}
