'use client'

import { useEffect, useRef } from 'react'
import OneSignal from 'react-onesignal'
import { useAuth } from '@/contexts/AuthContext'

let initialized = false

export function OneSignalInit() {
  const { user } = useAuth()
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  const initDone = useRef(false)

  useEffect(() => {
    if (!appId || initialized || initDone.current) return
    initialized = true
    initDone.current = true

    OneSignal.init({
      appId,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerParam: { scope: '/' },
      allowLocalhostAsSecureOrigin: true,
    }).catch(() => {})
  }, [appId])

  useEffect(() => {
    if (!appId) return

    if (user?.id) {
      OneSignal.login(user.id).catch(() => {})
    } else {
      OneSignal.logout().catch(() => {})
    }
  }, [appId, user?.id])

  return null
}
