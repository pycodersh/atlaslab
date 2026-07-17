import type { VoiceKey } from '@/lib/settings/preferences'

export type { VoiceKey }

export interface SpeakOptions {
  /** 순차 재생할 텍스트 배열 (문단 단위) */
  texts: string[]
  /** 사전 생성된 오디오 URL 배열 (texts와 1:1 대응, null이면 Browser TTS 폴백) */
  audioUrls?: (string | null | undefined)[]
  /** 기본 음성 */
  voiceKey: VoiceKey
  /** 세그먼트별 음성 (texts와 1:1 대응) — 화자/내레이션 구분용. 없으면 voiceKey 사용 */
  voiceKeys?: VoiceKey[]
  rate: number
  pitch: number
  volume: number
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
  /** 문단이 바뀔 때마다 호출 — 슬라이드 동기화에 사용 */
  onParagraphChange?: (index: number) => void
}

/**
 * TTS 엔진 인터페이스.
 * PregeneratedTTSProvider(현재) 외에 OpenAITTSProvider 등을 추후 구현 가능.
 */
export interface ITTSProvider {
  speak(options: SpeakOptions): void
  stop(): void
  isAvailable(): boolean
}
