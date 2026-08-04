/**
 * K-PATTO 말풍선 음성 생성 스크립트 (kp_bubbles 기준)
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio.ts --ep 1          # EP01 테스트
 *   npx tsx scripts/generate-kpatto-audio.ts --ep 1 --ep 30  # EP01~30
 *   npx tsx scripts/generate-kpatto-audio.ts --all            # 전체
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const BUCKET = 'audio'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

type Voice = OpenAI.Audio.Speech.SpeechCreateParams['voice']

const VOICE_MAP: Record<string, Voice> = {
  emma:    'nova',
  jisu:    'shimmer',
  jisoo:   'shimmer',
  sophie:  'alloy',
  minjun:  'onyx',
  직원:    'shimmer',
  행인:    'echo',
  의사:    'onyx',
  약사:    'alloy',
  상인:    'echo',
  교수님:  'alloy',
  기사:    'echo',
  접수:    'shimmer',
  학생들:  'fable',
  모두:    'fable',
}

function getVoice(speaker: string): Voice {
  return VOICE_MAP[speaker.trim()] ?? 'echo'
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function tts(text: string, voice: Voice): Promise<Buffer> {
  const resp = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  })
  return Buffer.from(await resp.arrayBuffer())
}

async function upload(storagePath: string, buf: Buffer): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'audio/mpeg',
    upsert: true,
  })
  if (error) throw new Error(`Upload [${storagePath}]: ${error.message}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

async function main() {
  // CLI 파싱: --ep 1 --ep 30 범위 or --all
  const argv = process.argv.slice(2)
  const epArgs = argv.reduce<number[]>((acc, v, i) => {
    if (argv[i - 1] === '--ep') acc.push(Number(v))
    return acc
  }, [])
  const allMode = argv.includes('--all')

  // 에피소드 목록 조회
  const { data: episodes } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')

  let targetEps = episodes ?? []
  if (!allMode) {
    if (epArgs.length === 0) { console.error('--ep <num> 또는 --all 필요'); process.exit(1) }
    const [from, to] = epArgs.length >= 2 ? [Math.min(...epArgs), Math.max(...epArgs)] : [epArgs[0], epArgs[0]]
    targetEps = targetEps.filter(e => e.episode_num >= from && e.episode_num <= to)
  }

  const epIds = targetEps.map(e => e.id)
  const epNumMap = new Map(targetEps.map(e => [e.id, e.episode_num]))

  console.log(`\nK-PATTO 음성 생성: EP${targetEps[0]?.episode_num}~EP${targetEps.at(-1)?.episode_num} (${targetEps.length}개 에피소드)`)

  // 대상 버블 조회 — audio_url 없는 것만
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url')
    .in('episode_id', epIds)
    .is('audio_url', null)
    .order('episode_id')
    .order('order_num')

  const pending = bubbles ?? []
  console.log(`생성 대상: ${pending.length}건\n`)

  let ok = 0, fail = 0

  for (const b of pending) {
    const epNum = epNumMap.get(b.episode_id) ?? 0
    const storagePath = `bubbles/ep${String(epNum).padStart(2, '0')}/b_${b.id}.mp3`
    process.stdout.write(`  EP${String(epNum).padStart(2,'0')} id=${b.id} [${b.speaker}] "${b.korean.slice(0, 20)}"... `)

    try {
      const buf = await tts(b.korean, getVoice(b.speaker))
      const url = await upload(storagePath, buf)
      await sb.from('kp_bubbles').update({ audio_url: url }).eq('id', b.id)
      process.stdout.write(`✅ ${buf.length}B\n`)
      ok++
    } catch (e) {
      process.stdout.write(`❌ ${(e as Error).message}\n`)
      fail++
    }
    await sleep(100)
  }

  console.log(`\n완료: ${ok}✅  ${fail}❌  (총 ${pending.length}건)`)
}

main().catch(e => { console.error(e); process.exit(1) })
