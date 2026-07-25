import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
async function main() {
  const { data, error } = await supabase.from('kp_challenges').select('*').limit(3)
  if (error) { console.error(error.message); return }
  console.log('kp_challenges sample:')
  console.log(JSON.stringify(data, null, 2))
}
main().catch(console.error)
