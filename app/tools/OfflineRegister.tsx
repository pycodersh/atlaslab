'use client'

import { useEffect } from 'react'

/** /tools 전용 서비스 워커 등록 — 개발 서버에서 캐시가 끼어들지 않도록 프로덕션에서만 */
export function OfflineRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/tools/sw.js', { scope: '/tools/' }).catch(() => undefined)
  }, [])
  return null
}
