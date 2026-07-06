'use client'

import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 4px 18px rgba(40,40,60,0.06), 0 1px 4px rgba(40,40,60,0.03)',
  overflow: 'hidden',
}

function SettingsRow({
  icon: Icon,
  label,
  desc,
  href,
  last = false,
}: {
  icon: React.ElementType
  label: string
  desc: string
  href: string
  last?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 20px',
        textDecoration: 'none',
        borderBottom: last ? 'none' : '1px solid rgba(60,60,67,0.06)',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.72' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: 'rgba(248,248,250,0.7)',
        border: '1px solid rgba(60,60,67,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 14, height: 14, color: '#6E6E73' }} strokeWidth={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 15, fontWeight: 600,
          color: '#1C1C1E', margin: '0 0 1px',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 12, color: '#AEAEB2',
          margin: 0, fontWeight: 400, lineHeight: 1.4,
        }}>
          {desc}
        </p>
      </div>

      <ChevronRight style={{ width: 12, height: 12, color: '#C7C7CC', flexShrink: 0 }} strokeWidth={1.8} />
    </Link>
  )
}

export default function SettingsPage() {
  const t = useT()

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: `12px 20px calc(${TAB_BAR_HEIGHT}px + 40px)`,
        boxSizing: 'border-box',
      }}>

        {/* Editorial header */}
        <div style={{ marginBottom: 32, paddingLeft: 4 }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
            color: '#AEAEB2', margin: '0 0 10px', textTransform: 'uppercase',
          }}>
            Your Learning Space
          </p>
          <p style={{
            fontSize: 26, fontWeight: 700,
            letterSpacing: '-0.025em', lineHeight: 1.1,
            color: '#1C1C1E', margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            학습 환경을<br />관리합니다.
          </p>
        </div>

        {/* Card 1 — Account + Preferences */}
        <div style={{ ...glass, marginBottom: 14 }}>
          <SettingsRow
            icon={UserCircle}
            label={t('hub_account')}
            desc={t('hub_account_desc')}
            href="/settings/auth"
          />
          <SettingsRow
            icon={SlidersHorizontal}
            label={t('hub_preferences')}
            desc={t('hub_preferences_desc')}
            href="/settings/preferences"
            last
          />
        </div>

        {/* Card 2 — Subscription + About */}
        <div style={glass}>
          <SettingsRow
            icon={Sparkles}
            label={t('hub_subscription')}
            desc={t('hub_subscription_desc')}
            href="/settings/subscription"
          />
          <SettingsRow
            icon={Info}
            label={t('hub_about')}
            desc={t('hub_about_desc')}
            href="/settings/about"
            last
          />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <p style={{
            fontSize: 11, color: '#D1D1D6', fontWeight: 400,
            margin: 0, letterSpacing: '0.02em',
          }}>
            v1.0.0
          </p>
        </div>

      </div>
    </div>
  )
}
