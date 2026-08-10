import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data: ep01 } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const { data: panels01 } = await sb.from('kp_panels').select('order_num,type,height_ratio').eq('episode_id', ep01!.id).order('order_num')
  const gaps01 = (panels01 ?? []).filter((p:any) => p.type === 'gap')
  console.log('EP01 gaps total:', gaps01.length)
  console.log('  first gap:', JSON.stringify(gaps01[0]))
  console.log('  last  gap:', JSON.stringify(gaps01[gaps01.length-1]))

  const { data: ep31 } = await sb.from('kp_episodes').select('id').eq('episode_num', 31).single()
  const { data: panels31 } = await sb.from('kp_panels').select('order_num,type,height_ratio').eq('episode_id', ep31!.id).order('order_num')
  const gaps31 = (panels31 ?? []).filter((p:any) => p.type === 'gap')
  console.log('EP31 hasGaps:', gaps31.length > 0, 'gap count:', gaps31.length)
  if (gaps31.length) { gaps31.forEach((g:any) => console.log('  gap:', JSON.stringify(g))) }

  const { data: ep50 } = await sb.from('kp_episodes').select('id').eq('episode_num', 50).single()
  const { data: panels50 } = await sb.from('kp_panels').select('order_num,type').eq('episode_id', ep50!.id).order('order_num')
  const hasGaps50 = (panels50 ?? []).some((p:any) => p.type === 'gap')
  console.log('EP50 hasGaps:', hasGaps50, 'total panels:', panels50?.length)
}
main().catch(console.error)
