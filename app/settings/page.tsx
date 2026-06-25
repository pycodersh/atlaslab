import Link from 'next/link'
import { ChevronRight, UserCircle, SlidersHorizontal, Sparkles, Info } from 'lucide-react'
import { TopNav } from '@/components/TopNav'

const hubs = [
  {
    icon: UserCircle,
    label: 'ACCOUNT',
    desc: 'Manage profile and authentication',
    href: '/settings/account',
  },
  {
    icon: SlidersHorizontal,
    label: 'PREFERENCES',
    desc: 'Customize your learning experience',
    href: '/settings/preferences',
  },
  {
    icon: Sparkles,
    label: 'SUBSCRIPTION',
    desc: 'Premium plans and billing',
    href: '/settings/subscription',
  },
  {
    icon: Info,
    label: 'ABOUT',
    desc: 'Terms, privacy and app information',
    href: '/settings/about',
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-20 max-w-sm mx-auto pt-20">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            SETTINGS
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">
            앱을 나에게 맞게 조정하세요.
          </p>
        </div>

        {/* Hub list */}
        <div>
          {hubs.map((hub, i) => {
            const Icon = hub.icon
            return (
              <div key={hub.href}>
                {i > 0 && <div className="h-px bg-[#EDE5DC]" />}
                <Link
                  href={hub.href}
                  className="flex items-center gap-4 py-5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F0EAE2] flex items-center justify-center shrink-0 group-hover:bg-[#EDE5DC] transition-colors">
                    <Icon className="w-4.5 h-4.5 text-[#8B2246]" strokeWidth={1.6} style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[#1A1A1A] group-hover:text-[#8B2246] transition-colors font-bold tracking-[0.06em]"
                      style={{ fontSize: 14 }}
                    >
                      {hub.label}
                    </p>
                    <p className="text-[0.72rem] text-[#9B9490] mt-0.5 leading-snug">
                      {hub.desc}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#C8BFB5] group-hover:text-[#8B2246] transition-colors shrink-0"
                    strokeWidth={1.4}
                  />
                </Link>
              </div>
            )
          })}
          <div className="h-px bg-[#EDE5DC]" />
        </div>
      </div>
    </div>
  )
}
