/**
 * K-PATTO Gemini TTS 음성 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 1
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 2 --ep 30
 *
 * 화자 보이스:  에마=Kore  지수=Zephyr  민준=Umbriel  소피=Aoede
 * 표현 가이드:  Iapetus (단일 보이스)
 * audio_hash:  sha256(text | voice | prompt).slice(0,16)
 * 딜레이:      RPM 10 기준 6.5초/호출 (429 시 Retry-After 준수)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const epArgs: number[] = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ep' && args[i + 1]) epArgs.push(parseInt(args[++i]))
}
if (epArgs.length === 0) {
  console.error('Usage: npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 2 --ep 30')
  process.exit(1)
}
const EP_FROM = Math.min(...epArgs)
const EP_TO   = Math.max(...epArgs)

// ── Config ───────────────────────────────────────────────────────────────────
const GEMINI_KEY   = process.env.GEMINI_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'audio'
const FAIL_LOG     = `scripts/audio-failures-ep${EP_FROM}-${EP_TO}.json`
const PROGRESS_LOG = `scripts/audio-progress-ep${EP_FROM}-${EP_TO}.json`

const MODEL_FLASH = 'gemini-2.5-flash-preview-tts'
const MODEL_PRO   = 'gemini-2.5-pro-preview-tts'

// RPM 10 → 최소 6초, 여유 0.5초
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
function patternPromptText(text: string): string {
  return `또박또박 천천히, 받침을 분명하게 발음해줘: ${text}`
}
function examplePromptText(text: string): string {
  return `자연스러운 대화 속도로, 받침을 분명하게 발음해줘: ${text}`
}

type TtsType = 'dialogue' | 'pattern' | 'example'
function buildPrompt(text: string, type: TtsType): string {
  if (type === 'dialogue') return dialoguePrompt(text)
  if (type === 'pattern')  return patternPromptText(text)
  return examplePromptText(text)
}

function contentHash(text: string, voice: string, prompt: string): string {
  return createHash('sha256').update(text + '|' + voice + '|' + prompt, 'utf8').digest('hex').slice(0, 16)
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

/** Wrap raw PCM (16-bit, 24000Hz, mono) in a WAV header */
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

function wavToPcm(wav: Buffer): Buffer {
  for (let i = 12; i < wav.length - 4; i++) {
    if (wav[i] === 0x64 && wav[i+1] === 0x61 && wav[i+2] === 0x74 && wav[i+3] === 0x61) {
      const dataSize = wav.readUInt32LE(i + 4)
      return wav.slice(i + 8, i + 8 + dataSize)
    }
  }
  return wav.slice(44)
}

function silenceWav(ms: number, sampleRate = 24000): Buffer {
  return pcmToWav(Buffer.alloc(Math.round(sampleRate * ms / 1000) * 2))
}

function concatWavs(wavs: Buffer[]): Buffer {
  if (wavs.length === 0) return pcmToWav(Buffer.alloc(0))
  if (wavs.length === 1) return wavs[0]
  return pcmToWav(Buffer.concat(wavs.map(wavToPcm)))
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

// ── RPM 스로틀 ────────────────────────────────────────────────────────────────
let lastCallTime = 0
async function throttle() {
  const wait = DELAY_BETWEEN_CALLS - (Date.now() - lastCallTime)
  if (wait > 0) await sleep(wait)
  lastCallTime = Date.now()
}

// ── Gemini TTS API ────────────────────────────────────────────────────────────
const MAX_RETRIES = 5

async function tts(text: string, voice: string, model = MODEL_FLASH): Promise<Buffer> {
  await throttle()

  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }

  for (let attempt = 1; ; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45_000)
    let res: Response
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal }
      )
    } finally {
      clearTimeout(timeoutId)
    }

    if (res.status === 429) {
      const rawText = await res.text()
      let errBody: any = {}
      try { errBody = JSON.parse(rawText) } catch { /* noop */ }

      const retryAfterHeader = res.headers.get('Retry-After')
      const retryAfterMs = (() => {
        if (retryAfterHeader) {
          const sec = parseFloat(retryAfterHeader)
          if (!isNaN(sec)) return Math.ceil(sec * 1000) + 500
        }
        const details = errBody?.error?.details ?? []
        const delayStr: string = details.find((d: any) => d.retryDelay)?.retryDelay ?? ''
        const sec = parseFloat(delayStr)
        return isNaN(sec) ? Math.min(2000 * 2 ** (attempt - 1), 60_000) : Math.ceil(sec * 1000) + 500
      })()

      const quotaInfo = (() => {
        const violations = errBody?.error?.details?.filter((d: any) => d['@type']?.includes('QuotaFailure')) ?? []
        return violations.length > 0 ? JSON.stringify(violations).slice(0, 300) : rawText.slice(0, 200)
      })()

      process.stdout.write(`\n    [429] attempt ${attempt}/${MAX_RETRIES} wait ${Math.round(retryAfterMs/1000)}s\n    quota: ${quotaInfo}\n    `)
      if (attempt >= MAX_RETRIES) throw new Error(`429 after ${MAX_RETRIES} retries`)
      await sleep(retryAfterMs)
      lastCallTime = Date.now()  // 재시도는 스로틀 초기화
      continue
    }

    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)

    const json = await res.json() as any
    const candidate = json?.candidates?.[0]
    const part = candidate?.content?.parts?.[0]?.inlineData

    if (!part?.data) {
      const reason = candidate?.finishReason ?? 'unknown'
      if (reason === 'OTHER' && attempt < MAX_RETRIES) {
        process.stdout.write(`[OTHER retry ${attempt}] `)
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

// ── 폴백 전략 (OTHER 5회 후) ───────────────────────────────────────────────────
async function ttsWithFallback(rawText: string, voice: string, type: TtsType): Promise<Buffer> {
  const primaryPrompt = buildPrompt(rawText, type)

  // Strategy 1: 기본 프롬프트
  try {
    const wav = await tts(primaryPrompt, voice)
    if (wav.length < 1024) throw new Error(`too small: ${wav.length}B`)
    return wav
  } catch (e: any) {
    if (!e.message.includes('finishReason=OTHER') && !e.message.includes('too small')) throw e
    process.stdout.write(`[FB1:period] `)
  }

  // Strategy 2: 마침표 추가
  try {
    const wav = await tts(buildPrompt(rawText.replace(/[.!?]$/, '') + '.', type), voice)
    if (wav.length < 1024) throw new Error(`too small: ${wav.length}B`)
    return wav
  } catch { process.stdout.write(`[FB2:format] `) }

  // Strategy 3: 다른 프롬프트 형식
  try {
    const wav = await tts(`다음 문장을 읽어줘: '${rawText}'`, voice)
    if (wav.length < 1024) throw new Error(`too small: ${wav.length}B`)
    return wav
  } catch { process.stdout.write(`[FB3:pro] `) }

  // Strategy 4: pro 모델
  const wav = await tts(primaryPrompt, voice, MODEL_PRO)
  if (wav.length < 1024) throw new Error(`pro returned too small: ${wav.length}B`)
  return wav
}

// ── Supabase Storage upload ────────────────────────────────────────────────────
async function upload(buf: Buffer, storagePath: string): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'audio/wav', upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

// ── 화별 검증 ─────────────────────────────────────────────────────────────────
async function validateEpisode(epNum: number) {
  const { data } = await sb.from('kp_dialogues').select('id, speaker, text_ko, audio_url').eq('episode_id', epNum)
  const total = data?.length ?? 0
  const withAudio = data?.filter(d => d.audio_url).length ?? 0
  if (total === withAudio) {
    console.log(`  ✓ EP${String(epNum).padStart(2,'0')} 검증: ${withAudio}/${total} OK`)
  } else {
    console.log(`  ✗ EP${String(epNum).padStart(2,'0')} 검증: ${withAudio}/${total} — 누락!`)
    for (const d of data?.filter(d => !d.audio_url) ?? []) {
      console.log(`    MISSING id=${d.id} ${d.speaker}: ${d.text_ko}`)
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const failures: Array<{ ep: number; id: number; type: string; text: string; error: string }> = []
  const progress: Record<string, unknown> = {}
  let charTotal = 0
  let dGenTotal = 0
  let eGenTotal = 0
  const t0 = Date.now()

  const epRange = EP_TO > EP_FROM ? `EP${EP_FROM}–${EP_TO}` : `EP${EP_FROM}`
  console.log(`\n=== K-PATTO Gemini TTS  ${epRange} ===`)
  console.log(`Model: ${MODEL_FLASH}  |  딜레이: ${DELAY_BETWEEN_CALLS}ms (RPM ${Math.floor(60000/DELAY_BETWEEN_CALLS)})\n`)

  for (let epNum = EP_FROM; epNum <= EP_TO; epNum++) {
    const epLabel = `EP${String(epNum).padStart(2,'0')}`
    console.log(`\n── ${epLabel} ──────────────────────────────`)

    // ── [1] 대사 ───────────────────────────────────────────────────────────────
    const { data: dialogues, error: dErr } = await sb
      .from('kp_dialogues')
      .select('id, speaker, text_ko, audio_url, audio_hash')
      .eq('episode_id', epNum)
      .order('order_num')
    if (dErr) { console.error(`${epLabel} kp_dialogues error:`, dErr.message); continue }

    const dList = dialogues ?? []
    const dTotal = dList.length
    let dGen = 0, dSkip = 0

    console.log(`[1] 대사 ${dTotal}건`)
    for (let di = 0; di < dList.length; di++) {
      const d = dList[di]
      const voice = getVoice(d.speaker)
      const prompt = dialoguePrompt(d.text_ko)
      const hash = contentHash(d.text_ko, voice, prompt)
      const label = `[${epLabel} ${di+1}/${dTotal}]`

      if (d.audio_url && d.audio_hash === hash) {
        console.log(`${label} id=${d.id} skip`)
        dSkip++
        continue
      }

      const t1 = Date.now()
      process.stdout.write(`${label} id=${d.id} ${d.speaker}(${voice}) "${d.text_ko.slice(0,14).replace(/\n/g,' ')}…" `)

      try {
        charTotal += prompt.length
        const wav = await ttsWithFallback(d.text_ko, voice, 'dialogue')
        const storagePath = `dialogues/ep${String(epNum).padStart(2,'0')}/${d.id}.wav`
        const url = await upload(wav, storagePath)

        await sb.from('kp_dialogues').update({ audio_url: url, audio_hash: hash }).eq('id', d.id)
        await sb.from('kp_bubbles').update({ audio_url: url }).eq('episode_id', epNum).eq('korean', d.text_ko)

        dGen++
        console.log(`· ${((Date.now()-t1)/1000).toFixed(1)}s · OK`)
      } catch (e: any) {
        console.log(`· FAIL`)
        console.error(`    ${e.message.slice(0, 200)}`)
        failures.push({ ep: epNum, id: d.id, type: 'dialogue', text: d.text_ko, error: e.message })
      }
    }
    dGenTotal += dGen
    console.log(`  대사: 생성 ${dGen}  스킵 ${dSkip}  실패 ${failures.filter(f=>f.ep===epNum&&f.type==='dialogue').length}`)

    // 대사 검증
    await validateEpisode(epNum)

    // ── [2] 핵심표현 팝업 음성 ─────────────────────────────────────────────────
    const { data: exprs } = await sb
      .from('kp_expressions')
      .select('id, korean, examples, audio_url, audio_hash')
      .contains('episodes', JSON.stringify([epNum]))
    const eList = exprs ?? []
    console.log(`[2] 표현 ${eList.length}건`)

    let eGen = 0
    for (let ei = 0; ei < eList.length; ei++) {
      const expr = eList[ei]
      const examples: Array<{ ko: string }> = expr.examples ?? []
      const patternText = cleanPattern(expr.korean)

      const segItems: Array<{ raw: string; type: TtsType }> = []
      if (patternText) segItems.push({ raw: patternText, type: 'pattern' })
      for (const e of examples) segItems.push({ raw: e.ko, type: 'example' })

      if (segItems.length === 0) {
        console.log(`  [${epLabel} expr ${ei+1}/${eList.length}] id=${expr.id} skip (no segments)`)
        continue
      }

      const hashInput = segItems.map(s => buildPrompt(s.raw, s.type)).join('§') + '|' + GUIDE_VOICE
      const hash = createHash('sha256').update(hashInput, 'utf8').digest('hex').slice(0, 16)

      if (expr.audio_url && expr.audio_hash === hash) {
        console.log(`  [${epLabel} expr ${ei+1}/${eList.length}] id=${expr.id} skip (${expr.korean})`)
        continue
      }

      const te1 = Date.now()
      console.log(`  [${epLabel} expr ${ei+1}/${eList.length}] id=${expr.id} ${expr.korean} → ${GUIDE_VOICE} (${segItems.length} segs)`)

      try {
        const segments: Buffer[] = []

        for (let si = 0; si < segItems.length; si++) {
          const { raw, type } = segItems[si]
          const segLabel = type === 'pattern' ? 'pattern' : `ex${si + (patternText ? 0 : 1)}`
          process.stdout.write(`    ${segLabel} `)
          const wav = await ttsWithFallback(raw, GUIDE_VOICE, type)
          charTotal += buildPrompt(raw, type).length
          console.log(`OK`)
          segments.push(wav)
          if (si < segItems.length - 1) segments.push(silenceWav(700))
        }

        const combined = concatWavs(segments)
        const storagePath = `expressions/${expr.id}.wav`
        const url = await upload(combined, storagePath)

        await sb.from('kp_expressions').update({ audio_url: url, audio_hash: hash }).eq('id', expr.id)
        console.log(`  → ${storagePath} (${((Date.now()-te1)/1000).toFixed(1)}s total)`)
        eGen++
      } catch (e: any) {
        console.log(`FAIL`)
        console.error(`    ${e.message.slice(0, 200)}`)
        failures.push({ ep: epNum, id: expr.id, type: 'expression', text: expr.korean, error: e.message })
      }
    }
    eGenTotal += eGen
    console.log(`  표현: 생성 ${eGen}  실패 ${failures.filter(f=>f.ep===epNum&&f.type==='expression').length}`)

    // 진행 파일 저장
    progress[epLabel] = { dialogues: { gen: dGen, skip: dSkip, total: dTotal }, expressions: { gen: eGen, total: eList.length } }
    fs.writeFileSync(PROGRESS_LOG, JSON.stringify(progress, null, 2))
  }

  // ── 최종 검증 ─────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`[최종 검증] EP${EP_FROM}–${EP_TO} 누락 확인`)

  const { data: allDlg } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, audio_url')
    .gte('episode_id', EP_FROM)
    .lte('episode_id', EP_TO)
  const missingDlg = (allDlg ?? []).filter(d => !d.audio_url)
  if (missingDlg.length === 0) {
    console.log(`  ✓ 대사 누락 없음`)
  } else {
    console.log(`  ✗ 대사 누락 ${missingDlg.length}건:`)
    for (const d of missingDlg) {
      console.log(`    EP${String(d.episode_id).padStart(2,'0')} id=${d.id} ${d.speaker}: ${d.text_ko}`)
    }
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

  // ── 보고 ──────────────────────────────────────────────────────────────────
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
  console.log(`\n[비용]`)
  console.log(`  총 문자 수: ${charTotal.toLocaleString()}자`)
  console.log(`  추산: $${estCostUSD.toFixed(4)} ≈ ₩${estCostKRW.toLocaleString()}`)
  console.log(`  잔여 크레딧 추산: ₩${(16000 - estCostKRW).toLocaleString()} (₩16,000 기준)`)
}

main().catch(console.error)
