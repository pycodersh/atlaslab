/**
 * Task2: kp_expressions id=1235 (~얼마나 걸려요?) 업데이트
 * 실행: npx tsx scripts/update-id1235.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const TARGET_ID = 1235
const EXPECTED_KOREAN = '~얼마나 걸려요?'

const NEW_DATA = {
  english:     'How long does it take?',
  description: 'Used to ask how much time is needed to travel somewhere or complete something.',
  examples: [
    { ko: '여기서 얼마나 걸려요?',          en: 'How long does it take from here?' },
    { ko: '걸어서 얼마나 걸려요?',           en: 'How long does it take on foot?' },
    { ko: '음식이 나오기까지 얼마나 걸려요?', en: 'How long does it take for the food to come out?' },
  ],
}

async function main() {
  // 현재 값 조회
  const { data: cur, error: selErr } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, examples')
    .eq('id', TARGET_ID)
    .single()

  if (selErr || !cur) {
    console.error(`id=${TARGET_ID} 조회 실패:`, selErr?.message ?? '레코드 없음')
    process.exit(1)
  }

  console.log(`\n[ 변경 전 ]`)
  console.log(`  korean      : ${cur.korean}`)
  console.log(`  english     : ${cur.english ?? '(없음)'}`)
  console.log(`  description : ${cur.description ?? '(없음)'}`)
  console.log(`  examples    : ${JSON.stringify(cur.examples ?? [])}`)

  // korean 일치 확인
  if ((cur.korean as string) !== EXPECTED_KOREAN) {
    console.error(`\n❌ korean 불일치 — 수정하지 않습니다.`)
    console.error(`   기대값: "${EXPECTED_KOREAN}"`)
    console.error(`   실제값: "${cur.korean}"`)
    process.exit(1)
  }

  // 업데이트
  const { error: upErr } = await sb
    .from('kp_expressions')
    .update(NEW_DATA)
    .eq('id', TARGET_ID)

  if (upErr) {
    console.error(`\n❌ UPDATE 실패:`, upErr.message)
    process.exit(1)
  }

  // 검증 재조회
  const { data: after, error: afErr } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, examples')
    .eq('id', TARGET_ID)
    .single()

  if (afErr || !after) {
    console.error('재조회 실패:', afErr?.message)
    process.exit(1)
  }

  const exs = (after.examples ?? []) as Array<{ ko: string; en: string }>

  console.log(`\n[ 변경 후 ]`)
  console.log(`  english     : ${after.english}`)
  console.log(`  description : ${after.description}`)
  console.log(`  examples    : ${exs.length}개`)
  exs.forEach((e, i) => console.log(`    [${i + 1}] ko="${e.ko}" / en="${e.en}"`))

  // 검증
  const ok = after.english === NEW_DATA.english
          && after.description !== null
          && exs.length === 3
          && exs.every(e => e.ko && e.en)

  console.log(`\n검증: ${ok ? '✅ 성공' : '❌ 실패'}`)
}

main().catch(console.error)
