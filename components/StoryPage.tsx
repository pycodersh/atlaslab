'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Volume2, Waves, Square } from 'lucide-react'
import type { MagazineStory } from '@/types/magazine'
import { getMoodImages } from '@/data/mood-images'
import { STORY_MOOD_MAP } from '@/data/story-moods'
import { StoryImageSlider } from '@/components/StoryImageSlider'
import { TappableWordText } from '@/components/TappableWordText'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { RATE_MAP } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey, storyParaAudioUrl } from '@/lib/tts'
import { openSavePopup, closeSavePopup } from '@/lib/words/popupStore'

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // ── Learning mode state ──────────────────────────────────────────────────
  type StudyMode = 'en' | 'en-ko' | 'ko'
  const STUDY_CYCLE: StudyMode[] = ['en', 'en-ko', 'ko']
  const STUDY_LABEL: Record<StudyMode, string> = { 'en': 'EN', 'en-ko': 'EN·KO', 'ko': 'KO' }

  const [studyMode, setStudyMode] = useState<StudyMode>('en')
  const showEnglish = studyMode === 'en' || studyMode === 'en-ko'
  const showKorean  = studyMode === 'en-ko' || studyMode === 'ko'

  function cycleStudyMode() {
    setStudyMode(prev => STUDY_CYCLE[(STUDY_CYCLE.indexOf(prev) + 1) % STUDY_CYCLE.length])
  }
  const [playingParaId, setPlayingParaId] = useState<string | null>(null)
  const [revealedParas, setRevealedParas] = useState<Set<string>>(new Set())

  function revealPara(paraId: string) {
    setRevealedParas(prev => new Set([...prev, paraId]))
  }

  // Reset per-story state when story changes
  useEffect(() => {
    setStudyMode('en')
    setPlayingParaId(null)
    setRevealedParas(new Set())
  }, [story.id])

  // If speakAll starts (isSpeaking=true), clear single-para indicator
  useEffect(() => {
    if (isSpeaking) setPlayingParaId(null)
  }, [isSpeaking])

  // Cleanup on unmount
  useEffect(() => () => { ttsProvider.stop() }, [])

  // ── Phrase selection via native long-press + drag ────────────────────────
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) return

      const text = sel.toString().trim()
      if (!text) return

      const words = text.split(/\s+/).filter(Boolean)
      // Only handle multi-word selections (single words handled by tap)
      if (words.length < 2 || words.length > 8) return

      // Find which paragraph the selection is in via data-para-id
      const anchorNode = sel.anchorNode
      if (!anchorNode) return
      const el = anchorNode.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : anchorNode as Element
      const paraEl = el?.closest('[data-para-id]') as HTMLElement | null
      if (!paraEl) return

      const paragraphId = paraEl.dataset.paraId
      const para = story.paragraphs.find(p => p.id === paragraphId)
      if (!para) return

      openSavePopup({
        word:             text,
        originalSentence: para.english,
        sourceType:       'story',
        sourceId:         String(story.id),
        storyId:          story.id,
        paragraphId:      para.id,
      })
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [story])

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

  const subtitle = resolveTranslation(story.subtitleKo, prefs.language, story.subtitleTranslations)
  const storyNote = resolveTranslation(story.storyNote, prefs.language, story.storyNoteTranslations)

  // Build map: paragraphId → pattern core phrases to highlight in burgundy
  const patternHighlightMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const pat of story.patterns ?? []) {
      const core = pat.pattern.replace(/~.*$/, '').trim().replace(/[.,!?]+$/, '').trim()
      if (!core) continue
      for (const para of story.paragraphs) {
        if (para.english.includes(pat.storySentence)) {
          const existing = map.get(para.id) ?? []
          existing.push(core)
          map.set(para.id, existing)
        }
      }
    }
    return map
  }, [story])

  return (
    <div className="h-full flex flex-col" style={{ background: 'transparent' }}>
      <div
        className="flex-1"
        style={{
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch' as never,
          touchAction: 'pan-y',
          paddingTop: 8,
        }}
      >
        <TopNav />

        {/* ── Hero Image — same width as card below ── */}
        <div style={{ padding: '0 16px', position: 'relative' }}>
          {/* Story number — top-left of image */}
          <button
            type="button"
            onClick={onOpenPicker}
            aria-label="스토리 선택"
            style={{
              position: 'absolute', top: 12, left: 28, zIndex: 10,
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.20em',
              color: 'rgba(255,255,255,0.82)', textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>
              STORY {String(story.id).padStart(2, '0')}
            </span>
          </button>
        <StoryImageSlider
          images={slideImages}
          interval={story.slideshowInterval ?? 8}
          kenBurns={story.slideshowKenBurns ?? true}
          activeParagraphId={activeParagraphId}
          isTTSActive={isSpeaking}
          titleContent={
            <div style={{ padding: '0 18px 18px' }}>
              {/* Title */}
              <h1 style={{
                fontSize: 22, fontWeight: 900, lineHeight: 1.2,
                color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em',
                textShadow: '0 4px 18px rgba(0,0,0,.30)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {story.title}
              </h1>
              {subtitle && (
                <p style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.62)',
                  margin: 0, lineHeight: 1.3,
                  textShadow: '0 2px 8px rgba(0,0,0,.25)',
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          }
          audioButton={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {story.ambienceId && (
                <button
                  type="button"
                  aria-label={ambienceOn ? '환경음 끄기' : '환경음 켜기'}
                  onClick={onAmbienceToggle}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: ambienceOn ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff', cursor: 'pointer',
                    transition: 'background 0.15s',
                    filter: ambienceOn ? 'brightness(1.1)' : 'brightness(1)',
                  }}
                >
                  <Waves style={{ width: 14, height: 14 }} />
                </button>
              )}
              <button
                type="button"
                aria-label={isSpeaking ? '정지' : '전체 읽기'}
                onClick={handleSpeakAll}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSpeaking ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff', cursor: 'pointer',
                  transition: 'background 0.15s',
                  filter: isSpeaking ? 'brightness(1.1)' : 'brightness(1)',
                }}
              >
                {isSpeaking
                  ? <Square style={{ width: 12, height: 12 }} />
                  : <Volume2 style={{ width: 14, height: 14 }} />}
              </button>
            </div>
          }
        />
        </div>

        {/* ── Glass Story Card ── */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div
            className="glass-card"
            style={{ borderRadius: 20, position: 'relative' }}
          >
            {/* Segmented Control — absolute top-right, does not reduce text width */}
            <div style={{ position: 'absolute', top: 14, right: 16, zIndex: 2 }}>
              <div style={{
                display: 'inline-flex', borderRadius: 10,
                background: 'var(--pc)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--pd)',
                padding: 2,
              }}>
                {STUDY_CYCLE.map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStudyMode(mode)}
                    style={{
                      padding: '4px 9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                      background: studyMode === mode ? 'var(--pw)' : 'transparent',
                      color: studyMode === mode ? 'var(--pt)' : 'var(--pm)',
                      boxShadow: studyMode === mode ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                      transition: 'background 0.18s, color 0.18s',
                    }}
                  >
                    {STUDY_LABEL[mode]}
                  </button>
                ))}
              </div>
            </div>

            {/* Paragraphs */}
            <div style={{ padding: '48px 28px 8px' }}>
              <div className="space-y-5">
                {story.paragraphs.map((para, i) => {
                  const isCurrentTTS = currentParagraphIdx === i && isSpeaking
                  const isKoOnly = studyMode === 'ko'
                  const isRevealed = showEnglish || isKoOnly || revealedParas.has(para.id)
                  const koText = resolveTranslation(para.koreanTranslation, prefs.language, para.translations)

                  return (
                    <div key={para.id} data-para-id={para.id} className="rounded-xl px-2 py-1 -mx-2">
                      {/* English — KO 모드에서는 투명(위치 유지) */}
                      {isRevealed ? (
                        <div style={{ opacity: isKoOnly ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: isKoOnly ? 'none' : 'auto' }}>
                          <TappableWordText
                            text={para.english}
                            source={{
                              sourceType:       'story',
                              sourceId:         String(story.id),
                              storyId:          story.id,
                              paragraphId:      para.id,
                              originalSentence: para.english,
                            }}
                            highlightPhrases={patternHighlightMap.get(para.id)}
                            className="text-[0.9rem] leading-[1.9] text-[var(--pt)] block text-justify"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => revealPara(para.id)}
                          aria-label="Reveal English"
                          className="w-full text-left cursor-pointer group/reveal"
                          style={{ background: 'none', border: 'none', padding: 0 }}
                        >
                          <div className="space-y-2 py-1">
                            <div className="h-4 rounded-lg bg-[var(--pd)] group-hover/reveal:opacity-50 transition-colors" style={{ width: '90%' }} />
                            <div className="h-4 rounded-lg bg-[var(--pd)] group-hover/reveal:opacity-50 transition-colors" style={{ width: '55%' }} />
                          </div>
                          <span className="text-[9px] tracking-[0.15em] text-[var(--pm2)] font-semibold mt-1 block opacity-0 group-hover/reveal:opacity-100 transition-opacity">
                            TAP TO REVEAL
                          </span>
                        </button>
                      )}

                      {/* Korean translation */}
                      {showKorean && koText && (
                        <p className="text-[0.8rem] text-[var(--pm)] leading-relaxed mt-1 text-justify">
                          {koText}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Story note — 한줄 요약 */}
            {storyNote && (
              <div style={{ padding: '0 20px 22px', marginTop: 8 }}>
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.55)',
                  paddingTop: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <p style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                      color: 'var(--pm2)', margin: 0, textTransform: 'uppercase', flexShrink: 0,
                    }}>
                      Summary
                    </p>
                    <div style={{ flex: 1, height: 1, background: 'rgba(60,60,67,0.18)' }} />
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--pt2)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                    {storyNote}
                  </p>
                </div>
              </div>
            )}

            {!storyNote && <div style={{ height: 22 }} />}
          </div>
        </div>

        {/* Bottom spacer — transparent, keeps content above tab bar */}
        <div
          aria-hidden="true"
          style={{
            height: 'calc(120px + env(safe-area-inset-bottom, 0px))',
            flexShrink: 0,
            background: 'transparent',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
