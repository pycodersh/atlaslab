import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function verifyEpisode(ep: number) {
  // 1. bubbles 수
  const { data: bubbles, error: e1 } = await supabase
    .from('kp_bubbles')
    .select('id, dialogue_id')
    .eq('episode_id', ep)

  if (e1) { console.error('bubbles error:', e1); process.exit(1) }

  // 2. scenes → dialogues → dialogue_expressions 매칭 실패
  const { data: scenes } = await supabase
    .from('kp_scenes')
    .select('id')
    .eq('episode_id', ep)

  const sceneIds = (scenes ?? []).map((s: any) => s.id)

  const { data: dialogues } = await supabase
    .from('kp_dialogues')
    .select('id')
    .in('scene_id', sceneIds)

  const dialogueIds = (dialogues ?? []).map((d: any) => d.id)

  const { data: des, error: e2 } = await supabase
    .from('kp_dialogue_expressions')
    .select('id, dialogue_id, expression_id')
    .in('dialogue_id', dialogueIds)

  if (e2) { console.error('dialogue_expressions error:', e2); process.exit(1) }

  const unmatched = (des ?? []).filter((d: any) => d.expression_id == null)

  console.log(`EP${ep} kp_bubbles: ${bubbles!.length}개`)
  if (unmatched.length === 0) {
    console.log(`✅ kp_dialogue_expressions 매칭 실패: 0건 (전체 ${des!.length}건)`)
  } else {
    console.log(`❌ 매칭 실패: ${unmatched.length}건`)
    unmatched.forEach((u: any) => console.log(`  dialogue_id=${u.dialogue_id}`))
  }
}

verifyEpisode(35).catch(console.error)
