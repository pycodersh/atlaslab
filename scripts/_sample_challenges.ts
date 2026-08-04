import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data, error } = await sb.from('kp_challenges').select('*').limit(3)
  if (error) { console.error('ERR', error.message) } else { console.log(JSON.stringify(data, null, 2)) }
}
main().catch(console.error)
