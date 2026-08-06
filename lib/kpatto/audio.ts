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
