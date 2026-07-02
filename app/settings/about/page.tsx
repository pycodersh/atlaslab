'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, ScrollText, Shield, Mail, Info } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'

export default function AboutPage() {
  const t = useT()

  const ITEMS = [
    {
      icon: ScrollText,
      label: 'Terms of Service',
      desc: t('terms_desc'),
      href: '/settings/about/terms',
      value: null,
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      desc: t('privacy_desc'),
      href: '/settings/about/privacy',
      value: null,
    },
    {
      icon: Mail,
      label: 'Contact',
      desc: 'support@patto.app',
      href: null,
      value: null,
    },
    {
      icon: Info,
      label: 'Version',
      desc: 'PATTO v1.0.0',
      href: null,
      value: '1.0.0',
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Back */}
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--pm)', textDecoration: 'none',
            marginBottom: 32, width: 'fit-content',
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          <span style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('back')}
          </span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 className="font-playfair" style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.2rem)',
            fontWeight: 900, lineHeight: 1, color: 'var(--pt)',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            About PATTO
          </h1>
          <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8, lineHeight: 1.5 }}>
            {t('about_sub')}
          </p>
        </div>

        {/* Rows */}
        <div>
          {ITEMS.map(({ icon: Icon, label, desc, href, value }, i) => {
            const rowContent = (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0',
                borderBottom: i < ITEMS.length - 1 ? '1px solid var(--pd)' : 'none',
              }}>
                <Icon style={{ width: 17, height: 17, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.5} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px', letterSpacing: '0.01em' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{desc}</p>
                </div>
                {value ? (
                  <span style={{ fontSize: 13, color: 'var(--pm)', fontWeight: 500, flexShrink: 0 }}>
                    {value}
                  </span>
                ) : href ? (
                  <ChevronRight style={{ width: 14, height: 14, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.4} />
                ) : null}
              </div>
            )

            return href ? (
              <Link key={label} href={href} style={{ display: 'block', textDecoration: 'none' }}>
                {rowContent}
              </Link>
            ) : (
              <div key={label}>{rowContent}</div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 64, textAlign: 'center' }}>
          <p className="font-playfair" style={{
            fontSize: 15, fontWeight: 900, letterSpacing: '0.06em',
            color: 'var(--pa)', margin: '0 0 5px', opacity: 0.7,
          }}>
            PATTO
          </p>
          <p style={{ fontSize: 8, letterSpacing: '0.22em', color: 'var(--pm2)', margin: 0 }}>
            PATTERNS. STORIES. YOU.
          </p>
        </div>

      </div>
    </div>
  )
}
