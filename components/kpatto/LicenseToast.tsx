'use client'

import { useEffect, useState } from 'react'
import { LICENSE_EVENT } from '@/lib/kpatto/license'

/** 라이선스 키로 잠금이 풀리면 한 번 띄우는 토스트 — 앱 레이아웃에 하나만 둔다 */
export function LicenseToast() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const onChange = (e: Event) => {
      // 30일 재확인으로 조용히 갱신될 때는 띄우지 않는다 — 사람이 키를 넣었을 때만(detail.announce)
      const d = (e as CustomEvent<{ unlocked?: boolean; announce?: boolean }>).detail
      if (!d?.unlocked || !d.announce) return
      setShow(true)
      clearTimeout(timer)
      timer = setTimeout(() => setShow(false), 4000)
    }
    window.addEventListener(LICENSE_EVENT, onChange)
    return () => { window.removeEventListener(LICENSE_EVENT, onChange); clearTimeout(timer) }
  }, [])

  if (!show) return null
  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: '50%', bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))', transform: 'translateX(-50%)',
        zIndex: 400, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box',
        background: '#111', color: '#fff', borderRadius: 14, padding: '13px 18px',
        fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,.25)',
      }}
    >
      🎉 Pro Version Unlocked! Enjoy all 100 episodes.
    </div>
  )
}
