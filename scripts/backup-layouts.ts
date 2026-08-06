/**
 * backup-layouts.ts
 * kpatto_webtoon_layouts 전체를 JSON으로 덤프 (쓰기 없음, SELECT만).
 *
 * 사용:
 *   npx tsx scripts/backup-layouts.ts
 *
 * 저장: data/backup/layouts_{timestamp}.json
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
  // 1. 전체 덤프 (SELECT only — 쓰기 없음)
  const { data: rows, error } = await sb
    .from('kpatto_webtoon_layouts')
    .select('*')
    .order('episode_id')

  if (error) { console.error('조회 실패:', error.message); process.exit(1) }
  if (!rows?.length) { console.log('행 없음'); return }

  // 2. 파일 저장
  const outDir = path.resolve(process.cwd(), 'data/backup')
  fs.mkdirSync(outDir, { recursive: true })
  const ts = Date.now()
  const outPath = path.join(outDir, `layouts_${ts}.json`)
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8')

  console.log(`\n✓ 백업 완료: ${outPath}`)
  console.log(`  총 ${rows.length}행\n`)

  // 3. EP01~30 화별 분석
  type OvVal = Record<string, unknown>
  type Ov    = Record<string, OvVal>

  const EP_MAX = 30
  const missing: string[] = []

  console.log('  EP      위치(xPct/yPct/widthPct)  lineBreaks  총버블키')
  console.log('  ' + '─'.repeat(52))

  for (let n = 1; n <= EP_MAX; n++) {
    const epId = `kp-ep-${String(n).padStart(3, '0')}`
    const row  = rows.find(r => r.episode_id === epId)

    if (!row) {
      missing.push(epId)
      console.log(`  ${epId}  ⚠ 행 없음`)
      continue
    }

    const ov      = (row.overrides ?? {}) as Ov
    const entries = Object.entries(ov)
    const posCount = entries.filter(([, v]) =>
      typeof v.xPct === 'number' || typeof v.yPct === 'number' || typeof v.widthPct === 'number'
    ).length
    const lbCount = entries.filter(([, v]) =>
      Array.isArray(v.lineBreaks) && (v.lineBreaks as unknown[]).length > 0
    ).length

    const posStr = String(posCount).padStart(3)
    const lbStr  = String(lbCount).padStart(3)
    const totStr = String(entries.length).padStart(3)
    const warn   = posCount === 0 && entries.length > 0 ? '  ← ⚠ 위치 없음' : ''
    console.log(`  ${epId}         ${posStr}                  ${lbStr}        ${totStr}${warn}`)
  }

  // 4. 누락 요약
  console.log('  ' + '─'.repeat(52))
  if (missing.length > 0) {
    console.log(`\n  ⚠ 행 없는 화 (${missing.length}개): ${missing.join(', ')}`)
  } else {
    console.log(`\n  ✓ EP01~EP30 전 화 행 있음`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
