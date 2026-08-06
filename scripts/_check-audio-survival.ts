/**
 * sync 후 kp_bubbles의 audio_url 생존 확인 — EP01~09
 */
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
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 1).lte('episode_num', 9)
    .order('episode_num')

  console.log('EP  전체  audio_url있음  audio_url없음')
  console.log('─'.repeat(40))

  let totalBubbles = 0, totalWithAudio = 0

  for (const ep of eps ?? []) {
    const { data: bubbles } = await sb
      .from('kp_bubbles')
      .select('id, audio_url')
      .eq('episode_id', ep.id)

    const all = bubbles?.length ?? 0
    const withAudio = bubbles?.filter(b => b.audio_url).length ?? 0
    const missing = all - withAudio
    const flag = missing > 0 ? ' ← ⚠' : ''
    console.log(`EP${String(ep.episode_num).padStart(2,'0')}  ${all}    ${withAudio}          ${missing}${flag}`)
    totalBubbles += all
    totalWithAudio += withAudio
  }

  console.log('─'.repeat(40))
  console.log(`합계  ${totalBubbles}    ${totalWithAudio}          ${totalBubbles - totalWithAudio}`)

  // kp_dialogues audio_url도 확인 (EP01~09)
  console.log('\n--- kp_dialogues audio_url (EP01~09) ---')
  const epIds = (eps ?? []).map(e => e.id)
  const { data: dlgs } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, audio_url')
    .in('episode_id', epIds)

  const dlgAll = dlgs?.length ?? 0
  const dlgWith = dlgs?.filter(d => d.audio_url).length ?? 0
  console.log(`전체 대사: ${dlgAll}, audio_url 있음: ${dlgWith}, 없음: ${dlgAll - dlgWith}`)

  // Missing audio_url bubbles: show first few
  const { data: missBubs } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, korean, audio_url')
    .in('episode_id', epIds)
    .is('audio_url', null)
    .limit(10)

  if (missBubs?.length) {
    console.log(`\n⚠ audio_url 없는 버블 (최대 10개):`)
    for (const b of missBubs) {
      const epNum = eps?.find(e => e.id === b.episode_id)?.episode_num ?? '?'
      console.log(`  EP${epNum} [${b.id}] "${b.korean?.slice(0, 30) ?? ''}"`)
    }
  }
}
main().catch(e => { console.error(e); process.exit(1) })
