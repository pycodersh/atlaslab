/**
 * EP07 id=10435·10438·10440 speaker: merchant → merchant_f
 * kp_dialogues + kp_bubbles 동시 변경
 * 변경 후 DB에 남은 merchant 레코드 확인
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const TARGET_IDS = [10435, 10438, 10440]
const DRY = process.argv.includes('--dry-run')

async function main() {
  // 1. 변경 전 확인
  const { data: before } = await sb.from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko').in('id', TARGET_IDS)
  console.log('변경 전 kp_dialogues:')
  for (const r of before ?? []) console.log(`  id=${r.id} ep=${r.episode_id} [${r.speaker}] "${r.text_ko}"`)

  const { data: bubblesBefore } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, dialogue_id').in('dialogue_id', TARGET_IDS)
  console.log('대응 kp_bubbles:', bubblesBefore?.length, '건')
  for (const b of bubblesBefore ?? []) console.log(`  bub_id=${b.id} dlg_id=${b.dialogue_id} [${b.speaker}] "${b.korean}"`)

  if (DRY) { console.log('\n[DRY-RUN] 실제 변경 없음'); process.exit(0) }

  // 2. kp_dialogues 변경
  const { error: e1 } = await sb.from('kp_dialogues')
    .update({ speaker: 'merchant_f' }).in('id', TARGET_IDS)
  if (e1) { console.error('kp_dialogues 변경 실패:', e1.message); process.exit(1) }
  console.log(`\n✓ kp_dialogues ids=${TARGET_IDS.join(',')} speaker → merchant_f`)

  // 3. kp_bubbles 변경 (dialogue_id 기준)
  if (bubblesBefore && bubblesBefore.length > 0) {
    const bubIds = bubblesBefore.map(b => b.id)
    const { error: e2 } = await sb.from('kp_bubbles')
      .update({ speaker: 'merchant_f' }).in('id', bubIds)
    if (e2) { console.error('kp_bubbles 변경 실패:', e2.message); process.exit(1) }
    console.log(`✓ kp_bubbles ids=${bubIds.join(',')} speaker → merchant_f`)
  } else {
    console.warn('⚠ kp_bubbles 대응 레코드 없음 (dialogue_id 기준)')
  }

  // 4. 변경 후 확인
  const { data: after } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko').in('id', TARGET_IDS)
  console.log('\n변경 후 kp_dialogues:')
  for (const r of after ?? []) console.log(`  id=${r.id} [${r.speaker}] "${r.text_ko}"`)

  // 5. DB 전체에 merchant 잔존 여부 확인
  const { data: remaining } = await sb.from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko').eq('speaker', 'merchant')
  if (remaining && remaining.length > 0) {
    console.warn(`\n⚠ kp_dialogues에 merchant 잔존 ${remaining.length}건:`)
    for (const r of remaining) console.log(`  id=${r.id} ep=${r.episode_id} "${r.text_ko}"`)
  } else {
    console.log('\n✓ kp_dialogues에 merchant 잔존 없음 → VOICE_MAP merchant 키 제거 완료')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
