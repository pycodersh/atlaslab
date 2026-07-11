'use client'

import { usePathname, useRouter } from 'next/navigation'

export type BookmarkTab = 'STUDY' | 'PROGRESS' | 'SETTINGS'

const TABS: BookmarkTab[] = ['STUDY', 'PROGRESS', 'SETTINGS']

const TAB_ROUTES: Record<BookmarkTab, string> = {
  STUDY: '/patto/stories/1',
  PROGRESS: '/patto/records',
  SETTINGS: '/patto/settings',
}

function getActiveTab(pathname: string): BookmarkTab {
  if (pathname.startsWith('/patto/records')) return 'PROGRESS'
  if (pathname.startsWith('/patto/settings')) return 'SETTINGS'
  return 'STUDY'
}

export function BookmarkNav() {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = getActiveTab(pathname)

  return (
    <div className="fixed left-0 top-0 h-full z-30 flex flex-col items-start justify-start pt-10 gap-2 pointer-events-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            type="button"
            aria-label={tab}
            onClick={() => router.push(TAB_ROUTES[tab])}
            className={[
              'pointer-events-auto flex items-center justify-center rounded-r-lg transition-all duration-300 select-none cursor-pointer',
              isActive
                ? 'bg-[#6D8DFF] text-white w-5 h-[76px] shadow-md'
                : 'bg-[#E8E0D8] text-[#C0B4AE] w-4 h-14 hover:bg-[#D8CEC8] hover:w-[18px]',
            ].join(' ')}
          >
            <span
              className={['font-bold whitespace-nowrap', isActive ? 'text-[7px] tracking-[0.18em]' : 'text-[6px] tracking-[0.12em]'].join(' ')}
              style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
            >
              {tab}
            </span>
          </button>
        )
      })}
    </div>
  )
}
