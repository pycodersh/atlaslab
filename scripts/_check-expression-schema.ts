import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data, error } = await sb.from('kp_expressions').select('*').limit(1)
  if (error) throw error
  if (data?.[0]) console.log('컬럼 목록:', Object.keys(data[0]).join(', '))
}
main().catch(e => { console.error(e); process.exit(1) })
