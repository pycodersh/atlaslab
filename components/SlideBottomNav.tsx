'use client'

import { BookOpen, ChartNoAxesColumnIncreasing, ChevronUp, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const tabs = [
  { href: '/learn',    label: '학습', icon: BookOpen },
  { href: '/records',  label: '기록', icon: ChartNoAxesColumnIncreasing },
  { href: '/settings', label: '설정', icon: Settings },
]

export function SlideBottomNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      {/* 토글 핸들 */}
      <div className="flex justify-center border-t border-[#E8F0FE] bg-white/96 backdrop-blur-sm">
        <button
          aria-expanded={open}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          className="flex w-full max-w-md items-center justify-center py-1.5 text-[#C8D8F0] transition-colors hover:text-[#9EAEC8]"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <ChevronUp
            aria-hidden
            className={cn('h-3.5 w-3.5 transition-transform duration-300', open && 'rotate-180')}
          />
        </button>
      </div>

      {/* 네비게이션 탭 */}
      <div
        className={cn(
          'overflow-hidden bg-white/96 backdrop-blur-sm transition-all duration-300 ease-in-out',
          open ? 'max-h-16' : 'max-h-0',
        )}
      >
        <nav className="px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-bold text-[#9EAEC8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF]',
                    active ? 'bg-[#DCEBFF] text-[#4F8CFF]' : 'hover:text-[#6B7280]',
                  )}
                  href={href}
                  key={href}
                  onClick={() => setOpen(false)}
                >
                  <Icon aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
