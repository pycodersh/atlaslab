import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Privacy Policy — Atlas Lab',
  description:
    'Atlas Lab Studios privacy policy — how we collect, use, and protect your data across Patto, K-Patto, K-Pantry, and Career Navi.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/privacy' },
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

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Last updated: July 1, 2025 &nbsp;·&nbsp; Effective: July 1, 2025
          </p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginTop: 24 }} />
        </div>

        <Section title="1. Who We Are">
          <P>
            Atlas Lab Studios (&quot;Atlas Lab&quot;, &quot;we&quot;, &quot;our&quot;) operates a suite of AI-powered
            applications including <strong>Patto</strong> (English pattern learning),{' '}
            <strong>K-Patto</strong> (Korean pattern learning), <strong>K-Pantry</strong> (Korean
            recipe discovery), and <strong>Career Navi</strong> (AI career navigation).
          </P>
          <P>
            This Privacy Policy applies to all services hosted at{' '}
            <strong>atlaslabstudios.com</strong> and its sub-paths. By using our services you agree
            to the practices described here.
          </P>
        </Section>

        <Section title="2. Information We Collect">
          <P>We collect information in the following ways:</P>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>Account &amp; Authentication</p>
          <UL items={[
            'Email address (when you sign up or sign in with Google OAuth)',
            'Display name and profile photo from your Google account (if you grant access)',
            'Account creation date and last sign-in time',
          ]} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 8, marginTop: 16 }}>App Usage Data</p>
          <UL items={[
            'Learning progress, streaks, bookmarks, and completed stories (Patto / K-Patto)',
            'Saved recipes and pantry preferences (K-Pantry)',
            'Subscription status and purchase records processed via Paddle',
            'In-app settings and preferences',
          ]} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 8, marginTop: 16 }}>Automatically Collected</p>
          <UL items={[
            'Page views and navigation events (Google Analytics 4)',
            'Browser type, device type, and operating system',
            'IP address (used for approximate geolocation; not stored individually)',
            'Session duration and feature interactions',
          ]} />
        </Section>

        <Section title="3. How We Use Your Information">
          <UL items={[
            'To create and manage your account',
            'To deliver and improve our apps and content',
            'To process subscription payments via Paddle',
            'To send transactional emails (e.g. receipts, account alerts) — no marketing without consent',
            'To understand aggregate usage trends and improve product quality',
            'To comply with legal obligations',
          ]} />
        </Section>

        <Section title="4. Third-Party Services">
          <P>We share data with the following third-party processors to operate our services:</P>

          <div style={{ border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            {[
              { name: 'Supabase', purpose: 'Database, authentication, and file storage', url: 'https://supabase.com/privacy' },
              { name: 'Vercel', purpose: 'Web hosting and CDN', url: 'https://vercel.com/legal/privacy-policy' },
              { name: 'Paddle', purpose: 'Subscription billing and payment processing', url: 'https://www.paddle.com/legal/privacy' },
              { name: 'Google Analytics 4', purpose: 'Anonymous usage analytics', url: 'https://policies.google.com/privacy' },
            ].map((p, i, arr) => (
              <div
                key={p.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 12,
                  padding: '14px 18px',
                  borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{p.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 4px' }}>{p.purpose}</p>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#7c6fff' }}>
                    Privacy policy →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <P>
            We do not sell your personal information to third parties.
          </P>
        </Section>

        <Section title="5. Cookies and Tracking Technologies">
          <P>
            We use cookies and similar technologies for the following purposes:
          </P>
          <UL items={[
            'Essential cookies — required for authentication sessions and core app functionality',
            'Analytics cookies — Google Analytics 4 collects anonymized usage data to help us improve our services. You can opt out via Google\'s opt-out browser add-on.',
            'Preference cookies — to remember your language and display settings',
          ]} />

          <div style={{ background: 'rgba(124,111,255,0.08)', border: '0.5px solid rgba(124,111,255,0.25)', borderRadius: 12, padding: '18px 20px', marginTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#a89fff', marginBottom: 8 }}>Advertising Cookies</p>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Our website may display advertisements served by third-party ad networks, including
              Google AdSense. These networks may use cookies, web beacons, and similar technologies
              to serve ads based on your browsing interests across different websites. Google and
              its partners use cookies to serve ads based on your prior visits to our site and
              other sites on the internet. You can opt out of personalised advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>
                Google Ads Settings
              </a>{' '}
              or by visiting{' '}
              <a href="http://www.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>
                aboutads.info
              </a>.
            </p>
          </div>
        </Section>

        <Section title="6. Data Retention">
          <UL items={[
            'Account data is retained while your account is active',
            'If you delete your account, we remove your personal data within 30 days, except where retention is required by law',
            'Analytics data is retained by Google Analytics per their standard retention policy (up to 14 months)',
            'Payment records are retained for 7 years per accounting regulations (held by Paddle)',
          ]} />
        </Section>

        <Section title="7. Your Rights">
          <P>
            Depending on your location, you may have the following rights regarding your personal
            data:
          </P>
          <UL items={[
            'Access — request a copy of the data we hold about you',
            'Correction — ask us to correct inaccurate data',
            'Deletion — request deletion of your account and associated data',
            'Portability — receive your data in a machine-readable format',
            'Objection — object to processing for analytics or advertising purposes',
          ]} />
          <P>
            To exercise any of these rights, please email{' '}
            <a href="mailto:contact@atlaslabstudios.com" style={{ color: '#7c6fff' }}>
              contact@atlaslabstudios.com
            </a>.
          </P>
        </Section>

        <Section title="8. Children's Privacy">
          <P>
            Our services are not directed at children under 13. We do not knowingly collect
            personal data from children under 13. If you believe a child has provided us with
            personal information, please contact us immediately.
          </P>
        </Section>

        <Section title="9. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. When we make material changes, we
            will update the &quot;Last updated&quot; date above. Continued use of our services after a
            change constitutes acceptance of the updated policy.
          </P>
        </Section>

        <Section title="10. Contact">
          <P>
            For privacy-related questions, data requests, or to report a concern, please contact:
          </P>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Atlas Lab Studios</p>
            <a href="mailto:contact@atlaslabstudios.com" style={{ fontSize: 14, color: '#7c6fff', textDecoration: 'none' }}>
              contact@atlaslabstudios.com
            </a>
          </div>
        </Section>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', gap: 16 }}>
          <Link href="/terms" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Terms of Service →</Link>
          <Link href="/contact" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Contact →</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
