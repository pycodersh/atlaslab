/**
 * kp_expressions_with_examples.json → kp_expressions UPDATE
 * 매핑: id→id, pattern_ko→korean, literal_en→english, usage_en→description, examples→examples
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

const JSON_PATH = 'C:/Users/msj15/Downloads/kp_expressions_with_examples.json'

async function main() {
  const records: any[] = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  console.log(`로드: ${records.length}건`)

  let ok = 0, fail = 0, skip = 0

  for (const r of records) {
    const { id, pattern_ko, literal_en, usage_en, examples } = r
    if (!id) { skip++; continue }

    const { error } = await sb.from('kp_expressions').update({
      korean: pattern_ko,
      english: literal_en,
      description: usage_en,
      examples: examples ?? [],
    }).eq('id', id)

    if (error) {
      console.error(`  [FAIL] id=${id} ${pattern_ko}: ${error.message}`)
      fail++
    } else {
      ok++
    }
  }

  console.log(`\nUPDATE 완료: ${ok}건 성공, ${fail}건 실패, ${skip}건 건너뜀`)

  // 샘플 3건 확인
  console.log('\n[샘플 3건 확인]')
  const sampleIds = records.slice(0, 3).map((r: any) => r.id)
  const { data: samples } = await sb.from('kp_expressions')
    .select('id, korean, english, description, examples')
    .in('id', sampleIds)
    .order('id')

  for (const s of samples ?? []) {
    const exs = (s.examples as any[]) ?? []
    console.log(`  id=${s.id} | ${s.korean}`)
    console.log(`    english: "${s.english}"`)
    console.log(`    description: "${String(s.description).slice(0, 60)}..."`)
    console.log(`    examples: ${exs.length}개`)
    if (exs.length > 0) console.log(`      첫 예문: "${exs[0].ko}" / "${exs[0].en}"`)
  }
}

main().catch(console.error)
