import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy - Atlas Lab',
  description:
    'How Atlas Lab collects, uses, and protects your information when you visit atlaslabstudios.com.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage>
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> September 26, 2026</p>
      <p><strong>Last Updated:</strong> September 26, 2026</p>

      <p>Welcome to Atlas Lab (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), accessible from atlaslabstudios.com. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you visit our website and use our related services.</p>

      <h2>1. Information We Collect</h2>
      <p>We may collect personal information that you voluntarily provide when contacting us via email or subscribing to updates (e.g., name, email address). We also automatically collect non-personal log data, including your IP address, browser type, device details, and pages visited.</p>

      <h2>2. Cookies and Web Beacons</h2>
      <p>Like many websites, Atlas Lab uses cookies to store information about visitors&apos; preferences and optimize user experience by customizing content based on browser type or other details.</p>

      <h2>3. Google AdSense and Third-Party Advertising</h2>
      <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to atlaslabstudios.com and other sites on the internet.</p>
      <ul>
        <li>Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.</li>
        <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
        <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</li>
      </ul>

      <h2>4. Third-Party Links</h2>
      <p>Our website may contain links to external sites (such as educational materials, affiliate partners, or application stores). We are not responsible for the privacy practices or content of third-party platforms.</p>

      <h2>5. Children&apos;s Information</h2>
      <p>We do not knowingly collect personal identifiable information from children under the age of 13. If you believe your child has provided such information on our site, please contact us immediately, and we will promptly remove it.</p>

      <h2>6. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:contact@atlaslabstudios.com">contact@atlaslabstudios.com</a></p>
    </LegalPage>
  )
}
