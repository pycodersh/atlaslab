/**
 * _backup-kp-tables.ts
 * kp_expressions(마이그레이션 전 필수),
 * kpatto_webtoon_layouts, kp_bubbles, kp_dialogues, kp_dialogue_expressions
 * 5개 테이블을 JSON으로 덤프.
 *
 * 사용:
 *   npx tsx scripts/_backup-kp-tables.ts
 *
 * 저장: data/backup/kp_tables_{timestamp}.json
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

async function dump(table: string) {
  const { data, error } = await sb.from(table).select('*')
  if (error) throw new Error(`${table}: ${error.message}`)
  return data ?? []
}

async function main() {
  const tables = [
    'kp_expressions',           // ← SEO 마이그레이션 전 필수 백업
    'kpatto_webtoon_layouts',
    'kp_bubbles',
    'kp_dialogues',
    'kp_dialogue_expressions',
  ]

  const result: Record<string, unknown[]> = {}
  for (const t of tables) {
    const rows = await dump(t)
    result[t] = rows
    console.log(`  ${t}: ${rows.length}행`)
  }

  const outDir = path.resolve(process.cwd(), 'data/backup')
  fs.mkdirSync(outDir, { recursive: true })
  const ts = Date.now()
  const outPath = path.join(outDir, `kp_tables_${ts}.json`)
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')

  console.log(`\n✓ 백업 완료: ${outPath}`)
}

main().catch(e => { console.error(e); process.exit(1) })
