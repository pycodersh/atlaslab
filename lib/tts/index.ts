/**
 * TTS 엔진 교체 포인트.
 *
 * 현재: BrowserTTSProvider (Web Speech API, 무료)
 * 향후: OpenAITTSProvider, ElevenLabsProvider 등으로 교체 가능
 *
 * 교체 방법:
 *   import { OpenAITTSProvider } from './openai-provider'
 *   export const ttsProvider = new OpenAITTSProvider()
 */

export type { ITTSProvider, SpeakOptions } from './types'
export { BrowserTTSProvider, findBestVoice, getPitchForKey } from './browser-provider'

import { BrowserTTSProvider } from './browser-provider'
import type { ITTSProvider } from './types'

// 모듈 싱글턴 — 앱 전체에서 하나의 TTS 재생 채널
export const ttsProvider: ITTSProvider = new BrowserTTSProvider()
