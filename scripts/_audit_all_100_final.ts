/**
 * EP01~100 대사 음성 최종 감사 (읽기 전용)
 *  ① kp_bubbles.audio_url 이 NULL 인 건 — 화별
 *  ② 구 OpenAI bubbles/*.mp3 URL 이 남은 건 — 화별
 *  ③ 대사 URL ≠ 버블 URL 인 건
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

async function fetchAll(table: string, cols: string) {
  const out: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(cols)
      .gte('episode_id', 1).lte('episode_id', 100)
      .order('episode_id').order('id').range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return out
}

const isOpenAI = (u: string | null) => !!u && u.includes('/bubbles/')
const norm = (s: string) => s.replace(/\s+/g, ' ').trim()

async function main() {
  const dlg = await fetchAll('kp_dialogues', 'id, episode_id, speaker, text_ko, audio_url')
  const bub = await fetchAll('kp_bubbles', 'id, episode_id, speaker, korean, audio_url')
  console.log(`kp_dialogues ${dlg.length}행 · kp_bubbles ${bub.length}행\n`)

  type Row = { ep: number; bTotal: number; bNull: number; stale: number; mismatch: number }
  const rows: Row[] = []
  const nullList: string[] = []
  const staleList: string[] = []
  const mismatchList: string[] = []

  for (let ep = 1; ep <= 100; ep++) {
    const d = dlg.filter(x => x.episode_id === ep)
    const b = bub.filter(x => x.episode_id === ep)

    const bNull = b.filter(x => !x.audio_url)
    const stale = b.filter(x => isOpenAI(x.audio_url))

    let mismatch = 0
    for (const x of d) {
      const hits = b.filter(y => norm(y.korean) === norm(x.text_ko))
      for (const h of hits) {
        if (h.audio_url !== x.audio_url) {
          mismatch++
          mismatchList.push(`EP${ep} dlg=${x.id} bub=${h.id} "${x.text_ko.slice(0, 24)}"`)
        }
      }
    }

    for (const x of bNull) nullList.push(`EP${ep} bubble id=${x.id} [${x.speaker}] ${x.korean}`)
    for (const x of stale) staleList.push(`EP${ep} bubble id=${x.id} ${x.audio_url}`)

    rows.push({ ep, bTotal: b.length, bNull: bNull.length, stale: stale.length, mismatch })
  }

  const bad = rows.filter(r => r.bNull > 0 || r.stale > 0 || r.mismatch > 0)

  console.log('=== ① 버블 audio_url NULL / ② 구 OpenAI 잔존 / ③ 대사≠버블 — 문제 있는 화만 ===')
  if (bad.length === 0) {
    console.log('  ✅ 100화 전부 이상 없음')
  } else {
    console.log('EP  | 버블총 | NULL | 구OpenAI | URL불일치')
    for (const r of bad) {
      console.log(`${String(r.ep).padStart(3)} | ${String(r.bTotal).padStart(6)} | ${String(r.bNull).padStart(4)} | ${String(r.stale).padStart(8)} | ${String(r.mismatch).padStart(9)}`)
    }
  }

  console.log('\n=== 합계 ===')
  console.log(`버블 총 ${bub.length}건`)
  console.log(`① audio_url NULL:        ${nullList.length}건`)
  console.log(`② 구 OpenAI URL 잔존:     ${staleList.length}건`)
  console.log(`③ 대사 URL ≠ 버블 URL:   ${mismatchList.length}건`)

  if (nullList.length) { console.log('\n[① NULL 상세]'); nullList.forEach(x => console.log('  ' + x)) }
  if (staleList.length) { console.log('\n[② 구 OpenAI 상세]'); staleList.slice(0, 40).forEach(x => console.log('  ' + x)) }
  if (mismatchList.length) { console.log('\n[③ 불일치 상세]'); mismatchList.slice(0, 40).forEach(x => console.log('  ' + x)) }

  // 엔진 분포
  const kind = (u: string | null) => !u ? 'none' : u.includes('/dialogues/') ? 'gemini' : u.includes('/bubbles/') ? 'openai' : 'other'
  const agg: Record<string, number> = {}
  for (const x of bub) agg[kind(x.audio_url)] = (agg[kind(x.audio_url)] ?? 0) + 1
  console.log(`\n버블 엔진 분포: ${JSON.stringify(agg)}`)
  const aggD: Record<string, number> = {}
  for (const x of dlg) aggD[kind(x.audio_url)] = (aggD[kind(x.audio_url)] ?? 0) + 1
  console.log(`대사 엔진 분포: ${JSON.stringify(aggD)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
