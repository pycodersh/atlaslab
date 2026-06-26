import { BrowserTTSProvider } from './browser-provider'
import type { ITTSProvider, SpeakOptions } from './types'

const PARAGRAPH_PAUSE_MS = 280

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
    const { texts, audioUrls, voiceKey, rate, pitch, volume, onStart, onEnd, onError } = options

    this.stopped = false
    this.browser.stop()
    if (activeAudio) { activeAudio.pause(); activeAudio.src = ''; activeAudio = null }

    let index   = 0
    let started = false
    const self  = this

    const browserFallback = (text: string, onDone: () => void) => {
      self.browser.speak({
        texts:   [text],
        voiceKey, rate, pitch, volume,
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

      const url  = audioUrls?.[index] ?? null
      const text = texts[index++]
      const onDone = () => { if (!self.stopped) setTimeout(next, PARAGRAPH_PAUSE_MS) }

      if (!url) {
        browserFallback(text, onDone)
        return
      }

      const audio = new Audio(url)
      activeAudio = audio

      // HTML Audio element: rate 적용 (pitch는 Neural 음성이므로 불필요)
      audio.playbackRate = Math.min(Math.max(rate, 0.5), 2.0)

      audio.onplay = () => {
        if (!started) { started = true; onStart?.() }
      }
      audio.onended = () => {
        activeAudio = null
        onDone()
      }
      audio.onerror = () => {
        // 파일 없거나 네트워크 오류 → Browser TTS 폴백
        activeAudio = null
        if (!self.stopped) browserFallback(text, onDone)
      }

      audio.play().catch(() => {
        // autoplay 차단 등 → Browser TTS 폴백
        activeAudio = null
        if (!self.stopped) browserFallback(text, onDone)
      })
    }

    next()
  }
}
