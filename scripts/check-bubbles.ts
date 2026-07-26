import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
async function main() {
  const { data, error } = await sb.from('kp_bubbles').select('*').limit(3)
  if (error) { console.error(error); return }
  console.log('kp_bubbles sample:', JSON.stringify(data, null, 2))

  const { count } = await sb.from('kp_bubbles').select('id', { count: 'exact', head: true }).not('expression_id', 'is', null)
  console.log('expression_id 설정된 bubbles 수:', count)
}
main().catch(console.error)
