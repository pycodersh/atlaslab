import { BrowserTTSProvider } from './browser-provider'
import type { ITTSProvider, SpeakOptions } from './types'

const PARAGRAPH_PAUSE_MS = 280
/**
 * Stall detection: if no timeupdate event fires for this many ms, treat as stalled.
 * Reset on every timeupdate/playing event so long-but-healthy audio is never cut off.
 */
const STALL_TIMEOUT_MS = 5000
/** Blob fetch must complete within this many ms, or fall back to browser TTS */
const FETCH_TIMEOUT_MS = 12000

const DEV = process.env.NODE_ENV === 'development'

let activeAudio: HTMLAudioElement | null = null

export class PregeneratedTTSProvider implements ITTSProvider {
  private browser = new BrowserTTSProvider()
  private stopped = false
  private fetchAbort = new AbortController()

  isAvailable() { return true }

  stop() {
    this.stopped = true
    this.fetchAbort.abort()
    this.fetchAbort = new AbortController()
    if (activeAudio) {
      activeAudio.pause()
      activeAudio.src = ''
      activeAudio = null
    }
    this.browser.stop()
  }

  speak(options: SpeakOptions) {
    const { texts, audioUrls, voiceKey, voiceKeys, rate, pitch, volume, onStart, onEnd, onError } = options

    this.stopped = false
    this.fetchAbort.abort()
    this.fetchAbort = new AbortController()
    this.browser.stop()
    if (activeAudio) { activeAudio.pause(); activeAudio.src = ''; activeAudio = null }

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

    // Play a pre-fetched blob URL, with timeupdate-based stall detection
    const playBlob = (blobUrl: string, text: string, segKey: typeof voiceKey, onDone: () => void) => {
      const audio = new Audio(blobUrl)
      activeAudio = audio
      audio.playbackRate = Math.min(Math.max(rate ?? 1, 0.5), 2.0)

      let resolved = false
      let stallTimer: ReturnType<typeof setTimeout> | null = null

      const clearStall = () => {
        if (stallTimer) { clearTimeout(stallTimer); stallTimer = null }
      }

      // Reset stall watchdog — called on every sign of progress
      const resetStall = () => {
        clearStall()
        if (resolved) return
        stallTimer = setTimeout(() => {
          if (!resolved && !self.stopped) {
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
        activeAudio = null
        onDone()
      }

      const handleError = (reason?: string) => {
        if (resolved) return
        resolved = true
        clearStall()
        URL.revokeObjectURL(blobUrl)
        activeAudio = null
        if (DEV) console.warn('[TTS] audio error:', reason ?? audio.error?.message)
        if (!self.stopped) browserFallback(text, segKey, onDone)
      }

      if (!started) { started = true; onStart?.() }

      // Stall watchdog resets on every progress event
      audio.onplay     = () => { if (DEV) console.log('[TTS] play'); resetStall() }
      audio.onplaying  = () => { if (DEV) console.log('[TTS] playing'); resetStall() }
      audio.ontimeupdate = resetStall
      audio.onwaiting  = () => { if (DEV) console.log('[TTS] waiting (buffering)') }
      audio.onstalled  = () => { if (DEV) console.log('[TTS] stalled') }
      audio.onended    = () => { if (DEV) console.log('[TTS] ended'); handleEnded() }
      audio.onerror    = () => handleError(audio.error?.message)

      if (DEV) {
        audio.onloadeddata = () => console.log('[TTS] loadeddata dur:', audio.duration?.toFixed(2), 's')
        audio.oncanplay    = () => console.log('[TTS] canplay')
      }

      audio.play().catch(() => handleError('play() rejected'))
    }

    // Fetch MP3 as blob (eliminates streaming partial-content issues).
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

        const msg = (err as Error).message
        const isAbort = (err as Error).name === 'AbortError'

        if (!isAbort && retries > 0) {
          if (DEV) console.warn('[TTS] fetch failed, retrying…', msg)
          await new Promise(r => setTimeout(r, 600))
          if (!self.stopped) fetchAndPlay(url, text, segKey, onDone, retries - 1)
        } else {
          if (DEV) console.warn('[TTS] fetch failed → browser TTS fallback', msg)
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
