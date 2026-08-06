import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  console.log('\n=== 에피소드별 대사 음성 완성 현황 ===')
  let doneCount = 0
  for (const ep of eps ?? []) {
    const { data: rows } = await sb.from('kp_dialogues').select('id, audio_url').eq('episode_id', ep.id)
    const total = rows?.length ?? 0
    const ok    = rows?.filter(r => r.audio_url).length ?? 0
    const flag  = total === 0 ? '(데이터없음)' : ok === total ? '✅ 완료' : `❌ ${ok}/${total}`
    if (ok === total && total > 0) doneCount++
    console.log(`EP${String(ep.episode_num).padStart(2,'0')}  ${flag}`)
  }
  console.log(`\n완성 화수: ${doneCount}화`)
}
main().catch(e => console.error(e.message))
