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
  const { data: focusRows } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id, matched_text, kp_dialogues!inner(episode_id, text_ko)')
    .eq('role', 'focus')

  const expIds = [...new Set((focusRows ?? []).map((r: any) => r.expression_id as number))]
  console.log('팝업 등장 표현식:', expIds.length, '건')

  const { data: expRows } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, structure, examples')
    .in('id', expIds)
    .order('id')

  const expEpMap: Record<number, number[]> = {}
  for (const r of (focusRows ?? [])) {
    const eid = (r.kp_dialogues as any).episode_id as number
    if (!expEpMap[r.expression_id]) expEpMap[r.expression_id] = []
    if (!expEpMap[r.expression_id].includes(eid)) expEpMap[r.expression_id].push(eid)
  }

  const rows: string[] = []
  for (const e of (expRows ?? [])) {
    const exArr = Array.isArray(e.examples) ? e.examples as {ko:string,en:string}[] : []
    const glossShown = e.english && e.english !== e.korean ? e.english : '(표시 안 됨)'
    const eps = (expEpMap[e.id] ?? []).sort((a,b) => a-b).slice(0,3).join(',')
    rows.push(`id=${String(e.id).padEnd(4)} ep[${eps}]  ${e.korean.padEnd(20)}  gloss: ${glossShown}`)
    if (exArr[0]) rows.push(`      ex: "${exArr[0].ko}" → "${exArr[0].en}"`)
  }

  const out = rows.join('\n')
  fs.writeFileSync('scripts/popup-expressions.txt', out, 'utf-8')
  console.log('→ scripts/popup-expressions.txt 저장')

  // 콘솔엔 처음 40건만
  rows.slice(0, 80).forEach(l => console.log(l))
  if (rows.length > 80) console.log(`... (총 ${rows.length}줄, 전체는 파일 확인)`)
}
main().catch(console.error)
