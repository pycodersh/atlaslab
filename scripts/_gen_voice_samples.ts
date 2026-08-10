/**
 * 여성 중년~노년 보이스 샘플 생성
 * 저장: C:\Users\msj15\AppData\Local\Temp\voice-samples\
 *
 * 규칙:
 *  - 이미 파일이 있으면 skip (덮어쓰지 않음)
 *  - 429(RPD) 발생 시 임의 재시도 금지 — 응답 원문·현재 시각 출력 후 즉시 종료
 *  - RPD 리셋: 태평양 서머타임 자정 = 한국 오후 16:00 (KST)
 *    ※ retryAfter 헤더 값은 RPD에서 신뢰 불가, 16:00 KST 기준으로 판단할 것
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const GEMINI_KEY = process.env.GEMINI_API_KEY!
const MODEL      = 'gemini-2.5-flash-preview-tts'
const OUT_DIR    = 'C:\\Users\\msj15\\AppData\\Local\\Temp\\voice-samples'

const TEXT   = '학생, 이거 하나 먹어 봐. 싸게 주는 거야.'
const PROMPT = `자연스럽게, 받침을 분명하게 발음해줘: ${TEXT}`

// 주연 Kore·Zephyr·Aoede 제외, 여성 중년~노년 후보
const CANDIDATES: { voice: string; note: string }[] = [
  { voice: 'Achernar',  note: '낮고 묵직한 여성' },
  { voice: 'Erinome',   note: '차분하고 성숙한 여성' },
  { voice: 'Algenib',   note: '건조하고 나이 든 느낌' },
]

function pcmToWav(pcm: Buffer, sr = 24000, ch = 1, bd = 16): Buffer {
  const h = Buffer.alloc(44), dl = pcm.length
  h.write('RIFF',0); h.writeUInt32LE(dl+36,4); h.write('WAVE',8); h.write('fmt ',12)
  h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(ch,22)
  h.writeUInt32LE(sr,24); h.writeUInt32LE(sr*ch*bd/8,28); h.writeUInt16LE(ch*bd/8,32)
  h.writeUInt16LE(bd,34); h.write('data',36); h.writeUInt32LE(dl,40)
  return Buffer.concat([h, pcm])
}

async function generate(voice: string): Promise<Buffer> {
  const body = {
    contents: [{ parts: [{ text: PROMPT }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  if (!res.ok) {
    const rawText = await res.text()
    // 429 즉시 중단 — 재시도 금지 (실패 호출도 한도를 소비함)
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    console.error(`\n[${res.status}] ${voice} 실패 — ${now}`)
    console.error(`응답 원문:\n${rawText}`)
    if (res.status === 429) {
      console.error(`\n[중단] RPD 또는 RPM 한도 소진. 임의 재시도 금지.`)
      console.error(`RPD 리셋: 태평양 서머타임 자정 = 한국 오후 16:00 (KST)`)
      console.error(`※ retryAfter 헤더 값은 RPD에서 신뢰 불가`)
      process.exit(1)
    }
    throw new Error(`HTTP ${res.status}`)
  }
  const json = await res.json() as any
  const part = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!part?.data) throw new Error(`no audio: ${json?.candidates?.[0]?.finishReason}`)
  const raw = Buffer.from(part.data, 'base64')
  return (part.mimeType ?? '').includes('wav') ? raw : pcmToWav(raw)
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // 기존 파일 목록
  const existing = new Set(fs.readdirSync(OUT_DIR))
  const nowKST = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  console.log(`문장: "${TEXT}"`)
  console.log(`저장: ${OUT_DIR}`)
  console.log(`실행: ${nowKST}\n`)

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
  let generated = 0

  for (let i = 0; i < CANDIDATES.length; i++) {
    const { voice, note } = CANDIDATES[i]
    const idx   = String(i + 1).padStart(2, '0')
    const fname = `${idx}_${voice}.wav`
    const fpath = path.join(OUT_DIR, fname)

    if (existing.has(fname)) {
      console.log(`[${i+1}/${CANDIDATES.length}] ${voice} — SKIP (이미 존재: ${fname})`)
      continue
    }

    process.stdout.write(`[${i+1}/${CANDIDATES.length}] ${voice} — ${note} ... `)
    const t0 = Date.now()
    const wav = await generate(voice)   // 429면 여기서 process.exit(1)
    fs.writeFileSync(fpath, wav)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`${elapsed}s · ${wav.length} bytes → ${fname}`)
    generated++

    if (i < CANDIDATES.length - 1) await delay(6500)  // RPM 10 → 6.5s 간격
  }

  console.log(`\n=== 완료: ${generated}건 생성 ===`)
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.wav')).sort()
  for (const f of files) console.log(`  ${OUT_DIR}\\${f}`)
}

main().catch(e => { console.error(e); process.exit(1) })
