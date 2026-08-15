/**
 * K-PATTO 표현 음성 생성 — OpenAI gpt-4o-mini-tts
 *
 * 기존 Gemini Zephyr판(generate-kpatto-audio-split.ts)을 대체한다.
 * 짧은 텍스트(2~3자 패턴)에서 Gemini 발음이 뭉개지는 문제 때문에 엔진 교체.
 *
 * 모델:   gpt-4o-mini-tts  (tts-1 아님)
 * 목소리: sage
 * 속도:   instructions 파라미터로 제어 (패턴은 음절 단위 발음 지시)
 *
 * 저장:   audio/expressions/{slug}/{pattern,ex1,ex2,ex3}.mp3
 *         → kp_expressions.audio_urls만 갱신
 *         → audio_url(통합 파일)·audio_hash는 건드리지 않는다
 *
 * 중단:   429(분당 제한)만 대기 후 재시도. 그 외 API 에러는 즉시 중단·재시도 없음.
 *         길이 미달/초과는 에러가 아니라 재생성 대상(최대 MAX_LEN_RETRY회).
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts --missing   # audio_urls 없는 표현 전량
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts             # EP01~05 (전건 덮어쓰기)
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts --missing --dry-run
 *   npx tsx scripts/generate-kpatto-expr-audio-openai.ts --slug juseyo
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
const DELAY_MS = 300
const BACKUP_DIR = path.resolve(process.cwd(), 'audio-backup', 'expr-zephyr')

const INSTR_PATTERN = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner.'
const INSTR_EXAMPLE = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone.'

// 길이 기준: 2~3자 패턴은 1.5~2.5초, 그 외는 1초 이상
const SHORT_LO = 1.5, SHORT_HI = 2.5, SHORT_MID = 2.0
const MIN_SEC  = 1.0
const MAX_LEN_RETRY = 2       // 최초 1회 + 재생성 최대 2회 = 총 3회
const PROGRESS_EVERY = 50     // 표현 N개마다 진행률 출력

const argv    = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const MISSING = argv.includes('--missing')
const ONLY_SLUG = (() => { const i = argv.indexOf('--slug'); return i >= 0 ? argv[i + 1] ?? '' : '' })()
const REPORT = path.resolve(process.cwd(), 'scripts', `expr-audio-report${MISSING ? '-missing' : ''}.json`)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/**
 * TTS 입력용 패턴 텍스트.
 * DB 표기(`~`, 앞뒤 `-`)는 학습 표기일 뿐이라 그대로 읽히면 기호가 발음되거나 뭉개진다.
 * 슬래시 대안은 기존 EP01~05와 동일하게 첫 번째만 쓴다.
 */
function patternText(korean: string): string {
  return korean
    .split('/')[0]
    .replace(/~/g, '')
    .replace(/^-+|-+$/g, '')
    .replace(/[.!?]$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 예문도 물결만 정리 (문장부호는 억양에 필요하므로 유지) */
function exampleText(ko: string): string {
  return ko.replace(/~/g, '').replace(/\s+/g, ' ').trim()
}

// ── MP3 재생 길이 ─────────────────────────────────────────────────────────────
const BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
const BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
const RATES_V1 = [44100, 48000, 32000]
const RATES_V2 = [22050, 24000, 16000]
const RATES_V25 = [11025, 12000, 8000]

function audioDuration(buf: Buffer): number {
  if (buf.length > 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
    const sr = buf.readUInt32LE(24), ch = buf.readUInt16LE(22), bits = buf.readUInt16LE(34), ds = buf.readUInt32LE(40)
    return ds / (sr * ch * (bits / 8))
  }
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10) {
    i = 10 + (((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f))
  }
  let seconds = 0
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) { i++; continue }
    const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3
    const br = (buf[i + 2] >> 4) & 15, sr = (buf[i + 2] >> 2) & 3, pad = (buf[i + 2] >> 1) & 1
    if (layer !== 1 || ver === 1 || br === 0 || br === 15 || sr === 3) { i++; continue }
    const isV1 = ver === 3
    const bitrate = (isV1 ? BITRATES_V1L3[br] : BITRATES_V2L3[br]) * 1000
    const rate = (ver === 3 ? RATES_V1 : ver === 2 ? RATES_V2 : RATES_V25)[sr]
    const samples = isV1 ? 1152 : 576
    const len = Math.floor((samples / 8) * bitrate / rate) + pad
    if (len <= 4) { i++; continue }
    seconds += samples / rate
    i += len
  }
  return seconds
}

// ── TTS 호출 (429만 대기 후 재시도, 그 외 즉시 throw) ─────────────────────────
let apiCalls = 0
async function callTTS(text: string, instructions: string, label: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      apiCalls++
      const res = await openai.audio.speech.create({
        model: MODEL, voice: VOICE, input: text, instructions, response_format: 'mp3',
      })
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length === 0) throw new Error(`[${label}] TTS 응답 0바이트`)
      return buf
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status
      if (status === 429) {
        const ra = Number(e?.headers?.['retry-after'] ?? e?.response?.headers?.get?.('retry-after') ?? 0)
        const waitMs = ra > 0 ? ra * 1000 + 500 : Math.min(5000 * attempt, 60_000)
        console.log(`\n  [429 분당 제한] ${label} — ${Math.round(waitMs / 1000)}초 대기 후 재시도 (${attempt}회차)`)
        await sleep(waitMs)
        continue
      }
      throw e
    }
  }
}

/** 목표 길이에 맞을 때까지 최대 MAX_LEN_RETRY회 더 뽑아 가장 가까운 것을 채택 */
async function ttsWithLength(text: string, instructions: string, label: string, isShortPattern: boolean) {
  const lo = isShortPattern ? SHORT_LO : MIN_SEC
  const hi = isShortPattern ? SHORT_HI : Infinity
  const mid = isShortPattern ? SHORT_MID : MIN_SEC
  let best: { buf: Buffer; sec: number } | null = null
  let tries = 0

  for (let t = 0; t <= MAX_LEN_RETRY; t++) {
    tries++
    if (t > 0) await sleep(DELAY_MS)
    const buf = await callTTS(text, instructions, label)
    const sec = audioDuration(buf)
    if (!best || Math.abs(sec - mid) < Math.abs(best.sec - mid)) best = { buf, sec }
    if (sec >= lo && sec <= hi) return { ...best!, tries, inRange: true, buf, sec }
  }
  return { buf: best!.buf, sec: best!.sec, tries, inRange: false }
}

async function upload(storagePath: string, buf: Buffer): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'audio/mpeg', upsert: true,
  })
  if (error) throw new Error(`Storage 업로드 실패 [${storagePath}]: ${error.message}`)
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

interface ExRow { id: number; slug: string; first_episode: number; korean: string; examples: unknown; audio_urls: unknown }

async function fetchTargets(): Promise<ExRow[]> {
  const out: ExRow[] = []
  for (let from = 0; ; from += 1000) {
    let q = sb.from('kp_expressions')
      .select('id, slug, first_episode, korean, examples, audio_urls')
      .order('first_episode').order('id').range(from, from + 999)
    if (!MISSING) q = q.in('first_episode', EP_RANGE)
    const { data, error } = await q
    if (error) throw new Error(`DB 조회 실패: ${error.message}`)
    out.push(...((data ?? []) as ExRow[]))
    if (!data || data.length < 1000) break
  }
  return MISSING ? out.filter(e => !e.audio_urls) : out
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 없음')

  let expressions = await fetchTargets()
  if (ONLY_SLUG) expressions = expressions.filter(e => e.slug === ONLY_SLUG)

  const total = expressions.length * 4
  console.log(`\n=== K-PATTO 표현 음성 생성 ===`)
  console.log(`엔진: OpenAI  |  모델: ${MODEL}  |  목소리: ${VOICE}`)
  console.log(`키: OPENAI_API_KEY(…${(process.env.OPENAI_API_KEY ?? '').slice(-4)})`)
  console.log(`모드: ${MISSING ? '--missing (audio_urls 없는 표현 전량)' : `EP${EP_RANGE.join(',')} 전건 덮어쓰기`}`)
  console.log(`대상: 표현 ${expressions.length}개 × 4 = ${total}건`)
  console.log(`instructions(패턴): ${INSTR_PATTERN}`)
  console.log(`instructions(예문): ${INSTR_EXAMPLE}`)
  console.log(`길이 기준: 2~3자 패턴 ${SHORT_LO}~${SHORT_HI}초 / 그 외 ${MIN_SEC}초 이상, 벗어나면 최대 ${MAX_LEN_RETRY}회 재생성`)
  console.log(`중단 규칙: 429만 대기 후 재시도, 그 외 API 에러 즉시 중단`)
  console.log(`audio_url(통합 파일)·audio_hash: 건드리지 않음\n`)

  // TTS 입력이 부자연스러워질 수 있는 패턴 미리 경고 (낱자모/조사 조각이 홀로 남는 경우)
  const suspicious = expressions
    .map(e => ({ e, p: patternText(e.korean) }))
    .filter(({ p }) => /[ㄱ-ㆎ]/.test(p) || /(^|\s)(는|게|을|를|ㄹ)(\s|$)/.test(p))
  if (suspicious.length > 0) {
    console.log(`⚠️ TTS 입력이 어색할 수 있는 패턴 ${suspicious.length}개 — 생성은 하되 청취 후 DB 텍스트 재검토 권장`)
    for (const { e, p } of suspicious) console.log(`   id=${e.id} ${e.slug} "${e.korean}" → "${p}"`)
    console.log('')
  }

  if (DRY_RUN) {
    for (const e of expressions.slice(0, 30)) console.log(`  ep${e.first_episode} ${e.slug} — 패턴 "${patternText(e.korean)}"`)
    if (expressions.length > 30) console.log(`  … 외 ${expressions.length - 30}개`)
    console.log('\n--dry-run: 호출하지 않고 종료')
    return
  }

  // 덮어쓰기 모드에서만 기존 파일 백업
  if (!MISSING) {
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
  }

  type Result = { slug: string; ep: number; part: string; text: string; sec: number; chars: number; bytes: number; tries: number; inRange: boolean }
  const results: Result[] = []
  const outOfRange: Result[] = []
  let done = 0, exprDone = 0
  const t0 = Date.now()

  for (const expr of expressions) {
    const rawEx = typeof expr.examples === 'string' ? JSON.parse(expr.examples) : expr.examples
    const exArr = (Array.isArray(rawEx) ? rawEx : []) as Array<{ ko: string; en: string }>
    const patKo = patternText(expr.korean)
    if (!patKo) throw new Error(`[${expr.slug}] 패턴 텍스트가 비어 있음 (korean="${expr.korean}")`)

    const parts = [
      { key: 'pattern', text: patKo, instructions: INSTR_PATTERN },
      { key: 'ex1', text: exampleText(exArr[0]?.ko ?? expr.korean), instructions: INSTR_EXAMPLE },
      { key: 'ex2', text: exampleText(exArr[1]?.ko ?? expr.korean), instructions: INSTR_EXAMPLE },
      { key: 'ex3', text: exampleText(exArr[2]?.ko ?? expr.korean), instructions: INSTR_EXAMPLE },
    ]

    const urls: Record<string, string> = { ...((expr.audio_urls ?? {}) as Record<string, string>) }
    const line: string[] = []

    for (const part of parts) {
      if (done > 0) await sleep(DELAY_MS)
      done++
      const label = `${expr.slug}/${part.key}`
      const chars = part.text.replace(/\s/g, '').length
      const isShortPattern = part.key === 'pattern' && chars >= 2 && chars <= 3

      const r = await ttsWithLength(part.text, part.instructions, label, isShortPattern)

      const storagePath = `expressions/${expr.slug}/${part.key}.mp3`
      urls[part.key] = await upload(storagePath, r.buf)

      const rec: Result = { slug: expr.slug, ep: expr.first_episode, part: part.key, text: part.text, sec: r.sec, chars, bytes: r.buf.length, tries: r.tries, inRange: r.inRange }
      results.push(rec)
      if (!r.inRange) outOfRange.push(rec)
      line.push(`${part.key}=${r.sec.toFixed(2)}s${r.tries > 1 ? `(${r.tries}회)` : ''}${r.inRange ? '' : '✗'}`)
    }

    const { error: dbErr } = await sb.from('kp_expressions').update({ audio_urls: urls }).eq('id', expr.id)
    if (dbErr) throw new Error(`DB 갱신 실패 [${expr.slug}]: ${dbErr.message}`)

    exprDone++
    console.log(`[${String(exprDone).padStart(3)}/${expressions.length}] ep${String(expr.first_episode).padStart(2)} ${expr.slug.padEnd(26)} "${patKo}" ${line.join(' ')}`)

    if (exprDone % PROGRESS_EVERY === 0) {
      const pct = (exprDone / expressions.length * 100).toFixed(1)
      const min = ((Date.now() - t0) / 60000).toFixed(1)
      const eta = ((Date.now() - t0) / exprDone * (expressions.length - exprDone) / 60000).toFixed(1)
      console.log(`\n──── 진행률 ${pct}%  (표현 ${exprDone}/${expressions.length}, 파일 ${results.length}/${total}) ` +
                  `· 경과 ${min}분 · 남은 예상 ${eta}분 · 범위 밖 누적 ${outOfRange.length}건 · API 호출 ${apiCalls}회 ────\n`)
      fs.writeFileSync(REPORT, JSON.stringify({ exprDone, files: results.length, outOfRange }, null, 2))
    }
  }

  // ── 요약 ────────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log(`생성 완료: ${results.length}건 / ${total}건 · 표현 ${exprDone}/${expressions.length}`)
  console.log(`API 호출: ${apiCalls}회 (길이 재생성 포함)`)
  console.log(`경과: ${((Date.now() - t0) / 60000).toFixed(1)}분`)

  const shortPats = results.filter(r => r.part === 'pattern' && r.chars >= 2 && r.chars <= 3)
  console.log(`\n2~3자 패턴: ${shortPats.length}개 중 ${shortPats.filter(r => r.inRange).length}개 범위내(${SHORT_LO}~${SHORT_HI}초)`)
  console.log(`1초 미만: ${results.filter(r => r.sec < MIN_SEC).length}건`)
  console.log(`재생성 발생: ${results.filter(r => r.tries > 1).length}건`)

  if (outOfRange.length > 0) {
    console.log(`\n=== 범위 밖으로 남은 ${outOfRange.length}건 ===`)
    for (const r of outOfRange)
      console.log(`  ep${r.ep} ${r.slug}/${r.part} "${r.text}" ${r.chars}자 ${r.sec.toFixed(2)}s (${r.tries}회 시도)`)
  }

  fs.writeFileSync(REPORT, JSON.stringify({ exprDone, files: results.length, apiCalls, outOfRange, results }, null, 2))
  console.log(`\n리포트 → ${REPORT}`)

  const chars = results.reduce((s, r) => s + r.text.length, 0)
  console.log(`문자수 ${chars.toLocaleString()}자 → 약 $${(chars * 12 / 1_000_000).toFixed(4)}`)
}

main().catch(e => {
  console.error('\n⛔ [중단] 재시도 없이 종료합니다.')
  console.error('오류 전문:')
  console.error(e)
  process.exit(1)
})
