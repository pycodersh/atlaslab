import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const BUB_IDS = [2785, 2788, 2790]
  const { error } = await sb.from('kp_bubbles').update({ speaker: 'merchant_f' }).in('id', BUB_IDS)
  if (error) { console.error('실패:', error.message); process.exit(1) }
  console.log(`✓ kp_bubbles ids=${BUB_IDS.join(',')} speaker → merchant_f`)

  // 확인
  const { data } = await sb.from('kp_bubbles').select('id, speaker, korean').in('id', BUB_IDS)
  for (const b of data ?? []) console.log(`  id=${b.id} [${b.speaker}] "${b.korean}"`)

  const { data: rem } = await sb.from('kp_bubbles').select('id').eq('speaker', 'merchant')
  console.log(`\nkp_bubbles merchant 잔존: ${rem?.length ?? 0}건`)
}
main().catch(e => { console.error(e); process.exit(1) })
