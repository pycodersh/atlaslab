/**
 * EP71~75 대사/버블 음성 검증 (읽기 전용)
 *  - 화별 대사·버블 audio_url 충족
 *  - 전건 URL 200 / 0바이트 없음 / 1초 미만 없음
 *  - 구 OpenAI bubbles/*.mp3 URL 잔존 0건
 *  - 대사 URL == 버블 URL 일치
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

const EPS = [71, 72, 73, 74, 75]
const wavSec = (bytes: number) => (bytes - 44) / (24000 * 2)

async function main() {
  const { data: dlg } = await sb.from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url')
    .in('episode_id', EPS).order('episode_id').order('order_num')
  const { data: bub } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url').in('episode_id', EPS)

  console.log('=== 1. 화별 충족 + 구 OpenAI URL 잔존 ===')
  console.log('EP | 대사 | 대사URL | 버블 | 버블URL | 구OpenAI | 판정')
  let allOk = true, staleTotal = 0
  for (const ep of EPS) {
    const d = (dlg ?? []).filter(x => x.episode_id === ep)
    const b = (bub ?? []).filter(x => x.episode_id === ep)
    const du = d.filter(x => x.audio_url).length
    const bu = b.filter(x => x.audio_url).length
    const stale = b.filter(x => x.audio_url?.includes('/bubbles/')).length
    staleTotal += stale
    const ok = d.length === du && b.length === bu && stale === 0
    if (!ok) allOk = false
    console.log(`${ep} | ${String(d.length).padStart(4)} | ${String(du).padStart(7)} | ${String(b.length).padStart(4)} | ${String(bu).padStart(7)} | ${String(stale).padStart(8)} | ${ok ? '✅' : '❌'}`)
    for (const x of b.filter(x => !x.audio_url)) console.log(`      MISSING bubble id=${x.id} [${x.speaker}] ${x.korean}`)
    for (const x of b.filter(x => x.audio_url?.includes('/bubbles/'))) console.log(`      STALE bubble id=${x.id} ${x.audio_url}`)
  }
  console.log(allOk ? '\n✅ 다섯 화 전부 충족 · 구 OpenAI URL 0건' : `\n❌ 미충족 있음 (구 OpenAI 잔존 ${staleTotal}건)`)

  console.log('\n=== 2. 파일 검증 (HTTP 200 / 0바이트 / 1초 미만) ===')
  const bad: string[] = []
  const durs: Array<{ ep: number; id: number; sec: number; text: string; speaker: string }> = []
  for (const d of dlg ?? []) {
    if (!d.audio_url) { bad.push(`EP${d.episode_id} id=${d.id} audio_url 없음`); continue }
    const res = await fetch(d.audio_url, { method: 'HEAD' })
    const len = parseInt(res.headers.get('content-length') ?? '0')
    const sec = wavSec(len)
    if (res.status !== 200) bad.push(`EP${d.episode_id} id=${d.id} HTTP ${res.status}`)
    else if (len === 0)     bad.push(`EP${d.episode_id} id=${d.id} 0바이트`)
    else if (sec < 1)       bad.push(`EP${d.episode_id} id=${d.id} ${sec.toFixed(2)}초 (1초 미만)`)
    durs.push({ ep: d.episode_id, id: d.id, sec, text: d.text_ko, speaker: d.speaker })
  }
  console.log(`검사 ${durs.length}건`)
  if (bad.length === 0) console.log('✅ 전부 HTTP 200 · 0바이트 없음 · 1초 미만 없음')
  else bad.forEach(x => console.log(`❌ ${x}`))
  const sorted = [...durs].sort((a, b) => a.sec - b.sec)
  if (sorted.length) {
    console.log(`길이: 최소 ${sorted[0].sec.toFixed(2)}초 / 중앙 ${sorted[Math.floor(sorted.length/2)].sec.toFixed(2)}초 / 최대 ${sorted.at(-1)!.sec.toFixed(2)}초`)
    console.log('짧은 순 3건:')
    for (const x of sorted.slice(0, 3)) console.log(`   EP${x.ep} id=${x.id} [${x.speaker}] ${x.sec.toFixed(2)}초 "${x.text}"`)
  }

  console.log('\n=== 3. 대사 URL == 버블 URL ===')
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
  let mismatch = 0
  for (const d of dlg ?? []) {
    const hits = (bub ?? []).filter(b => b.episode_id === d.episode_id && norm(b.korean) === norm(d.text_ko))
    for (const h of hits) if (h.audio_url !== d.audio_url) {
      console.log(`❌ EP${d.episode_id} dlg=${d.id} bub=${h.id}\n   dlg: ${d.audio_url}\n   bub: ${h.audio_url}`)
      mismatch++
    }
  }
  console.log(mismatch === 0 ? `✅ ${dlg?.length}건 전부 일치` : `❌ 불일치 ${mismatch}건`)

  console.log('\n=== 4. 청취 샘플 (EP70과 이어지는지 대조) ===')
  const { data: ep70 } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko, audio_url').eq('episode_id', 70).not('audio_url', 'is', null).order('order_num').limit(2)
  for (const d of ep70 ?? []) console.log(`  [EP70 기존] [${d.speaker}] "${d.text_ko}"\n     ${d.audio_url}`)
  for (const ep of EPS) {
    const d = (dlg ?? []).find(x => x.episode_id === ep && x.audio_url)
    if (d) console.log(`  [EP${ep} 신규] [${d.speaker}] "${d.text_ko}"\n     ${d.audio_url}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
