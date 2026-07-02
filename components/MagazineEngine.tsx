'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, X } from 'lucide-react'

import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { PatternsPage } from '@/components/PatternsPage'
import { StoryPage } from '@/components/StoryPage'
import { WheelPicker } from '@/components/WheelPicker'
import { useSpeech } from '@/hooks/useSpeech'
import { useAmbience } from '@/hooks/useAmbience'
import { usePreferences } from '@/contexts/PreferencesContext'
import { storyParaAudioUrl } from '@/lib/tts'
import type { AmbienceId } from '@/types/magazine'
import type { MagazineParagraph, MagazineStory } from '@/types/magazine'
import { resolveTranslation } from '@/lib/i18n/translation'
import { saveLastPosition } from '@/lib/last-position'
import type { PracticeExample } from '@/data/pattern-examples'

type MagazineEngineProps = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
  patternExamples?: Record<string, PracticeExample[]>
}

export function MagazineEngine({ story, allStories, initialView = 'story', patternExamples }: MagazineEngineProps) {
  const router = useRouter()
  const { speak, speakAll, stop, isSpeaking, currentParagraphIdx } = useSpeech()
  const { prefs } = usePreferences()
  const { play: playAmbience, stop: stopAmbience } = useAmbience()

  const [view, setView] = useState<'story' | 'patterns'>(initialView)

  // 위치 저장 — Continue Learning이 여기로 돌아올 수 있도록
  useEffect(() => { saveLastPosition(story.id, view) }, [story.id, view])
  const [showPicker, setShowPicker] = useState(false)
  const [popup, setPopup] = useState<MagazineParagraph | null>(null)

  // ── Swipe / drag state ──────────────────────────────────────────────
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)
  const viewRef = useRef(view)
  const storyRef = useRef(story)
  const allStoriesRef = useRef(allStories)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { storyRef.current = story }, [story])
  useEffect(() => { allStoriesRef.current = allStories }, [allStories])

  // Non-passive touchmove to allow e.preventDefault() on horizontal swipes
  useEffect(() => {
    const el = railRef.current
    if (!el) return

    function onTouchMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > Math.abs(dy) + 5) isHorizontalSwipe.current = true
        else if (Math.abs(dy) > Math.abs(dx) + 5) isHorizontalSwipe.current = false
        else return
      }
      if (!isHorizontalSwipe.current) return

      e.preventDefault()

      const v = viewRef.current
      const s = storyRef.current
      const all = allStoriesRef.current
      // Block left-drag when on last page (Patterns of last story)
      if (v === 'patterns' && dx < 0 && s.id >= all.length) return
      // Block right-drag when on first page (Story of first story)
      if (v === 'story' && dx > 0 && s.id <= 1) return

      setDragOffset(dx)
      setIsDragging(true)
    }

    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = null
  }

  // Linear swipe: Story01 → Patterns01 → Story02 → Patterns02 …
  function handleTouchEnd() {
    isHorizontalSwipe.current = null
    if (!isDragging) { setDragOffset(0); return }

    const THRESHOLD = (typeof window !== 'undefined' ? window.innerWidth : 375) * 0.25
    const v = viewRef.current
    const s = storyRef.current

    if (dragOffset < -THRESHOLD) {
      // Swipe LEFT → forward
      if (v === 'story') {
        // Story → Patterns (same story)
        stop(); setPopup(null); setView('patterns')
      } else {
        // Patterns → next Story
        const next = allStoriesRef.current.find(x => x.id === s.id + 1)
        if (next) { stop(); setPopup(null); setView('story'); router.push(`/stories/${next.id}`) }
      }
    } else if (dragOffset > THRESHOLD) {
      // Swipe RIGHT → backward
      if (v === 'patterns') {
        // Patterns → Story (same story)
        stop(); setPopup(null); setView('story')
      } else {
        // Story → prev story's Patterns
        const prev = allStoriesRef.current.find(x => x.id === s.id - 1)
        if (prev) { stop(); setPopup(null); router.push(`/stories/${prev.id}?v=p`) }
      }
    }

    setIsDragging(false)
    setDragOffset(0)
  }

  // 스토리 진입 시 ambience 자동 시작
  // - sceneVideo가 있는 Scene First 스토리: ambienceDefault 설정 무관하게 항상 재생
  // - 일반 스토리: ambienceDefault=on 일 때만 재생
  // - 브라우저 autoplay 정책: AudioContext는 첫 사용자 제스처 이후에만 허용
  useEffect(() => {
    stopAmbience()

    // sceneVideo 스토리는 AmbienceAudio 버튼으로만 제어 (자동재생 제외)
    if (story.sceneVideo) return
    if (prefs.ambienceDefault !== 'on' || !story.ambienceId) return

    const id = story.ambienceId as AmbienceId
    let started = false

    function onFirstGesture() {
      if (started) return
      started = true
      playAmbience(id)
    }

    document.addEventListener('click',      onFirstGesture, { once: true, capture: true })
    document.addEventListener('touchstart', onFirstGesture, { once: true, capture: true })

    return () => {
      document.removeEventListener('click',      onFirstGesture, { capture: true })
      document.removeEventListener('touchstart', onFirstGesture, { capture: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id, prefs.ambienceDefault])

  // ── Navigation ──────────────────────────────────────────────────────
  function switchView(newView: 'story' | 'patterns') {
    stop(); setPopup(null); setView(newView)
  }

  function goToStory(id: number, startView: 'story' | 'patterns' = 'story') {
    stop(); setPopup(null); setView('story')
    const suffix = startView === 'patterns' ? '?v=p' : ''
    router.push(`/stories/${id}${suffix}`)
  }

  // Linear next: Story → Patterns, Patterns → next Story
  function goNext() {
    if (view === 'story') {
      switchView('patterns')
    } else {
      const next = allStories.find(s => s.id === story.id + 1)
      if (next) goToStory(next.id, 'story')
    }
  }

  // Linear prev: Patterns → Story, Story → prev Story's Patterns
  function goPrev() {
    if (view === 'patterns') {
      switchView('story')
    } else {
      const prev = allStories.find(s => s.id === story.id - 1)
      if (prev) goToStory(prev.id, 'patterns')
    }
  }

  const isFirst = story.id <= 1 && view === 'story'
  const isLast = story.id >= allStories.length && view === 'patterns'

  // ── Rail transform ──────────────────────────────────────────────────
  const basePercent = view === 'story' ? 0 : -50
  const railTransform = isDragging
    ? `translateX(calc(${basePercent}% + ${dragOffset}px))`
    : `translateX(${basePercent}%)`

  return (
    <div className="relative overflow-hidden" style={{ marginTop: NAV_HEIGHT, height: `calc(100dvh - ${NAV_HEIGHT}px)` }}>
      <TopNav />

      {/* Sliding rail */}
      <div
        ref={railRef}
        className="flex h-full"
        style={{
          width: '200%',
          transform: railTransform,
          transition: isDragging ? 'none' : 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Story page */}
        <div className="h-full overflow-hidden" style={{ width: '50%' }}>
          <StoryPage
            story={story}
            totalStories={allStories.length}
            onNext={goNext}
            onPrev={goPrev}
            hasPrev={!isFirst}
            onOpenPicker={() => setShowPicker(true)}
            onOpenPopup={setPopup}
            speakAll={speakAll}
            stop={stop}
            isSpeaking={isSpeaking}
            currentParagraphIdx={currentParagraphIdx}
          />
        </div>

        {/* Patterns page */}
        <div className="h-full overflow-hidden" style={{ width: '50%' }}>
          <PatternsPage
            story={story}
            totalStories={allStories.length}
            onPrev={goPrev}
            onNext={goNext}
            hasNext={!isLast}
            onOpenPicker={() => setShowPicker(true)}
            patternExamples={patternExamples}
          />
        </div>
      </div>

      {/* PC ghost edge arrows */}
      <button
        aria-label="이전 페이지"
        onClick={() => { if (!isFirst) goPrev() }}
        className="fixed left-0 top-0 h-full z-20 hidden md:flex items-center justify-start pl-2 pr-3 group cursor-pointer"
        style={{ background: 'none', border: 'none' }}
        type="button"
      >
        <span className="text-[var(--pt)] text-[1.4rem] opacity-10 group-hover:opacity-35 transition-opacity select-none">‹</span>
      </button>
      <button
        aria-label="다음 페이지"
        onClick={() => { if (!isLast) goNext() }}
        className="fixed right-0 top-0 h-full z-20 hidden md:flex items-center justify-end pr-2 pl-3 group cursor-pointer"
        style={{ background: 'none', border: 'none' }}
        type="button"
      >
        <span className="text-[var(--pt)] text-[1.4rem] opacity-10 group-hover:opacity-35 transition-opacity select-none">›</span>
      </button>

      {/* Translation popup — outside rail */}
      {popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => { setPopup(null); stop() }}
        >
          <div
            className="rounded-2xl p-5 w-full max-w-[320px] shadow-2xl"
            style={{ background: 'var(--pb)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] tracking-[0.25em] text-[var(--pa)] font-semibold">TRANSLATION</span>
              <div className="flex items-center gap-2">
                <button
                  aria-label={isSpeaking ? '정지' : '읽기'}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${isSpeaking ? 'bg-[var(--pd)] text-[var(--pa)]' : 'text-[var(--pm2)] hover:bg-[var(--pd)] hover:text-[var(--pa)]'}`}
                  onClick={() => {
                    if (isSpeaking) { stop(); return }
                    const v = story.narratorVoice ?? prefs.voice
                    speak(popup.english, storyParaAudioUrl(v, story.id, popup.id, popup.english), v)
                  }}
                  type="button"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  aria-label="닫기"
                  className="text-[var(--pm2)] hover:text-[var(--pt)] transition-colors cursor-pointer"
                  onClick={() => { setPopup(null); stop() }}
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="font-playfair text-[0.78rem] text-[var(--pm)] leading-relaxed mb-2">
              {popup.english}
            </p>
            {resolveTranslation(popup.koreanTranslation, prefs.language, popup.translations) && (
              <p className="text-[0.9rem] text-[var(--pt)] leading-relaxed mb-4">
                {resolveTranslation(popup.koreanTranslation, prefs.language, popup.translations)}
              </p>
            )}
            {popup.keyExpressions.length > 0 && (
              <>
                <div className="h-px bg-[var(--pd)] mb-3" />
                <div className="flex flex-wrap gap-2">
                  {popup.keyExpressions.map((expr, i) => (
                    <span key={i} className="text-[11px] bg-[var(--pal)] text-[var(--pa)] px-3 py-1 rounded-full">
                      {expr}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Wheel picker */}
      {showPicker && (
        <WheelPicker
          stories={allStories}
          currentId={story.id}
          onSelect={(id) => goToStory(id)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
