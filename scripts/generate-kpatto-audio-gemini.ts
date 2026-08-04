/**
 * K-PATTO Gemini TTS 음성 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 1
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 1 --ep 30
 *
 * 화자 보이스:  에마=Kore  지수=Zephyr  민준=Umbriel  소피=Aoede
 * 표현 가이드:  Iapetus (단일 보이스)
 * audio_hash:  sha256(text | voice | prompt).slice(0,16)
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
  console.error('Usage: npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 1')
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

const MODEL_FLASH = 'gemini-2.5-flash-preview-tts'

const GUIDE_VOICE = 'Iapetus'

const VOICE_MAP: Record<string, string> = {
  emma:   'Kore',
  jisu:   'Zephyr',
  jisoo:  'Zephyr',
  minjun: 'Umbriel',
  sophie: 'Aoede',
  // 조연
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

// 발음 프롬프트
function dialoguePrompt(text: string): string {
  return `자연스럽게, 받침을 분명하게 발음해줘: ${text}`
}
function patternPromptText(text: string): string {
  return `또박또박 천천히, 받침을 분명하게 발음해줘: ${text}`
}
function examplePromptText(text: string): string {
  return `자연스러운 대화 속도로, 받침을 분명하게 발음해줘: ${text}`
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
  header.writeUInt32LE(16, 16);  header.writeUInt16LE(1, 20)           // PCM
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * channels * bitDepth / 8, 28)
  header.writeUInt16LE(channels * bitDepth / 8, 32)
  header.writeUInt16LE(bitDepth, 34)
  header.write('data', 36);      header.writeUInt32LE(dataLen, 40)
  return Buffer.concat([header, pcm])
}

/** Extract PCM from a WAV buffer (finds 'data' chunk) */
function wavToPcm(wav: Buffer): Buffer {
  for (let i = 12; i < wav.length - 4; i++) {
    if (wav[i] === 0x64 && wav[i+1] === 0x61 && wav[i+2] === 0x74 && wav[i+3] === 0x61) {
      const dataSize = wav.readUInt32LE(i + 4)
      return wav.slice(i + 8, i + 8 + dataSize)
    }
  }
  return wav.slice(44)
}

/** 지정 ms 무음 WAV */
function silenceWav(ms: number, sampleRate = 24000): Buffer {
  return pcmToWav(Buffer.alloc(Math.round(sampleRate * ms / 1000) * 2))
}

/** 여러 WAV를 PCM 레벨에서 이어 붙여 단일 WAV로 반환 */
function concatWavs(wavs: Buffer[]): Buffer {
  if (wavs.length === 0) return pcmToWav(Buffer.alloc(0))
  if (wavs.length === 1) return wavs[0]
  return pcmToWav(Buffer.concat(wavs.map(wavToPcm)))
}

/** pattern_ko → TTS 읽기용 텍스트 */
function cleanPattern(raw: string): string {
  const cleaned = raw
    .replace(/~/g, '')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/^-+|-+$/g, '')
    .trim()
  // 조사 하나만 남은 경우 (공백 없고 3자 이하) → 예문만 사용
  if (!cleaned.includes(' ') && cleaned.replace(/[가-힣]/g, '').length === 0 && cleaned.length <= 3) return ''
  return cleaned
}

// ── Gemini TTS API ────────────────────────────────────────────────────────────
async function tts(text: string, voice: string, model = MODEL_FLASH): Promise<Buffer> {
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }

  const MAX_RETRIES = 5
  for (let attempt = 1; ; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)
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

      // Retry-After 헤더 우선, 없으면 응답 본문의 retryDelay
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

      // 한도 정보 추출 (RPM/RPD/TPM 등)
      const quotaInfo = (() => {
        const violations = errBody?.error?.details?.filter((d: any) => d['@type']?.includes('QuotaFailure')) ?? []
        if (violations.length > 0) return JSON.stringify(violations)
        return rawText.slice(0, 400)
      })()

      console.log(`\n  [429] attempt ${attempt}/${MAX_RETRIES}, wait ${Math.round(retryAfterMs/1000)}s`)
      console.log(`  quota: ${quotaInfo}`)

      if (attempt >= MAX_RETRIES) {
        throw new Error(`429 after ${MAX_RETRIES} retries. Last body: ${rawText.slice(0, 200)}`)
      }
      await sleep(retryAfterMs)
      continue
    }

    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)

    const json = await res.json() as any
    const candidate = json?.candidates?.[0]
    const part = candidate?.content?.parts?.[0]?.inlineData

    // finishReason: OTHER → transient rejection, retry
    if (!part?.data) {
      const reason = candidate?.finishReason ?? 'unknown'
      if (reason === 'OTHER' && attempt < MAX_RETRIES) {
        console.log(`\n  [OTHER] attempt ${attempt}/${MAX_RETRIES}, retrying in 3s`)
        await sleep(3000)
        continue
      }
      throw new Error(`No audio data (finishReason=${reason}). Response: ${JSON.stringify(json).slice(0, 300)}`)
    }

    const raw  = Buffer.from(part.data, 'base64')
    const mime = (part.mimeType ?? '') as string
    return mime.includes('wav') || mime.includes('wave') ? raw : pcmToWav(raw)
  }
}

// ── Supabase Storage upload ────────────────────────────────────────────────────
async function upload(buf: Buffer, storagePath: string): Promise<string> {
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'audio/wav', upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const failures: Array<{ id: number; type: string; text: string; error: string }> = []
  let charTotal = 0
  let dGenTotal = 0
  let eGenTotal = 0
  const t0 = Date.now()

  console.log(`\n=== K-PATTO Gemini TTS  EP${EP_FROM}${EP_TO > EP_FROM ? `–${EP_TO}` : ''} ===`)
  console.log(`Model: ${MODEL_FLASH}\n`)

  for (let epNum = EP_FROM; epNum <= EP_TO; epNum++) {
    console.log(`\n── EP${String(epNum).padStart(2,'0')} ─────────────────────────────`)

    // ── [1] 대사 ───────────────────────────────────────────────────────────────
    const { data: dialogues, error: dErr } = await sb
      .from('kp_dialogues')
      .select('id, speaker, text_ko, audio_url, audio_hash')
      .eq('episode_id', epNum)
      .order('order_num')
    if (dErr) { console.error('kp_dialogues error:', dErr.message); continue }
    console.log(`[1] 대사 ${dialogues?.length ?? 0}건`)

    const dList = dialogues ?? []
    const dTotal = dList.length
    let dGen = 0, dSkip = 0, dIdx = 0

    for (const d of dList) {
      dIdx++
      const voice = getVoice(d.speaker)
      const prompt = dialoguePrompt(d.text_ko)
      const hash = contentHash(d.text_ko, voice, prompt)
      if (d.audio_url && d.audio_hash === hash) { dSkip++; console.log(`  [${dIdx}/${dTotal}] ${d.id} skip`); continue }

      const t1 = Date.now()
      process.stdout.write(`  [${dIdx}/${dTotal}] ${d.id} ${d.speaker}(${voice}): ${d.text_ko.slice(0,20)} ... `)
      try {
        charTotal += prompt.length

        const wav = await tts(prompt, voice)
        const storagePath = `dialogues/ep${String(epNum).padStart(2,'0')}/${d.id}.wav`
        const url = await upload(wav, storagePath)

        await sb.from('kp_dialogues').update({ audio_url: url, audio_hash: hash }).eq('id', d.id)
        await sb.from('kp_bubbles').update({ audio_url: url }).eq('episode_id', epNum).eq('korean', d.text_ko)

        dGen++
        console.log(`OK (${((Date.now()-t1)/1000).toFixed(1)}s)`)
      } catch (e: any) {
        console.log(`FAIL`)
        console.error(`    ${e.message.slice(0, 200)}`)
        failures.push({ id: d.id, type: 'dialogue', text: d.text_ko, error: e.message })
      }
    }
    dGenTotal += dGen
    console.log(`  대사 결과: 생성 ${dGen}  스킵 ${dSkip}  실패 ${failures.filter(f=>f.type==='dialogue').length}`)

    // ── [2] 핵심표현 팝업 음성 ─────────────────────────────────────────────────
    const { data: exprs } = await sb
      .from('kp_expressions')
      .select('id, korean, examples, audio_url, audio_hash')
      .contains('episodes', JSON.stringify([epNum]))
    const eList = exprs ?? []
    console.log(`[2] 표현 ${eList.length}건`)

    let eIdx = 0
    for (const expr of eList) {
      eIdx++
      const examples: Array<{ ko: string }> = expr.examples ?? []
      const patternText = cleanPattern(expr.korean)

      // 세그먼트별 TTS 프롬프트 구성
      const segPrompts: string[] = []
      if (patternText) segPrompts.push(patternPromptText(patternText))
      for (const e of examples) segPrompts.push(examplePromptText(e.ko))

      if (segPrompts.length === 0) {
        console.log(`  [${eIdx}/${eList.length}] expr ${expr.id} skip (no segments)`)
        continue
      }

      // hash = sha256(all prompts joined | voice)
      const hashInput = segPrompts.join('§') + '|' + GUIDE_VOICE
      const hash = createHash('sha256').update(hashInput, 'utf8').digest('hex').slice(0, 16)

      if (expr.audio_url && expr.audio_hash === hash) {
        console.log(`  [${eIdx}/${eList.length}] expr ${expr.id} skip (${expr.korean})`)
        continue
      }

      const te1 = Date.now()
      console.log(`  [${eIdx}/${eList.length}] expr ${expr.id}: ${expr.korean} → ${GUIDE_VOICE} (${segPrompts.length} segments)`)
      try {
        const segments: Buffer[] = []
        let si = 0

        if (patternText) {
          process.stdout.write(`    pattern ... `)
          segments.push(await tts(segPrompts[si], GUIDE_VOICE))
          console.log(`OK`)
          charTotal += segPrompts[si].length
          si++
          segments.push(silenceWav(700))
        }

        for (let i = 0; i < examples.length; i++, si++) {
          process.stdout.write(`    ex${i+1} ... `)
          segments.push(await tts(segPrompts[si], GUIDE_VOICE))
          console.log(`OK`)
          charTotal += segPrompts[si].length
          if (i < examples.length - 1) segments.push(silenceWav(700))
        }

        const combined = concatWavs(segments)
        const storagePath = `expressions/${expr.id}.wav`
        const url = await upload(combined, storagePath)

        await sb.from('kp_expressions').update({ audio_url: url, audio_hash: hash }).eq('id', expr.id)
        console.log(`  → ${storagePath} (${((Date.now()-te1)/1000).toFixed(1)}s total)`)
        eGenTotal++
      } catch (e: any) {
        console.log(`FAIL`)
        console.error(`    ${e.message.slice(0, 200)}`)
        failures.push({ id: expr.id, type: 'expression', text: expr.korean, error: e.message })
      }
    }
  }

  // ── 보고 ──────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  const epCount = EP_TO - EP_FROM + 1
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`생성 완료  경과: ${elapsed}s`)
  console.log(`대사: ${dGenTotal}건  표현: ${eGenTotal}건`)
  console.log(`실패: ${failures.length}건`)

  if (failures.length > 0) {
    fs.writeFileSync(FAIL_LOG, JSON.stringify(failures, null, 2))
    console.log(`실패 목록 → ${FAIL_LOG}`)
  }

  // 비용 추산 (gemini-2.5-flash-preview-tts 기준)
  // TTS 입력 텍스트 기준 과금 — 실제 단가는 Google Cloud 콘솔 확인
  // 참고: flash TTS ≈ $0.075/1K chars (Google AI Studio 공개 단가)
  const RATE_PER_CHAR = 0.075 / 1000   // $0.000075/char
  const KRW_PER_USD   = 1400
  const estCostUSD    = charTotal * RATE_PER_CHAR
  const estCostKRW    = Math.round(estCostUSD * KRW_PER_USD)
  const perDialogUSD  = dGenTotal > 0 ? (estCostUSD / dGenTotal) : 0

  console.log(`\n[비용 추산]`)
  console.log(`  총 문자 수 (프롬프트 포함): ${charTotal.toLocaleString()}자`)
  console.log(`  추산 비용: $${estCostUSD.toFixed(4)} ≈ ₩${estCostKRW.toLocaleString()}`)
  if (dGenTotal > 0) {
    console.log(`  대사 1건당 평균: $${perDialogUSD.toFixed(6)} ≈ ₩${(perDialogUSD * KRW_PER_USD).toFixed(2)}`)
  }

  // EP01-30 전체 추산 (EP01 실측 기반)
  if (epCount === 1 && charTotal > 0) {
    const ep30Chars = charTotal * 30
    const ep30USD   = ep30Chars * RATE_PER_CHAR
    const ep30KRW   = Math.round(ep30USD * KRW_PER_USD)
    console.log(`\n  EP01-30 전체 추산 (EP01 × 30): ~${ep30Chars.toLocaleString()}자`)
    console.log(`  → $${ep30USD.toFixed(3)} ≈ ₩${ep30KRW.toLocaleString()} (목표 ₩16,000 이내: ${ep30KRW <= 16000 ? '✓ OK' : '✗ 초과'})`)
  }
}

main().catch(console.error)
