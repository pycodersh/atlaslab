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
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 2).single()
  if (!ep) { console.error('EP02 not found'); return }

  // order=6 = cut-3, crop-panel → panel
  const { error } = await supabase
    .from('kp_panels')
    .update({
      type: 'panel',
      layout: 'wide',
      image_url: '/kpatto/ep02/ep02_c3.png',
    })
    .eq('episode_id', ep.id)
    .eq('order_num', 6)

  if (error) console.error(`FAIL: ${error.message}`)
  else console.log('✓ EP02 order=6: crop-panel → panel, image_url=/kpatto/ep02/ep02_c3.png')
  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
