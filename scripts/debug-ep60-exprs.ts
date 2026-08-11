import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data } = await sb.from('kp_expressions').select('id, korean, first_episode').eq('first_episode', 60)
  console.log('EP60 expressions:', JSON.stringify(data, null, 2))
}
main().catch(console.error)
