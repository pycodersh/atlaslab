import { BrowserTTSProvider } from './browser-provider'
import type { ITTSProvider, SpeakOptions } from './types'

const PARAGRAPH_PAUSE_MS = 280
/**
 * Stall detection: if no timeupdate fires for this many ms, treat as stalled.
 * Resets on every timeupdate/playing so long-but-healthy audio is never cut short.
 */
const STALL_TIMEOUT_MS = 5000
/** Blob fetch must complete within this many ms before falling back to browser TTS */
const FETCH_TIMEOUT_MS = 12000

const DEV = process.env.NODE_ENV === 'development'

/**
 * Single shared Audio element, reused across all sequential speak() calls.
 *
 * iOS Safari grants the "audio activation" to a specific HTMLAudioElement instance
 * on the first user-gesture-triggered play(). Subsequent play() calls on the SAME
 * element are allowed without a new gesture. Creating `new Audio()` per segment
 * throws NotAllowedError on iOS after the first example, which is why the queue
 * stalled at Example 2.
 */
let sharedAudio: HTMLAudioElement | null = null

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) sharedAudio = new Audio()
  return sharedAudio
}

/** Clear all event handlers to avoid stale callbacks when reusing the element */
function clearHandlers(a: HTMLAudioElement) {
  a.onplay        = null
  a.onplaying     = null
  a.ontimeupdate  = null
  a.onwaiting     = null
  a.onstalled     = null
  a.onsuspend     = null
  a.onended       = null
  a.onerror       = null
  a.onloadeddata  = null
  a.oncanplay     = null
}

export class PregeneratedTTSProvider implements ITTSProvider {
  private browser = new BrowserTTSProvider()
  private stopped = false
  private paused = false
  private fetchAbort = new AbortController()
  private _playId = 0

  isAvailable() { return true }

  pause() {
    if (sharedAudio && !sharedAudio.paused) {
      sharedAudio.pause()
      this.paused = true
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.pause()
  }

  resume() {
    if (this.paused && sharedAudio) {
      sharedAudio.play().catch(() => {})
      this.paused = false
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.resume()
  }

  stop() {
    this.stopped = true
    this.paused = false
    this.fetchAbort.abort()
    this.fetchAbort = new AbortController()
    if (sharedAudio) {
      sharedAudio.pause()
      clearHandlers(sharedAudio)
      // Do NOT null sharedAudio or clear src — keeps iOS activation alive
    }
    this.browser.stop()
  }

  fadeOut(durationMs: number) {
    if (!sharedAudio || sharedAudio.paused || this.stopped) { this.stop(); return }
    const startTime = performance.now()
    const self = this
    const tick = () => {
      if (!sharedAudio || sharedAudio.paused) {
        if (sharedAudio) sharedAudio.volume = 1
        return
      }
      const elapsed = performance.now() - startTime
      if (elapsed >= durationMs) {
        sharedAudio.volume = 1
        self.stop()
        return
      }
      sharedAudio.volume = Math.max(0, 1 - elapsed / durationMs)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  speak(options: SpeakOptions) {
    const { texts, audioUrls, voiceKey, voiceKeys, rate, pitch, volume, onStart, onEnd, onError } = options

    const myPlayId = ++this._playId
    this.stopped = false
    this.fetchAbort.abort()
    this.fetchAbort = new AbortController()
    this.browser.stop()

    // Pause any ongoing playback, clear stale handlers
    if (sharedAudio) {
      sharedAudio.pause()
      clearHandlers(sharedAudio)
    }

    let index = 0
    let started = false
    const self = this
    const abortSignal = this.fetchAbort.signal

    const browserFallback = (text: string, segKey: typeof voiceKey, onDone: () => void) => {
      if (DEV) console.log('[TTS] browser fallback for:', text.slice(0, 40))
      self.browser.speak({
        texts: [text],
        voiceKey: segKey, rate, pitch, volume,
        onStart: !started ? () => { started = true; onStart?.() } : undefined,
        onEnd: onDone,
        onError,
      })
    }

    // Play a pre-fetched blob on the shared Audio element.
    // Reusing the same element is the iOS fix: the element stays "activated"
    // after the first user-gesture-triggered play().
    const playBlob = (blobUrl: string, text: string, segKey: typeof voiceKey, onDone: () => void) => {
      const audio = getSharedAudio()

      // Detach old handlers before configuring for new segment
      clearHandlers(audio)
      audio.pause()
      audio.volume = 1  // reset after any previous fadeOut()
      audio.src = blobUrl
      audio.playbackRate = Math.min(Math.max(rate ?? 1, 0.5), 2.0)
      audio.load()

      let resolved = false
      let stallTimer: ReturnType<typeof setTimeout> | null = null

      const clearStall = () => {
        if (stallTimer) { clearTimeout(stallTimer); stallTimer = null }
      }

      const resetStall = () => {
        clearStall()
        if (resolved) return
        stallTimer = setTimeout(() => {
          if (!resolved && !self.stopped && myPlayId === self._playId) {
            if (DEV) console.warn('[TTS] stall detected — advancing queue')
            audio.pause()
            handleEnded()
          }
        }, STALL_TIMEOUT_MS)
      }

      const handleEnded = () => {
        if (resolved) return
        resolved = true
        clearStall()
        URL.revokeObjectURL(blobUrl)
        onDone()
      }

      const handleError = (reason?: string) => {
        if (resolved) return
        resolved = true
        clearStall()
        URL.revokeObjectURL(blobUrl)
        if (DEV) console.warn('[TTS] audio error:', reason ?? audio.error?.message)
        if (!self.stopped) browserFallback(text, segKey, onDone)
      }

      if (!started) { started = true; onStart?.() }

      audio.onplay      = () => { if (DEV) console.log('[TTS] play'); resetStall() }
      audio.onplaying   = () => { if (DEV) console.log('[TTS] playing'); resetStall() }
      audio.ontimeupdate = resetStall
      audio.onwaiting   = () => { if (DEV) console.log('[TTS] waiting (buffering)') }
      audio.onstalled   = () => { if (DEV) console.log('[TTS] stalled') }
      audio.onended     = () => { if (DEV) console.log('[TTS] ended'); handleEnded() }
      audio.onerror     = () => handleError(audio.error?.message)

      audio.play().catch(() => handleError('play() rejected'))
    }

    // Fetch MP3 as blob (avoids streaming partial-content stalls).
    // Retries once on transient failure, then falls back to browser TTS.
    const fetchAndPlay = async (
      url: string, text: string, segKey: typeof voiceKey, onDone: () => void, retries = 1,
    ) => {
      if (self.stopped) return

      const localAbort = new AbortController()
      const timeoutId = setTimeout(() => localAbort.abort(), FETCH_TIMEOUT_MS)
      const onParentAbort = () => localAbort.abort()
      abortSignal.addEventListener('abort', onParentAbort, { once: true })

      try {
        if (DEV) console.log('[TTS] fetching blob:', url.split('/').pop())
        const res = await fetch(url, { signal: localAbort.signal })
        clearTimeout(timeoutId)
        abortSignal.removeEventListener('abort', onParentAbort)

        if (self.stopped) return
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const blob = await res.blob()
        if (self.stopped) return

        if (DEV) console.log('[TTS] blob ready', blob.size, 'bytes')
        playBlob(URL.createObjectURL(blob), text, segKey, onDone)
      } catch (err) {
        clearTimeout(timeoutId)
        abortSignal.removeEventListener('abort', onParentAbort)
        if (self.stopped) return

        const isAbort = (err as Error).name === 'AbortError'
        if (!isAbort && retries > 0) {
          if (DEV) console.warn('[TTS] fetch failed, retrying…', (err as Error).message)
          await new Promise(r => setTimeout(r, 600))
          if (!self.stopped) fetchAndPlay(url, text, segKey, onDone, retries - 1)
        } else {
          if (DEV) console.warn('[TTS] fetch failed → browser TTS fallback', (err as Error).message)
          if (!self.stopped) browserFallback(text, segKey, onDone)
        }
      }
    }

    const next = () => {
      if (self.stopped || index >= texts.length) {
        if (!self.stopped) onEnd?.()
        return
      }

      options.onParagraphChange?.(index)
      const url    = audioUrls?.[index] ?? null
      const segKey = voiceKeys?.[index] ?? voiceKey
      const text   = texts[index++]
      const onDone = () => { if (!self.stopped) setTimeout(next, PARAGRAPH_PAUSE_MS) }

      if (!url) {
        browserFallback(text, segKey, onDone)
        return
      }

      fetchAndPlay(url, text, segKey, onDone)
    }

    next()
  }
}
