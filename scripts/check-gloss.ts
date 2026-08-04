import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
async function main() {
  const { data, error } = await sb.from('kp_expressions').select('id, korean, english').order('id')
  if (error) { console.error(error); return }
  console.log('전체:', data?.length, '건')
  const nulls = (data ?? []).filter(r => r.english == null || r.english === '')
  const filled = (data ?? []).filter(r => r.english != null && r.english !== '')
  console.log('english null/empty:', nulls.length, '건')
  console.log('english 있음:', filled.length, '건')
  console.log('\n--- null/empty 건 목록 ---')
  for (const r of nulls) {
    console.log(`  id=${r.id}  ${r.korean}`)
  }
  console.log('\n--- 값 있는 건 (처음 10개) ---')
  for (const r of filled.slice(0, 10)) {
    console.log(`  id=${r.id}  ${r.korean}  |  "${r.english}"`)
  }
}
main().catch(console.error)
