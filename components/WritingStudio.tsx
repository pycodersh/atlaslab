'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { getMissionItems } from '@/lib/srs/engine'
import { magazineStories } from '@/data/magazine-stories'
import type { MagazinePattern } from '@/types/magazine'

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'free' | 'translation'

interface Feedback {
  type:    'fix' | 'good' | 'pattern'
  wrong:   string | null
  correct: string | null
  text:    string
}

interface WritingRecord {
  id:         string
  mode:       Mode
  original:   string
  feedbacks:  Feedback[]
  pattern:    string
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

/** Today's first incomplete story's patterns */
function getTodayPatterns(): MagazinePattern[] {
  const items = getMissionItems()
  const todayItem = items.find(i => !i.done) ?? items[0]
  if (!todayItem) return []
  const story = magazineStories.find(s => s.id === todayItem.storyId)
  return story?.patterns ?? []
}

// ── Feedback dot colors ───────────────────────────────────────────────────────

const DOT_FIX     = '#5C6BC0'
const DOT_GOOD    = '#4CAF90'
const BG_FIX      = 'rgba(92,107,192,0.07)'
const BG_GOOD     = 'rgba(76,175,144,0.07)'

// ── Highlight wrong text inline ───────────────────────────────────────────────

function HighlightedText({ text, wrong }: { text: string; wrong: string | null }) {
  if (!wrong) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(wrong.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark style={{ color: '#5C6BC0', background: 'rgba(92,107,192,0.08)', borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + wrong.length)}
      </mark>
      {text.slice(idx + wrong.length)}
    </span>
  )
}

// ── Single feedback item ──────────────────────────────────────────────────────

function FeedbackItem({ fb }: { fb: Feedback }) {
  const isFix = fb.type === 'fix'
  return (
    <div style={{
      background: isFix ? BG_FIX : BG_GOOD,
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 8,
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isFix ? DOT_FIX : DOT_GOOD,
        flexShrink: 0, marginTop: 5,
      }} />
      <div style={{ fontSize: 13, color: '#2a2a3e', lineHeight: 1.6 }}>
        {isFix && fb.wrong && fb.correct ? (
          <>
            <span style={{ color: '#5C6BC0', fontWeight: 600 }}>
              "{fb.wrong}" → "{fb.correct}"
            </span>
            {fb.text && <span>: {fb.text}</span>}
          </>
        ) : (
          <HighlightedText text={fb.text} wrong={fb.wrong} />
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function WritingStudio() {
  const trainer = useTrainerSafe()

  const [mode, setMode]           = useState<Mode>('free')
  const [text, setText]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [feedbacks, setFeedbacks] = useState<Feedback[] | null>(null)
  const [isValid, setIsValid]     = useState(true)
  const [invalidReason, setInvalidReason] = useState<string | null>(null)
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState(3)
  const [plan, setPlan]           = useState<'free' | 'premium'>('free')
  const [records, setRecords]     = useState<WritingRecord[]>([])
  const [patterns, setPatterns]   = useState<MagazinePattern[]>([])
  const [loadingInfo, setLoadingInfo] = useState(true)

  const hasEnteredRef = useRef(false)

  // ── On mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setPatterns(getTodayPatterns())

    // Fetch remaining count & records
    fetch('/patto/api/writing')
      .then(r => r.json())
      .then(data => {
        const rem = data.remaining ?? null
        setRemaining(rem)
        setDailyLimit(data.limit ?? 3)
        setPlan(data.plan ?? 'free')
        setRecords(data.records ?? [])
        if (rem !== null) sessionStorage.setItem('ws-remaining', String(rem))
      })
      .catch(() => {})
      .finally(() => setLoadingInfo(false))

    // Orb whisper on entry
    const isFirstVisit = !sessionStorage.getItem('ws-visited')
    if (isFirstVisit) {
      sessionStorage.setItem('ws-visited', '1')
      setTimeout(() => trainer?.say('오늘 배운 패턴으로 문장 써볼까요?', 3000), 800)
    } else {
      setTimeout(() => trainer?.say('오늘도 글쓰기 연습해봐요!', 2500), 800)
    }
    hasEnteredRef.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mode switch resets input/result ─────────────────────────────────────────
  function switchMode(m: Mode) {
    if (m === mode) return
    setMode(m)
    setText('')
    setFeedbacks(null)
    setErrorMsg(null)
  }

  // ── Today's pattern (first one) ──────────────────────────────────────────────
  const todayPattern  = patterns[0]
  const patternStr    = todayPattern?.pattern ?? ''
  const koSentence    = todayPattern?.storySentenceKo ?? ''
  const enSentence    = todayPattern?.storySentence ?? ''

  const wc             = countWords(text)
  const canSubmit      = wc >= 5 && wc <= 50 && !loading && (remaining === null || remaining > 0)
  const limitReached   = remaining !== null && remaining <= 0

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)
    setFeedbacks(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/patto/api/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, todayPattern: patternStr, mode }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'too_short') { setErrorMsg(data.message); return }
        if (data.error === 'rate_limited') {
          setRemaining(0)
          if (plan === 'premium') trainer?.say('오늘 첨삭을 모두 사용했어요. 내일 다시 만나요!', 3000)
          else trainer?.say('오늘 첨삭을 모두 사용했어요. 내일 또 만나요!', 3000)
          return
        }
        setErrorMsg('오류가 발생했어요. 다시 시도해주세요.')
        return
      }

      setIsValid(data.isValid ?? true)
      setInvalidReason(data.invalidReason ?? null)
      setFeedbacks(data.feedbacks ?? [])
      const newRem = data.remaining ?? null
      setRemaining(newRem)
      if (newRem !== null) sessionStorage.setItem('ws-remaining', String(newRem))

      // Add to records
      setRecords(prev => [{
        id: Date.now().toString(),
        mode,
        original: text,
        feedbacks: data.feedbacks ?? [],
        pattern: patternStr,
        created_at: new Date().toISOString(),
      }, ...prev].slice(0, 10))

      // Orb whisper based on result
      const hasErrors = (data.feedbacks ?? []).some((f: Feedback) => f.type === 'fix')
      setTimeout(() => {
        if (hasErrors) trainer?.say('조금씩 나아지고 있어요. 다시 써볼까요?', 3000)
        else trainer?.say('패턴을 완벽하게 활용하셨어요! 👏', 3000)
      }, 400)
    } catch {
      setErrorMsg('네트워크 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }, [canSubmit, text, patternStr, mode, plan, trainer])

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardBg: React.CSSProperties = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 16,
  }

  // ── Limit reached messages ───────────────────────────────────────────────────
  const limitMsg = plan === 'premium'
    ? '오늘 첨삭을 모두 사용했어요. 내일 다시 만나요!'
    : '오늘 첨삭을 모두 사용했어요. 업그레이드하면 하루 10회 사용할 수 있어요.'

  const remainingStr = remaining === null
    ? ''
    : `오늘 ${remaining}회 남음`

  return (
    <div>
      {/* ── Header card ─────────────────────────────────────────────────── */}
      <div style={cardBg}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>✏️</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Writing Studio</span>
          </div>
          {!loadingInfo && remaining !== null && (
            <span style={{ fontSize: 12, color: limitReached ? '#e57373' : '#5C6BC0', fontWeight: 600 }}>
              {remainingStr}
            </span>
          )}
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#5a5a7a', lineHeight: 1.5 }}>
          패턴으로 문장을 써보세요. AI가 즉시 첨삭해드려요.
        </p>

        {/* ── Mode tabs ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(['free', 'translation'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                background: mode === m ? '#5C6BC0' : 'rgba(92,107,192,0.10)',
                color: mode === m ? '#fff' : '#5a5a7a',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {m === 'free' ? '자유 작성' : '한글 보고 쓰기'}
            </button>
          ))}
        </div>

        {/* ── Mode: 자유 작성 ────────────────────────────────────────────── */}
        {mode === 'free' && (
          <>
            {/* Today's pattern chips */}
            {patterns.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#8a8aaa', alignSelf: 'center' }}>오늘 패턴:</span>
                {patterns.map(p => (
                  <span key={p.id} style={{
                    fontSize: 11, fontWeight: 600, color: '#5C6BC0',
                    background: 'rgba(92,107,192,0.08)', borderRadius: 999,
                    padding: '2px 9px', border: '0.5px solid rgba(92,107,192,0.18)',
                  }}>
                    {p.pattern}
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setErrorMsg(null) }}
              disabled={limitReached}
              placeholder="오늘 배운 패턴으로 자유롭게 써보세요."
              style={{
                width: '100%', minHeight: 72, resize: 'vertical',
                border: '1px solid rgba(92,107,192,0.2)', borderRadius: 12,
                padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
                lineHeight: 1.6, color: '#1a1a2e', background: 'rgba(255,255,255,0.8)',
                outline: 'none', boxSizing: 'border-box',
                opacity: limitReached ? 0.5 : 1,
              }}
            />
          </>
        )}

        {/* ── Mode: 한글 보고 쓰기 ──────────────────────────────────────── */}
        {mode === 'translation' && (
          <>
            {/* Korean sentence card */}
            <div style={{
              background: '#EEF1FF', borderRadius: 12, padding: '12px 14px', marginBottom: 10,
            }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#5C6BC0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                한글 문장
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                {koSentence || '오늘 학습 스토리의 예문을 불러오는 중...'}
              </p>
              {patternStr && (
                <p style={{ margin: 0, fontSize: 12, color: '#5C6BC0' }}>
                  힌트: <span style={{ fontWeight: 600 }}>{patternStr}</span>
                </p>
              )}
            </div>

            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setErrorMsg(null) }}
              disabled={limitReached}
              placeholder="위 문장을 영어로 써보세요."
              style={{
                width: '100%', minHeight: 72, resize: 'vertical',
                border: '1px solid rgba(92,107,192,0.2)', borderRadius: 12,
                padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
                lineHeight: 1.6, color: '#1a1a2e', background: 'rgba(255,255,255,0.8)',
                outline: 'none', boxSizing: 'border-box',
                opacity: limitReached ? 0.5 : 1,
              }}
            />
          </>
        )}

        {/* ── Bottom row: word count + send ────────────────────────────── */}
        {!limitReached && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: wc > 50 ? '#e57373' : '#8a8aaa' }}>
              {wc} / 50 단어
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                background: canSubmit ? '#5C6BC0' : 'rgba(92,107,192,0.2)',
                color: canSubmit ? '#fff' : '#9a9ab8',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {loading ? '분석 중...' : '첨삭 받기'}
            </button>
          </div>
        )}

        {/* ── Limit reached message ──────────────────────────────────────── */}
        {limitReached && (
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#e57373', lineHeight: 1.5, textAlign: 'center' }}>
            {limitMsg}
          </p>
        )}

        {/* ── Error message ─────────────────────────────────────────────── */}
        {errorMsg && (
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#e57373' }}>{errorMsg}</p>
        )}

        {/* ── Feedback result ───────────────────────────────────────────── */}
        {feedbacks !== null && (
          <div style={{ marginTop: 14 }}>
            <div style={{ height: '0.5px', background: 'rgba(92,107,192,0.12)', marginBottom: 12 }} />

            {!isValid ? (
              <p style={{ fontSize: 13, color: '#e57373', margin: 0 }}>
                {invalidReason ?? '유효하지 않은 입력이에요. 영어로 문장을 작성해주세요.'}
              </p>
            ) : feedbacks.length === 0 ? (
              <p style={{ fontSize: 13, color: '#4CAF90', fontWeight: 600, margin: 0 }}>
                완벽해요! 오류가 없네요. 👏
              </p>
            ) : (
              feedbacks.map((fb, i) => <FeedbackItem key={i} fb={fb} />)
            )}

            {/* Translation mode: model answer */}
            {mode === 'translation' && enSentence && isValid && (
              <div style={{
                background: '#f5f9f5', borderRadius: 10, padding: '10px 12px', marginTop: 10,
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#4CAF50', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  모범 답안
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#1a1a2e', lineHeight: 1.6 }}>
                  {enSentence}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── History ──────────────────────────────────────────────────────── */}
      {records.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em',
            color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase',
          }}>
            이전 기록
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {records.map((rec, i) => {
              const fixCount  = rec.feedbacks.filter(f => f.type === 'fix').length
              const goodCount = rec.feedbacks.filter(f => f.type !== 'fix').length
              return (
                <div key={rec.id} style={{
                  padding: '12px 14px',
                  borderTop: i > 0 ? '0.5px solid rgba(92,107,192,0.10)' : 'none',
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 13, color: '#1a1a2e', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {rec.original}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {fixCount > 0 && (
                      <span style={{ fontSize: 11, color: '#5C6BC0', background: BG_FIX, borderRadius: 999, padding: '2px 7px' }}>
                        수정 {fixCount}건
                      </span>
                    )}
                    {goodCount > 0 && (
                      <span style={{ fontSize: 11, color: '#4CAF90', background: BG_GOOD, borderRadius: 999, padding: '2px 7px' }}>
                        칭찬 {goodCount}건
                      </span>
                    )}
                    {fixCount === 0 && goodCount === 0 && (
                      <span style={{ fontSize: 11, color: '#8a8aaa' }}>오류 없음</span>
                    )}
                    <span style={{ fontSize: 11, color: '#aaa' }}>·</span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{rec.mode === 'translation' ? '한글 보고 쓰기' : '자유 작성'}</span>
                    {rec.pattern && (
                      <>
                        <span style={{ fontSize: 11, color: '#aaa' }}>·</span>
                        <span style={{ fontSize: 11, color: '#8090c0', fontWeight: 600 }}>{rec.pattern}</span>
                      </>
                    )}
                    <span style={{ fontSize: 11, color: '#ccc', marginLeft: 'auto' }}>{fmtDate(rec.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
