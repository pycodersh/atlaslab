'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, Check, X, RotateCcw, BookOpen, Layers } from 'lucide-react'

import { magazineStories } from '@/data/magazine-stories'
import type { VoiceKey } from '@/lib/settings/preferences'
import { useSpeech } from '@/hooks/useSpeech'
import {
  getDueItems,
  applyReview,
  type LearningRecord,
  type SrsItemType,
} from '@/lib/srs/storage'

type ReviewCard = {
  itemType: SrsItemType
  itemId: string
  voice?: VoiceKey
  storyLabel: string
  // pattern
  meaningKo?: string
  pattern?: string
  en: string
  ko?: string
  // story
  title?: string
  subtitleKo?: string
  note?: string
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
      cards.push({
        itemType: 'pattern',
        itemId: rec.itemId,
        voice: match.voice,
        storyLabel: `Story ${String(match.sId).padStart(2, '0')}`,
        meaningKo: match.p.meaningKo,
        pattern: match.p.pattern,
        en: match.p.storySentence,
        ko: match.p.storySentenceKo,
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
        subtitleKo: s.subtitleKo,
        note: s.storyNote,
        en: s.title,
      })
    }
  }
  return cards
}

export function ReviewSession() {
  const router = useRouter()
  const { speak, stop } = useSpeech()

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
  const card = cards && idx < total ? cards[idx] : null

  const progressPct = useMemo(
    () => (total === 0 ? 0 : Math.round((idx / total) * 100)),
    [idx, total],
  )

  function answer(isCorrect: boolean) {
    if (!card) return
    stop()
    applyReview(card.itemType, card.itemId, isCorrect)
    if (isCorrect) setCorrect((c) => c + 1)
    else setWrong((w) => w + 1)

    if (idx + 1 >= total) setDone(true)
    else { setIdx((i) => i + 1); setRevealed(false) }
  }

  function handleSpeak() {
    if (!card) return
    speak(card.en, undefined, card.voice)
  }

  // ── 로딩 ──
  if (cards === null) {
    return <div className="min-h-dvh bg-[var(--pb)] flex items-center justify-center text-[var(--pm)] text-sm">불러오는 중…</div>
  }

  // ── 복습할 항목 없음 ──
  if (total === 0) {
    return (
      <div className="min-h-dvh bg-[var(--pb)] flex flex-col items-center justify-center px-8 text-center">
        <Check className="w-10 h-10 text-[var(--pa)] mb-4" strokeWidth={1.6} />
        <p className="font-playfair text-[1.4rem] font-bold text-[var(--pt)] mb-2">복습할 항목이 없어요</p>
        <p className="text-[13px] text-[var(--pm)] leading-relaxed mb-7">
          오늘 예정된 복습이 없습니다.<br />새로운 스토리로 학습을 이어가보세요.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/stories/1')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer">새 스토리 학습</button>
          <button type="button" onClick={() => router.push('/records')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pc)] text-[var(--pt)] hover:opacity-80 transition-opacity cursor-pointer">Progress</button>
        </div>
      </div>
    )
  }

  // ── 완료 요약 ──
  if (done) {
    return (
      <div className="min-h-dvh bg-[var(--pb)] flex flex-col items-center justify-center px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--pa)] flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <p className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] mb-1">복습 완료!</p>
        <p className="text-[13px] text-[var(--pm)] mb-6">{total}개 항목을 복습했어요.</p>
        <div className="flex gap-6 mb-8">
          <div className="text-center">
            <p className="font-playfair text-[1.8rem] font-bold text-[var(--pa)] leading-none">{correct}</p>
            <p className="text-[11px] text-[var(--pm)] mt-1.5">알겠어요</p>
          </div>
          <div className="text-center">
            <p className="font-playfair text-[1.8rem] font-bold text-[var(--pm2)] leading-none">{wrong}</p>
            <p className="text-[11px] text-[var(--pm)] mt-1.5">다시 볼게요</p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--pm)] mb-7 leading-relaxed">
          맞춘 항목은 더 긴 간격으로,<br />틀린 항목은 내일 다시 복습해요.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/records')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer">Progress 보기</button>
          <button type="button" onClick={() => router.push('/home')} className="rounded-full px-6 py-2.5 text-[12px] font-bold bg-[var(--pc)] text-[var(--pt)] hover:opacity-80 transition-opacity cursor-pointer">Home</button>
        </div>
      </div>
    )
  }

  if (!card) return null
  const isPattern = card.itemType === 'pattern'

  // ── 카드 진행 화면 ──
  return (
    <div className="min-h-dvh bg-[var(--pb)] flex flex-col">
      {/* 상단 진행 바 */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between mb-2">
          <button type="button" aria-label="나가기" onClick={() => { stop(); router.push('/records') }} className="text-[var(--pm)] hover:text-[var(--pa)] transition-colors cursor-pointer p-1 -ml-1">
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
          <span className="text-[11px] font-semibold text-[var(--pm)]">{idx + 1} / {total}</span>
          <span className="text-[9px] tracking-[0.2em] text-[var(--pa)] font-bold">REVIEW</span>
        </div>
        <div className="h-1 bg-[var(--pd)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--pa)] rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* 카드 */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-4">
        <div className="rounded-3xl border border-[var(--pd)] bg-[var(--pc)] px-6 py-10 min-h-[300px] flex flex-col items-center justify-center text-center shadow-sm">
          <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.15em] font-bold text-[var(--pm)] mb-5">
            {isPattern ? <Layers className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {card.storyLabel} · {isPattern ? 'PATTERN' : 'STORY'}
          </span>

          {!revealed ? (
            /* 앞면 — 떠올리기 */
            <>
              <p className="font-playfair text-[1.7rem] font-bold text-[var(--pt)] leading-snug mb-3">
                {isPattern ? card.meaningKo : card.subtitleKo}
              </p>
              <p className="text-[12px] text-[var(--pm)]">
                {isPattern ? '이 뜻의 영어 패턴을 떠올려보세요.' : '이 스토리의 내용을 떠올려보세요.'}
              </p>
            </>
          ) : (
            /* 뒷면 — 정답 */
            <>
              <p className="font-playfair text-[1.6rem] font-bold text-[var(--pa)] leading-snug mb-2">
                {isPattern ? card.pattern : card.title}
              </p>
              {isPattern && <p className="text-[12px] text-[var(--pm)] mb-4">{card.meaningKo}</p>}
              <div className="h-px w-12 bg-[var(--pd)] my-3" />
              <div className="flex items-center gap-2 justify-center">
                <p className="text-[0.95rem] font-medium text-[var(--pt)] leading-relaxed">{card.en}</p>
                <button type="button" aria-label="듣기" onClick={handleSpeak} className="shrink-0 p-1.5 rounded-full text-[var(--pm2)] hover:bg-[var(--pd)] hover:text-[var(--pa)] transition-colors cursor-pointer">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {(card.ko || card.note) && <p className="text-[0.78rem] text-[var(--pm)] mt-1.5 leading-relaxed">{isPattern ? card.ko : card.note}</p>}
            </>
          )}
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="px-6 pb-8">
        {!revealed ? (
          <button type="button" onClick={() => { setRevealed(true); }} className="w-full rounded-2xl py-4 text-[14px] font-bold tracking-[0.04em] bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> 정답 확인
          </button>
        ) : (
          <div className="flex gap-3">
            <button type="button" onClick={() => answer(false)} className="flex-1 rounded-2xl py-4 text-[14px] font-bold bg-[var(--pc)] text-[var(--pm)] border border-[var(--pd)] hover:bg-[var(--pd)] transition-colors cursor-pointer flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> 모르겠어
            </button>
            <button type="button" onClick={() => answer(true)} className="flex-1 rounded-2xl py-4 text-[14px] font-bold bg-[var(--pa)] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> 알겠어
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
