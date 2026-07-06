'use client'

import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(60,60,67,0.07)',
  boxShadow: '0 1px 6px rgba(40,40,60,0.04)',
}

function MenuCard({
  icon: Icon,
  label,
  desc,
  href,
}: {
  icon: React.ElementType
  label: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      style={{
        ...card,
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '13px 16px',
        textDecoration: 'none',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.70' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'rgba(245,245,247,0.9)',
        border: '1px solid rgba(60,60,67,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 13, height: 13, color: '#6E6E73' }} strokeWidth={1.6} />
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
          fontSize: 11.5, color: '#C0C0C5',
          margin: 0, fontWeight: 400, lineHeight: 1.35,
        }}>
          {desc}
        </p>
      </div>

      <ChevronRight style={{ width: 11, height: 11, color: '#D1D1D6', flexShrink: 0 }} strokeWidth={2} />
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
        padding: `8px 20px calc(${TAB_BAR_HEIGHT}px + 32px)`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>

        <MenuCard
          icon={UserCircle}
          label={t('hub_account')}
          desc={t('hub_account_desc')}
          href="/settings/auth"
        />
        <MenuCard
          icon={SlidersHorizontal}
          label={t('hub_preferences')}
          desc={t('hub_preferences_desc')}
          href="/settings/preferences"
        />
        <MenuCard
          icon={Sparkles}
          label={t('hub_subscription')}
          desc={t('hub_subscription_desc')}
          href="/settings/subscription"
        />
        <MenuCard
          icon={Info}
          label={t('hub_about')}
          desc={t('hub_about_desc')}
          href="/settings/about"
        />

        <p style={{
          fontSize: 11, color: '#D1D1D6', fontWeight: 400,
          margin: '12px 0 0', textAlign: 'center', letterSpacing: '0.02em',
        }}>
          v1.0.0
        </p>

      </div>
    </div>
  )
}
