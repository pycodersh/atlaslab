'use client'

import { KP } from '@/lib/kpatto/theme'
import { InstallAppButton as Base, InstallPromptCatcher, type InstallAppButtonProps } from '@/components/pwa/InstallAppButton'
import { InstallAppCard as Card } from '@/components/pwa/InstallAppCard'

/**
 * K-PATTO 설치 버튼 — 동작은 공통 컴포넌트(components/pwa/InstallAppButton.tsx), 여기는 이름·색만 채운다.
 * 매니페스트: public/kpatto/manifest.webmanifest (app/kpatto/layout.tsx 에서 연결)
 */
const THEME = { appName: 'K-PATTO', accent: KP.primary, accentLight: KP.primaryLight, accentBorder: KP.primaryBorder }

export const KPattoInstallPromptCatcher = InstallPromptCatcher

/** 앱 안 기본은 코랄 소프트 버튼(검은 버튼은 설정 메뉴 톤과 어긋났다) */
export function InstallAppButton({ variant = 'soft', ...props }: InstallAppButtonProps) {
  return <Base theme={THEME} variant={variant} {...props} />
}

/** 랜딩(/kpatto) 가격 카드 아래 슬림 설치 카드 */
export function InstallAppCard() {
  return <Card theme={THEME} iconSrc="/icons/kpatto/icon-192.png" />
}
