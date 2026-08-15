/**
 * EP01~100 audio_url NULL 전수 집계 (읽기 전용 — 어떤 갱신도 하지 않음)
 * kp_dialogues.audio_url / kp_bubbles.audio_url 각각의 NULL 건수를 화별로 집계
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

/** Supabase 기본 1000행 제한 회피용 페이지네이션 */
async function fetchAll(table: string, cols: string) {
  const out: any[] = []
  const SIZE = 1000
  for (let from = 0; ; from += SIZE) {
    const { data, error } = await sb.from(table).select(cols)
      .gte('episode_id', 1).lte('episode_id', 100)
      .order('episode_id').order('id')
      .range(from, from + SIZE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...(data ?? []))
    if (!data || data.length < SIZE) break
  }
  return out
}

function engine(u: string | null) {
  if (!u) return 'none'
  if (u.includes('/dialogues/')) return 'gemini'
  if (u.includes('/bubbles/')) return 'openai'
  return 'other'
}

async function main() {
  const dlg = await fetchAll('kp_dialogues', 'id, episode_id, speaker, text_ko, audio_url')
  const bub = await fetchAll('kp_bubbles', 'id, episode_id, speaker, korean, audio_url')
  console.log(`조회: kp_dialogues ${dlg.length}행 · kp_bubbles ${bub.length}행\n`)

  console.log('EP  | 대사총 | 대사NULL | 버블총 | 버블NULL | 버블엔진 | 상태')
  console.log('----|--------|----------|--------|----------|----------|------')
  const problem: Array<{ ep: number; dNull: number; bNull: number; dTot: number; bTot: number; eng: string }> = []
  let dTotAll = 0, dNullAll = 0, bTotAll = 0, bNullAll = 0
  for (let ep = 1; ep <= 100; ep++) {
    const d = dlg.filter(x => x.episode_id === ep)
    const b = bub.filter(x => x.episode_id === ep)
    const dNull = d.filter(x => !x.audio_url).length
    const bNull = b.filter(x => !x.audio_url).length
    const engs = [...new Set(b.filter(x => x.audio_url).map(x => engine(x.audio_url)))]
    const eng = engs.length ? engs.join('+') : '-'
    dTotAll += d.length; dNullAll += dNull; bTotAll += b.length; bNullAll += bNull
    const status = (dNull === 0 && bNull === 0) ? (eng === 'openai' ? '△ OpenAI' : 'OK') : '결측'
    console.log(
      `${String(ep).padStart(3)} | ${String(d.length).padStart(6)} | ${String(dNull).padStart(8)} | ` +
      `${String(b.length).padStart(6)} | ${String(bNull).padStart(8)} | ${eng.padEnd(8)} | ${status}`
    )
    if (dNull > 0 || bNull > 0) problem.push({ ep, dNull, bNull, dTot: d.length, bTot: b.length, eng })
  }
  console.log('----|--------|----------|--------|----------|----------|------')
  console.log(`합계| ${String(dTotAll).padStart(6)} | ${String(dNullAll).padStart(8)} | ${String(bTotAll).padStart(6)} | ${String(bNullAll).padStart(8)} |`)

  console.log(`\n=== NULL이 하나라도 있는 화: ${problem.length}개 ===`)
  for (const p of problem)
    console.log(`EP${String(p.ep).padStart(2,'0')}: 대사 ${p.dNull}/${p.dTot} NULL · 버블 ${p.bNull}/${p.bTot} NULL · 버블엔진 ${p.eng}`)

  // 버블 NULL 상세 (앱에서 스피커 버튼이 안 뜨는 실제 건)
  const bubNull = bub.filter(x => !x.audio_url)
  console.log(`\n=== 버블 NULL 상세 ${bubNull.length}건 (앱 스피커 버튼 미표시) ===`)
  for (const b of bubNull)
    console.log(`  EP${String(b.episode_id).padStart(2,'0')} bubble id=${b.id} [${b.speaker}] ${b.korean}`)

  // 대사만 NULL (버블은 채워짐) = OpenAI로 생성돼 대사 테이블이 비어 있는 경우
  const dOnly = dlg.filter(x => !x.audio_url && bub.some(b => b.episode_id === x.episode_id && b.audio_url))
  console.log(`\n=== 대사 NULL이지만 같은 화 버블에는 URL이 있는 건: ${dOnly.length}건 ===`)
  const byEp: Record<number, number> = {}
  for (const d of dOnly) byEp[d.episode_id] = (byEp[d.episode_id] ?? 0) + 1
  console.log(Object.entries(byEp).map(([k, v]) => `EP${k}:${v}`).join(', '))

  // 엔진별 총계
  const engAgg: Record<string, number> = {}
  for (const b of bub) engAgg[engine(b.audio_url)] = (engAgg[engine(b.audio_url)] ?? 0) + 1
  console.log(`\n=== 버블 엔진별 총계 === ${JSON.stringify(engAgg)}`)
  const engAggD: Record<string, number> = {}
  for (const d of dlg) engAggD[engine(d.audio_url)] = (engAggD[engine(d.audio_url)] ?? 0) + 1
  console.log(`=== 대사 엔진별 총계 === ${JSON.stringify(engAggD)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
