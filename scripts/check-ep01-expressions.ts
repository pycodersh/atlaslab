import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id,episode_num').eq('episode_num', 1).single()
  if (!ep) { console.log('EP01 없음'); return }
  console.log('EP01 id:', ep.id)

  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, order_num, korean, expression_id, highlight_text')
    .eq('episode_id', ep.id)
    .order('order_num')

  const all = bubbles ?? []
  const withExpr = all.filter(b => b.expression_id != null)
  console.log(`EP01 버블 총 ${all.length}개, expression_id 있는 것: ${withExpr.length}개`)
  withExpr.forEach(b => console.log(`  order_num=${b.order_num} expr_id=${b.expression_id} highlight="${b.highlight_text}" korean="${b.korean.slice(0,30)}"` ))
}
main().catch(console.error)
