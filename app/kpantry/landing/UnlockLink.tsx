'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import UnlockModal from '@/components/kpantry/paywall/UnlockModal'
import { KP_THEME_CSS } from '@/components/kpantry/ui/theme'

/**
 * 랜딩 가격 섹션의 'already bought? Unlock the app here' — 누르면 주문 번호·이메일 언락 모달을 바로 띄운다.
 * (K-PATTO 는 /kpatto/redeem 페이지로 보내지만, K-Pantry 는 앱 안 모달을 그대로 쓴다)
 * 랜딩은 앱 레이아웃 밖이라 모달이 쓰는 --kp-* 변수를 여기서 깔아 준다.
 * 링크가 문단(<p>) 안에 있어서 모달은 body 로 포털한다 — <p> 안에 <div> 를 두면 HTML 이 깨진다.
 * 언락에 성공하면 쿠키가 심긴 상태로 앱 레시피 목록으로 보낸다.
 */
export default function UnlockLink({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: 0, border: 'none', background: 'none', cursor: 'pointer',
          font: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3,
          ...style,
        }}
      >
        {children}
      </button>
      {open && createPortal(
        <div className="kp-app">
          <style>{KP_THEME_CSS}</style>
          <UnlockModal
            onClose={() => setOpen(false)}
            onUnlocked={() => { window.location.href = '/kpantry/en/recipes' }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
