'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, User, LogIn, UserPlus, LogOut, Trash2, ChevronRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

const MAIN_ITEMS = [
  {
    icon: User,
    label: 'Profile',
    desc: 'Edit your display name and photo',
  },
  {
    icon: LogIn,
    label: 'Sign In',
    desc: 'Log in to sync your progress across devices',
  },
  {
    icon: UserPlus,
    label: 'Sign Up',
    desc: 'Create a free account to save your learning history',
  },
  {
    icon: LogOut,
    label: 'Sign Out',
    desc: 'Log out from this device',
  },
]

const DANGER_ITEMS = [
  {
    icon: Trash2,
    label: 'Delete Account',
    desc: 'Permanently remove your account and all data',
  },
]

function MenuRow({
  icon: Icon,
  label,
  desc,
  danger,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  desc: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-4 py-5 text-left group cursor-pointer"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          danger
            ? 'bg-[#FFF0F3] group-hover:bg-[#FFE0E7]'
            : 'bg-[#F5EFE9] group-hover:bg-[#EDE5DC]'
        }`}
      >
        <Icon
          className={`w-4 h-4 ${danger ? 'text-[#B04060]' : 'text-[#8B2246]'}`}
          strokeWidth={1.6}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-[14px] leading-snug transition-colors ${
            danger
              ? 'text-[#B04060] group-hover:text-[#8B1A35]'
              : 'text-[#1A1A1A] group-hover:text-[#8B2246]'
          }`}
        >
          {label}
        </p>
        <p className="text-[11.5px] text-[#9B9490] mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight
        className={`w-4 h-4 shrink-0 mt-2.5 transition-colors ${
          danger ? 'text-[#DDB8C0]' : 'text-[#C8BFB5] group-hover:text-[#8B2246]'
        }`}
        strokeWidth={1.4}
      />
    </button>
  )
}

export default function AccountPage() {
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-24 max-w-sm mx-auto pt-36">
        {/* Back */}
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[#9B9490] hover:text-[#8B2246] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.18em] font-bold">SETTINGS</span>
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-playfair text-[3.2rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            ACCOUNT
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">
            Profile and authentication
          </p>
        </div>

        {/* Current user status card */}
        <div className="rounded-2xl bg-[#F0EAE2] px-5 py-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8B2246]/15 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#8B2246]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1A1A1A]">Guest</p>
            <p className="text-[11px] text-[#9B9490] mt-0.5">Sign in to sync your progress</p>
          </div>
        </div>

        {/* Main items */}
        <div className="border-t border-[#EDE5DC]">
          {MAIN_ITEMS.map((item, i) => (
            <div key={item.label}>
              <MenuRow
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                onClick={() => showToast('Authentication not connected yet')}
              />
              {i < MAIN_ITEMS.length - 1 && <div className="h-px bg-[#EDE5DC]" />}
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="mt-10">
          <p className="text-[10px] tracking-[0.22em] text-[#B04060] font-bold mb-3">
            DANGER ZONE
          </p>
          <div className="border border-[#F0C0CC] rounded-2xl overflow-hidden bg-[#FFF8F9]">
            {DANGER_ITEMS.map((item) => (
              <div key={item.label} className="px-2">
                <MenuRow
                  icon={item.icon}
                  label={item.label}
                  desc={item.desc}
                  danger
                  onClick={() => showToast('Authentication not connected yet')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[12px] px-5 py-2.5 rounded-full shadow-lg tracking-wide z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
