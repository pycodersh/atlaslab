import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const { data, error } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, audio_url')
    .order('episode_id').order('id')
  if (error) { console.error(error.message); process.exit(1) }

  // 에피소드별 집계
  const byEp: Record<number, { total: number; done: number }> = {}
  for (const d of data ?? []) {
    if (!byEp[d.episode_id]) byEp[d.episode_id] = { total: 0, done: 0 }
    byEp[d.episode_id].total++
    if (d.audio_url) byEp[d.episode_id].done++
  }

  console.log('EP  | 완료/전체 | 상태')
  console.log('----+-----------+------')
  for (const [ep, s] of Object.entries(byEp).sort((a,b) => Number(a[0]) - Number(b[0]))) {
    const status = s.done === s.total ? '✅ 완료' : s.done === 0 ? '❌ 미생성' : `⚠  ${s.done}/${s.total}`
    console.log(`EP${String(ep).padStart(2,'0')} |   ${String(s.done).padStart(2)}/${s.total}    | ${status}`)
  }

  const total  = Object.values(byEp).reduce((a,b) => a + b.total, 0)
  const done   = Object.values(byEp).reduce((a,b) => a + b.done,  0)
  console.log(`\n합계: ${done}/${total}건 완료`)
}
main().catch(e => { console.error(e); process.exit(1) })
