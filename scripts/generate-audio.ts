/**
 * 스토리 문단 오디오 사전 생성 스크립트
 *
 * 사용법:
 *   npm run generate-audio
 *   npm run generate-audio -- --voice us-female   (특정 voice만)
 *   npm run generate-audio -- --story 1           (특정 스토리만)
 *   npm run generate-audio -- --voice us-male --story 2
 *
 * 처음 실행 전 Supabase Storage에 "audio" bucket을 Public으로 생성해주세요.
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── 설정 ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY!
const BUCKET       = 'audio'

const EDGE_VOICE_MAP: Record<string, string> = {
  'us-female': 'en-US-JennyNeural',
  'us-male':   'en-US-GuyNeural',
  'uk-female': 'en-GB-SoniaNeural',
  'uk-male':   'en-GB-RyanNeural',
}

// 콘텐츠 해시 — lib/tts/audio-urls.ts 의 contentHash 와 반드시 동일해야 함
function contentHash(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

// CLI 인자 파싱
const args       = process.argv.slice(2)
const voiceArg   = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : null
const storyArg   = args.includes('--story') ? Number(args[args.indexOf('--story') + 1]) : null
const targetVoices = voiceArg ? [voiceArg] : Object.keys(EDGE_VOICE_MAP)

// ── Supabase 클라이언트 ──────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── TTS 생성 ──────────────────────────────────────────────────────────────
async function generateAudio(text: string, edgeVoice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS()
  await tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

  const { audioStream } = tts.toStream(text)
  const chunks: Buffer[] = []

  return new Promise((resolve, reject) => {
    audioStream.on('data',  (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
    audioStream.on('end',   ()              => resolve(Buffer.concat(chunks)))
    audioStream.on('error', reject)
  })
}

// ── Supabase Storage 업로드 ──────────────────────────────────────────────
async function uploadAudio(filePath: string, buffer: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (error) throw new Error(`Upload failed [${filePath}]: ${error.message}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`
}

// ── 메인 ─────────────────────────────────────────────────────────────────
async function main() {
  const { magazineStories } = await import('../data/magazine-stories.js')

  const stories = storyArg
    ? magazineStories.filter((s: { id: number }) => s.id === storyArg)
    : magazineStories

  let total   = 0
  let skipped = 0
  let errors  = 0

  console.log(`\n  Audio generation start`)
  console.log(`   Voices : ${targetVoices.join(', ')}`)
  console.log(`   Stories: ${stories.map((s: { id: number }) => s.id).join(', ')}\n`)

  for (const voiceKey of targetVoices) {
    const edgeVoice = EDGE_VOICE_MAP[voiceKey]
    if (!edgeVoice) { console.warn(`  Unknown voice key: ${voiceKey}`); continue }

    for (const story of stories) {
      for (const para of story.paragraphs) {
        const filePath = `story-${story.id}-${para.id}-${contentHash(para.english)}-${voiceKey}.mp3`
        total++

        // 이미 존재하는 파일은 건너뜀 (--force 없이)
        const { data: existing } = await supabase.storage
          .from(BUCKET)
          .list('', { search: filePath })

        if (existing && existing.some((f: { name: string }) => f.name === filePath) && !args.includes('--force')) {
          process.stdout.write(`  skip  ${filePath}\n`)
          skipped++
          continue
        }

        try {
          process.stdout.write(`  gen   ${filePath} ...`)
          const buffer = await generateAudio(para.english, edgeVoice)
          await uploadAudio(filePath, buffer)
          process.stdout.write(` ok (${buffer.length} bytes)\n`)
        } catch (e) {
          process.stdout.write(` ERROR: ${(e as Error).message}\n`)
          errors++
        }

        // Rate limiting 방지
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }

  console.log(`\n  Done — total: ${total}, skipped: ${skipped}, errors: ${errors}\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
