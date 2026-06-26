import type { VoiceKey } from '@/lib/settings/preferences'

/** VoiceKey → msedge-tts Neural 음성 이름 */
export const EDGE_VOICE_MAP: Record<VoiceKey, string> = {
  'us-female': 'en-US-JennyNeural',
  'us-male':   'en-US-GuyNeural',
  'uk-female': 'en-GB-SoniaNeural',
  'uk-male':   'en-GB-RyanNeural',
}

/** Supabase Storage 오디오 파일 경로 (bucket: audio) */
export function audioFilePath(voiceKey: VoiceKey, storyId: number, paraId: string): string {
  return `story-${storyId}-${paraId}-${voiceKey}.mp3`
}

/** 재생용 공개 URL */
export function storyParaAudioUrl(
  voiceKey: VoiceKey,
  storyId: number,
  paraId: string,
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/audio/${audioFilePath(voiceKey, storyId, paraId)}`
}
