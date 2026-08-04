import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  // 외래키 순서: kp_dialogue_expressions → kp_dialogues, kp_challenges 순으로 삭제
  console.log('kp_dialogue_expressions 삭제 중...')
  const { error: e1 } = await sb.from('kp_dialogue_expressions').delete().gte('id', 0)
  if (e1) { console.error('실패:', e1.message); return }
  console.log('  완료')

  console.log('kp_challenges 삭제 중...')
  const { error: e2 } = await sb.from('kp_challenges').delete().gte('id', 0)
  if (e2) { console.error('실패:', e2.message); return }
  console.log('  완료')

  console.log('kp_dialogues 삭제 중...')
  const { error: e3 } = await sb.from('kp_dialogues').delete().gte('id', 0)
  if (e3) { console.error('실패:', e3.message); return }
  console.log('  완료')

  // 최종 확인
  const [d, dex, ch, ex] = await Promise.all([
    sb.from('kp_dialogues').select('*', { count: 'exact', head: true }),
    sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }),
    sb.from('kp_challenges').select('*', { count: 'exact', head: true }),
    sb.from('kp_expressions').select('*', { count: 'exact', head: true }),
  ])
  console.log('\n최종 확인:')
  console.log('  kp_dialogues            :', d.count, '건')
  console.log('  kp_dialogue_expressions :', dex.count, '건')
  console.log('  kp_challenges           :', ch.count, '건')
  console.log('  kp_expressions          :', ex.count, '건 (유지)')
}
run().catch(console.error)
