/**
 * K-PATTO EP81~90 음성 생성 (에러 즉시 중단 버전)
 *
 * ⚠️ 중단 규칙
 *  - TTS API 에러·429·quota exceeded, Storage 실패, DB 실패, 0바이트 → 즉시 중단
 *  - 에러를 삼키고 계속 진행하는 try/catch-continue 없음
 *  - 중단 시 보고: 마지막 성공 항목, 실패 항목 대사, 오류 전문, 성공 총 건수
 *
 * 실행: npx tsx scripts/generate-kpatto-audio-ep81-90.ts
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

async function callTTS(text: string, voice: Voice): Promise<Buffer> {
  const resp = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  })
  const buf = Buffer.from(await resp.arrayBuffer())
  if (buf.length === 0) throw new Error('TTS 응답 0바이트')
  return buf
}

async function uploadToStorage(storagePath: string, buf: Buffer): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'audio/mpeg',
    upsert: true,
  })
  if (error) throw new Error(`Storage 업로드 실패 [${storagePath}]: ${error.message}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

async function updateDB(id: string, audioUrl: string): Promise<void> {
  const { error } = await sb
    .from('kp_bubbles')
    .update({ audio_url: audioUrl })
    .eq('id', id)
  if (error) throw new Error(`DB 갱신 실패 [id=${id}]: ${error.message}`)
}

async function main() {
  const EP_FROM = 81, EP_TO = 90, DAILY_LIMIT = 85

  const { data: episodes, error: epErr } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', EP_FROM)
    .lte('episode_num', EP_TO)
    .order('episode_num')

  if (epErr) throw new Error(`episodes 조회 실패: ${epErr.message}`)
  if (!episodes?.length) throw new Error('EP81~90 에피소드를 찾을 수 없습니다')

  const epIds = episodes.map(e => e.id)
  const epNumMap = new Map(episodes.map(e => [e.id, e.episode_num]))

  const { data: bubbles, error: bErr } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url')
    .in('episode_id', epIds)
    .is('audio_url', null)
    .order('episode_id')
    .order('order_num')

  if (bErr) throw new Error(`bubbles 조회 실패: ${bErr.message}`)
  const pending = bubbles ?? []

  console.log(`\nK-PATTO 음성 생성: EP${EP_FROM}~EP${EP_TO}`)
  console.log(`미생성 대상: ${pending.length}건 / 한도: ${DAILY_LIMIT}건`)

  const toProcess = pending.length > DAILY_LIMIT ? pending.slice(0, DAILY_LIMIT) : pending
  if (pending.length > DAILY_LIMIT) {
    const last = toProcess.at(-1)!
    console.log(`⚠️  한도 초과 → 오늘은 ${DAILY_LIMIT}건만 처리`)
    console.log(`   오늘 마지막 예정 항목: EP${String(epNumMap.get(last.episode_id) ?? 0).padStart(2,'0')} id=${last.id}`)
  }
  console.log()

  const epStats = new Map<number, { ok: number; total: number }>()
  for (const ep of episodes) epStats.set(ep.episode_num, { ok: 0, total: 0 })

  let lastOk: string | null = null
  let okCount = 0

  for (const b of toProcess) {
    const epNum = epNumMap.get(b.episode_id) ?? 0
    const storagePath = `bubbles/ep${String(epNum).padStart(2, '0')}/b_${b.id}.mp3`
    const label = `EP${String(epNum).padStart(2,'0')} id=${b.id} [${b.speaker}] "${b.korean.slice(0, 25)}"`

    process.stdout.write(`  ${label}... `)

    let buf: Buffer
    try {
      buf = await callTTS(b.korean, getVoice(b.speaker))
    } catch (e) {
      process.stdout.write('❌\n')
      console.error(`\n[중단] TTS 실패`)
      console.error(`  실패 항목: ${label}`)
      console.error(`  대사 전문: ${b.korean}`)
      console.error(`  오류: ${(e as Error).message}`)
      console.error(`  마지막 성공 항목: ${lastOk ?? '없음'}`)
      console.error(`  성공 총 건수: ${okCount}`)
      process.exit(1)
    }

    let url: string
    try {
      url = await uploadToStorage(storagePath, buf!)
    } catch (e) {
      process.stdout.write('❌\n')
      console.error(`\n[중단] Storage 업로드 실패`)
      console.error(`  실패 항목: ${label}`)
      console.error(`  대사 전문: ${b.korean}`)
      console.error(`  오류: ${(e as Error).message}`)
      console.error(`  마지막 성공 항목: ${lastOk ?? '없음'}`)
      console.error(`  성공 총 건수: ${okCount}`)
      process.exit(1)
    }

    try {
      await updateDB(b.id, url!)
    } catch (e) {
      process.stdout.write('❌\n')
      console.error(`\n[중단] DB 갱신 실패`)
      console.error(`  실패 항목: ${label}`)
      console.error(`  대사 전문: ${b.korean}`)
      console.error(`  오류: ${(e as Error).message}`)
      console.error(`  마지막 성공 항목: ${lastOk ?? '없음'}`)
      console.error(`  성공 총 건수: ${okCount}`)
      process.exit(1)
    }

    process.stdout.write(`✅ ${buf!.length.toLocaleString()}B\n`)
    lastOk = label
    okCount++
    epStats.get(epNum)!.ok++
    epStats.get(epNum)!.total++

    await sleep(100)
  }

  console.log('\n── EP별 결과 ──────────────────────────────────')
  console.log('EP   | 성공 | 실패 | 합계')
  console.log('-----|------|------|------')
  for (const ep of episodes) {
    const s = epStats.get(ep.episode_num)!
    const fail = s.total - s.ok
    console.log(`EP${String(ep.episode_num).padStart(2,'0')} |   ${String(s.ok).padStart(2)} |   ${String(fail).padStart(2)} |   ${String(s.total).padStart(2)}`)
  }
  console.log(`\n완료: ${okCount}✅  실패: 0  (총 ${toProcess.length}건 처리)`)

  const sample = toProcess
    .filter((_, i) => i === 0 || i === Math.floor(toProcess.length / 2) || i === toProcess.length - 1)
    .slice(0, 3)

  console.log('\n── URL 200 검증 (샘플 3개) ────────────────────')
  for (const b of sample) {
    const epNum = epNumMap.get(b.episode_id) ?? 0
    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/bubbles/ep${String(epNum).padStart(2,'0')}/b_${b.id}.mp3`
    const res = await fetch(url, { method: 'HEAD' })
    const icon = res.status === 200 ? '✅' : '❌'
    console.log(`  ${icon} HTTP ${res.status} — EP${String(epNum).padStart(2,'0')} id=${b.id}`)
    console.log(`     ${url}`)
  }
}

main().catch(e => { console.error('\n[예외]', e); process.exit(1) })
