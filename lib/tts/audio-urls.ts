import type { VoiceKey } from '@/lib/settings/preferences'

/** VoiceKey → msedge-tts Neural 음성 이름 */
export const EDGE_VOICE_MAP: Record<VoiceKey, string> = {
  'us-female': 'en-US-JennyNeural',
  'us-male':   'en-US-GuyNeural',
  'uk-female': 'en-GB-SoniaNeural',
  'uk-male':   'en-GB-RyanNeural',
}

/**
 * 콘텐츠 기반 짧은 해시 (FNV-1a → base36).
 *
 * 오디오 파일명에 텍스트 해시를 넣어 **화면 텍스트와 음성을 강하게 묶는다.**
 * 본문이 바뀌면 파일명이 바뀌므로, 이전 콘텐츠로 생성된 오디오(stale)는
 * 자동으로 무효화되고 → 파일이 없으면 Browser TTS가 현재 표시 텍스트를 읽는다.
 *
 * ⚠️ scripts/generate-audio.ts 의 동일 해시 구현과 반드시 일치해야 한다.
 */
export function contentHash(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

/** Supabase Storage 오디오 파일 경로 (bucket: audio) — 텍스트 해시 포함 */
export function audioFilePath(voiceKey: VoiceKey, storyId: number, paraId: string, text: string): string {
  return `story-${storyId}-${paraId}-${contentHash(text)}-${voiceKey}.mp3`
}

/** 재생용 공개 URL (파일 없으면 Browser TTS 폴백) */
export function storyParaAudioUrl(
  voiceKey: VoiceKey,
  storyId: number,
  paraId: string,
  text: string,
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/audio/${audioFilePath(voiceKey, storyId, paraId, text)}`
}

/** Pattern 예문 오디오 파일 경로 (bucket: audio) — 텍스트 해시 포함 */
export function patternExampleFilePath(voiceKey: VoiceKey, patternId: string, index: number, text: string): string {
  return `pattern-${patternId}-ex${index}-${contentHash(text)}-${voiceKey}.mp3`
}

/** Pattern 예문 재생용 공개 URL (파일 없으면 Browser TTS 폴백) */
export function patternExampleAudioUrl(
  voiceKey: VoiceKey,
  patternId: string,
  index: number,
  text: string,
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/audio/${patternExampleFilePath(voiceKey, patternId, index, text)}`
}

/** Pattern 핵심 문구 오디오 파일 경로 (tilde 제거 후 생성된 파일) */
export function patternPhraseFilePath(voiceKey: VoiceKey, patternId: string, cleanText: string): string {
  return `pattern-${patternId}-phrase-${contentHash(cleanText)}-${voiceKey}.mp3`
}

/** Pattern 핵심 문구 재생용 공개 URL */
export function patternPhraseAudioUrl(
  voiceKey: VoiceKey,
  patternId: string,
  cleanText: string,
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/audio/${patternPhraseFilePath(voiceKey, patternId, cleanText)}`
}

/** pattern.pattern 필드에서 tilde 제거 → 음성 재생용 클린 텍스트 */
export function cleanPatternText(pattern: string): string {
  return pattern
    .replace(/\s*~ing\.?/g, '...')
    .replace(/\s*~\.?/g, '...')
    .trim()
}
