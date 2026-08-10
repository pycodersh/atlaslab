import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function checkEp(epNum: number) {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (!ep) return
  const { data: panels } = await sb.from('kp_panels').select('order_num,type,height_ratio').eq('episode_id', ep.id).order('order_num')
  const gaps = (panels ?? []).filter((p:any) => p.type === 'gap')
  const first = gaps[0], last = gaps[gaps.length-1]
  const px1 = first ? (first.height_ratio * 430).toFixed(0) : '-'
  const pxL = last ? (last.height_ratio * 430).toFixed(0) : '-'
  console.log(`EP${String(epNum).padStart(2,'0')}: first=${first?.height_ratio?.toFixed(3)} (${px1}px)  last=${last?.height_ratio?.toFixed(3)} (${pxL}px)  gaps=${gaps.length}`)
}

async function main() {
  for (const n of [1,2,5,10,15,20,25,30]) await checkEp(n)
}
main().catch(console.error)
