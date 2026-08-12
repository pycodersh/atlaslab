import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Terms of Service — Atlas Lab',
  description:
    'Atlas Lab Studios terms of service governing the use of Patto, K-Patto, K-Pantry, and Career Navi.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/terms' },
}

const S = '"DM Sans","Inter",system-ui,sans-serif'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
      {children}
    </p>
  )
}

function UL({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function TermsPage() {
  return (
    <div style={{ background: '#0a0a1a', color: 'white', fontFamily: S }}>
      <SiteNav />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
            Legal
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12, color: '#fff' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Last updated: July 1, 2025 &nbsp;·&nbsp; Effective: July 1, 2025
          </p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginTop: 24 }} />
        </div>

        <Section title="1. Acceptance of Terms">
          <P>
            By accessing or using any service provided by Atlas Lab Studios (&quot;Atlas Lab&quot;, &quot;we&quot;,
            &quot;our&quot;) — including Patto, K-Patto, K-Pantry, Career Navi, and this website — you
            agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not
            use our services.
          </P>
          <P>
            We may update these Terms at any time. Continued use after a change constitutes
            acceptance.
          </P>
        </Section>

        <Section title="2. Description of Services">
          <P>Atlas Lab Studios operates the following applications:</P>
          <UL items={[
            'Patto — an AI-powered English pattern learning app',
            'K-Patto — a Korean language pattern learning app for global learners',
            'K-Pantry — a Korean recipe discovery and meal planning app',
            'Career Navi — an AI career navigation service for Korean professionals (in development)',
          ]} />
          <P>
            Features and pricing may change at any time. We will notify active subscribers of
            material changes that affect paid features.
          </P>
        </Section>

        <Section title="3. User Accounts">
          <P>
            Some features require creating an account. You agree to:
          </P>
          <UL items={[
            'Provide accurate information when creating your account',
            'Maintain the security of your account credentials',
            'Notify us immediately of any unauthorised use of your account',
            'Be at least 13 years of age (or have parental consent where required by local law)',
          ]} />
          <P>
            You are responsible for all activity that occurs under your account.
          </P>
        </Section>

        <Section title="4. Subscriptions and Payments">
          <P>
            Certain features are available only through a paid subscription. Subscriptions are
            processed and managed by{' '}
            <strong>Paddle</strong> (our Merchant of Record). By subscribing you also agree to{' '}
            <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>
              Paddle&apos;s terms
            </a>.
          </P>
          <UL items={[
            'Subscriptions renew automatically unless cancelled before the renewal date',
            'You can cancel at any time from your account settings; access continues until the current billing period ends',
            'Refunds are handled on a case-by-case basis — contact us within 7 days of a charge for assistance',
            'Prices are displayed inclusive of applicable taxes where required by law',
          ]} />
        </Section>

        <Section title="5. Acceptable Use">
          <P>You agree not to:</P>
          <UL items={[
            'Use our services for any unlawful purpose',
            'Attempt to reverse-engineer, scrape, or automate access to our services beyond normal usage',
            'Share, resell, or redistribute subscription access to third parties',
            'Submit false, misleading, or harmful content',
            'Interfere with the security or integrity of our systems',
            'Impersonate Atlas Lab or any other person or entity',
          ]} />
          <P>
            We reserve the right to suspend or terminate accounts that violate these rules.
          </P>
        </Section>

        <Section title="6. Intellectual Property">
          <P>
            All content provided by Atlas Lab — including course materials, stories, patterns,
            recipes, software, and design — is owned by Atlas Lab Studios or its licensors and is
            protected by copyright and other intellectual property laws.
          </P>
          <P>
            Your subscription grants you a personal, non-transferable licence to access the content
            for your own learning and use. You may not copy, distribute, or create derivative works
            without our written permission.
          </P>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <P>
            Our services are provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any
            kind, express or implied. We do not warrant that the services will be uninterrupted,
            error-free, or free of viruses or harmful components.
          </P>
        </Section>

        <Section title="8. Limitation of Liability">
          <P>
            To the maximum extent permitted by applicable law, Atlas Lab Studios and its affiliates
            shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages, including loss of data or profits, arising from your use of or inability to
            use our services.
          </P>
          <P>
            Our total liability for any claim arising from these Terms shall not exceed the greater
            of (a) the amount you paid to us in the 12 months preceding the claim or (b) USD 50.
          </P>
        </Section>

        <Section title="9. Governing Law">
          <P>
            These Terms are governed by the laws of the Republic of Korea, without regard to
            conflict-of-law principles. Any disputes shall be resolved in the courts located in
            Seoul, Korea.
          </P>
        </Section>

        <Section title="10. Contact">
          <P>
            Questions about these Terms? Contact us:
          </P>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Atlas Lab Studios</p>
            <a href="mailto:contact@atlaslabstudios.com" style={{ fontSize: 14, color: '#7c6fff', textDecoration: 'none' }}>
              contact@atlaslabstudios.com
            </a>
          </div>
        </Section>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', gap: 16 }}>
          <Link href="/privacy" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Privacy Policy →</Link>
          <Link href="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Contact →</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
