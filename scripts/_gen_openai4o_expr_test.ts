/**
 * 표현 음성 시험 생성 — OpenAI gpt-4o-mini-tts (coral / shimmer / sage / nova)
 *
 * ⚠️ 로컬 파일만 씁니다. DB(kp_expressions)·Supabase Storage 갱신 없음.
 *
 * 출력: audio-test/openai4o/{voice}/{slug}-{part}.mp3
 *   part: pattern, pattern-slow, ex1
 *
 * 실행: npx tsx scripts/_gen_openai4o_expr_test.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import OpenAI from 'openai'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MODEL  = 'gpt-4o-mini-tts'
const VOICES = ['coral', 'shimmer', 'sage', 'nova'] as const
const OUT    = path.resolve(process.cwd(), 'audio-test', 'openai4o')

const INSTR_BASE = 'Speak like a female Korean announcer, clear and articulate, slightly bright tone.'
const INSTR_SLOW = `${INSTR_BASE} Speak slowly.`

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ITEMS = [
  { file: 'juseyo-pattern',       text: '주세요',        instructions: INSTR_BASE },
  { file: 'juseyo-pattern-slow',  text: '주세요',        instructions: INSTR_SLOW },
  { file: 'juseyo-ex1',           text: '물 주세요.',    instructions: INSTR_BASE },
  { file: 'mwoyeyo-pattern',      text: '뭐예요?',       instructions: INSTR_BASE },
  { file: 'mwoyeyo-pattern-slow', text: '뭐예요?',       instructions: INSTR_SLOW },
  { file: 'mwoyeyo-ex1',          text: '이거 뭐예요?',  instructions: INSTR_BASE },
]

async function main() {
  console.log(`\n=== 표현 음성 시험 생성 (gpt-4o-mini-tts) ===`)
  console.log(`엔진: OpenAI  |  모델: ${MODEL}  |  키: OPENAI_API_KEY(…${(process.env.OPENAI_API_KEY ?? '').slice(-4)})`)
  console.log(`보이스: ${VOICES.join(', ')}  |  보이스당 ${ITEMS.length}파일 = 총 ${VOICES.length * ITEMS.length}파일`)
  console.log(`instructions(기본): ${INSTR_BASE}`)
  console.log(`instructions(slow): ${INSTR_SLOW}`)
  console.log(`출력: ${OUT}`)
  console.log(`DB·Storage 갱신: 없음 (로컬 파일만)\n`)

  let made = 0, chars = 0
  const manifest: Array<{ voice: string; file: string; text: string; slow: boolean; bytes: number }> = []

  for (const voice of VOICES) {
    const dir = path.join(OUT, voice)
    fs.mkdirSync(dir, { recursive: true })
    console.log(`▶ ${voice}`)
    for (const it of ITEMS) {
      const t0 = Date.now()
      const res = await openai.audio.speech.create({
        model: MODEL,
        voice,
        input: it.text,
        instructions: it.instructions,
        response_format: 'mp3',
      })
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length === 0) throw new Error(`0바이트: ${voice}/${it.file}`)
      fs.writeFileSync(path.join(dir, `${it.file}.mp3`), buf)
      made++; chars += it.text.length
      manifest.push({ voice, file: it.file, text: it.text, slow: it.instructions === INSTR_SLOW, bytes: buf.length })
      console.log(`  ${it.file.padEnd(22)} "${it.text}"${it.instructions === INSTR_SLOW ? ' [slow]' : '       '}  ${(buf.length / 1024).toFixed(1)}KB  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
    }
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  const cost = chars * (12 / 1_000_000)
  console.log(`\n생성 ${made}파일 · 문자수 ${chars}자 → 약 $${cost.toFixed(5)} (gpt-4o-mini-tts 입력 텍스트 $12/1M자 기준 추정)`)
  console.log(`DB·Storage 갱신: 0건`)
}

main().catch(e => { console.error('⛔', e); process.exit(1) })
