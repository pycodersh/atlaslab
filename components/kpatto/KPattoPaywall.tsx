'use client'

import { useEffect } from 'react'
import { KPattoUnlockPanel } from './KPattoUnlockPanel'

interface Props {
  onDismiss: () => void
  /** 키로 잠금이 풀린 뒤(기본: 닫기) — 직접 연 잠긴 화면은 다시 그리기만 하면 된다 */
  onUnlocked?: () => void
}

/**
 * 잠긴 에피소드(EP11~)를 눌렀을 때 뜨는 하단 시트.
 * 앱 안 결제(Paddle 월 구독)는 없앴다 — 내용은 KPattoUnlockPanel 이 웹사이트 랜딩으로 안내한다.
 * 배경 클릭 · Esc · Later 로 닫힌다.
 */
export function KPattoPaywall({ onDismiss, onUnlocked }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Unlock all episodes"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          padding: '32px 24px calc(28px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
        }}
      >
        <KPattoUnlockPanel onLater={onDismiss} onUnlocked={onUnlocked ?? onDismiss} />
      </div>
    </div>
  )
}
