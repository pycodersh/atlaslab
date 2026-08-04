/**
 * kp_scenes / kp_dialogues / kp_bubbles 스키마 파악
 * 실행: npx tsx scripts/inspect-rebuild-schema.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // kp_scenes 샘플
  const { data: scenes } = await sb.from('kp_scenes').select('*').limit(5)
  console.log('=== kp_scenes (5개 샘플) ===')
  console.log(JSON.stringify(scenes, null, 2))

  // kp_dialogues 샘플
  const { data: dialogues } = await sb.from('kp_dialogues').select('*').limit(5)
  console.log('\n=== kp_dialogues (5개 샘플) ===')
  console.log(JSON.stringify(dialogues, null, 2))

  // kp_bubbles 샘플 (dialogue_id 포함)
  const { data: bubbles } = await sb.from('kp_bubbles').select('*').limit(5)
  console.log('\n=== kp_bubbles (5개 샘플) ===')
  console.log(JSON.stringify(bubbles, null, 2))

  // kp_dialogue_expressions 샘플
  const { data: dex } = await sb.from('kp_dialogue_expressions').select('*').limit(5)
  console.log('\n=== kp_dialogue_expressions (5개 샘플) ===')
  console.log(JSON.stringify(dex, null, 2))

  // 전체 카운트
  const [{ count: scCnt }, { count: dlCnt }, { count: bbCnt }, { count: dexCnt }] = await Promise.all([
    sb.from('kp_scenes').select('*', { count: 'exact', head: true }),
    sb.from('kp_dialogues').select('*', { count: 'exact', head: true }),
    sb.from('kp_bubbles').select('*', { count: 'exact', head: true }),
    sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }),
  ])
  console.log('\n=== 카운트 ===')
  console.log(`kp_scenes: ${scCnt}`)
  console.log(`kp_dialogues: ${dlCnt}`)
  console.log(`kp_bubbles: ${bbCnt}`)
  console.log(`kp_dialogue_expressions: ${dexCnt}`)

  // 버블 중 dialogue_id가 NULL이 아닌 것
  const { count: bbWithDial } = await sb.from('kp_bubbles')
    .select('*', { count: 'exact', head: true })
    .not('dialogue_id', 'is', null)
  console.log(`kp_bubbles (dialogue_id 있음): ${bbWithDial}`)

  // kp_dialogues 필드 목록 확인용 EP1 전체
  const { data: ep1 } = await sb.from('kp_dialogues')
    .select('*')
    .eq('episode_id', (await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()).data?.id)
    .order('id')
  console.log('\n=== EP01 전체 대사 ===')
  console.log(JSON.stringify(ep1, null, 2))

  // kp_scenes EP1
  const { data: sc1 } = await sb.from('kp_scenes')
    .select('*')
    .eq('episode_id', (await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()).data?.id)
    .order('id')
  console.log('\n=== EP01 전체 씬 ===')
  console.log(JSON.stringify(sc1, null, 2))
}

main().catch(console.error)
