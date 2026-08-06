/**
 * kpatto_webtoon_layouts 전체 lineBreaks 총 건수 집계
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
  const { data: rows } = await sb.from('kpatto_webtoon_layouts').select('episode_id, overrides')
  let total = 0
  for (const row of rows ?? []) {
    const ov = (row.overrides ?? {}) as Record<string, any>
    for (const fields of Object.values(ov)) {
      if (fields.lineBreaks) total++
    }
  }
  console.log(`총 lineBreaks 항목: ${total}건`)
}
main().catch(e => { console.error(e); process.exit(1) })
