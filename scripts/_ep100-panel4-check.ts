import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  // kp_panels 스키마 확인
  const { data: sample, error } = await sb.from('kp_panels').select('*').limit(3)
  if (error) { console.log('kp_panels 에러:', error.message); return }
  if (sample?.length) console.log('kp_panels columns:', Object.keys(sample[0]).join(', '))

  // EP100 패널 전체 조회
  const { data: panels } = await sb.from('kp_panels').select('*').eq('episode_id', 100)
  console.log(`\nEP100 panels (${panels?.length}개):`)
  for (const p of panels ?? []) console.log(JSON.stringify(p))
}
main().catch(e => { console.error(e.message); process.exit(1) })
