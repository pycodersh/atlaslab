/**
 * 표현 음성 시험 생성 — OpenAI tts-1 (nova / shimmer)
 *
 * ⚠️ 로컬 파일만 씁니다. DB(kp_expressions)·Supabase Storage 갱신 없음.
 *
 * 출력:
 *   audio-test/openai/nova/{slug}-{part}.mp3
 *   audio-test/openai/shimmer/{slug}-{part}.mp3
 *   audio-test/zephyr/{slug}-{part}.mp3   ← 기존 Gemini Zephyr 다운로드(대조군)
 *
 * 실행: npx tsx scripts/_gen_openai_expr_test.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MODEL  = 'tts-1'
const VOICES = ['nova', 'shimmer'] as const
const OUT    = path.resolve(process.cwd(), 'audio-test')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EXPRESSIONS = [
  { slug: 'juseyo',  parts: [
    { key: 'pattern', text: '주세요' },
    { key: 'ex1',     text: '물 주세요.' },
    { key: 'ex2',     text: '메뉴판 주세요.' },
    { key: 'ex3',     text: '영수증 주세요.' },
  ]},
  { slug: 'mwoyeyo', parts: [
    { key: 'pattern', text: '뭐예요?' },
    { key: 'ex1',     text: '이거 뭐예요?' },
    { key: 'ex2',     text: '저거 뭐예요?' },
    { key: 'ex3',     text: '이 음식 뭐예요?' },
  ]},
]

async function main() {
  console.log(`\n=== 표현 음성 시험 생성 ===`)
  console.log(`엔진: OpenAI  |  모델: ${MODEL}  |  키: OPENAI_API_KEY(…${(process.env.OPENAI_API_KEY ?? '').slice(-4)})`)
  console.log(`보이스: ${VOICES.join(', ')}  |  출력: ${OUT}`)
  console.log(`DB·Storage 갱신: 없음 (로컬 파일만)\n`)

  // ── DB 텍스트 일치 확인 (읽기 전용) ─────────────────────────────────────────
  const { data: rows, error } = await sb
    .from('kp_expressions').select('slug, korean, examples, audio_urls')
    .in('slug', EXPRESSIONS.map(e => e.slug))
  if (error) throw new Error(`DB 조회 실패: ${error.message}`)

  for (const e of EXPRESSIONS) {
    const row = rows?.find(r => r.slug === e.slug)
    if (!row) { console.log(`⚠️  ${e.slug}: DB에 없음 — 지정 텍스트로 진행`); continue }
    const ex = (typeof row.examples === 'string' ? JSON.parse(row.examples) : row.examples) as Array<{ ko: string }>
    const dbTexts = [row.korean.replace(/^~/, '').replace(/[.!?]$/, '').trim(), ...ex.slice(0, 3).map(x => x.ko)]
    for (let i = 0; i < 4; i++) {
      const mine = e.parts[i].text
      const db   = dbTexts[i]
      const same = i === 0 ? mine === db || `${mine}?` === `${db}?` : mine === db
      console.log(`  ${same ? '✓' : '✗'} ${e.slug}/${e.parts[i].key}: "${mine}"${same ? '' : `  ← DB: "${db}"`}`)
    }
  }

  // ── 1. OpenAI 생성 ──────────────────────────────────────────────────────────
  let made = 0, chars = 0
  for (const voice of VOICES) {
    const dir = path.join(OUT, 'openai', voice)
    fs.mkdirSync(dir, { recursive: true })
    console.log(`\n▶ ${voice}`)
    for (const e of EXPRESSIONS) {
      for (const p of e.parts) {
        const t0 = Date.now()
        const res = await openai.audio.speech.create({
          model: MODEL, voice, input: p.text, response_format: 'mp3',
        })
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length === 0) throw new Error(`0바이트: ${voice}/${e.slug}-${p.key}`)
        const file = path.join(dir, `${e.slug}-${p.key}.mp3`)
        fs.writeFileSync(file, buf)
        chars += p.text.length; made++
        console.log(`  ${(e.slug + '-' + p.key).padEnd(18)} "${p.text}"  ${(buf.length / 1024).toFixed(1)}KB  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
      }
    }
  }

  // ── 2. 기존 Zephyr 다운로드 (대조군) ────────────────────────────────────────
  const zdir = path.join(OUT, 'zephyr')
  fs.mkdirSync(zdir, { recursive: true })
  console.log(`\n▶ 기존 Zephyr(Gemini) 다운로드`)
  let dl = 0
  for (const e of EXPRESSIONS) {
    const row = rows?.find(r => r.slug === e.slug)
    const urls = (row?.audio_urls ?? {}) as Record<string, string>
    for (const p of e.parts) {
      const url = urls[p.key]
      if (!url) { console.log(`  ⚠️ ${e.slug}-${p.key}: URL 없음`); continue }
      const res = await fetch(url)
      if (!res.ok) { console.log(`  ⚠️ ${e.slug}-${p.key}: HTTP ${res.status}`); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      // Storage의 expressions/*.mp3는 실제로는 WAV 데이터다(확장자만 mp3).
      // 로컬에서는 실제 포맷대로 확장자를 붙여야 브라우저가 확실히 재생한다.
      const isWav = buf.toString('ascii', 0, 4) === 'RIFF'
      fs.writeFileSync(path.join(zdir, `${e.slug}-${p.key}.${isWav ? 'wav' : 'mp3'}`), buf)
      dl++
      console.log(`  ${(e.slug + '-' + p.key).padEnd(18)} ${(buf.length / 1024).toFixed(1)}KB  ${isWav ? 'WAV(확장자만 mp3)' : 'MP3'}`)
    }
  }

  const cost = chars * (15 / 1_000_000)
  console.log(`\n생성 ${made}파일 (OpenAI ${MODEL}) · 다운로드 ${dl}파일 (기존 Zephyr)`)
  console.log(`문자수 ${chars}자 → 약 $${cost.toFixed(5)} (tts-1 $15/1M자)`)
  console.log(`DB·Storage 갱신: 0건`)
}

main().catch(e => { console.error('⛔', e); process.exit(1) })
