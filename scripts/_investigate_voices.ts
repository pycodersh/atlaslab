import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const MINOR_SPEAKERS = ['stranger','merchant','clerk','staff','professor','student','announcement','pharmacist','doctor','간호사']

async function main() {
  const { data: all, error } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, audio_url')
    .in('speaker', MINOR_SPEAKERS)
    .order('speaker').order('episode_id').order('id')
  if (error) { console.error(error.message); process.exit(1) }

  // 화자별로 집계
  const bySpeaker: Record<string, { total: number; hasAudio: number; rows: typeof all }> = {}
  for (const d of all ?? []) {
    if (!bySpeaker[d.speaker]) bySpeaker[d.speaker] = { total: 0, hasAudio: 0, rows: [] }
    bySpeaker[d.speaker].total++
    if (d.audio_url) bySpeaker[d.speaker].hasAudio++
    bySpeaker[d.speaker].rows!.push(d)
  }

  let grandTotal = 0
  let grandAudio = 0
  console.log('\n=== 단역 화자별 집계 (재생성 필요) ===')
  for (const [sp, stat] of Object.entries(bySpeaker)) {
    grandTotal += stat.total
    grandAudio += stat.hasAudio
    console.log(`\n  [${sp}] 총 ${stat.total}건, 음원있음 ${stat.hasAudio}건 → --force 필요 ${stat.hasAudio}회`)
    for (const d of stat.rows ?? [])
      console.log(`    EP${String(d.episode_id).padStart(2,'0')} id=${d.id} ${d.audio_url ? '✓' : '✗'} "${d.text_ko}"`)
  }
  console.log(`\n  합계: ${grandTotal}건 중 ${grandAudio}건 음원있음 → --force 재생성 필요 ${grandAudio}회`)

  // EP09 id=10453 (에마 넓어요) 따로 확인
  const { data: ep09 } = await sb.from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, audio_url, audio_hash')
    .eq('id', 10453)
  console.log('\n=== EP09 "넓어요" (id=10453) ===')
  console.log(JSON.stringify(ep09, null, 2))
}
main().catch(e => { console.error(e); process.exit(1) })
