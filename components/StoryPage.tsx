'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Volume2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazineParagraph, MagazineStory } from '@/types/magazine'

type StoryPageProps = {
  story: MagazineStory
  totalStories: number
  onNext: () => void        // Story → Patterns (same story)
  onPrev: () => void        // Story → prev story's Patterns (or first story)
  hasPrev: boolean
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
  return parts.map((part, i) =>
    sorted.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="text-[#8B2246] font-medium">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function StoryPage({
  story,
  onNext,
  onPrev,
  hasPrev,
  onOpenPicker,
  onOpenPopup,
  speakAll,
  stop,
  isSpeaking,
}: StoryPageProps) {
  const [liked, setLiked] = useState(false)

  function handleAudio() {
    if (isSpeaking) { stop(); return }
    speakAll(story.paragraphs.map((p) => p.english))
  }

  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-8">

          {/* Title */}
          <h1 className="font-playfair text-[1.85rem] font-bold leading-tight text-[#1A1A1A] mt-2 mb-1">
            {story.title}
          </h1>

          {/* Korean subtitle + Story picker on same line */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[0.78rem] text-[#9B9490] tracking-wide">
              {story.subtitleKo}
            </p>
            <button
              type="button"
              onClick={onOpenPicker}
              aria-label="스토리 선택"
              className="flex items-center shrink-0 ml-3 group cursor-pointer"
            >
              <span className="text-[9px] tracking-[0.2em] font-semibold text-[#8B2246] group-hover:opacity-70 transition-opacity">
                Story {String(story.id).padStart(2, '0')}
              </span>
            </button>
          </div>

          {/* Image + Heart + Speaker overlay */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-7 shadow-sm">
            <Image
              src={story.imageUrl}
              alt={story.imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Speaker — bottom-right of image */}
            <button
              type="button"
              aria-label={isSpeaking ? '정지' : '전체 읽기'}
              onClick={handleAudio}
              className={[
                'absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer',
                isSpeaking
                  ? 'bg-[#8B2246] text-white'
                  : 'bg-black/30 text-white hover:bg-[#8B2246]',
              ].join(' ')}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Paragraphs */}
          <div className="space-y-5">
            {story.paragraphs.map((para) => (
              <div
                key={para.id}
                className="cursor-pointer rounded-xl px-2 py-1.5 -mx-2 hover:bg-[#F5EDE8]/60 active:bg-[#F0E4DC]/80 transition-colors"
                onClick={() => onOpenPopup(para)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenPopup(para) }}
                role="button"
                tabIndex={0}
              >
                <p className="text-[0.9rem] leading-[1.9] text-[#1A1A1A] select-none">
                  {highlightText(para.english, story.highlightPhrases)}
                </p>
              </div>
            ))}
          </div>

          {/* Story note + Heart */}
          <div className="mt-7 flex items-start gap-3">
            {story.storyNote && (
              <div className="flex-1 border-l-2 border-[#E8D4B8] pl-3">
                <p className="font-playfair text-sm text-[#9B9490] leading-relaxed">
                  {story.storyNote}
                </p>
              </div>
            )}
            <button
              type="button"
              aria-label={liked ? '좋아요 취소' : '좋아요'}
              onClick={() => setLiked((v) => !v)}
              className="p-1.5 cursor-pointer shrink-0 mt-0.5"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  liked ? 'text-[#8B2246] fill-[#8B2246]' : 'text-[#D8D0C8]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom — ‹ and › only */}
      <div className="shrink-0 border-t border-[#EDE5DC] bg-[#FAF8F4] py-3 px-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전"
            onClick={onPrev}
            disabled={!hasPrev}
            className={`p-2 rounded-full transition-colors ${
              hasPrev
                ? 'text-[#9B9490] hover:text-[#8B2246] hover:bg-[#FDF0F4] cursor-pointer'
                : 'text-[#E0D8D2] cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <span className="text-[8px] tracking-[0.3em] text-[#D8D0C8] font-medium">
            {String(story.id).padStart(2, '0')} · STORY
          </span>

          <button
            type="button"
            aria-label="다음 (패턴)"
            onClick={onNext}
            className="p-2 rounded-full text-[#9B9490] hover:text-[#8B2246] hover:bg-[#FDF0F4] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
