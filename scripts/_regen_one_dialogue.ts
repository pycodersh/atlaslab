/**
 * 단일 dialogue --force 재생성
 * 사용: npx tsx scripts/_regen_one_dialogue.ts <dialogue_id>
 * 예: npx tsx scripts/_regen_one_dialogue.ts 10453
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const DIALOGUE_ID = parseInt(process.argv[2] ?? '0')
if (!DIALOGUE_ID) { console.error('Usage: npx tsx _regen_one_dialogue.ts <id>'); process.exit(1) }

const GEMINI_KEY   = process.env.GEMINI_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'audio'
const MODEL        = 'gemini-2.5-flash-preview-tts'

const VOICE_MAP: Record<string, string> = {
  emma: 'Kore', jisu: 'Zephyr', jisoo: 'Zephyr', minjun: 'Umbriel', sophie: 'Aoede',
  stranger: 'Fenrir', merchant_f: 'Achernar',
  clerk: 'Laomedeia', staff: 'Callirrhoe', professor: 'Orus', student: 'Leda',
  announcement: 'Schedar', pharmacist: 'Algieba', doctor: 'Rasalgethi', 간호사: 'Vindemiatrix',
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

function contentHash(text: string, voice: string, prompt: string) {
  return createHash('sha256').update(text + '|' + voice + '|' + prompt, 'utf8').digest('hex').slice(0, 16)
}
function dialoguePrompt(text: string, speaker?: string): string {
  if (speaker === 'merchant_f') return `나이 든 시장 할머니가 천천히 말하듯이: ${text}`
  return `자연스럽게, 받침을 분명하게 발음해줘: ${text}`
}
function pcmToWav(pcm: Buffer, sr = 24000, ch = 1, bd = 16): Buffer {
  const h = Buffer.alloc(44), dl = pcm.length
  h.write('RIFF',0); h.writeUInt32LE(dl+36,4); h.write('WAVE',8); h.write('fmt ',12)
  h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(ch,22)
  h.writeUInt32LE(sr,24); h.writeUInt32LE(sr*ch*bd/8,28); h.writeUInt16LE(ch*bd/8,32)
  h.writeUInt16LE(bd,34); h.write('data',36); h.writeUInt32LE(dl,40)
  return Buffer.concat([h, pcm])
}

async function main() {
  const { data: d, error } = await sb.from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, audio_url, audio_hash').eq('id', DIALOGUE_ID).single()
  if (error || !d) { console.error('dialogue not found'); process.exit(1) }

  const voice = VOICE_MAP[d.speaker.trim()]
  if (!voice) { console.error(`unmapped speaker: ${d.speaker}`); process.exit(1) }

  const prompt = dialoguePrompt(d.text_ko, d.speaker)
  const hash   = contentHash(d.text_ko, voice, prompt)

  console.log(`EP${String(d.episode_id).padStart(2,'0')} id=${d.id} [${d.speaker}→${voice}] "${d.text_ko}"`)
  console.log(`  hash: ${d.audio_hash ?? 'null'} → ${hash}`)
  process.stdout.write(`  generating... `)

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  if (!res.ok) { const t = await res.text(); console.error(`Gemini ${res.status}: ${t}`); process.exit(1) }
  const json = await res.json() as any
  const part = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!part?.data) { console.error('no audio data:', json?.candidates?.[0]?.finishReason); process.exit(1) }

  const raw = Buffer.from(part.data, 'base64')
  const wav = (part.mimeType ?? '').includes('wav') ? raw : pcmToWav(raw)
  console.log(`${wav.length} bytes`)

  const storagePath = `dialogues/ep${String(d.episode_id).padStart(2,'0')}/${d.id}.wav`
  const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, wav, { contentType: 'audio/wav', upsert: true })
  if (upErr) { console.error('upload failed:', upErr.message); process.exit(1) }
  const url = sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl

  await sb.from('kp_dialogues').update({ audio_url: url, audio_hash: hash }).eq('id', d.id)
  await sb.from('kp_bubbles').update({ audio_url: url }).eq('episode_id', d.episode_id).eq('korean', d.text_ko)
  console.log(`  ✓ uploaded → ${storagePath}`)
  console.log(`  ✓ kp_dialogues + kp_bubbles updated`)
}
main().catch(e => { console.error(e); process.exit(1) })
