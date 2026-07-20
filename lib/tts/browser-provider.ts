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
  pause() { this.synth?.pause() }
  resume() { this.synth?.resume() }

  speak(options: SpeakOptions) {
    const s = this.synth
    if (!s) return

    s.cancel()

    // iOS Chrome(WKWebView)에서 getVoices()가 빈 배열을 반환하는 경우
    // voiceschanged 이벤트를 기다린 뒤 재생 (최대 2초 타임아웃)
    if (s.getVoices().length === 0) {
      let resolved = false
      const proceed = () => {
        if (resolved) return
        resolved = true
        window.speechSynthesis.removeEventListener('voiceschanged', proceed)
        this._doSpeak(s, options)
      }
      window.speechSynthesis.addEventListener('voiceschanged', proceed)
      // 2초 안에 이벤트가 안 오면 그냥 진행 (일부 구형 브라우저 대응)
      setTimeout(proceed, 2000)
    } else {
      this._doSpeak(s, options)
    }
  }

  private _doSpeak(
    s: SpeechSynthesis,
    { texts, voiceKey, voiceKeys, rate, volume, onStart, onEnd, onError }: SpeakOptions,
  ) {
    // 세그먼트 단위로 음성을 다르게 줄 수 있으므로 원본 index를 유지한 채 빈 텍스트만 건너뛴다
    const segments = texts
      .map((t, i) => ({ text: t.trim(), key: voiceKeys?.[i] ?? voiceKey }))
      .filter(seg => seg.text.length > 0)

    if (!segments.length) { onEnd?.(); return }

    let started = false
    let index   = 0

    const next = () => {
      if (index >= segments.length) { onEnd?.(); return }

      const seg  = segments[index++]
      const key  = seg.key
      const u    = new SpeechSynthesisUtterance(seg.text)
      u.lang     = key.startsWith('uk') ? 'en-GB' : 'en-US'
      u.rate     = rate
      u.pitch    = getPitchForKey(key)
      u.volume   = volume
      const voice = findBestVoice(key)
      if (voice) u.voice = voice

      u.onstart = () => {
        if (!started) { started = true; onStart?.() }
      }
      u.onend = () => {
        if (index < segments.length) {
          setTimeout(next, PARAGRAPH_PAUSE_MS)
        } else {
          onEnd?.()
        }
      }
      u.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return
        // Advance queue so a single utterance error doesn't stop everything
        if (index < segments.length) {
          setTimeout(next, PARAGRAPH_PAUSE_MS)
        } else {
          // Last segment errored — do NOT treat as completion
          onError?.()
        }
      }

      s.speak(u)
    }

    next()
  }
}
