import Link from 'next/link'
import { ChevronLeft, ChevronRight, ScrollText, Shield, Mail, Code2, Info } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

const ITEMS = [
  {
    icon: ScrollText,
    label: 'Terms of Service',
    desc: 'Rules and agreements for using PATTO',
    href: '/settings/about/terms',
    value: null,
  },
  {
    icon: Shield,
    label: 'Privacy Policy',
    desc: 'How we collect, use, and protect your data',
    href: '/settings/about/privacy',
    value: null,
  },
  {
    icon: Mail,
    label: 'Contact Us',
    desc: 'support@patto.app',
    href: null,
    value: null,
  },
  {
    icon: Code2,
    label: 'Open Source Licenses',
    desc: 'Third-party software used in PATTO',
    href: null,
    value: null,
  },
  {
    icon: Info,
    label: 'Version',
    desc: 'Current app version',
    href: null,
    value: '1.0.0',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-24 max-w-sm mx-auto pt-20">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[#9B9490] hover:text-[#8B2246] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.18em] font-bold">SETTINGS</span>
        </Link>

        <div className="mb-10">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            ABOUT
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">
            Terms, privacy and app information
          </p>
        </div>

        {/* App identity card */}
        <div className="rounded-2xl bg-[#F0EAE2] px-5 py-4 mb-10">
          <p className="text-[11px] tracking-[0.28em] font-black text-[#1A1A1A] mb-1">PATTO</p>
          <p className="text-[11px] text-[#9B9490] leading-relaxed">
            Premium English Pattern Learning · v1.0.0
          </p>
          <p className="font-playfair text-[11px] italic text-[#8B2246] mt-2">
            Speak Naturally. Connect Deeply.
          </p>
        </div>

        {/* Items */}
        <div className="border-t border-[#EDE5DC]">
          {ITEMS.map((item, i) => {
            const Icon = item.icon
            const inner = (
              <div className="flex items-start gap-4 py-5">
                <div className="w-9 h-9 rounded-xl bg-[#F5EFE9] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#EDE5DC] transition-colors">
                  <Icon className="w-4 h-4 text-[#8B2246]" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-[#1A1A1A] group-hover:text-[#8B2246] transition-colors leading-snug">
                    {item.label}
                  </p>
                  <p className="text-[11.5px] text-[#9B9490] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                {item.value ? (
                  <span className="text-[13px] text-[#9B9490] font-medium shrink-0 mt-1">{item.value}</span>
                ) : item.href ? (
                  <ChevronRight className="w-4 h-4 text-[#C8BFB5] group-hover:text-[#8B2246] transition-colors shrink-0 mt-2.5" strokeWidth={1.4} />
                ) : null}
              </div>
            )

            return (
              <div key={item.label}>
                {i > 0 && <div className="h-px bg-[#EDE5DC]" />}
                {item.href ? (
                  <Link href={item.href} className="group block">
                    {inner}
                  </Link>
                ) : (
                  <div className="group">{inner}</div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-[9px] tracking-[0.2em] text-[#D8D0C8] text-center pt-12">
          © 2026 PATTO INC. · ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  )
}
