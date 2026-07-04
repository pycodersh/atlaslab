import { BrowserTTSProvider } from './browser-provider'
import type { ITTSProvider, SpeakOptions } from './types'

const PARAGRAPH_PAUSE_MS = 280
/** Max ms to wait for audio.onended before force-advancing (guards against network stall) */
const AUDIO_TIMEOUT_MS = 8000

let activeAudio: HTMLAudioElement | null = null

export class PregeneratedTTSProvider implements ITTSProvider {
  private browser = new BrowserTTSProvider()
  private stopped  = false

  isAvailable() { return true }

  stop() {
    this.stopped = true
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
    this.browser.stop()
    if (activeAudio) { activeAudio.pause(); activeAudio.src = ''; activeAudio = null }

    let index   = 0
    let started = false
    const self  = this

    const browserFallback = (text: string, segKey: typeof voiceKey, onDone: () => void) => {
      self.browser.speak({
        texts:   [text],
        voiceKey: segKey, rate, pitch, volume,
        onStart: !started ? () => { started = true; onStart?.() } : undefined,
        onEnd:   onDone,
        onError,
      })
    }

    const next = () => {
      if (self.stopped || index >= texts.length) {
        if (!self.stopped) onEnd?.()
        return
      }

      options.onParagraphChange?.(index)   // 문단 시작 직전 호출
      const url    = audioUrls?.[index] ?? null
      const segKey = voiceKeys?.[index] ?? voiceKey
      const text   = texts[index++]
      const onDone = () => { if (!self.stopped) setTimeout(next, PARAGRAPH_PAUSE_MS) }

      if (!url) {
        browserFallback(text, segKey, onDone)
        return
      }

      const audio = new Audio(url)
      activeAudio = audio

      // HTML Audio element: rate 적용 (pitch는 Neural 음성이므로 불필요)
      audio.playbackRate = Math.min(Math.max(rate, 0.5), 2.0)

      // Guard: once fired (ended/error/timeout), no second callback
      let resolved = false
      let stallTimer: ReturnType<typeof setTimeout> | null = null

      const clearStall = () => {
        if (stallTimer) { clearTimeout(stallTimer); stallTimer = null }
      }

      const handleEnded = () => {
        if (resolved) return
        resolved = true
        clearStall()
        activeAudio = null
        onDone()
      }

      const handleError = () => {
        if (resolved) return
        resolved = true
        clearStall()
        activeAudio = null
        if (!self.stopped) browserFallback(text, segKey, onDone)
      }

      audio.onplay = () => {
        if (!started) { started = true; onStart?.() }
        // Start stall watchdog once audio is actually playing
        stallTimer = setTimeout(() => {
          if (!resolved && !self.stopped) {
            audio.pause()
            audio.src = ''
            handleEnded()  // treat stall as ended → advance queue
          }
        }, AUDIO_TIMEOUT_MS)
      }
      audio.onended = handleEnded
      audio.onerror = handleError  // 파일 없거나 네트워크 오류 → Browser TTS 폴백

      audio.play().catch(handleError)  // autoplay 차단 등 → Browser TTS 폴백
    }

    next()
  }
}
