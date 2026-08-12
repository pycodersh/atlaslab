import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Contact — Atlas Lab',
  description:
    'Get in touch with Atlas Lab Studios — support, feedback, partnerships, and general enquiries.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/contact' },
}

const S = '"DM Sans","Inter",system-ui,sans-serif'

const TOPICS = [
  { icon: '🐛', label: 'Bug report', desc: 'Something broken? Let us know the app, device, and what happened.' },
  { icon: '💡', label: 'Feature request', desc: 'Have an idea that would make our apps better? We read everything.' },
  { icon: '💳', label: 'Billing issue', desc: 'Charge questions, refund requests, or subscription help.' },
  { icon: '🤝', label: 'Partnership', desc: 'Content collaboration, API access, or business enquiries.' },
  { icon: '📰', label: 'Press', desc: 'Press kits, interview requests, or media enquiries.' },
]

export default function ContactPage() {
  return (
    <div style={{ background: '#0a0a1a', color: 'white', fontFamily: S }}>
      <SiteNav />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
            Contact
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12, color: '#fff' }}>
            Get in touch
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            We&apos;re a small team — we read every message and reply within 2–3 business days.
          </p>
        </div>

        {/* Primary contact */}
        <div style={{
          background: 'rgba(124,111,255,0.08)',
          border: '0.5px solid rgba(124,111,255,0.25)',
          borderRadius: 16,
          padding: '28px 28px',
          marginBottom: 40,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Email us at</p>
          <a
            href="mailto:contact@atlaslabstudios.com"
            style={{ fontSize: 20, fontWeight: 700, color: '#a89fff', textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            contact@atlaslabstudios.com
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
            We typically respond within 2–3 business days (Mon–Fri, KST).
          </p>
        </div>

        {/* Topic guide */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 16, letterSpacing: '0.04em' }}>
            What can we help with?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOPICS.map(t => (
              <div
                key={t.label}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{t.label}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing note */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '18px 20px',
          marginBottom: 40,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
            💳 Billing &amp; Subscriptions
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Payments are processed by <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Paddle</strong> (our Merchant of Record). For urgent billing
            disputes you can also contact Paddle support directly at{' '}
            <a href="https://www.paddle.com/support" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>
              paddle.com/support
            </a>.
          </p>
        </div>

        {/* Quick links */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 14, letterSpacing: '0.04em' }}>Quick links</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            {[
              { href: '/about', label: 'About Atlas Lab' },
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
              { href: '/blog', label: 'Blog' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
