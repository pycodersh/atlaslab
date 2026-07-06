'use client'

import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { useT } from '@/hooks/useT'

export default function SettingsPage() {
  const t = useT()

  const HUBS = [
    {
      icon: UserCircle,
      label: t('hub_account'),
      desc: t('hub_account_desc'),
      href: '/settings/auth',
    },
    {
      icon: SlidersHorizontal,
      label: t('hub_preferences'),
      desc: t('hub_preferences_desc'),
      href: '/settings/preferences',
    },
    {
      icon: Sparkles,
      label: t('hub_subscription'),
      desc: t('hub_subscription_desc'),
      href: '/settings/subscription',
    },
    {
      icon: Info,
      label: t('hub_about'),
      desc: t('hub_about_desc'),
      href: '/settings/about',
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        paddingTop: 16,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: TAB_BAR_HEIGHT + 32,
        boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 38, fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1,
            color: '#1C1C1E', margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            Profile
          </p>
          <p style={{
            fontSize: 14, color: '#6E6E73',
            margin: '8px 0 0', lineHeight: 1.5,
            fontWeight: 400, letterSpacing: '-0.01em',
          }}>
            나에게 맞는 학습 환경을 설정하세요.
          </p>
        </div>

        {/* Settings card */}
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 12px 36px rgba(40,40,60,0.08), 0 2px 8px rgba(40,40,60,0.04)',
          overflow: 'hidden',
        }}>
          {HUBS.map(({ icon: Icon, label, desc, href }, idx) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 24px',
                textDecoration: 'none',
                borderBottom: idx < HUBS.length - 1 ? '1px solid rgba(230,232,236,0.9)' : 'none',
                transition: 'filter 0.15s, transform 0.15s',
                minHeight: 84,
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.filter = 'brightness(0.98)'
                el.style.transform = 'scale(0.99)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.filter = 'brightness(1)'
                el.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 13,
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(220,225,235,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 1px 4px rgba(40,40,60,0.05)',
              }}>
                <Icon style={{ width: 18, height: 18, color: '#6E6E73' }} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 15.5, fontWeight: 700,
                  color: '#1C1C1E', margin: '0 0 2px',
                  letterSpacing: '-0.01em',
                }}>
                  {label}
                </p>
                <p style={{
                  fontSize: 12, color: '#6E6E73',
                  margin: 0, fontWeight: 500,
                  lineHeight: 1.4,
                }}>
                  {desc}
                </p>
              </div>
              <ChevronRight style={{ width: 14, height: 14, color: '#8E8E93', flexShrink: 0 }} strokeWidth={1.8} />
            </Link>
          ))}
        </div>

        {/* Footer version */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{
            fontSize: 11, color: '#B0B3B8', fontWeight: 500,
            margin: 0, letterSpacing: '0.02em',
          }}>
            v1.0.0
          </p>
        </div>

      </div>
    </div>
  )
}