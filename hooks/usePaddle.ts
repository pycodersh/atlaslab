'use client'

import { useEffect, useState } from 'react'
import type { Paddle } from '@paddle/paddle-js'
import { getPaddle } from '@/lib/paddle/client'

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(null)

  useEffect(() => {
    getPaddle().then(setPaddle)
  }, [])

  return paddle
}
