import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id,title').eq('episode_num', 31).single()
  if (!ep) { console.log('EP31 not found'); return }
  console.log(`EP31 title: ${ep.title}`)
  const { data: bubs } = await sb.from('kp_bubbles')
    .select('id,order_num,korean,dialogue_id,translations')
    .eq('episode_id', ep.id)
    .order('order_num')
  const bubList = (bubs ?? []) as { id:number; order_num:number; korean:string; dialogue_id:number|null; translations:Record<string,string>|null }[]
  const dlgIds = bubList.filter(b => b.dialogue_id).map(b => b.dialogue_id!)
  const { data: dlgs } = await sb.from('kp_dialogues').select('id,text_ko').in('id', dlgIds)
  const dlgMap = new Map((dlgs??[]).map(d => [d.id as number, d.text_ko as string]))
  console.log(`\n총 ${bubList.length}개 버블:\n`)
  for (const b of bubList) {
    const text = b.dialogue_id ? (dlgMap.get(b.dialogue_id) ?? b.korean) : b.korean
    console.log(`  [${String(b.order_num).padStart(2)}] ko: "${text}"`)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
