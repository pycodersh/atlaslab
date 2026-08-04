import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const items = JSON.parse(readFileSync('data/kpatto/source/expressions_rule_batch1.json', 'utf8'))
console.log(`총 ${items.length}개 항목 처리 시작`)

let ok = 0, fail = 0
for (const item of items) {
  const { error } = await sb
    .from('kp_expressions')
    .update({ description: item.usage_en })
    .eq('id', item.id)
  if (error) {
    console.error(`  ✗ id=${item.id}: ${error.message}`)
    fail++
  } else {
    ok++
  }
}

console.log(`완료: ${ok}개 성공, ${fail}개 실패`)

// 검증: id=1383 description 확인
const { data, error } = await sb.from('kp_expressions').select('id, description').eq('id', 1383).single()
if (data) {
  console.log(`\n[검증] id=1383 description:`)
  console.log(JSON.stringify(data.description))
  console.log(`\n실제 렌더:`)
  console.log(data.description)
}
