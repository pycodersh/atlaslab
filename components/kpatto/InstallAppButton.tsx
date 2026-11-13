'use client'

import { KP } from '@/lib/kpatto/theme'
import { InstallAppButton as Base, InstallPromptCatcher, type InstallAppButtonProps } from '@/components/pwa/InstallAppButton'

/**
 * K-PATTO 설치 버튼 — 동작은 공통 컴포넌트(components/pwa/InstallAppButton.tsx), 여기는 이름·색만 채운다.
 * 매니페스트: public/kpatto/manifest.webmanifest (app/kpatto/layout.tsx 에서 연결)
 */
const THEME = { appName: 'K-PATTO', accent: KP.primary, accentLight: KP.primaryLight }

export const KPattoInstallPromptCatcher = InstallPromptCatcher

export function InstallAppButton(props: InstallAppButtonProps) {
  return <Base theme={THEME} {...props} />
}
