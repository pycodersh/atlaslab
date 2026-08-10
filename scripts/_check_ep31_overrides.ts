import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data } = await sb.from('kpatto_webtoon_layouts').select('episode_id, overrides').eq('episode_id', 'kp-ep-031').single()
  if (!data) { console.log('kp-ep-031: no layout'); return }
  const ov = data.overrides as Record<string, unknown>
  const keys = Object.keys(ov)
  console.log(`kp-ep-031 overrides (${keys.length} keys):`)
  keys.forEach(k => console.log(' ', k))
}
main().catch(console.error)
