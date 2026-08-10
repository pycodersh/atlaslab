import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data } = await sb.from('kpatto_webtoon_layouts').select('overrides').eq('episode_id', 'kp-ep-031').single()
  const ov = data?.overrides as Record<string, any>
  console.log('b-gap-0-1:', JSON.stringify(ov['b-gap-0-1']))
  console.log('b-gap-5-1:', JSON.stringify(ov['b-gap-5-1']))
  console.log('b-gap-5-2:', JSON.stringify(ov['b-gap-5-2']))
}
main().catch(console.error)
