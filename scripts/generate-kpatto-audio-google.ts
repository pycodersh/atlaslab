/**
 * K-PATTO 음성 생성 — Google Cloud TTS Neural2 (한국어)
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio-google.ts --ep 1
 *   npx tsx scripts/generate-kpatto-audio-google.ts --ep 1 --ep 30
 *   npx tsx scripts/generate-kpatto-audio-google.ts --all
 *   npx tsx scripts/generate-kpatto-audio-google.ts --ep 1 --force   # 이미 생성된 것도 재생성
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY!
const BUCKET = 'audio'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Neural2 한국어 화자별 음성 매핑
// A, C = 여성 / B, D = 남성
const VOICE_MAP: Record<string, string> = {
  emma:    'ko-KR-Neural2-A',  // 여성, 밝고 자연스러움
  jisu:    'ko-KR-Neural2-C',  // 여성, 활발함
  jisoo:   'ko-KR-Neural2-C',
  sophie:  'ko-KR-Neural2-A',
  minjun:  'ko-KR-Neural2-B',  // 남성
  직원:    'ko-KR-Neural2-C',
  행인:    'ko-KR-Neural2-B',
  의사:    'ko-KR-Neural2-D',  // 남성, 낮은 톤
  약사:    'ko-KR-Neural2-A',
  상인:    'ko-KR-Neural2-B',
  교수님:  'ko-KR-Neural2-D',
  기사:    'ko-KR-Neural2-B',
  접수:    'ko-KR-Neural2-C',
  학생들:  'ko-KR-Neural2-A',
  모두:    'ko-KR-Neural2-A',
  merchant:'ko-KR-Neural2-B',
  staff:   'ko-KR-Neural2-C',
  stranger:'ko-KR-Neural2-B',
  driver:  'ko-KR-Neural2-B',
  professor:'ko-KR-Neural2-D',
}

function getVoice(speaker: string): string {
  return VOICE_MAP[speaker.trim()] ?? 'ko-KR-Neural2-A'
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function tts(text: string, voiceName: string): Promise<Buffer> {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'ko-KR', name: voiceName },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95,   // 약간 천천히 (학습자 친화적)
          pitch: 0,
        },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google TTS error ${res.status}: ${err}`)
  }
  const json = await res.json() as { audioContent: string }
  return Buffer.from(json.audioContent, 'base64')
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
  const argv = process.argv.slice(2)
  const epArgs = argv.reduce<number[]>((acc, v, i) => {
    if (argv[i - 1] === '--ep') acc.push(Number(v))
    return acc
  }, [])
  const allMode = argv.includes('--all')
  const force   = argv.includes('--force')

  const { data: episodes } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')

  let targetEps = episodes ?? []
  if (!allMode) {
    if (epArgs.length === 0) { console.error('--ep <num> 또는 --all 필요'); process.exit(1) }
    const [from, to] = epArgs.length >= 2
      ? [Math.min(...epArgs), Math.max(...epArgs)]
      : [epArgs[0], epArgs[0]]
    targetEps = targetEps.filter(e => e.episode_num >= from && e.episode_num <= to)
  }

  const epIds = targetEps.map(e => e.id)
  const epNumMap = new Map(targetEps.map(e => [e.id, e.episode_num]))

  console.log(`\nGoogle TTS Neural2 — EP${targetEps[0]?.episode_num}~EP${targetEps.at(-1)?.episode_num} (${targetEps.length}개)${force ? ' [FORCE]' : ''}`)

  let q = sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url')
    .in('episode_id', epIds)
    .order('episode_id').order('order_num')

  if (!force) q = q.is('audio_url', null)

  const { data: bubbles } = await q
  const pending = bubbles ?? []
  console.log(`생성 대상: ${pending.length}건\n`)

  let ok = 0, fail = 0
  for (const b of pending) {
    const epNum = epNumMap.get(b.episode_id) ?? 0
    const storagePath = `bubbles/ep${String(epNum).padStart(2, '0')}/b_${b.id}.mp3`
    process.stdout.write(`  EP${String(epNum).padStart(2,'0')} id=${b.id} [${b.speaker}→${getVoice(b.speaker)}] "${b.korean.slice(0, 20)}"... `)
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

  console.log(`\n완료: ${ok}✅  ${fail}❌`)
}

main().catch(e => { console.error(e); process.exit(1) })
