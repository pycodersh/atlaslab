/**
 * backup-layouts.ts
 * kpatto_webtoon_layouts 전체를 JSON으로 덤프.
 *
 * 사용:
 *   npx tsx scripts/backup-layouts.ts
 *
 * 저장: data/backup/kpatto_webtoon_layouts_{timestamp}.json
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 1. 전체 덤프 (SELECT only)
  const { data: rows, error } = await sb
    .from('kpatto_webtoon_layouts')
    .select('*')
    .order('episode_id')

  if (error) { console.error('조회 실패:', error.message); process.exit(1) }
  if (!rows?.length) { console.log('행 없음'); return }

  // 2. 저장
  const outDir = path.resolve(process.cwd(), 'data/backup')
  fs.mkdirSync(outDir, { recursive: true })
  const ts = Date.now()
  const outPath = path.join(outDir, `kpatto_webtoon_layouts_${ts}.json`)
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8')

  // 3. 보고
  console.log(`\n✓ 백업 완료: ${outPath}`)
  console.log(`  총 행: ${rows.length}`)

  // EP01~10 상세 집계
  const EP_RANGE = Array.from({ length: 10 }, (_, i) => `kp-ep-${String(i + 1).padStart(3, '0')}`)
  console.log('\n  EP    위치버블  LB버블  총버블')
  console.log('  ─'.repeat(20))

  for (const epId of EP_RANGE) {
    const row = rows.find(r => r.episode_id === epId)
    if (!row) { console.log(`  ${epId}  (행 없음)`); continue }

    const ov = (row.overrides ?? {}) as Record<string, Record<string, unknown>>
    const entries = Object.entries(ov)
    const posCount = entries.filter(([, v]) => 'xPct' in v || 'yPct' in v || 'widthPct' in v).length
    const lbCount  = entries.filter(([, v]) => 'lineBreaks' in v).length
    const flag = posCount === 0 ? '  ← ⚠ 위치 없음' : ''
    console.log(`  ${epId}  ${String(posCount).padStart(4)}     ${String(lbCount).padStart(4)}   ${entries.length}${flag}`)
  }

  // 전체 통계
  let totalPos = 0, totalLB = 0, totalBubbles = 0
  for (const row of rows) {
    const ov = (row.overrides ?? {}) as Record<string, Record<string, unknown>>
    const entries = Object.entries(ov)
    totalPos     += entries.filter(([, v]) => 'xPct' in v || 'yPct' in v || 'widthPct' in v).length
    totalLB      += entries.filter(([, v]) => 'lineBreaks' in v).length
    totalBubbles += entries.length
  }
  console.log('  ─'.repeat(20))
  console.log(`\n  전체 버블: ${totalBubbles}  위치 있음: ${totalPos}  LB 있음: ${totalLB}`)
}

main().catch(e => { console.error(e); process.exit(1) })
