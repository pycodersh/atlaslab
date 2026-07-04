'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Volume2, Waves, ChevronLeft, ChevronRight, Eye, EyeOff, Square } from 'lucide-react'
import type { MagazineStory } from '@/types/magazine'
import { getMoodImages } from '@/data/mood-images'
import { STORY_MOOD_MAP } from '@/data/story-moods'
import { StoryImageSlider } from '@/components/StoryImageSlider'
import { TodayMissionBar } from '@/components/TodayMissionBar'
import { TappableWordText } from '@/components/TappableWordText'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { RATE_MAP } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, storyParaAudioUrl } from '@/lib/tts'

type StoryPageProps = {
  story: MagazineStory
  totalStories: number
  onNext: () => void
  onPrev: () => void
  hasPrev: boolean
  onOpenPicker: () => void
  speakAll: (
    texts: string[],
    audioUrls?: (string | null | undefined)[],
    opts?: { voiceKey?: import('@/lib/settings/preferences').VoiceKey; voiceKeys?: import('@/lib/settings/preferences').VoiceKey[] },
  ) => void
  stop: () => void
  isSpeaking: boolean
  currentParagraphIdx: number
  ambienceOn: boolean
  onAmbienceToggle: () => void
}


export function StoryPage({
  story,
  onNext,
  onPrev,
  hasPrev,
  onOpenPicker,
  speakAll,
  stop,
  isSpeaking,
  currentParagraphIdx,
  ambienceOn,
  onAmbienceToggle,
}: StoryPageProps) {
  const { prefs } = usePreferences()

  // ── Learning mode state ──────────────────────────────────────────────────
  const [translationOn, setTranslationOn]   = useState(false)
  const [recallMode,    setRecallMode]       = useState(false)
  const [revealedParas, setRevealedParas]    = useState<Set<string>>(new Set())
  const [playingParaId, setPlayingParaId]    = useState<string | null>(null)

  // Reset per-story state when story changes
  useEffect(() => {
    setRevealedParas(new Set())
    setRecallMode(false)
    setPlayingParaId(null)
  }, [story.id])

  // When recall mode turns off, clear all reveals
  useEffect(() => {
    if (!recallMode) setRevealedParas(new Set())
  }, [recallMode])

  // If speakAll starts (isSpeaking=true), clear single-para indicator
  useEffect(() => {
    if (isSpeaking) setPlayingParaId(null)
  }, [isSpeaking])

  // Cleanup on unmount
  useEffect(() => () => { ttsProvider.stop() }, [])

  // ── Image slider ─────────────────────────────────────────────────────────
  const activeParagraphId =
    currentParagraphIdx >= 0
      ? (story.paragraphs[currentParagraphIdx]?.id ?? null)
      : null

  const slideImages = useMemo(() => {
    if (story.slideImages && story.slideImages.length > 0) return story.slideImages
    const mood = story.mood ?? STORY_MOOD_MAP[story.id]
    if (mood) return getMoodImages(mood, 4)
    return [{ url: story.imageUrl, alt: story.imageAlt, status: 'ready' as const }]
  }, [story.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const narrator = story.narratorVoice ?? prefs.voice

  // ── Full-story audio ─────────────────────────────────────────────────────
  function handleSpeakAll() {
    if (isSpeaking) { stop(); return }
    setPlayingParaId(null)
    const texts     = story.paragraphs.map(p => p.english)
    const audioUrls = story.paragraphs.map(p => storyParaAudioUrl(narrator, story.id, p.id, p.english))
    speakAll(texts, audioUrls, { voiceKey: narrator })
  }

  // ── Per-paragraph audio ─────────────────────────────────────────────────
  function playSinglePara(para: { id: string; english: string }) {
    if (playingParaId === para.id) {
      ttsProvider.stop()
      setPlayingParaId(null)
      return
    }
    // Stop any speakAll or previous single-para
    stop()
    ttsProvider.stop()
    setPlayingParaId(para.id)
    const url = storyParaAudioUrl(narrator, story.id, para.id, para.english)
    ttsProvider.speak({
      texts:     [para.english],
      audioUrls: url ? [url] : undefined,
      voiceKey:  narrator,
      voiceKeys: [narrator],
      rate:      RATE_MAP[prefs.speechRate],
      pitch:     getPitchForKey(narrator),
      volume:    1.0,
      onEnd:     () => setPlayingParaId(null),
      onError:   () => setPlayingParaId(null),
    })
  }

  // ── Reveal ───────────────────────────────────────────────────────────────
  function revealPara(id: string) {
    setRevealedParas(prev => new Set(prev).add(id))
  }

  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-8">

          <TodayMissionBar currentStoryId={story.id} />

          {/* Title */}
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

          {/* Image Slider */}
          <StoryImageSlider
            images={slideImages}
            interval={story.slideshowInterval ?? 8}
            kenBurns={story.slideshowKenBurns ?? true}
            activeParagraphId={activeParagraphId}
            isTTSActive={isSpeaking}
            audioButton={
              <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  aria-label={isSpeaking ? '정지' : '전체 읽기'}
                  onClick={handleSpeakAll}
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer',
                    isSpeaking
                      ? 'bg-[var(--pa)] text-white'
                      : 'bg-black/30 text-white hover:bg-[var(--pa)]',
                  ].join(' ')}
                >
                  {isSpeaking
                    ? <Square className="w-3 h-3 fill-current" />
                    : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            }
          />

          {/* ── Controls: Translation + Recall ── */}
          <div className="flex items-center gap-2 pt-4 pb-3">
            {/* Translation toggle */}
            <button
              type="button"
              onClick={() => setTranslationOn(v => !v)}
              aria-label={translationOn ? '번역 숨기기' : '번역 보기'}
              className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full transition-colors cursor-pointer border ${
                translationOn
                  ? 'bg-[var(--pal)] text-[var(--pa)] border-[var(--pal)]'
                  : 'text-[var(--pm2)] border-[var(--pd)] hover:border-[var(--pa)] hover:text-[var(--pa)]'
              }`}
            >
              KR
            </button>

            {/* Recall toggle */}
            <button
              type="button"
              onClick={() => setRecallMode(v => !v)}
              aria-label={recallMode ? 'Recall OFF' : 'Recall ON'}
              className={`flex items-center gap-1 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full transition-colors cursor-pointer border ${
                recallMode
                  ? 'bg-[var(--pa)] text-white border-[var(--pa)]'
                  : 'text-[var(--pm2)] border-[var(--pd)] hover:border-[var(--pa)] hover:text-[var(--pa)]'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              RECALL
            </button>
          </div>

          {/* ── Paragraphs ── */}
          <div className="space-y-5">
            {story.paragraphs.map((para) => {
              const isRevealed  = revealedParas.has(para.id)
              const showEnglish = !recallMode || isRevealed
              const isPlaying   = playingParaId === para.id
              const isCurrentTTS = currentParagraphIdx >= 0 &&
                story.paragraphs[currentParagraphIdx]?.id === para.id

              const koText = resolveTranslation(
                para.koreanTranslation,
                prefs.language,
                para.translations,
              )

              return (
                <div key={para.id} className="relative group">
                  {/* English text or skeleton */}
                  <div className={`pr-8 rounded-xl px-2 py-1.5 -mx-2 transition-colors ${
                    isCurrentTTS && isSpeaking ? 'bg-[var(--pal)]' : ''
                  }`}>
                    {showEnglish ? (
                      <TappableWordText
                        text={para.english}
                        source={{
                          sourceType:       'story',
                          sourceId:         String(story.id),
                          storyId:          story.id,
                          paragraphId:      para.id,
                          originalSentence: para.english,
                        }}
                        className="text-[0.9rem] leading-[1.9] text-[var(--pt)] block"
                      />
                    ) : (
                      /* Recall skeleton */
                      <div className="space-y-2 py-1" aria-hidden="true">
                        <div className="h-4 rounded-lg bg-[var(--pd)]" style={{ width: '90%' }} />
                        <div className="h-4 rounded-lg bg-[var(--pd)]" style={{ width: '75%' }} />
                        <div className="h-4 rounded-lg bg-[var(--pd)]" style={{ width: '55%' }} />
                      </div>
                    )}

                    {/* Reveal button */}
                    {recallMode && !isRevealed && (
                      <button
                        type="button"
                        onClick={() => revealPara(para.id)}
                        className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[var(--pa)] hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        REVEAL
                      </button>
                    )}

                    {/* Korean translation */}
                    {(translationOn || (recallMode && isRevealed)) && koText && (
                      <p className="text-[0.8rem] text-[var(--pm)] leading-relaxed mt-1.5">
                        {koText}
                      </p>
                    )}
                  </div>

                  {/* Per-paragraph Volume button */}
                  <button
                    type="button"
                    onClick={() => playSinglePara(para)}
                    aria-label={isPlaying ? '정지' : '이 문단 듣기'}
                    className={`absolute right-0 top-1.5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer ${
                      isPlaying
                        ? 'text-[var(--pa)] opacity-100 bg-[var(--pal)]'
                        : 'text-[var(--pm2)] hover:text-[var(--pa)] hover:bg-[var(--pal)]'
                    }`}
                  >
                    {isPlaying
                      ? <Square className="w-3.5 h-3.5 fill-current" />
                      : <Volume2 className="w-3.5 h-3.5" strokeWidth={1.8} />}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Story note */}
          {resolveTranslation(story.storyNote, prefs.language, story.storyNoteTranslations) && (
            <div className="mt-7 border-l-2 border-[var(--pd)] pl-3">
              <p className="font-playfair text-sm text-[var(--pm)] leading-relaxed">
                {resolveTranslation(story.storyNote, prefs.language, story.storyNoteTranslations)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
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
