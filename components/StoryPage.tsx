'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Volume2, ChevronRight, ChevronLeft } from 'lucide-react'
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
  onNext,
  onPrevStory,
  onOpenPicker,
  onOpenPopup,
  speakAll,
  stop,
  isSpeaking,
}: StoryPageProps) {
  const [liked, setLiked] = useState(false)

  const allEnglish = story.paragraphs.map((p) => p.english)

  function handleGlobalAudio() {
    if (isSpeaking) { stop(); return }
    speakAll(allEnglish)
  }

  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between pl-8 pr-6 pt-10 pb-2">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#1A1A1A]">PATTO</span>
          <button
            aria-label="스토리 선택"
            className="text-[10px] tracking-[0.3em] text-[#8B2246] font-semibold cursor-pointer hover:opacity-60 transition-opacity active:opacity-40"
            onClick={onOpenPicker}
            type="button"
          >
            STORY {String(story.id).padStart(2, '0')}
          </button>
        </header>

        <div className="pl-8 pr-6 pb-6">
          <h1 className="font-playfair text-[2rem] font-bold leading-tight text-[#1A1A1A] mt-3">
            {story.title}
          </h1>
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
              <p className="font-playfair text-sm text-[#7A6550] leading-relaxed italic">
                {story.storyNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 bg-gradient-to-t from-[#FAF8F4] via-[#FAF8F4] to-transparent pb-8 pt-4 pl-8 pr-6">
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

          <div className="flex items-center gap-3">
            {onPrevStory && (
              <button
                aria-label="이전 스토리"
                className="flex items-center gap-1 text-[10px] tracking-[0.2em] text-[#9B9490] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                onClick={onPrevStory}
                type="button"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                PREV
              </button>
            )}
            <button
              aria-label="패턴 페이지로 이동"
              className="bg-[#1A1A1A] text-[#FAF8F4] text-[10px] tracking-[0.2em] font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#333] transition-colors cursor-pointer active:scale-95"
              onClick={onNext}
              type="button"
            >
              PATTERNS
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
