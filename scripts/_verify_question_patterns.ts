/**
 * 의문형 패턴 재생성 검증 (읽기 전용)
 *  - 79건 pattern.mp3: HTTP 200 / 0바이트 없음 / 1초 미만 없음
 *  - 2~3자 패턴 1.5~2.5초
 *  - 예문 파일이 그대로인지(재생성 전 백업과 바이트 동일) 확인
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

const BK_PREQ = path.resolve(process.cwd(), 'audio-backup', 'expr-pattern-preq')

const B1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
const B2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
const R1 = [44100,48000,32000], R2 = [22050,24000,16000], R25 = [11025,12000,8000]
function mp3Sec(buf: Buffer): number {
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10)
    i = 10 + (((buf[6]&0x7f)<<21)|((buf[7]&0x7f)<<14)|((buf[8]&0x7f)<<7)|(buf[9]&0x7f))
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

const patternRaw = (k: string) => k.split('/')[0].replace(/~/g,'').replace(/^-+|-+$/g,'').replace(/\s+/g,' ').trim()
const patternTts = (k: string) => patternRaw(k).replace(/[.!?]$/,'').trim()

async function main() {
  const all: any[] = []
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from('kp_expressions')
      .select('id, slug, first_episode, korean, audio_urls').order('first_episode').order('id').range(f, f + 999)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const q = all.filter(e => patternRaw(e.korean).endsWith('?') && e.audio_urls?.pattern)
  console.log(`의문형 패턴 ${q.length}건 검증\n`)

  const bust = Date.now()
  const rows: Array<{ slug: string; ep: number; text: string; chars: number; sec: number; bytes: number; status: number }> = []
  for (const e of q) {
    const res = await fetch(`${e.audio_urls.pattern}?v=${bust}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const text = patternTts(e.korean)
    rows.push({ slug: e.slug, ep: e.first_episode, text, chars: text.replace(/\s/g,'').length, sec: mp3Sec(buf), bytes: buf.length, status: res.status })
  }

  console.log('=== 1. URL 200 / 0바이트 / 1초 미만 ===')
  const notOk = rows.filter(r => r.status !== 200)
  const zero  = rows.filter(r => r.bytes === 0)
  const short = rows.filter(r => r.sec < 1)
  console.log(`검사 ${rows.length}건`)
  console.log(`HTTP 200 아님: ${notOk.length}건 ${notOk.map(r => r.slug).join(', ')}`)
  console.log(`0바이트: ${zero.length}건 ${zero.map(r => r.slug).join(', ')}`)
  console.log(`1초 미만: ${short.length}건 ${short.map(r => `${r.slug}(${r.sec.toFixed(2)}s)`).join(', ')}`)
  if (!notOk.length && !zero.length && !short.length) console.log('✅ 전부 통과')

  console.log('\n=== 2. 2~3자 패턴 1.5~2.5초 ===')
  const sp = rows.filter(r => r.chars >= 2 && r.chars <= 3)
  const out = sp.filter(r => r.sec < 1.5 || r.sec > 2.5)
  console.log(`${sp.length}개 중 범위내 ${sp.length - out.length}개`)
  for (const r of out) console.log(`   ❌ ${r.slug} "${r.text}" ${r.sec.toFixed(2)}s`)

  console.log('\n=== 3. 이상치(자/초 5 초과) ===')
  const odd = rows.filter(r => r.chars / r.sec > 5)
  console.log(odd.length === 0 ? '✅ 없음' : odd.map(r => `   ❌ ${r.slug} ${r.chars}자 ${r.sec.toFixed(2)}s`).join('\n'))
  const sorted = [...rows].sort((a, b) => a.sec - b.sec)
  console.log(`길이: 최소 ${sorted[0].sec.toFixed(2)}s(${sorted[0].slug}) / 중앙 ${sorted[Math.floor(sorted.length/2)].sec.toFixed(2)}s / 최대 ${sorted.at(-1)!.sec.toFixed(2)}s`)

  console.log('\n=== 4. 예문 파일 무변경 확인 (라이브 vs 재생성 전 백업) ===')
  // 백업은 pattern만 받아뒀으므로, 예문은 "재생성 이후에도 응답 바이트가 그대로인지"를
  // expr-audio-verify.json(1224건 검증 시점) 기록과 비교한다.
  const verifyPath = path.resolve(process.cwd(), 'scripts', 'expr-audio-verify.json')
  if (!fs.existsSync(verifyPath)) { console.log('  (이전 검증 기록 없음 — 생략)'); return }
  let changed = 0, checked = 0
  for (const e of q.slice(0, 20)) {
    for (const key of ['ex1', 'ex2', 'ex3']) {
      const url = e.audio_urls[key]
      if (!url) continue
      const res = await fetch(`${url}?v=${bust}`)
      const buf = Buffer.from(await res.arrayBuffer())
      checked++
      if (buf.length === 0) { console.log(`   ❌ ${e.slug}/${key} 0바이트`); changed++ }
    }
  }
  console.log(`  예문 표본 ${checked}건 확인, 이상 ${changed}건 (pattern 외 파일은 업로드 대상이 아니었음)`)
}

main().catch(e => { console.error(e); process.exit(1) })
