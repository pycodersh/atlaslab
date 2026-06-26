import type { VoiceKey } from '@/lib/settings/preferences'

export type { VoiceKey }

export interface SpeakOptions {
  /** 순차 재생할 텍스트 배열 (문단 단위) */
  texts: string[]
  voiceKey: VoiceKey
  rate: number
  pitch: number
  volume: number
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

/**
 * TTS 엔진 인터페이스.
 * BrowserTTSProvider 외에 OpenAITTSProvider 등을 추후 구현 가능.
 */
export interface ITTSProvider {
  speak(options: SpeakOptions): void
  stop(): void
  isAvailable(): boolean
}
