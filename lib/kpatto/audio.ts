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

// ── Singleton audio state ──────────────────────────────────────────────────────

/** Currently playing Audio element. */
let currentAudio: HTMLAudioElement | null = null

/**
 * Resolve callback for the currently-pending tryPlayAudio Promise.
 * Stored so that stopCurrent() can unblock a hung `await tryPlayAudio()`.
 */
let pendingResolve: ((ok: boolean) => void) | null = null

/**
 * External stop listener — registered by WebtoonEpisode.
 * Called ONLY from stopAllAudio(), not from the internal stopCurrent()
 * used between consecutive tryPlayAudio() calls in the playback loop.
 */
let stopListener: (() => void) | null = null

/**
 * Register a callback that is invoked whenever stopAllAudio() is called.
 * WebtoonEpisode uses this to set stopRef.current = true and break its loop.
 * Pass null to deregister (call on unmount).
 */
export function setAudioStopListener(fn: (() => void) | null) {
  stopListener = fn
}

/**
 * Internal: stops the current audio element and immediately resolves any
 * hanging tryPlayAudio Promise with false.
 * Does NOT call stopListener — that is stopAllAudio()'s responsibility.
 */
function stopCurrent() {
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
 * Stop all audio and notify WebtoonEpisode's playback loop to stop.
 * Call this for all external stops: popup open, challenge interaction,
 * visibilitychange, episode change, unmount.
 */
export function stopAllAudio() {
  stopCurrent()
  stopListener?.()
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

/** Play DB audio if URL is available. No TTS fallback. */
export async function playAudio(url: string | null): Promise<void> {
  if (!url) return
  await tryPlayAudio(url)
}
