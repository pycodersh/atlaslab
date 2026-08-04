/**
 * WAV 헤더 버그 수정 스크립트
 *
 * pcmToWav() 버그: bitDepth가 offset 36에 기록되어야 할 34에 기록됨
 *   + 'data' 마커가 38에 있어야 할 36에 위치 → 브라우저가 인식 못 함
 *
 * 이 스크립트는 Supabase에서 기존 파일을 다운로드 → PCM 추출(offset 44) → 올바른 헤더로 재업로드
 * Gemini API를 사용하지 않음
 *
 * 사용법:
 *   npx tsx scripts/repair-kpatto-audio-headers.ts --ep 9
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const epArgs: number[] = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ep' && args[i + 1]) epArgs.push(parseInt(args[++i]))
}
if (epArgs.length === 0) {
  console.error('Usage: npx tsx scripts/repair-kpatto-audio-headers.ts --ep 9')
  process.exit(1)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = 'audio'

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16): Buffer {
  const header = Buffer.alloc(44)
  const dataLen = pcm.length
  header.write('RIFF', 0);       header.writeUInt32LE(dataLen + 36, 4)
  header.write('WAVE', 8);       header.write('fmt ', 12)
  header.writeUInt32LE(16, 16);  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * channels * bitDepth / 8, 28)
  header.writeUInt16LE(channels * bitDepth / 8, 32)
  header.writeUInt16LE(bitDepth, 34)   // fixed: was 36
  header.write('data', 36);            // fixed: was 38
  header.writeUInt32LE(dataLen, 40)
  return Buffer.concat([header, pcm])
}

async function repairFile(url: string, storagePath: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())

  // PCM은 항상 offset 44부터 시작 (헤더가 44바이트)
  const pcm = buf.slice(44)
  const fixed = pcmToWav(pcm)

  const { error } = await sb.storage.from(BUCKET).upload(storagePath, fixed, {
    contentType: 'audio/wav', upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
}

async function main() {
  const EP_FROM = Math.min(...epArgs)
  const EP_TO   = Math.max(...epArgs)

  console.log(`\n=== WAV 헤더 수정  EP${EP_FROM}${EP_TO > EP_FROM ? `–${EP_TO}` : ''} ===\n`)

  for (let epNum = EP_FROM; epNum <= EP_TO; epNum++) {
    const epStr = String(epNum).padStart(2, '0')

    // 대사 (kp_bubbles audio_url 기준)
    const { data: bubbles } = await sb
      .from('kp_bubbles')
      .select('id, audio_url, korean')
      .eq('episode_id', epNum)
      .not('audio_url', 'is', null)

    console.log(`EP${epStr} 대사 ${bubbles?.length ?? 0}건`)
    for (const b of bubbles ?? []) {
      const storagePath = b.audio_url!.split('/object/public/audio/')[1]
      process.stdout.write(`  [${b.id}] ${b.korean?.slice(0, 20)} ... `)
      try {
        await repairFile(b.audio_url!, storagePath)
        console.log('✓')
      } catch (e: any) {
        console.log(`✗ ${e.message}`)
      }
    }

    // 표현 (kp_expressions audio_url 기준)
    const { data: exprs } = await sb
      .from('kp_expressions')
      .select('id, audio_url, korean')
      .contains('episodes', JSON.stringify([epNum]))
      .not('audio_url', 'is', null)

    if (exprs && exprs.length > 0) {
      console.log(`EP${epStr} 표현 ${exprs.length}건`)
      for (const e of exprs) {
        const storagePath = e.audio_url!.split('/object/public/audio/')[1]
        process.stdout.write(`  [${e.id}] ${e.korean?.slice(0, 20)} ... `)
        try {
          await repairFile(e.audio_url!, storagePath)
          console.log('✓')
        } catch (err: any) {
          console.log(`✗ ${err.message}`)
        }
      }
    }
  }

  console.log('\n완료')
}

main().catch(console.error)
