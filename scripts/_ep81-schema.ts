import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data, error } = await sb.from('kp_bubbles').select('*').eq('episode_id', 81).limit(5).order('id')
  if (error) throw error
  if (data?.length) console.log('columns:', Object.keys(data[0]).join(', '))
  for (const r of data ?? []) console.log(JSON.stringify(r))
}
main().catch(e => { console.error(e); process.exit(1) })
