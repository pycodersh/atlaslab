/**
 * K-PATTO Gemini TTS 음성 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 9
 *   npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 1 --ep 30
 *
 * 화자 보이스:  에마=Kore  지수=Zephyr  민준=Puck  소피=Aoede
 * 표현 가이드:  Charon (+ Kore/Zephyr 비교 샘플)
 * 모델 비교:   첫 번째 대사를 flash/pro 양쪽으로 생성
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
  console.error('Usage: npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 9')
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

// 표현 가이드 보이스 (비교 포함)
const GUIDE_VOICES = ['Charon', 'Kore', 'Zephyr'] as const

const VOICE_MAP: Record<string, string> = {
  emma:   'Kore',
  jisu:   'Zephyr',
  jisoo:  'Zephyr',
  minjun: 'Puck',
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

function textHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16)
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
  header.writeUInt16LE(bitDepth, 36)
  header.write('data', 38);      header.writeUInt32LE(dataLen, 40)
  return Buffer.concat([header, pcm])
}

/** Extract PCM from a WAV buffer (finds 'data' chunk) */
function wavToPcm(wav: Buffer): Buffer {
  // search for 'data' marker
  for (let i = 12; i < wav.length - 4; i++) {
    if (wav[i] === 0x64 && wav[i+1] === 0x61 && wav[i+2] === 0x74 && wav[i+3] === 0x61) {
      const dataSize = wav.readUInt32LE(i + 4)
      return wav.slice(i + 8, i + 8 + dataSize)
    }
  }
  return wav.slice(44) // fallback: standard 44-byte header
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
  // 조사 하나만 남은 경우 (공백 없고 3자 이하) → 비워서 예문만 사용
  if (!cleaned.includes(' ') && cleaned.replace(/[가-힣]/g, '').length === 0 && cleaned.length <= 3) return ''
  return cleaned
}

// ── Gemini TTS API ────────────────────────────────────────────────────────────
async function tts(text: string, voice: string, model = MODEL_FLASH, instruction?: string): Promise<Buffer> {
  const promptText = instruction ? `(${instruction}) ${text}` : text

  const body = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }

  const MAX_RETRIES = 5
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )
    if (res.status === 429) {
      const errBody = await res.json().catch(() => ({})) as any
      const retryAfterMs = (() => {
        const delayStr: string = errBody?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay ?? ''
        const sec = parseFloat(delayStr)
        return isNaN(sec) ? Math.min(1000 * 2 ** attempt, 32000) : Math.ceil(sec * 1000) + 1000
      })()
      console.log(`  [429] attempt ${attempt}/${MAX_RETRIES}, retry in ${Math.round(retryAfterMs/1000)}s`)
      if (attempt >= MAX_RETRIES) throw new Error(`429 after ${MAX_RETRIES} retries: ${JSON.stringify(errBody?.error?.message ?? '').slice(0,120)}`)
      await sleep(retryAfterMs); continue
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)

    const json = await res.json() as any
    const part  = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData
    if (!part?.data) throw new Error(`No audio data. Response: ${JSON.stringify(json).slice(0, 300)}`)

    const raw  = Buffer.from(part.data, 'base64')
    const mime = (part.mimeType ?? '') as string
    // Gemini returns audio/wav (already has header) or audio/L16 (raw PCM)
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

    let modelCompared = false
    let dGen = 0, dSkip = 0

    for (const d of dialogues ?? []) {
      const hash = textHash(d.text_ko)
      if (d.audio_url && d.audio_hash === hash) { dSkip++; continue }

      const voice = getVoice(d.speaker)
      console.log(`  [${d.id}] ${d.speaker}(${voice}): ${d.text_ko}`)
      try {
        charTotal += d.text_ko.length

        const wav = await tts(d.text_ko, voice)
        const storagePath = `dialogues/ep${String(epNum).padStart(2,'0')}/${d.id}.wav`
        const url = await upload(wav, storagePath)

        // kp_dialogues 업데이트
        await sb.from('kp_dialogues').update({ audio_url: url, audio_hash: hash }).eq('id', d.id)
        // kp_bubbles.audio_url 도 동기화 (text 매칭)
        await sb.from('kp_bubbles').update({ audio_url: url }).eq('episode_id', epNum).eq('korean', d.text_ko)

        dGen++
        await sleep(2000)
      } catch (e: any) {
        console.error(`  FAIL: ${e.message}`)
        failures.push({ id: d.id, type: 'dialogue', text: d.text_ko, error: e.message })
      }
    }
    console.log(`  생성: ${dGen}  스킵: ${dSkip}  실패: ${failures.filter(f=>f.type==='dialogue').length}`)

    // ── [2] 핵심표현 팝업 음성 ─────────────────────────────────────────────────
    // EP별 표현 ID를 가져옴 (kp_expressions.episodes 배열에 epNum이 포함된 것)
    const { data: exprs } = await sb
      .from('kp_expressions')
      .select('id, korean, examples, audio_url, audio_hash')
      .contains('episodes', JSON.stringify([epNum]))
    console.log(`[2] 표현 ${exprs?.length ?? 0}건`)

    for (const expr of exprs ?? []) {
      const examples: Array<{ ko: string }> = expr.examples ?? []
      const patternText = cleanPattern(expr.korean)
      const scriptKey = [patternText, ...examples.map(e => e.ko)].join('|')
      const hash = textHash(scriptKey)

      for (let vi = 0; vi < GUIDE_VOICES.length; vi++) {
        const voice = GUIDE_VOICES[vi]
        const isMain = vi === 0
        // 메인(Charon)이 최신이면 비교 샘플도 스킵
        if (isMain && expr.audio_url && expr.audio_hash === hash) {
          console.log(`  [expr ${expr.id}] skip (${expr.korean})`)
          break
        }

        const label = isMain ? 'main' : `cmp_${voice.toLowerCase()}`
        console.log(`  [expr ${expr.id}] ${expr.korean} → voice:${voice} (${label})`)
        try {
          const segments: Buffer[] = []
          if (patternText) {
            segments.push(await tts(patternText, voice))
            charTotal += patternText.length
            await sleep(2000)
            segments.push(silenceWav(700))
          }
          for (let i = 0; i < examples.length; i++) {
            segments.push(await tts(examples[i].ko, voice))
            charTotal += examples[i].ko.length
            await sleep(2000)
            if (i < examples.length - 1) segments.push(silenceWav(700))
          }

          const combined = concatWavs(segments)
          const storagePath = isMain
            ? `expressions/${expr.id}.wav`
            : `expressions/${expr.id}_cmp_${voice.toLowerCase()}.wav`
          const url = await upload(combined, storagePath)

          if (isMain) {
            await sb.from('kp_expressions').update({ audio_url: url, audio_hash: hash }).eq('id', expr.id)
          }
          console.log(`  → ${storagePath}`)
          await sleep(2000)
        } catch (e: any) {
          console.error(`  FAIL expr ${expr.id} voice ${voice}: ${e.message}`)
          failures.push({ id: expr.id, type: `expression_${voice}`, text: scriptKey, error: e.message })
        }
      }
    }
  }

  // ── 보고 ──────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`생성 완료  경과: ${elapsed}s`)
  console.log(`총 문자 수: ${charTotal.toLocaleString()}자`)
  console.log(`실패: ${failures.length}건`)

  if (failures.length > 0) {
    fs.writeFileSync(FAIL_LOG, JSON.stringify(failures, null, 2))
    console.log(`실패 목록 → ${FAIL_LOG}`)
  }

  // 비용 추정 (Gemini TTS 공개 단가 기준 — 확인 필요)
  // gemini-2.5-flash-preview-tts: $0.075/1M chars (입력 기준 추정)
  const estCostUSD = charTotal / 1_000_000 * 75  // $75/1M = rough estimate
  console.log(`\n비용 추산 (rough): $${estCostUSD.toFixed(4)} (${charTotal.toLocaleString()}자 × $75/1M)`)
  console.log(`전체 환산 (대사 ~900건 + 표현 325개): ~${(900*25 + 325*100)} 문자 → $${((900*25 + 325*100)/1_000_000*75).toFixed(3)} 예상`)
}

main().catch(console.error)
