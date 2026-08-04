import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
async function main() {
  // 1. focus 행 간단 조회
  const { data: focusRows, error: e1 } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id')
    .eq('role', 'focus')
  if (e1) { console.error('focus 조회 실패:', e1); return }
  console.log('focus 행 수:', focusRows?.length)
  console.log('첫 5개:', focusRows?.slice(0,5).map((r: any) => r.expression_id))

  const expIds = [...new Set((focusRows ?? []).map((r: any) => Number(r.expression_id)))]
  console.log('unique expIds:', expIds.length, '| 앞 5개:', expIds.slice(0,5))

  // 2. 소수만 조회해보기
  const { data: small, error: e2 } = await sb
    .from('kp_expressions')
    .select('id, korean, english')
    .in('id', expIds.slice(0, 10))
  console.log('소수 조회 결과:', small?.length, '건', e2 ?? '')
  small?.forEach((r: any) => console.log(`  id=${r.id}  ${r.korean}  |  ${r.english}`))

  // 3. 전체 조회 (limit)
  const { data: allRows, error: e3 } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, examples')
    .in('id', expIds)
    .order('id')
  console.log('\n전체 조회:', allRows?.length, '건', e3?.message ?? '')

  if (!allRows?.length) return
  const lines: string[] = []
  for (const e of allRows) {
    const exArr = Array.isArray(e.examples) ? e.examples as {ko:string,en:string}[] : []
    const glossShown = e.english && e.english !== e.korean ? e.english : '(표시 안 됨)'
    lines.push(`id=${String(e.id).padEnd(4)}  ${String(e.korean).padEnd(22)}  gloss: ${glossShown}`)
    if (exArr[0]) lines.push(`        ex: "${exArr[0].ko}" / "${exArr[0].en}"`)
  }
  fs.writeFileSync('scripts/popup-expressions.txt', lines.join('\n'), 'utf-8')
  console.log('→ popup-expressions.txt 저장:', lines.length, '줄')
  lines.slice(0, 60).forEach(l => console.log(l))
}
main().catch(console.error)
