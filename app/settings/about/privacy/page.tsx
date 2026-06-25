import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly to us, including:\n\n• Account information (email address, display name, profile photo)\n• Usage data (stories read, patterns studied, learning streaks)\n• Device information (device type, operating system, browser type)\n• Communication data (support requests, feedback submissions)\n\nWe do not collect sensitive personal information such as financial account details directly — payment processing is handled by third-party providers.`,
  },
  {
    title: '2. How We Use Information',
    body: `We use the information we collect to:\n\n• Provide, maintain, and improve the Service\n• Personalize your learning experience and track your progress\n• Send transactional emails (account verification, subscription receipts)\n• Respond to your comments and questions\n• Monitor and analyze usage patterns to improve features\n• Comply with legal obligations\n\nWe do not sell your personal information to third parties.`,
  },
  {
    title: '3. Data Storage',
    body: `Your data is stored on secure servers provided by Supabase, Inc. Data may be stored and processed in the United States or other countries where our service providers operate.\n\nWe retain your account data for as long as your account is active or as needed to provide the Service. Learning history and progress data are retained for the duration of your account. Upon account deletion, we remove your personal data within 30 days, subject to any legal retention obligations.`,
  },
  {
    title: '4. Cookies',
    body: `PATTO uses cookies and similar tracking technologies to enhance your experience. These include:\n\n• Session cookies — to keep you logged in during your visit\n• Preference cookies — to remember your settings (theme, language)\n• Analytics cookies — to understand how the Service is used\n\nYou may disable cookies through your browser settings, but some features of the Service may not function correctly as a result.`,
  },
  {
    title: '5. Third-Party Services',
    body: `We use the following third-party services that may collect information about you:\n\n• Supabase — database and authentication\n• Vercel — hosting and content delivery\n• Web Speech API — on-device text-to-speech (no data transmitted)\n• Unsplash — story imagery (subject to Unsplash's privacy policy)\n\nThese services are governed by their own privacy policies. We encourage you to review them.`,
  },
  {
    title: '6. User Rights',
    body: `Depending on your location, you may have the following rights regarding your personal data:\n\n• Access — request a copy of the data we hold about you\n• Correction — request correction of inaccurate data\n• Deletion — request deletion of your account and associated data\n• Portability — receive your data in a machine-readable format\n• Objection — object to certain processing activities\n\nTo exercise any of these rights, please contact us at privacy@patto.app. We will respond within 30 days.`,
  },
  {
    title: '7. Contact Information',
    body: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:\n\nEmail: privacy@patto.app\nAddress: PATTO Inc., Seoul, Republic of Korea\n\nThis Privacy Policy was last updated on June 25, 2026.`,
  },
]

export default function PrivacyPage() {
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
            Privacy<br />Policy
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
