/**
 * kp_bubbles 전체 JSON export → data/kpatto/source/kp_bubbles_export.json
 * 말풍선 위치 백업용
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('kp_bubbles export 시작...')
  const { data, error, count } = await sb
    .from('kp_bubbles')
    .select('*', { count: 'exact' })
    .order('episode_id')
    .order('order_num')

  if (error) throw error
  console.log(`총 ${count}개 버블`)

  const outPath = path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', 'data/kpatto/source/kp_bubbles_export.json')
  const json = JSON.stringify({ exported_at: new Date().toISOString(), count, bubbles: data }, null, 2)
  fs.writeFileSync(outPath, json, 'utf-8')
  console.log(`저장 완료: ${outPath} (${(json.length / 1024).toFixed(1)}KB)`)
}

main().catch(e => { console.error(e); process.exit(1) })
