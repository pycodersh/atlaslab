import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const { data } = await sb.from('kp_bubbles')
    .select('id, korean, expression_id, dialogue_id, highlight_text')
    .eq('episode_id', ep!.id)
    .order('order_num')

  for (const b of data ?? []) {
    const hasExpr = b.expression_id != null
    const hasHl = b.highlight_text != null
    if (hasExpr || hasHl) {
      console.log(`id=${b.id} expr=${b.expression_id} dlg=${b.dialogue_id} hl=${b.highlight_text} | ${b.korean.replace(/\n/g,' ').slice(0,25)}`)
    }
  }
}

main().catch(console.error)
