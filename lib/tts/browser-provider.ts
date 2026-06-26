import type { VoiceKey } from '@/lib/settings/preferences'
import type { ITTSProvider, SpeakOptions } from './types'

/** 문단 사이 자연스러운 쉼 (ms) */
const PARAGRAPH_PAUSE_MS = 280

/**
 * 음성 이름 우선순위 — 기기별로 고품질 음성을 먼저 선택.
 * 소문자 부분 문자열 매칭으로 동작.
 */
const VOICE_PRIORITY: Record<VoiceKey, string[]> = {
  'us-female': [
    'google us english',    // Chrome (전 플랫폼) — 가장 자연스러움
    'samantha',             // macOS 기본 여성
    'microsoft aria',       // Windows 11 Edge 고품질
    'ava',                  // macOS 신버전
    'allison',              // macOS
    'zira',                 // Windows 기본 여성
  ],
  'us-male': [
    'google us english male',
    'alex',                 // macOS 기본 남성
    'microsoft guy',        // Windows 11 Edge 고품질
    'microsoft david',      // Windows 기본 남성
    'fred',                 // macOS 구버전
  ],
  'uk-female': [
    'google uk english female',
    'kate',                 // macOS
    'serena',               // macOS 신버전
    'microsoft hazel',      // Windows
  ],
  'uk-male': [
    'google uk english male',
    'daniel',               // macOS
    'microsoft george',     // Windows
  ],
}

/** 여성 음성 감지 패턴 (우선순위 매칭 실패 시 폴백) */
const FEMALE_PATTERN =
  /samantha|karen|moira|fiona|victoria|allison|ava|susan|zira|female|woman|kate|siri|aria|hazel|serena|nova|shimmer/i

/**
 * VoiceKey에 맞는 최선의 SpeechSynthesisVoice를 반환.
 * 우선순위 이름 매칭 → 성별 휴리스틱 → 풀 첫 번째 순서로 폴백.
 */
export function findBestVoice(key: VoiceKey): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const isUK     = key.startsWith('uk')
  const isFemale = key.endsWith('female')

  // 언어 풀: 로컬 음성 우선 (remote TTS보다 일관성 높음)
  const langPool = voices
    .filter(v => v.lang.startsWith(isUK ? 'en-GB' : 'en-US'))
    .sort((a, b) => Number(b.localService) - Number(a.localService))

  const pool = langPool.length
    ? langPool
    : voices.filter(v => v.lang.startsWith('en'))  // 언어 없으면 영어 전체 폴백

  if (!pool.length) return null

  // 1차: 이름 우선순위 매칭
  for (const fragment of VOICE_PRIORITY[key]) {
    const match = pool.find(v => v.name.toLowerCase().includes(fragment))
    if (match) return match
  }

  // 2차: 성별 휴리스틱
  return isFemale
    ? (pool.find(v => FEMALE_PATTERN.test(v.name)) ?? pool[0])
    : (pool.find(v => !FEMALE_PATTERN.test(v.name)) ?? pool[0])
}

/**
 * VoiceKey별 최적 pitch.
 * 과하지 않게: female +0.08, male -0.05 정도.
 */
export function getPitchForKey(key: VoiceKey): number {
  return key.endsWith('female') ? 1.08 : 0.95
}

export class BrowserTTSProvider implements ITTSProvider {
  private get synth() {
    return typeof window !== 'undefined' ? window.speechSynthesis : null
  }

  isAvailable() { return !!this.synth }

  stop() { this.synth?.cancel() }

  speak({ texts, voiceKey, rate, pitch, volume, onStart, onEnd, onError }: SpeakOptions) {
    const s = this.synth
    if (!s) return

    s.cancel()

    const voice      = findBestVoice(voiceKey)
    const lang       = voiceKey.startsWith('uk') ? 'en-GB' : 'en-US'
    const validTexts = texts.map(t => t.trim()).filter(Boolean)

    if (!validTexts.length) { onEnd?.(); return }

    let started = false
    let index   = 0

    const next = () => {
      if (index >= validTexts.length) { onEnd?.(); return }

      const u    = new SpeechSynthesisUtterance(validTexts[index++])
      u.lang     = lang
      u.rate     = rate
      u.pitch    = pitch
      u.volume   = volume
      if (voice) u.voice = voice

      u.onstart = () => {
        if (!started) { started = true; onStart?.() }
      }
      u.onend = () => {
        if (index < validTexts.length) {
          // 문단 간 자연스러운 쉼
          setTimeout(next, PARAGRAPH_PAUSE_MS)
        } else {
          onEnd?.()
        }
      }
      u.onerror = (e) => {
        // 'interrupted' / 'canceled'은 사용자 stop() 호출이므로 무시
        if (e.error !== 'interrupted' && e.error !== 'canceled') onError?.()
      }

      s.speak(u)
    }

    next()
  }
}
