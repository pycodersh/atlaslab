/**
 * READ-ONLY 진단: kpatto_webtoon_layouts 위치값 생존 여부
 * SELECT only — 쓰기 없음
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
async function main() {
  const { data: rows, error } = await sb
    .from('kpatto_webtoon_layouts')
    .select('episode_id, overrides')
    .order('episode_id')
  if (error) { console.error('조회 실패:', error.message); process.exit(1) }
  let rowsWithPos = 0, rowsOnlyLB = 0, rowsEmpty = 0
  const details: string[] = []
  for (const row of rows ?? []) {
    const ov = (row.overrides ?? {}) as Record<string, any>
    const entries = Object.entries(ov)
    const lbCount  = entries.filter(([,v]) => v.lineBreaks).length
    const posCount = entries.filter(([,v]) => 'xPct' in v || 'yPct' in v || 'widthPct' in v).length
    if (posCount > 0) {
      rowsWithPos++
      details.push(`  ✓ ${row.episode_id}  버블${String(entries.length).padStart(2)}  위치${posCount}  LB${lbCount}`)
    } else if (lbCount > 0) {
      rowsOnlyLB++
      details.push(`  ✗ ${row.episode_id}  버블${String(entries.length).padStart(2)}  위치0  LB${lbCount}`)
    } else {
      rowsEmpty++
      details.push(`  ? ${row.episode_id}  버블${String(entries.length).padStart(2)}  위치0  LB0`)
    }
  }
  console.log(`\n총 행: ${(rows ?? []).length}`)
  console.log(`  ✓ 위치값 있음: ${rowsWithPos}행`)
  console.log(`  ✗ 위치값 없음(LB만): ${rowsOnlyLB}행  ← 피해 추정`)
  console.log(`  ? 빈 행: ${rowsEmpty}행\n`)
  details.forEach(d => console.log(d))
}
main().catch(e => { console.error(e); process.exit(1) })
