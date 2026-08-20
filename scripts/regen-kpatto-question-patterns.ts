/**
 * 의문형 패턴 음성 재생성 — 끝 억양 올림
 *
 * 대상: 패턴이 물음표로 끝나는 표현의 pattern.mp3 만. 예문(ex1~ex3)은 건드리지 않는다.
 * 모델: gpt-4o-mini-tts / sage, 경로 동일(expressions/{slug}/pattern.mp3) → URL 불변
 *
 * ⚠️ 쓰기 범위
 *   - Storage: expressions/{slug}/pattern.mp3 만 덮어씀
 *   - DB: 쓰기 없음 (경로가 같아 audio_urls 갱신 불필요, audio_url·audio_hash 무관)
 *   - 덮어쓰기 전 기존 파일을 audio-backup/expr-pattern-preq/{slug}/pattern.mp3 로 백업
 *
 * ⚠️ 중단: API 에러는 즉시 중단·재시도 금지.
 *          길이 기준 미달만 예외적으로 최대 2회 재생성(기존 규칙 유지).
 *
 * 사용: npx tsx scripts/regen-kpatto-question-patterns.ts [--dry-run] [--slug a,b]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const MODEL  = 'gpt-4o-mini-tts'
const VOICE  = 'sage'
const BUCKET = 'audio'
const DELAY_MS = 300
const BACKUP_DIR = path.resolve(process.cwd(), 'audio-backup', 'expr-pattern-preq')

const INSTR_QUESTION = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner. This is a question — raise the pitch clearly at the end.'

// 길이 기준 (기존 규칙 유지)
const SHORT_LO = 1.5, SHORT_HI = 2.5, SHORT_MID = 2.0
const MIN_SEC = 1.0
const MAX_LEN_RETRY = 2

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const ONLY = (() => { const i = argv.indexOf('--slug'); return i >= 0 ? (argv[i + 1] ?? '').split(',').filter(Boolean) : [] })()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** 물결·앞뒤 하이픈 제거, 문장부호 유지 */
function patternRaw(korean: string): string {
  return korean.split('/')[0].replace(/~/g, '').replace(/^-+|-+$/g, '').replace(/\s+/g, ' ').trim()
}
/** 실제 TTS 입력 (기존 생성과 동일하게 문장부호 제거) */
function patternTts(korean: string): string {
  return patternRaw(korean).replace(/[.!?]$/, '').trim()
}

// ── MP3 길이 ──────────────────────────────────────────────────────────────────
const B1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
const B2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
const R1 = [44100,48000,32000], R2 = [22050,24000,16000], R25 = [11025,12000,8000]

function mp3Seconds(buf: Buffer): number {
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10) {
    i = 10 + (((buf[6]&0x7f)<<21)|((buf[7]&0x7f)<<14)|((buf[8]&0x7f)<<7)|(buf[9]&0x7f))
  }
  let sec = 0
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i+1] & 0xe0) !== 0xe0) { i++; continue }
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

/** API 에러는 재시도 없이 그대로 throw */
async function callTTS(text: string): Promise<Buffer> {
  const res = await openai.audio.speech.create({
    model: MODEL, voice: VOICE, input: text, instructions: INSTR_QUESTION, response_format: 'mp3',
  })
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length === 0) throw new Error('TTS 응답 0바이트')
  return buf
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 없음')

  const all: any[] = []
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from('kp_expressions')
      .select('id, slug, first_episode, korean, audio_urls')
      .order('first_episode').order('id').range(f, f + 999)
    if (error) throw new Error(`DB 조회 실패: ${error.message}`)
    all.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }

  let targets = all.filter(e => patternRaw(e.korean).endsWith('?') && e.audio_urls?.pattern)
  if (ONLY.length) targets = targets.filter(e => ONLY.includes(e.slug))

  console.log(`\n=== 의문형 패턴 음성 재생성 ===`)
  console.log(`엔진: OpenAI  |  모델: ${MODEL}  |  목소리: ${VOICE}`)
  console.log(`키: OPENAI_API_KEY(…${(process.env.OPENAI_API_KEY ?? '').slice(-4)})`)
  console.log(`대상: 패턴이 ?로 끝나는 표현 ${targets.length}개 — pattern.mp3 만 덮어씀`)
  console.log(`instructions: ${INSTR_QUESTION}`)
  console.log(`길이 기준: 2~3자 ${SHORT_LO}~${SHORT_HI}초 / 그 외 ${MIN_SEC}초 이상, 최대 ${MAX_LEN_RETRY}회 재생성`)
  console.log(`DB 쓰기: 없음 (경로 동일 → URL 불변) · 예문 파일: 건드리지 않음`)
  console.log(`중단: API 에러 즉시 중단, 재시도 금지\n`)

  if (DRY_RUN) {
    for (const e of targets) console.log(`  ${e.slug.padEnd(28)} "${e.korean}" → TTS "${patternTts(e.korean)}"`)
    console.log('\n--dry-run: 호출하지 않고 종료')
    return
  }

  // ── 백업 ────────────────────────────────────────────────────────────────────
  console.log(`[0] 기존 pattern 파일 백업 → ${BACKUP_DIR}`)
  let backed = 0
  for (const e of targets) {
    const dir = path.join(BACKUP_DIR, e.slug)
    fs.mkdirSync(dir, { recursive: true })
    const dest = path.join(dir, 'pattern.mp3')
    if (fs.existsSync(dest)) { backed++; continue }
    const res = await fetch(`${e.audio_urls.pattern}?bk=${Date.now()}`)
    if (!res.ok) throw new Error(`백업 실패 [${e.slug}]: HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0) throw new Error(`백업 실패 [${e.slug}]: 0바이트`)
    fs.writeFileSync(dest, buf)
    backed++
  }
  console.log(`  ✓ ${backed}파일 백업 완료\n`)

  // ── 재생성 ──────────────────────────────────────────────────────────────────
  type R = { slug: string; ep: number; text: string; chars: number; sec: number; bytes: number; tries: number; inRange: boolean }
  const results: R[] = []
  const outOfRange: R[] = []
  let lastOk = ''
  const t0 = Date.now()

  for (let i = 0; i < targets.length; i++) {
    const e = targets[i]
    const text = patternTts(e.korean)
    const chars = text.replace(/\s/g, '').length
    const isShort = chars >= 2 && chars <= 3
    const lo = isShort ? SHORT_LO : MIN_SEC
    const hi = isShort ? SHORT_HI : Infinity
    const mid = isShort ? SHORT_MID : MIN_SEC

    process.stdout.write(`[${String(i + 1).padStart(2)}/${targets.length}] ep${String(e.first_episode).padStart(2)} ${e.slug.padEnd(28)} "${text}" `)

    let best: { buf: Buffer; sec: number } | null = null
    let tries = 0
    try {
      for (let t = 0; t <= MAX_LEN_RETRY; t++) {
        if (t > 0) await sleep(DELAY_MS)
        tries++
        const buf = await callTTS(text)
        const sec = mp3Seconds(buf)
        // 범위에 들면 그 결과를 그대로 채택한다.
        // (mid 기준 최근접만 쓰면 상한이 Infinity인 긴 패턴에서 짧은 쪽이 뽑히는 문제가 생긴다)
        if (sec >= lo && sec <= hi) { best = { buf, sec }; break }
        if (!best || Math.abs(sec - mid) < Math.abs(best.sec - mid)) best = { buf, sec }
      }
    } catch (err: any) {
      console.log('❌')
      console.error(`\n${'━'.repeat(70)}`)
      console.error(`[중단] API 에러 — 재시도 없이 즉시 종료합니다.`)
      console.error(`${'━'.repeat(70)}`)
      console.error(`마지막 성공: ${lastOk || '없음'}`)
      console.error(`실패 항목:   ${e.slug} (id=${e.id}) "${text}"`)
      console.error(`오류 전문:`)
      console.error(err?.stack ?? String(err))
      console.error(`\n성공 건수:   ${results.length}/${targets.length}`)
      process.exit(1)
    }

    const inRange = best!.sec >= lo && best!.sec <= hi
    const storagePath = `expressions/${e.slug}/pattern.mp3`
    const { error: upErr } = await sb.storage.from(BUCKET)
      .upload(storagePath, best!.buf, { contentType: 'audio/mpeg', upsert: true })
    if (upErr) {
      console.log('❌')
      console.error(`\n[중단] Storage 업로드 실패 [${storagePath}]: ${upErr.message}`)
      console.error(`마지막 성공: ${lastOk || '없음'}  ·  성공 건수: ${results.length}/${targets.length}`)
      process.exit(1)
    }

    const rec: R = { slug: e.slug, ep: e.first_episode, text, chars, sec: best!.sec, bytes: best!.buf.length, tries, inRange }
    results.push(rec)
    if (!inRange) outOfRange.push(rec)
    lastOk = `${e.slug} (${best!.sec.toFixed(2)}s)`
    console.log(`${(best!.buf.length / 1024).toFixed(1)}KB ${best!.sec.toFixed(2)}s${tries > 1 ? ` (${tries}회)` : ''}${inRange ? '' : ' ✗범위밖'}`)

    if (i < targets.length - 1) await sleep(DELAY_MS)
  }

  // ── 요약 ────────────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`재생성 완료: ${results.length}/${targets.length}건 · 경과 ${((Date.now() - t0) / 60000).toFixed(1)}분`)
  console.log(`API 호출: ${results.reduce((s, r) => s + r.tries, 0)}회 (길이 재생성 포함)`)
  console.log(`1초 미만: ${results.filter(r => r.sec < 1).length}건`)
  console.log(`0바이트: ${results.filter(r => r.bytes === 0).length}건`)
  const shorts = results.filter(r => r.chars >= 2 && r.chars <= 3)
  console.log(`2~3자 패턴: ${shorts.length}개 중 범위내 ${shorts.filter(r => r.inRange).length}개`)
  if (outOfRange.length) {
    console.log(`\n=== 범위 밖 ${outOfRange.length}건 ===`)
    for (const r of outOfRange) console.log(`  ep${r.ep} ${r.slug} "${r.text}" ${r.chars}자 ${r.sec.toFixed(2)}s (${r.tries}회)`)
  }
  fs.writeFileSync(
    path.resolve(process.cwd(), 'scripts', 'question-pattern-report.json'),
    JSON.stringify({ count: results.length, outOfRange, results }, null, 2)
  )
  console.log(`\n리포트 → scripts/question-pattern-report.json`)
  console.log(`DB 쓰기: 0건 · 예문 파일 변경: 0건`)
}

main().catch(e => { console.error('\n⛔ [중단]', e?.stack ?? e); process.exit(1) })
