import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  const { data } = await sb.from('kp_panels').select('*').limit(8).order('id')
  console.log(JSON.stringify(data, null, 2))
  const { count } = await sb.from('kp_panels').select('*', { count: 'exact', head: true })
  console.log('kp_panels total:', count)
}
run().catch(console.error)
