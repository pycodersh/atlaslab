import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service - Atlas Lab',
  description:
    'The terms that govern your use of atlaslabstudios.com, including intellectual property, user conduct, and liability.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage>
      <h1>Terms of Service</h1>
      <p><strong>Effective Date:</strong> September 26, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using atlaslabstudios.com (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our Service.</p>

      <h2>2. Intellectual Property Rights</h2>
      <p>All original content, designs, illustrations, animations, webtoon assets, text, code, and features on this website are the exclusive property of Atlas Lab and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reproduce any material without prior written permission from us.</p>

      <h2>3. User Conduct</h2>
      <p>You agree to use our Service only for lawful purposes. You agree not to attempt to decompile, reverse-engineer, disrupt website functionality, or scrape content programmatically without authorization.</p>

      <h2>4. Disclaimer of Warranties</h2>
      <p>The materials and language learning content provided on this website are for educational and informational purposes only. The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied.</p>

      <h2>5. Limitation of Liability</h2>
      <p>In no event shall Atlas Lab or its creators be liable for any direct, indirect, incidental, or consequential damages resulting from your access to, use of, or inability to use the Service.</p>

      <h2>6. Governing Law</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws of the Republic of Korea, without regard to conflict of law principles.</p>

      <h2>7. Contact Information</h2>
      <p>For inquiries regarding these Terms of Service, please reach out to: <a href="mailto:contact@atlaslabstudios.com">contact@atlaslabstudios.com</a></p>
    </LegalPage>
  )
}
