import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data, error } = await sb.from('kp_expressions').select('slug, korean, romaja').order('first_episode').limit(8)
  if (error) throw error
  console.log('slug                    | korean            | romaja')
  console.log('------------------------|-------------------|------------------')
  for (const r of data ?? []) {
    console.log(`${(r.slug||'').padEnd(24)}| ${(r.korean||'').padEnd(18)}| ${r.romaja ?? '(null)'}`)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
