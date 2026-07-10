'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OneSignalDeferred?: any[]
  }
}

export function OneSignalInit() {
  const { user } = useAuth()
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  useEffect(() => {
    if (!appId || typeof window === 'undefined') return

    window.OneSignalDeferred = window.OneSignalDeferred ?? []

    // Load SDK script once
    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script')
      script.id = 'onesignal-sdk'
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      document.head.appendChild(script)
    }

    window.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
      })
    })
  }, [appId])

  // Sync auth user ↔ OneSignal external ID
  useEffect(() => {
    if (!appId || typeof window === 'undefined') return

    window.OneSignalDeferred = window.OneSignalDeferred ?? []
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      if (user?.id) {
        await OneSignal.login(user.id)
      } else {
        await OneSignal.logout()
      }
    })
  }, [appId, user?.id])

  return null
}
