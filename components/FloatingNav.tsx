'use client'

import { BookOpen, ChartNoAxesColumnIncreasing, Menu, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const tabs = [
  { href: '/learn',    label: '학습', icon: BookOpen },
  { href: '/records',  label: '기록', icon: ChartNoAxesColumnIncreasing },
  { href: '/settings', label: '설정', icon: Settings },
]

export function FloatingNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
      {/* 메뉴 패널 */}
      {open && (
        <div className="flex gap-1.5 rounded-2xl border border-[#E8F0FE] bg-white/95 p-2 shadow-xl backdrop-blur-sm">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-5 py-2.5 text-[11px] font-bold transition-colors',
                  active
                    ? 'bg-[#DCEBFF] text-[#4F8CFF]'
                    : 'text-[#9EAEC8] hover:bg-[#F5F8FF] hover:text-[#4F8CFF]',
                )}
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                <Icon aria-hidden className="h-4 w-4" strokeWidth={2.2} />
                {label}
              </Link>
            )
          })}
        </div>
      )}

      {/* 토글 버튼 */}
      <button
        aria-expanded={open}
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        className="flex items-center gap-1.5 rounded-full border border-[#E8F0FE] bg-white/90 px-4 py-2 text-[11px] font-bold text-[#9EAEC8] shadow-md backdrop-blur-sm transition-colors hover:text-[#4F8CFF] active:scale-95"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open
          ? <X aria-hidden className="h-3.5 w-3.5" />
          : <Menu aria-hidden className="h-3.5 w-3.5" />
        }
        {open ? '닫기' : '메뉴'}
      </button>
    </div>
  )
}
