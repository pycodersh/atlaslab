import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  for (const ep of [78, 81]) {
    console.log(`\n=== EP${ep} ===`)
    const { data: d } = await sb.from('kp_dialogues').select('id, order_num, speaker, text_ko').eq('episode_id', ep).order('order_num')
    const { data: b } = await sb.from('kp_bubbles').select('id, order_num, speaker, korean, dialogue_id').eq('episode_id', ep).order('order_num')
    console.log(`대사 ${d?.length}건 / 버블 ${b?.length}건`)
    console.log('-- 대사 --')
    for (const x of d ?? []) console.log(`  id=${x.id} #${x.order_num} [${x.speaker}] ${JSON.stringify(x.text_ko)}`)
    console.log('-- 버블 --')
    for (const x of b ?? []) console.log(`  id=${x.id} #${x.order_num} [${x.speaker}] dlg=${x.dialogue_id} ${JSON.stringify(x.korean)}`)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
