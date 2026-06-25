'use client'

export type BookmarkTab = 'STUDY' | 'PROGRESS' | 'SETTINGS'

type BookmarkNavProps = {
  activeTab?: BookmarkTab
}

const TABS: BookmarkTab[] = ['STUDY', 'PROGRESS', 'SETTINGS']

export function BookmarkNav({ activeTab = 'STUDY' }: BookmarkNavProps) {
  return (
    <div className="fixed left-0 top-0 h-full z-30 flex flex-col items-start justify-start pt-10 gap-2 pointer-events-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab
        return (
          <div
            key={tab}
            className={[
              'pointer-events-auto flex items-center justify-center rounded-r-lg transition-all duration-300 select-none',
              isActive
                ? 'bg-[#8B2246] text-[#FAF8F4] w-5 h-[76px] shadow-md'
                : 'bg-[#E8E0D8] text-[#C0B4AE] w-4 h-14',
            ].join(' ')}
          >
            <span
              className={['font-bold whitespace-nowrap', isActive ? 'text-[7px] tracking-[0.18em]' : 'text-[6px] tracking-[0.12em]'].join(' ')}
              style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
            >
              {tab}
            </span>
          </div>
        )
      })}
    </div>
  )
}
