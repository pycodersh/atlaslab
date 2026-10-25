'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Square } from 'lucide-react'

type Example = { ko: string; en: string; hl: string; src: string }

type Props = {
  no: number
  total: number
  pattern: string
  english: string
  examples: Example[]
  prevHref: string | null
  nextHref: string | null
}

// 책(PDF)과 같은 색 — 앱 주황(KP.primary)이 아니라 사이트·책의 레드
const INK = '#121212'
const MUTED = '#6B6B6B'
const RULE = '#E5E1DC'
const RED = '#C8102E'
const RED_DARK = '#A30D25'
const SAND = '#FBF8F3'
const KO_FONT = '"Pretendard Variable", Pretendard, "DM Sans", system-ui, sans-serif'
const BODY_FONT = '"DM Sans", "Pretendard Variable", Pretendard, system-ui, sans-serif'

/** 예문 사이 쉼 — 따라 말할 틈 */
const GAP_MS = 700

/** 책과 같은 강조: hl 을 | 로 나눠 앞에서부터 차례로 빨갛게 */
function Highlighted({ ko, hl }: { ko: string; hl: string }) {
  const out: React.ReactNode[] = []
  let pos = 0
  hl.split('|').forEach((part, k) => {
    const i = ko.indexOf(part, pos)
    if (i < 0) return
    out.push(ko.slice(pos, i), <b key={k} style={{ color: RED, fontWeight: 800 }}>{part}</b>)
    pos = i + part.length
  })
  out.push(ko.slice(pos))
  return <>{out}</>
}

export function PatternPlayer({ no, total, pattern, english, examples, prevHref, nextHref }: Props) {
  const num = String(no).padStart(3, '0')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 'all' 이면 끝날 때 다음 예문으로 넘어간다 — onended 안에서 최신 값을 읽도록 ref
  const modeRef = useRef<'all' | 'one' | null>(null)
  const indexRef = useRef<number | null>(null)
  const playAtRef = useRef<(i: number, m: 'all' | 'one') => void>(() => {})
  const [current, setCurrent] = useState<number | null>(null)
  const [mode, setMode] = useState<'all' | 'one' | null>(null)
  const [blocked, setBlocked] = useState(false)

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    audioRef.current?.pause()
    modeRef.current = null
    setMode(null)
    setCurrent(null)
  }, [])

  const playAt = useCallback((i: number, m: 'all' | 'one') => {
    const a = audioRef.current
    if (!a) return
    if (timerRef.current) clearTimeout(timerRef.current)
    a.pause()
    a.src = examples[i].src
    modeRef.current = m
    indexRef.current = i
    setMode(m)
    setCurrent(i)
    a.play().then(
      () => { setBlocked(false) },
      (err: unknown) => {
        stop()
        // 브라우저가 소리 있는 자동 재생을 막으면 NotAllowedError — 버튼을 누르게 안내
        if (err instanceof DOMException && err.name === 'NotAllowedError') setBlocked(true)
      },
    )
  }, [examples, stop])

  useEffect(() => { playAtRef.current = playAt }, [playAt])

  // iOS 는 사용자 탭으로 한 번 풀린 같은 audio 요소라야 이어서 재생해 준다 — 요소 하나를 계속 쓴다.
  // 책에서 LISTEN 을 누르고 들어오면 바로 3개를 이어서 들려준다(막히면 버튼 안내).
  useEffect(() => {
    const a = new Audio()
    audioRef.current = a
    a.onended = () => {
      const i = indexRef.current
      if (modeRef.current === 'all' && i !== null && i < examples.length - 1) {
        timerRef.current = setTimeout(() => playAtRef.current(i + 1, 'all'), GAP_MS)
      } else {
        stop()
      }
    }
    a.onerror = stop
    playAtRef.current(0, 'all')
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      a.pause()
      a.removeAttribute('src')
    }
  }, [examples.length, stop])

  const allOn = mode === 'all'

  return (
    <main style={{ minHeight: '100dvh', background: '#fff', color: INK, fontFamily: BODY_FONT }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 40px' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: 14, borderBottom: `1px solid ${RULE}`,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          <Link href="/kpatto" style={{ color: INK, textDecoration: 'none', letterSpacing: '0.28em' }}>K-PATTO</Link>
          <span style={{ color: MUTED }}>Audio · {num} / {total}</span>
        </header>

        <section style={{ borderTop: `3px solid ${RED}`, marginTop: 22, paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: RED }}>
            Pattern #{num}
          </div>
          <h1 style={{
            fontFamily: KO_FONT, fontWeight: 800, fontSize: 34, lineHeight: 1.15,
            letterSpacing: '-0.02em', margin: '6px 0 4px', wordBreak: 'keep-all',
          }}>
            {pattern}
          </h1>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#4A3F37', margin: 0 }}>{english}</p>
        </section>

        <button
          type="button"
          onClick={() => (allOn ? stop() : playAt(0, 'all'))}
          style={{
            width: '100%', height: 52, marginTop: 22, borderRadius: 999, border: 'none',
            background: allOn ? RED_DARK : RED, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: BODY_FONT, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em',
            boxShadow: allOn ? '0 0 0 5px rgba(200,16,46,0.16)' : 'none',
            transition: 'background 0.15s, box-shadow 0.15s', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {allOn
            ? <><Square size={14} fill="currentColor" /> Playing {(current ?? 0) + 1} of {examples.length} · Stop</>
            : <><Play size={16} fill="currentColor" /> Play all {examples.length}</>}
        </button>
        {blocked && (
          <p role="status" style={{ fontSize: 13, color: MUTED, textAlign: 'center', margin: '10px 0 0' }}>
            Your browser paused autoplay — tap <b style={{ color: INK }}>Play all</b> to listen.
          </p>
        )}

        <ol style={{ listStyle: 'none', margin: '22px 0 0', padding: 0, borderTop: `1px solid ${RULE}` }}>
          {examples.map((e, i) => {
            const on = current === i
            return (
              <li key={i} style={{ borderBottom: `1px solid ${RULE}`, background: on ? SAND : 'transparent', transition: 'background 0.15s' }}>
                <button
                  type="button"
                  onClick={() => (on ? stop() : playAt(i, 'one'))}
                  aria-label={on ? `Stop: ${e.ko}` : `Play: ${e.ko}`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    background: 'transparent', border: 'none', padding: '16px 8px', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', color: INK, WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: on ? RED_DARK : '#fff', color: on ? '#fff' : RED,
                    border: `1.5px solid ${on ? RED_DARK : RED}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s, color 0.15s',
                  }}>
                    {on ? <Square size={12} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />}
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: KO_FONT, fontSize: 19, fontWeight: 700, lineHeight: 1.35, wordBreak: 'keep-all' }}>
                      <Highlighted ko={e.ko} hl={e.hl} />
                    </span>
                    <span style={{ display: 'block', fontSize: 14, color: MUTED, marginTop: 3 }}>{e.en}</span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#B5ADA4', flexShrink: 0 }}>{i + 1}</span>
                </button>
              </li>
            )
          })}
        </ol>

        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '18px 2px 0' }}>
          Pause after each line and say it out loud — copy the rhythm, not just the words.
        </p>

        <nav style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 28 }}>
          {[{ href: prevHref, label: `#${String(no - 1).padStart(3, '0')}`, prev: true },
            { href: nextHref, label: `#${String(no + 1).padStart(3, '0')}`, prev: false }].map(({ href, label, prev }) =>
            href ? (
              <Link key={label} href={href} style={{
                flex: 1, height: 44, borderRadius: 999, border: `1px solid ${RULE}`, color: INK,
                textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                {prev && <ChevronLeft size={16} />}{label}{!prev && <ChevronRight size={16} />}
              </Link>
            ) : <span key={label} style={{ flex: 1 }} />,
          )}
        </nav>
      </div>
    </main>
  )
}
