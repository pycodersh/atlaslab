/**
 * 복합모음 어미 누락 9건 수정
 * 예뻐/올려/걸려/다녀/버려/기다려 → 예뻐요/올려요 등
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

// 복합모음 어미 → 요 삽입: 줄 끝 복합모음+구두점을 복합모음+요+구두점으로
function fixCompound(text: string): string {
  return text
    .split('\n')
    .map(line =>
      // 뻐/려/녀 + (구두점 0~1개) + 줄 끝 → 요 삽입
      line.replace(/(뻐|려|녀)([!?.])(\s*)$/, '$1요$2$3')
          .replace(/(뻐|려|녀)(\s*)$/, '$1요$2')
    )
    .join('\n')
}

async function main() {
  const TARGET_IDS = [85, 201, 486, 633, 672, 702, 708, 712, 794]

  const { data: rows } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .in('id', TARGET_IDS)
    .order('id')

  if (!rows?.length) { console.error('행 없음'); process.exit(1) }

  const changes: { id: number; speaker: string; before: string; after: string }[] = []

  for (const row of rows) {
    const after = fixCompound(row.text_ko)
    if (after !== row.text_ko) {
      changes.push({ id: row.id, speaker: row.speaker, before: row.text_ko, after })
    } else {
      console.log(`  ⚠️  id=${row.id} [${row.speaker}] 변환 없음: "${row.text_ko}"`)
    }
  }

  console.log(`\n=== 변환 대상 ${changes.length}건 ===`)
  for (const c of changes) {
    console.log(`  id=${c.id} [${c.speaker}]`)
    console.log(`    전: ${c.before}`)
    console.log(`    후: ${c.after}`)
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('적용: npx tsx scripts/fix-compound-vowel.ts --apply')
    return
  }

  console.log('\n──── DB 적용 ────')
  let ok = 0, fail = 0
  for (const c of changes) {
    const { error } = await sb.from('kp_dialogues').update({ text_ko: c.after }).eq('id', c.id)
    if (error) { console.error(`  ❌ id=${c.id}: ${error.message}`); fail++ }
    else { console.log(`  ✅ id=${c.id}`); ok++ }
  }
  console.log(`\n완료: ✅ ${ok}건 / ❌ ${fail}건`)
}
main().catch(console.error)
