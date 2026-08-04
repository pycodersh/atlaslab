import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 1. EP01 episode_id 확인
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const epId = ep?.id
  console.log(`EP01 episode_id: ${epId}`)

  // 2. kp_dialogue_expressions for EP01
  const { data: de, error: deErr } = await supabase
    .from('kp_dialogue_expressions')
    .select('*, kp_dialogues(text_ko, episode_id)')
    .eq('kp_dialogues.episode_id', epId)
    .limit(50)

  if (deErr) { console.error('de error:', deErr.message); }

  // 필터: episode_id 맞는 것만
  const ep1rows = (de ?? []).filter((r: any) => r.kp_dialogues?.episode_id === epId)
  console.log(`\nEP01 dialogue_expressions (필터 후): ${ep1rows.length}건`)

  if (ep1rows.length === 0) {
    // JOIN 없이 직접 조회
    const { data: dlgs } = await supabase
      .from('kp_dialogues').select('id').eq('episode_id', epId)
    const dlgIds = (dlgs ?? []).map((d: any) => d.id)
    console.log(`EP01 dialogue ids: ${dlgIds.join(', ')}`)

    const { data: de2, error: de2Err } = await supabase
      .from('kp_dialogue_expressions')
      .select('*')
      .in('dialogue_id', dlgIds)
    console.log(`EP01 dialogue_expressions (dialogue_id IN): ${de2?.length ?? 0}건`)
    if (de2Err) console.error('de2 error:', de2Err.message)
    if (de2?.length) {
      console.log('샘플:', JSON.stringify(de2[0], null, 2))
    }
  } else {
    console.log('샘플:')
    for (const r of ep1rows.slice(0, 3)) {
      console.log(`  dialogue_id=${r.dialogue_id} matched_text="${r.matched_text}" role=${r.role}`)
      console.log(`  text_ko="${r.kp_dialogues?.text_ko}"`)
      const inText = r.kp_dialogues?.text_ko?.includes(r.matched_text)
      console.log(`  matched_text ∈ text_ko: ${inText}`)
    }
  }

  // 3. kp_bubbles EP01 샘플 — dialogue_id, position, korean 확인
  const { data: bubbles } = await supabase
    .from('kp_bubbles').select('id, dialogue_id, korean, position').eq('episode_id', epId).limit(3)
  console.log(`\nEP01 kp_bubbles 샘플 (${bubbles?.length ?? 0}건):`)
  for (const b of bubbles ?? []) {
    console.log(`  bubble id=${b.id} dialogue_id=${b.dialogue_id} korean="${b.korean}"`)
  }

  // 4. kp_expressions 전체 샘플
  const { data: exprs } = await supabase
    .from('kp_expressions').select('id, episode_id, matched_text, focus_pattern').limit(5)
  console.log('\nkp_expressions 샘플:')
  for (const e of exprs ?? []) {
    console.log(`  id=${e.id} ep=${e.episode_id} matched_text="${e.matched_text}" focus="${e.focus_pattern}"`)
  }
}

main().catch(console.error)
