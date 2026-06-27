'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Volume2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazineParagraph, MagazineStory } from '@/types/magazine'
import { usePreferences } from '@/contexts/PreferencesContext'
import { storyParaAudioUrl } from '@/lib/tts'

type StoryPageProps = {
  story: MagazineStory
  totalStories: number
  onNext: () => void
  onPrev: () => void
  hasPrev: boolean
  onOpenPicker: () => void
  onOpenPopup: (paragraph: MagazineParagraph) => void
  speakAll: (texts: string[], audioUrls?: (string | null | undefined)[]) => void
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
      <span key={i} className="text-[var(--pa)] font-medium">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function pickStoryImage(story: MagazineStory): { url: string; alt: string } {
  const pool = story.imagePool
  if (pool && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }
  return { url: story.imageUrl, alt: story.imageAlt }
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
  const [storyImg] = useState(() => pickStoryImage(story))
  const { prefs } = usePreferences()

  const scene = story.sceneVideo

  function handleAudio() {
    if (isSpeaking) { stop(); return }
    const texts     = story.paragraphs.map(p => p.english)
    const audioUrls = story.paragraphs.map(p => storyParaAudioUrl(prefs.voice, story.id, p.id))
    speakAll(texts, audioUrls)
  }

  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-8">

          {/* 제목 */}
          <h1 className="font-playfair text-[1.85rem] font-bold leading-tight text-[var(--pt)] mt-2 mb-1">
            {story.title}
          </h1>

          <div className="flex items-center justify-between mb-5">
            <p className="text-[0.78rem] text-[var(--pm)] tracking-wide">
              {story.subtitleKo}
            </p>
            <button
              type="button"
              onClick={onOpenPicker}
              aria-label="스토리 선택"
              className="flex items-center shrink-0 ml-3 group cursor-pointer"
            >
              <span className="text-[9px] tracking-[0.2em] font-semibold text-[var(--pa)] group-hover:opacity-70 transition-opacity">
                Story {String(story.id).padStart(2, '0')}
              </span>
            </button>
          </div>

          {/* Scene Video 또는 커버 이미지 */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-7 shadow-sm">
            {scene?.url ? (
              <video
                src={scene.url}
                poster={scene.poster}
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Image
                src={storyImg.url}
                alt={storyImg.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                onError={(e) => {
                  const img = e.currentTarget
                  if (img.src !== story.imageUrl) img.src = story.imageUrl
                }}
              />
            )}
            {/* TTS 버튼 */}
            <button
              type="button"
              aria-label={isSpeaking ? '정지' : '전체 읽기'}
              onClick={handleAudio}
              className={[
                'absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer',
                isSpeaking
                  ? 'bg-[var(--pa)] text-white'
                  : 'bg-black/30 text-white hover:bg-[var(--pa)]',
              ].join(' ')}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 단락 목록 — 텍스트만, 이미지 없음 */}
          <div className="space-y-5">
            {story.paragraphs.map((para) => (
              <div
                key={para.id}
                className="cursor-pointer rounded-xl px-2 py-1.5 -mx-2 hover:bg-[var(--pc2)] active:bg-[var(--pc)] transition-colors"
                onClick={() => onOpenPopup(para)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenPopup(para) }}
                role="button"
                tabIndex={0}
              >
                <p className="text-[0.9rem] leading-[1.9] text-[var(--pt)] select-none">
                  {highlightText(para.english, story.highlightPhrases)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-start gap-3">
            {story.storyNote && (
              <div className="flex-1 border-l-2 border-[var(--pd)] pl-3">
                <p className="font-playfair text-sm text-[var(--pm)] leading-relaxed">
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
                  liked ? 'text-[var(--pa)] fill-[var(--pa)]' : 'text-[var(--pm2)]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--pd)] bg-[var(--pb)] py-3 px-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전"
            onClick={onPrev}
            disabled={!hasPrev}
            className={`p-2 rounded-full transition-colors ${
              hasPrev
                ? 'text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] cursor-pointer'
                : 'text-[var(--pd)] cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <span className="text-[8px] tracking-[0.3em] text-[var(--pm2)] font-medium">
            {String(story.id).padStart(2, '0')} · STORY
          </span>

          <button
            type="button"
            aria-label="다음 (패턴)"
            onClick={onNext}
            className="p-2 rounded-full text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
