const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const BASE = `${SUPABASE_URL}/storage/v1/object/public/audio/kpatto/precourse`

// Unicode hex slug — must match generate-precourse-audio.ts toSlug()
function toSlug(text: string): string {
  return Array.from(text)
    .map(c => c.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join('-')
}

export function precourseAudioUrl(lessonId: number, text: string): string {
  return `${BASE}/${lessonId}/${toSlug(text)}.mp3`
}
