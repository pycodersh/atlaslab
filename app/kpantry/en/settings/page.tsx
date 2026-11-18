'use client'
import { FileText, Globe, Info, Mail, ReceiptText, Shield } from 'lucide-react'
import HomeLink from '@/components/kpantry/layout/HomeLink'
import { InstallAppButton } from '@/components/kpantry/InstallAppButton'
import { KPantryLicenseCard } from '@/components/kpantry/settings/KPantryLicenseCard'
import {
  SettingsCard, SettingsRowDivider, SettingsRowItem, SettingsRowLink, SettingsSectionHeader,
} from '@/components/settings/SettingsKit'

const ACCENT = '#C8102E'
const VERSION = '1.0.0'

/**
 * K-Pantry 설정 — K-PATTO 설정(/kpatto/profile)과 같은 부품(components/settings/SettingsKit)·같은 순서.
 *   LICENSE        Pro 상태 · 주문번호/이메일로 활성화 · Deactivate / Transfer
 *   (앱 설치)       브랜드 틴트 버튼 — 설치된 창에서는 보이지 않는다
 *   APP SETTINGS   Language — K-Pantry 는 지금 영어판(/kpantry/en)뿐이라 값만 보인다
 *   ABOUT K-PANTRY Terms · Privacy · Refund · Contact · Version
 * 헤더 오른쪽의 프로필 아이콘(KPantryHeader)이 여기로 온다.
 */
export default function KPantrySettingsPage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '40px 20px 4px' }}>
        <HomeLink />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '14px 0 0' }}>
          Settings
        </h1>
      </div>

      <SettingsSectionHeader label="License" />
      <KPantryLicenseCard />
      <div style={{ margin: '12px 16px 0' }}>
        <InstallAppButton variant="soft" />
      </div>

      <SettingsSectionHeader label="App Settings" />
      <SettingsCard>
        <SettingsRowItem icon={Globe} label="Language" value="English" accent={ACCENT} />
      </SettingsCard>

      <SettingsSectionHeader label="About K-Pantry" />
      <SettingsCard>
        <SettingsRowLink icon={FileText} label="Terms of Service" href="/terms" accent={ACCENT} />
        <SettingsRowDivider />
        <SettingsRowLink icon={Shield} label="Privacy Policy" href="/privacy" accent={ACCENT} />
        <SettingsRowDivider />
        <SettingsRowLink icon={ReceiptText} label="Refund Policy" href="/kpantry/en/refund" accent={ACCENT} />
        <SettingsRowDivider />
        <SettingsRowLink icon={Mail} label="Contact Us" href="mailto:contact@atlaslabstudios.com" value="contact@atlaslabstudios.com" valueAccent accent={ACCENT} />
        <SettingsRowDivider />
        <SettingsRowItem icon={Info} label="Version" value={VERSION} accent={ACCENT} />
      </SettingsCard>
    </div>
  )
}
