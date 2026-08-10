/**
 * 할머니 보이스 스타일 지시문 샘플 3종
 * 보이스: Achernar (낮고 묵직한 여성, 후보 중 할머니 톤 최근접)
 * 저장: C:\Users\msj15\AppData\Local\Temp\voice-samples\
 *
 * 규칙:
 *  - 기존 파일 있으면 SKIP
 *  - 429 즉시 process.exit(1) — 재시도 없음
 *  - RPD 리셋: 태평양 서머타임 자정 = 한국 오후 16:00 KST
 *    ※ retryAfter 헤더 값은 RPD에서 신뢰 불가
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const GEMINI_KEY = process.env.GEMINI_API_KEY!
const MODEL      = 'gemini-2.5-flash-preview-tts'
const OUT_DIR    = 'C:\\Users\\msj15\\AppData\\Local\\Temp\\voice-samples'
const VOICE      = 'Achernar'

const TEXT = '학생, 이거 하나 먹어 봐. 싸게 주는 거야.'

// 스타일 지시문 3가지 변형
// 형식: "<지시문>: <대사>" — 콜론으로 구분해 모델이 지시문을 읽지 않도록 유도
const VARIANTS: { key: string; directive: string }[] = [
  {
    key:       'a_시장할머니',
    directive: '나이 든 시장 할머니가 천천히 말하듯이',
  },
  {
    key:       'b_70대다정',
    directive: '70대 할머니가 다정하고 느릿하게',
  },
  {
    key:       'c_쉰목소리',
    directive: '목소리가 살짝 쉰 노인 여성이 정겹게',
  },
]

function pcmToWav(pcm: Buffer, sr = 24000, ch = 1, bd = 16): Buffer {
  const h = Buffer.alloc(44), dl = pcm.length
  h.write('RIFF',0); h.writeUInt32LE(dl+36,4); h.write('WAVE',8); h.write('fmt ',12)
  h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(ch,22)
  h.writeUInt32LE(sr,24); h.writeUInt32LE(sr*ch*bd/8,28); h.writeUInt16LE(ch*bd/8,32)
  h.writeUInt16LE(bd,34); h.write('data',36); h.writeUInt32LE(dl,40)
  return Buffer.concat([h, pcm])
}

async function generate(promptText: string): Promise<Buffer> {
  const body = {
    contents: [{ parts: [{ text: promptText }] }],
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
    const rawText = await res.text()
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    console.error(`\n[${res.status}] 실패 — ${now}`)
    console.error(`응답 원문:\n${rawText}`)
    if (res.status === 429) {
      console.error(`\n[중단] 재시도 금지. RPD 리셋: 한국 오후 16:00 KST (retryAfter 헤더 신뢰 불가)`)
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
  const existing = new Set(fs.readdirSync(OUT_DIR))
  const nowKST = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  console.log(`보이스: ${VOICE}`)
  console.log(`문장:   "${TEXT}"`)
  console.log(`저장:   ${OUT_DIR}`)
  console.log(`실행:   ${nowKST}\n`)

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
  let generated = 0

  for (let i = 0; i < VARIANTS.length; i++) {
    const { key, directive } = VARIANTS[i]
    const fname = `${VOICE}_${key}.wav`
    const fpath = path.join(OUT_DIR, fname)

    if (existing.has(fname)) {
      console.log(`[${i+1}/${VARIANTS.length}] ${key} — SKIP (이미 존재)`)
      continue
    }

    // 스타일 지시문 형식: "<지시문>: <대사>"
    // 콜론 이후 대사만 TTS가 읽도록 유도 (지시문이 읽히면 들어서 확인 필요)
    const promptText = `${directive}: ${TEXT}`
    console.log(`[${i+1}/${VARIANTS.length}] ${key}`)
    console.log(`  프롬프트: "${promptText}"`)
    process.stdout.write(`  생성 중... `)

    const t0 = Date.now()
    const wav = await generate(promptText)   // 429면 여기서 process.exit(1)
    fs.writeFileSync(fpath, wav)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`${elapsed}s · ${wav.length} bytes → ${fname}`)
    generated++

    if (i < VARIANTS.length - 1) await delay(6500)
  }

  console.log(`\n=== 완료: ${generated}건 생성 ===`)
  console.log(`\n주의: 각 파일을 들어 보고 지시문이 음성에 읽히는지 확인하세요.`)
  console.log(`     읽힌다면 지시문 형식 조정 필요 (예: 각도 괄호 <> 사용 등)`)
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.wav')).sort()
  for (const f of files) console.log(`  ${OUT_DIR}\\${f}`)
}

main().catch(e => { console.error(e); process.exit(1) })
