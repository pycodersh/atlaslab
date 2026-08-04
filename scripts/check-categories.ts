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
  // Distinct categories
  const { data: cats } = await sb.from('kp_expressions').select('category')
  const uniq = [...new Set(cats?.map((r: any) => r.category))]
  console.log('=== 카테고리 목록 ===', uniq)

  // Sample rows
  const { data: sample } = await sb.from('kp_expressions').select('id, korean, english, category, first_episode').limit(10)
  console.log('\n=== 샘플 10개 ===')
  sample?.forEach((r: any) => console.log(`id=${r.id} cat=${r.category} ep=${r.first_episode} | ${r.korean}`))

  // Total count
  const { count } = await sb.from('kp_expressions').select('*', { count: 'exact', head: true })
  console.log('\n총:', count)
}
main().catch(console.error)
