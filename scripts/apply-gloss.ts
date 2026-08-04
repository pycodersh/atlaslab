/**
 * 글로스 225건 적용 (6건 수동 보정 포함)
 */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

// 수동 보정 6건
const OVERRIDES: Record<number, string> = {
  787:  "I'm so happy we're all together",
  859:  "I'm so excited!",
  860:  "Are you okay?",
  870:  "Have you tried this on?",
  902:  "Excuse me, could you ~?",
  1036: "In the end, ~",
}

async function main() {
  const raw = fs.readFileSync('scripts/gloss-proposals.json', 'utf-8')
  const proposals: { id: number; korean: string; current: string; proposed: string }[] = JSON.parse(raw)

  // 보정 적용 + korean=proposed (변환 실패) 건 제외
  const updates = proposals
    .map(p => ({
      id: p.id,
      korean: p.korean,
      english: OVERRIDES[p.id] ?? p.proposed,
    }))
    .filter(p => p.english !== p.korean)  // 한국어 그대로인 건 스킵

  console.log(`\n적용 대상: ${updates.length}건 / 전체 ${proposals.length}건`)
  console.log(`수동 보정: ${Object.keys(OVERRIDES).length}건`)
  console.log(`스킵 (변환 실패): ${proposals.length - updates.length}건\n`)

  // 보정 건 표시
  for (const [id, val] of Object.entries(OVERRIDES)) {
    const orig = proposals.find(p => p.id === Number(id))
    console.log(`  보정 id=${id}  "${orig?.proposed ?? '?'}"  →  "${val}"`)
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('적용: npx tsx scripts/apply-gloss.ts --apply')
    return
  }

  console.log('\n──── DB 업데이트 (배치 50개) ────')
  const BATCH = 50
  let ok = 0, fail = 0
  for (let i = 0; i < updates.length; i += BATCH) {
    const chunk = updates.slice(i, i + BATCH)
    for (const u of chunk) {
      const { error } = await sb
        .from('kp_expressions')
        .update({ english: u.english })
        .eq('id', u.id)
      if (error) { console.error(`  ❌ id=${u.id}: ${error.message}`); fail++ }
      else ok++
    }
    process.stdout.write(`\r  ${ok + fail}/${updates.length} 처리...`)
  }
  console.log(`\n✅ 완료: ${ok}건 / ❌ ${fail}건`)
}
main().catch(console.error)
