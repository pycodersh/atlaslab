import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 3).single()
  const { data: dials } = await sb.from('kp_dialogues').select('id, text_ko, order_num').eq('episode_id', (ep as any).id).order('id')
  console.log('EP3 대사:')
  for (const d of (dials as any[])) {
    const ko = d.text_ko as string
    const flag = ko.includes('수 있') || ko.includes('먹') ? ' ◀' : ''
    console.log('  [' + d.order_num + '] id=' + d.id + ' ' + ko + flag)
  }
}
run().catch(console.error)
