import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data: ep31 } = await sb.from('kp_episodes').select('id').eq('episode_num', 31).single()
  const { data: panels } = await sb.from('kp_panels').select('order_num,type,height_ratio,layout').eq('episode_id', ep31!.id).order('order_num')
  console.log('EP31 panels:')
  ;(panels ?? []).forEach((p:any) => console.log(`  [${p.order_num}] ${p.type} layout=${p.layout} hr=${p.height_ratio}`))
}
main().catch(console.error)
