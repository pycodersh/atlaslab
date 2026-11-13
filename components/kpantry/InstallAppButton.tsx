'use client'

import { InstallAppButton as Base, InstallPromptCatcher, type InstallAppButtonProps } from '@/components/pwa/InstallAppButton'

/**
 * K-Pantry 설치 버튼 — 동작은 공통 컴포넌트(components/pwa/InstallAppButton.tsx), 여기는 이름·색만 채운다.
 * 매니페스트: public/kpantry/manifest.webmanifest (app/kpantry/en/layout.tsx · app/kpantry/landing/page.tsx 에서 연결)
 * 안내 모달은 body 로 포털되어 --kp-* 변수 밖이라 색을 직접 쓴다(components/kpantry/ui/theme.ts 와 같은 값).
 */
const THEME = { appName: 'K-Pantry', accent: '#C8102E', accentLight: '#FBEEF0' }

export const KPantryInstallPromptCatcher = InstallPromptCatcher

export function InstallAppButton(props: InstallAppButtonProps) {
  return <Base theme={THEME} {...props} />
}
