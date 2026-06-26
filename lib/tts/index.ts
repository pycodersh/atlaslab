/**
 * TTS 엔진 교체 포인트.
 *
 * 현재: PregeneratedTTSProvider
 *   - Supabase Storage에 사전 생성된 MP3 재생
 *   - 파일 없으면 BrowserTTSProvider 자동 폴백
 *
 * 향후 교체 예시:
 *   import { OpenAITTSProvider } from './openai-provider'
 *   export const ttsProvider = new OpenAITTSProvider()
 */

export type { ITTSProvider, SpeakOptions } from './types'
export { BrowserTTSProvider, findBestVoice, getPitchForKey } from './browser-provider'
export { PregeneratedTTSProvider } from './pregenerated-provider'
export { storyParaAudioUrl, EDGE_VOICE_MAP } from './audio-urls'

import { PregeneratedTTSProvider } from './pregenerated-provider'
import type { ITTSProvider } from './types'

export const ttsProvider: ITTSProvider = new PregeneratedTTSProvider()
