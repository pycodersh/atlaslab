import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 전체 행 수
  const { count } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true })
  console.log('kp_dialogue_expressions 전체 행 수:', count)

  // 첫 3행 전체 컬럼 확인
  const { data, error } = await sb.from('kp_dialogue_expressions').select('*').limit(3)
  if (error) console.log('error:', error.message)
  if (data) {
    for (const r of data) console.log(JSON.stringify(r))
  }

  // episode_id 컬럼 존재 여부
  const { data: d2, error: e2 } = await sb.from('kp_dialogue_expressions').select('episode_id').limit(1)
  console.log('\nepisode_id select error:', e2?.message ?? 'none')
  if (d2) console.log('episode_id sample:', JSON.stringify(d2[0]))
}
main().catch(console.error)
