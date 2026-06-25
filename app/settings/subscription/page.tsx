'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, Sparkles, Zap, Calendar } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

const FEATURES = [
  'Unlimited Stories',
  'Unlimited Pattern Access',
  'AI Sentence Explanation',
  'Vocabulary Collection',
  'Shadowing Practice',
]

const PLANS = [
  {
    id: 'monthly',
    icon: Zap,
    label: 'Premium Monthly',
    sublabel: 'Flexible, cancel anytime',
    price: '$4.99',
    period: '/ month',
    badge: null,
  },
  {
    id: 'annual',
    icon: Calendar,
    label: 'Premium Annual',
    sublabel: 'Save 33% versus monthly',
    price: '$39.99',
    period: '/ year',
    badge: 'BEST VALUE',
  },
]

export default function SubscriptionPage() {
  const [selected, setSelected] = useState('annual')
  const [toast, setToast] = useState(false)

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-28 max-w-sm mx-auto" style={{ paddingTop: NAV_HEIGHT + 64 }}>
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[#9B9490] hover:text-[#8B2246] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.18em] font-bold">SETTINGS</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-playfair text-[3.2rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            SUBSCRIPTION
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">
            Unlock the full PATTO experience
          </p>
        </div>

        {/* Current plan status card */}
        <div className="rounded-2xl bg-[#F0EAE2] px-5 py-4 mb-10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8B2246]/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#8B2246]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.18em] text-[#8B2246] font-bold mb-0.5">CURRENT PLAN</p>
            <p className="text-[15px] font-bold text-[#1A1A1A]">Free</p>
            <p className="text-[11px] text-[#9B9490] mt-0.5">Upgrade to unlock all features</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 pb-8 border-b border-[#EDE5DC]">
          <p className="text-[10px] tracking-[0.22em] text-[#8B2246] font-bold mb-5">PREMIUM INCLUDES</p>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#8B2246]/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#8B2246]" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-[#3A3A3A] font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan selection */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.22em] text-[#8B2246] font-bold mb-5">CHOOSE A PLAN</p>
          <div className="space-y-3">
            {PLANS.map((plan) => {
              const PlanIcon = plan.icon
              const isSelected = selected === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan.id)}
                  className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#8B2246] bg-[#FDF8F9]'
                      : 'border-[#EDE5DC] bg-white hover:border-[#C8A8B2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected ? 'bg-[#8B2246]/10' : 'bg-[#F5EFE9]'
                        }`}
                      >
                        <PlanIcon
                          className={`w-4 h-4 ${isSelected ? 'text-[#8B2246]' : 'text-[#9B9490]'}`}
                          strokeWidth={1.6}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-bold text-[13px] ${isSelected ? 'text-[#1A1A1A]' : 'text-[#3A3A3A]'}`}>
                            {plan.label}
                          </p>
                          {plan.badge && (
                            <span className="text-[8px] tracking-[0.15em] bg-[#8B2246] text-white px-2 py-0.5 rounded-full font-bold">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#9B9490] mt-0.5">{plan.sublabel}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-playfair text-[1.3rem] font-bold leading-none ${isSelected ? 'text-[#8B2246]' : 'text-[#3A3A3A]'}`}>
                        {plan.price}
                      </p>
                      <p className="text-[10px] text-[#9B9490] mt-0.5">{plan.period}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => { setToast(true); setTimeout(() => setToast(false), 2800) }}
          className="w-full py-4 bg-[#8B2246] text-white font-bold tracking-[0.12em] rounded-2xl text-[13px] hover:bg-[#7A1D3F] active:bg-[#6A1835] transition-colors cursor-pointer"
        >
          SUBSCRIBE
        </button>

        <p className="text-center text-[10px] text-[#C8BFB5] mt-4">
          Cancel anytime · No hidden fees
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[12px] px-5 py-2.5 rounded-full shadow-lg tracking-wide z-50 whitespace-nowrap">
          Payment system coming soon
        </div>
      )}
    </div>
  )
}
