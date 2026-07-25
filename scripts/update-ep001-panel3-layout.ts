import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (!ep) { console.error('Episode 1 not found'); return }

  // panel-3 = ep01_c3.png = order_num 6 in kp_panels
  const { error } = await supabase
    .from('kp_panels')
    .update({ layout: 'small-center' })
    .eq('episode_id', ep.id)
    .eq('order_num', 6)

  if (error) console.error(`FAIL: ${error.message}`)
  else console.log('✓ panel order=6 (ep01_c3.png) → layout=small-center')

  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
