'use client'

import { BookOpen, ChartNoAxesColumnIncreasing, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useT } from '@/hooks/useT'

export function SlideBottomNav() {
  const pathname = usePathname()
  const t = useT()
  const tabs = [
    { href: '/learn',    label: t('tab_story'),    icon: BookOpen },
    { href: '/records',  label: t('tab_progress'), icon: ChartNoAxesColumnIncreasing },
    { href: '/settings', label: t('tab_settings'), icon: Settings },
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E8F0FE] bg-white/96 backdrop-blur-sm">
      <nav className="px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-bold text-[#8E8E93] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF]',
                  active ? 'bg-[#DCEBFF] text-[#4F8CFF]' : 'hover:text-[#6B7280]',
                )}
                href={href}
                key={href}
              >
                <Icon aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
