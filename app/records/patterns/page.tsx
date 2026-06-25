'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

type SortKey = 'recent' | 'alpha'

const ALL_PATTERNS = [
  { id: 1, pattern: 'I want to ~', meaningKo: '~하고 싶어요', savedAt: '2025-06-20' },
  { id: 2, pattern: 'I have to ~', meaningKo: '~해야 해요', savedAt: '2025-06-19' },
  { id: 3, pattern: 'I just ~', meaningKo: '방금 ~했어요', savedAt: '2025-06-18' },
  { id: 4, pattern: 'I can ~', meaningKo: '~할 수 있어요', savedAt: '2025-06-17' },
  { id: 5, pattern: "I don't ~", meaningKo: '~하지 않아요', savedAt: '2025-06-16' },
  { id: 6, pattern: 'I used to ~', meaningKo: '예전에 ~했어요', savedAt: '2025-06-15' },
  { id: 7, pattern: "I'm going to ~", meaningKo: '~할 거예요', savedAt: '2025-06-14' },
  { id: 8, pattern: 'I think ~', meaningKo: '~인 것 같아요', savedAt: '2025-06-13' },
  { id: 9, pattern: 'What if ~', meaningKo: '만약 ~라면 어떨까요', savedAt: '2025-06-12' },
  { id: 10, pattern: 'Have you ever ~', meaningKo: '~해본 적 있어요?', savedAt: '2025-06-11' },
]

export default function SavedPatternsPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')

  const filtered = ALL_PATTERNS
    .filter(
      (p) =>
        p.pattern.toLowerCase().includes(query.toLowerCase()) ||
        p.meaningKo.includes(query)
    )
    .sort((a, b) =>
      sort === 'alpha'
        ? a.pattern.localeCompare(b.pattern)
        : b.savedAt.localeCompare(a.savedAt)
    )

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-20 max-w-sm mx-auto" style={{ paddingTop: NAV_HEIGHT + 64 }}>
        {/* Back */}
        <Link
          href="/records"
          className="flex items-center gap-1 text-[#9B9490] hover:text-[#8B2246] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[11px] tracking-[0.18em] font-semibold">PROGRESS</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-playfair text-[3.2rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            PATTERNS
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">
            저장한 패턴 모음 · {ALL_PATTERNS.length}개
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8BFB5]" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="패턴 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#EDE5DC]/50 rounded-xl py-2.5 pl-9 pr-4 text-[13px] text-[#3A3A3A] placeholder-[#C8BFB5] focus:outline-none focus:ring-1 focus:ring-[#8B2246]/40"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          {(['recent', 'alpha'] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                sort === key
                  ? 'bg-[#8B2246] text-white border-[#8B2246]'
                  : 'bg-transparent text-[#9B9490] border-[#D8D0C8] hover:border-[#8B2246] hover:text-[#8B2246]'
              }`}
            >
              {key === 'recent' ? 'Recent' : 'Alphabetical'}
            </button>
          ))}
        </div>

        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <p className="text-[13px] text-[#9B9490] py-10 text-center">검색 결과가 없습니다.</p>
          ) : (
            filtered.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="h-px bg-[#EDE5DC]" />}
                <div className="flex items-center gap-4 py-5">
                  <span className="font-playfair text-[1.1rem] font-bold text-[#8B2246] w-6 shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1A1A]">{p.pattern}</p>
                    <p className="text-[11px] text-[#9B9490] mt-0.5">{p.meaningKo}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {filtered.length > 0 && <div className="h-px bg-[#EDE5DC]" />}
        </div>
      </div>
    </div>
  )
}
