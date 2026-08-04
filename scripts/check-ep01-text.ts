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

  const { data: dlg } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .eq('episode_id', ep!.id)
    .order('order_num')

  console.log('=== kp_dialogues EP01 ===')
  for (const d of dlg ?? []) console.log(`  id=${d.id} [${d.speaker}] "${d.text_ko}"`)

  const { data: bub } = await sb
    .from('kp_bubbles')
    .select('id, speaker, korean')
    .eq('episode_id', ep!.id)
    .order('order_num')

  console.log('\n=== kp_bubbles EP01 ===')
  for (const b of bub ?? []) console.log(`  id=${b.id} [${b.speaker}] "${b.korean}"`)
}

main().catch(console.error)
