import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  // id=1241 (~먹을 수 있어요?) → EP3 dial=8253 (매운 거 먹을 수 있어?)
  const { data: dup } = await sb.from('kp_dialogue_expressions')
    .select('id').eq('expression_id', 1241).eq('dialogue_id', 8253).eq('role', 'focus').maybeSingle()
  if (dup) { console.log('이미 연결됨'); return }
  const { error } = await sb.from('kp_dialogue_expressions').insert({
    expression_id: 1241,
    dialogue_id: 8253,
    role: 'focus',
    matched_text: '매운 거 먹을 수 있어?',
  })
  if (error) { console.error('INSERT 실패:', error.message); return }
  console.log('✅ id=1241 → dial=8253 연결 완료')
  const { count } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }).gte('expression_id', 1241).lte('expression_id', 1293)
  console.log('신규 패턴(1241~1293) 연결 총: ' + count + '건')
}
run().catch(console.error)
