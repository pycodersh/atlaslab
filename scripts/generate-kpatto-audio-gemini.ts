/**
 * K-PATTO Gemini TTS 음성 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 2 --ep 30
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 5 --ep 8
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --expr 770,812,845   (표현 단독 재생성)
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 5 --ep 8 --force
 *
 * 화자 보이스:  에마=Kore  지수=Zephyr  민준=Umbriel  소피=Aoede
 * 표현 가이드:  Iapetus (단일 보이스, 표현당 1회 호출)
 * RPD 한도:     100회/일, 태평양 자정(한국 오후 4~5시) 초기화
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const epArgs: number[] = []
const exprIds: number[] = []
let FORCE    = false
let NO_EXPR  = false  // --no-expr: 대사만 생성, 표현 건너뜀

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--ep' && argv[i + 1])   epArgs.push(parseInt(argv[++i]))
  if (argv[i] === '--expr' && argv[i + 1]) argv[++i].split(',').forEach(s => { const n = parseInt(s.trim()); if (!isNaN(n)) exprIds.push(n) })
  if (argv[i] === '--force')   FORCE   = true
  if (argv[i] === '--no-expr') NO_EXPR = true
}

const EXPR_ONLY = exprIds.length > 0 && epArgs.length === 0
const EP_FROM   = epArgs.length ? Math.min(...epArgs) : 0
const EP_TO     = epArgs.length ? Math.max(...epArgs) : 0

if (!EXPR_ONLY && epArgs.length === 0) {
  console.error('Usage: npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 2 --ep 30')
  console.error('       npx tsx scripts/generate-kpatto-audio-gemini.ts --expr 770,812')
  process.exit(1)
}

// ── Config ────────────────────────────────────────────────────────────────────
const GEMINI_KEY   = process.env.GEMINI_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'audio'
const logSuffix    = EXPR_ONLY ? `expr${exprIds.join('-')}` : `ep${EP_FROM}-${EP_TO}`
const FAIL_LOG     = `scripts/audio-failures-${logSuffix}.json`
const PROGRESS_LOG = `scripts/audio-progress-ep${EP_FROM}-${EP_TO}.json`

const MODEL_FLASH = 'gemini-2.5-flash-preview-tts'

// RPM 10 → 6초 + 0.5초 여유
const DELAY_BETWEEN_CALLS = 6500

const GUIDE_VOICE = 'Iapetus'

const VOICE_MAP: Record<string, string> = {
  emma:   'Kore',
  jisu:   'Zephyr',
  jisoo:  'Zephyr',
  minjun: 'Umbriel',
  sophie: 'Aoede',
  직원:   'Zephyr',
  행인:   'Kore',
  의사:   'Charon',
  약사:   'Aoede',
  상인:   'Charon',
  교수님: 'Charon',
  기사:   'Puck',
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

// ── Helpers ───────────────────────────────────────────────────────────────────
function getVoice(speaker: string): string {
  return VOICE_MAP[speaker.trim()] ?? 'Kore'
}

function dialoguePrompt(text: string): string {
  return `자연스럽게, 받침을 분명하게 발음해줘: ${text}`
}

/** 표현 배치 프롬프트: 지시문 한 번 + 줄바꿈으로 세그먼트 나열 */
function expressionBatchPrompt(segments: string[]): string {
  return `또박또박, 받침을 분명하게 발음해줘. 문장 사이에는 잠깐 쉬어줘:\n${segments.join('\n')}`
}

function contentHash(text: string, voice: string, prompt: string): string {
  return createHash('sha256').update(text + '|' + voice + '|' + prompt, 'utf8').digest('hex').slice(0, 16)
}

function exprHash(prompt: string): string {
  return createHash('sha256').update(prompt + '|' + GUIDE_VOICE, 'utf8').digest('hex').slice(0, 16)
}

function cleanPattern(raw: string): string {
  const cleaned = raw
    .replace(/~/g, '')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/^-+|-+$/g, '')
    .trim()
  if (!cleaned.includes(' ') && cleaned.replace(/[가-힣]/g, '').length === 0 && cleaned.length <= 3) return ''
  return cleaned
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

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

// ── RPD 에러 (즉시 종료용) ────────────────────────────────────────────────────
class RpdError extends Error { constructor() { super('RPD_LIMIT') } }

// ── RPM 스로틀 ────────────────────────────────────────────────────────────────
let lastCallTime = 0
async function throttle() {
  const wait = DELAY_BETWEEN_CALLS - (Date.now() - lastCallTime)
  if (wait > 0) await sleep(wait)
  lastCallTime = Date.now()
}

// ── Gemini TTS API ────────────────────────────────────────────────────────────
const MAX_RETRIES = 3  // OTHER 재시도도 RPD 소모, 축소

async function tts(prompt: string, voice: string): Promise<Buffer> {
  await throttle()

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }

  for (let attempt = 1; ; attempt++) {
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 60_000)
    let res: Response
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FLASH}:generateContent?key=${GEMINI_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal }
      )
    } finally {
      clearTimeout(timeoutId)
    }

    if (res.status === 429) {
      const rawText = await res.text()
      let errBody: any = {}
      try { errBody = JSON.parse(rawText) } catch { /* noop */ }

      // RPD vs RPM 판별
      const violations: any[] = errBody?.error?.details?.flatMap((d: any) => d.violations ?? []) ?? []
      const isRpd = violations.some((v: any) => v.quotaId?.includes('PerDay'))

      const retryAfterHeader = res.headers.get('Retry-After')
      const retryAfterMs = (() => {
        if (retryAfterHeader) { const s = parseFloat(retryAfterHeader); if (!isNaN(s)) return Math.ceil(s * 1000) + 500 }
        const details = errBody?.error?.details ?? []
        const delayStr: string = details.find((d: any) => d.retryDelay)?.retryDelay ?? ''
        const s = parseFloat(delayStr)
        return isNaN(s) ? Math.min(10_000 * 2 ** (attempt - 1), 90_000) : Math.ceil(s * 1000) + 500
      })()

      if (isRpd || retryAfterMs > 600_000) {
        // 일일 한도 → 즉시 종료 (원문 로깅 후 종료)
        const rpdCause = isRpd
          ? `[RPD-PerDay] violations: ${JSON.stringify(violations)}`
          : `[RPD-retryAfter] retryAfterMs=${retryAfterMs} (>600000) retryAfterHeader=${retryAfterHeader}`
        const rpdBody  = rawText.slice(0, 1000)
        console.log(`\n  [RPD] 일일 한도 소진. 태평양 자정(한국 오후 4~5시) 이후 재실행하세요.`)
        console.log(`  판정 근거: ${rpdCause}`)
        console.log(`  응답 원문: ${rpdBody}`)
        throw new RpdError()
      }

      // RPM → 백오프
      const quotaInfo = violations.length > 0 ? JSON.stringify(violations).slice(0, 200) : rawText.slice(0, 150)
      process.stdout.write(`\n    [429 RPM] attempt ${attempt}/${MAX_RETRIES} wait ${Math.round(retryAfterMs/1000)}s\n    ${quotaInfo}\n    `)
      if (attempt >= MAX_RETRIES) throw new Error(`429 RPM after ${MAX_RETRIES} retries`)
      await sleep(retryAfterMs)
      lastCallTime = Date.now()
      continue
    }

    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)

    const json      = await res.json() as any
    const candidate = json?.candidates?.[0]
    const part      = candidate?.content?.parts?.[0]?.inlineData

    if (!part?.data) {
      const reason = candidate?.finishReason ?? 'unknown'
      if (reason === 'OTHER' && attempt < MAX_RETRIES) {
        process.stdout.write(`[OTHER ${attempt}] `)
        await sleep(3000)
        lastCallTime = Date.now()
        continue
      }
      throw new Error(`finishReason=${reason}`)
    }

    const raw  = Buffer.from(part.data, 'base64')
    const mime = (part.mimeType ?? '') as string
    return mime.includes('wav') || mime.includes('wave') ? raw : pcmToWav(raw)
  }
}

// ── 대사 폴백 (2단계) ─────────────────────────────────────────────────────────
async function dialogueTts(rawText: string, voice: string): Promise<Buffer> {
  const prompt = dialoguePrompt(rawText)

  try {
    const wav = await tts(prompt, voice)
    if (wav.length < 1024) throw new Error(`too small: ${wav.length}B`)
    return wav
  } catch (e: any) {
    if (e instanceof RpdError) throw e
    if (!e.message.includes('finishReason=OTHER') && !e.message.includes('too small')) throw e
    process.stdout.write(`[FB] `)
  }

  // 폴백: 마침표 추가
  const wav = await tts(dialoguePrompt(rawText.replace(/[.!?]$/, '') + '.'), voice)
  if (wav.length < 1024) throw new Error(`fallback too small: ${wav.length}B`)
  return wav
}

// ── 표현 배치 TTS (1회 호출) ──────────────────────────────────────────────────
async function expressionTts(segments: string[]): Promise<Buffer> {
  const prompt = expressionBatchPrompt(segments)

  try {
    const wav = await tts(prompt, GUIDE_VOICE)
    if (wav.length < 1024) throw new Error(`too small: ${wav.length}B`)
    return wav
  } catch (e: any) {
    if (e instanceof RpdError) throw e
    if (!e.message.includes('finishReason=OTHER') && !e.message.includes('too small')) throw e
    process.stdout.write(`[FB] `)
  }

  // 폴백: 마지막 세그먼트 마침표 추가
  const segs2 = [...segments]
  segs2[segs2.length - 1] = segs2[segs2.length - 1].replace(/[.!?]$/, '') + '.'
  const wav = await tts(expressionBatchPrompt(segs2), GUIDE_VOICE)
  if (wav.length < 1024) throw new Error(`fallback too small: ${wav.length}B`)
  return wav
}

// ── Supabase Storage upload ───────────────────────────────────────────────────
async function upload(buf: Buffer, storagePath: string): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, { contentType: 'audio/wav', upsert: true })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

// ── 화별 검증 ─────────────────────────────────────────────────────────────────
async function validateEpisode(epNum: number) {
  const { data } = await sb.from('kp_dialogues').select('id, speaker, text_ko, audio_url').eq('episode_id', epNum)
  const total = data?.length ?? 0
  const ok    = data?.filter(d => d.audio_url).length ?? 0
  if (total === ok) {
    console.log(`  ✓ EP${String(epNum).padStart(2,'0')} 검증: ${ok}/${total} OK`)
  } else {
    console.log(`  ✗ EP${String(epNum).padStart(2,'0')} 검증: ${ok}/${total} — 누락!`)
    for (const d of data?.filter(d => !d.audio_url) ?? [])
      console.log(`    MISSING id=${d.id} ${d.speaker}: ${d.text_ko}`)
  }
}

// ── 표현 처리 (공통) ──────────────────────────────────────────────────────────
async function processExpression(
  expr: { id: number; korean: string; examples: Array<{ ko: string }>; audio_url: string | null; audio_hash: string | null },
  label: string,
  failures: Array<{ id: number; type: string; text: string; error: string }>,
): Promise<boolean> {
  const examples: Array<{ ko: string }> = expr.examples ?? []
  const patternText = cleanPattern(expr.korean)
  const segments: string[] = []
  if (patternText) segments.push(patternText)
  for (const e of examples) if (e.ko?.trim()) segments.push(e.ko)

  if (segments.length === 0) {
    console.log(`${label} id=${expr.id} skip (no segments)`)
    return false
  }

  const prompt = expressionBatchPrompt(segments)
  const hash   = exprHash(prompt)

  if (!FORCE && expr.audio_url && expr.audio_hash === hash) {
    console.log(`${label} id=${expr.id} skip (${expr.korean})`)
    return false
  }

  const t1 = Date.now()
  process.stdout.write(`${label} id=${expr.id} ${expr.korean} (${segments.length}문장) `)

  try {
    const wav         = await expressionTts(segments)
    const storagePath = `expressions/${expr.id}.wav`
    const url         = await upload(wav, storagePath)
    await sb.from('kp_expressions').update({ audio_url: url, audio_hash: hash }).eq('id', expr.id)
    console.log(`· ${((Date.now()-t1)/1000).toFixed(1)}s · OK`)
    // 같은 표현이 여러 에피소드에서 처리될 때, 이전 실패 기록 제거
    const prevIdx = failures.findIndex(f => f.type === 'expression' && f.id === expr.id)
    if (prevIdx !== -1) failures.splice(prevIdx, 1)
    return true
  } catch (e: any) {
    if (e instanceof RpdError) throw e
    console.log(`· FAIL`)
    console.error(`    ${e.message.slice(0, 200)}`)
    failures.push({ id: expr.id, type: 'expression', text: expr.korean, error: e.message })
    return false
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const failures: Array<{ id: number; type: string; text: string; error: string; ep?: number }> = []
  const progress: Record<string, unknown> = {}
  let charTotal  = 0
  let dGenTotal  = 0
  let eGenTotal  = 0
  let rpdHit     = false
  const t0 = Date.now()

  // ── 헤더 ────────────────────────────────────────────────────────────────────
  if (EXPR_ONLY) {
    console.log(`\n=== K-PATTO Gemini TTS  표현 재생성 [${exprIds.join(',')}]${FORCE ? ' --force' : ''} ===`)
  } else {
    const range = EP_TO > EP_FROM ? `EP${EP_FROM}–${EP_TO}` : `EP${EP_FROM}`
    console.log(`\n=== K-PATTO Gemini TTS  ${range}${FORCE ? ' --force' : ''} ===`)
  }
  console.log(`Model: ${MODEL_FLASH}  |  딜레이: ${DELAY_BETWEEN_CALLS}ms  |  RPD 100회/일 (한국 오후 4~5시 초기화)`)
  console.log(`표현: 배치 방식(표현당 1회 호출)  |  OTHER 폴백: 2단계  |  RPD 시 즉시 종료\n`)

  // ── --expr 단독 모드 ─────────────────────────────────────────────────────────
  if (EXPR_ONLY) {
    const { data: exprs } = await sb
      .from('kp_expressions')
      .select('id, korean, examples, audio_url, audio_hash')
      .in('id', exprIds)
    const list = exprs ?? []
    console.log(`[표현 재생성] ${list.length}건`)
    try {
      for (let i = 0; i < list.length; i++) {
        const ok = await processExpression(list[i], `  [${i+1}/${list.length}]`, failures)
        if (ok) eGenTotal++
      }
    } catch (e) {
      if (!(e instanceof RpdError)) throw e
      rpdHit = true
    }
  } else {
    // ── --ep 모드 ──────────────────────────────────────────────────────────────
    outer:
    for (let epNum = EP_FROM; epNum <= EP_TO; epNum++) {
      const epLabel = `EP${String(epNum).padStart(2,'0')}`
      console.log(`\n── ${epLabel} ──────────────────────────────`)

      // [1] 대사
      const { data: dialogues, error: dErr } = await sb
        .from('kp_dialogues')
        .select('id, speaker, text_ko, audio_url, audio_hash')
        .eq('episode_id', epNum)
        .order('order_num')
      if (dErr) { console.error(`${epLabel} kp_dialogues error:`, dErr.message); continue }

      const dList  = dialogues ?? []
      const dTotal = dList.length
      let dGen = 0, dSkip = 0

      console.log(`[1] 대사 ${dTotal}건`)
      for (let di = 0; di < dList.length; di++) {
        const d      = dList[di]
        const voice  = getVoice(d.speaker)
        const prompt = dialoguePrompt(d.text_ko)
        const hash   = contentHash(d.text_ko, voice, prompt)
        const label  = `[${epLabel} ${di+1}/${dTotal}]`

        if (!FORCE && d.audio_url && d.audio_hash === hash) {
          console.log(`${label} id=${d.id} skip`); dSkip++; continue
        }

        const t1 = Date.now()
        process.stdout.write(`${label} id=${d.id} ${d.speaker}(${voice}) "${d.text_ko.slice(0,14).replace(/\n/g,' ')}…" `)

        try {
          charTotal += prompt.length
          const wav         = await dialogueTts(d.text_ko, voice)
          const storagePath = `dialogues/ep${String(epNum).padStart(2,'0')}/${d.id}.wav`
          const url         = await upload(wav, storagePath)
          await sb.from('kp_dialogues').update({ audio_url: url, audio_hash: hash }).eq('id', d.id)
          await sb.from('kp_bubbles').update({ audio_url: url }).eq('episode_id', epNum).eq('korean', d.text_ko)
          dGen++
          console.log(`· ${((Date.now()-t1)/1000).toFixed(1)}s · OK`)
        } catch (e: any) {
          if (e instanceof RpdError) { rpdHit = true; break outer }
          console.log(`· FAIL`)
          console.error(`    ${e.message.slice(0, 200)}`)
          failures.push({ ep: epNum, id: d.id, type: 'dialogue', text: d.text_ko, error: e.message })
        }
      }
      dGenTotal += dGen
      console.log(`  대사: 생성 ${dGen}  스킵 ${dSkip}  실패 ${failures.filter(f=>f.ep===epNum&&f.type==='dialogue').length}`)
      await validateEpisode(epNum)

      // [2] 표현 (--no-expr 시 건너뜀)
      if (NO_EXPR) {
        console.log(`[2] 표현 skip (--no-expr)`)
        progress[epLabel] = { dialogues: { gen: dGen, skip: dSkip, total: dTotal }, expressions: { gen: 0, total: 0 } }
        if (!EXPR_ONLY) fs.writeFileSync(PROGRESS_LOG, JSON.stringify(progress, null, 2))
        continue
      }

      const { data: exprs } = await sb
        .from('kp_expressions')
        .select('id, korean, examples, audio_url, audio_hash')
        .contains('episodes', JSON.stringify([epNum]))
      const eList = exprs ?? []
      // --expr 필터가 있으면 해당 ID만
      const eTodo = exprIds.length > 0 ? eList.filter(e => exprIds.includes(e.id)) : eList
      console.log(`[2] 표현 ${eTodo.length}건${exprIds.length > 0 ? ` (필터: ${exprIds.join(',')})` : ''}`)

      let eGen = 0
      try {
        for (let ei = 0; ei < eTodo.length; ei++) {
          const ok = await processExpression(eTodo[ei], `  [${epLabel} expr ${ei+1}/${eTodo.length}]`, failures)
          if (ok) { eGen++; charTotal += expressionBatchPrompt([]).length }
        }
      } catch (e) {
        if (!(e instanceof RpdError)) throw e
        rpdHit = true
      }
      eGenTotal += eGen
      console.log(`  표현: 생성 ${eGen}  실패 ${failures.filter(f=>f.ep===epNum&&f.type==='expression').length}`)

      progress[epLabel] = { dialogues: { gen: dGen, skip: dSkip, total: dTotal }, expressions: { gen: eGen, total: eTodo.length } }
      if (!EXPR_ONLY) fs.writeFileSync(PROGRESS_LOG, JSON.stringify(progress, null, 2))

      if (rpdHit) break
    }
  }

  // ── 최종 검증 (--ep 모드) ────────────────────────────────────────────────────
  if (!EXPR_ONLY && EP_FROM > 0) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`[최종 검증] EP${EP_FROM}–${EP_TO}`)

    const { data: allDlg } = await sb
      .from('kp_dialogues').select('id, episode_id, speaker, text_ko, audio_url')
      .gte('episode_id', EP_FROM).lte('episode_id', EP_TO)
    const missingDlg = (allDlg ?? []).filter(d => !d.audio_url)
    if (missingDlg.length === 0) {
      console.log(`  ✓ 대사 누락 없음`)
    } else {
      console.log(`  ✗ 대사 누락 ${missingDlg.length}건:`)
      for (const d of missingDlg)
        console.log(`    EP${String(d.episode_id).padStart(2,'0')} id=${d.id} ${d.speaker}: ${d.text_ko}`)
    }

    const { data: allExpr } = await sb.from('kp_expressions').select('id, korean, audio_url, episodes')
    const missingExpr = (allExpr ?? []).filter(e => {
      const eps = Array.isArray(e.episodes) ? e.episodes : []
      return eps.some((ep: number) => ep >= EP_FROM && ep <= EP_TO) && !e.audio_url
    })
    if (missingExpr.length === 0) {
      console.log(`  ✓ 표현 누락 없음`)
    } else {
      console.log(`  ✗ 표현 누락 ${missingExpr.length}건:`)
      for (const e of missingExpr) console.log(`    id=${e.id} ${e.korean}`)
    }
  }

  // ── 보고 ────────────────────────────────────────────────────────────────────
  if (rpdHit) console.log(`\n[RPD] 일일 한도 소진. 태평양 자정(한국 오후 4~5시) 이후 재실행하세요.`)

  const elapsed = ((Date.now() - t0) / 1000 / 60).toFixed(1)
  console.log(`\n생성 완료  경과: ${elapsed}분`)
  console.log(`대사: ${dGenTotal}건  표현: ${eGenTotal}건  실패: ${failures.length}건`)

  if (failures.length > 0) {
    fs.writeFileSync(FAIL_LOG, JSON.stringify(failures, null, 2))
    console.log(`실패 목록 → ${FAIL_LOG}`)
  }

  const RATE_PER_CHAR = 0.075 / 1000
  const KRW_PER_USD   = 1400
  const estCostUSD    = charTotal * RATE_PER_CHAR
  const estCostKRW    = Math.round(estCostUSD * KRW_PER_USD)
  console.log(`\n[비용]  ${charTotal.toLocaleString()}자  →  $${estCostUSD.toFixed(4)} ≈ ₩${estCostKRW.toLocaleString()}`)
  console.log(`잔여 크레딧 추산: ₩${(16000 - estCostKRW).toLocaleString()} (₩16,000 기준)`)
}

main().catch(e => {
  if (e instanceof RpdError) process.exit(0)
  console.error(e)
  process.exit(1)
})
