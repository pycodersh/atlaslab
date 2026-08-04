import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // EP11~30 episode id 목록
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 11).lte('episode_num', 30)
    .order('episode_num')

  const epIds = eps?.map(e => e.id) ?? []
  const epNumMap = new Map(eps?.map(e => [e.id, e.episode_num]) ?? [])

  // kp_bubbles (실제 표시 텍스트)
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean')
    .in('episode_id', epIds)
    .order('episode_id').order('order_num')

  // kp_dialogues (구 텍스트)
  const { data: dialogues } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko')
    .in('episode_id', epIds)
    .order('episode_id').order('order_num')

  // 버블 텍스트 set (정규화)
  const bubbleTexts = new Set((bubbles ?? []).map(b => b.korean.trim()))

  // dialogues 중 버블에 없는 것 (불일치)
  const mismatches = (dialogues ?? []).filter(d => !bubbleTexts.has(d.text_ko.trim()))

  if (mismatches.length === 0) {
    console.log('✅ EP11~30 불일치 없음')
    return
  }

  console.log(`❌ 불일치 ${mismatches.length}건:\n`)
  for (const d of mismatches) {
    const epNum = epNumMap.get(d.episode_id) ?? '?'
    console.log(`  EP${String(epNum).padStart(2,'0')} dlg_id=${d.id} [${d.speaker}]`)
    console.log(`    kp_dialogues: "${d.text_ko}"`)
    // 같은 에피소드 버블 중 비슷한 텍스트 찾기
    const similar = (bubbles ?? [])
      .filter(b => b.episode_id === d.episode_id && b.speaker === d.speaker)
      .map(b => b.korean)
    if (similar.length) console.log(`    kp_bubbles 동일화자: ${similar.map(s => `"${s}"`).join(' / ')}`)
  }
}

main().catch(console.error)
