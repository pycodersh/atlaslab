/**
 * K-PATTO 대사 음성 생성 — Gemini (엄격 모드: 재시도 경로 없음)
 *
 * 엔진: Gemini gemini-2.5-flash-preview-tts  (OpenAI 아님 — openai 패키지 import 없음)
 * 목소리: EP01~60과 동일 VOICE_MAP
 *
 * ⚠️ 중단 규칙 (최우선)
 *   - 어떤 에러든 즉시 중단. 재시도 없음. 429·500·finishReason!=STOP 전부 포함.
 *   - Storage 업로드 실패, DB 갱신 실패, 0바이트/손상 파일도 즉시 중단.
 *   - 생성 루프에 try/catch-continue 없음. 실패하면 프로세스가 끝난다.
 *   - 미등록 화자만 예외: 폴백 없이 경고 후 skip (에러 아님).
 *
 * 갱신: kp_dialogues.audio_url/audio_hash + kp_bubbles.audio_url
 *       버블은 .select()로 실제 갱신 행 수를 확인하고, 0행이면 중단.
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio-gemini-strict.ts --ep 29,46,47,48,60
 *   npx tsx scripts/generate-kpatto-audio-gemini-strict.ts --ep 29,46 --dry-run
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const MODEL      = 'gemini-2.5-flash-preview-tts'
const GEMINI_KEY = process.env.GEMINI_API_KEY!
const BUCKET     = 'audio'
const DELAY_MS   = 7000

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const EPS = (() => {
  const i = argv.indexOf('--ep')
  if (i < 0 || !argv[i + 1]) { console.error('Usage: --ep 29,46,47,48,60'); process.exit(1) }
  return argv[i + 1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
})()

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ── EP01~60과 동일한 화자 → 보이스 매핑 ──────────────────────────────────────
const VOICE_MAP: Record<string, string> = {
  emma:        'Kore',
  jisu:        'Zephyr',
  jisoo:       'Zephyr',
  minjun:      'Umbriel',
  sophie:      'Aoede',
  staff:       'Zephyr',    직원: 'Zephyr',
  stranger:    'Kore',      행인: 'Kore',
  doctor:      'Rasalgethi', 의사: 'Rasalgethi',
  pharmacist:  'Algieba',   약사: 'Algieba',
  간호사:      'Vindemiatrix',
  merchant:    'Charon',    상인: 'Charon',
  professor:   'Charon',    교수님: 'Charon',
  driver:      'Puck',      기사: 'Puck',
  clerk:       'Zephyr',
  receptionist: 'Vindemiatrix',
  announcement: 'Iapetus',
  students:    'Kore',
  student:     'Kore',
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function dialoguePrompt(text: string): string {
  return `자연스럽게, 받침을 분명하게 발음해줘: ${text}`
}

function contentHash(text: string, voice: string, prompt: string): string {
  return createHash('sha256').update(text + '|' + voice + '|' + prompt, 'utf8').digest('hex').slice(0, 16)
}

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
  header.writeUInt16LE(bitDepth, 34)
  header.write('data', 36);      header.writeUInt32LE(dataLen, 40)
  return Buffer.concat([header, pcm])
}

function wavSeconds(buf: Buffer): number {
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') return 0
  return buf.readUInt32LE(40) / (buf.readUInt32LE(24) * buf.readUInt16LE(22) * (buf.readUInt16LE(34) / 8))
}

// ── Gemini TTS — 재시도 경로 없음. 무엇이든 어긋나면 throw. ──────────────────
let API_CALLS = 0

async function tts(prompt: string, voice: string): Promise<Buffer> {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }

  API_CALLS++
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status} ${res.statusText}\n응답 원문: ${await res.text()}`)
  }

  const json = await res.json() as any
  const candidate = json?.candidates?.[0]
  const finish = candidate?.finishReason

  if (finish && finish !== 'STOP') {
    throw new Error(`Gemini finishReason=${finish} (STOP 아님)\n응답 원문: ${JSON.stringify(json).slice(0, 1500)}`)
  }

  const part = candidate?.content?.parts?.[0]?.inlineData
  if (!part?.data) {
    throw new Error(`Gemini 오디오 데이터 없음 (finishReason=${finish ?? 'none'})\n응답 원문: ${JSON.stringify(json).slice(0, 1500)}`)
  }

  const raw = Buffer.from(part.data, 'base64')
  if (raw.length === 0) throw new Error('Gemini 응답 0바이트')

  const mime = (part.mimeType ?? '') as string
  const wav = mime.includes('wav') || mime.includes('wave') ? raw : pcmToWav(raw)
  if (wav.length <= 44) throw new Error(`오디오 본문 없음 (${wav.length}B)`)
  return wav
}

async function upload(storagePath: string, buf: Buffer): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, { contentType: 'audio/wav', upsert: true })
  if (error) throw new Error(`Storage 업로드 실패 [${storagePath}]: ${error.message}`)
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

/** kp_dialogues + kp_bubbles 갱신. 버블 갱신 행 수를 .select()로 확인, 0행이면 throw. */
async function updateBoth(dialogueId: number, epNum: number, textKo: string, url: string, hash: string): Promise<number> {
  const { error: dErr } = await sb
    .from('kp_dialogues').update({ audio_url: url, audio_hash: hash }).eq('id', dialogueId)
  if (dErr) throw new Error(`kp_dialogues 갱신 실패 (id=${dialogueId}): ${dErr.message}`)

  const { data: rows, error: bErr } = await sb
    .from('kp_bubbles').update({ audio_url: url })
    .eq('episode_id', epNum).eq('korean', textKo).select('id')
  if (bErr) throw new Error(`kp_bubbles 갱신 실패 (ep=${epNum}, id=${dialogueId}): ${bErr.message}`)
  if (!rows || rows.length === 0) {
    throw new Error(`kp_bubbles 갱신 0행 — ep=${epNum} dialogue_id=${dialogueId} korean="${textKo}"`)
  }
  return rows.length
}

// ── 메인 ──────────────────────────────────────────────────────────────────────
type Todo = { id: number; episode_id: number; order_num: number; speaker: string; text_ko: string }

async function main() {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY 없음')

  const { data: dlg, error } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url')
    .in('episode_id', EPS).order('episode_id').order('order_num')
  if (error) throw new Error(`DB 조회 실패: ${error.message}`)

  const all = dlg ?? []
  const todo: Todo[] = all.filter(d => !d.audio_url) as Todo[]

  console.log(`\n=== K-PATTO 대사 음성 생성 (엄격 모드) ===`)
  console.log(`엔진: Gemini  |  모델: ${MODEL}  |  키: GEMINI_API_KEY(…${GEMINI_KEY.slice(-4)})`)
  console.log(`대상 화: EP${EPS.join(', EP')}  |  딜레이: ${DELAY_MS / 1000}초`)
  console.log(`중단 규칙: 어떤 에러든 즉시 중단, 재시도 없음 (429·500·finishReason!=STOP 포함)`)
  console.log(`표현: 제외 (대사만 생성)\n`)

  console.log('EP | 대사총 | 생성대상 | skip')
  for (const ep of EPS) {
    const d = all.filter(x => x.episode_id === ep)
    const t = d.filter(x => !x.audio_url)
    console.log(`${ep} | ${String(d.length).padStart(6)} | ${String(t.length).padStart(8)} | ${String(d.length - t.length).padStart(4)}`)
  }
  console.log(`합계: ${todo.length}건\n`)

  // 화자 매핑 점검 — 미등록 화자는 폴백 없이 skip
  const skipped: Todo[] = []
  const work: Array<Todo & { voice: string }> = []
  for (const d of todo) {
    const voice = VOICE_MAP[d.speaker.trim()]
    if (!voice) {
      console.warn(`⚠️ SKIP — VOICE_MAP 미등록 화자 "${d.speaker}" (EP${d.episode_id} id=${d.id}): ${d.text_ko}`)
      skipped.push(d)
      continue
    }
    work.push({ ...d, voice })
  }
  const voices: Record<string, number> = {}
  for (const w of work) voices[`${w.speaker}(${w.voice})`] = (voices[`${w.speaker}(${w.voice})`] ?? 0) + 1
  console.log(`화자 매핑: ${Object.entries(voices).map(([k, v]) => `${k}=${v}건`).join(', ')}`)
  console.log(`실제 생성: ${work.length}건  skip(미등록 화자): ${skipped.length}건\n`)

  if (DRY_RUN) { console.log('--dry-run: 호출하지 않고 종료'); return }

  const done: Array<{ ep: number; id: number; url: string; sec: number; bytes: number; bubbleRows: number }> = []
  let lastOk: { ep: number; id: number; text: string } | null = null
  const t0 = Date.now()

  for (let i = 0; i < work.length; i++) {
    const d = work[i]
    const epLabel = `EP${String(d.episode_id).padStart(2, '0')}`
    const label = `[${i + 1}/${work.length}] ${epLabel} id=${d.id} ${d.speaker}(${d.voice})`
    process.stdout.write(`${label} "${d.text_ko.slice(0, 20)}…" `)

    if (i > 0) await sleep(DELAY_MS)

    try {
      const prompt = dialoguePrompt(d.text_ko)
      const hash   = contentHash(d.text_ko, d.voice, prompt)
      const wav    = await tts(prompt, d.voice)
      const sec    = wavSeconds(wav)
      const url    = await upload(`dialogues/ep${String(d.episode_id).padStart(2, '0')}/${d.id}.wav`, wav)
      const rows   = await updateBoth(d.id, d.episode_id, d.text_ko, url, hash)

      done.push({ ep: d.episode_id, id: d.id, url, sec, bytes: wav.length, bubbleRows: rows })
      lastOk = { ep: d.episode_id, id: d.id, text: d.text_ko }
      console.log(`· ${wav.length.toLocaleString()}B · ${sec.toFixed(2)}s · bubble ${rows}행 · OK`)
    } catch (e: any) {
      // 재시도·continue 없음. 보고 후 종료.
      console.log(`· ❌`)
      console.error(`\n${'━'.repeat(70)}`)
      console.error(`[중단] 재시도 없이 즉시 종료합니다.`)
      console.error(`${'━'.repeat(70)}`)
      console.error(`마지막 성공: ${lastOk ? `EP${lastOk.ep} id=${lastOk.id} "${lastOk.text}"` : '없음'}`)
      console.error(`실패 항목:   ${epLabel} id=${d.id} [${d.speaker}/${d.voice}]`)
      console.error(`대사 전문:   ${d.text_ko}`)
      console.error(`오류 전문:`)
      console.error(e?.stack ?? String(e))
      console.error(`\n성공 건수:   ${done.length}/${work.length}`)
      console.error(`Gemini 호출: ${API_CALLS}회 (이번 실행)`)
      const byEp: Record<number, number> = {}
      for (const r of done) byEp[r.ep] = (byEp[r.ep] ?? 0) + 1
      console.error(`화별 성공:   ${Object.entries(byEp).map(([k, v]) => `EP${k}:${v}`).join(', ') || '없음'}`)
      console.error(`남은 건:     ${work.length - done.length}건 — 같은 명령으로 재실행하면 이어서 진행됩니다.`)
      fs.writeFileSync(
        path.resolve(process.cwd(), 'scripts', 'gemini-strict-abort.json'),
        JSON.stringify({ lastOk, failed: { ...d }, error: String(e?.message ?? e), done: done.length, apiCalls: API_CALLS }, null, 2)
      )
      process.exit(1)
    }
  }

  // ── 요약 ────────────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`생성 완료: ${done.length}/${work.length}건 · 경과 ${((Date.now() - t0) / 60000).toFixed(1)}분`)
  console.log(`Gemini 호출: ${API_CALLS}회 (재시도 없음 = 대상 건수와 동일)`)
  const byEp: Record<number, number> = {}
  for (const r of done) byEp[r.ep] = (byEp[r.ep] ?? 0) + 1
  console.log(`화별: ${Object.entries(byEp).map(([k, v]) => `EP${k}:${v}건`).join(', ')}`)
  console.log(`버블 갱신: ${done.reduce((s, r) => s + r.bubbleRows, 0)}행`)
  const short = done.filter(r => r.sec < 1)
  console.log(`1초 미만: ${short.length}건${short.length ? ' — ' + short.map(r => `id=${r.id}(${r.sec.toFixed(2)}s)`).join(', ') : ''}`)
  console.log(`0바이트: ${done.filter(r => r.bytes === 0).length}건`)
  if (skipped.length) console.log(`미등록 화자 skip: ${skipped.length}건 — ${skipped.map(s => `id=${s.id}(${s.speaker})`).join(', ')}`)
}

main().catch(e => {
  console.error('\n⛔ [중단]', e?.stack ?? e)
  process.exit(1)
})
