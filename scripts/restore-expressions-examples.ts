/**
 * restore-expressions-examples.ts
 * kp_expressions_with_examples.json (244개) → kp_expressions UPDATE
 * 매핑: literal_en→english, usage_en→description, examples→examples(jsonb)
 * Run: npx tsx scripts/restore-expressions-examples.ts [--apply]
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

type BackupRow = {
  id: number
  pattern_ko: string
  literal_en: string
  usage_en: string
  examples: { ko: string; en: string }[]
}

async function main() {
  const filePath = path.resolve('C:/Users/msj15/Downloads/kp_expressions_with_examples.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const rows: BackupRow[] = JSON.parse(raw)
  console.log(`백업 레코드: ${rows.length}개 (id ${rows[0].id}~${rows[rows.length - 1].id})`)

  if (!APPLY) {
    console.log('\n── DRY RUN ── (샘플 3개)')
    for (const r of rows.slice(0, 3)) {
      console.log(`  id=${r.id} english="${r.literal_en}" description="${r.usage_en.slice(0, 40)}..." examples=${r.examples.length}개`)
    }
    console.log('\n실제 적용: npx tsx scripts/restore-expressions-examples.ts --apply')
    return
  }

  console.log('\nUPDATE 시작...')
  let ok = 0
  let fail = 0
  const BATCH = 50

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    await Promise.all(batch.map(async (r) => {
      const { error } = await sb
        .from('kp_expressions')
        .update({
          english: r.literal_en,
          description: r.usage_en,
          examples: r.examples,
        })
        .eq('id', r.id)
      if (error) {
        console.error(`  id=${r.id} 실패: ${error.message}`)
        fail++
      } else {
        ok++
      }
    }))
    process.stdout.write(`\r  ${ok + fail}/${rows.length} (성공 ${ok}, 실패 ${fail})`)
  }

  console.log(`\n\n완료: ${ok}개 성공, ${fail}개 실패`)

  // 검증
  const { count } = await sb
    .from('kp_expressions')
    .select('*', { count: 'exact', head: true })
    .not('examples', 'is', null)
  console.log(`\nSELECT COUNT(*) FROM kp_expressions WHERE examples IS NOT NULL → ${count}`)
  if ((count ?? 0) >= 244) {
    console.log('✓ 복구 완료')
  } else {
    console.log(`⚠ 예상 244 이상이어야 함`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
