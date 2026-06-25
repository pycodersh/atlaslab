import { ChevronRight } from 'lucide-react'

import { BookmarkNav } from '@/components/BookmarkNav'

type SettingSection = {
  label: string
  items: { label: string; value?: string }[]
}

const sections: SettingSection[] = [
  {
    label: 'ACCOUNT',
    items: [
      { label: 'Profile' },
      { label: 'Subscription', value: 'Free' },
      { label: 'Sign Out' },
    ],
  },
  {
    label: 'THEME',
    items: [
      { label: 'Appearance', value: 'Light' },
      { label: 'Font Size', value: 'Medium' },
    ],
  },
  {
    label: 'AUDIO',
    items: [
      { label: 'Speech Rate', value: 'Normal' },
      { label: 'Voice', value: 'en-US' },
    ],
  },
  {
    label: 'NOTIFICATIONS',
    items: [
      { label: 'Daily Reminder', value: 'On' },
      { label: 'Reminder Time', value: '09:00' },
    ],
  },
  {
    label: 'LANGUAGE',
    items: [
      { label: 'App Language', value: '한국어' },
      { label: 'Translation', value: 'Korean' },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="relative min-h-dvh bg-[#FAF8F4]">
      <BookmarkNav />

      <div className="pl-10 pr-6 pt-10 pb-16 max-w-sm mx-auto">
        {/* Header */}
        <p className="text-[11px] font-bold tracking-[0.3em] text-[#1A1A1A] mb-6">PATTO</p>

        <h1 className="font-playfair text-[3rem] font-black leading-none text-[#1A1A1A] tracking-tight">
          SETTINGS
        </h1>
        <div className="h-px bg-[#8B2246] w-12 mt-4 mb-2" />

        {/* Index subtitle */}
        <p className="text-[0.75rem] text-[#9B9490] mb-10 tracking-wide">
          앱을 나에게 맞게 조정하세요.
        </p>

        {/* ── Index-style sections ── */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.label}>
              {/* Section label */}
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[9px] tracking-[0.3em] text-[#8B2246] font-semibold shrink-0">
                  {section.label}
                </p>
                <div className="h-px flex-1 bg-[#E8E0D8]" />
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                {section.items.map((item, i) => (
                  <button
                    key={item.label}
                    type="button"
                    className={[
                      'w-full flex items-center justify-between px-5 py-4 cursor-pointer',
                      'hover:bg-[#FDF8F4] active:bg-[#F5EDE8] transition-colors text-left',
                      i > 0 ? 'border-t border-[#F0E8E0]' : '',
                    ].join(' ')}
                  >
                    <span className="text-[0.88rem] text-[#1A1A1A]">{item.label}</span>
                    <span className="flex items-center gap-1.5 text-[0.78rem] text-[#C8BFB5]">
                      {item.value && <span>{item.value}</span>}
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-[8px] tracking-[0.2em] text-[#D8D0C8] text-center mt-12">
          PATTO · v1.0.0
        </p>
      </div>
    </div>
  )
}
