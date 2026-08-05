/**
 * kpatto_webtoon_layouts 전체 row의 overrides에서
 * lineBreaks 키만 삭제. xPct/yPct/widthPct 등 다른 필드는 유지.
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
  const { data: rows, error } = await sb.from('kpatto_webtoon_layouts').select('episode_id, overrides')
  if (error) { console.error('조회 실패:', error.message); process.exit(1) }
  if (!rows?.length) { console.log('행 없음'); return }

  let rowsChanged = 0
  let breaksCleared = 0

  for (const row of rows) {
    const ov = (row.overrides ?? {}) as Record<string, Record<string, unknown>>
    let changed = false
    const cleaned: Record<string, Record<string, unknown>> = {}

    for (const [bubbleId, fields] of Object.entries(ov)) {
      if ('lineBreaks' in fields) {
        const { lineBreaks, ...rest } = fields
        cleaned[bubbleId] = rest
        breaksCleared++
        changed = true
      } else {
        cleaned[bubbleId] = fields
      }
    }

    if (!changed) continue

    const { error: upErr } = await sb
      .from('kpatto_webtoon_layouts')
      .update({ overrides: cleaned })
      .eq('episode_id', row.episode_id)

    if (upErr) {
      console.error(`  ${row.episode_id} 업데이트 실패:`, upErr.message)
    } else {
      rowsChanged++
    }
  }

  console.log(`✓ lineBreaks 삭제 완료`)
  console.log(`  변경된 row: ${rowsChanged}  삭제된 lineBreaks 항목: ${breaksCleared}`)
}

main().catch(e => { console.error(e); process.exit(1) })
