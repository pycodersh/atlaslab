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
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  let total = 0
  const below8: number[] = []
  for (const ep of eps ?? []) {
    const { count } = await sb.from('kp_bubbles')
      .select('id', { count: 'exact', head: true })
      .eq('episode_id', ep.id)
    const c = count ?? 0
    total += c
    if (c < 8) below8.push(ep.episode_num)
    const flag = c < 8 ? ' ← ⚠' : ''
    console.log(`EP${String(ep.episode_num).padStart(2,'0')}: ${c}${flag}`)
  }
  console.log(`\n총 말풍선: ${total}`)
  if (below8.length) console.log(`8개 미만: EP${below8.join(', EP')}`)
  else console.log('모든 화 8개 이상 ✓')
}
main().catch(e => { console.error(e); process.exit(1) })
