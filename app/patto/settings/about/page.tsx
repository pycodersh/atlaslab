'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ScrollText, Shield, ReceiptText, Mail, Info } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'
import { useIsDesktop } from '@/hooks/useIsDesktop'

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

function IconCircle({ children }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

function SecTitle({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#1E293B', borderRadius: 10,
      padding: '10px 16px', marginTop: 24, marginBottom: 12,
    }}>
      <span style={{ color: '#818CF8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF' }}>{label}</span>
    </div>
  )
}

type RowItem = {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  iconColor: string
  accent?: string
  label: string
  desc: string
  href?: string | null
  value?: string | null
  last?: boolean
}

function AboutRow({ item }: { item: RowItem }) {
  const { icon: Icon, iconColor, accent, label, desc, href, value, last } = item

  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
      borderBottom: last ? 'none' : '0.5px solid var(--pglass-border)',
    }}>
      <IconCircle accent={accent}>
        <Icon style={{ width: 17, height: 17, color: iconColor }} strokeWidth={1.6} />
      </IconCircle>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: '0 0 1px' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
      {value
        ? <span style={{ fontSize: 12, color: 'var(--pm)', fontWeight: 500, flexShrink: 0 }}>{value}</span>
        : href
          ? <ChevronRight style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.5} />
          : null
      }
    </div>
  )

  if (href) {
    return (
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        {inner}
      </Link>
    )
  }
  return <div>{inner}</div>
}

export default function AboutPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const t = useT()

  const LEGAL: RowItem[] = [
    {
      icon: ScrollText, iconColor: '#8E8E93',
      label: t('terms_label'), desc: t('terms_desc'),
      href: '/patto/settings/about/terms',
    },
    {
      icon: Shield, iconColor: '#8E8E93',
      label: t('privacy_label'), desc: t('privacy_desc'),
      href: '/patto/settings/about/privacy',
    },
    {
      icon: ReceiptText, iconColor: '#8E8E93',
      label: t('refund_label'), desc: t('refund_desc'),
      href: '/settings/about/refunds', last: true,
    },
  ]

  const SUPPORT: RowItem[] = [
    {
      icon: Mail, iconColor: '#8E8E93',
      label: 'Contact', desc: 'support@patto.app',
      href: null, last: true,
    },
  ]

  const VERSION: RowItem[] = [
    {
      icon: Info, iconColor: '#8E8E93',
      label: 'Version', desc: 'PATTO v1.0.0',
      href: null, value: '1.0.0', last: true,
    },
  ]

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>
        {isDesktop && (
          <button
            type="button"
            onClick={() => router.push('/patto/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
            Profile
          </button>
        )}

        {/* Legal */}
        <SecTitle label="Legal" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} />
        <div>
          {LEGAL.map(item => <AboutRow key={item.label} item={item} />)}
        </div>

        {/* Support */}
        <SecTitle label="Support" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} />
        <div>
          {SUPPORT.map(item => <AboutRow key={item.label} item={item} />)}
        </div>

        {/* Version */}
        <SecTitle label="Version" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
        <div>
          {VERSION.map(item => <AboutRow key={item.label} item={item} />)}
        </div>

        {/* Footer version only */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
          v1.0.0
        </p>
      </div>
    </div>
  )
}
