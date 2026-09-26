import Link from 'next/link'
import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy - Atlas Lab',
  description:
    'Atlas Lab Studios privacy policy — how we collect, use, and protect your data across Patto, K-Patto, K-Pantry, and Career Navi.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/privacy' },
}

const PROCESSORS = [
  { name: 'Supabase', purpose: 'Database, authentication, and file storage', url: 'https://supabase.com/privacy' },
  { name: 'Vercel', purpose: 'Web hosting and CDN', url: 'https://vercel.com/legal/privacy-policy' },
  { name: 'Paddle', purpose: 'Subscription billing and payment processing', url: 'https://www.paddle.com/legal/privacy' },
  { name: 'Google Analytics 4', purpose: 'Anonymous usage analytics', url: 'https://policies.google.com/privacy' },
]

export default function PrivacyPage() {
  return (
    <LegalPage>
      <h1>Privacy Policy</h1>
      <p className="legal-meta">Last updated: July 1, 2025 &nbsp;·&nbsp; Effective: July 1, 2025</p>

      <h2>1. Who We Are</h2>
      <p>
        Atlas Lab Studios (&quot;Atlas Lab&quot;, &quot;we&quot;, &quot;our&quot;) operates a suite of AI-powered
        applications including <strong>Patto</strong> (English pattern learning),{' '}
        <strong>K-Patto</strong> (Korean pattern learning), <strong>K-Pantry</strong> (Korean
        recipe discovery), and <strong>Career Navi</strong> (AI career navigation).
      </p>
      <p>
        This Privacy Policy applies to all services hosted at{' '}
        <strong>atlaslabstudios.com</strong> and its sub-paths. By using our services you agree
        to the practices described here.
      </p>

      <h2>2. Information We Collect</h2>
      <p>We collect information in the following ways:</p>
      <h3>Account &amp; Authentication</h3>
      <ul>
        <li>Email address (when you sign up or sign in with Google OAuth)</li>
        <li>Display name and profile photo from your Google account (if you grant access)</li>
        <li>Account creation date and last sign-in time</li>
      </ul>
      <h3>App Usage Data</h3>
      <ul>
        <li>Learning progress, streaks, bookmarks, and completed stories (Patto / K-Patto)</li>
        <li>Saved recipes and pantry preferences (K-Pantry)</li>
        <li>Subscription status and purchase records processed via Paddle</li>
        <li>In-app settings and preferences</li>
      </ul>
      <h3>Automatically Collected</h3>
      <ul>
        <li>Page views and navigation events (Google Analytics 4)</li>
        <li>Browser type, device type, and operating system</li>
        <li>IP address (used for approximate geolocation; not stored individually)</li>
        <li>Session duration and feature interactions</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your account</li>
        <li>To deliver and improve our apps and content</li>
        <li>To process subscription payments via Paddle</li>
        <li>To send transactional emails (e.g. receipts, account alerts) — no marketing without consent</li>
        <li>To understand aggregate usage trends and improve product quality</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>4. Third-Party Services</h2>
      <p>We share data with the following third-party processors to operate our services:</p>
      <div className="legal-rows">
        {PROCESSORS.map(p => (
          <div className="legal-row" key={p.name}>
            <p className="legal-row-name">{p.name}</p>
            <div>
              <p>{p.purpose}</p>
              <p>
                <a href={p.url} target="_blank" rel="noopener noreferrer">Privacy policy →</a>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p>We do not sell your personal information to third parties.</p>

      <h2>5. Cookies and Tracking Technologies</h2>
      <p>We use cookies and similar technologies for the following purposes:</p>
      <ul>
        <li>Essential cookies — required for authentication sessions and core app functionality</li>
        <li>Analytics cookies — Google Analytics 4 collects anonymized usage data to help us improve our services. You can opt out via Google&apos;s opt-out browser add-on.</li>
        <li>Preference cookies — to remember your language and display settings</li>
      </ul>
      <div className="legal-callout">
        <p className="legal-callout-title">Advertising Cookies</p>
        <p>
          Our website may display advertisements served by third-party ad networks, including
          Google AdSense. These networks may use cookies, web beacons, and similar technologies
          to serve ads based on your browsing interests across different websites. Google and
          its partners use cookies to serve ads based on your prior visits to our site and
          other sites on the internet. You can opt out of personalised advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{' '}
          or by visiting{' '}
          <a href="http://www.aboutads.info/" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
        </p>
      </div>

      <h2>6. Data Retention</h2>
      <ul>
        <li>Account data is retained while your account is active</li>
        <li>If you delete your account, we remove your personal data within 30 days, except where retention is required by law</li>
        <li>Analytics data is retained by Google Analytics per their standard retention policy (up to 14 months)</li>
        <li>Payment records are retained for 7 years per accounting regulations (held by Paddle)</li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>
        Depending on your location, you may have the following rights regarding your personal
        data:
      </p>
      <ul>
        <li>Access — request a copy of the data we hold about you</li>
        <li>Correction — ask us to correct inaccurate data</li>
        <li>Deletion — request deletion of your account and associated data</li>
        <li>Portability — receive your data in a machine-readable format</li>
        <li>Objection — object to processing for analytics or advertising purposes</li>
      </ul>
      <p>
        To exercise any of these rights, please email{' '}
        <a href="mailto:contact@atlaslabstudios.com">contact@atlaslabstudios.com</a>.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        Our services are not directed at children under 13. We do not knowingly collect
        personal data from children under 13. If you believe a child has provided us with
        personal information, please contact us immediately.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we make material changes, we
        will update the &quot;Last updated&quot; date above. Continued use of our services after a
        change constitutes acceptance of the updated policy.
      </p>

      <h2>10. Contact</h2>
      <p>For privacy-related questions, data requests, or to report a concern, please contact:</p>
      <div className="legal-box">
        <p><strong>Atlas Lab Studios</strong></p>
        <p><a href="mailto:contact@atlaslabstudios.com">contact@atlaslabstudios.com</a></p>
      </div>

      <div className="legal-more">
        <Link href="/terms">Terms of Service →</Link>
        <Link href="/contact">Contact →</Link>
      </div>
    </LegalPage>
  )
}
