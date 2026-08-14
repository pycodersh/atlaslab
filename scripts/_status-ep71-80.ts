import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data: eps } = await sb.from('kp_episodes').select('id,episode_num').gte('episode_num',71).lte('episode_num',80).order('episode_num')
  if (!eps?.length) { console.log('EP71~80 없음'); return }
  const epIds = eps.map(e => e.id)
  const epMap = new Map(eps.map(e => [e.id, e.episode_num]))
  const { data: bubbles } = await sb.from('kp_bubbles').select('id,episode_id,audio_url').in('episode_id', epIds)
  const all = bubbles ?? []
  console.log('\nEP   | 전체 | 완료 | 미완')
  console.log('-----|------|------|------')
  let tAll=0,tDone=0,tPend=0
  for (const ep of eps) {
    const rows = all.filter(b => b.episode_id === ep.id)
    const done = rows.filter(b => b.audio_url).length
    const pend = rows.length - done
    tAll+=rows.length; tDone+=done; tPend+=pend
    console.log('EP'+String(ep.episode_num).padStart(2,'0')+' |  '+String(rows.length).padStart(3)+' |  '+String(done).padStart(3)+' |  '+String(pend).padStart(3))
  }
  console.log('-----|------|------|------')
  console.log('합계 |  '+String(tAll).padStart(3)+' |  '+String(tDone).padStart(3)+' |  '+String(tPend).padStart(3))
  console.log(tPend<=85 ? '\n✅ 한도(85) 이내 — 전부 처리 가능' : '\n⚠️  '+tPend+'건 중 오늘은 85건만 처리')
}
main().catch(e=>{console.error(e);process.exit(1)})
