'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, Check, X, RotateCcw, BookOpen, Layers } from 'lucide-react'

import { magazineStories } from '@/data/magazine-stories'
import { getPatternExamples, type PracticeExample } from '@/data/pattern-examples'
import type { VoiceKey } from '@/lib/settings/preferences'
import { useSpeech } from '@/hooks/useSpeech'
import {
  getDueItems,
  applyReview,
  type LearningRecord,
  type SrsItemType,
} from '@/lib/srs/storage'
import { useT } from '@/hooks/useT'

type ReviewCard = {
  itemType: SrsItemType
  itemId: string
  voice?: VoiceKey
  storyLabel: string
  // pattern
  pattern?: string
  examples?: PracticeExample[]
  // story
  title?: string
  summary?: string
  linkedPatterns?: string[]
}

function buildCards(records: LearningRecord[]): ReviewCard[] {
  const cards: ReviewCard[] = []
  for (const rec of records) {
    if (rec.itemType === 'pattern') {
      let match: { sId: number; voice?: VoiceKey; p: (typeof magazineStories)[0]['patterns'][0] } | null = null
      for (const s of magazineStories) {
        const p = s.patterns.find((x) => x.id === rec.itemId)
        if (p) { match = { sId: s.id, voice: s.narratorVoice, p }; break }
      }
      if (!match) continue
      const examples = getPatternExamples(rec.itemId)
      cards.push({
        itemType: 'pattern',
        itemId: rec.itemId,
        voice: match.voice,
        storyLabel: `Story ${String(match.sId).padStart(2, '0')}`,
        pattern: match.p.pattern,
        examples: examples.length > 0
          ? examples
          : [
              { en: match.p.storySentence, ko: match.p.storySentenceKo },
              { en: match.p.variationSentence, ko: match.p.variationSentenceKo },
            ],
      })
    } else {
      const s = magazineStories.find((x) => String(x.id) === rec.itemId)
      if (!s) continue
      cards.push({
        itemType: 'story',
        itemId: rec.itemId,
        voice: s.narratorVoice,
        storyLabel: `Story ${String(s.id).padStart(2, '0')}`,
        title: s.title,
        summary: s.storyNote ?? s.subtitleKo,
        linkedPatterns: s.patterns.map((p) => p.pattern),
      })
    }
  }
  return cards
}

export function ReviewSession() {
  const router = useRouter()
  const t = useT()
  const { speakAll, stop } = useSpeech()

  const [cards, setCards] = useState<ReviewCard[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [done, setDone] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    setCards(buildCards(getDueItems()))
  }, [])

  useEffect(() => () => { stop() }, [stop])

  const total = cards?.length ?? 0
  const answered = correct + wrong
  const card = cards && idx < total ? cards[idx] : null

  // 오늘 복습 진행률 (완료 / 전체)
  const progressPct = useMemo(
    () => (total === 0 ? 0 : Math.round((answered / total) * 100)),
    [answered, total],
  )

  function answer(isCorrect: boolean) {
    if (!card) return
    stop()
    applyReview(card.itemType, card.itemId, isCorrect) // 알겠어 → ×2, 모르겠어 → 1, nextReviewAt 갱신
    if (isCorrect) setCorrect((c) => c + 1)
    else setWrong((w) => w + 1)

    if (idx + 1 >= total) setDone(true)
    else { setIdx((i) => i + 1); setRevealed(false) }
  }

  function speakPattern() {
    if (!card?.examples) return
    speakAll(card.examples.map((e) => e.en), undefined, { voiceKey: card.voice })
  }

  // ── 로딩 ──
  if (cards === null) {
    return <div className="min-h-dvh bg-transparent flex items-center justify-center text-[var(--pm)] text-sm">{t('loading')}</div>
  }

  // ── 복습할 항목 없음 ──
  if (total === 0) {
    return (
      <div className="min-h-dvh bg-transparent flex flex-col items-center justify-center px-8 text-center">
        <Check className="w-10 h-10 text-[var(--pa)] mb-4" strokeWidth={1.6} />
        <p className="font-playfair text-[1.4rem] font-bold text-[var(--pt)] mb-2">{t('no_reviews_title')}</p>
        <p className="text-[13px] text-[var(--pm)] leading-relaxed mb-7 whitespace-pre-line">
          {t('no_reviews_desc')}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/stories/1')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer">{t('new_story_btn')}</button>
          <button type="button" onClick={() => router.push('/records')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pc)] text-[var(--pt)] hover:opacity-80 transition-opacity cursor-pointer">Progress</button>
        </div>
      </div>
    )
  }

  // ── 완료 화면 ──
  if (done) {
    return (
      <div className="min-h-dvh bg-transparent flex flex-col items-center justify-center px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--pa)] flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <p className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] mb-1">{t('review_done_title')}</p>
        <p className="text-[13px] text-[var(--pm)] mb-6">{t('review_done_desc')}</p>

        {/* 오늘 완료한 복습 수 */}
        <div className="rounded-2xl bg-[var(--pc)] px-8 py-5 mb-6">
          <p className="font-playfair text-[2.4rem] font-bold text-[var(--pa)] leading-none">{answered}</p>
          <p className="text-[11px] text-[var(--pm)] mt-2">{t('review_today_label')}</p>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="text-center">
            <p className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] leading-none">{correct}</p>
            <p className="text-[11px] text-[var(--pm)] mt-1.5">{t('correct_label')}</p>
          </div>
          <div className="text-center">
            <p className="font-playfair text-[1.5rem] font-bold text-[var(--pm2)] leading-none">{wrong}</p>
            <p className="text-[11px] text-[var(--pm)] mt-1.5">{t('wrong_label')}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/home')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer">Home</button>
          <button type="button" onClick={() => router.push('/records')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pc)] text-[var(--pt)] hover:opacity-80 transition-opacity cursor-pointer">Progress</button>
        </div>
      </div>
    )
  }

  if (!card) return null
  const isPattern = card.itemType === 'pattern'

  // ── 카드 진행 화면 ──
  return (
    <div className="min-h-dvh bg-transparent flex flex-col">
      {/* 상단: 오늘 복습 진행률 */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between mb-2">
          <button type="button" aria-label={t('exit')} onClick={() => { stop(); router.push('/records') }} className="text-[var(--pm)] hover:text-[var(--pa)] transition-colors cursor-pointer p-1 -ml-1">
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
          <span className="text-[12px] font-bold text-[var(--pt)]">{answered} / {total}</span>
          <span className="text-[9px] tracking-[0.2em] text-[var(--pa)] font-bold">REVIEW</span>
        </div>
        <div className="h-1 bg-[var(--pd)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--pa)] rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* 카드 */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 min-h-0">
        <div className="glass-card px-6 py-8 flex flex-col max-h-[62vh] overflow-y-auto">
          <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.15em] font-bold text-[var(--pm)] mb-5 self-center">
            {isPattern ? <Layers className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {card.storyLabel} · {isPattern ? 'PATTERN' : 'STORY'}
          </span>

          {!revealed ? (
            /* ── 앞면 ── */
            <div className="flex flex-col items-center justify-center text-center min-h-[180px]">
              {isPattern ? (
                /* Pattern 앞면: 패턴 문장만 */
                <p className="font-playfair text-[2rem] font-bold text-[var(--pt)] leading-snug">{card.pattern}</p>
              ) : (
                /* Story 앞면: Story 번호 + 제목 */
                <>
                  <p className="text-[11px] tracking-[0.2em] font-bold text-[var(--pa)] mb-2">{card.storyLabel}</p>
                  <p className="font-playfair text-[1.9rem] font-bold text-[var(--pt)] leading-tight">{card.title}</p>
                </>
              )}
              <p className="text-[12px] text-[var(--pm)] mt-4">
                {isPattern ? t('card_hint_pattern') : t('card_hint_story')}
              </p>
            </div>
          ) : isPattern ? (
            /* ── Pattern 뒷면: 예문 5개 ── */
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-playfair text-[1.3rem] font-bold text-[var(--pa)]">{card.pattern}</p>
                <button type="button" aria-label={t('listen')} onClick={speakPattern} className="shrink-0 p-2 rounded-full text-[var(--pm2)] hover:bg-[var(--pd)] hover:text-[var(--pa)] transition-colors cursor-pointer">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                {card.examples!.map((ex, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="font-playfair text-[0.95rem] font-bold text-[var(--pa)] w-4 shrink-0 pt-0.5">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[0.9rem] font-medium text-[var(--pt)] leading-relaxed">{ex.en}</p>
                      <p className="text-[0.75rem] text-[var(--pm)] mt-0.5 leading-relaxed">{ex.ko}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Story 뒷면: 짧은 요약 + 연결 패턴 ── */
            <div>
              <p className="font-playfair text-[1.4rem] font-bold text-[var(--pa)] mb-1">{card.title}</p>
              <p className="text-[0.9rem] text-[var(--pt)] leading-relaxed mb-5">{card.summary}</p>
              <p className="text-[9px] tracking-[0.2em] font-bold text-[var(--pm2)] mb-2.5">{t('linked_patterns')}</p>
              <div className="space-y-2">
                {card.linkedPatterns!.map((p, i) => (
                  <div key={i} className="flex gap-2.5 items-center">
                    <span className="font-playfair text-[0.85rem] font-bold text-[var(--pa)] w-4 shrink-0">{i + 1}</span>
                    <p className="text-[0.88rem] font-medium text-[var(--pt)]">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8">
        {!revealed ? (
          <button type="button" onClick={() => setRevealed(true)} className="w-full rounded-2xl py-4 text-[14px] font-bold tracking-[0.04em] bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> {t('reveal_btn')}
          </button>
        ) : (
          <div className="flex gap-3">
            <button type="button" onClick={() => answer(false)} className="flex-1 rounded-2xl py-4 text-[14px] font-bold bg-[var(--pc)] text-[var(--pm)] border border-[var(--pd)] hover:bg-[var(--pd)] transition-colors cursor-pointer flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> {t('dont_know')}
            </button>
            <button type="button" onClick={() => answer(true)} className="flex-1 rounded-2xl py-4 text-[14px] font-bold bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {t('got_it')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
