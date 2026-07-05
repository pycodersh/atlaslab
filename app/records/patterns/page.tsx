'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'

type SortKey = 'recent' | 'alpha'

export default function SavedPatternsPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [items, setItems] = useState<BookmarkedPattern[]>([])

  useEffect(() => { setItems(getBookmarks()) }, [])

  const filtered = items
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

      <div className="px-7 pb-20 max-w-sm mx-auto pt-20">
        {/* Back */}
        <Link
          href="/records"
          className="flex items-center gap-1 text-[#8E8E93] hover:text-[#8D234C] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[11px] tracking-[0.18em] font-semibold">PROGRESS</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[#1C1C1E] tracking-tight">
            PATTERNS
          </h1>
          <p className="text-[0.78rem] text-[#8E8E93] mt-2 tracking-wide">
            저장한 패턴 모음 · {items.length}개
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C7C7CC]" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="패턴 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#EDE5DC]/50 rounded-xl py-2.5 pl-9 pr-4 text-[13px] text-[#3A3A3C] placeholder-[#C7C7CC] focus:outline-none focus:ring-1 focus:ring-[#8D234C]/40"
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
                  ? 'bg-[#8D234C] text-white border-[#8D234C]'
                  : 'bg-transparent text-[#8E8E93] border-[#D8D0C8] hover:border-[#8D234C] hover:text-[#8D234C]'
              }`}
            >
              {key === 'recent' ? 'Recent' : 'Alphabetical'}
            </button>
          ))}
        </div>

        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <p className="text-[13px] text-[#8E8E93] py-10 text-center">
              {items.length === 0 ? '아직 저장한 패턴이 없어요. 패턴 옆 북마크를 눌러 저장해보세요.' : '검색 결과가 없습니다.'}
            </p>
          ) : (
            filtered.map((p, i) => (
              <div key={p.patternId}>
                {i > 0 && <div className="h-px bg-[#EDE5DC]" />}
                <div className="flex items-center gap-4 py-5">
                  <span className="font-playfair text-[1.1rem] font-bold text-[#8D234C] w-6 shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-[#1C1C1E]">{p.pattern}</p>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">{p.meaningKo}</p>
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
