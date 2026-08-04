/**
 * kp_dialogue_expressions 재연결 검증
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

async function main() {
  // 백업 파일에서 원본 집계
  const backup = JSON.parse(fs.readFileSync('C:/Users/msj15/Downloads/kpatto_rebuild_backup/kp_dialogue_expressions_backup.json', 'utf-8')) as any[]
  const uniqueOld = new Set(backup.map((r: any) => `${r.dialogue_id}:${r.expression_id}:${r.role}`))
  console.log(`원본 kp_dialogue_expressions: ${backup.length}건`)
  console.log(`원본 중 unique(dial+expr+role): ${uniqueOld.size}건`)
  const focusOld = backup.filter((r: any) => r.role === 'focus')
  const exposureOld = backup.filter((r: any) => r.role === 'exposure')
  console.log(`  focus: ${focusOld.length}, exposure: ${exposureOld.length}`)

  // 현재 DB 집계
  const { data: newDex, count } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact' })
  console.log(`\n현재 kp_dialogue_expressions: ${count}건`)
  if (newDex) {
    const newFocus = (newDex as any[]).filter(r => r.role === 'focus')
    const newExposure = (newDex as any[]).filter(r => r.role === 'exposure')
    console.log(`  focus: ${newFocus.length}, exposure: ${newExposure.length}`)
  }

  // 신규 패턴 (1241~1293) 연결 확인
  const { data: newPatterns } = await sb.from('kp_dialogue_expressions')
    .select('expression_id, dialogue_id, role')
    .gte('expression_id', 1241).lte('expression_id', 1293)
  console.log(`\n신규 패턴(1241~1293) 연결: ${newPatterns?.length ?? 0}건`)

  // EP01 focus 확인
  const { data: ep1 } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const { data: ep1dex } = await sb.from('kp_dialogue_expressions')
    .select('*, kp_dialogues(text_ko), kp_expressions(korean)')
    .in('dialogue_id',
      (await sb.from('kp_dialogues').select('id').eq('episode_id', (ep1 as any).id)).data?.map((d: any) => d.id) ?? []
    )
  console.log(`\nEP01 dialogue_expressions:`)
  for (const r of (ep1dex ?? []) as any[]) {
    console.log(`  [${r.role}] ${r.kp_expressions?.korean} → "${r.kp_dialogues?.text_ko}"`)
  }
}

main().catch(console.error)
