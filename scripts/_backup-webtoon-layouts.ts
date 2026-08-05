/**
 * sync-episode.ts 실행 전 kpatto_webtoon_layouts 백업
 * 버블 ID가 재생성되면 lineBreaks override가 끊기므로
 * 백업 → sync → 재적용 순서로 처리
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
  const { data, error } = await sb.from('kpatto_webtoon_layouts').select('*')
  if (error) { console.error('조회 실패:', error.message); process.exit(1) }

  const outPath = path.resolve(
    process.cwd(),
    `data/kpatto/source/backup/kpatto_webtoon_layouts_pre_sync_${Date.now()}.json`
  )
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✓ 백업 완료: ${outPath}`)
  console.log(`  총 ${data?.length ?? 0}행`)
}

main().catch(e => { console.error(e); process.exit(1) })
