import { ChevronRight } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { NAV_HEIGHT } from '@/components/TopNav'

const sections = [
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
    label: 'LANGUAGE',
    items: [
      { label: 'App Language', value: '한국어' },
      { label: 'Translation', value: 'Korean' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { label: 'Profile', value: '' },
      { label: 'Subscription', value: 'Free' },
      { label: 'Sign In / Sign Out', value: '' },
    ],
  },
  {
    label: 'NOTIFICATIONS',
    items: [
      { label: 'Daily Reminder', value: 'On' },
      { label: 'Reminder Time', value: '09:00' },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div style={{ paddingTop: NAV_HEIGHT + 8 }} className="px-6 pb-16 max-w-sm mx-auto">
        {/* Page title */}
        <div className="pt-6 pb-5 border-b border-[#EDE5DC]">
          <h1 className="font-playfair text-[2.8rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            SETTINGS
          </h1>
          <p className="text-sm text-[#9B9490] mt-2 tracking-wide">
            앱을 나에게 맞게 조정하세요.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.label} className="py-5 border-b border-[#EDE5DC]">
            {/* Section label — burgundy, tight tracking, 13px */}
            <p
              className="text-[#8B2246] font-bold uppercase mb-4"
              style={{ fontSize: 13, letterSpacing: '0.22em' }}
            >
              {section.label}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w-full flex items-center justify-between py-2.5 text-left cursor-pointer group"
                >
                  {/* Item label — 19px, medium weight */}
                  <span
                    className="text-[#161616] group-hover:text-[#8B2246] transition-colors"
                    style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.4 }}
                  >
                    {item.label}
                  </span>

                  {/* Value + chevron */}
                  <span className="flex items-center gap-1.5 shrink-0 ml-4">
                    {item.value && (
                      <span
                        className="text-[#8f837b]"
                        style={{ fontSize: 17, fontWeight: 400 }}
                      >
                        {item.value}
                      </span>
                    )}
                    <ChevronRight
                      className="w-4 h-4 text-[#C8BFB5] group-hover:text-[#8B2246] transition-colors"
                      strokeWidth={1.4}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-[10px] tracking-[0.2em] text-[#D8D0C8] text-center pt-10">
          PATTO · v1.0.0
        </p>
      </div>
    </div>
  )
}
