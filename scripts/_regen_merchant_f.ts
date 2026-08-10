/**
 * merchant_f 4건 --force 재생성
 * ids: 10397(EP03), 10435·10438·10440(EP07)
 * 보이스: Achernar  프롬프트: "나이 든 시장 할머니가 천천히 말하듯이: {text}"
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const GEMINI_KEY   = process.env.GEMINI_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'audio'
const MODEL        = 'gemini-2.5-flash-preview-tts'
const VOICE        = 'Achernar'
const DELAY_MS     = 6500

const IDS = [10397, 10435, 10438, 10440]

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

function dialoguePrompt(text: string): string {
  return `나이 든 시장 할머니가 천천히 말하듯이: ${text}`
}
function contentHash(text: string, voice: string, prompt: string): string {
  return createHash('sha256').update(text + '|' + voice + '|' + prompt, 'utf8').digest('hex').slice(0, 16)
}
function pcmToWav(pcm: Buffer, sr = 24000, ch = 1, bd = 16): Buffer {
  const h = Buffer.alloc(44), dl = pcm.length
  h.write('RIFF',0); h.writeUInt32LE(dl+36,4); h.write('WAVE',8); h.write('fmt ',12)
  h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(ch,22)
  h.writeUInt32LE(sr,24); h.writeUInt32LE(sr*ch*bd/8,28); h.writeUInt16LE(ch*bd/8,32)
  h.writeUInt16LE(bd,34); h.write('data',36); h.writeUInt32LE(dl,40)
  return Buffer.concat([h, pcm])
}

async function generate(text: string): Promise<Buffer> {
  const prompt = dialoguePrompt(text)
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  if (!res.ok) {
    const raw = await res.text()
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    console.error(`\n[${res.status}] 실패 — ${now}`)
    console.error(`응답 원문:\n${raw}`)
    if (res.status === 429) {
      console.error('\n[중단] RPD 한도. 재시도 금지. 리셋: 한국 오후 16:00 KST')
      process.exit(1)
    }
    throw new Error(`HTTP ${res.status}`)
  }
  const json = await res.json() as any
  const part = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!part?.data) throw new Error(`no audio: ${json?.candidates?.[0]?.finishReason}`)
  const raw2 = Buffer.from(part.data, 'base64')
  return (part.mimeType ?? '').includes('wav') ? raw2 : pcmToWav(raw2)
}

async function main() {
  const { data: rows } = await sb.from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, audio_hash')
    .in('id', IDS).order('id')
  if (!rows || rows.length === 0) { console.error('레코드 없음'); process.exit(1) }

  console.log(`보이스: ${VOICE}`)
  console.log(`스타일: "나이 든 시장 할머니가 천천히 말하듯이: {text}"\n`)

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
  let ok = 0

  for (let i = 0; i < rows.length; i++) {
    const d = rows[i]
    const prompt = dialoguePrompt(d.text_ko)
    const newHash = contentHash(d.text_ko, VOICE, prompt)
    const ep = String(d.episode_id).padStart(2, '0')

    console.log(`[${i+1}/${rows.length}] EP${ep} id=${d.id} [${d.speaker}]`)
    console.log(`  대사:  "${d.text_ko}"`)
    console.log(`  hash:  ${d.audio_hash ?? 'null'} → ${newHash}`)
    process.stdout.write(`  생성 중... `)

    const t0 = Date.now()
    const wav = await generate(d.text_ko)  // 429 → process.exit(1)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

    const storagePath = `dialogues/ep${ep}/${d.id}.wav`
    const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, wav, { contentType: 'audio/wav', upsert: true })
    if (upErr) { console.error(`업로드 실패: ${upErr.message}`); process.exit(1) }
    const url = sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl

    await sb.from('kp_dialogues').update({ audio_url: url, audio_hash: newHash }).eq('id', d.id)
    await sb.from('kp_bubbles').update({ audio_url: url }).eq('episode_id', d.episode_id).eq('korean', d.text_ko)

    console.log(`${elapsed}s · ${wav.length} bytes`)
    console.log(`  → ${url}`)
    ok++

    if (i < rows.length - 1) await delay(DELAY_MS)
  }

  console.log(`\n=== 완료: ${ok}/${rows.length}건 ===`)
  console.log(`\n▶ 재생 경로 (Supabase Storage Public URL):`)
  const { data: final } = await sb.from('kp_dialogues').select('id, text_ko, audio_url').in('id', IDS).order('id')
  for (const r of final ?? []) console.log(`  id=${r.id} "${r.text_ko}"\n    ${r.audio_url}`)
}

main().catch(e => { console.error(e); process.exit(1) })
