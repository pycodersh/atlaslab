import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

const sections = [
  {
    title: '1. Service Description',
    body: `PATTO ("the Service") is a mobile and web application designed to help users learn English through curated magazine-style stories and pattern-based exercises. The Service is operated by PATTO Inc. and is available to users worldwide.\n\nBy accessing or using PATTO, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.`,
  },
  {
    title: '2. User Responsibilities',
    body: `You agree to use PATTO only for lawful purposes and in accordance with these Terms. You must not:\n\n• Use the Service in any way that violates applicable laws or regulations\n• Attempt to gain unauthorized access to any part of the Service\n• Reproduce, distribute, or create derivative works from our content without written permission\n• Use automated tools to scrape, crawl, or extract content from the Service\n• Interfere with or disrupt the integrity or performance of the Service`,
  },
  {
    title: '3. Subscription Policy',
    body: `PATTO offers both a free tier and premium subscription plans. Premium subscriptions are billed on a monthly or annual basis as selected during purchase.\n\nSubscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. You may cancel your subscription at any time through your account settings. Refunds are provided at our discretion and in accordance with applicable consumer protection laws.\n\nPrices are subject to change with 30 days' prior notice. Continued use after a price change constitutes acceptance of the new pricing.`,
  },
  {
    title: '4. Intellectual Property',
    body: `All content within PATTO — including but not limited to stories, patterns, illustrations, audio, and software — is owned by PATTO Inc. or its licensors and is protected by copyright, trademark, and other intellectual property laws.\n\nYou are granted a limited, non-exclusive, non-transferable license to access and use the content for personal, non-commercial purposes only. This license does not include the right to reproduce, distribute, or create derivative works without prior written consent.`,
  },
  {
    title: '5. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, PATTO Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service.\n\nThe Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.`,
  },
  {
    title: '6. Account Termination',
    body: `We reserve the right to suspend or terminate your account at our sole discretion if you violate these Terms or engage in behavior that we determine to be harmful to the Service or other users.\n\nYou may delete your account at any time through the Account settings. Upon deletion, your personal data will be removed in accordance with our Privacy Policy, subject to any legal retention obligations.`,
  },
  {
    title: '7. Contact Information',
    body: `If you have any questions about these Terms of Service, please contact us:\n\nEmail: legal@patto.app\nAddress: PATTO Inc., Seoul, Republic of Korea\n\nThese Terms were last updated on June 25, 2026.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-20 max-w-sm mx-auto pt-20">
        <Link href="/settings/about" className="flex items-center gap-1 text-[#9B9490] hover:text-[#8B2246] transition-colors mb-8 w-fit">
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[11px] tracking-[0.18em] font-semibold">ABOUT</span>
        </Link>

        <div className="mb-10">
          <h1 className="font-playfair text-[1.9rem] font-black leading-tight text-[#1A1A1A] tracking-tight">
            Terms of<br />Service
          </h1>
          <p className="text-[0.75rem] text-[#9B9490] mt-2 tracking-wide">
            Effective June 25, 2026
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="pb-8 border-b border-[#EDE5DC] last:border-0">
              <h2 className="font-bold text-[#1A1A1A] mb-3" style={{ fontSize: 14, letterSpacing: '0.02em' }}>
                {s.title}
              </h2>
              <div className="text-[0.8rem] text-[#5A5A5A] leading-[1.85] whitespace-pre-line">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
