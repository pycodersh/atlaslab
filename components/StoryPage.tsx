'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Volume2 } from 'lucide-react'
import type { MagazineParagraph, MagazineStory } from '@/types/magazine'

type StoryPageProps = {
  story: MagazineStory
  totalStories: number
  onNext: () => void
  onPrevStory?: () => void
  onOpenPicker: () => void
  onOpenPopup: (paragraph: MagazineParagraph) => void
  speakAll: (texts: string[]) => void
  stop: () => void
  isSpeaking: boolean
}

function highlightText(text: string, phrases: string[]): React.ReactNode {
  if (phrases.length === 0) return text
  const sorted = [...phrases].sort((a, b) => b.length - a.length)
  const escaped = sorted.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) => {
    const isMatch = sorted.some((p) => p.toLowerCase() === part.toLowerCase())
    return isMatch ? (
      <span key={i} className="text-[#8B2246] font-medium">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  })
}

export function StoryPage({
  story,
  onOpenPicker,
  onOpenPopup,
  speakAll,
  stop,
  isSpeaking,
}: StoryPageProps) {
  const [liked, setLiked] = useState(false)

  function handleGlobalAudio() {
    if (isSpeaking) { stop(); return }
    speakAll(story.paragraphs.map((p) => p.english))
  }

  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between pl-8 pr-6 pt-10 pb-2">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#1A1A1A]">PATTO</span>
          <span className="text-[9px] tracking-[0.25em] text-[#C8BFB5]">
            {String(story.id).padStart(2, '0')} / 100
          </span>
        </header>

        <div className="pl-8 pr-6 pb-6">
          {/* Title — click to open story picker */}
          <button
            type="button"
            onClick={onOpenPicker}
            className="text-left w-full group mt-3 mb-0.5"
            aria-label="스토리 선택"
          >
            <h1 className="font-playfair text-[2rem] font-bold leading-tight text-[#1A1A1A] group-hover:text-[#8B2246] transition-colors duration-200">
              {story.title}
            </h1>
          </button>
          <p className="text-[0.78rem] text-[#8B2246] mt-1.5 mb-5 tracking-wide">
            {story.subtitleKo}
          </p>

          {/* Story image */}
          <div className="relative w-full h-52 rounded-xl overflow-hidden mb-7 shadow-sm">
            <Image
              src={story.imageUrl}
              alt={story.imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Paragraphs — click to open translation popup */}
          <div className="space-y-5">
            {story.paragraphs.map((para) => (
              <div
                key={para.id}
                className="cursor-pointer rounded-xl px-2 py-1.5 -mx-2 hover:bg-[#F5EDE8]/60 active:bg-[#F0E4DC]/80 transition-colors"
                onClick={() => onOpenPopup(para)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpenPopup(para)
                }}
                role="button"
                tabIndex={0}
              >
                <p className="text-[0.9rem] leading-[1.9] text-[#1A1A1A] select-none">
                  {highlightText(para.english, story.highlightPhrases)}
                </p>
              </div>
            ))}
          </div>

          {/* Story note */}
          {story.storyNote && (
            <div className="mt-8 bg-[#FDF5EC] border border-[#E8D4B8] rounded-xl p-4">
              <p className="font-playfair text-sm text-[#7A6550] leading-relaxed">
                {story.storyNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar — Heart + Speaker only */}
      <div className="shrink-0 pb-8 pt-4 pl-8 pr-6 bg-gradient-to-t from-[#FAF8F4] via-[#FAF8F4] to-transparent">
        <div className="flex items-center justify-between">
          <button
            aria-label={liked ? '좋아요 취소' : '좋아요'}
            className="p-2 cursor-pointer"
            onClick={() => setLiked((v) => !v)}
            type="button"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                liked ? 'text-[#8B2246] fill-[#8B2246]' : 'text-[#C8BFB5]'
              }`}
            />
          </button>

          <p className="text-[8px] tracking-[0.2em] text-[#D8D0C8]">
            SPEAK NATURALLY. CONNECT DEEPLY.
          </p>

          <button
            aria-label={isSpeaking ? '정지' : '전체 읽기'}
            className={`p-2 transition-colors cursor-pointer ${
              isSpeaking ? 'text-[#8B2246]' : 'text-[#C8BFB5] hover:text-[#8B2246]'
            }`}
            onClick={handleGlobalAudio}
            type="button"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
