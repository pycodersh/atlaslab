/**
 * 표현 음성 전건 검증 (읽기 전용)
 *  - kp_expressions 전체의 audio_urls 4키 충족 여부
 *  - 각 URL HTTP 200 / 0바이트 없음 / 1초 미만 없음
 *  - 2~3자 패턴 1.5~2.5초 범위 밖 목록
 *  - pattern이 예문보다 느린지
 *  - audio_url(통합 파일)·audio_hash 보존 확인
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const B1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
const B2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
const R1 = [44100,48000,32000], R2 = [22050,24000,16000], R25 = [11025,12000,8000]

function audioInfo(buf: Buffer): { sec: number; format: string } {
  if (buf.length > 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
    const sr = buf.readUInt32LE(24), ch = buf.readUInt16LE(22), bits = buf.readUInt16LE(34), ds = buf.readUInt32LE(40)
    return { sec: ds / (sr * ch * (bits / 8)), format: 'WAV' }
  }
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10) {
    i = 10 + (((buf[6]&0x7f)<<21)|((buf[7]&0x7f)<<14)|((buf[8]&0x7f)<<7)|(buf[9]&0x7f))
  }
  let sec = 0, frames = 0
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i+1] & 0xe0) !== 0xe0) { i++; continue }
    const ver=(buf[i+1]>>3)&3, layer=(buf[i+1]>>1)&3, br=(buf[i+2]>>4)&15, sr=(buf[i+2]>>2)&3, pad=(buf[i+2]>>1)&1
    if (layer!==1||ver===1||br===0||br===15||sr===3) { i++; continue }
    const isV1=ver===3, bitrate=(isV1?B1[br]:B2[br])*1000
    const rate=(ver===3?R1:ver===2?R2:R25)[sr], samples=isV1?1152:576
    const len=Math.floor((samples/8)*bitrate/rate)+pad
    if (len<=4) { i++; continue }
    sec += samples/rate; frames++; i += len
  }
  return { sec, format: frames > 0 ? 'MP3' : 'UNKNOWN' }
}

const KEYS = ['pattern', 'ex1', 'ex2', 'ex3'] as const

async function main() {
  const all: any[] = []
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from('kp_expressions')
      .select('id, slug, first_episode, korean, examples, audio_urls, audio_url, audio_hash')
      .order('first_episode').order('id').range(f, f + 999)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  console.log(`kp_expressions 전체 ${all.length}개\n`)

  // ── 1. audio_urls 4키 충족 ─────────────────────────────────────────────────
  const noUrls = all.filter(e => !e.audio_urls)
  const missingKeys = all.filter(e => e.audio_urls && KEYS.some(k => !(e.audio_urls as any)[k]))
  console.log('=== 1. audio_urls 4키 충족 ===')
  console.log(`audio_urls 없음: ${noUrls.length}개 ${noUrls.map(e => e.slug).slice(0, 10).join(', ')}`)
  console.log(`4키 미충족: ${missingKeys.length}개`)
  for (const e of missingKeys.slice(0, 10)) {
    console.log(`   ${e.slug}: 있는 키 ${Object.keys(e.audio_urls).join(',')}`)
  }
  const ready = all.filter(e => e.audio_urls && KEYS.every(k => (e.audio_urls as any)[k]))
  console.log(`검증 대상: ${ready.length}개 × 4 = ${ready.length * 4}건\n`)

  // ── 2. 파일 검증 ───────────────────────────────────────────────────────────
  type R = { slug: string; ep: number; part: string; text: string; chars: number; sec: number; bytes: number; status: number; format: string }
  const rows: R[] = []
  const bust = Date.now()
  let n = 0

  for (const e of ready) {
    const urls = e.audio_urls as Record<string, string>
    const ex = (typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples) as Array<{ ko: string }>
    const texts: Record<string, string> = {
      pattern: e.korean.split('/')[0].replace(/~/g, '').replace(/^-+|-+$/g, '').replace(/[.!?]$/, '').replace(/\s+/g, ' ').trim(),
      ex1: (ex[0]?.ko ?? '').replace(/~/g, '').trim(),
      ex2: (ex[1]?.ko ?? '').replace(/~/g, '').trim(),
      ex3: (ex[2]?.ko ?? '').replace(/~/g, '').trim(),
    }
    for (const part of KEYS) {
      const res = await fetch(`${urls[part]}?v=${bust}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const { sec, format } = audioInfo(buf)
      rows.push({ slug: e.slug, ep: e.first_episode, part, text: texts[part], chars: texts[part].replace(/\s/g, '').length, sec, bytes: buf.length, status: res.status, format })
      if (++n % 200 === 0) console.log(`  … ${n}/${ready.length * 4} 확인`)
    }
  }

  console.log('\n=== 2. URL 200 / 0바이트 / 1초 미만 ===')
  const notOk = rows.filter(r => r.status !== 200)
  const zero  = rows.filter(r => r.bytes === 0)
  const tooShort = rows.filter(r => r.sec < 1)
  console.log(`검사 ${rows.length}건`)
  console.log(`HTTP 200 아님: ${notOk.length}건`)
  for (const r of notOk.slice(0, 20)) console.log(`   ${r.slug}/${r.part} HTTP ${r.status}`)
  console.log(`0바이트: ${zero.length}건`)
  for (const r of zero.slice(0, 20)) console.log(`   ${r.slug}/${r.part}`)
  console.log(`1초 미만: ${tooShort.length}건`)
  for (const r of tooShort.slice(0, 20)) console.log(`   ${r.slug}/${r.part} "${r.text}" ${r.sec.toFixed(2)}s`)
  console.log(`포맷: ${[...new Set(rows.map(r => r.format))].join(', ')}`)

  // ── 3. 2~3자 패턴 길이 범위 ────────────────────────────────────────────────
  console.log('\n=== 3. 2~3자 패턴 1.5~2.5초 ===')
  const shortPats = rows.filter(r => r.part === 'pattern' && r.chars >= 2 && r.chars <= 3)
  const out = shortPats.filter(r => r.sec < 1.5 || r.sec > 2.5)
  console.log(`2~3자 패턴 ${shortPats.length}개 중 범위내 ${shortPats.length - out.length}개, 범위 밖 ${out.length}개`)
  for (const r of out) console.log(`   ep${r.ep} ${r.slug}/pattern "${r.text}" ${r.chars}자 ${r.sec.toFixed(2)}s ${r.sec < 1.5 ? '(빠름)' : '(느림)'}`)

  const onePats = rows.filter(r => r.part === 'pattern' && r.chars <= 1)
  if (onePats.length) {
    console.log(`\n1자 패턴 ${onePats.length}개 (범위 규칙 대상 아님):`)
    for (const r of onePats) console.log(`   ep${r.ep} ${r.slug} "${r.text}" ${r.sec.toFixed(2)}s`)
  }

  // ── 4. 패턴이 예문보다 느린지 ──────────────────────────────────────────────
  console.log('\n=== 4. pattern이 예문보다 느린가 (자/초) ===')
  let slowOk = 0, slowNg: string[] = []
  for (const e of ready) {
    const p = rows.find(r => r.slug === e.slug && r.part === 'pattern')
    const xs = rows.filter(r => r.slug === e.slug && r.part !== 'pattern')
    if (!p || p.sec === 0 || xs.length === 0) continue
    const pc = p.chars / p.sec
    const xc = xs.reduce((s, r) => s + r.chars / Math.max(r.sec, 0.001), 0) / xs.length
    if (pc < xc) slowOk++
    else slowNg.push(`ep${p.ep} ${e.slug} pat ${pc.toFixed(2)} vs ex ${xc.toFixed(2)}`)
  }
  console.log(`${slowOk}/${ready.length} 통과`)
  for (const s of slowNg.slice(0, 20)) console.log(`   ❌ ${s}`)

  // ── 5. audio_url / audio_hash 보존 ─────────────────────────────────────────
  console.log('\n=== 5. audio_url(통합)·audio_hash 보존 ===')
  console.log(`audio_url 있음: ${all.filter(e => e.audio_url).length}/${all.length}`)
  console.log(`audio_hash 있음: ${all.filter(e => e.audio_hash).length}/${all.length}`)

  fs.writeFileSync(
    path.resolve(process.cwd(), 'scripts', 'expr-audio-verify.json'),
    JSON.stringify({ total: rows.length, notOk, zero, under1: tooShort, outOfRange: out, slowNg }, null, 2)
  )
  console.log('\n리포트 → scripts/expr-audio-verify.json')
}

main().catch(e => { console.error(e); process.exit(1) })
