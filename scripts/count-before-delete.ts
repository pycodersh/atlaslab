import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  const [d, dex, ch, ex] = await Promise.all([
    sb.from('kp_dialogues').select('*', { count: 'exact', head: true }),
    sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }),
    sb.from('kp_challenges').select('*', { count: 'exact', head: true }),
    sb.from('kp_expressions').select('*', { count: 'exact', head: true }),
  ])
  console.log('삭제 대상:')
  console.log('  kp_dialogues            :', d.count, '건')
  console.log('  kp_dialogue_expressions :', dex.count, '건')
  console.log('  kp_challenges           :', ch.count, '건')
  console.log('유지 대상:')
  console.log('  kp_expressions          :', ex.count, '건 (건드리지 않음)')
}
run().catch(console.error)
