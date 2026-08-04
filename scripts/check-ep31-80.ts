import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  // Get episode ids for EP31~80
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 31)
    .lte('episode_num', 80)
    .order('episode_num')
  if (!eps) return

  const epIds = eps.map((e: any) => e.id)
  const epMap = new Map(eps.map((e: any) => [e.id, e.episode_num]))

  // 1. dialogue count per episode
  const { data: dlgs } = await sb
    .from('kp_dialogues')
    .select('episode_id')
    .in('episode_id', epIds)

  // 2. focus expressions per episode (via dialogue_id)
  const { data: allDlgIds } = await sb
    .from('kp_dialogues')
    .select('id, episode_id')
    .in('episode_id', epIds)

  const dlgToEp = new Map((allDlgIds ?? []).map((d: any) => [d.id, d.episode_id]))
  const allDlgIdList = (allDlgIds ?? []).map((d: any) => d.id)

  const { data: focusRows } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id')
    .in('dialogue_id', allDlgIdList)
    .eq('role', 'focus')

  // 3. challenge count per episode
  const { data: challenges } = await sb
    .from('kp_challenges')
    .select('episode_id')
    .in('episode_id', epIds)

  // Aggregate
  const dlgCount: Record<number, number> = {}
  const focusCount: Record<number, number> = {}
  const challengeCount: Record<number, number> = {}

  for (const ep of eps) {
    dlgCount[ep.id] = 0
    focusCount[ep.id] = 0
    challengeCount[ep.id] = 0
  }
  for (const d of (dlgs ?? [])) dlgCount[(d as any).episode_id]++
  for (const f of (focusRows ?? [])) {
    const epId = dlgToEp.get((f as any).dialogue_id)
    if (epId) focusCount[epId]++
  }
  for (const c of (challenges ?? [])) challengeCount[(c as any).episode_id]++

  console.log('EP  | dialogues | focus | challenges')
  console.log('----+-----------+-------+-----------')
  for (const ep of eps) {
    const epNum = String(ep.episode_num).padStart(2, '0')
    const d = String(dlgCount[ep.id]).padStart(9)
    const f = String(focusCount[ep.id]).padStart(5)
    const c = String(challengeCount[ep.id]).padStart(10)
    console.log(`EP${epNum} | ${d} | ${f} | ${c}`)
  }
}
main().catch(console.error)
