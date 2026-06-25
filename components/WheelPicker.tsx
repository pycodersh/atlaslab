'use client'

import { useRef, useEffect, useState } from 'react'
import type { MagazineStory } from '@/types/magazine'

type WheelPickerProps = {
  stories: MagazineStory[]
  currentId: number
  onSelect: (id: number) => void
  onClose: () => void
}

const ITEM_H = 44
const VISIBLE = 5
const PAD = Math.floor(VISIBLE / 2) * ITEM_H // 88px

export function WheelPicker({ stories, currentId, onSelect, onClose }: WheelPickerProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState(currentId)

  useEffect(() => {
    if (!listRef.current) return
    const idx = stories.findIndex((s) => s.id === currentId)
    if (idx >= 0) listRef.current.scrollTop = idx * ITEM_H
  }, [currentId, stories])

  function handleScroll() {
    if (!listRef.current) return
    const idx = Math.round(listRef.current.scrollTop / ITEM_H)
    const clamped = Math.min(Math.max(idx, 0), stories.length - 1)
    const story = stories[clamped]
    if (story) setSelectedId(story.id)
  }

  function scrollToStory(id: number) {
    if (!listRef.current) return
    const idx = stories.findIndex((s) => s.id === id)
    if (idx >= 0) listRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
    setSelectedId(id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-72 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Label */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-[9px] tracking-[0.3em] text-[#8B2246] font-semibold text-center">
            SELECT STORY
          </p>
        </div>

        {/* Picker wheel */}
        <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
          {/* Top fade */}
          <div
            className="absolute inset-x-0 top-0 z-10 pointer-events-none"
            style={{ height: PAD, background: 'linear-gradient(to bottom, white 30%, transparent)' }}
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
            style={{ height: PAD, background: 'linear-gradient(to top, white 30%, transparent)' }}
          />
          {/* Selection lines */}
          <div
            className="absolute inset-x-5 z-10 pointer-events-none border-y border-[#E8E0D8]"
            style={{ top: PAD, height: ITEM_H }}
          />

          {/* Scroll list */}
          <div
            ref={listRef}
            className="h-full overflow-y-scroll"
            style={{
              scrollbarWidth: 'none',
              scrollSnapType: 'y mandatory',
              paddingTop: PAD,
              paddingBottom: PAD,
            }}
            onScroll={handleScroll}
          >
            {stories.map((story) => (
              <div
                key={story.id}
                className={[
                  'flex items-center justify-center px-6 cursor-pointer transition-all duration-150',
                  story.id === selectedId
                    ? 'text-[#8B2246] font-semibold'
                    : 'text-[#9B9490] font-normal',
                ].join(' ')}
                style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
                onClick={() => scrollToStory(story.id)}
              >
                <span className="text-[0.82rem] text-center leading-tight line-clamp-1">
                  {story.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex border-t border-[#E8E0D8]">
          <button
            className="flex-1 py-3.5 text-sm text-[#9B9490] cursor-pointer hover:bg-[#FAF8F4] transition-colors"
            onClick={onClose}
            type="button"
          >
            취소
          </button>
          <button
            className="flex-1 py-3.5 text-sm font-semibold text-[#8B2246] border-l border-[#E8E0D8] cursor-pointer hover:bg-[#FDF0F4] transition-colors"
            onClick={() => {
              onSelect(selectedId)
              onClose()
            }}
            type="button"
          >
            선택
          </button>
        </div>
      </div>
    </div>
  )
}
