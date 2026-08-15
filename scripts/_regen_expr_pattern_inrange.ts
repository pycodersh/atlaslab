/**
 * 범위(1.5~2.5초)를 벗어난 짧은 패턴만 재생성.
 * 같은 모델·목소리·instructions로 최대 N회 뽑아 목표 중앙(2.0초)에 가장 가까운 것을 채택.
 * 경로 불변(expressions/{slug}/pattern.mp3) → audio_urls URL 불변.
 *
 * 사용: npx tsx scripts/_regen_expr_pattern_inrange.ts mwoyeyo ieyo-yeyo
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const MODEL = 'gpt-4o-mini-tts'
const VOICE = 'sage'
const INSTR = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner.'
const LO = 1.5, HI = 2.5, MID = 2.0, MAX_TRY = 4

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

const B1=[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
const B2=[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
const R1=[44100,48000,32000],R2=[22050,24000,16000],R25=[11025,12000,8000]
function dur(buf: Buffer): number {
  let i = 0
  if (buf.toString('ascii',0,3)==='ID3') i = 10+(((buf[6]&0x7f)<<21)|((buf[7]&0x7f)<<14)|((buf[8]&0x7f)<<7)|(buf[9]&0x7f))
  let sec = 0
  while (i+4 <= buf.length) {
    if (buf[i]!==0xff||(buf[i+1]&0xe0)!==0xe0) { i++; continue }
    const ver=(buf[i+1]>>3)&3, layer=(buf[i+1]>>1)&3, br=(buf[i+2]>>4)&15, sr=(buf[i+2]>>2)&3, pad=(buf[i+2]>>1)&1
    if (layer!==1||ver===1||br===0||br===15||sr===3) { i++; continue }
    const isV1=ver===3, bitrate=(isV1?B1[br]:B2[br])*1000
    const rate=(ver===3?R1:ver===2?R2:R25)[sr], samples=isV1?1152:576
    const len=Math.floor((samples/8)*bitrate/rate)+pad
    if (len<=4) { i++; continue }
    sec += samples/rate; i += len
  }
  return sec
}

async function main() {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) throw new Error('slug를 인자로 넘기세요')

  const { data, error } = await sb.from('kp_expressions').select('id, slug, korean, audio_urls').in('slug', slugs)
  if (error) throw error

  for (const e of data ?? []) {
    const text = e.korean.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim()
    console.log(`\n▶ ${e.slug} — "${text}" (목표 ${LO}~${HI}초)`)

    let best: { buf: Buffer; sec: number } | null = null
    for (let t = 1; t <= MAX_TRY; t++) {
      const res = await openai.audio.speech.create({ model: MODEL, voice: VOICE, input: text, instructions: INSTR, response_format: 'mp3' })
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length === 0) throw new Error(`${e.slug}: 0바이트`)
      const sec = dur(buf)
      const inRange = sec >= LO && sec <= HI
      console.log(`  시도 ${t}: ${sec.toFixed(2)}s ${inRange ? '✓ 범위내' : sec < LO ? '✗ 빠름' : '✗ 느림'}`)
      if (!best || Math.abs(sec - MID) < Math.abs(best.sec - MID)) best = { buf, sec }
      if (inRange) break
    }
    if (!best) throw new Error(`${e.slug}: 생성 실패`)
    if (best.sec < LO || best.sec > HI) {
      throw new Error(`${e.slug}: ${MAX_TRY}회 시도했으나 범위 밖 (최선 ${best.sec.toFixed(2)}s) — 중단`)
    }

    const storagePath = `expressions/${e.slug}/pattern.mp3`
    const { error: upErr } = await sb.storage.from('audio').upload(storagePath, best.buf, { contentType: 'audio/mpeg', upsert: true })
    if (upErr) throw new Error(`업로드 실패 [${storagePath}]: ${upErr.message}`)
    console.log(`  ✅ 채택 ${best.sec.toFixed(2)}s → ${storagePath} (URL 불변, DB 갱신 불필요)`)
  }
}

main().catch(e => { console.error('\n⛔', e); process.exit(1) })
