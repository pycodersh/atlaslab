/**
 * EP61~70 Gemini 음성 검증
 *  - kp_dialogues / kp_bubbles audio_url 채움 여부
 *  - 구 OpenAI(bubbles/*.mp3) URL 잔존 여부
 *  - 각 URL HTTP 200 / 0바이트 / 1초 미만 여부 (WAV 24kHz mono 16bit 기준)
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

const EP_FROM = 61, EP_TO = 70

/** WAV(24kHz, mono, 16bit) 바이트 → 초 */
function wavSeconds(bytes: number) { return (bytes - 44) / (24000 * 2) }

async function main() {
  const { data: dlg, error } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url, audio_hash')
    .gte('episode_id', EP_FROM).lte('episode_id', EP_TO)
    .order('episode_id').order('order_num')
  if (error) throw error

  const { data: bub } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, order_num, speaker, korean, audio_url')
    .gte('episode_id', EP_FROM).lte('episode_id', EP_TO)
    .order('episode_id').order('order_num')

  console.log('=== 1. DB 채움 현황 ===')
  console.log('EP | 대사 | 대사URL | 버블 | 버블URL | 구OpenAI잔존')
  let dTotal = 0, dOk = 0, bTotal = 0, bOk = 0, staleTotal = 0
  for (let ep = EP_FROM; ep <= EP_TO; ep++) {
    const d = (dlg ?? []).filter(x => x.episode_id === ep)
    const b = (bub ?? []).filter(x => x.episode_id === ep)
    const du = d.filter(x => x.audio_url).length
    const bu = b.filter(x => x.audio_url).length
    const stale = b.filter(x => x.audio_url?.includes('/bubbles/')).length
    dTotal += d.length; dOk += du; bTotal += b.length; bOk += bu; staleTotal += stale
    const mark = (d.length === du && b.length === bu && stale === 0) ? '✅' : '❌'
    console.log(`${ep} | ${String(d.length).padStart(4)} | ${String(du).padStart(7)} | ${String(b.length).padStart(4)} | ${String(bu).padStart(7)} | ${String(stale).padStart(12)} ${mark}`)
  }
  console.log(`합계: 대사 ${dOk}/${dTotal}, 버블 ${bOk}/${bTotal}, 구 OpenAI URL 잔존 ${staleTotal}건`)

  console.log('\n=== 2. 파일 검증 (HTTP 200 / 0바이트 / 1초 미만) ===')
  const bad: string[] = []
  const durations: Array<{ ep: number; id: number; speaker: string; sec: number; bytes: number; url: string; text: string }> = []
  for (const d of dlg ?? []) {
    if (!d.audio_url) { bad.push(`EP${d.episode_id} id=${d.id} audio_url 없음`); continue }
    const res = await fetch(d.audio_url, { method: 'HEAD' })
    const len = parseInt(res.headers.get('content-length') ?? '0')
    const sec = wavSeconds(len)
    if (res.status !== 200) bad.push(`EP${d.episode_id} id=${d.id} HTTP ${res.status}`)
    else if (len === 0)     bad.push(`EP${d.episode_id} id=${d.id} 0바이트`)
    else if (sec < 1)       bad.push(`EP${d.episode_id} id=${d.id} ${sec.toFixed(2)}초 (1초 미만)`)
    durations.push({ ep: d.episode_id, id: d.id, speaker: d.speaker, sec, bytes: len, url: d.audio_url, text: d.text_ko })
  }
  console.log(`검사 ${durations.length}건`)
  if (bad.length === 0) console.log('✅ 전부 HTTP 200 · 0바이트 없음 · 1초 미만 없음')
  else { console.log(`❌ 문제 ${bad.length}건:`); bad.forEach(x => console.log('   ' + x)) }

  const secs = durations.map(x => x.sec)
  if (secs.length) {
    const sorted = [...secs].sort((a, b) => a - b)
    console.log(`길이: 최소 ${sorted[0].toFixed(2)}초 / 중앙 ${sorted[Math.floor(sorted.length/2)].toFixed(2)}초 / 최대 ${sorted.at(-1)!.toFixed(2)}초`)
    console.log('짧은 순 5건:')
    for (const x of [...durations].sort((a, b) => a.sec - b.sec).slice(0, 5))
      console.log(`   EP${x.ep} id=${x.id} [${x.speaker}] ${x.sec.toFixed(2)}초 — "${x.text}"`)
  }

  console.log('\n=== 3. 대사↔버블 URL 일치 확인 ===')
  let mismatch = 0
  for (const d of dlg ?? []) {
    const matched = (bub ?? []).filter(b => b.episode_id === d.episode_id && b.korean.replace(/\s+/g,' ').trim() === d.text_ko.replace(/\s+/g,' ').trim())
    if (matched.length === 0) { console.log(`   버블 없음: EP${d.episode_id} id=${d.id} "${d.text_ko.slice(0,30)}"`); mismatch++; continue }
    for (const m of matched) if (m.audio_url !== d.audio_url) {
      console.log(`   URL 불일치: EP${d.episode_id} dlg=${d.id} bub=${m.id}`)
      console.log(`      dlg: ${d.audio_url}`)
      console.log(`      bub: ${m.audio_url}`)
      mismatch++
    }
  }
  console.log(mismatch === 0 ? '✅ 84건 전부 대사=버블 동일 URL' : `❌ 불일치 ${mismatch}건`)

  console.log('\n=== 4. 청취 샘플 (EP60 대조용 포함) ===')
  const { data: ep60 } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko, audio_url').eq('episode_id', 60).not('audio_url', 'is', null).limit(2)
  const { data: ep59 } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko, audio_url').eq('episode_id', 59).not('audio_url', 'is', null).order('order_num').limit(4)
  console.log('[EP59~60 기존 Gemini 기준]')
  for (const d of [...(ep60 ?? []), ...(ep59 ?? [])].slice(0, 4))
    console.log(`   [${d.speaker}] "${d.text_ko}"\n      ${d.audio_url}`)
  console.log('[EP61~70 신규 샘플 3건]')
  const picks = [durations[0], durations[Math.floor(durations.length/2)], durations.at(-1)!].filter(Boolean)
  for (const p of picks)
    console.log(`   EP${p.ep} [${p.speaker}] ${p.sec.toFixed(2)}초 "${p.text}"\n      ${p.url}`)
}

main().catch(e => { console.error(e); process.exit(1) })
