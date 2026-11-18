'use client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * 앱 설정 화면 공용 부품 — K-PATTO(/kpatto/profile) · K-Pantry(/kpantry/en/settings)가 같이 쓴다.
 * 회색 대문자 섹션 머리 · 흰 카드 · 선 아이콘(18px · 선 1.8 · 포인트색) 행 · 행 구분선.
 * 포인트색은 앱마다 다르다: K-PATTO 코랄 #FF5A36, K-Pantry 브랜드 레드 #C8102E — accent 로 넘긴다.
 */

export const SETTINGS_T1 = '#111111'
export const SETTINGS_T2 = '#666666'
export const SETTINGS_BORDER = '#E8E4DF'
export const SETTINGS_ROW_DIV = '#F0EDE8'

export function SettingsSectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 16px 10px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#999999', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: '0 16px',
      background: '#FFFFFF',
      border: `1px solid ${SETTINGS_BORDER}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {children}
    </div>
  )
}

export function SettingsRowDivider() {
  return <div style={{ height: 1, background: SETTINGS_ROW_DIV, margin: '0 16px' }} />
}

type RowProps = {
  icon: React.ElementType
  label: string
  value?: string
  accent: string
  danger?: boolean
}

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  width: '100%', padding: '14px 16px', boxSizing: 'border-box',
  background: 'none', border: 'none', fontFamily: 'inherit', textAlign: 'left', textDecoration: 'none',
}

function RowInner({ icon: Icon, label, value, accent, danger, chevron }: RowProps & { chevron: boolean }) {
  return (
    <>
      <Icon size={18} color={danger ? '#EF4444' : accent} strokeWidth={1.8} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: danger ? '#EF4444' : SETTINGS_T1 }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: SETTINGS_T2, marginRight: 4 }}>{value}</span>}
      {chevron && <ChevronRight size={15} color="#CCCCCC" strokeWidth={2} style={{ flexShrink: 0 }} aria-hidden="true" />}
    </>
  )
}

/** 누르면 무언가 하는 행(모달 열기 등). onClick 이 없으면 값만 보이는 정보 행 */
export function SettingsRowItem({ onClick, ...props }: RowProps & { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...rowStyle, cursor: onClick ? 'pointer' : 'default' }}>
      <RowInner {...props} chevron={!!onClick} />
    </button>
  )
}

/** 다른 화면·외부 주소로 가는 행 */
export function SettingsRowLink({ href, external, valueAccent, ...props }: RowProps & { href: string; external?: boolean; valueAccent?: boolean }) {
  const inner = valueAccent
    ? (
      <>
        <props.icon size={18} color={props.accent} strokeWidth={1.8} style={{ flexShrink: 0 }} aria-hidden="true" />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: SETTINGS_T1 }}>{props.label}</span>
        {props.value && <span style={{ fontSize: 13, color: props.accent, fontWeight: 500 }}>{props.value}</span>}
      </>
    )
    : <RowInner {...props} chevron />
  return external || href.startsWith('mailto:')
    ? <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener" style={{ ...rowStyle, cursor: 'pointer' }}>{inner}</a>
    : <Link href={href} style={{ ...rowStyle, cursor: 'pointer' }}>{inner}</Link>
}
