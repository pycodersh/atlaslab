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

  // gap-2(order=5): cut3 위, gap-3(order=7): cut3↔4 사이, gap-4(order=9): cut4 아래
  const targets = [5, 7, 9]
  for (const orderNum of targets) {
    const { error } = await supabase
      .from('kp_panels')
      .update({ height_ratio: 480 / 430 })
      .eq('episode_id', ep.id)
      .eq('order_num', orderNum)
    if (error) console.error(`FAIL order=${orderNum}: ${error.message}`)
    else console.log(`✓ gap order=${orderNum} → 480px`)
  }
  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
