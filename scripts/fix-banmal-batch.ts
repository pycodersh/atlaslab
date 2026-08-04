/**
 * 반말 잔존 8건 수정 (복합모음 워/와 어미 → 요 삽입)
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

// 각 줄 끝의 복합모음(워/와) + 구두점 → 요 삽입
function fixLine(s: string): string {
  return s
    .replace(/(워|와)([!?.])(\s*)$/, '$1요$2$3')
    .replace(/(워|와)(\s*)$/, '$1요$2')
}
function fixText(text: string): string {
  return text.split('\n').map(fixLine).join('\n')
}

async function main() {
  const TARGET_IDS = [239, 505, 547, 581, 764, 872, 947, 158]

  const { data: rows } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .in('id', TARGET_IDS)
    .order('id')

  const changes: { id: number; speaker: string; before: string; after: string }[] = []
  for (const r of (rows ?? [])) {
    const after = fixText(r.text_ko)
    if (after !== r.text_ko) {
      changes.push({ id: r.id, speaker: r.speaker, before: r.text_ko, after })
    } else {
      console.log(`  ⚠️  id=${r.id} 변환 없음: "${r.text_ko}"`)
    }
  }

  console.log(`\n=== 변환 ${changes.length}건 ===`)
  for (const c of changes) {
    console.log(`  id=${c.id} [${c.speaker}]  "${c.before}"  →  "${c.after}"`)
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────'); return
  }
  let ok = 0, fail = 0
  for (const c of changes) {
    const { error } = await sb.from('kp_dialogues').update({ text_ko: c.after }).eq('id', c.id)
    if (error) { console.error(`  ❌ id=${c.id}: ${error.message}`); fail++ }
    else { console.log(`  ✅ id=${c.id}`); ok++ }
  }
  console.log(`\n완료: ✅ ${ok} / ❌ ${fail}`)
}
main().catch(console.error)
