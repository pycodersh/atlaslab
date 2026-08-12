import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EXPRS = ['~많이 해?', '~유행이야?', '~올렸더니', '-는 바람에']

async function main() {
  const { data } = await sb.from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('korean', EXPRS)

  console.log('── EP63 표현 4개 DB 확인 ──')
  for (const expr of EXPRS) {
    const found = (data ?? []).find(r => r.korean === expr)
    if (found) {
      console.log(`  ✓ id=${found.id} "${found.korean}" first_ep=${found.first_episode}`)
    } else {
      console.log(`  ✗ 미등록: "${expr}"`)
    }
  }
}
main().catch(console.error)
