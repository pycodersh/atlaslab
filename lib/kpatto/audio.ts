'use client'

// episodeId 'kp-ep-001' → 'ep01'
function epCode(episodeId: string): string | null {
  const m = episodeId.match(/kp-ep-(\d+)/)
  return m ? `ep${String(parseInt(m[1], 10)).padStart(2, '0')}` : null
}

// bubbleId 'g0-b1' + episodeId 'kp-ep-001' → '/kpatto/audio/ep01/ep01-c1-b1.wav'
// gap number is 0-indexed in data but 1-indexed in filenames
export function bubbleAudioUrl(episodeId: string, bubbleId: string): string | null {
  const ep = epCode(episodeId)
  const m = bubbleId.match(/^g(\d+)-b(\d+)$/)
  if (!ep || !m) return null
  const cutNum = parseInt(m[1], 10) + 1
  return `/kpatto/audio/${ep}/${ep}-c${cutNum}-b${m[2]}.wav`
}

// patternIndex is 0-based position within the episode (p001 = index 0, p002 = index 1, ...)
export function patternAudioUrl(episodeId: string, patternIndex: number): string | null {
  const ep = epCode(episodeId)
  if (!ep) return null
  return `/kpatto/audio/${ep}/${ep}-p${String(patternIndex + 1).padStart(3, '0')}.wav`
}

// ── Playback speed ─────────────────────────────────────────────────────────────
// 학습자 요청: 대사가 빠르다 → 느린 듣기. 음원은 그대로, <audio>.playbackRate 로만 바꾼다(음높이는 브라우저가 유지).
// 고른 배속은 localStorage 에 남겨 다음 대사·다음 에피소드·새로고침 후에도 이어진다.

export const PLAYBACK_RATES = [1, 0.85, 0.75] as const
export type PlaybackRate = (typeof PLAYBACK_RATES)[number]

const RATE_KEY = 'kpatto_playback_rate'
let playbackRate: PlaybackRate | null = null

export function getPlaybackRate(): PlaybackRate {
  if (playbackRate === null) {
    let saved: number = 1
    try { saved = Number(localStorage.getItem(RATE_KEY)) } catch { /* 저장소 막힘 → 기본값 */ }
    playbackRate = (PLAYBACK_RATES as readonly number[]).includes(saved) ? (saved as PlaybackRate) : 1
  }
  return playbackRate
}

/** 지금 재생 중인 대사에도 바로 적용한다 */
export function setPlaybackRate(rate: PlaybackRate) {
  playbackRate = rate
  try { localStorage.setItem(RATE_KEY, String(rate)) } catch { /* 이 탭에서만 유지 */ }
  if (currentAudio) currentAudio.playbackRate = rate
}

// ── Singleton audio state ──────────────────────────────────────────────────────

/** Currently playing Audio element. */
let currentAudio: HTMLAudioElement | null = null

/** True while currentAudio is paused by pauseAudio() — its tryPlayAudio Promise stays pending. */
let paused = false

/**
 * Resolve callback for the currently-pending tryPlayAudio Promise.
 * Stored so that stopCurrent() can unblock a hung `await tryPlayAudio()`.
 */
let pendingResolve: ((ok: boolean) => void) | null = null

/**
 * Generation counter — incremented by every stopAllAudio() call.
 * Playback loops capture this at start and compare on each iteration;
 * a mismatch means an external stop occurred and the loop must exit.
 * This makes loop termination independent of listener registration order
 * or cleanup sequencing (the primary fix for the back-navigation bug).
 */
let generation = 0

/** Read the current generation. Export for playback loops. */
export function getAudioGeneration(): number { return generation }

/**
 * External stop listener — registered by WebtoonEpisode.
 * Called ONLY from stopAllAudio(), not from the internal stopCurrent()
 * used between consecutive tryPlayAudio() calls in the playback loop.
 * Secondary stop signal; generation is the primary path.
 */
let stopListener: (() => void) | null = null

/**
 * Register a callback that is invoked whenever stopAllAudio() is called.
 * Pass null to deregister (call on unmount).
 */
export function setAudioStopListener(fn: (() => void) | null) {
  stopListener = fn
}

/**
 * Internal: stops the current audio element and immediately resolves any
 * hanging tryPlayAudio Promise with false.
 * Does NOT increment generation or call stopListener.
 */
function stopCurrent() {
  paused = false
  if (pendingResolve) {
    const r = pendingResolve
    pendingResolve = null
    r(false)  // unblock any `await tryPlayAudio(...)` immediately
  }
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

/**
 * Stop all audio. Increments generation (primary loop-exit signal),
 * then stops current audio, then fires the stop listener (secondary signal).
 * Call for all external stops: popup open, challenge, visibilitychange, unmount.
 */
export function stopAllAudio() {
  generation++       // primary: loop exits on generation mismatch, regardless of listener
  stopCurrent()
  stopListener?.()   // secondary: also set stopRef/isPlayingRef if listener is registered
}

/**
 * Play a URL directly.
 * Returns true on successful playback, false on load error or external interrupt.
 * Stops any previously playing audio first (via internal stopCurrent, no listener call).
 */
export async function tryPlayAudio(url: string): Promise<boolean> {
  return new Promise(resolve => {
    stopCurrent()  // stops previous audio + resolves its pending Promise; no listener
    pendingResolve = resolve
    const audio = new Audio(url)
    audio.playbackRate = getPlaybackRate()
    currentAudio = audio
    const done = (result: boolean) => {
      if (pendingResolve === resolve) {
        pendingResolve = null
        currentAudio = null
      }
      resolve(result)
    }
    audio.onended = () => done(true)
    audio.onerror = () => done(false)
    audio.play().catch(() => done(false))
  })
}

/**
 * Pause the current audio where it is. The pending tryPlayAudio Promise is left open,
 * so a playback loop awaiting it simply waits until resumeAudio() or stopAllAudio().
 * Returns false when nothing is playing.
 */
export function pauseAudio(): boolean {
  if (!currentAudio || paused) return false
  currentAudio.pause()
  paused = true
  return true
}

/** Resume audio paused by pauseAudio() from the same position. Returns false when nothing is paused. */
export function resumeAudio(): boolean {
  if (!currentAudio || !paused) return false
  paused = false
  currentAudio.play().catch(() => {})
  return true
}

/** Play DB audio if URL is available. No TTS fallback. */
export async function playAudio(url: string | null): Promise<void> {
  if (!url) return
  await tryPlayAudio(url)
}
