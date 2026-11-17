'use client'

/**
 * Basics 글 상단 쇼트 — 본문 맨 위에서 <KoreanBasicVideo slug="..." /> 로 부른다('너 vs 당신' 글은 <DangerPronounsVideo />).
 *
 * 영상은 remotion/KoreanBasic/TemplateVideo 에 videos.json 의 해당 slug 문구를 넣어 브라우저에서 그대로 재생한다(MP4 를 따로 올리지 않는다).
 * 보이스오버가 있어 브라우저 자동 재생 정책상 음소거로 시작한다.
 *
 * Sound 안내(v2 글만 — 시범 스위치): 음소거일 때만 영상 우측 상단 안쪽에 작은 알약 버튼을 띄운다.
 *   - 영상 시작 0.5초 뒤 페이드인. 대사가 나오는 구간(speech.generated.json + 상황극 대사 길이)에만 이퀄라이저 막대가 움직인다
 *   - 누르면 음소거 해제 + 처음부터 다시 재생(첫 대사를 놓치지 않게), 200ms 페이드아웃 후 다시 나오지 않는다
 *   - prefers-reduced-motion 이면 막대는 멈춘 채로 둔다. 컨트롤 바에는 아무것도 더하지 않는다
 * 없는 slug 면 아무것도 그리지 않는다 — 본문이 영상 하나 때문에 깨지지 않게.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { TemplateVideo, BASICS_VIDEO, videoLayout, type BasicsVideoData } from '@/remotion/KoreanBasic/TemplateVideo'
import { OPENING } from '@/remotion/KoreanBasic/TemplateVideoV2'
import { BASICS_VIDEOS } from '@/remotion/KoreanBasic/videos'
import speechRaw from '@/remotion/KoreanBasic/speech.generated.json'
import lineAudio from '@/remotion/KoreanBasic/line-audio.generated.json'

const SPEECH = speechRaw as unknown as Record<string, [number, number][]>
const LINES = lineAudio as Record<string, Record<string, { src: string; dur: number }>>

/** 말소리가 나는 구간(프레임) — 메인 트랙 구간을 오프닝 길이만큼 밀고, 오프닝 대사 두 줄을 더한다 */
function speechFrames(slug: string, data: BasicsVideoData): [number, number][] {
  const fps = BASICS_VIDEO.fps
  const { offset } = videoLayout(data)
  const out: [number, number][] = (SPEECH[slug] ?? []).map(([a, b]) => [offset + Math.round(a * fps), offset + Math.round(b * fps)])
  if (data.v2 && data.scene) {
    const dur = (src: string) => Object.values(LINES[slug] ?? {}).find(l => l.src === src)?.dur ?? 1.5
    const w = OPENING.wrong + OPENING.voiceLead
    const c = OPENING.correct + OPENING.voiceLead
    out.push([w, w + Math.round(dur(data.scene.wrong.audio) * fps)], [c, c + Math.round(dur(data.scene.correct.audio) * fps)])
  }
  return out
}

export function KoreanBasicPlayer({ slug }: { slug: string }) {
  const data = BASICS_VIDEOS[slug]
  const ref = useRef<PlayerRef>(null)
  const [muted, setMuted] = useState(true)
  const [shown, setShown] = useState(false) // 0.5초 뒤 페이드인
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const [talking, setTalking] = useState(false)
  const ranges = useMemo(() => (data ? speechFrames(slug, data) : []), [slug, data])
  const pill = !!data?.v2

  useEffect(() => {
    if (!pill) return
    const t = setTimeout(() => setShown(true), 500)
    return () => clearTimeout(t)
  }, [pill])

  useEffect(() => {
    const p = ref.current
    if (!p || !pill) return
    // 컨트롤 바로 소리를 켠 경우도 한 번 켜면 안내는 다시 나오지 않는다
    const onMute = (e: { detail: { isMuted: boolean } }) => {
      setMuted(e.detail.isMuted)
      if (!e.detail.isMuted) setGone(true)
    }
    const onFrame = (e: { detail: { frame: number } }) => {
      const f = e.detail.frame
      const on = ranges.some(([a, b]) => f >= a && f < b)
      setTalking(prev => (prev === on ? prev : on))
    }
    p.addEventListener('mutechange', onMute)
    p.addEventListener('frameupdate', onFrame)
    return () => {
      p.removeEventListener('mutechange', onMute)
      p.removeEventListener('frameupdate', onFrame)
    }
  }, [pill, ranges])

  if (!data) return null

  const turnOn = () => {
    const p = ref.current
    if (!p) return
    p.unmute()
    p.seekTo(0)
    p.play()
    setLeaving(true)
    setTimeout(() => setGone(true), 200)
  }

  return (
    <div
      translate="no"
      className="kb-player"
      style={{ position: 'relative', margin: '0 0 2rem', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E1DC', background: data.v2 ? '#F7F5F2' : '#FAF8F5' }}
    >
      <Player
        ref={ref}
        component={TemplateVideo}
        inputProps={{ data }}
        compositionWidth={BASICS_VIDEO.width}
        compositionHeight={BASICS_VIDEO.height}
        durationInFrames={videoLayout(data).total}
        fps={BASICS_VIDEO.fps}
        style={{ width: '100%', aspectRatio: '16 / 9' }}
        initiallyMuted
        autoPlay
        loop
        controls
        clickToPlay
      />
      {pill && muted && !gone && (
        <button
          type="button"
          aria-label="Turn on sound"
          onClick={turnOn}
          className={`kb-sound${shown && !leaving ? ' is-in' : ''}${talking ? ' is-talking' : ''}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
            <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
          </svg>
          <span className="kb-eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Sound</span>
        </button>
      )}
      <style>{`
        .kb-sound {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          height: 28px; padding: 0 11px 0 9px; display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid #E5E1DC; border-radius: 999px; background: rgba(255,255,255,0.85);
          -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); box-shadow: none;
          font-family: 'DM Sans', system-ui, sans-serif; font-size: 12px; font-weight: 500; line-height: 1; color: #111111;
          cursor: pointer; opacity: 0; transition: opacity 200ms ease;
        }
        .kb-sound.is-in { opacity: 1; }
        .kb-sound:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .kb-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 10px; }
        .kb-eq i { display: block; width: 2px; height: 4px; border-radius: 1px; background: #111111; transform-origin: bottom; }
        .kb-sound.is-talking .kb-eq i { animation: kb-eq 0.9s ease-in-out infinite; }
        .kb-sound.is-talking .kb-eq i:nth-child(2) { animation-delay: -0.3s; }
        .kb-sound.is-talking .kb-eq i:nth-child(3) { animation-delay: -0.6s; }
        @keyframes kb-eq { 0%, 100% { height: 3px; } 50% { height: 10px; } }
        @media (prefers-reduced-motion: reduce) { .kb-sound .kb-eq i { animation: none !important; } }
      `}</style>
    </div>
  )
}

/** 이미 DB 본문에 들어간 <DangerPronounsVideo /> 태그용 */
export function DangerPronounsPlayer() {
  return <KoreanBasicPlayer slug="korean-never-say-dangsin-neo" />
}
