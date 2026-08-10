/**
 * EP03 id=10397 speaker: merchant → merchant_f
 * kp_dialogues + kp_bubbles 동시 변경, 연결 확인
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

const DLG_ID = 10397

async function main() {
  // 1. 변경 전 상태 확인
  const { data: dlg } = await sb.from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, audio_url').eq('id', DLG_ID).single()
  console.log('before kp_dialogues:', dlg)

  // 대응 bubble 찾기 (dialogue_id로 연결된 것)
  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, dialogue_id')
    .eq('dialogue_id', DLG_ID)
  console.log('linked kp_bubbles:', bubbles)

  if (!dlg) { console.error('dialogue not found'); process.exit(1) }
  if (dlg.speaker !== 'merchant') { console.log(`이미 변경됨: ${dlg.speaker}`); process.exit(0) }

  const DRY_RUN = process.argv.includes('--dry-run')
  if (DRY_RUN) { console.log('\n[DRY-RUN] 실제 변경 없음'); process.exit(0) }

  // 2. kp_dialogues 변경
  const { error: e1 } = await sb.from('kp_dialogues')
    .update({ speaker: 'merchant_f' }).eq('id', DLG_ID)
  if (e1) { console.error('kp_dialogues update failed:', e1.message); process.exit(1) }
  console.log('\n✓ kp_dialogues id=10397 speaker → merchant_f')

  // 3. kp_bubbles 변경 (dialogue_id 연결 레코드)
  if (bubbles && bubbles.length > 0) {
    const bubbleIds = bubbles.map(b => b.id)
    const { error: e2 } = await sb.from('kp_bubbles')
      .update({ speaker: 'merchant_f' }).in('id', bubbleIds)
    if (e2) { console.error('kp_bubbles update failed:', e2.message); process.exit(1) }
    console.log(`✓ kp_bubbles ids=${bubbleIds.join(',')} speaker → merchant_f`)
  } else {
    // dialogue_id 연결 없으면 korean 텍스트로 매칭
    const { data: bByText } = await sb.from('kp_bubbles')
      .select('id, episode_id, speaker, korean, dialogue_id')
      .eq('episode_id', dlg.episode_id)
      .eq('speaker', 'merchant')
      .eq('korean', dlg.text_ko)
    console.log('fallback bubble match by text:', bByText)
    if (bByText && bByText.length > 0) {
      const { error: e3 } = await sb.from('kp_bubbles')
        .update({ speaker: 'merchant_f' }).in('id', bByText.map(b => b.id))
      if (e3) { console.error('kp_bubbles fallback update failed:', e3.message); process.exit(1) }
      console.log(`✓ kp_bubbles (text match) ids=${bByText.map(b=>b.id).join(',')} → merchant_f`)
    } else {
      console.warn('⚠ kp_bubbles에서 대응 레코드를 찾지 못했습니다.')
    }
  }

  // 4. 변경 후 연결 확인
  const { data: afterDlg } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko, audio_url').eq('id', DLG_ID).single()
  const { data: afterBub } = await sb.from('kp_bubbles')
    .select('id, speaker, korean, dialogue_id')
    .eq('episode_id', 3).eq('speaker', 'merchant_f')
  console.log('\n변경 후 kp_dialogues:', afterDlg)
  console.log('변경 후 kp_bubbles (merchant_f):', afterBub)

  // 남아있는 merchant 버블 확인 (EP03)
  const { data: remaining } = await sb.from('kp_bubbles')
    .select('id, speaker, korean').eq('episode_id', 3).eq('speaker', 'merchant')
  if (remaining && remaining.length > 0)
    console.warn('⚠ EP03에 merchant 버블 잔존:', remaining)
  else
    console.log('✓ EP03 merchant 버블 잔존 없음')
}
main().catch(e => { console.error(e); process.exit(1) })
