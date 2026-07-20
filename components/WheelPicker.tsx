'use client'

import { useRef, useEffect, useState } from 'react'
import type { MagazineStory } from '@/types/magazine'
import { useT } from '@/hooks/useT'
import { Btn } from '@/components/ui/Btn'

type WheelPickerProps = {
  stories: MagazineStory[]
  currentId: number
  onSelect: (id: number) => void
  onClose: () => void
}

const ITEM_H = 38
const VISIBLE = 5
const PAD = Math.floor(VISIBLE / 2) * ITEM_H // 88px

export function WheelPicker({ stories, currentId, onSelect, onClose }: WheelPickerProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState(currentId)
  const t = useT()

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
        className="rounded-2xl w-72 overflow-hidden shadow-2xl"
        style={{ background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Label */}
        <div className="px-5 pt-4 pb-1">
          <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', textTransform: 'none', color: 'var(--pt)', textAlign: 'center' }}>
            SELECT STORY
          </p>
        </div>

        {/* Picker wheel */}
        <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
          {/* Top fade */}
          <div
            className="absolute inset-x-0 top-0 z-10 pointer-events-none"
            style={{ height: PAD, background: 'linear-gradient(to bottom, var(--pglass) 30%, transparent)' }}
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
            style={{ height: PAD, background: 'linear-gradient(to top, var(--pglass) 30%, transparent)' }}
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
                className="flex items-center justify-center px-6 cursor-pointer transition-all duration-150"
                style={{ height: ITEM_H, scrollSnapAlign: 'center', color: 'var(--pt)', fontWeight: story.id === selectedId ? 600 : 400 }}
                onClick={() => scrollToStory(story.id)}
              >
                <span className="text-[0.82rem] text-center leading-tight line-clamp-1">
                  <span className="font-semibold mr-1.5" style={{ color: 'var(--pt)' }}>{String(story.id).padStart(2, '0')}</span>
                  {story.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex border-t border-[#E8E0D8] gap-2 p-2">
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { onSelect(selectedId); onClose() }} style={{ flex: 1 }}>Done</Btn>
        </div>
      </div>
    </div>
  )
}
