/**
 * EP59(기존 Gemini) vs EP61~70(신규 Gemini) 음성 특성 대조
 *  - WAV 포맷(샘플레이트/채널/비트) 동일 여부
 *  - 발화 속도(자/초), RMS 레벨, 클리핑, 무음 비율 → 뭉개짐/이상 탐지 프록시
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function analyze(buf: Buffer) {
  const fmt = {
    riff: buf.toString('ascii', 0, 4),
    wave: buf.toString('ascii', 8, 12),
    channels: buf.readUInt16LE(22),
    sampleRate: buf.readUInt32LE(24),
    bits: buf.readUInt16LE(34),
  }
  const pcm = buf.subarray(44)
  const n = Math.floor(pcm.length / 2)
  let sumSq = 0, peak = 0, clipped = 0
  // 20ms 프레임 단위 무음 비율
  const frame = Math.floor(fmt.sampleRate * 0.02)
  let silentFrames = 0, frames = 0, frameSum = 0, idxInFrame = 0
  for (let i = 0; i < n; i++) {
    const s = pcm.readInt16LE(i * 2)
    const a = Math.abs(s)
    sumSq += s * s
    if (a > peak) peak = a
    if (a >= 32700) clipped++
    frameSum += s * s
    if (++idxInFrame >= frame) {
      frames++
      if (Math.sqrt(frameSum / frame) < 300) silentFrames++
      frameSum = 0; idxInFrame = 0
    }
  }
  const rms = Math.sqrt(sumSq / n)
  return {
    fmt,
    seconds: n / fmt.sampleRate,
    rmsDb: (20 * Math.log10(rms / 32768)),
    peakDb: (20 * Math.log10(peak / 32768)),
    clippedPct: (clipped / n) * 100,
    silentPct: frames ? (silentFrames / frames) * 100 : 0,
  }
}

async function row(label: string, speaker: string, text: string, url: string) {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const a = analyze(buf)
  const chars = text.replace(/\s/g, '').length
  console.log(
    `${label.padEnd(14)} ${speaker.padEnd(7)} ${a.fmt.sampleRate}Hz/${a.fmt.channels}ch/${a.fmt.bits}bit  ` +
    `${a.seconds.toFixed(2)}초  ${(chars / a.seconds).toFixed(2)}자/초  ` +
    `RMS ${a.rmsDb.toFixed(1)}dB  peak ${a.peakDb.toFixed(1)}dB  클립 ${a.clippedPct.toFixed(3)}%  무음 ${a.silentPct.toFixed(0)}%`
  )
  console.log(`${' '.repeat(14)} "${text}"`)
  return { chars, ...a }
}

async function main() {
  console.log('=== 기존 Gemini 기준선 (EP57~59) ===')
  const { data: base } = await sb.from('kp_dialogues')
    .select('episode_id, id, speaker, text_ko, audio_url')
    .gte('episode_id', 57).lte('episode_id', 59)
    .not('audio_url', 'is', null).order('episode_id').order('order_num')
  const baseSel = (base ?? []).filter(d => ['emma','minjun','jisu','sophie'].includes(d.speaker))
  const pickBase = [
    baseSel.find(d => d.speaker === 'emma'),
    baseSel.find(d => d.speaker === 'minjun'),
    baseSel.find(d => d.speaker === 'sophie') ?? baseSel.find(d => d.speaker === 'jisu'),
  ].filter(Boolean) as typeof baseSel
  const baseStats = []
  for (const d of pickBase) baseStats.push(await row(`EP${d.episode_id} id=${d.id}`, d.speaker, d.text_ko, d.audio_url))

  console.log('\n=== 신규 EP61~70 임의 3건 ===')
  const { data: nw } = await sb.from('kp_dialogues')
    .select('episode_id, id, speaker, text_ko, audio_url')
    .gte('episode_id', 61).lte('episode_id', 70)
    .not('audio_url', 'is', null).order('episode_id').order('order_num')
  const list = nw ?? []
  const picks = [list[6], list[Math.floor(list.length / 2)], list[list.length - 3]]
  const newStats = []
  for (const d of picks) newStats.push(await row(`EP${d.episode_id} id=${d.id}`, d.speaker, d.text_ko, d.audio_url))

  console.log('\n=== 전체 84건 발화 속도 분포 (뭉개짐/과속 탐지) ===')
  const rates: Array<{ ep: number; id: number; sp: string; rate: number; t: string }> = []
  for (const d of list) {
    const res = await fetch(d.audio_url, { method: 'HEAD' })
    const len = parseInt(res.headers.get('content-length') ?? '0')
    const sec = (len - 44) / 48000
    rates.push({ ep: d.episode_id, id: d.id, sp: d.speaker, rate: d.text_ko.replace(/\s/g, '').length / sec, t: d.text_ko })
  }
  const sorted = [...rates].sort((a, b) => a.rate - b.rate)
  const med = sorted[Math.floor(sorted.length / 2)].rate
  console.log(`중앙값 ${med.toFixed(2)}자/초 · 최소 ${sorted[0].rate.toFixed(2)} · 최대 ${sorted.at(-1)!.rate.toFixed(2)}`)
  console.log('가장 빠른(뭉개짐 의심) 5건:')
  for (const r of sorted.slice(-5).reverse()) console.log(`   EP${r.ep} id=${r.id} [${r.sp}] ${r.rate.toFixed(2)}자/초 — "${r.t}"`)
  const baseRate = baseStats.map(b => b.chars / b.seconds)
  console.log(`기존 EP57~59 표본 속도: ${baseRate.map(r => r.toFixed(2)).join(', ')}자/초`)
}

main().catch(e => { console.error(e); process.exit(1) })
