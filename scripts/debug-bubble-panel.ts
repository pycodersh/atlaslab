import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  // EP01 에피소드 id 확인
  const { data: ep } = await sb.from('kp_episodes').select('id, episode_num, title').eq('episode_num', 1).single()
  console.log('EP01:', ep)

  // EP01 패널
  const { data: panels } = await sb.from('kp_panels').select('id, episode_id, order_num, type').eq('episode_id', (ep as any).id).order('order_num')
  console.log('\nEP01 패널:')
  for (const p of (panels ?? []) as any[]) console.log(' ', p)

  // EP01 버블 (korean 있는 것)
  const { data: bubbles } = await sb.from('kp_bubbles').select('id, panel_id, episode_id, order_num, speaker, korean').eq('episode_id', (ep as any).id).not('korean', 'is', null).order('order_num').limit(5)
  console.log('\nEP01 버블 샘플 (korean):')
  for (const b of (bubbles ?? []) as any[]) console.log(' ', b)
}
run().catch(console.error)
