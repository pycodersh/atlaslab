/**
 * K-PATTO 표현 음성 생성 — OpenAI gpt-4o-mini-tts
 *
 * 기존 Gemini Zephyr판(generate-kpatto-audio-split.ts)을 대체한다.
 * 짧은 텍스트(2~3자 패턴)에서 Gemini 발음이 뭉개지는 문제 때문에 엔진 교체.
 *
 * 모델:   gpt-4o-mini-tts  (tts-1 아님)
 * 목소리: sage
 * 속도:   instructions 파라미터로 제어 (패턴은 "Speak slowly." 추가)
 *
 * 저장:   audio/expressions/{slug}/{pattern,ex1,ex2,ex3}.mp3  ← 경로·확장자 불변
 *         → kp_expressions.audio_urls의 URL이 바뀌지 않는다
 *         → audio_url(통합 파일)·audio_hash는 건드리지 않는다
 *
 * 중단:   429(분당 제한)만 대기 후 재시도. 그 외 어떤 에러든 즉시 중단·재시도 없음.
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts               # EP01~05, 76건
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts --dry-run     # 호출 없이 대상만 출력
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts --slug juseyo # 특정 표현만
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// ── 설정 ──────────────────────────────────────────────────────────────────────
const MODEL    = 'gpt-4o-mini-tts'
const VOICE    = 'sage'
const BUCKET   = 'audio'
const EP_RANGE = [1, 2, 3, 4, 5]
const DELAY_MS = 300          // OpenAI는 일일 한도 없음 — 분당 제한 완화용 소폭 간격
const BACKUP_DIR = path.resolve(process.cwd(), 'audio-backup', 'expr-zephyr')

// 패턴 지시문: "Speak slowly." 만으로는 2~3자 패턴이 0.9~1.4초로 흔들려 목표(1.5~2.5초)를
// 못 맞춘다(프로브 결과 2/3). 음절 단위 발음을 명시한 아래 문장이 3/3 범위 내.
const INSTR_PATTERN = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner.'
const INSTR_EXAMPLE = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone.'

const argv    = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const ONLY_SLUG = (() => { const i = argv.indexOf('--slug'); return i >= 0 ? argv[i + 1] ?? '' : '' })()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** 기존 split 스크립트와 동일한 패턴 텍스트 추출 규칙 */
function patternText(korean: string): string {
  return korean.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim()
}

// ── MP3 재생 길이 ─────────────────────────────────────────────────────────────
const BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
const BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
const RATES_V1 = [44100, 48000, 32000]
const RATES_V2 = [22050, 24000, 16000]
const RATES_V25 = [11025, 12000, 8000]

/** MP3 프레임 헤더를 순회해 재생 길이(초)를 구한다. WAV면 WAV 헤더로 계산. */
function audioDuration(buf: Buffer): number {
  if (buf.length > 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
    const sampleRate = buf.readUInt32LE(24)
    const channels   = buf.readUInt16LE(22)
    const bits       = buf.readUInt16LE(34)
    const dataSize   = buf.readUInt32LE(40)
    return dataSize / (sampleRate * channels * (bits / 8))
  }

  let i = 0
  // ID3v2 태그 건너뛰기
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10) {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f)
    i = 10 + size
  }

  let seconds = 0
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) { i++; continue }
    const verBits   = (buf[i + 1] >> 3) & 0x03   // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    const layerBits = (buf[i + 1] >> 1) & 0x03   // 1=Layer III
    const brIdx     = (buf[i + 2] >> 4) & 0x0f
    const srIdx     = (buf[i + 2] >> 2) & 0x03
    const padding   = (buf[i + 2] >> 1) & 0x01
    if (layerBits !== 1 || verBits === 1 || brIdx === 0 || brIdx === 15 || srIdx === 3) { i++; continue }

    const isV1       = verBits === 3
    const bitrate    = (isV1 ? BITRATES_V1L3[brIdx] : BITRATES_V2L3[brIdx]) * 1000
    const sampleRate = (verBits === 3 ? RATES_V1 : verBits === 2 ? RATES_V2 : RATES_V25)[srIdx]
    const samples    = isV1 ? 1152 : 576
    const frameLen   = Math.floor((samples / 8) * bitrate / sampleRate) + padding
    if (frameLen <= 4) { i++; continue }

    seconds += samples / sampleRate
    i += frameLen
  }
  return seconds
}

// ── TTS 호출 (429만 재시도, 그 외 즉시 throw) ─────────────────────────────────
async function callTTS(text: string, instructions: string, label: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await openai.audio.speech.create({
        model: MODEL, voice: VOICE, input: text, instructions, response_format: 'mp3',
      })
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length === 0) throw new Error(`[${label}] TTS 응답 0바이트`)
      return buf
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status
      if (status === 429) {
        const retryAfter = Number(e?.headers?.['retry-after'] ?? e?.response?.headers?.get?.('retry-after') ?? 0)
        const waitMs = retryAfter > 0 ? retryAfter * 1000 + 500 : Math.min(5000 * attempt, 60_000)
        console.log(`\n  [429 분당 제한] ${label} — ${Math.round(waitMs / 1000)}초 대기 후 재시도 (${attempt}회차)`)
        await sleep(waitMs)
        continue
      }
      throw e   // 그 외 에러는 재시도 없이 그대로 올린다
    }
  }
}

async function upload(storagePath: string, buf: Buffer): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'audio/mpeg', upsert: true,
  })
  if (error) throw new Error(`Storage 업로드 실패 [${storagePath}]: ${error.message}`)
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

interface ExRow { id: number; slug: string; first_episode: number; korean: string; examples: unknown; audio_urls: unknown }

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 없음')

  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, slug, first_episode, korean, examples, audio_urls')
    .in('first_episode', EP_RANGE)
    .order('first_episode').order('id')
  if (error) throw new Error(`DB 조회 실패: ${error.message}`)

  let expressions = (data ?? []) as ExRow[]
  if (ONLY_SLUG) expressions = expressions.filter(e => e.slug === ONLY_SLUG)

  const total = expressions.length * 4
  console.log(`\n=== K-PATTO 표현 음성 생성 ===`)
  console.log(`엔진: OpenAI  |  모델: ${MODEL}  |  목소리: ${VOICE}`)
  console.log(`키: OPENAI_API_KEY(…${(process.env.OPENAI_API_KEY ?? '').slice(-4)})`)
  console.log(`대상: first_episode ${EP_RANGE.join(',')} → 표현 ${expressions.length}개 × 4 = ${total}건 (전건 덮어쓰기, skip 없음)`)
  console.log(`instructions(패턴): ${INSTR_PATTERN}`)
  console.log(`instructions(예문): ${INSTR_EXAMPLE}`)
  console.log(`경로: expressions/{slug}/{part}.mp3 — 확장자 불변 → audio_urls URL 불변`)
  console.log(`audio_url(통합 파일)·audio_hash: 건드리지 않음`)
  console.log(`중단 규칙: 429만 대기 후 재시도, 그 외 즉시 중단\n`)

  if (DRY_RUN) {
    for (const e of expressions) console.log(`  ${e.slug} — 패턴 "${patternText(e.korean)}"`)
    console.log('\n--dry-run: 호출하지 않고 종료')
    return
  }

  // ── 기존 파일 백업 (되돌릴 수 없는 덮어쓰기이므로) ──────────────────────────
  console.log(`[0] 기존 파일 백업 → ${BACKUP_DIR}`)
  let backed = 0
  for (const e of expressions) {
    const urls = (e.audio_urls ?? {}) as Record<string, string>
    const dir = path.join(BACKUP_DIR, e.slug)
    fs.mkdirSync(dir, { recursive: true })
    for (const key of ['pattern', 'ex1', 'ex2', 'ex3']) {
      const url = urls[key]
      if (!url) continue
      const dest = path.join(dir, `${key}.mp3`)
      if (fs.existsSync(dest)) { backed++; continue }
      const res = await fetch(url)
      if (!res.ok) throw new Error(`백업 실패 [${e.slug}/${key}]: HTTP ${res.status}`)
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
      backed++
    }
  }
  console.log(`  ✓ ${backed}파일 백업 완료\n`)

  // ── 생성 ────────────────────────────────────────────────────────────────────
  type Result = { slug: string; part: string; text: string; url: string; dur: number; chars: number; bytes: number }
  const results: Result[] = []
  let done = 0

  for (const expr of expressions) {
    const rawEx = typeof expr.examples === 'string' ? JSON.parse(expr.examples) : expr.examples
    const exArr = (Array.isArray(rawEx) ? rawEx : []) as Array<{ ko: string; en: string }>
    const patKo = patternText(expr.korean)

    const parts = [
      { key: 'pattern', text: patKo,          instructions: INSTR_PATTERN },
      { key: 'ex1',     text: exArr[0]?.ko ?? expr.korean, instructions: INSTR_EXAMPLE },
      { key: 'ex2',     text: exArr[1]?.ko ?? expr.korean, instructions: INSTR_EXAMPLE },
      { key: 'ex3',     text: exArr[2]?.ko ?? expr.korean, instructions: INSTR_EXAMPLE },
    ]

    console.log(`▶ ${expr.slug}  (ep${expr.first_episode}, id=${expr.id})`)
    const urls: Record<string, string> = { ...((expr.audio_urls ?? {}) as Record<string, string>) }

    for (const part of parts) {
      if (done > 0) await sleep(DELAY_MS)
      done++
      const label = `${expr.slug}/${part.key}`
      process.stdout.write(`  ${part.key.padEnd(8)} "${part.text}" ... `)

      const buf = await callTTS(part.text, part.instructions, label)
      const dur = audioDuration(buf)
      if (dur < 1) throw new Error(`[${label}] 재생 ${dur.toFixed(2)}초 — 1초 미만, 중단`)

      const storagePath = `expressions/${expr.slug}/${part.key}.mp3`
      const url = await upload(storagePath, buf)
      urls[part.key] = url

      results.push({ slug: expr.slug, part: part.key, text: part.text, url, dur, chars: part.text.replace(/\s/g, '').length, bytes: buf.length })
      console.log(`${(buf.length / 1024).toFixed(1)}KB  ${dur.toFixed(2)}s  ${(part.text.replace(/\s/g, '').length / dur).toFixed(2)}자/초`)
    }

    // audio_urls 갱신 (경로 불변이라 값은 그대로지만, 누락 키가 있으면 채워진다)
    const { error: dbErr } = await sb.from('kp_expressions').update({ audio_urls: urls }).eq('id', expr.id)
    if (dbErr) throw new Error(`DB 갱신 실패 [${expr.slug}]: ${dbErr.message}`)
    console.log(`  ✅ audio_urls 저장 (audio_url·audio_hash 미변경)\n`)
  }

  // ── 요약 ────────────────────────────────────────────────────────────────────
  console.log('═'.repeat(70))
  console.log(`생성 완료: ${results.length}건 / ${total}건\n`)

  console.log('slug                  패턴텍스트          글자  pattern(s)  자/초   예문평균 자/초  판정')
  for (const expr of expressions) {
    const pat = results.find(r => r.slug === expr.slug && r.part === 'pattern')
    const exs = results.filter(r => r.slug === expr.slug && r.part !== 'pattern')
    if (!pat || exs.length === 0) continue
    const patCps = pat.chars / pat.dur
    const exCps  = exs.reduce((s, r) => s + r.chars / r.dur, 0) / exs.length
    const slower = patCps < exCps
    const inRange = pat.chars <= 3 ? (pat.dur >= 1.5 && pat.dur <= 2.5) : true
    console.log(
      `${expr.slug.padEnd(21)} ${pat.text.padEnd(16)} ${String(pat.chars).padStart(4)}  ` +
      `${pat.dur.toFixed(2).padStart(9)}  ${patCps.toFixed(2).padStart(5)}  ${exCps.toFixed(2).padStart(13)}  ` +
      `${slower ? '느림✓' : '⚠️빠름'}${pat.chars <= 3 ? (inRange ? ' 범위✓' : ' ⚠️범위밖') : ''}`
    )
  }

  const short = results.filter(r => r.dur < 1)
  console.log(`\n1초 미만: ${short.length}건`)
  console.log(`0바이트: ${results.filter(r => r.bytes === 0).length}건`)
  const chars = results.reduce((s, r) => s + r.text.length, 0)
  console.log(`문자수 ${chars}자 → 약 $${(chars * 12 / 1_000_000).toFixed(4)} (gpt-4o-mini-tts 텍스트 $12/1M자 기준)`)
}

main().catch(e => {
  console.error('\n⛔ [중단] 재시도 없이 종료합니다.')
  console.error('오류 전문:')
  console.error(e)
  process.exit(1)
})
