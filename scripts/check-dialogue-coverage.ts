import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 전체 kp_bubbles에서 dialogue_id 커버리지
  const { count: total } = await sb.from('kp_bubbles').select('*', { count: 'exact', head: true })
  const { count: withDlg } = await sb.from('kp_bubbles').select('*', { count: 'exact', head: true }).not('dialogue_id', 'is', null)
  const { count: noDlg } = await sb.from('kp_bubbles').select('*', { count: 'exact', head: true }).is('dialogue_id', null)
  console.log(`kp_bubbles 전체: ${total}`)
  console.log(`  dialogue_id 있음: ${withDlg}`)
  console.log(`  dialogue_id 없음 (null): ${noDlg}`)

  // dialogue_id 없는 것 샘플
  const { data: noDlgSample } = await sb
    .from('kp_bubbles')
    .select('id, speaker, korean, dialogue_id, kp_episodes(episode_num)')
    .is('dialogue_id', null)
    .limit(10)
  console.log('\n=== dialogue_id null 샘플 ===')
  noDlgSample?.forEach((r: any) =>
    console.log(`  id=${r.id} ep=${r.kp_episodes?.episode_num} speaker=${r.speaker} | ${r.korean}`)
  )

  // kp_dialogues 스키마 확인
  const { data: dlgSample } = await sb
    .from('kp_dialogues')
    .select('*')
    .limit(3)
  console.log('\n=== kp_dialogues 컬럼 ===', Object.keys(dlgSample?.[0] ?? {}))
  dlgSample?.forEach((r: any) => console.log(`  id=${r.id} ep=${r.episode_id} speaker=${r.speaker} | ${r.text_ko}`))

  // kp_dialogues 전체 수
  const { count: dlgTotal } = await sb.from('kp_dialogues').select('*', { count: 'exact', head: true })
  console.log(`\nkp_dialogues 전체: ${dlgTotal}`)

  // EP01 bubble vs dialogue 1:1 매칭 검증
  const { data: ep1Bubbles } = await sb
    .from('kp_bubbles')
    .select('id, dialogue_id, korean, speaker, kp_panels!inner(kp_episodes!inner(episode_num))')
    .filter('kp_panels.kp_episodes.episode_num', 'eq', 1)
    .order('id')
  const dlgIdsEp1 = ep1Bubbles?.filter((b: any) => b.dialogue_id).map((b: any) => b.dialogue_id) ?? []

  const { data: ep1Dialogues } = await sb
    .from('kp_dialogues')
    .select('id, text_ko, speaker')
    .in('id', dlgIdsEp1)
    .order('id')

  console.log('\n=== EP01 bubble ↔ dialogue 매칭 (첫 5개) ===')
  ep1Bubbles?.slice(0, 5).forEach((b: any) => {
    const dlg = ep1Dialogues?.find((d: any) => d.id === b.dialogue_id)
    const match = dlg?.text_ko === b.korean ? '✅ 일치' : '❌ 불일치'
    console.log(`  bubble id=${b.id} dlg_id=${b.dialogue_id}`)
    console.log(`    bubble.korean: "${b.korean}"`)
    console.log(`    dialogue.text_ko: "${dlg?.text_ko ?? '(없음)'}" ${match}`)
  })
}
main().catch(console.error)
