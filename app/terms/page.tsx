import Link from 'next/link'
import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service - Atlas Lab',
  description:
    'Atlas Lab Studios terms of service governing the use of Patto, K-Patto, K-Pantry, and Career Navi.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage>
      <h1>Terms of Service</h1>
      <p className="legal-meta">Last updated: July 1, 2025 &nbsp;·&nbsp; Effective: July 1, 2025</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using any service provided by Atlas Lab Studios (&quot;Atlas Lab&quot;, &quot;we&quot;,
        &quot;our&quot;) — including Patto, K-Patto, K-Pantry, Career Navi, and this website — you
        agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not
        use our services.
      </p>
      <p>
        We may update these Terms at any time. Continued use after a change constitutes
        acceptance.
      </p>

      <h2>2. Description of Services</h2>
      <p>Atlas Lab Studios operates the following applications:</p>
      <ul>
        <li>Patto — an AI-powered English pattern learning app</li>
        <li>K-Patto — a Korean language pattern learning app for global learners</li>
        <li>K-Pantry — a Korean recipe discovery and meal planning app</li>
        <li>Career Navi — an AI career navigation service for Korean professionals (in development)</li>
      </ul>
      <p>
        Features and pricing may change at any time. We will notify active subscribers of
        material changes that affect paid features.
      </p>

      <h2>3. User Accounts</h2>
      <p>Some features require creating an account. You agree to:</p>
      <ul>
        <li>Provide accurate information when creating your account</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorised use of your account</li>
        <li>Be at least 13 years of age (or have parental consent where required by local law)</li>
      </ul>
      <p>You are responsible for all activity that occurs under your account.</p>

      <h2>4. Subscriptions and Payments</h2>
      <p>
        Certain features are available only through a paid subscription. Subscriptions are
        processed and managed by <strong>Paddle</strong> (our Merchant of Record). By subscribing
        you also agree to{' '}
        <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer">Paddle&apos;s terms</a>.
      </p>
      <ul>
        <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
        <li>You can cancel at any time from your account settings; access continues until the current billing period ends</li>
        <li>Refunds are handled on a case-by-case basis — contact us within 7 days of a charge for assistance</li>
        <li>Prices are displayed inclusive of applicable taxes where required by law</li>
      </ul>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use our services for any unlawful purpose</li>
        <li>Attempt to reverse-engineer, scrape, or automate access to our services beyond normal usage</li>
        <li>Share, resell, or redistribute subscription access to third parties</li>
        <li>Submit false, misleading, or harmful content</li>
        <li>Interfere with the security or integrity of our systems</li>
        <li>Impersonate Atlas Lab or any other person or entity</li>
      </ul>
      <p>We reserve the right to suspend or terminate accounts that violate these rules.</p>

      <h2>6. Intellectual Property</h2>
      <p>
        All content provided by Atlas Lab — including course materials, stories, patterns,
        recipes, software, and design — is owned by Atlas Lab Studios or its licensors and is
        protected by copyright and other intellectual property laws.
      </p>
      <p>
        Your subscription grants you a personal, non-transferable licence to access the content
        for your own learning and use. You may not copy, distribute, or create derivative works
        without our written permission.
      </p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>
        Our services are provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any
        kind, express or implied. We do not warrant that the services will be uninterrupted,
        error-free, or free of viruses or harmful components.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Atlas Lab Studios and its affiliates
        shall not be liable for any indirect, incidental, special, consequential, or punitive
        damages, including loss of data or profits, arising from your use of or inability to
        use our services.
      </p>
      <p>
        Our total liability for any claim arising from these Terms shall not exceed the greater
        of (a) the amount you paid to us in the 12 months preceding the claim or (b) USD 50.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Korea, without regard to
        conflict-of-law principles. Any disputes shall be resolved in the courts located in
        Seoul, Korea.
      </p>

      <h2>10. Contact</h2>
      <p>Questions about these Terms? Contact us:</p>
      <div className="legal-box">
        <p><strong>Atlas Lab Studios</strong></p>
        <p><a href="mailto:contact@atlaslabstudios.com">contact@atlaslabstudios.com</a></p>
      </div>

      <div className="legal-more">
        <Link href="/privacy">Privacy Policy →</Link>
        <Link href="/contact">Contact →</Link>
      </div>
    </LegalPage>
  )
}
