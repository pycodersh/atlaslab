import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
async function main() {
  const { data } = await sb
    .from('kp_expressions')
    .select('id, korean, english, category, examples')
    .or('english.is.null,english.eq.')
    .order('id')
  console.log('총', data?.length, '건\n')
  for (const r of (data ?? [])) {
    const exArr = Array.isArray(r.examples) ? r.examples as {ko:string,en:string}[] : []
    const ex0 = exArr[0]
    console.log(`id=${r.id} [${r.category ?? '-'}] ${r.korean}`)
    if (ex0) console.log(`  ex: "${ex0.ko}" / "${ex0.en}"`)
  }
}
main().catch(console.error)
