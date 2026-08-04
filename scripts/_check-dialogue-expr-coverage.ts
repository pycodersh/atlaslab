/**
 * kp_dialogue_expressions의 EP01-30 vs EP31-100 분포 확인
 */
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
  // kp_dialogue_expressions 전체
  let all: any[] = []
  let offset = 0
  while (true) {
    const { data } = await supabase.from('kp_dialogue_expressions').select('dialogue_id, role').range(offset, offset + 999)
    if (!data?.length) break
    all = all.concat(data)
    if (data.length < 1000) break
    offset += 1000
  }
  console.log(`kp_dialogue_expressions 총: ${all.length}건`)

  // dialogue_id → episode_num 매핑
  let dlgs: any[] = []
  offset = 0
  while (true) {
    const { data } = await supabase.from('kp_dialogues').select('id, episode_id').range(offset, offset + 999)
    if (!data?.length) break
    dlgs = dlgs.concat(data)
    if (data.length < 1000) break
    offset += 1000
  }

  // episode_id → episode_num
  const { data: eps } = await supabase.from('kp_episodes').select('id, episode_num')
  const epNumMap = new Map<number, number>((eps ?? []).map((e: any) => [e.id, e.episode_num]))
  const dlgEpMap = new Map<number, number>()
  for (const d of dlgs) dlgEpMap.set(d.id, epNumMap.get(d.episode_id) ?? 0)

  let cnt0130 = 0, cnt31100 = 0, cntUnknown = 0
  for (const de of all) {
    const epNum = dlgEpMap.get(de.dialogue_id)
    if (epNum == null) { cntUnknown++; continue }
    if (epNum <= 30) cnt0130++
    else cnt31100++
  }

  console.log(`\n구간별 kp_dialogue_expressions:`)
  console.log(`  EP01-30 : ${cnt0130}건`)
  console.log(`  EP31-100: ${cnt31100}건`)
  console.log(`  미매칭  : ${cntUnknown}건`)
}

main().catch(console.error)
