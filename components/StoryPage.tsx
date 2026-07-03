'use client'

import { useMemo } from 'react'
import { Volume2, Waves, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazineParagraph, MagazineStory } from '@/types/magazine'
import { getMoodImages } from '@/data/mood-images'
import { STORY_MOOD_MAP } from '@/data/story-moods'
import { StoryImageSlider } from '@/components/StoryImageSlider'
import { TodayMissionBar } from '@/components/TodayMissionBar'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { storyParaAudioUrl } from '@/lib/tts'

type StoryPageProps = {
  story: MagazineStory
  totalStories: number
  onNext: () => void
  onPrev: () => void
  hasPrev: boolean
  onOpenPicker: () => void
  onOpenPopup: (paragraph: MagazineParagraph) => void
  speakAll: (texts: string[], audioUrls?: (string | null | undefined)[], opts?: { voiceKey?: import('@/lib/settings/preferences').VoiceKey; voiceKeys?: import('@/lib/settings/preferences').VoiceKey[] }) => void
  stop: () => void
  isSpeaking: boolean
  currentParagraphIdx: number
  ambienceOn: boolean
  onAmbienceToggle: () => void
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
  currentParagraphIdx,
  ambienceOn,
  onAmbienceToggle,
}: StoryPageProps) {
  const { prefs } = usePreferences()

  // TTS 현재 문단 ID → 슬라이더 동기화용
  const activeParagraphId =
    currentParagraphIdx >= 0
      ? (story.paragraphs[currentParagraphIdx]?.id ?? null)
      : null

  // Image Slider: slideImages 우선 → Mood fallback → imageUrl fallback
  const slideImages = useMemo(() => {
    if (story.slideImages && story.slideImages.length > 0) return story.slideImages
    const mood = story.mood ?? STORY_MOOD_MAP[story.id]
    if (mood) return getMoodImages(mood, 4)
    return [{ url: story.imageUrl, alt: story.imageAlt, status: 'ready' as const }]
  }, [story.id])  // eslint-disable-line react-hooks/exhaustive-deps

  // 내레이션 음성: 스토리 상황/주인공에 맞춘 narratorVoice 우선, 없으면 사용자 설정
  const narrator = story.narratorVoice ?? prefs.voice

  function handleAudio() {
    if (isSpeaking) { stop(); return }
    const texts     = story.paragraphs.map(p => p.english)
    const audioUrls = story.paragraphs.map(p => storyParaAudioUrl(narrator, story.id, p.id, p.english))
    speakAll(texts, audioUrls, { voiceKey: narrator })
  }

  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-8">

          {/* Today's Mission mini bar */}
          <TodayMissionBar currentStoryId={story.id} />

          {/* 제목 */}
          <h1 className="font-playfair text-[1.85rem] font-bold leading-tight text-[var(--pt)] mt-2 mb-1">
            {story.title}
          </h1>

          <div className="flex items-center justify-between mb-5">
            {resolveTranslation(story.subtitleKo, prefs.language, story.subtitleTranslations) && (
              <p className="text-[0.78rem] text-[var(--pm)] tracking-wide">
                {resolveTranslation(story.subtitleKo, prefs.language, story.subtitleTranslations)}
              </p>
            )}
            <button
              type="button"
              onClick={onOpenPicker}
              aria-label="스토리 선택"
              className="flex items-center shrink-0 ml-3 group cursor-pointer"
            >
              <span className="text-[11px] tracking-[0.2em] font-semibold uppercase text-[var(--pa)] group-hover:opacity-70 transition-opacity">
                Story {String(story.id).padStart(2, '0')}
              </span>
            </button>
          </div>

          {/* Image Slider — Story 장면 이미지 자동 슬라이드 */}
          <StoryImageSlider
            images={slideImages}
            interval={story.slideshowInterval ?? 8}
            kenBurns={story.slideshowKenBurns ?? true}
            activeParagraphId={activeParagraphId}
            isTTSActive={isSpeaking}
            audioButton={
              <div className="flex items-center gap-2">
                {/* Ambience toggle — only when story has ambience */}
                {story.ambienceId && (
                  <button
                    type="button"
                    aria-label={ambienceOn ? '환경음 끄기' : '환경음 켜기'}
                    onClick={onAmbienceToggle}
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer',
                      ambienceOn
                        ? 'bg-[var(--pa)] text-white'
                        : 'bg-black/30 text-white hover:bg-[var(--pa)]',
                    ].join(' ')}
                  >
                    <Waves className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* TTS button */}
                <button
                  type="button"
                  aria-label={isSpeaking ? '정지' : '전체 읽기'}
                  onClick={handleAudio}
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer',
                    isSpeaking
                      ? 'bg-[var(--pa)] text-white'
                      : 'bg-black/30 text-white hover:bg-[var(--pa)]',
                  ].join(' ')}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          />

          {/* 단락 목록 — 텍스트만, 이미지 없음. 탭 시 문단 팝업 열림 */}
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
                <p className="text-[0.9rem] leading-[1.9] text-[var(--pt)]">
                  {highlightText(para.english, story.highlightPhrases)}
                </p>
              </div>
            ))}
          </div>

          {resolveTranslation(story.storyNote, prefs.language, story.storyNoteTranslations) && (
            <div className="mt-7 border-l-2 border-[var(--pd)] pl-3">
              <p className="font-playfair text-sm text-[var(--pm)] leading-relaxed">
                {resolveTranslation(story.storyNote, prefs.language, story.storyNoteTranslations)}
              </p>
            </div>
          )}
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
