'use client'

/**
 * Basics 본문 예문 재생 버튼 — RuleExample 오른쪽 28px 동그라미.
 *
 * 음성은 scripts/generate-basics-lines.py 가 만든 문장별 파일(remotion/KoreanBasic/line-audio.generated.json)을 문장으로 찾는다.
 * 파일이 없는 문장은 버튼을 그리지 않는다(새로 만들지 않는다). 한 번에 하나만 — 다른 버튼을 누르면 앞의 것이 멈춘다.
 * 재생 중에는 ▶ 대신 작은 이퀄라이저, 테두리 #C8102E.
 */
import { useEffect, useState } from 'react'
import lineAudio from '@/remotion/KoreanBasic/line-audio.generated.json'

const norm = (s: string) => s.replace(/[\s.,?!~…·]/g, '')

/** 문장 → 파일. 장면 대사(scene-*)는 빼고 예문(ex-*)만 */
const BY_TEXT: Record<string, string> = {}
for (const lines of Object.values(lineAudio as Record<string, Record<string, { ko: string; src: string }>>)) {
  for (const [id, l] of Object.entries(lines)) if (id.startsWith('ex-')) BY_TEXT[norm(l.ko)] ??= `/${l.src}`
}

/** 페이지 전체에서 하나만 울리도록 지금 재생 중인 것을 모듈에 둔다 */
let current: { audio: HTMLAudioElement; stop: () => void } | null = null

export function ExamplePlay({ ko }: { ko: string }) {
  const src = BY_TEXT[norm(ko)]
  const [playing, setPlaying] = useState(false)
  const [mine, setMine] = useState<HTMLAudioElement | null>(null)

  // 페이지를 떠나며 버튼이 사라지면 그 소리도 멈춘다
  useEffect(() => () => { if (mine && current?.audio === mine) current.stop() }, [mine])

  if (!src) return null

  const toggle = () => {
    if (playing && current) { current.stop(); return }
    current?.stop()
    const audio = new Audio(src)
    const stop = () => {
      audio.pause()
      audio.currentTime = 0
      setPlaying(false)
      if (current?.audio === audio) current = null
    }
    audio.addEventListener('ended', stop)
    audio.addEventListener('error', stop)
    current = { audio, stop }
    setMine(audio)
    setPlaying(true)
    audio.play().catch(stop)
  }

  return (
    <button type="button" className={`gcc__play${playing ? ' is-playing' : ''}`} aria-label={`Play: ${ko}`} aria-pressed={playing} onClick={toggle}>
      {playing ? (
        <span className="gcc__eq" aria-hidden="true"><i /><i /><i /></span>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3.5 2.2 L9.6 6 L3.5 9.8 Z" fill="none" stroke="#111111" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
