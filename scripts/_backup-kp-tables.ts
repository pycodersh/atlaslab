import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const BACKUP_DIR = path.resolve(process.cwd(), 'data/kpatto/source/backup')

const TABLES: Array<{ name: string; orderCol: string }> = [
  { name: 'kp_episodes',             orderCol: 'id' },
  { name: 'kp_scenes',               orderCol: 'id' },
  { name: 'kp_dialogues',            orderCol: 'id' },
  { name: 'kp_bubbles',              orderCol: 'id' },
  { name: 'kp_panels',               orderCol: 'id' },
  { name: 'kp_expressions',          orderCol: 'id' },
  { name: 'kp_dialogue_expressions', orderCol: 'id' },
  { name: 'kp_challenges',           orderCol: 'id' },
  { name: 'kpatto_webtoon_layouts',  orderCol: 'episode_id' },
]

async function fetchAll(table: string, orderCol: string): Promise<any[]> {
  const rows: any[] = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .from(table).select('*').order(orderCol).range(offset, offset + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < 1000) break
    offset += 1000
  }
  return rows
}

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '')
  console.log(`백업 시작: ${timestamp}\n`)

  const summary: { table: string; count: number; file: string }[] = []

  for (const { name: table, orderCol } of TABLES) {
    process.stdout.write(`  ${table} ... `)
    try {
      const rows = await fetchAll(table, orderCol)
      const filename = `${table}.json`
      fs.writeFileSync(
        path.join(BACKUP_DIR, filename),
        JSON.stringify(rows, null, 2),
        'utf-8'
      )
      console.log(`${rows.length}건`)
      summary.push({ table, count: rows.length, file: filename })
    } catch (e: any) {
      console.log(`오류: ${e.message}`)
      summary.push({ table, count: -1, file: '' })
    }
  }

  // 메타 파일 (날짜 + 건수)
  fs.writeFileSync(
    path.join(BACKUP_DIR, '_backup_meta.json'),
    JSON.stringify({ created_at: timestamp, tables: summary }, null, 2),
    'utf-8'
  )

  console.log('\n=== 완료 ===')
  console.log(`위치: data/kpatto/source/backup/`)
  const total = summary.filter(s => s.count >= 0).reduce((s, r) => s + r.count, 0)
  console.log(`총 ${total}건`)
}

main().catch(console.error)
