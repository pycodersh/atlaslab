'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'

/** Progress 화면의 저장 패턴 미리보기 — 북마크 저장소 기반 */
export function PatternLibraryPreview() {
  const [items, setItems] = useState<BookmarkedPattern[]>([])

  useEffect(() => { setItems(getBookmarks()) }, [])

  const preview = items.slice(0, 3)

  return (
    <div className="pt-8 pb-6 border-b border-[var(--pd)]">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold">PATTERN LIBRARY</p>
        <Link href="/records/patterns" className="flex items-center gap-1 text-[11px] text-[var(--pa)] font-semibold hover:opacity-70 transition-opacity">
          View All <ArrowRight className="w-3 h-3" strokeWidth={2} />
        </Link>
      </div>

      {preview.length === 0 ? (
        <p className="text-[0.75rem] text-[var(--pm)] py-2 leading-relaxed">
          아직 저장한 패턴이 없어요.<br />패턴 옆 북마크를 눌러 저장해보세요.
        </p>
      ) : (
        <>
          <p className="text-[0.75rem] text-[var(--pm)] mb-3">저장한 패턴 미리보기 · {items.length}개</p>
          <div className="space-y-0">
            {preview.map((p, i) => (
              <div key={p.patternId}>
                {i > 0 && <div className="h-px bg-[var(--pd)]" />}
                <div className="flex items-center gap-4 py-4">
                  <span className="font-playfair text-[1.1rem] font-bold text-[var(--pa)] w-6 shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[var(--pt)]">{p.pattern}</p>
                    <p className="text-[11px] text-[var(--pm)] mt-0.5">{p.meaningKo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
