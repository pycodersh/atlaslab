import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // Get first few rows to see column structure
  const { data, error } = await sb
    .from('kp_expressions')
    .select('*')
    .limit(3)

  if (error) { console.error(error); return }
  if (!data?.length) { console.log('No data'); return }

  console.log('=== kp_expressions 컬럼 목록 ===')
  console.log(Object.keys(data[0]).join('\n'))
  console.log('\n=== 첫 번째 row (focus) ===')
  console.log(JSON.stringify(data[0], null, 2))

  // Check EP01 expressions (ids 770, 771, 772)
  const { data: ep1 } = await sb.from('kp_expressions').select('*').in('id', [770, 771, 772])
  console.log('\n=== EP01 expressions ===')
  ep1?.forEach(r => console.log(JSON.stringify(r, null, 2)))

  // Count total
  const { count } = await sb.from('kp_expressions').select('*', { count: 'exact', head: true })
  console.log('\n총 expressions:', count)
}
main().catch(console.error)
