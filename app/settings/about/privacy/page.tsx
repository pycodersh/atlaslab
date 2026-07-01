'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'
import { PRIVACY, getLegalDoc } from '@/lib/i18n/legal-content'

export default function PrivacyPage() {
  const t = useT()
  const { prefs } = usePreferences()
  const doc = getLegalDoc(PRIVACY, prefs.appLang)

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />

      <div className="px-7 pb-20 max-w-sm mx-auto pt-20">
        <Link
          href="/settings/about"
          className="flex items-center gap-1 text-[var(--pm)] hover:text-[var(--pa)] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[11px] tracking-[0.18em] font-semibold">{t('about_nav')}</span>
        </Link>

        <div className="mb-10">
          <h1 className="font-playfair text-[1.9rem] font-black leading-tight text-[var(--pt)] tracking-tight">
            {doc.title}
          </h1>
          <p className="text-[0.75rem] text-[var(--pm)] mt-2 tracking-wide">
            {doc.updated}
          </p>
        </div>

        <div className="space-y-8">
          {doc.sections.map((s) => (
            <div key={s.title} className="pb-8 border-b border-[var(--pd)] last:border-0">
              <h2 className="font-bold text-[var(--pt)] mb-3" style={{ fontSize: 14, letterSpacing: '0.02em' }}>
                {s.title}
              </h2>
              <div className="text-[0.8rem] text-[var(--pm)] leading-[1.85] whitespace-pre-line">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
