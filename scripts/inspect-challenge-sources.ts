import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 1. kp_challenges 현황
  const { count: total } = await sb.from('kp_challenges').select('*', { count: 'exact', head: true })
  const { data: typeCounts } = await sb.from('kp_challenges').select('challenge_type')
  const byType: Record<string, number> = {}
  typeCounts?.forEach((r: any) => { byType[r.challenge_type] = (byType[r.challenge_type] ?? 0) + 1 })
  console.log(`kp_challenges 현황: 총 ${total}건`, byType)

  // 2. kp_challenges 스키마
  const { data: sample } = await sb.from('kp_challenges').select('*').limit(3)
  console.log('\n=== kp_challenges 컬럼 ===', Object.keys(sample?.[0] ?? {}))
  sample?.forEach((r: any) => console.log(JSON.stringify(r, null, 2)))

  // 3. kp_expressions.examples 구조
  const { data: expSample } = await sb
    .from('kp_expressions')
    .select('id, korean, examples')
    .not('examples', 'is', null)
    .limit(5)
  console.log('\n=== kp_expressions.examples 구조 ===')
  expSample?.forEach((r: any) => {
    console.log(`  id=${r.id} ${r.korean}`)
    if (Array.isArray(r.examples)) {
      r.examples.slice(0, 2).forEach((ex: any) => console.log(`    ko="${ex.ko}" en="${ex.en}"`))
    }
  })

  // 4. kp_dialogue_expressions 구조 확인 (fill_blank용)
  const { data: dlgExp } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, expression_id, role')
    .eq('role', 'focus')
    .limit(10)
  console.log('\n=== kp_dialogue_expressions (focus, 10개) ===')
  dlgExp?.forEach((r: any) => console.log(`  dlg=${r.dialogue_id} matched="${r.matched_text}" exp=${r.expression_id}`))

  // 5. kp_dialogues에서 fill_blank 소스 (dialogue_id 있는 것)
  const dlgIds = dlgExp?.map((r: any) => r.dialogue_id) ?? []
  const { data: dlgTexts } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, text_ko, text_en')
    .in('id', dlgIds)
  console.log('\n=== 연결된 kp_dialogues (fill_blank 소스) ===')
  dlgTexts?.forEach((r: any) => console.log(`  id=${r.id} ep=${r.episode_id} | "${r.text_ko}" | en="${r.text_en}"`))

  // 6. episode별 kp_dialogue_expressions 수
  const { data: allDlgExp } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, expression_id, role, kp_dialogues!inner(episode_id, text_ko, text_en)')
    .eq('role', 'focus')
  console.log(`\n=== kp_dialogue_expressions focus 총 ${allDlgExp?.length}개 ===`)

  // episode별 카운트
  const epCount: Record<string, number> = {}
  allDlgExp?.forEach((r: any) => {
    const ep = r.kp_dialogues?.episode_id ?? 'unknown'
    epCount[ep] = (epCount[ep] ?? 0) + 1
  })
  console.log('episode별:', epCount)
}
main().catch(console.error)
