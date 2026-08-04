import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  const { data } = await sb.from('kp_dialogues').select('speaker')
  const speakers = [...new Set((data ?? []).map((d: any) => d.speaker))].sort()
  console.log('All speakers:', speakers)

  const { data: p18 } = await sb.from('kp_panels').select('*').eq('id', 18).single()
  console.log('\nPanel 18:', JSON.stringify(p18))

  const { data: ep2ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 2).single()
  const { data: sc2 } = await sb.from('kp_scenes').select('*').eq('episode_id', (ep2ep as any).id).order('scene_number')
  console.log('\nEP02 scenes:', JSON.stringify(sc2))
}
run().catch(console.error)
