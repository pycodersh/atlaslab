'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { useAuth } from '@/contexts/AuthContext'

export function OneSignalInit() {
  const { user } = useAuth()
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  useEffect(() => {
    if (!appId) return

    OneSignal.init({
      appId,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
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
