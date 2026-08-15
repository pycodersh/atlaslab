/**
 * EP01~05 표현 음성 검증 (읽기 전용)
 *  - audio_urls 76건: HTTP 200 / 0바이트 없음 / 1초 미만 없음
 *  - 표현별 pattern 재생 길이·글자수, 2~3자 패턴이 1.5~2.5초인지
 *  - pattern이 예문보다 느린지 (자/초 비교)
 * 공개 URL을 캐시 우회(?v=)로 직접 받아 실측한다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
const BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
const RATES_V1 = [44100, 48000, 32000], RATES_V2 = [22050, 24000, 16000], RATES_V25 = [11025, 12000, 8000]

function audioInfo(buf: Buffer): { sec: number; format: string } {
  if (buf.length > 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
    const sr = buf.readUInt32LE(24), ch = buf.readUInt16LE(22), bits = buf.readUInt16LE(34), ds = buf.readUInt32LE(40)
    return { sec: ds / (sr * ch * (bits / 8)), format: 'WAV' }
  }
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10) {
    i = 10 + (((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f))
  }
  let sec = 0, frames = 0
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
    sec += samples / rate; frames++; i += len
  }
  return { sec, format: frames > 0 ? 'MP3' : 'UNKNOWN' }
}

async function main() {
  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, slug, first_episode, korean, examples, audio_urls, audio_url, audio_hash')
    .in('first_episode', [1, 2, 3, 4, 5]).order('first_episode').order('id')
  if (error) throw error
  const exprs = data ?? []

  const stamp = process.env.CACHE_BUST ?? String(exprs.length * 7919)
  type R = { slug: string; part: string; text: string; sec: number; bytes: number; status: number; format: string; chars: number }
  const rows: R[] = []

  console.log(`검증 대상: 표현 ${exprs.length}개 × 4 = ${exprs.length * 4}건\n`)

  for (const e of exprs) {
    const urls = (e.audio_urls ?? {}) as Record<string, string>
    const ex = (typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples) as Array<{ ko: string }>
    const texts: Record<string, string> = {
      pattern: e.korean.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim(),
      ex1: ex[0]?.ko ?? '', ex2: ex[1]?.ko ?? '', ex3: ex[2]?.ko ?? '',
    }
    for (const part of ['pattern', 'ex1', 'ex2', 'ex3']) {
      const url = urls[part]
      if (!url) { console.log(`⚠️ ${e.slug}/${part}: URL 없음`); continue }
      const res = await fetch(`${url}?v=${stamp}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const { sec, format } = audioInfo(buf)
      rows.push({ slug: e.slug, part, text: texts[part], sec, bytes: buf.length, status: res.status, format, chars: texts[part].replace(/\s/g, '').length })
    }
  }

  // ── 1. 기본 검증 ────────────────────────────────────────────────────────────
  const bad = rows.filter(r => r.status !== 200 || r.bytes === 0 || r.sec < 1)
  console.log('=== 1. URL 200 / 0바이트 / 1초 미만 ===')
  console.log(`검사 ${rows.length}건`)
  if (bad.length === 0) console.log('✅ 전부 HTTP 200 · 0바이트 없음 · 1초 미만 없음')
  else for (const b of bad) console.log(`❌ ${b.slug}/${b.part}: HTTP ${b.status} ${b.bytes}B ${b.sec.toFixed(2)}s`)
  const fmts = [...new Set(rows.map(r => r.format))]
  console.log(`포맷: ${fmts.join(', ')}`)

  // ── 2. 패턴 길이 & 속도 ─────────────────────────────────────────────────────
  console.log('\n=== 2. 표현별 pattern 길이 / 속도 ===')
  console.log('slug                  패턴            글자  길이(s)  pat 자/초  예문 자/초  느림?  2~3자 1.5~2.5s')
  let slowFail = 0, rangeFail = 0
  for (const e of exprs) {
    const p = rows.find(r => r.slug === e.slug && r.part === 'pattern')
    const xs = rows.filter(r => r.slug === e.slug && r.part !== 'pattern')
    if (!p || xs.length === 0) continue
    const pc = p.chars / p.sec
    const xc = xs.reduce((s, r) => s + r.chars / r.sec, 0) / xs.length
    const slower = pc < xc
    if (!slower) slowFail++
    const isShort = p.chars <= 3
    const inRange = !isShort || (p.sec >= 1.5 && p.sec <= 2.5)
    if (!inRange) rangeFail++
    console.log(
      `${e.slug.padEnd(21)} ${p.text.padEnd(14)} ${String(p.chars).padStart(4)}  ${p.sec.toFixed(2).padStart(6)}  ` +
      `${pc.toFixed(2).padStart(8)}  ${xc.toFixed(2).padStart(9)}  ${slower ? ' ✓  ' : ' ❌ '}  ${isShort ? (inRange ? '✓' : `❌ ${p.sec.toFixed(2)}s`) : '—'}`
    )
  }
  console.log(`\n패턴이 예문보다 느린가: ${exprs.length - slowFail}/${exprs.length} 통과`)
  const shortCount = exprs.filter(e => {
    const p = rows.find(r => r.slug === e.slug && r.part === 'pattern'); return p && p.chars <= 3
  }).length
  console.log(`2~3자 패턴 1.5~2.5초: ${shortCount - rangeFail}/${shortCount} 통과`)

  // ── 3. audio_url(통합) 미변경 확인 ─────────────────────────────────────────
  console.log('\n=== 3. audio_url(통합 파일) 보존 확인 ===')
  const kept = exprs.filter(e => e.audio_url && e.audio_hash).length
  console.log(`audio_url + audio_hash 유지: ${kept}/${exprs.length}개`)
  console.log(`예: ${exprs[0].slug} → ${exprs[0].audio_url}`)
}

main().catch(e => { console.error(e); process.exit(1) })
