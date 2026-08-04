import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  const { data } = await sb.from('kp_expressions').select('id, korean, first_episode').gte('id', 1241).lte('id', 1293).order('id')
  console.log(JSON.stringify(data, null, 2))
}
run().catch(console.error)
