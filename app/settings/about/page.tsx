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

function SecTitle({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em',
      color: '#8E8E93', textTransform: 'uppercase',
      margin: '24px 0 8px 2px',
    }}>
      {label}
    </p>
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
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
      borderBottom: last ? 'none' : '1px solid var(--pd)',
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
      href: '/settings/about/terms',
    },
    {
      icon: Shield, iconColor: '#8E8E93',
      label: t('privacy_label'), desc: t('privacy_desc'),
      href: '/settings/about/privacy',
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
            onClick={() => router.push('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
            Profile
          </button>
        )}

        {/* Legal */}
        <SecTitle label="Legal" />
        <div style={glassCard}>
          {LEGAL.map(item => <AboutRow key={item.label} item={item} />)}
        </div>

        {/* Support */}
        <SecTitle label="Support" />
        <div style={glassCard}>
          {SUPPORT.map(item => <AboutRow key={item.label} item={item} />)}
        </div>

        {/* Version */}
        <SecTitle label="Version" />
        <div style={glassCard}>
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
