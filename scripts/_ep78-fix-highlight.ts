import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const { error } = await sb
    .from('kp_bubbles')
    .update({ highlight_text: '얼마나 있을 거야?' })
    .eq('id', 4001)
  if (error) throw new Error(`업데이트 실패: ${error.message}`)

  const { data, error: chkErr } = await sb
    .from('kp_bubbles')
    .select('id, korean, highlight_text')
    .eq('id', 4001)
    .single()
  if (chkErr) throw new Error(chkErr.message)
  console.log(`✅ id=${data.id}`)
  console.log(`   korean: "${data.korean}"`)
  console.log(`   highlight_text: "${data.highlight_text}"`)
}
main().catch(e => { console.error(e.message); process.exit(1) })
